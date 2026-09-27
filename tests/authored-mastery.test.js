import test from "node:test";
import assert from "node:assert/strict";
import { createCourseRuntime } from "../src/authored-course.js";
import { chapterTwoLexicon } from "../src/chapter-two-lexicon.js";
import { chapterTwoLessons } from "../src/chapter-two-content.js";
import {
  preferenceMeanings,
  preferenceWords,
} from "../src/chapter-two-returns.js";

const tasks = ["Ačiū", "Dėkui", "Prašom"].map((answer, i) => ({
  id: `word-${i}`,
  target: `word-${i}`,
  reviewKey: `word-${i}`,
  kind: "type",
  ability: "word-recall",
  source: `Prompt ${i}`,
  answers: [answer],
  correction: answer,
  assessmentPolicy: { spelling: "diacritics" },
}));
const r = createCourseRuntime({
  lessons: [{ id: "words", steps: tasks }],
  version: 1,
});
const day = new Date(2026, 8, 25, 10).getTime();
function submit(
  state,
  index,
  time,
  { help = [], answer, visible = false } = {},
) {
  let s = r.startOpening(state, "words", time, 0);
  s = {
    ...s,
    run: {
      ...s.run,
      index,
      intro: false,
      feedback: null,
      help,
      answer: answer ?? tasks[index].answers[0],
      queue: s.run.queue.map((q, i) => ({
        ...q,
        answerVisible: i === index && visible,
      })),
    },
  };
  return r.answerOpening(s, time);
}

test("spelling, help and visible corrections never stand in for later independent recall", () => {
  let s = submit(r.freshOpening(), 0, day, { answer: "Ačiu" });
  assert.equal(s.events.at(-1).outcome, "spelling");
  assert.equal(s.events.at(-1).independentWordRecall, true);
  assert.equal(r.learningEvidence(s)[0].independentRun, 0);
  assert.equal(r.learningEvidence(s)[0].needsSpelling, true);
  for (const support of [
    { help: ["hint"] },
    { help: ["reveal"] },
    { visible: true },
  ]) {
    s = submit(s, 0, day + 1000, support);
    assert.equal(s.events.at(-1).independentRecall, false);
    assert.equal(r.learningEvidence(s)[0].recallVisits, 0);
  }
  // Two intervening responses separate each independent attempt from the
  // correction/feedback. An immediate exact repeat is still primed.
  s = submit(s, 0, day + 2000);
  assert.equal(s.events.at(-1).independentRecall, false);
  s = submit(s, 1, day + 2100);
  s = submit(s, 2, day + 2200);
  s = submit(s, 0, day + 2300);
  s = submit(s, 1, day + 2400);
  s = submit(s, 2, day + 2500);
  s = submit(s, 0, day + 3000);
  let row = r.learningEvidence(s)[0];
  assert.equal(row.needsSpelling, false);
  assert.equal(row.needsSupport, false);
  assert.equal(row.recallVisits, 1);
  assert.equal(row.label, "Recalled unaided");
  s = submit(JSON.parse(JSON.stringify(s)), 0, day + 86400000);
  row = r.learningEvidence(s)[0];
  assert.equal(row.recallVisits, 2);
  assert.equal(row.label, "Remembered later");
  assert.equal(
    s.events[1].outcome,
    "spelling",
    "original evidence is preserved",
  );
});

test("crossing midnight alone and recognition choices cannot establish remembered later", () => {
  const late = new Date(2026, 8, 25, 23, 30).getTime();
  let s = submit(r.freshOpening(), 0, late);
  s = submit(s, 0, late + 3600000);
  assert.equal(r.learningEvidence(s)[0].recallVisits, 1);
  const choice = { ...tasks[0], kind: "choice", options: ["Ačiū", "Prašom"] };
  const cr = createCourseRuntime({
    lessons: [{ id: "words", steps: [choice] }],
    version: 1,
  });
  let c = cr.startOpening(cr.freshOpening(), "words", day);
  for (const t of [day, day + 86400000, day + 2 * 86400000]) {
    c = cr.answerOpening(
      { ...c, run: { ...c.run, answer: "Ačiū", feedback: null } },
      t,
    );
  }
  assert.equal(cr.learningEvidence(c)[0].label, "Recognizing");
  assert.equal(cr.learningEvidence(c)[0].recallVisits, 0);
});

test("mixed practice separates returns, asks again after help and stops within bounds", () => {
  let s = r.freshOpening();
  for (let i = 0; i < 3; i++) s = submit(s, i, day + i);
  s = r.advanceOpening(r.startReview(s, day + 86400000));
  let turns = 0;
  while (!s.run.done) {
    assert.ok(turns < 35);
    const q = s.run.queue[s.run.index];
    if (turns === 0) s = r.helpOpening(s, "reveal");
    s = r.answerOpening(
      { ...s, run: { ...s.run, answer: q.answers[0] } },
      day + 86400000 + turns,
    );
    s = r.advanceOpening(s);
    turns++;
  }
  const attempts = s.events.filter(
    (e) => e.type === "answer" && e.run === s.run.id,
  );
  for (const q of tasks) {
    const indices = attempts.flatMap((e, i) =>
      e.target === q.target ? [i] : [],
    );
    assert.ok(indices.every((v, i) => !i || v - indices[i - 1] >= 3));
    assert.ok(
      attempts.filter((e) => e.target === q.target && e.independentRecall)
        .length >= 2,
    );
  }
  assert.deepEqual(s.completed, []);
  // Persistently wrong answers are bounded and their supplied corrections earn no recall.
  s = r.startReview(s, day + 2 * 86400000);
  s = r.advanceOpening(s);
  turns = 0;
  while (!s.run.done) {
    assert.ok(turns++ < 35);
    s = r.answerOpening({
      ...s,
      run: {
        ...s.run,
        answer: s.run.queue[s.run.index].answers[0].slice(0, 2),
      },
    });
    s = r.advanceOpening(s);
  }
  assert.ok(turns <= 9);
});

test("every inventory word is taught, retrieved and returned after an intervening lesson", () => {
  for (const word of chapterTwoLexicon) {
    const target = `c2-word:${word.lt}`;
    const introduced = chapterTwoLessons.findIndex((l) =>
      l.steps.some((q) => q.kind === "model" && q.targets.includes(target)),
    );
    const recalled = chapterTwoLessons.findIndex((l) =>
      l.steps.some(
        (q) => q.target === target && q.kind === "type" && !q.plannedReturn,
      ),
    );
    const returned = chapterTwoLessons.findIndex((l) =>
      l.steps.some((q) => q.target === target && q.plannedReturn),
    );
    assert.ok(
      introduced >= 0 && recalled >= introduced && returned >= recalled + 2,
      word.lt,
    );
  }
  for (const word of preferenceWords) assert.ok(preferenceMeanings[word], word);
  const returns = chapterTwoLessons
    .flatMap((l) => l.steps)
    .filter((q) => q.plannedReturn);
  assert.ok(returns.some((q) => q.translation === "I like the bun."));
  assert.ok(
    !returns.some((q) => /undefined|I like bun\./.test(q.translation || "")),
  );
});
