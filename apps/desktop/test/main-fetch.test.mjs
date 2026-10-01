import assert from "node:assert/strict";
import test from "node:test";
import { NODE_FETCH_USER_AGENT, withNodeFetchUserAgent } from "../electron/main/main-fetch.ts";

function recorder() {
  const calls = [];
  const fetchImpl = withNodeFetchUserAgent(async (input, init) => {
    calls.push({ input, init });
    return new Response("ok");
  });
  return { calls, fetchImpl };
}

const userAgentOf = (init) => new Headers(init?.headers).get("user-agent");

test("requests without a User-Agent get Node's default instead of Chromium's", async () => {
  const { calls, fetchImpl } = recorder();
  await fetchImpl("https://platform.claude.com/v1/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: "{}",
  });
  const [{ init }] = calls;
  assert.equal(userAgentOf(init), NODE_FETCH_USER_AGENT);
  assert.equal(new Headers(init.headers).get("content-type"), "application/json");
  assert.equal(new Headers(init.headers).get("accept"), "application/json");
  assert.equal(init.method, "POST");
  assert.equal(init.body, "{}");
});

test("a caller's own User-Agent is left alone in any header shape", async () => {
  const { calls, fetchImpl } = recorder();
  const shapes = [
    { "User-Agent": "claude-cli/2.1.251" },
    [["user-agent", "claude-cli/2.1.251"]],
    new Headers({ "user-agent": "claude-cli/2.1.251" }),
  ];
  for (const headers of shapes) {
    const init = { headers };
    await fetchImpl("https://example.test/", init);
    assert.equal(calls.at(-1).init, init);
  }
});

test("a Request's own headers are kept and its User-Agent respected", async () => {
  const { calls, fetchImpl } = recorder();
  await fetchImpl(new Request("https://example.test/", { headers: { "X-Fixture": "1" } }));
  assert.equal(userAgentOf(calls[0].init), NODE_FETCH_USER_AGENT);
  assert.equal(new Headers(calls[0].init.headers).get("x-fixture"), "1");

  await fetchImpl(new Request("https://example.test/", { headers: { "User-Agent": "custom" } }));
  assert.equal(calls[1].init, undefined);
});
