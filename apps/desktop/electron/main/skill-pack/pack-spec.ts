/**
 * The skill pack EXplore Agent ships: which repository it comes from, which of
 * its files are pack content, and what a stored copy looks like.
 *
 * The pack is a whole repository tree, not a set of loose skills: its skills
 * link to each other (`../principle-x/SKILL.md`) and to shared playbooks
 * (`../../playbooks/x.md`), so a copy is only usable when every file keeps its
 * path. The build-time vendoring script and the in-app updater both filter and
 * check files with this module, so a bundled copy and a downloaded copy obey
 * the same rules.
 *
 * Kept free of Electron and workspace-package imports so the vendoring script
 * can load it directly with Node's type stripping.
 */
import { createHash } from "node:crypto";

export const SKILL_PACK = {
  /** Directory name for the bundled and downloaded copies. */
  dirName: "explore-mode",
  owner: "dafyddsj",
  repo: "explore-mode",
  /** Branch the beta channel follows. */
  branch: "main",
  /** Skill ids are `<prefix>/<skill dir>`, like the `pi-desktop/` builtins. */
  idPrefix: "explore",
} as const;

export const SKILL_PACK_REPO_URL = `https://github.com/${SKILL_PACK.owner}/${SKILL_PACK.repo}`;

/** `stable` follows GitHub releases; `beta` follows the branch head. */
export type SkillPackChannel = "stable" | "beta";

export type SkillPackFile = {
  /** Path relative to the repository root, `/`-separated. */
  path: string;
  size: number;
  /** Git blob SHA-1 of the file's bytes, checked on every download. */
  blob: string;
};

/** `pack.json`: the description stored beside every copy's `files/` tree. */
export type SkillPackManifest = {
  schemaVersion: 1;
  /** `owner/repo` the copy was taken from. */
  repo: string;
  channel: SkillPackChannel;
  /** Release tag for `stable`, branch name for `beta`. */
  ref: string;
  /** Commit the files were read at. */
  sha: string;
  /** Committer date of `sha`, ISO 8601. Orders copies across channels. */
  committedAt: string;
  /** Release tag without a leading `v`, when the copy is a release. */
  version?: string;
  files: SkillPackFile[];
};

export const MAX_PACK_FILES = 256;
/** Mirrors host-core `MAX_SKILL_BYTES`: a pack document can enter a prompt. */
export const MAX_PACK_FILE_BYTES = 128 * 1024;
export const MAX_PACK_TOTAL_BYTES = 4 * 1024 * 1024;

const SEGMENT = /^[A-Za-z0-9][A-Za-z0-9._-]*$/;
const SKILL_DIR = /^[a-z0-9][a-z0-9-]{0,63}$/;
const SHA = /^[0-9a-f]{40}$/;
/** Git tree mode of a regular, non-executable or executable file. */
const FILE_MODES = new Set(["100644", "100755"]);

/**
 * Whether a repository path is pack content: Markdown under `skills/<id>/` or
 * `playbooks/`, plus the plugin manifest. Everything else in the repository
 * (workspace templates, tooling, dotfiles) stays out of the copy.
 */
export function isSkillPackPath(path: string): boolean {
  if (path === ".claude-plugin/plugin.json") return true;
  const segments = path.split("/");
  if (!segments.every((segment) => SEGMENT.test(segment) && !segment.includes(".."))) {
    return false;
  }
  if (!path.endsWith(".md")) return false;
  if (segments[0] === "playbooks") return segments.length >= 2;
  return segments[0] === "skills" && segments.length >= 3 && SKILL_DIR.test(segments[1] ?? "");
}

/**
 * Pick the pack files out of a recursive git tree listing and check them
 * against the caps. A symlink or submodule at a pack path is refused rather
 * than skipped: the upstream tree is not what this app expects.
 */
export function selectSkillPackFiles(
  entries: ReadonlyArray<{ path: string; mode: string; type: string; sha: string; size?: number }>,
): SkillPackFile[] {
  const files: SkillPackFile[] = [];
  let total = 0;
  for (const entry of entries) {
    if (entry.type === "tree" || !isSkillPackPath(entry.path)) continue;
    if (entry.type !== "blob" || !FILE_MODES.has(entry.mode)) {
      throw new Error(`skill pack path is not a regular file: ${entry.path}`);
    }
    const size = entry.size ?? -1;
    if (size < 0 || size > MAX_PACK_FILE_BYTES) {
      throw new Error(`skill pack file exceeds ${MAX_PACK_FILE_BYTES} bytes: ${entry.path}`);
    }
    total += size;
    files.push({ path: entry.path, size, blob: entry.sha });
  }
  if (files.length > MAX_PACK_FILES) {
    throw new Error(`skill pack has more than ${MAX_PACK_FILES} files`);
  }
  if (total > MAX_PACK_TOTAL_BYTES) {
    throw new Error(`skill pack exceeds ${MAX_PACK_TOTAL_BYTES} bytes`);
  }
  if (!files.some((file) => file.path.startsWith("skills/") && file.path.endsWith("/SKILL.md"))) {
    throw new Error("skill pack contains no skills");
  }
  return files.sort((a, b) => a.path.localeCompare(b.path));
}

/** Git's blob id for a file's bytes: SHA-1 over `blob <size>\0<bytes>`. */
export function gitBlobSha(bytes: Uint8Array): string {
  return createHash("sha1")
    .update(`blob ${bytes.byteLength}\0`)
    .update(bytes)
    .digest("hex");
}

/** Release tags read as versions: `v0.2.0` and `0.2.0` both display `0.2.0`. */
export function versionFromTag(tag: string): string {
  return tag.replace(/^v(?=\d)/, "");
}

/** Lenient read of a stored `pack.json`; anything malformed is no copy at all. */
export function parseSkillPackManifest(value: unknown): SkillPackManifest | null {
  if (!value || typeof value !== "object") return null;
  const raw = value as Partial<SkillPackManifest>;
  if (raw.schemaVersion !== 1) return null;
  if (raw.channel !== "stable" && raw.channel !== "beta") return null;
  if (typeof raw.sha !== "string" || !SHA.test(raw.sha)) return null;
  if (typeof raw.ref !== "string" || !raw.ref) return null;
  if (typeof raw.repo !== "string" || !raw.repo) return null;
  if (typeof raw.committedAt !== "string" || Number.isNaN(Date.parse(raw.committedAt))) {
    return null;
  }
  if (!Array.isArray(raw.files)) return null;
  const files: SkillPackFile[] = [];
  for (const file of raw.files) {
    if (
      !file ||
      typeof file.path !== "string" ||
      !isSkillPackPath(file.path) ||
      typeof file.size !== "number" ||
      typeof file.blob !== "string"
    ) {
      return null;
    }
    files.push({ path: file.path, size: file.size, blob: file.blob });
  }
  return {
    schemaVersion: 1,
    repo: raw.repo,
    channel: raw.channel,
    ref: raw.ref,
    sha: raw.sha,
    committedAt: raw.committedAt,
    ...(typeof raw.version === "string" && raw.version ? { version: raw.version } : {}),
    files,
  };
}
