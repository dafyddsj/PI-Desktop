import { describe, expect, it } from "vitest";
import { DEFAULT_SUBAGENT_TOOLS, parseSubagentDefinition } from "./subagent-definition.js";
import {
  BUILTIN_SUBAGENT_DOCUMENTS,
  BUILTIN_SUBAGENT_SPECS,
  SUBAGENT_PRESETS,
  defaultSubagentPresetTools,
  fallbackBuiltinDefinitions,
  findSubagentPreset,
  renderBuiltinSubagentDocument,
} from "./subagent-presets.js";

describe("SUBAGENT_PRESETS", () => {
  it("ships the five builtin roles", () => {
    const ids = SUBAGENT_PRESETS.map((preset) => preset.id);
    expect(ids).toEqual([
      "explorer",
      "code-reviewer",
      "test-runner",
      "fixer",
      "ui-designer",
    ]);
  });

  it("never duplicates a name", () => {
    const names = SUBAGENT_PRESETS.map((preset) => preset.name);
    expect(new Set(names).size).toBe(names.length);
  });

  it("declares at least one tool per preset", () => {
    for (const preset of SUBAGENT_PRESETS) {
      expect(preset.tools.length).toBeGreaterThan(0);
    }
  });

  it("writes non-empty body copy", () => {
    for (const preset of SUBAGENT_PRESETS) {
      expect(preset.body.trim().length).toBeGreaterThan(0);
    }
  });

  it("exposes no turn cap on any preset", () => {
    for (const preset of SUBAGENT_PRESETS) {
      expect("maxTurns" in preset).toBe(false);
    }
  });

  it("grants Edit/Write only to roles that need them", () => {
    const fixer = findSubagentPreset("fixer");
    const explorer = findSubagentPreset("explorer");
    const reviewer = findSubagentPreset("code-reviewer");
    const runner = findSubagentPreset("test-runner");
    const designer = findSubagentPreset("ui-designer");
    expect(fixer?.tools).toContain("Edit");
    expect(fixer?.tools).toContain("Write");
    expect(designer?.tools).toContain("Edit");
    expect(designer?.tools).toContain("Write");
    expect(designer?.tools).toContain("BrowserPreview");
    expect(explorer?.tools ?? []).not.toContain("Edit");
    expect(reviewer?.tools ?? []).not.toContain("Edit");
    expect(runner?.tools ?? []).not.toContain("Edit");
  });

  it("agrees with the rendered builtin documents", () => {
    expect(SUBAGENT_PRESETS).toHaveLength(BUILTIN_SUBAGENT_SPECS.length);
    expect(BUILTIN_SUBAGENT_DOCUMENTS).toHaveLength(BUILTIN_SUBAGENT_SPECS.length);
    for (const spec of BUILTIN_SUBAGENT_SPECS) {
      const parsed = parseSubagentDefinition(renderBuiltinSubagentDocument(spec), {
        source: "builtin",
      });
      expect(parsed.ok).toBe(true);
      if (!parsed.ok) return;
      const preset = findSubagentPreset(spec.name);
      expect(preset).toBeDefined();
      if (!preset) return;
      expect(preset.description).toBe(parsed.definition.description);
      expect([...preset.tools]).toEqual(parsed.definition.tools);
      expect(preset.body.trim()).toBe(parsed.definition.prompt);
    }
  });
});

describe("findSubagentPreset", () => {
  it("returns the matching preset", () => {
    expect(findSubagentPreset("explorer")?.id).toBe("explorer");
    expect(findSubagentPreset("fixer")?.id).toBe("fixer");
    expect(findSubagentPreset("ui-designer")?.id).toBe("ui-designer");
  });

  it("returns undefined for unknown ids", () => {
    expect(findSubagentPreset("nope")).toBeUndefined();
    expect(findSubagentPreset("")).toBeUndefined();
  });
});

describe("defaultSubagentPresetTools", () => {
  it("matches the shared default tool list", () => {
    expect(defaultSubagentPresetTools()).toEqual(DEFAULT_SUBAGENT_TOOLS);
  });
});

describe("fallbackBuiltinDefinitions", () => {
  it("emits one catalog entry per preset, keyed by Task handle", () => {
    const definitions = fallbackBuiltinDefinitions();
    expect(definitions.map((item) => item.name)).toEqual(SUBAGENT_PRESETS.map((preset) => preset.id));
    for (const definition of definitions) {
      expect(definition.source).toBe("builtin");
      expect(definition.prompt.trim().length).toBeGreaterThan(0);
      expect(definition.tools.length).toBeGreaterThan(0);
      expect("maxTurns" in definition).toBe(false);
    }
  });
});
