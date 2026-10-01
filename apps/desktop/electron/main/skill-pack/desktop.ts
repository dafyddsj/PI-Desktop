/**
 * Electron wiring for the skill pack service: the network client that fetches
 * updates, and the settings it persists through host-core.
 */
import { net, session } from "electron";
import type { HostProcess } from "../host-process";
import type { Logger } from "../logger";
import { relaxedNetworkPolicyEnabled } from "../endpoint-policy";
import { createPublicHttpsClient } from "../public-https-fetch";
import { configureSkillPackDownloads, skillPackStore } from "./active-store.ts";
import { createSkillPackService } from "./service.ts";

export function createDesktopSkillPackService(options: {
  devBuild: boolean;
  /** App data directory; downloaded copies live under it. */
  dataDir: string;
  getHost: () => HostProcess | null;
  send: (channel: string, payload: unknown) => void;
  logger: Pick<Logger, "app">;
}) {
  configureSkillPackDownloads(options.dataDir);
  // Every URL the pack fetches is chosen by the app, so every hop is judged by
  // the third-party (public-only) policy.
  const client = createPublicHttpsClient({
    fetchImpl: (url, init) => net.fetch(url, init),
    routeImpl: (url) => session.defaultSession.resolveProxy(url),
    allowFakeIp: () => relaxedNetworkPolicyEnabled(),
  });
  const host = () => {
    const current = options.getHost();
    if (!current?.isAvailable()) throw new Error("host unavailable");
    return current;
  };
  return createSkillPackService({
    store: skillPackStore,
    request: client.request,
    devBuild: options.devBuild,
    readSettings: async () =>
      host().call<{ skillPackBeta?: boolean; skillPackLastNotifiedSha?: string }>("settings.get"),
    writeSettings: async (patch) => {
      await host().call("settings.set", patch);
    },
    send: options.send,
    log: (level, message, data) => options.logger.app("plugin", level, message, { data }),
  });
}
