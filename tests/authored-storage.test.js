import test from "node:test";
import assert from "node:assert/strict";
import {
  mergeAuthored,
  collectAuthored,
  prepareAuthoredImport,
} from "../src/authored-storage.js";
import { createCourseRuntime } from "../src/authored-course.js";
const state = (events = []) => ({
  version: 1,
  events,
  completed: [],
  run: null,
});
const storage = (entries) => ({
  length: Object.keys(entries).length,
  key: (i) => Object.keys(entries)[i],
  getItem: (k) => entries[k] || null,
});
test("backup preserves spelling/support evidence and immutable events across merges", () => {
  const e = {
    id: "answer",
    at: 1,
    type: "answer",
    outcome: "spelling",
    correctness: true,
    spellingCorrect: false,
    independentRecall: false,
    requestedHelp: ["hint"],
  };
  const a = { ...state([e]), completed: ["one"] },
    b = {
      ...state([{ id: "next", at: 2, type: "complete" }]),
      completed: ["two"],
    };
  const key = "sakyk.authored.chapter-3.v1",
    store = storage({ [key]: JSON.stringify(a) });
  assert.deepEqual(collectAuthored(store)[key], a);
  const merged = prepareAuthoredImport({ [key]: b }, store)[key];
  assert.deepEqual(merged.events[0], e);
  assert.deepEqual(merged.completed, ["one", "two"]);
  assert.throws(
    () => mergeAuthored(a, state([{ ...e, independentRecall: true }])),
    /Conflicting/,
  );
  assert.throws(
    () => prepareAuthoredImport({ "labukas.progress.v1": b }, store),
    /Unknown/,
  );
});
test("cross-chapter evidence uses shared target and mode without copying or regrading history", () => {
  const task = {
    id: "later",
    target: "word",
    reviewKey: "word:form",
    kind: "gap-type",
    ability: "form-recall",
    source: "___",
    answers: ["kavos"],
  };
  const first = {
    id: "e1",
    at: new Date(2026, 8, 20, 10).getTime(),
    type: "answer",
    step: "earlier",
    target: "word",
    reviewKey: "word:form",
    responseMode: "gap-type",
    correctness: true,
    outcome: "correct",
    independentRecall: true,
  };
  const r = createCourseRuntime({
    version: 1,
    lessons: [{ id: "l", steps: [task] }],
    historyEvents: () => [first],
  });
  const next = { ...first, id: "e2", step: "later", at: first.at + 86400000 };
  const current = state([next]);
  assert.equal(r.learningEvidence(current)[0].label, "Remembered later");
  assert.deepEqual(current.events, [next]);
  assert.equal(
    r.learningEvidence(
      state([{ ...next, requestedHelp: ["reveal"], independentRecall: false }]),
    )[0].needsSupport,
    true,
  );
});

test("word-bank help in an earlier chapter remains supported evidence", () => {
  const e = {
    id: "help",
    at: 1,
    type: "answer",
    step: "earlier",
    reviewKey: "same",
    target: "same",
    responseMode: "word-bank",
    outcome: "correct",
    correctness: true,
    requestedHelp: ["words"],
    independentRecall: false,
  };
  const q = {
    id: "later",
    target: "same",
    reviewKey: "same",
    kind: "gap-type",
    answers: ["kavos"],
  };
  const r = createCourseRuntime({
    version: 1,
    lessons: [{ id: "l", steps: [q] }],
    historyEvents: () => [e],
  });
  const row = r.learningEvidence(state())[0];
  assert.equal(row.needsSupport, true);
  assert.equal(row.independentRun, 0);
  assert.equal(row.recallVisits, 0);
});
