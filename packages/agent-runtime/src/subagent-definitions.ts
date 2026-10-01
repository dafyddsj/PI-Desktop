/**
 * Where subagent definitions come from, and how a definition's model pin turns
 * into a usable provider binding (ADR 0062).
 *
 * Discovery has two sources, in shadowing order: the user's global
 * `~/.agents/subagents/*.md` documents handed in by Electron main (D202), and
 * the definitions EXplore Agent ships. Project workspaces never provide subagents;
 * a repository cannot silently add a delegate to a user's agent catalog.
 */

import { readdir, readFile } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";
import {
  BUILTIN_SUBAGENT_DOCUMENTS,
  mergeSubagentDefinitions,
  parseSubagentDefinition,
  parseSubagentModelPin,
  subagentModelKey,
  subagentPinnedProviders,
  OAUTH_AUTH_KIND,
  type SubagentDefinition,
} from "@pi-desktop/shared";
import {
  capabilitiesFromModelConfig,
  genericModelConfig,
} from "./model-capabilities.js";
import type { RuntimeProviderConfig } from "./provider-binding.js";
import type { ModelConfig, ThinkingCapabilitySet } from "./thinking-level.js";

/**
 * What a signed-in vendor account says about one of its models. Resolved by
 * Electron main against the authenticated account collection. The account
 * collection supplies availability and wire identity; model configuration is
 * always supplied by the models.dev snapshot or the generic unknown-model
 * shape.
 */
export type VendorModelBinding = ThinkingCapabilitySet & {
  apiStyle: string;
  baseUrl: string;
  modelConfig: ModelConfig;
};

/** Global directory for user-owned definitions; project roots are not consulted. */
export function subagentDefinitionDir(_workspaceRoot: string): string {
  return join(homedir(), ".agents", "subagents");
}

/** Parsed builtins, rebuilt per call so a bad constant surfaces as a
 * diagnostic in exactly the same way a bad project document does. */
function builtinSubagents(): {
  definitions: SubagentDefinition[];
  diagnostics: string[];
} {
  const definitions: SubagentDefinition[] = [];
  const diagnostics: string[] = [];
  for (const raw of BUILTIN_SUBAGENT_DOCUMENTS) {
    const parsed = parseSubagentDefinition(raw, { source: "builtin" });
    if (parsed.ok) definitions.push(parsed.definition);
    else diagnostics.push(`builtin subagent invalid: ${parsed.errors.join("; ")}`);
  }
  return { definitions, diagnostics };
}

async function loadGlobalSubagents(
  dir: string,
): Promise<{ definitions: SubagentDefinition[]; diagnostics: string[] }> {
  const definitions: SubagentDefinition[] = [];
  const diagnostics: string[] = [];
  let names: string[];
  try {
    names = (await readdir(dir)).filter((name) => /\.md$/i.test(name)).sort();
  } catch {
    // No `~/.agents/subagents` directory is the common case, not an error.
    return { definitions, diagnostics };
  }
  for (const name of names) {
    const filePath = join(dir, name);
    let raw: string;
    try {
      raw = await readFile(filePath, "utf8");
    } catch (err) {
      diagnostics.push(
        `${filePath}: unreadable (${err instanceof Error ? err.message : String(err)})`,
      );
      continue;
    }
    const parsed = parseSubagentDefinition(raw, {
      source: "user",
      fallbackName: name,
      filePath,
    });
    for (const warning of parsed.warnings) diagnostics.push(`${filePath}: ${warning}`);
    if (parsed.ok) definitions.push(parsed.definition);
    else diagnostics.push(`${filePath}: ${parsed.errors.join("; ")}`);
  }
  return { definitions, diagnostics };
}

/**
 * One document from the user's registry (D202). Electron main reads the
 * registry — host-core owns it — and hands the documents in, so this module
 * keeps one parser and one merge for all three sources.
 */
export type UserSubagentDocument = {
  /** Registry id, used as the fallback name when the frontmatter omits one. */
  id: string;
  /** Raw document text, frontmatter included. */
  document: string;
  /** Absolute path, so a diagnostic and the UI can point at the same file. */
  filePath?: string;
};

export type BuiltinSubagentOverlay = {
  disabled?: readonly string[];
  modelPins?: Readonly<Record<string, string>>;
};

export type LoadSubagentOptions = {
  /** Global directory override, primarily for isolated tests. */
  overrideDir?: string;
  /** Documents already scanned by host-core from `~/.agents/subagents`. */
  userDocuments?: readonly UserSubagentDocument[];
  builtinOverlay?: BuiltinSubagentOverlay;
};

export function stampBuiltinModelPins(
  definitions: readonly SubagentDefinition[],
  modelPins: Readonly<Record<string, string>> | undefined,
): { definitions: SubagentDefinition[]; diagnostics: string[] } {
  const diagnostics: string[] = [];
  if (!modelPins) {
    return { definitions: [...definitions], diagnostics };
  }
  const next = definitions.map((definition) => {
    if (definition.source !== "builtin") return definition;
    const stored = modelPins[definition.name];
    if (stored === undefined) return definition;
    const pin = parseSubagentModelPin(stored);
    if (!pin) {
      diagnostics.push(
        `builtin subagent "${definition.name}": ignoring invalid model pin "${stored}"`,
      );
      return definition;
    }
    return { ...definition, model: pin };
  });
  return { definitions: next, diagnostics };
}

function loadUserSubagents(documents: readonly UserSubagentDocument[]): {
  definitions: SubagentDefinition[];
  diagnostics: string[];
} {
  const definitions: SubagentDefinition[] = [];
  const diagnostics: string[] = [];
  for (const entry of documents) {
    const label = entry.filePath ?? `user subagent "${entry.id}"`;
    const parsed = parseSubagentDefinition(entry.document, {
      source: "user",
      fallbackName: entry.id,
      ...(entry.filePath ? { filePath: entry.filePath } : {}),
    });
    for (const warning of parsed.warnings) diagnostics.push(`${label}: ${warning}`);
    if (parsed.ok) definitions.push(parsed.definition);
    else diagnostics.push(`${label}: ${parsed.errors.join("; ")}`);
  }
  return { definitions, diagnostics };
}

/**
 * Definitions offered to a session: the user's global documents and the
 * builtins, minus the builtins the user turned off. Load failures degrade to
 * diagnostics: a malformed document must not cost the session its other
 * delegates, let alone its turn.
 *
 * `builtins` carries every shipped definition that still wins its handle,
 * whether or not it is switched on, so Settings can render an off builtin as a
 * row with its own switch; `definitions` is what `Task` may actually offer.
 */
export async function loadSubagentDefinitions(
  workspaceRoot: string | null | undefined,
  options: LoadSubagentOptions = {},
): Promise<{
  definitions: SubagentDefinition[];
  builtins: SubagentDefinition[];
  diagnostics: string[];
}> {
  const builtin = builtinSubagents();
  const stamped = stampBuiltinModelPins(
    builtin.definitions,
    options.builtinOverlay?.modelPins,
  );
  const dir =
    options.overrideDir ??
    (workspaceRoot ? subagentDefinitionDir(workspaceRoot) : undefined);
  const disk =
    options.userDocuments === undefined && dir
      ? await loadGlobalSubagents(dir)
      : { definitions: [], diagnostics: [] };
  const user = loadUserSubagents(options.userDocuments ?? []);
  const merged = mergeSubagentDefinitions([
    ...disk.definitions,
    ...user.definitions,
    ...stamped.definitions,
  ]);
  const diagnostics = [
    ...disk.diagnostics,
    ...user.diagnostics,
    ...builtin.diagnostics,
    ...stamped.diagnostics,
  ];
  if (merged.dropped.length > 0) {
    diagnostics.push(
      `dropped subagents past the catalog cap: ${merged.dropped.join(", ")}`,
    );
  }
  // A switched-off builtin is excluded from the delegation catalog and from
  // nothing else: a user document of the same name still shadows it, and a
  // handle the user re-enables needs no document of its own to come back.
  const disabled = new Set(options.builtinOverlay?.disabled ?? []);
  const builtins = merged.definitions.filter(
    (definition) => definition.source === "builtin",
  );
  return {
    definitions: merged.definitions.filter(
      (definition) =>
        !(definition.source === "builtin" && disabled.has(definition.name)),
    ),
    builtins,
    diagnostics,
  };
}

/** The stored-provider fields a pin can be resolved against. */
export type SubagentProviderSource = {
  id: string;
  enabled?: boolean;
  headers?: Record<string, string>;
  name: string;
  vendorKey?: string;
  baseUrl?: string;
  defaultModelId?: string;
  authKind?: string;
  apiStyle?: string;
};

/** Loose spelling used when matching a pin against a provider name. */
function providerAlias(value: string): string {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "");
}

/**
 * Match a pin's `providerId` against configured providers.
 *
 * Stored provider ids are UUIDs, so a hand-written definition almost never
 * names one. The vendor key (`anthropic`) and the display name are what a
 * person actually writes, and both are accepted. Vendor or name aliases that
 * match more than one row are not guessed.
 */
export function findSubagentProviderSource<T extends SubagentProviderSource>(
  providerId: string,
  providers: readonly T[],
): T | undefined {
  const alias = providerAlias(providerId);
  const exact = providers.find((provider) => provider.id === providerId);
  if (exact) return exact;
  const vendorMatches = providers.filter(
    (provider) => providerAlias(provider.vendorKey ?? "") === alias,
  );
  if (vendorMatches.length === 1) return vendorMatches[0];
  const nameMatches = providers.filter(
    (provider) => providerAlias(provider.name) === alias,
  );
  return nameMatches.length === 1 ? nameMatches[0] : undefined;
}

/** Why `findSubagentProviderSource` returned nothing: missing vs ambiguous. */
export function subagentProviderLookupError(
  providerId: string,
  providers: readonly Pick<SubagentProviderSource, "id" | "name" | "vendorKey">[],
): string {
  const alias = providerAlias(providerId);
  const vendorMatches = providers.filter(
    (provider) => providerAlias(provider.vendorKey ?? "") === alias,
  );
  const nameMatches = providers.filter(
    (provider) => providerAlias(provider.name) === alias,
  );
  if (vendorMatches.length > 1 || nameMatches.length > 1) {
    return `provider alias "${providerId}" matches multiple accounts; use the exact provider id`;
  }
  return `no provider matches "${providerId}"`;
}

/**
 * Resolve every distinct model pin into a provider binding the sidecar can
 * use, keyed by `subagentModelKey`.
 *
 * A pin that cannot be resolved is deliberately left out of the map instead of
 * falling back to the session provider: a definition that asks for a cheap
 * model must not silently start spending the expensive one. The runtime turns
 * the missing entry into a tool error naming the pin.
 */
export async function resolveSubagentProviders(input: {
  definitions: readonly SubagentDefinition[];
  providers: readonly SubagentProviderSource[];
  getSecret: (providerId: string) => Promise<string | undefined>;
  /** Per-model binding for a vendor-account row, resolved by Electron main. */
  resolveVendorBinding?: (
    provider: SubagentProviderSource,
    modelId: string,
  ) => Promise<VendorModelBinding | undefined>;
  /** Resolve non-OAuth model metadata from Electron's models.dev snapshot. */
  resolveModel?: (
    provider: SubagentProviderSource,
    modelId: string,
  ) => Promise<{ modelConfig: ModelConfig; capabilities: ThinkingCapabilitySet } | undefined>;
}): Promise<{
  providers: Record<string, RuntimeProviderConfig>;
  diagnostics: string[];
}> {
  const resolved: Record<string, RuntimeProviderConfig> = {};
  const diagnostics: string[] = [];
  const allowed = subagentPinnedProviders(input.definitions);
  const secrets = new Map<string, string | undefined>();

  const pins = input.definitions.flatMap((definition) =>
    [definition.model, ...(definition.fallbackModels ?? [])]
      .flatMap((pin) => pin ? [{ name: definition.name, pin }] : []),
  );
  for (const { name, pin } of pins) {
    const key = subagentModelKey(pin);
    if (resolved[key]) continue;
    if (!allowed.includes(pin.providerId)) {
      diagnostics.push(
        `${name}: too many pinned providers, ignoring "${key}"`,
      );
      continue;
    }
    const provider = findSubagentProviderSource(pin.providerId, input.providers);
    if (!provider || provider.enabled === false) {
      diagnostics.push(
        `${name}: no enabled provider matches "${pin.providerId}"`,
      );
      continue;
    }
    const isVendorAccount = provider.authKind === OAUTH_AUTH_KIND;
    if (!isVendorAccount && !secrets.has(provider.id)) {
      try {
        secrets.set(provider.id, await input.getSecret(provider.id));
      } catch {
        secrets.set(provider.id, undefined);
      }
    }
    const apiKey = secrets.get(provider.id) ?? "";
    if (!apiKey && !isVendorAccount && provider.authKind !== "none") {
      diagnostics.push(`${name}: provider "${provider.name}" has no API key`);
      continue;
    }
    // A vendor account resolves the pinned model against the signed-in
    // catalog: one account can span wire APIs, and a gateway's model list
    // does not exist in the builtin one at all.
    let binding: VendorModelBinding | undefined;
    if (isVendorAccount) {
      try {
        binding = await input.resolveVendorBinding?.(provider, pin.modelId);
      } catch {
        binding = undefined;
      }
      if (!binding) {
        diagnostics.push(
          `${name}: vendor account "${provider.name}" does not offer "${pin.modelId}"`,
        );
        continue;
      }
    }
    const resolvedModel = !isVendorAccount
      ? await input.resolveModel?.(provider, pin.modelId)
      : undefined;
    const modelConfig =
      binding?.modelConfig ??
      resolvedModel?.modelConfig ??
      genericModelConfig(pin.modelId, binding?.baseUrl ?? provider.baseUrl ?? "");
    const capabilities = binding ??
      resolvedModel?.capabilities ??
      capabilitiesFromModelConfig(modelConfig);
    const apiStyle = binding?.apiStyle ?? provider.apiStyle;
    resolved[key] = {
      id: provider.id,
      name: provider.name,
      ...(provider.vendorKey ? { vendorKey: provider.vendorKey } : {}),
      ...(provider.headers ? { headers: { ...provider.headers } } : {}),
      ...(binding?.baseUrl ?? provider.baseUrl
        ? { baseUrl: binding?.baseUrl ?? provider.baseUrl }
        : {}),
      modelId: pin.modelId,
      apiKey,
      ...(provider.authKind ? { authKind: provider.authKind } : {}),
      ...(apiStyle ? { apiStyle } : {}),
      supportsReasoning: capabilities.supportsReasoning,
      supportedThinkingLevels: [...capabilities.supportedThinkingLevels],
      ...(modelConfig ? { modelConfig } : {}),
    };
  }
  return { providers: resolved, diagnostics };
}
