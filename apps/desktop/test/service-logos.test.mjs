/**
 * Service tiles show the vendor's bundled mark (D625 follow-up): every named
 * preset and subscription vendor resolves to a shipped, single-colour SVG, and
 * anything unmapped keeps the letter tile.
 */
import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import test from "node:test";
import { NAMED_ENDPOINT_PRESETS } from "@pi-desktop/shared";
import {
  providerLogoKey,
  serviceLogoKey,
  SERVICE_LOGO_FILES,
} from "../src/components/settings/service-logo-keys.ts";

const LOGO_DIR = new URL("../src/assets/service-logos/", import.meta.url);
const shipped = (await readdir(LOGO_DIR))
  .filter((name) => name.endsWith(".svg"))
  .map((name) => name.slice(0, -".svg".length))
  .sort();
const monogramSource = await readFile(
  new URL("../src/components/settings/ServiceMonogram.tsx", import.meta.url),
  "utf8",
);

// Xiaomi's only mark is a wordmark, unreadable at tile size.
const LETTER_ONLY = new Set(["xiaomi", "xiaomi-token-plan-cn", "xiaomi-token-plan-ams", "xiaomi-token-plan-sgp"]);

test("every named preset has a mark, except the deliberate letter tiles", () => {
  for (const preset of NAMED_ENDPOINT_PRESETS) {
    assert.equal(Boolean(serviceLogoKey(preset.id)), !LETTER_ONLY.has(preset.id), preset.id);
  }
});

test("subscription vendors pi-ai signs in to resolve to their vendor's mark", () => {
  assert.equal(serviceLogoKey("anthropic"), "anthropic");
  assert.equal(serviceLogoKey("openai-codex"), "openai");
  assert.equal(serviceLogoKey("github-copilot"), "githubcopilot");
  assert.equal(serviceLogoKey("kimi-coding"), "kimi");
  assert.equal(serviceLogoKey("xai"), "xai");
  assert.equal(serviceLogoKey("openrouter"), "openrouter");
});

test("regional twins share their vendor's mark; custom and unknown keep letters", () => {
  assert.equal(serviceLogoKey("moonshotai"), serviceLogoKey("moonshotai-cn"));
  assert.equal(serviceLogoKey("minimax-openai"), serviceLogoKey("minimax-cn"));
  assert.equal(serviceLogoKey("alibaba"), serviceLogoKey("alibaba-token-plan-cn"));
  assert.equal(serviceLogoKey("custom"), undefined);
  assert.equal(serviceLogoKey(undefined), undefined);
  assert.equal(serviceLogoKey("some-plugin-service"), undefined);
});

test("a saved row finds its mark from its endpoint or vendor key", () => {
  assert.equal(providerLogoKey({ baseUrl: "https://api.moonshot.cn/v1" }), "moonshot");
  assert.equal(providerLogoKey({ vendorKey: "openai-codex" }), "openai");
  assert.equal(providerLogoKey({ vendorKey: "OpenAI" }), "openai");
  assert.equal(providerLogoKey({ vendorKey: "custom", baseUrl: "https://llm.example/v1" }), undefined);
});

test("the mapping names only shipped files, and every shipped file is used", () => {
  assert.deepEqual(SERVICE_LOGO_FILES, shipped);
});

test("marks are plain single-colour vectors that follow currentColor", async () => {
  for (const name of shipped) {
    const svg = await readFile(new URL(`${name}.svg`, LOGO_DIR), "utf8");
    assert.match(svg, /^<svg [^>]*viewBox="0 0 24 24"/, name);
    assert.match(svg, /fill="currentColor"/, name);
    assert.doesNotMatch(svg, /<(script|image|style|foreignObject)\b|href=|url\(/i, name);
    assert.doesNotMatch(svg, /(fill|stroke)="(?!currentColor|none)[^"]+"/, name);
  }
});

test("the tile masks the mark over currentColor and falls back to a letter", () => {
  assert.match(monogramSource, /import\.meta\.glob<string>\("\.\.\/\.\.\/assets\/service-logos\/\*\.svg"/);
  assert.match(monogramSource, /maskImage: `url\("\$\{url\}"\)`/);
  assert.match(monogramSource, /monogramLetter\(name\)/);
});
