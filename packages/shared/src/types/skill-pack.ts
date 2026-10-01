/**
 * The built-in skill pack: a skill repository the app ships a copy of and can
 * update from GitHub without an app release.
 */

/** `stable` follows releases; `beta` follows the repository's main branch. */
export type SkillPackChannel = "stable" | "beta";

/** One copy of the pack, described for display. */
export type SkillPackVersion = {
  channel: SkillPackChannel;
  /** Release tag or branch name. */
  ref: string;
  sha: string;
  committedAt: string;
  /** Release version, when the copy is a release. */
  version?: string;
};

export type SkillPackStatus = "idle" | "checking" | "installing" | "error";

/**
 * Why the last check or install failed:
 *  - `no-release`: the stable channel has nothing published yet
 *  - `unreachable`: GitHub or the CDN refused or could not be reached (a
 *    private repository answers exactly like a missing one)
 *  - `invalid`: the source answered with files that failed verification
 */
export type SkillPackErrorKind = "no-release" | "unreachable" | "invalid";

export type SkillPackSkill = { id: string; name: string; description?: string };

/** Snapshot returned by the skill pack IPC and pushed on `skillPackState`. */
export type SkillPackState = {
  repoUrl: string;
  /** The channel checks follow: beta in development builds or when opted in. */
  channel: SkillPackChannel;
  /** Development builds always follow main; the beta switch is fixed on. */
  devBuild: boolean;
  /** The stored opt-in to beta skills on a release build. */
  betaOptIn: boolean;
  /** Copy sessions use; absent only when no copy is readable at all. */
  active?: SkillPackVersion & { origin: "bundled" | "downloaded" };
  /** Newer copy the channel offers, when there is one. */
  available?: SkillPackVersion;
  status: SkillPackStatus;
  error?: SkillPackErrorKind;
  lastCheckedAt?: string;
  skills: SkillPackSkill[];
};

/**
 * Pushed when a check first finds a given version. The renderer shows one
 * notice per version; the main process remembers which one it announced.
 */
export type SkillPackUpdateNotice = { available: SkillPackVersion };
