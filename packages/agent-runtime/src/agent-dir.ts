import { homedir } from "node:os";
import { join } from "node:path";

/**
 * EXplore Agent's pi config directory name: `.explore`, for both the global
 * agent directory (`~/.explore/agent`) and project folders
 * (`<workspace>/.explore/`).
 *
 * The bundled pi SDK defaults to `.pi`, which a separately installed pi CLI
 * also owns. EXplore Agent keeps its own config (auth, models, settings, prompts,
 * instructions, extensions, native sessions, plan/goal artifacts) apart from
 * that installation so the two never share state. The SDK's own
 * `CONFIG_DIR_NAME` is patched to the same value
 * (`patches/@earendil-works__pi-coding-agent@0.87.1.patch`).
 */
export const CONFIG_DIR_NAME = ".explore";

/** Display form of {@link agentDir} for prompts and labels. */
export const AGENT_DIR_DISPLAY = `~/${CONFIG_DIR_NAME}/agent`;

/** The environment variable the pi SDK's `getAgentDir()` reads. */
export const PI_AGENT_DIR_ENV = "PI_CODING_AGENT_DIR";

export function agentDir(home: string = homedir()): string {
  return join(home, CONFIG_DIR_NAME, "agent");
}

/** A workspace's project config folder, e.g. `<workspace>/.explore`. */
export function projectConfigDir(workspaceRoot: string): string {
  return join(workspaceRoot, CONFIG_DIR_NAME);
}

/**
 * Point the pi SDK's own `getAgentDir()` at {@link agentDir}. An inherited
 * value is overwritten on purpose: it belongs to the user's pi CLI, and
 * honoring it would share that installation's credentials with EXplore Agent.
 */
export function pinPiAgentDir(env: NodeJS.ProcessEnv = process.env, home: string = homedir()): string {
  const dir = agentDir(home);
  env[PI_AGENT_DIR_ENV] = dir;
  return dir;
}
