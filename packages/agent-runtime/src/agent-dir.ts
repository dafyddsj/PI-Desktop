import { homedir } from "node:os";
import { join } from "node:path";

/**
 * PI-Desktop's global agent directory: `~/.explore/agent`.
 *
 * The bundled pi SDK defaults to `~/.pi/agent`, which a separately installed
 * pi CLI also owns. PI-Desktop keeps its own agent config (auth, models,
 * settings, prompts, global instructions, native sessions) apart from that
 * installation so logins and models never leak between the two.
 */
export const AGENT_CONFIG_DIR_NAME = ".explore";

/** Display form of {@link agentDir} for prompts and labels. */
export const AGENT_DIR_DISPLAY = `~/${AGENT_CONFIG_DIR_NAME}/agent`;

/** The environment variable the pi SDK's `getAgentDir()` reads. */
export const PI_AGENT_DIR_ENV = "PI_CODING_AGENT_DIR";

export function agentDir(home: string = homedir()): string {
  return join(home, AGENT_CONFIG_DIR_NAME, "agent");
}

/**
 * Point the pi SDK's own `getAgentDir()` at {@link agentDir}. An inherited
 * value is overwritten on purpose: it belongs to the user's pi CLI, and
 * honoring it would share that installation's credentials with PI-Desktop.
 */
export function pinPiAgentDir(env: NodeJS.ProcessEnv = process.env, home: string = homedir()): string {
  const dir = agentDir(home);
  env[PI_AGENT_DIR_ENV] = dir;
  return dir;
}
