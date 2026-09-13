import test from "node:test";
import assert from "node:assert/strict";
import { planSync } from "../src/cloud.js";
import { items } from "../src/curriculum.js";

const answer = (id, at) => ({
  id,
  at,
  type: "answer",
  item: items[0].id,
  correct: true,
});

test("cloud sync uploads only local events missing from the database", () => {
  const shared = answer("shared", 1);
  const localOnly = answer("local", 3);
  const cloudOnly = answer("cloud", 2);
  const result = planSync(
    { version: 1, events: [shared, localOnly] },
    { version: 1, events: [shared, cloudOnly] },
  );

  assert.deepEqual(result.pending, [localOnly]);
  assert.deepEqual(
    result.merged.events.map((event) => event.id),
    ["shared", "cloud", "local"],
  );
});

test("cloud sync rejects malformed database events", () => {
  assert.throws(
    () =>
      planSync(
        { version: 1, events: [] },
        { version: 1, events: [{ id: "bad" }] },
      ),
    /invalid events/,
  );
});
