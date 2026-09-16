import test from "node:test";
import assert from "node:assert/strict";
import { exerciseHint } from "../src/exercise-hints.js";
import { exerciseFor, isCorrect } from "../src/engine.js";
import { items } from "../src/curriculum.js";

test("Ačiū recognition hints remove distractors, never the English answer", () => {
  const item = items.find((i) => i.lt === "Ačiū");
  const ex = exerciseFor(item, { level: 0 });
  assert.equal(ex.reverse, true);
  let state = {};
  for (let i = 0; i < ex.options.length - 1; i++) {
    const hint = exerciseHint(ex, state);
    assert.equal(hint.eliminated.length, i + 1);
    assert.ok(hint.eliminated.every((option) => !isCorrect(option, ex)));
    state = hint;
  }
  assert.equal(exerciseHint(ex, state), null);
  assert.deepEqual(
    ex.options.filter((o) => !state.eliminated.includes(o)),
    ["Thank you"],
  );
});

test("spelling hints reveal Lithuanian letters progressively, without changing the draft", () => {
  const ex = { type: "type", answer: "Ac\u030ciu\u0304" };
  const first = exerciseHint(ex, { answer: "my draft" });
  assert.equal(first.spelling, "A___");
  assert.equal("answer" in first, false);
  assert.equal(exerciseHint(ex, first).spelling, "Ač__");
  assert.equal(exerciseHint(ex, { revealed: 3 }).spelling, "Ačiū");
  assert.equal(exerciseHint(ex, { revealed: 4 }), null);
  assert.equal(
    exerciseHint({ type: "cloze", answer: "kavos" }).spelling,
    "k____",
  );
  assert.equal(
    exerciseHint({ type: "type", answer: "Laba diena!" }, { revealed: 3 })
      .spelling,
    "Laba _____!",
  );
});

test("word hints keep a correct prefix, repair mistakes and handle repeated words", () => {
  const answerTokens = ["ir", "tu", "ir", "aš"].map((text, id) => ({
    text,
    id,
  }));
  const distractor = { text: "jis", id: 4 };
  const ex = {
    type: "order",
    answerTokens,
    tokens: [distractor, ...answerTokens].reverse(),
  };
  let state = { selected: [answerTokens[2], distractor, answerTokens[1]] };
  state = exerciseHint(ex, state);
  assert.deepEqual(
    state.selected.map((t) => t.text),
    ["ir", "tu"],
  );
  assert.equal(state.selected[0].id, 2);
  state = exerciseHint(ex, state);
  assert.deepEqual(
    state.selected.map((t) => t.text),
    ["ir", "tu", "ir"],
  );
  assert.equal(new Set(state.selected.map((t) => t.id)).size, 3);
  state = exerciseHint(ex, state);
  assert.equal(exerciseHint(ex, state), null);
  assert.deepEqual(
    exerciseHint(ex, { selected: [...state.selected, distractor] }).selected,
    state.selected,
  );
});

test("matching help completes the pending pair from either column, then only unmatched pairs", () => {
  const ex = {
    type: "match",
    pairs: [
      { id: "a", lt: "Labas", en: "Hello" },
      { id: "b", lt: "Ačiū", en: "Thank you" },
    ],
  };
  for (const side of ["left", "right"]) {
    const first = exerciseHint(ex, { pendingMatch: { side, id: "b" } });
    assert.deepEqual(first.matched, ["b"]);
    assert.equal(first.message, "Ačiū — Thank you");
    const last = exerciseHint(ex, first);
    assert.deepEqual(last.matched, ["b", "a"]);
    assert.equal(exerciseHint(ex, last), null);
  }
  assert.equal(exerciseHint({ type: "writing" }), null);
});
