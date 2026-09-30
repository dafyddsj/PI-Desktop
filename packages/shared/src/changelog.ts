import { deEntries } from "./changelog-de.js";
import { esEntries } from "./changelog-es.js";
import { frEntries } from "./changelog-fr.js";
import { koEntries } from "./changelog-ko.js";
import { ptBREntries } from "./changelog-pt-BR.js";
import { trEntries } from "./changelog-tr.js";

/**
 * Shipped-locale product changelog for EXplore Agent app releases.
 *
 * English is the source of truth. The translated catalogs mirror
 * the same versions and bullet counts so in-app "what's new" can follow the
 * active UI locale without a network fetch or renderer-supplied feed URL.
 *
 * Update this file before cutting a release tag. GitHub release bodies may
 * still be auto-generated for the web; they are not the in-app source.
 * Stable product versions only — omit pre-releases.
 */

export type ChangelogLocale = "en" | "zh-CN" | "zh-TW" | "tr" | "de" | "es" | "fr" | "ko" | "pt-BR";

export type ChangelogEntry = {
  /** Semver without a leading `v`, matching apps/desktop package version. */
  version: string;
  /** Optional ISO date (YYYY-MM-DD) of the release. */
  date?: string;
  /** Short user-facing highlights; keep each line one idea. */
  highlights: string[];
};

const enEntries: ChangelogEntry[] = [
  {
    version: "0.1.0",
    highlights: [
      "First EXplore Agent release, built from PI-Desktop.",
      "Agent settings, logins, prompts, and instructions live in ~/.explore/agent and each project's .explore folder, separate from any pi CLI installation.",
      "App data (sessions, logs, provider keys) lives in ~/.explore/app.",
    ],
  },
];

const zhCNEntries: ChangelogEntry[] = [
  {
    version: "0.1.0",
    highlights: [
      "EXplore Agent 首个版本，基于 PI-Desktop 构建。",
      "智能体设置、登录、提示词与指令保存在 ~/.explore/agent 和各项目的 .explore 文件夹中，与任何 pi CLI 安装相互独立。",
      "应用数据（会话、日志、服务商密钥）保存在 ~/.explore/app。",
    ],
  },
];

const zhTWEntries: ChangelogEntry[] = [
  {
    version: "0.1.0",
    highlights: [
      "EXplore Agent 首個版本，以 PI-Desktop 為基礎打造。",
      "智慧體設定、登入、提示詞與指令儲存在 ~/.explore/agent 及各專案的 .explore 資料夾，與任何 pi CLI 安裝彼此獨立。",
      "應用程式資料（工作階段、日誌、服務商金鑰）儲存在 ~/.explore/app。",
    ],
  },
];

/** Locale → newest-first product notes. */
export const CHANGELOG: Record<ChangelogLocale, readonly ChangelogEntry[]> = {
  en: enEntries,
  "zh-CN": zhCNEntries,
  "zh-TW": zhTWEntries,
  tr: trEntries,
  de: deEntries,
  es: esEntries,
  fr: frEntries,
  ko: koEntries,
  "pt-BR": ptBREntries,
};

/** Normalize `v0.2.7` / whitespace to the catalog key form. */
export function normalizeChangelogVersion(
  version: string | null | undefined,
): string {
  return String(version ?? "")
    .trim()
    .replace(/^v/i, "");
}

export function resolveChangelogLocale(
  input?: string | null,
): ChangelogLocale {
  const value = (input || "").replaceAll("_", "-").toLowerCase();
  if (
    value === "zh-tw" ||
    value.startsWith("zh-tw-") ||
    value === "zh-hant" ||
    value.startsWith("zh-hant-") ||
    value === "zh-hk" ||
    value.startsWith("zh-hk-") ||
    value === "zh-mo" ||
    value.startsWith("zh-mo-")
  ) {
    return "zh-TW";
  }
  if (value.startsWith("zh")) return "zh-CN";
  if (value === "tr" || value.startsWith("tr-")) return "tr";
  if (value === "de" || value.startsWith("de-")) return "de";
  if (value === "es" || value.startsWith("es-")) return "es";
  if (value === "fr" || value.startsWith("fr-")) return "fr";
  if (value === "ko" || value.startsWith("ko-")) return "ko";
  if (value === "pt" || value.startsWith("pt-")) return "pt-BR";
  return "en";
}

export function getChangelogEntry(
  version: string | null | undefined,
  locale: ChangelogLocale = "en",
): ChangelogEntry | undefined {
  const key = normalizeChangelogVersion(version);
  if (!key) return undefined;
  const catalog = CHANGELOG[locale] ?? CHANGELOG.en;
  return catalog.find((entry) => entry.version === key);
}

/**
 * Format highlights as plain multi-line text for UpdateState / compact UI.
 * Returns undefined when the version has no catalog entry or empty highlights.
 */
export function formatChangelogNotes(
  version: string | null | undefined,
  localeInput?: string | null,
): string | undefined {
  const locale = resolveChangelogLocale(localeInput);
  const entry =
    getChangelogEntry(version, locale) ??
    (locale === "en" ? undefined : getChangelogEntry(version, "en"));
  if (!entry?.highlights.length) return undefined;
  return entry.highlights.map((line) => `• ${line}`).join("\n");
}
