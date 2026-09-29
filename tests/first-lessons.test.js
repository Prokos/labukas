import test from "node:test";
import assert from "node:assert/strict";
import { course as courseByNumber } from "./helpers.js";
import { createCourseRuntime } from "../src/learning/session.js";
const openingCourse = {
  ...courseByNumber(1),
  lessons: courseByNumber(1).lessons.slice(0, 4),
  allowDirectEntry: false,
};
const openingLessons = openingCourse.lessons;
const finalSteps = (variant) =>
  openingCourse.stepsFor(openingLessons[3], variant);
const openingSteps = openingLessons.flatMap((l) => l.steps);
const {
  createState,
  startLesson,
  submitAnswer,
  advance,
  requestHelp,
  matchPair,
  gradeAnswer,
} = createCourseRuntime(openingCourse);
const step = (id) => openingSteps.find((s) => s.id === id);
const started = (lesson = "first-words") => {
  const i = openingLessons.findIndex((l) => l.id === lesson);
  return advance(
    startLesson(
      {
        ...createState(),
        completed: openingLessons.slice(0, i).map((l) => l.id),
      },
      lesson,
      1,
      0,
    ),
    2,
  );
};
const at = (id) => {
  const l = openingLessons.find((l) =>
    (l.steps.length ? l.steps : finalSteps(0)).some((s) => s.id === id),
  );
  const s = started(l.id);
  s.run.index = s.run.queue.findIndex((q) => q.id === id);
  return s;
};
function respond(s, answer) {
  return submitAnswer({ ...s, run: { ...s.run, answer } }, 10);
}

test("connected lessons have prepared retrieval, grammar contrast and cumulative use", () => {
  assert.equal(openingLessons.length, 4);
  assert.equal(
    openingLessons[0].steps.some(
      (q) => q.kind === "type" || q.kind === "gap-type",
    ),
    false,
  );
  assert.equal(step("thanks-recall").kind, "type");
  assert.ok(
    openingSteps.indexOf(step("thanks-recall")) >
      openingSteps.indexOf(step("thanks-choice")) + 8,
  );
  assert.ok(
    openingSteps.indexOf(step("reply-recall")) >
      openingSteps.indexOf(step("reply-model")) + 20,
  );
  assert.ok(
    openingSteps.indexOf(step("i-form-recall")) >
      openingSteps.indexOf(step("person-model")) + 5,
  );
  assert.ok(
    [
      "gap",
      "gap-type",
      "edit",
      "match",
      "chat",
      "chat-bank",
      "reading",
      "bank",
    ].every((kind) => openingSteps.some((s) => s.kind === kind)),
  );
  assert.equal(
    openingSteps.some((s) => /copy/i.test(s.instruction || "")),
    false,
  );
  assert.equal(
    new Set(openingSteps.map((s) => s.id)).size,
    openingSteps.length,
  );
  for (const q of openingSteps.filter(
    (s) => s.kind !== "model" && s.kind !== "match",
  )) {
    assert.ok(q.correction, q.id);
    if (q.hint !== undefined) assert.ok(q.hint.trim(), q.id);
    assert.ok(q.answers.length, q.id);
    for (const a of q.answers)
      assert.equal(
        gradeAnswer(q, a, { editIndex: q.editIndex }).status,
        "correct",
        q.id,
      );
  }
});

test("grading accepts independent alternatives and diagnoses actual errors concisely", () => {
  for (const [id, a, status] of [
    ["thanks-recall", " ACIU! ", "spelling"],
    ["thanks-recall", "Ačiu", "spelling"],
    ["thanks-recall", "Ačiū", "correct"],
    ["reply-recall", "Prasom", "spelling"],
    ["reply-recall", "Nera už ką", "spelling"],
    ["thanks-recall", "De\u0307kui.", "correct"],
    ["reply-recall", "Nėra už ką.", "correct"],
    ["reply-recall", "Praš", "incorrect"],
    ["reply-recall", "Pras", "incorrect"],
    ["reply-recall", "Labas!", "incorrect"],
    ["reply-recall", "Mano atsakymas", "unassessed"],
    ["i-form-recall", "ESU.", "correct"],
    ["i-form-recall", "esi", "incorrect"],
    ["you-form-recall", "esu", "incorrect"],
    ["you-form-recall", "esi", "correct"],
    ["i-bank", "Esu Tomas.", "correct"],
    ["name-bank", "Tomas mano vardas.", "correct"],
    ["name-bank", "vardas Tomas Mano", "incorrect"],
  ])
    assert.equal(gradeAnswer(step(id), a).status, status, `${id}: ${a}`);
  const { assessment, ...partialFeedback } = gradeAnswer(
    step("reply-recall"),
    "Praš",
  );
  assert.equal(assessment.reason, "incomplete");
  assert.deepEqual(partialFeedback, {
    status: "incorrect",
    message: "Not quite.",
    detail: "Prašom! — You’re welcome.",
  });
  assert.match(
    gradeAnswer(step("you-form-recall"), "esu").detail,
    /Tu goes with esi/,
  );
  assert.equal(
    gradeAnswer(step("fix-person"), "esu", { editIndex: 0 }).status,
    "incorrect",
  );
  assert.equal(
    gradeAnswer(step("fix-person"), "esu", { editIndex: 1 }).status,
    "correct",
  );
});

test("spelling slips preserve word recall without crediting exact spelling or reteaching meaning", () => {
  for (const help of [null, "hint", "reference", "reveal"]) {
    let s = at("thanks-recall");
    if (help) s = requestHelp(s, help, 3);
    const before = s.run.queue.length;
    s = respond(s, "Ačiu");
    const e = s.events.at(-1);
    assert.equal(e.outcome, "spelling");
    assert.equal(e.correctness, true);
    assert.equal(e.spellingCorrect, false);
    assert.equal(e.independentRecall, false);
    assert.equal(e.independentWordRecall, !help);
    assert.equal(e.assessment.matchedAnswer, "Ačiū!");
    assert.equal(s.run.queue.length, before);
    const restored = JSON.parse(JSON.stringify(s));
    assert.deepEqual(restored.run.feedback, s.run.feedback);
    assert.equal(advance(restored).run.index, s.run.index + 1);
  }
  const old = {
    ...step("thanks-recall"),
    answers: ["Ačiū!", "Dėkui!", "Aciu!", "Dekui!"],
  };
  delete old.assessmentPolicy;
  assert.equal(gradeAnswer(old, "Aciu").status, "spelling");
  assert.equal(gradeAnswer(old, "Dekui").detail, "Dėkui!");
  const correct = respond(at("thanks-recall"), "Ačiū").events.at(-1);
  assert.equal(correct.spellingCorrect, true);
  assert.equal(correct.independentRecall, true);
});

test("help is scoped to attempt and never turns correct into error or independent recall", () => {
  for (const id of [
    "thanks-reply",
    "name-bank",
    "thanks-recall",
    "i-form-recall",
  ])
    for (const kind of [null, "hint", "reference", "reveal", "words"]) {
      let s = at(id);
      if (kind) s = requestHelp(s, kind, 3);
      s = JSON.parse(JSON.stringify(s));
      s = respond(s, step(id).answers[0]);
      const record = s.events.at(-1);
      assert.equal(s.run.feedback.status, "correct");
      assert.equal(record.correctness, true);
      assert.deepEqual(record.requestedHelp, kind ? [kind] : []);
      assert.equal(
        record.independentRecall,
        !kind &&
          !record.answerPrimed &&
          ["type", "gap-type"].includes(step(id).kind),
      );
      assert.deepEqual(submitAnswer(s), s, "repeated submission is idempotent");
      const next = advance(s, 20);
      assert.deepEqual(next.run.help, []);
      assert.equal(next.run.answer, "");
      assert.equal(next.run.feedback, null);
    }
});

test("repairs follow intervening work, graduate support, and remain bounded", () => {
  let s = respond(at("i-form"), "esi");
  let pos = s.run.queue.findIndex((q) => q.repair);
  assert.equal(pos, s.run.index + 3);
  assert.equal(s.run.queue[pos].teaching, undefined);
  assert.equal(s.run.queue[pos].repairStage, 1);
  const first = s.run.queue.length;
  s = {
    ...s,
    run: {
      ...s.run,
      index: s.run.queue.findIndex((q) => q.id === "i-form-recall"),
      feedback: null,
    },
  };
  s = respond(s, "esi");
  assert.equal(
    s.run.queue.length,
    first,
    "same target cannot cause endless repair",
  );
  s = { ...s, run: { ...s.run, index: pos, feedback: null } };
  s = respond(s, "wrong");
  assert.equal(
    s.run.queue.length,
    first + 1,
    "failed recognition gets one supported reconstruction",
  );
  assert.equal(s.events.at(-1).repair, true);
  assert.equal(s.events.at(-1).independentRecall, false);
});

test("two-turn exchanges and reserved variants persist without depending on labels", () => {
  let s = respond(at("meet-greeting"), "Prašom!");
  assert.equal(
    s.run.threads.meet.at(-1).text,
    "Koks tavo vardas?",
    "even after wrong greeting the next turn asks the actual question",
  );
  s = advance(s);
  assert.equal(s.run.queue[s.run.index].id, "meet-name");
  s = respond(s, "Mano vardas Tomas.");
  assert.equal(s.run.threads.meet.length, 5);
  assert.equal(s.run.threads.meet.at(-1).text, "Mano vardas Rasa.");
  s = startLesson(
    {
      ...createState(),
      completed: openingLessons.slice(0, 3).map((l) => l.id),
    },
    "meet-someone",
    1,
    1,
  );
  const resumed = JSON.parse(JSON.stringify(s));
  assert.equal(JSON.stringify(resumed.run.queue), JSON.stringify(s.run.queue));
  assert.deepEqual(
    resumed.run.queue.map((q) => q.id),
    finalSteps(1).map((q) => q.id),
  );
  assert.equal(resumed.run.queue[1].answers[0], "Aš esu Mantas.");
  assert.equal(resumed.run.variant, 1);
});

test("matching records confusions separately from the eventually correct board", () => {
  let s = at("first-match");
  s.run.pending = 0;
  s = matchPair(s, 1, 3);
  assert.equal(s.events.at(-1).correctness, false);
  assert.equal(s.run.pairError, "Those don’t match. Try another pair.");
  assert.deepEqual(s.run.matched, []);
  for (let i = 0; i < 3; i++) {
    s.run.pending = i;
    s = matchPair(s, i, 4 + i);
  }
  s = submitAnswer(s, 8);
  assert.equal(s.run.feedback.status, "correct");
  assert.equal(s.events.at(-1).independentRecall, false);
  assert.equal(
    s.events.filter((e) => e.type === "pair-answer" && !e.correctness).length,
    1,
  );
});

test("course completion, continuation and versioning preserve previous immutable evidence", () => {
  assert.equal(
    startLesson(createState(), "i-and-you").run,
    null,
    "no unprepared jump",
  );
  let s = started();
  s.run.index = s.run.queue.length - 1;
  s = respond(s, step("thanks-return").answers[0]);
  s = advance(s, 30);
  assert.deepEqual(s.completed, ["first-words"]);
  assert.equal(s.run.done, true);
  const earlier = structuredClone(s.events);
  s = startLesson(s, "your-name", 40);
  assert.deepEqual(s.events.slice(0, earlier.length), earlier);
  assert.equal(s.run.lessonId, "your-name");
  assert.equal(s.run.index, 0);
  assert.deepEqual(s.run.help, []);
});
