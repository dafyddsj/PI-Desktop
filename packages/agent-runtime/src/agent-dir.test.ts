import { join } from "node:path";
import { CONFIG_DIR_NAME as PI_SDK_CONFIG_DIR_NAME } from "@earendil-works/pi-coding-agent";
import { describe, expect, it } from "vitest";
import { AGENT_DIR_DISPLAY, CONFIG_DIR_NAME, PI_AGENT_DIR_ENV, agentDir, pinPiAgentDir, projectConfigDir } from "./agent-dir.js";

describe("agentDir", () => {
  it("lives under ~/.explore, apart from the pi CLI's ~/.pi", () => {
    expect(agentDir("/home/u")).toBe(join("/home/u", ".explore", "agent"));
    expect(AGENT_DIR_DISPLAY).toBe("~/.explore/agent");
  });
});

describe("pinPiAgentDir", () => {
  it("points the pi SDK's env override at the EXplore Agent dir", () => {
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

describe("projectConfigDir", () => {
  it("uses <workspace>/.explore, apart from the pi CLI's .pi", () => {
    expect(projectConfigDir("/w")).toBe(join("/w", ".explore"));
    expect(CONFIG_DIR_NAME).toBe(".explore");
  });
});

describe("pi SDK config dir patch", () => {
  it("keeps the bundled SDK on .explore so its project and global paths agree", () => {
    // Guards patches/@earendil-works__pi-coding-agent@<version>.patch across upgrades.
    expect(PI_SDK_CONFIG_DIR_NAME).toBe(CONFIG_DIR_NAME);
  });
});
