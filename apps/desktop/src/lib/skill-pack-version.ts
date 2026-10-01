import type { SkillPackVersion } from "@pi-desktop/shared";

/** A release shows its version; a branch copy shows where on the branch it is. */
export function skillPackVersionLabel(version: SkillPackVersion): string {
  return version.version ?? `${version.ref} @ ${version.sha.slice(0, 7)}`;
}
