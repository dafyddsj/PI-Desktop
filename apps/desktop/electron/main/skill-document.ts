import { dirname } from "node:path";

export type LoadedSkillDocument = {
  id: string;
  name: string;
  body: string;
  /** Absolute path of the loaded SKILL.md document. */
  location: string;
  /** Source-specific note on following the document's references. */
  guidance?: string;
};

/** Add path metadata only when a skill is loaded, not to the catalog prompt. */
export function formatSkillToolContent(skill: LoadedSkillDocument): string {
  return [
    `# Skill: ${skill.name} (${skill.id})`,
    `Location: ${skill.location}`,
    `References are relative to ${dirname(skill.location)}.`,
    ...(skill.guidance ? [skill.guidance] : []),
    "",
    skill.body,
  ].join("\n");
}
