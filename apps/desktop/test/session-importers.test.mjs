import assert from "node:assert/strict";
import { register } from "node:module";
import test from "node:test";
register(new URL("./helpers/ts-import-hooks.mjs", import.meta.url));
const { convertSession } = await import("../electron/main/importers/index.ts");

// The pi CLI session importer was removed; a stale or forged "pi"
// candidate must not reach any converter.
test("session import rejects the removed pi CLI source", async () => {
  await assert.rejects(
    convertSession({
      source: "pi",
      externalId: "pi-session",
      title: "Session",
      projectPath: null,
      model: null,
      createdAt: "2026-09-30T00:00:00.000Z",
      updatedAt: "2026-09-30T00:00:00.000Z",
      messageCount: 1,
      filePath: "/nonexistent/session.jsonl",
    }),
    /unknown import source: pi/,
  );
});
