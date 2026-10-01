import { useEffect, useState } from "react";
import type { SkillPackState } from "@pi-desktop/shared";
import { api } from "../lib/api";

/**
 * Live view of the built-in skill pack: seeds from the main process snapshot,
 * then follows `skillPackState` push events. Null until the bridge answers.
 */
export function useSkillPackState(): SkillPackState | null {
  const [state, setState] = useState<SkillPackState | null>(null);

  useEffect(() => {
    let mounted = true;
    api
      .skillPackGetState()
      .then((snapshot) => {
        if (mounted) setState((current) => current ?? snapshot);
      })
      .catch(() => undefined);
    const off = api.onSkillPackState((next) => setState(next));
    return () => {
      mounted = false;
      off();
    };
  }, []);

  return state;
}
