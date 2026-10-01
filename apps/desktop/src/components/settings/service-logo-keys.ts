/**
 * Which bundled logo identifies an AI service.
 *
 * Kept free of asset imports so the mapping can be tested under plain Node;
 * `ServiceMonogram` turns a key into the SVG. Regional twins and plan variants
 * share their vendor's mark, and anything unmapped (a custom endpoint, a
 * plugin's service) keeps the letter tile. Xiaomi is left unmapped on purpose:
 * its only published mark is a wordmark that is illegible at tile size.
 */
import { matchNamedPreset } from "@pi-desktop/shared";

/** Logo file stem in `assets/service-logos/`, keyed by preset id or OAuth vendor id. */
const LOGO_BY_SERVICE: Readonly<Record<string, string>> = {
  // Named API-key presets.
  openai: "openai",
  anthropic: "anthropic",
  google: "gemini",
  openrouter: "openrouter",
  groq: "groq",
  xai: "xai",
  mistral: "mistral",
  togetherai: "together",
  "fireworks-ai": "fireworks",
  opencode_go: "opencode",
  opencode: "opencode",
  zai: "zai",
  "zai-coding-plan": "zai",
  zhipuai: "zhipu",
  "zhipuai-coding-plan": "zhipu",
  deepseek: "deepseek",
  alibaba: "qwen",
  "alibaba-cn": "qwen",
  "alibaba-token-plan": "qwen",
  "alibaba-token-plan-cn": "qwen",
  moonshotai: "moonshot",
  "moonshotai-cn": "moonshot",
  "kimi-for-coding": "kimi",
  siliconflow: "siliconcloud",
  "siliconflow-cn": "siliconcloud",
  volcengine: "volcengine",
  minimax: "minimax",
  "minimax-openai": "minimax",
  "minimax-cn": "minimax",
  "minimax-cn-openai": "minimax",
  "stepfun-plan": "stepfun",
  "ant-ling": "antgroup",
  baseten: "baseten",
  cerebras: "cerebras",
  huggingface: "huggingface",
  meta: "meta",
  nvidia: "nvidia",
  vercel: "vercel",
  // Subscription (OAuth) vendors that are not also preset ids.
  "openai-codex": "openai",
  "github-copilot": "githubcopilot",
  "kimi-coding": "kimi",
};

/** Logo for a preset id or an OAuth vendor id, if one ships. */
export function serviceLogoKey(id: string | undefined): string | undefined {
  return id ? LOGO_BY_SERVICE[id] : undefined;
}

/**
 * Logo for a saved service row: its OAuth vendor or the named preset its
 * endpoint resolves to. A custom endpoint has no logo.
 */
export function providerLogoKey(provider: {
  vendorKey?: string;
  baseUrl?: string;
  apiStyle?: string;
}): string | undefined {
  return (
    serviceLogoKey(matchNamedPreset(provider)?.id) ??
    serviceLogoKey(provider.vendorKey?.trim().toLowerCase())
  );
}

/** Every logo file the mapping names, for the asset check. */
export const SERVICE_LOGO_FILES: readonly string[] = [...new Set(Object.values(LOGO_BY_SERVICE))].sort();
