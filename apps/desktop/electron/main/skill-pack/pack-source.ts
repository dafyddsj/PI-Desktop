/**
 * Where an update to the skill pack comes from: GitHub names the commit, and
 * jsDelivr serves its files.
 *
 * Two API calls per check (release, then its commit) keep the unauthenticated
 * GitHub rate limit out of reach. File bytes come from jsDelivr at the exact
 * commit — the CDN the skill market already relies on because
 * raw.githubusercontent.com is unreliable from some networks — and every file
 * is checked against the git blob id GitHub listed for it, so the CDN can
 * deliver bytes but never choose them.
 */
import {
  SKILL_PACK,
  gitBlobSha,
  selectSkillPackFiles,
  versionFromTag,
  type SkillPackChannel,
  type SkillPackFile,
  type SkillPackManifest,
} from "./pack-spec.ts";

/** The public-HTTPS client's request shape; the pack only fetches app-chosen URLs. */
export type SkillPackRequest = (
  url: string,
  kind: "json" | "text",
  origin: "third-party",
) => Promise<unknown>;

/** The commit a channel currently points at. */
export type SkillPackTarget = {
  channel: SkillPackChannel;
  ref: string;
  sha: string;
  committedAt: string;
  version?: string;
};

/** No release published yet is a state of the source, not a failure. */
export class SkillPackNoReleaseError extends Error {
  constructor() {
    super("no release has been published");
    this.name = "SkillPackNoReleaseError";
  }
}

/** The source answered, but with files this app refuses to install. */
export class SkillPackInvalidError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SkillPackInvalidError";
  }
}

const API = `https://api.github.com/repos/${SKILL_PACK.owner}/${SKILL_PACK.repo}`;
const CDN = `https://cdn.jsdelivr.net/gh/${SKILL_PACK.owner}/${SKILL_PACK.repo}`;
const SHA = /^[0-9a-f]{40}$/;
const DOWNLOAD_CONCURRENCY = 6;

function isNotFound(error: unknown): boolean {
  return error instanceof Error && /\bresponded 404\b/.test(error.message);
}

async function commitAt(
  request: SkillPackRequest,
  ref: string,
): Promise<{ sha: string; committedAt: string }> {
  const body = (await request(`${API}/commits/${encodeURIComponent(ref)}`, "json", "third-party")) as {
    sha?: unknown;
    commit?: { committer?: { date?: unknown } };
  };
  const sha = typeof body?.sha === "string" ? body.sha : "";
  const committedAt = body?.commit?.committer?.date;
  if (!SHA.test(sha) || typeof committedAt !== "string" || Number.isNaN(Date.parse(committedAt))) {
    throw new Error(`GitHub returned no commit for ${ref}`);
  }
  return { sha, committedAt };
}

/** Resolve the commit a channel offers: the latest release, or the branch head. */
export async function resolveSkillPackTarget(
  request: SkillPackRequest,
  channel: SkillPackChannel,
): Promise<SkillPackTarget> {
  if (channel === "beta") {
    return { channel, ref: SKILL_PACK.branch, ...(await commitAt(request, SKILL_PACK.branch)) };
  }
  let tag: string;
  try {
    // `releases/latest` already skips drafts and prereleases.
    const release = (await request(`${API}/releases/latest`, "json", "third-party")) as {
      tag_name?: unknown;
    };
    if (typeof release?.tag_name !== "string" || !release.tag_name) {
      throw new SkillPackNoReleaseError();
    }
    tag = release.tag_name;
  } catch (error) {
    throw isNotFound(error) ? new SkillPackNoReleaseError() : error;
  }
  return { channel, ref: tag, version: versionFromTag(tag), ...(await commitAt(request, tag)) };
}

/**
 * Download every pack file at `target.sha` and return them with the manifest
 * that describes them. Nothing is written here; the store decides where the
 * verified bytes land.
 */
export async function downloadSkillPack(
  request: SkillPackRequest,
  target: SkillPackTarget,
): Promise<{ manifest: SkillPackManifest; contents: Map<string, Uint8Array> }> {
  const tree = (await request(`${API}/git/trees/${target.sha}?recursive=1`, "json", "third-party")) as {
    tree?: Array<{ path: string; mode: string; type: string; sha: string; size?: number }>;
    truncated?: boolean;
  };
  if (!Array.isArray(tree?.tree) || tree.truncated) {
    throw new SkillPackInvalidError("GitHub returned an incomplete file list");
  }
  let files: SkillPackFile[];
  try {
    files = selectSkillPackFiles(tree.tree);
  } catch (error) {
    throw new SkillPackInvalidError(error instanceof Error ? error.message : String(error));
  }
  const contents = new Map<string, Uint8Array>();
  const encoder = new TextEncoder();
  const fetchOne = async (file: SkillPackFile) => {
    const text = (await request(`${CDN}@${target.sha}/${file.path}`, "text", "third-party")) as string;
    let bytes = encoder.encode(text);
    // `Response.text()` drops a UTF-8 byte-order mark; restore it before
    // judging the bytes, or a BOM-prefixed upstream file never verifies.
    if (gitBlobSha(bytes) !== file.blob) {
      bytes = new Uint8Array([0xef, 0xbb, 0xbf, ...bytes]);
    }
    if (gitBlobSha(bytes) !== file.blob) {
      throw new SkillPackInvalidError(`downloaded file does not match the commit: ${file.path}`);
    }
    contents.set(file.path, bytes);
  };
  let next = 0;
  let failed = false;
  const worker = async () => {
    // One bad file fails the download; the other workers stop taking files.
    while (!failed && next < files.length) {
      const file = files[next++]!;
      try {
        await fetchOne(file);
      } catch (error) {
        failed = true;
        throw error;
      }
    }
  };
  await Promise.all(Array.from({ length: DOWNLOAD_CONCURRENCY }, worker));
  return {
    manifest: {
      schemaVersion: 1,
      repo: `${SKILL_PACK.owner}/${SKILL_PACK.repo}`,
      channel: target.channel,
      ref: target.ref,
      sha: target.sha,
      committedAt: target.committedAt,
      ...(target.version ? { version: target.version } : {}),
      files,
    },
    contents,
  };
}
