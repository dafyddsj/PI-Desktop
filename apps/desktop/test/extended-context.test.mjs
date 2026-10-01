import assert from "node:assert/strict";
import test from "node:test";
import {
  accountOffersExtendedContext,
  canExtendContext,
  extendedContextEnabled,
  withExtendedContext,
} from "../src/components/settings/extended-context.ts";

const binding = (id, extra = {}) => ({
  id,
  contextWindow: 272_000,
  contextWindowSource: "catalog",
  maxTokens: 128_000,
  thinkingLevels: [],
  ...extra,
});

test("a model can extend only when its deployment accepts more", () => {
  assert.equal(canExtendContext({ contextWindow: 272_000, maxContextWindow: 872_000 }), true);
  assert.equal(canExtendContext({ contextWindow: 272_000, maxContextWindow: 272_000 }), false);
  assert.equal(canExtendContext({ contextWindow: 272_000 }), false);
});

test("the switch shows for an extendable model, and stays once it is on", () => {
  const listed = [
    { contextWindow: 272_000, maxContextWindow: 272_000 },
    { contextWindow: 272_000, maxContextWindow: 872_000 },
  ];
  assert.equal(accountOffersExtendedContext(listed, []), true);
  // Once on, the model reports its window at the maximum.
  const atMax = [{ contextWindow: 872_000, maxContextWindow: 872_000 }];
  assert.equal(accountOffersExtendedContext(atMax, []), false);
  assert.equal(
    accountOffersExtendedContext(atMax, [binding("gpt-5.6-sol", { extendedContext: true })]),
    true,
  );
});

test("the switch reads on only when every chosen model runs extended", () => {
  assert.equal(extendedContextEnabled([]), false);
  assert.equal(
    extendedContextEnabled([binding("a", { extendedContext: true }), binding("b")]),
    false,
  );
  assert.equal(
    extendedContextEnabled([
      binding("a", { extendedContext: true }),
      binding("b", { extendedContext: true }),
    ]),
    true,
  );
});

test("saving stamps every model on, and removes the marker when off", () => {
  const on = withExtendedContext([binding("a"), binding("b", { extendedContext: true })], true);
  assert.deepEqual(on.map((item) => item.extendedContext), [true, true]);
  // A hand-entered window is kept; the resolver lets it win.
  const user = binding("c", { contextWindow: 400_000, contextWindowSource: "user" });
  assert.equal(withExtendedContext([user], true)[0].contextWindow, 400_000);

  const off = withExtendedContext(on, false);
  assert.ok(off.every((item) => !("extendedContext" in item)));
  const untouched = binding("d");
  assert.equal(withExtendedContext([untouched], false)[0], untouched);
});
