/**
 * The services a new AI service row can start from, and the search over them.
 *
 * Filtering never talks to the host. The haystack covers the localized label,
 * the preset's canonical name, id, vendor key, aliases, base URL and host, so
 * "kimi", "moonshot" and "api.moonshot.cn" all land on the same entry.
 */
import {
  NAMED_ENDPOINT_PRESETS,
  type EndpointRegion,
  type NamedEndpointPreset,
} from "@pi-desktop/shared";

export const CUSTOM_SERVICE = "custom";

type Translate = (key: string) => string;

export type ServiceOption = {
  id: string;
  label: string;
  /** Endpoint host and path shown under the label; empty for the custom endpoint. */
  endpoint: string;
  haystack: string;
  /** Absent for services offered in every region. */
  region?: EndpointRegion;
};

export function endpointLabel(url: string): string {
  try {
    const parsed = new URL(url);
    return parsed.host + parsed.pathname.replace(/\/+$/, "");
  } catch {
    return url;
  }
}

function presetOption(preset: NamedEndpointPreset, translate: Translate): ServiceOption {
  const label = translate(preset.labelKey);
  const endpoint = endpointLabel(preset.baseUrl);
  const aliases = preset.aliases?.join(" ") ?? "";
  return {
    id: preset.id,
    label,
    endpoint,
    haystack:
      `${label} ${preset.name} ${preset.id} ${preset.vendorKey} ${aliases} ${preset.baseUrl} ${endpoint}`.toLowerCase(),
    ...(preset.region ? { region: preset.region } : {}),
  };
}

/** Every named endpoint preset, in the order the shared table lists them. */
export function namedServiceOptions(translate: Translate): ServiceOption[] {
  return NAMED_ENDPOINT_PRESETS.map((preset) => presetOption(preset, translate));
}

/** Any OpenAI- or Anthropic-compatible address the presets do not cover. */
export function customServiceOption(translate: Translate): ServiceOption {
  const label = translate("settings.presetCustomEndpoint");
  return {
    id: CUSTOM_SERVICE,
    label,
    endpoint: "",
    haystack: `${label} custom endpoint`.toLowerCase(),
  };
}

/** The region a stored service belongs to, if it is a regional preset. */
export function serviceRegion(id: string | undefined): EndpointRegion | undefined {
  return NAMED_ENDPOINT_PRESETS.find((preset) => preset.id === id)?.region;
}

/**
 * The services the API-key group lists for a region. Browsing shows only that
 * region's endpoints (and the region-free ones); a search also reaches the
 * other region, after the region's own matches, so a pasted host never comes
 * up empty just because the toggle points elsewhere.
 */
export function servicesForRegion<T extends { region?: EndpointRegion }>(
  options: readonly T[],
  region: EndpointRegion,
  searching: boolean,
): T[] {
  const inRegion = options.filter((option) => !option.region || option.region === region);
  if (!searching) return inRegion;
  return [...inRegion, ...options.filter((option) => option.region && option.region !== region)];
}

/** Case-insensitive substring match; an empty query keeps every option. */
export function filterServiceOptions<T extends { haystack: string }>(
  options: readonly T[],
  query: string,
): T[] {
  const needle = query.trim().toLowerCase();
  if (!needle) return [...options];
  return options.filter((option) => option.haystack.includes(needle));
}
