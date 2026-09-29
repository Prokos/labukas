import test from "node:test";
import assert from "node:assert/strict";
import {
  emptyProgress,
  mergeProgress,
  decodeBackup,
  readDeviceRecords,
  encodeRecords,
  decodeRecords,
} from "../src/progress/model.js";
import { planSync } from "../src/progress/cloud.js";
import { createCourseRuntime } from "../src/learning/session.js";
const event = {
  id: "answer",
  at: 1,
  type: "answer",
  outcome: "spelling",
  correctness: true,
  spellingCorrect: false,
  independentRecall: false,
  requestedHelp: ["hint"],
};
const state = (events = []) => ({
  version: 1,
  events,
  completed: [],
  run: null,
});
const profile = (s) => ({ ...emptyProgress(), courses: { "chapter-2": s } });
test("backup and sync preserve immutable spelling and support evidence", () => {
  const a = profile({ ...state([event]), completed: ["one"] }),
    b = profile({
      ...state([{ id: "next", at: 2, type: "complete", lesson: "two" }]),
      completed: ["two"],
    });
  const merged = mergeProgress(a, b);
  assert.deepEqual(merged.courses["chapter-2"].events[0], event);
  assert.deepEqual(merged.courses["chapter-2"].completed, ["one", "two"]);
  assert.deepEqual(decodeRecords(encodeRecords(merged)), merged);
  assert.deepEqual(decodeBackup(JSON.parse(JSON.stringify(merged))), merged);
  assert.deepEqual(
    planSync(a, b).pending.map((r) => r.id),
    ["answer"],
  );
  assert.throws(
    () =>
      mergeProgress(a, profile(state([{ ...event, independentRecall: true }]))),
    /Conflicting/,
  );
  for (const bad of [
    null,
    {},
    [],
    { version: 1, courses: {}, events: [{ id: "bad" }] },
  ])
    assert.throws(() => decodeBackup(bad));
});
test("device records retain events and active drafts across record versions", () => {
  const entries = {
    "sakyk.opening-sequence.v3": JSON.stringify({
      ...state([event]),
      version: 3,
      completed: ["first-words"],
    }),
    "sakyk.authored.chapter-1.v1": JSON.stringify(state()),
  };
  const storage = {
    length: 2,
    key: (i) => Object.keys(entries)[i],
    getItem: (k) => entries[k],
  };
  const result = readDeviceRecords(storage);
  assert.deepEqual(result.courses["chapter-1"].events, [event]);
  assert.deepEqual(result.courses["chapter-1"].completed, ["first-words"]);
  assert.equal(result.courses["chapter-1"].version, 1);
  assert.deepEqual(
    decodeBackup({
      events: [],
      authored: {
        "sakyk.opening-sequence.v3": JSON.parse(
          entries["sakyk.opening-sequence.v3"],
        ),
      },
    }).courses["chapter-1"].events,
    [event],
  );
});
test("immutable completion records recover completion across snapshot races", () => {
  const records = [
    {
      id: "finish",
      course: "chapter-2",
      event: { id: "finish", at: 2, type: "complete", lesson: "two" },
    },
    {
      id: "practice",
      course: "chapter-2",
      event: {
        id: "practice",
        at: 3,
        type: "complete",
        lesson: "practice",
        review: true,
      },
    },
  ];
  const result = decodeRecords({
    records,
    states: [{ key: "chapter-2", value: state() }],
  });
  assert.deepEqual(result.courses["chapter-2"].completed, ["two"]);
});
test("saved queues resume independently of the current lesson catalog", () => {
  const q = {
    id: "word",
    kind: "type",
    target: "word",
    source: "coffee",
    answers: ["kava"],
    instruction: "Write in Lithuanian.",
  };
  const initial = createCourseRuntime({
    version: 1,
    lessons: [
      { id: "saved", title: "Coffee", goal: "Order coffee", steps: [q] },
    ],
  });
  let s = initial.advance(
    initial.startLesson(initial.createState(), "saved", 1, 0),
    2,
  );
  s.run.answer = "ka";
  s.run.help = ["hint"];
  const draft = structuredClone(s.run);
  const r = createCourseRuntime({
    version: 1,
    allowDirectEntry: true,
    lessons: [
      {
        id: "current",
        title: "Tea",
        steps: [{ ...q, id: "tea", answers: ["arbata"] }],
      },
    ],
  });
  s = r.startLesson(s, "current", 3);
  assert.deepEqual(s.suspended.saved, draft);
  s = r.startLesson(JSON.parse(JSON.stringify(s)), "saved", 4);
  assert.equal(s.run.answer, "ka");
  assert.deepEqual(s.run.help, ["hint"]);
  assert.equal(s.run.lessonTitle, "Coffee");
  assert.deepEqual(s.completed, []);
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

test("storage round trips preserve the order of answers sharing a timestamp", () => {
  const first = { ...event, id: "z", outcome: "incorrect" },
    second = { ...event, id: "a", outcome: "correct" };
  const progress = profile(state([first, second]));
  const data = encodeRecords(progress);
  data.records.reverse();
  assert.deepEqual(decodeRecords(data).courses["chapter-2"].events, [
    first,
    second,
  ]);
});
