/**
 * The skill pack copies on disk and which one is in use.
 *
 * Two places hold a copy, both laid out as `pack.json` beside a `files/` tree:
 *
 * - the bundled copy in the app resources (`<resources>/skill-packs/<pack>`),
 *   read-only and replaced by every app update;
 * - downloaded copies under `<app data>/skill-packs/<pack>/versions/<sha>`
 *   (`~/.explore/app` or `~/.explore/app-dev`), with `active.json` naming the
 *   one the user installed.
 *
 * A download wins while it is at least as new as the bundled copy, or while the
 * bundle is the one it was installed against (an explicit choice, such as
 * leaving the beta channel for an older release). An app update that ships a
 * newer bundle therefore moves the user forward without a download, and never
 * back. Copies are written to a staging directory and renamed into place, so a
 * reader never sees a half-written version.
 */
import { randomUUID } from "node:crypto";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  renameSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { dirname, join } from "node:path";
import { parseSkillPackManifest, type SkillPackManifest } from "./pack-spec.ts";

export type SkillPackCopy = {
  manifest: SkillPackManifest;
  /** Directory holding the repository-relative pack files. */
  root: string;
  origin: "bundled" | "downloaded";
};

type ActivePointer = { sha: string; bundledSha?: string };

export type SkillPackStore = {
  bundled(): SkillPackCopy | null;
  /** The copy sessions use, or null when neither copy is readable. */
  active(): SkillPackCopy | null;
  /** Write a verified download and make it the active copy. */
  install(manifest: SkillPackManifest, contents: ReadonlyMap<string, Uint8Array>): SkillPackCopy;
  /** Forget downloads and return to the copy that shipped with the app. */
  revertToBundled(): void;
};

function readJson(path: string): unknown {
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch {
    return null;
  }
}

function readCopy(dir: string, origin: SkillPackCopy["origin"]): SkillPackCopy | null {
  const manifest = parseSkillPackManifest(readJson(join(dir, "pack.json")));
  const root = join(dir, "files");
  if (!manifest || !existsSync(root)) return null;
  return { manifest, root, origin };
}

function writeAtomically(path: string, text: string): void {
  const temp = `${path}.${randomUUID()}.tmp`;
  writeFileSync(temp, text);
  renameSync(temp, path);
}

export function createSkillPackStore(options: {
  /** Bundled copy directory, or null when the build carries none. */
  bundledDir: () => string | null;
  /** Per-user directory for downloaded copies; null until the app configures it. */
  userDir: () => string | null;
}): SkillPackStore {
  const versionsDir = () => {
    const dir = options.userDir();
    return dir ? join(dir, "versions") : null;
  };
  const pointerPath = () => {
    const dir = options.userDir();
    return dir ? join(dir, "active.json") : null;
  };

  const bundled = (): SkillPackCopy | null => {
    const dir = options.bundledDir();
    return dir ? readCopy(dir, "bundled") : null;
  };

  const pointer = (): ActivePointer | null => {
    const path = pointerPath();
    if (!path) return null;
    const raw = readJson(path) as Partial<ActivePointer> | null;
    if (!raw || typeof raw.sha !== "string" || !/^[0-9a-f]{40}$/.test(raw.sha)) return null;
    return {
      sha: raw.sha,
      ...(typeof raw.bundledSha === "string" ? { bundledSha: raw.bundledSha } : {}),
    };
  };

  const downloaded = (sha: string): SkillPackCopy | null => {
    const dir = versionsDir();
    if (!dir) return null;
    const copy = readCopy(join(dir, sha), "downloaded");
    return copy?.manifest.sha === sha ? copy : null;
  };

  const active = (): SkillPackCopy | null => {
    const shipped = bundled();
    const chosen = pointer();
    const download = chosen ? downloaded(chosen.sha) : null;
    if (!download) return shipped;
    if (!shipped || chosen?.bundledSha === shipped.manifest.sha) return download;
    return Date.parse(download.manifest.committedAt) >= Date.parse(shipped.manifest.committedAt)
      ? download
      : shipped;
  };

  /** Keep the active download and the one before it; drop everything else. */
  const prune = (keep: ReadonlySet<string>) => {
    const dir = versionsDir();
    if (!dir) return;
    let names: string[];
    try {
      names = readdirSync(dir);
    } catch {
      return;
    }
    for (const name of names) {
      if (keep.has(name)) continue;
      rmSync(join(dir, name), { recursive: true, force: true });
    }
  };

  const install = (
    manifest: SkillPackManifest,
    contents: ReadonlyMap<string, Uint8Array>,
  ): SkillPackCopy => {
    const dir = versionsDir();
    const pointerFile = pointerPath();
    if (!dir || !pointerFile) throw new Error("skill pack storage is not configured");
    const previous = pointer()?.sha;
    const destination = join(dir, manifest.sha);
    if (!downloaded(manifest.sha)) {
      const staging = join(dir, `.staging-${randomUUID()}`);
      try {
        for (const file of manifest.files) {
          const bytes = contents.get(file.path);
          if (!bytes) throw new Error(`missing downloaded file: ${file.path}`);
          // Paths passed `isSkillPackPath`: relative, no `..`, no dot segments.
          const target = join(staging, "files", ...file.path.split("/"));
          mkdirSync(dirname(target), { recursive: true });
          writeFileSync(target, bytes);
        }
        writeFileSync(join(staging, "pack.json"), `${JSON.stringify(manifest, null, 2)}\n`);
        rmSync(destination, { recursive: true, force: true });
        renameSync(staging, destination);
      } catch (error) {
        rmSync(staging, { recursive: true, force: true });
        throw error;
      }
    }
    const shipped = bundled();
    const next: ActivePointer = {
      sha: manifest.sha,
      ...(shipped ? { bundledSha: shipped.manifest.sha } : {}),
    };
    writeAtomically(pointerFile, `${JSON.stringify(next)}\n`);
    prune(new Set([manifest.sha, ...(previous ? [previous] : [])]));
    const copy = downloaded(manifest.sha);
    if (!copy) throw new Error("installed skill pack could not be read back");
    return copy;
  };

  const revertToBundled = () => {
    const path = pointerPath();
    if (path) rmSync(path, { force: true });
    prune(new Set());
  };

  return { bundled, active, install, revertToBundled };
}
