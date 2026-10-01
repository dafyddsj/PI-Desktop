/**
 * The vendor account's "Extended context" switch.
 *
 * Some deployments run a model at a default window and accept a larger one on
 * request (a ChatGPT/Codex account: 272K by default, up to 872K). The switch
 * is stored on each of the account's model bindings as `extendedContext`, so
 * the shared limits resolver can apply it per model without a provider-level
 * column; the window itself is resolved in Electron main from the account's
 * own list, so it follows the deployment instead of freezing a number here.
 */
import type { ModelBinding, ModelInfo } from "@pi-desktop/shared";

/** Whether a model runs below the most its deployment accepts. */
export function canExtendContext(
  model: Pick<ModelInfo, "contextWindow" | "maxContextWindow">,
): boolean {
  const max = model.maxContextWindow ?? 0;
  return max > 0 && max > (model.contextWindow ?? 0);
}

/**
 * Show the switch when a listed model can run larger, or when it is already
 * on: an extended model reports its window at the maximum, so the first test
 * alone would hide the switch that turned it on.
 */
export function accountOffersExtendedContext(
  models: ReadonlyArray<Pick<ModelInfo, "contextWindow" | "maxContextWindow">>,
  bindings: ReadonlyArray<Pick<ModelBinding, "extendedContext">>,
): boolean {
  return (
    models.some(canExtendContext) ||
    bindings.some((binding) => binding.extendedContext === true)
  );
}

/** The switch reads on when every chosen model runs extended. */
export function extendedContextEnabled(
  bindings: ReadonlyArray<Pick<ModelBinding, "extendedContext">>,
): boolean {
  return bindings.length > 0 &&
    bindings.every((binding) => binding.extendedContext === true);
}

/**
 * Stamp the switch onto every binding the account saves, including a model
 * chosen after it was turned on. Off removes the marker rather than storing
 * `false`, so an unset choice stays absent.
 */
export function withExtendedContext(
  bindings: readonly ModelBinding[],
  enabled: boolean,
): ModelBinding[] {
  return bindings.map((binding) => {
    if (enabled) {
      return binding.extendedContext === true
        ? binding
        : { ...binding, extendedContext: true };
    }
    if (binding.extendedContext === undefined) return binding;
    const { extendedContext: _extended, ...rest } = binding;
    return rest;
  });
}
