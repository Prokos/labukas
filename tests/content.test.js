import test from "node:test";
import assert from "node:assert/strict";
import {
  items,
  lessons,
  courseSteps,
  extraSteps,
  legacyCheckpoints,
  classSteps,
} from "../src/curriculum.js";
import { objectives } from "../src/content/objectives.js";
import { vocabulary } from "../src/content/vocabulary.js";
import { nounForms, pluralForms, alphabet } from "../src/content/reference.js";
import {
  emptyProgress,
  sessionItems,
  exerciseFor,
  validateProgress,
  stats,
  sessionOutcome,
} from "../src/engine.js";

test("Every mapped course objective resolves to a taught class; curated vocabulary is present", () => {
  for (const [chapter, label, ids] of objectives)
    for (const id of ids)
      assert.ok(
        lessons.some((l) => l.id === id && l.chapter === chapter - 1),
        label + " " + id,
      );
  for (const [, , title, raw] of vocabulary)
    for (const row of raw.split(";")) {
      const [lt, en] = row.trim().split("|");
      assert.ok(
        items.some(
          (i) => i.lt.toLowerCase() === lt.toLowerCase() && i.en === en,
        ),
        title + ": " + lt,
      );
    }
  for (let chapter = 0; chapter < 10; chapter++) {
    assert.ok(
      lessons.filter((l) => l.chapter === chapter && l.kind === "reading")
        .length >= 2,
    );
    assert.equal(
      lessons.filter((l) => l.chapter === chapter && l.kind === "writing")
        .length,
      1,
    );
  }
  assert.equal(alphabet.length, 32);
  for (const row of [...nounForms, ...pluralForms]) assert.equal(row.length, 7);
});
test("Reading questions keep their text and authored distractors through independent recall", () => {
  for (const item of items.filter((i) => i.activity === "reading")) {
    for (let level = 0; level <= 5; level++) {
      const ex = exerciseFor(item, { level });
      assert.equal(ex.prompt, item.question);
      assert.equal(ex.passage, item.passage);
      assert.equal(ex.answer, item.lt);
      assert.equal(ex.reverse, false);
      assert.equal(ex.type, level < 3 ? "choice" : "type");
      assert.equal(new Set(ex.options).size, ex.options.length);
    }
  }
});
test("Checkpoint retakes rotate candidates and remain short", () => {
  const step = courseSteps.find((s) => s.phase === "checkpoint");
  const initial = sessionItems(emptyProgress(), step);
  assert.ok(initial.length <= 8);
  const progress = {
    version: 1,
    events: initial.map((i, n) => ({
      id: `check-${n}`,
      type: "answer",
      item: i.id,
      correct: true,
      stage: 5,
      step: step.id,
      at: n,
    })),
  };
  const next = sessionItems(progress, step);
  assert.ok(next.every((i) => !initial.some((old) => old.id === i.id)));
  const outcome = sessionOutcome(
    step,
    initial.map((i, n) => ({
      item: i.id,
      stage: 5,
      targetStage: 5,
      correct: n > 2,
    })),
  );
  assert.equal(outcome.passed, false);
  const failedPass = {
    id: "review-pass",
    type: "lessonPass",
    step: step.id,
    lesson: step.classId,
    at: 100,
    ...outcome,
  };
  assert.doesNotThrow(() =>
    validateProgress({ version: 1, events: [...progress.events, failedPass] }),
  );
});
test("Historical checks remain readable without crediting expanded assessment", () => {
  for (const old of legacyCheckpoints) {
    const p = {
      version: 1,
      events: [
        {
          id: old.id,
          type: "lessonPass",
          lesson: old.classId,
          step: old.id,
          at: 1,
        },
      ],
    };
    assert.doesNotThrow(() => validateProgress(p));
    assert.ok(
      courseSteps
        .filter((s) => s.chapter === old.chapter && s.phase === "checkpoint")
        .every((s) => !stats(p).passedSteps.has(s.id)),
    );
  }
  assert.ok(extraSteps.length > 0);
  for (const l of lessons.filter((l) => l.optional)) {
    assert.ok(classSteps(l.id).length > 0);
    assert.ok(!courseSteps.some((s) => s.classId === l.id));
    const step = classSteps(l.id)[0];
    assert.doesNotThrow(() =>
      validateProgress({
        version: 1,
        events: [
          {
            id: step.id,
            type: "lessonPass",
            lesson: l.id,
            step: step.id,
            at: 1,
          },
        ],
      }),
    );
  }
});
test("Self-reviewed drafts merge into progress without word mastery", () => {
  const item = items.find((i) => i.activity === "writing");
  const e = {
    id: "draft",
    type: "answer",
    item: item.id,
    correct: true,
    stage: 0,
    at: 1,
    selfAssessed: true,
    draft: "Labas! Mano vardas Lina.",
  };
  const p = { version: 1, events: [e] };
  assert.doesNotThrow(() => validateProgress(p));
  assert.equal(stats(p).records[item.id], undefined);
  assert.throws(() =>
    validateProgress({
      version: 1,
      events: [{ ...e, draft: "x".repeat(5001) }],
    }),
  );
  assert.throws(() =>
    validateProgress({
      version: 1,
      events: [{ ...e, item: items.find((i) => !i.activity).id }],
    }),
  );
});
test("New contexts do not silently reuse already-passed application steps", () => {
  for (const l of lessons.filter((l) => l.items.some((i) => i.extension))) {
    assert.ok(
      classSteps(l.id)
        .find((s) => s.id === `${l.id}-apply-1`)
        .items.every((i) => i.extension),
    );
    assert.ok(
      classSteps(l.id)
        .find((s) => s.id === `${l.id}-apply-0`)
        .items.every((i) => !i.extension),
    );
  }
});
