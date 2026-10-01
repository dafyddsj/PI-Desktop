#!/usr/bin/env node
/**
 * Snapshot the EXplore skill pack into the app's resources.
 *
 *   pnpm skill-pack:vendor              # head of main (beta channel)
 *   pnpm skill-pack:vendor --ref v0.2.0 # a release tag (stable channel)
 *
 * Every build ships the snapshot so a first launch works offline; the in-app
 * updater moves on from it. Only pack files are copied (see
 * `apps/desktop/electron/main/skill-pack/pack-spec.ts`), and `pack.json`
 * records the commit, so a review of the diff shows exactly which upstream
 * revision a build carries. The fetch goes through the local git credentials,
 * which keeps this working while the repository is private.
 */
import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  SKILL_PACK,
  SKILL_PACK_REPO_URL,
  gitBlobSha,
  selectSkillPackFiles,
  versionFromTag,
} from "../apps/desktop/electron/main/skill-pack/pack-spec.ts";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const target = join(root, "apps/desktop/resources/skill-packs", SKILL_PACK.dirName);

function parseArgs(argv) {
  const options = { ref: SKILL_PACK.branch, repo: SKILL_PACK_REPO_URL };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--ref") options.ref = argv[++index];
    else if (arg === "--repo") options.repo = argv[++index];
    else throw new Error(`unknown argument: ${arg}`);
  }
  if (!options.ref) throw new Error("--ref needs a value");
  return options;
}

const { ref, repo } = parseArgs(process.argv.slice(2));
const scratch = mkdtempSync(join(tmpdir(), "skill-pack-"));
const git = (args, options = {}) =>
  execFileSync("git", ["-C", scratch, ...args], { encoding: "utf8", maxBuffer: 64 * 1024 * 1024, ...options });

try {
  git(["init", "--quiet", "--bare"]);
  const tags = execFileSync("git", ["ls-remote", "--tags", repo, `refs/tags/${ref}`], {
    encoding: "utf8",
  }).trim();
  const isTag = tags.length > 0;
  git(["fetch", "--quiet", "--depth", "1", repo, isTag ? `refs/tags/${ref}` : ref]);
  const sha = git(["rev-parse", "FETCH_HEAD^{commit}"]).trim();
  const committedAt = git(["log", "-1", "--format=%cI", sha]).trim();
  const entries = git(["ls-tree", "-r", "-l", "--full-tree", sha])
    .split("\n")
    .filter(Boolean)
    .map((line) => {
      const [meta, path] = line.split("\t");
      const [mode, type, blob, size] = meta.trim().split(/\s+/);
      return { path, mode, type, sha: blob, size: size === "-" ? undefined : Number(size) };
    });
  const files = selectSkillPackFiles(entries);

  rmSync(target, { recursive: true, force: true });
  for (const file of files) {
    const bytes = execFileSync("git", ["-C", scratch, "cat-file", "blob", file.blob], {
      maxBuffer: 64 * 1024 * 1024,
    });
    if (gitBlobSha(bytes) !== file.blob) throw new Error(`blob mismatch for ${file.path}`);
    const destination = join(target, "files", ...file.path.split("/"));
    mkdirSync(dirname(destination), { recursive: true });
    writeFileSync(destination, bytes);
  }
  const manifest = {
    schemaVersion: 1,
    repo: `${SKILL_PACK.owner}/${SKILL_PACK.repo}`,
    channel: isTag ? "stable" : "beta",
    ref,
    sha,
    committedAt,
    ...(isTag ? { version: versionFromTag(ref) } : {}),
    files,
  };
  writeFileSync(join(target, "pack.json"), `${JSON.stringify(manifest, null, 2)}\n`);
  console.log(
    `vendored ${files.length} files from ${manifest.repo}@${sha.slice(0, 7)} (${manifest.channel}, ${ref})`,
  );
} finally {
  rmSync(scratch, { recursive: true, force: true });
}
