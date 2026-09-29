import test from "node:test";
import assert from "node:assert/strict";
import { createCourseRuntime } from "../src/learning/session.js";
const day = new Date(2026, 8, 26, 10).getTime();
const q = (id, answer) => ({
  id,
  kind: "type",
  target: answer,
  reviewKey: answer,
  ability: "word-recall",
  source: id,
  answers: [answer],
  correction: answer,
});
const lesson = {
  id: "exposure",
  steps: [
    {
      id: "model",
      kind: "model",
      targets: ["bankas"],
      pairs: [["bankas", "bank"]],
    },
    q("immediate", "bankas"),
    q("other-1", "parkas"),
    q("other-2", "kavinė"),
    q("delayed", "bankas"),
  ],
};
const r = createCourseRuntime({
  version: 1,
  lessons: [lesson],
  allowDirectEntry: true,
});
function answer(s, time) {
  return r.submitAnswer(
    { ...s, run: { ...s.run, answer: s.run.queue[s.run.index].answers[0] } },
    time,
  );
}
test("a just-shown answer is support; two intervening responses permit a new recall attempt", () => {
  let s = r.advance(r.startLesson(r.createState(), lesson.id, day), day);
  s = r.advance(s, day + 1);
  s = answer(JSON.parse(JSON.stringify(s)), day + 2);
  assert.equal(s.events.at(-1).outcome, "correct");
  assert.equal(s.events.at(-1).answerPrimed, true);
  assert.equal(s.events.at(-1).independentRecall, false);
  assert.ok(s.events.at(-1).suppliedSupport.includes("recent-answer-exposure"));
  assert.equal(r.learningEvidence(s)[0].needsSupport, true);
  for (let i = 0; i < 3; i++) {
    s = r.advance(s, day + 3 + 2 * i);
    s = answer(s, day + 4 + 2 * i);
  }
  assert.equal(s.events.at(-1).step, "delayed");
  assert.equal(s.events.at(-1).independentRecall, true);
  assert.equal(
    r.learningEvidence(s).find((x) => x.target === "bankas").needsSupport,
    false,
  );
});
test("answer exposure survives a lesson switch and expires on a later learning day", () => {
  const runtime = createCourseRuntime({
    version: 1,
    allowDirectEntry: true,
    lessons: [lesson, { id: "next", steps: [q("return", "bankas")] }],
  });
  let s = runtime.advance(
    runtime.startLesson(runtime.createState(), lesson.id, day),
    day,
  );
  s = runtime.advance(s, day + 1);
  s = runtime.advance(runtime.startLesson(s, "next", day + 2), day + 2);
  s = runtime.submitAnswer(
    { ...s, run: { ...s.run, answer: "bankas" } },
    day + 3,
  );
  assert.equal(s.events.at(-1).independentRecall, false);
  s = runtime.advance(s, day + 4);
  const old = JSON.stringify(s.events);
  s = runtime.advance(
    runtime.startLesson(s, "next", day + 86400000),
    day + 86400000,
  );
  s = runtime.submitAnswer(
    { ...s, run: { ...s.run, answer: "bankas" } },
    day + 86400001,
  );
  assert.equal(s.events.at(-1).independentRecall, true);
  assert.equal(JSON.stringify(s.events.slice(0, JSON.parse(old).length)), old);
});
test("single-target Practice ends after support and leaves independent retrieval outstanding", () => {
  let s = r.startLesson(r.createState(), lesson.id, day);
  s.run.index = 1;
  s.run.intro = false;
  s = r.requestHelp(s, "reveal", day + 1);
  s = answer(s, day + 2);
  s = r.advance(r.startReview(s, day + 3), day + 3);
  s = answer(s, day + 4);
  s = r.advance(s, day + 5);
  assert.equal(s.run.done, true);
  assert.equal(
    s.events.filter((e) => e.type === "answer" && e.run === s.run.id).length,
    1,
  );
  const row = r.learningEvidence(s)[0];
  assert.equal(row.independentRun, 0);
  assert.equal(row.needsSupport, true);
  assert.deepEqual(s.completed, []);
});

test("old queues reconstruct recent models, while hidden answer alternatives are not exposure", () => {
  let s = r.advance(r.startLesson(r.createState(), lesson.id, day), day);
  s = r.advance(s, day + 1);
  delete s.run.answerExposures;
  delete s.run.responseTurn;
  s = answer(s, day + 2);
  assert.equal(s.events.at(-1).answerPrimed, true);
  const runtime = createCourseRuntime({
    version: 1,
    lessons: [
      {
        id: "hidden",
        steps: [
          {
            ...q("first", "Ačiū"),
            answers: ["Ačiū", "Dėkui"],
            words: ["Ačiū", "Dėkui"],
          },
          q("second", "Dėkui"),
        ],
      },
    ],
  });
  let h = runtime.advance(
    runtime.startLesson(runtime.createState(), "hidden", day),
    day,
  );
  h = runtime.submitAnswer(
    { ...h, run: { ...h.run, answer: "Ačiū" } },
    day + 1,
  );
  h = runtime.advance(h, day + 2);
  h = runtime.submitAnswer(
    { ...h, run: { ...h.run, answer: "Dėkui" } },
    day + 3,
  );
  assert.equal(
    h.events.at(-1).independentRecall,
    true,
    "Dėkui was a hidden accepted alternative, not visible help",
  );
});
