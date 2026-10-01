/**
 * Skill pack updates: which channel to follow, when to check, and how a found
 * version reaches the user.
 *
 * Updates are offered, never applied on their own: a check that finds a newer
 * version announces it once (per commit) and the user installs it from
 * settings. Development builds follow the main branch; release builds follow
 * GitHub releases unless the user opts into beta skills.
 */
import type { PluginSkillDef } from "@pi-desktop/agent-runtime";
import {
  IPC,
  type SkillPackErrorKind,
  type SkillPackState,
  type SkillPackUpdateNotice,
  type SkillPackVersion,
} from "@pi-desktop/shared";
import type { LoadedSkillDocument } from "../skill-document";
import { loadSkillPackDocument, skillPackCatalog } from "./pack-catalog.ts";
import {
  SkillPackInvalidError,
  SkillPackNoReleaseError,
  downloadSkillPack,
  resolveSkillPackTarget,
  type SkillPackRequest,
  type SkillPackTarget,
} from "./pack-source.ts";
import { SKILL_PACK_REPO_URL, type SkillPackChannel } from "./pack-spec.ts";
import type { SkillPackCopy, SkillPackStore } from "./pack-store.ts";

export const SKILL_PACK_INITIAL_CHECK_DELAY_MS = 20_000;
export const SKILL_PACK_CHECK_INTERVAL_MS = 24 * 60 * 60 * 1000;

type SkillPackSettings = { skillPackBeta?: boolean; skillPackLastNotifiedSha?: string };

export type SkillPackServiceOptions = {
  store: SkillPackStore;
  request: SkillPackRequest;
  devBuild: boolean;
  readSettings: () => Promise<SkillPackSettings>;
  writeSettings: (patch: SkillPackSettings) => Promise<void>;
  send: (channel: string, payload: unknown) => void;
  log?: (level: "info" | "warn", message: string, data?: unknown) => void;
  now?: () => Date;
};

export type SkillPackService = ReturnType<typeof createSkillPackService>;

/** Whether `target` is worth offering over the copy in use. */
export function isSkillPackUpgrade(
  target: SkillPackTarget,
  active: SkillPackCopy | null,
  channel: SkillPackChannel,
): boolean {
  if (!active) return true;
  if (target.sha === active.manifest.sha) return false;
  // A channel switch offers the channel's version even when it is older:
  // leaving beta for the latest release is the point of switching.
  if (active.manifest.channel !== channel) return true;
  return Date.parse(target.committedAt) > Date.parse(active.manifest.committedAt);
}

function classifyFailure(error: unknown): SkillPackErrorKind {
  if (error instanceof SkillPackNoReleaseError) return "no-release";
  if (error instanceof SkillPackInvalidError) return "invalid";
  return "unreachable";
}

function versionOf(target: SkillPackTarget): SkillPackVersion {
  return {
    channel: target.channel,
    ref: target.ref,
    sha: target.sha,
    committedAt: target.committedAt,
    ...(target.version ? { version: target.version } : {}),
  };
}

export function createSkillPackService(options: SkillPackServiceOptions) {
  const now = options.now ?? (() => new Date());
  let betaOptIn = false;
  let available: SkillPackTarget | undefined;
  let status: SkillPackState["status"] = "idle";
  let error: SkillPackErrorKind | undefined;
  let lastCheckedAt: string | undefined;
  // Bumped whenever the channel changes, so a check that was already in flight
  // for the old channel cannot publish its answer.
  let generation = 0;
  let inflightCheck: Promise<SkillPackState> | null = null;
  let inflightInstall: Promise<SkillPackState> | null = null;
  let timers: Array<ReturnType<typeof setTimeout>> = [];
  let settingsLoaded: Promise<void> | null = null;

  const channel = (): SkillPackChannel => (options.devBuild || betaOptIn ? "beta" : "stable");

  const loadSettings = () => {
    settingsLoaded ??= options
      .readSettings()
      .then((settings) => {
        betaOptIn = settings.skillPackBeta === true;
      })
      .catch(() => {
        // The host may not be up yet; read again on the next request.
        settingsLoaded = null;
      });
    return settingsLoaded;
  };

  const snapshot = (): SkillPackState => {
    const active = options.store.active();
    return {
      repoUrl: SKILL_PACK_REPO_URL,
      channel: channel(),
      devBuild: options.devBuild,
      betaOptIn,
      ...(active
        ? {
            active: {
              channel: active.manifest.channel,
              ref: active.manifest.ref,
              sha: active.manifest.sha,
              committedAt: active.manifest.committedAt,
              ...(active.manifest.version ? { version: active.manifest.version } : {}),
              origin: active.origin,
            },
          }
        : {}),
      ...(available ? { available: versionOf(available) } : {}),
      status,
      ...(error ? { error } : {}),
      ...(lastCheckedAt ? { lastCheckedAt } : {}),
      skills: skillPackCatalog(active),
    };
  };

  const publish = (): SkillPackState => {
    const state = snapshot();
    options.send(IPC.event.skillPackState, state);
    return state;
  };

  const announce = async (target: SkillPackTarget) => {
    let settings: SkillPackSettings = {};
    try {
      settings = await options.readSettings();
    } catch {
      // Without the record the notice may repeat; it must not be lost.
    }
    if (settings.skillPackLastNotifiedSha === target.sha) return;
    const notice: SkillPackUpdateNotice = { available: versionOf(target) };
    options.send(IPC.event.skillPackUpdateNotice, notice);
    try {
      await options.writeSettings({ skillPackLastNotifiedSha: target.sha });
    } catch (cause) {
      options.log?.("warn", "skill pack notice was not recorded", String(cause));
    }
  };

  const runCheck = async (notify: boolean): Promise<SkillPackState> => {
    await loadSettings();
    const started = generation;
    const checking = channel();
    status = "checking";
    error = undefined;
    publish();
    try {
      const target = await resolveSkillPackTarget(options.request, checking);
      if (started !== generation) return snapshot();
      available = isSkillPackUpgrade(target, options.store.active(), checking) ? target : undefined;
      if (available && notify) await announce(available);
    } catch (cause) {
      if (started !== generation) return snapshot();
      available = undefined;
      error = classifyFailure(cause);
      if (error !== "no-release") {
        options.log?.("warn", "skill pack check failed", String(cause));
      }
    }
    lastCheckedAt = now().toISOString();
    status = "idle";
    return publish();
  };

  const check = (notify = false): Promise<SkillPackState> => {
    if (inflightInstall) return inflightInstall;
    inflightCheck ??= runCheck(notify).finally(() => {
      inflightCheck = null;
    });
    return inflightCheck;
  };

  const runInstall = async (): Promise<SkillPackState> => {
    if (inflightCheck) await inflightCheck;
    const target = available;
    if (!target) return snapshot();
    status = "installing";
    error = undefined;
    publish();
    try {
      const { manifest, contents } = await downloadSkillPack(options.request, target);
      options.store.install(manifest, contents);
      available = undefined;
      options.log?.("info", "skill pack installed", { sha: manifest.sha, ref: manifest.ref });
    } catch (cause) {
      error = classifyFailure(cause);
      options.log?.("warn", "skill pack install failed", String(cause));
    }
    status = "idle";
    return publish();
  };

  const install = (): Promise<SkillPackState> => {
    inflightInstall ??= runInstall().finally(() => {
      inflightInstall = null;
    });
    return inflightInstall;
  };

  const revert = async (): Promise<SkillPackState> => {
    if (inflightInstall) await inflightInstall;
    options.store.revertToBundled();
    available = undefined;
    publish();
    return check(false);
  };

  const setBeta = async (enabled: boolean): Promise<SkillPackState> => {
    await loadSettings();
    await options.writeSettings({ skillPackBeta: enabled });
    betaOptIn = enabled;
    generation += 1;
    available = undefined;
    error = undefined;
    // A check for the old channel may still be running; this one must not
    // join it, or it would answer for the wrong channel.
    if (inflightCheck) await inflightCheck.catch(() => undefined);
    return check(false);
  };

  const dispose = () => {
    for (const timer of timers) clearTimeout(timer);
    timers = [];
  };

  const start = () => {
    dispose();
    void loadSettings();
    timers = [
      setTimeout(() => void check(true), SKILL_PACK_INITIAL_CHECK_DELAY_MS),
      setInterval(() => void check(true), SKILL_PACK_CHECK_INTERVAL_MS),
    ];
    // Checks are background work; they never keep the process alive.
    for (const timer of timers) timer.unref?.();
  };

  return {
    getState: async () => {
      await loadSettings();
      return snapshot();
    },
    check,
    install,
    revert,
    setBeta,
    start,
    dispose,
    /** Catalog entries for the copy in use, read fresh on every call. */
    catalog: (): PluginSkillDef[] => skillPackCatalog(options.store.active()),
    loadDocument: (id: string): LoadedSkillDocument | null =>
      loadSkillPackDocument(options.store.active(), id),
  };
}
