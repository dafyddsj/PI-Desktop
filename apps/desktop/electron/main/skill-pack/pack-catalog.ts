/**
 * The active skill pack as the agent sees it: catalog entries for the system
 * prompt, and documents for the `Skill` tool.
 *
 * Every read goes through the copy's manifest, never a directory listing, so a
 * stray file next to a copy can neither become a skill nor be served.
 *
 * Pack skills link to each other and to shared playbooks with relative paths.
 * Reading those with the file tools would need an outside-workspace grant, so
 * the `Skill` tool serves them instead: `explore/<skill>` loads a skill, and
 * `explore/<path from the pack root>` loads any other pack Markdown file.
 */
import { lstatSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { parseSkillFrontmatter } from "@pi-desktop/plugin-sdk";
import type { PluginSkillDef } from "@pi-desktop/agent-runtime";
import type { LoadedSkillDocument } from "../skill-document";
import { SKILL_PACK, isSkillPackPath } from "./pack-spec.ts";
import type { SkillPackCopy } from "./pack-store.ts";

const PREFIX = `${SKILL_PACK.idPrefix}/`;
const SKILL_FILE = /^skills\/([a-z0-9][a-z0-9-]{0,63})\/SKILL\.md$/;
const SKILL_NAME = /^[a-z0-9][a-z0-9-]{0,63}$/;

function readPackFile(copy: SkillPackCopy, path: string): { location: string; text: string } | null {
  if (!copy.manifest.files.some((file) => file.path === path)) return null;
  const location = join(copy.root, ...path.split("/"));
  try {
    if (!lstatSync(location).isFile()) return null;
    return { location, text: readFileSync(location, "utf8") };
  } catch {
    return null;
  }
}

/** How to follow the pack's relative links, appended to every pack document. */
function linkGuidance(copy: SkillPackCopy): string {
  return [
    `This document is part of the built-in EXplore skill pack (pack root: ${copy.root}).`,
    `Follow its relative links with the Skill tool rather than file tools: a linked \`<name>/SKILL.md\` loads as \`${PREFIX}<name>\`,`,
    `and any other linked Markdown file loads as \`${PREFIX}<path from the pack root>\` (for example \`${PREFIX}playbooks/critical-thinking.md\`).`,
  ].join(" ");
}

/** Catalog entries for every skill in the copy, sorted by id. */
export function skillPackCatalog(copy: SkillPackCopy | null): PluginSkillDef[] {
  if (!copy) return [];
  const entries: PluginSkillDef[] = [];
  for (const file of copy.manifest.files) {
    const match = SKILL_FILE.exec(file.path);
    if (!match) continue;
    const read = readPackFile(copy, file.path);
    if (!read) continue;
    const parsed = parseSkillFrontmatter(read.text);
    if (!parsed.body) continue;
    entries.push({
      id: `${PREFIX}${match[1]}`,
      name: parsed.name ?? match[1]!,
      ...(parsed.description ? { description: parsed.description } : {}),
    });
  }
  return entries.sort((a, b) => a.id.localeCompare(b.id));
}

/**
 * Load a pack skill or linked pack document. Returns null for ids outside the
 * pack prefix, which tells the caller to try the next skill source.
 */
export function loadSkillPackDocument(
  copy: SkillPackCopy | null,
  id: string,
): LoadedSkillDocument | null {
  if (!id.startsWith(PREFIX)) return null;
  const rest = id.slice(PREFIX.length);
  if (!copy) throw new Error(`skill pack is not installed: ${id}`);
  const guidance = linkGuidance(copy);
  if (SKILL_NAME.test(rest)) {
    const read = readPackFile(copy, `skills/${rest}/SKILL.md`);
    if (!read) throw new Error(`no such skill in the pack: ${id}`);
    const parsed = parseSkillFrontmatter(read.text);
    return { id, name: parsed.name ?? rest, body: parsed.body, location: read.location, guidance };
  }
  // Links are written relative to a skill directory, so tolerate a model that
  // keeps the leading `../` segments when it maps one to an id.
  const path = rest.replace(/^(?:\.\.\/)+/, "");
  const read = isSkillPackPath(path) ? readPackFile(copy, path) : null;
  if (!read) throw new Error(`no such document in the pack: ${id}`);
  return { id: `${PREFIX}${path}`, name: path, body: read.text.trim(), location: read.location, guidance };
}
