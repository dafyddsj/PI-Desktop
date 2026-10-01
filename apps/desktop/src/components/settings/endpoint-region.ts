/**
 * Which regional endpoints the service chooser lists: global by default,
 * mainland China for a Simplified Chinese interface, and whatever the user
 * last picked after that. The choice is a per-machine convenience, so it lives
 * in localStorage and falls back quietly when storage is unavailable.
 */
import type { EndpointRegion } from "@pi-desktop/shared";

export const ENDPOINT_REGION_STORAGE_KEY = "explore.serviceChooser.region";

function isRegion(value: unknown): value is EndpointRegion {
  return value === "global" || value === "cn";
}

function storage(): Storage | null {
  try {
    return typeof globalThis !== "undefined" && "localStorage" in globalThis
      ? globalThis.localStorage
      : null;
  } catch {
    return null;
  }
}

/** The region a first visit starts on, from the interface language. */
export function defaultEndpointRegion(language: string | undefined): EndpointRegion {
  return language?.toLowerCase() === "zh-cn" ? "cn" : "global";
}

export function readEndpointRegion(language: string | undefined): EndpointRegion {
  try {
    const value = storage()?.getItem(ENDPOINT_REGION_STORAGE_KEY);
    return isRegion(value) ? value : defaultEndpointRegion(language);
  } catch {
    return defaultEndpointRegion(language);
  }
}

export function rememberEndpointRegion(region: EndpointRegion): void {
  try {
    storage()?.setItem(ENDPOINT_REGION_STORAGE_KEY, region);
  } catch {
    // A blocked or full localStorage only costs the remembered choice.
  }
}
