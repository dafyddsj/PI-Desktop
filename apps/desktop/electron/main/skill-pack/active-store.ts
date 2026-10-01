/**
 * The app's one skill pack store.
 *
 * A module singleton because the skill catalog and the `Skill` tool read it
 * synchronously on every session launch and tool call. Free of Electron
 * imports so those readers stay loadable in plain Node.
 */
import { existsSync } from "node:fs";
import { join } from "node:path";
import { SKILL_PACK } from "./pack-spec.ts";
import { createSkillPackStore } from "./pack-store.ts";

/** electron-builder copies `resources/skill-packs` to `<resources>/skill-packs`. */
function bundledSkillPackDir(): string | null {
  const moduleDir = typeof __dirname === "string" ? __dirname : import.meta.dirname;
  const candidates = [
    join(process.resourcesPath || "", "skill-packs", SKILL_PACK.dirName),
    join(moduleDir, "../../resources/skill-packs", SKILL_PACK.dirName),
    join(moduleDir, "../../../resources/skill-packs", SKILL_PACK.dirName),
  ];
  return candidates.find((candidate) => candidate && existsSync(join(candidate, "pack.json"))) ?? null;
}

/** Set once main knows its data directory; until then only the bundled copy is read. */
let downloadsDir: string | null = null;

/**
 * Point downloads at the app data directory. Development and release builds
 * have separate ones, so a dev build's main-branch download never reaches a
 * release install.
 */
export function configureSkillPackDownloads(dataDir: string): void {
  downloadsDir = join(dataDir, "skill-packs", SKILL_PACK.dirName);
}

export const skillPackStore = createSkillPackStore({
  bundledDir: bundledSkillPackDir,
  userDir: () => downloadsDir,
});
