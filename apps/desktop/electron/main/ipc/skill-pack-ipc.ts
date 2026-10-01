import { ErrorCodes, IPC, type SkillPackState } from "@pi-desktop/shared";
import type { SkillPackService } from "../skill-pack/service";
import type { IpcRegistrar } from "./types";

export type SkillPackIpcDependencies = {
  registrar: IpcRegistrar;
  skillPack: Pick<SkillPackService, "getState" | "check" | "install" | "revert" | "setBeta">;
  sendToRenderer: (channel: string, payload?: unknown) => void;
};

/** Register the built-in skill pack's status, check, install, and channel channels. */
export function registerSkillPackIpc({
  registrar,
  skillPack,
  sendToRenderer,
}: SkillPackIpcDependencies): void {
  // Installing or reverting changes the skill catalog; the skill lists and the
  // composer's skill commands follow the same event a user skill edit sends.
  const announceCatalog = (state: SkillPackState) => {
    sendToRenderer(IPC.event.pluginChanged, { reason: "skill" });
    return state;
  };

  registrar.handle(IPC.invoke.skillPackGetState, () => skillPack.getState());
  registrar.handle(IPC.invoke.skillPackCheck, () => skillPack.check(false));
  registrar.handle(IPC.invoke.skillPackInstall, async () => announceCatalog(await skillPack.install()));
  registrar.handle(IPC.invoke.skillPackRevert, async () => announceCatalog(await skillPack.revert()));
  registrar.handle(IPC.invoke.skillPackSetBeta, async (enabled: unknown) => {
    if (typeof enabled !== "boolean") {
      throw Object.assign(new Error("beta must be a boolean"), {
        errorCode: ErrorCodes.INVALID_ARGUMENT,
      });
    }
    return skillPack.setBeta(enabled);
  });
}
