import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { AGENT_DIR_DISPLAY, PI_AGENT_DIR_ENV, agentDir, pinPiAgentDir } from "./agent-dir.js";

describe("agentDir", () => {
  it("lives under ~/.explore, apart from the pi CLI's ~/.pi", () => {
    expect(agentDir("/home/u")).toBe(join("/home/u", ".explore", "agent"));
    expect(AGENT_DIR_DISPLAY).toBe("~/.explore/agent");
  });
});

describe("pinPiAgentDir", () => {
  it("points the pi SDK's env override at the PI-Desktop agent dir", () => {
    const env: NodeJS.ProcessEnv = {};
    expect(pinPiAgentDir(env, "/home/u")).toBe(join("/home/u", ".explore", "agent"));
    expect(env[PI_AGENT_DIR_ENV]).toBe(join("/home/u", ".explore", "agent"));
  });

  it("overrides an inherited pi CLI agent dir so credentials are never shared", () => {
    const env: NodeJS.ProcessEnv = { PI_CODING_AGENT_DIR: "/home/u/.pi/agent" };
    pinPiAgentDir(env, "/home/u");
    expect(env.PI_CODING_AGENT_DIR).toBe(join("/home/u", ".explore", "agent"));
  });
});
