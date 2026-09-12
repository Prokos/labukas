import test from "node:test";
import assert from "node:assert/strict";
import {
  chapters,
  lessons,
  items,
  courseSteps,
  extraSteps,
  classSteps,
} from "../src/curriculum.js";
import {
  stats,
  emptyProgress,
  mergeProgress,
  validateProgress,
  isCorrect,
  clozeAnswer,
  exerciseFor,
  practiceItems,
  reinforcement,
  sessionItems,
  sessionOutcome,
} from "../src/engine.js";
const answer = (id, item, correct, at, stage = 0) => ({
  id,
  type: "answer",
  item,
  correct,
  at,
  stage,
});
function pass(step, at = Date.now(), extra = {}) {
  return {
    id: `pass-${step.id}-${at}`,
    type: "lessonPass",
    lesson: step.classId,
    step: step.id,
    at,
    ...extra,
  };
}
test("curriculum has focused classes, stable IDs, valid forms, and real added contexts", () => {
  assert.equal(chapters.length, 10);
  assert.ok(lessons.length > 200);
  assert.ok(items.length > 2000);
  assert.ok(courseSteps.length > 1500);
  assert.equal(new Set(items.map((i) => i.id)).size, items.length);
  assert.equal(new Set(courseSteps.map((s) => s.id)).size, courseSteps.length);
  for (const i of items) {
    assert.ok(i.lt && i.en);
    const missing = clozeAnswer(i);
    if (missing) assert.equal(i.cloze.replace("___", missing), i.lt);
    for (let level = 0; level <= 5; level++) {
      const ex = exerciseFor(i, { level });
      assert.ok(isCorrect(ex.answer, ex), i.id);
      if (ex.type === "choice") {
        assert.equal(ex.options.length, new Set(ex.options).size);
        assert.ok(ex.options.includes(ex.answer));
      }
    }
  }
  assert.equal(items.find((i) => i.id === "c1l4i4").lesson, "c1l6");
  assert.equal(items.find((i) => i.id === "c2l1i4").lesson, "c2l7");
});
test("every class has guided use and spaced return sessions, and each chapter has a check", () => {
  for (const l of lessons) {
    const steps = classSteps(l.id);
    if (l.kind === "writing") {
      assert.equal(steps.length, 1);
      assert.equal(steps[0].phase, "writing");
      continue;
    }
    for (const phase of ["discover", "guided", "recall", "apply"])
      assert.ok(steps.some((s) => s.phase === phase));
    assert.ok(steps.length >= 4);
    assert.ok(
      steps
        .filter((s) => s.phase === "discover")
        .every((s) => s.items.length <= 3),
    );
    const guide = [...courseSteps, ...extraSteps].findIndex(
        (s) => s.classId === l.id && s.phase === "guided",
      ),
      recall = [...courseSteps, ...extraSteps].findIndex(
        (s) => s.classId === l.id && s.phase === "recall",
      );
    assert.ok(recall > guide);
  }
  for (let chapter = 0; chapter < 10; chapter++) {
    const steps = courseSteps.filter((s) => s.chapter === chapter);
    assert.equal(steps.at(-1).phase, "checkpoint");
    const checks = steps.filter((s) => s.phase === "checkpoint");
    for (const l of lessons.filter(
      (l) => l.chapter === chapter && l.kind !== "writing" && !l.optional,
    ))
      assert.ok(
        checks.some((check) => check.items.some((i) => i.lesson === l.id)),
        l.id,
      );
    for (const check of checks)
      assert.ok(sessionItems(emptyProgress(), check).length <= 8);
  }
});
test("first café lesson repeats its small target set through supported use before moving on", () => {
  const step = classSteps("c2l1")[0],
    queue = sessionItems(emptyProgress(), step);
  assert.equal(step.items.length, 3);
  assert.equal(queue.length, 9);
  for (const i of step.items) {
    assert.deepEqual(
      queue.filter((t) => t.id === i.id).map((t) => t.taskStage),
      [0, 1, 2],
    );
  }
  const p = { version: 1, events: [pass(step)] };
  const s = stats(p);
  assert.equal(s.completed.has("c2l1"), false);
  assert.equal(s.nextStep.id, classSteps("c2l1")[1].id);
  assert.equal(s.next.id, "c2l1");
});
test("vocabulary, grammatical patterns, and conversation use different introductory tasks", () => {
  const word = items.find(
    (i) => i.teachingKind === "vocabulary" && !i.cloze?.includes("___"),
  );
  const pattern = items.find(
    (i) => i.teachingKind === "pattern" && i.cloze?.includes("___"),
  );
  const phrase = items.find((i) => i.teachingKind === "conversation");
  assert.equal(exerciseFor(word).reverse, true);
  assert.equal(exerciseFor(pattern).isGap, true);
  assert.equal(exerciseFor(phrase).reverse, false);
  for (const i of items)
    assert.equal(
      exerciseFor(i).type,
      i.activity === "writing" ? "writing" : "choice",
    );
});
test("recognition never completes a class; all its planned sessions must pass", () => {
  const steps = classSteps("c2l1"),
    p = {
      version: 1,
      events: steps.slice(0, -1).map((s, i) => pass(s, 100 + i)),
    };
  assert.equal(stats(p).completed.has("c2l1"), false);
  p.events.push(pass(steps.at(-1), 200));
  assert.equal(stats(p).completed.has("c2l1"), true);
});
test("legacy completion preserves introduction credit and saved answers, not unearned advanced passes", () => {
  const p = {
    version: 1,
    events: [
      answer("a", "c2l1i0", true, 100),
      {
        id: "old",
        type: "complete",
        lesson: "c2l1",
        at: 200,
        reinforce: ["c2l1i4"],
      },
    ],
  };
  validateProgress(p);
  const s = stats(p);
  assert.equal(s.records.c2l1i0.seen, 1);
  assert.equal(s.passedSteps.has(classSteps("c2l1")[0].id), true);
  assert.equal(s.completed.has("c2l1"), false);
  assert.equal(s.nextStep.id, classSteps("c2l1")[1].id);
});
test("same-session success improves support level but does not inflate long-term retention", () => {
  const now = Date.now(),
    p = { version: 1, events: [] };
  for (let stage = 0; stage < 5; stage++)
    p.events.push(answer(String(stage), items[0].id, true, now + stage, stage));
  let r = stats(p).records[items[0].id];
  assert.equal(r.level, 5);
  assert.equal(r.memoryStreak, 1);
  assert.equal(r.due - r.last, 4 * 3600000);
  assert.equal(stats(p).learned, 0);
  p.events.push(answer("later", items[0].id, true, now + 4 * 3600000 + 10, 5));
  r = stats(p).records[items[0].id];
  assert.equal(r.due - r.last, 86400000);
  p.events.push(answer("miss", items[0].id, false, r.last + 1, 5));
  r = stats(p).records[items[0].id];
  assert.equal(r.due - r.last, 60000);
  assert.equal(r.level, 4);
});
test("punctuation-free builders have surplus words and allow only the intended sentence", () => {
  const item = items.find((i) => i.id === "c1l4i4"),
    easy = exerciseFor(item, { level: 2 }),
    hard = exerciseFor(item, { level: 3 });
  assert.equal(easy.tokens.length, 3);
  assert.equal(hard.tokens.length, 5);
  assert.ok(hard.tokens.every((t) => !/[,.!?]/.test(t.text)));
  assert.ok(isCorrect("vienas du trys", hard));
  assert.ok(!isCorrect(hard.tokens.map((t) => t.text).join(" "), hard));
});
test("scheduled stages do not force unseen material directly into typing", () => {
  const step = classSteps("c2l1").find((s) => s.phase === "recall");
  for (const task of sessionItems(emptyProgress(), step)) {
    assert.equal(task.taskStage, 5);
    assert.equal(exerciseFor(task).type, "choice");
    assert.equal(exerciseFor(task, { level: 5 }).type, "type");
  }
});
test("checkpoint needs first-attempt production accuracy, not a chain of corrections", () => {
  const step = courseSteps.find((s) => s.phase === "checkpoint");
  const selected = sessionItems(emptyProgress(), step);
  const attempts = selected.map((i, n) => ({
    item: i.id,
    correct: n > 3,
    stage: 5,
    targetStage: 5,
  }));
  attempts.push(
    ...selected.map((i) => ({
      item: i.id,
      correct: true,
      stage: 5,
      targetStage: 5,
    })),
  );
  assert.equal(sessionOutcome(step, attempts).passed, false);
  assert.equal(
    sessionOutcome(
      step,
      step.items.map((i) => ({
        item: i.id,
        correct: true,
        stage: 5,
        targetStage: 5,
      })),
    ).passed,
    true,
  );
  const supportOnly = step.items.map((i) => ({
    item: i.id,
    correct: true,
    stage: 0,
    targetStage: 5,
  }));
  assert.equal(sessionOutcome(step, supportOnly).passed, false);
});
test("difficult lessons generate consolidation and clear it after subsequent successes", () => {
  const step = classSteps("c2l1")[0],
    outcome = sessionOutcome(
      step,
      step.items.map((i, n) => ({
        item: i.id,
        correct: n > 0,
        stage: 2,
        targetStage: 2,
      })),
    );
  assert.equal(outcome.reinforce.length, 1);
  const p = { version: 1, events: [pass(step, 100, outcome)] };
  assert.equal(reinforcement(p).items.length, 1);
  for (let n = 0; n < 2; n++)
    p.events.push(answer(`review${n}`, step.items[0].id, true, 101 + n));
  assert.equal(reinforcement(p), null);
});
test("cross-device merging deduplicates answers and course passes", () => {
  const a = { version: 1, events: [answer("a", items[0].id, false, 100)] },
    b = { version: 1, events: [pass(classSteps("c1l1")[0], 200)] };
  assert.deepEqual(mergeProgress(a, b, a), mergeProgress(b, a));
  assert.equal(mergeProgress(a, b).events.length, 2);
});
test("general practice uses encountered material; targeted practice respects the selected skill", () => {
  const p = {
    version: 1,
    events: [answer("a", items[0].id, false, Date.now() - 100000)],
  };
  assert.deepEqual(
    practiceItems(p).map((i) => i.id),
    [items[0].id],
  );
  assert.ok(practiceItems(p, "genitive").every((i) => i.skill === "genitive"));
});
test("typing ignores basic punctuation and case, but retains Lithuanian diacritics", () => {
  assert.ok(isCorrect(" AČIŪ! ", { answer: "ačiū" }));
  assert.ok(!isCorrect("aciu", { answer: "ačiū" }));
});
test("invalid backups and unknown course sessions are rejected", () => {
  assert.throws(() => validateProgress({ version: 2, events: [] }));
  assert.throws(() =>
    validateProgress({
      version: 1,
      events: [{ ...pass(courseSteps[0]), step: "unknown" }],
    }),
  );
  assert.throws(() =>
    validateProgress({ version: 1, events: [answer("a", "unknown", true, 1)] }),
  );
});

test("every scheduled session has an achievable productive endpoint within the retry budget", () => {
  const progress = emptyProgress(),
    levels = {};
  let time = 100000;
  for (const step of courseSteps) {
    const queue = sessionItems(progress, step),
      initial = queue.length,
      attempts = [];
    let n = 0;
    while (n < queue.length) {
      assert.ok(
        n < Math.max(24, initial + 6),
        `${step.id} exceeds its response budget with perfect answers`,
      );
      const task = queue[n++],
        ex = exerciseFor(task, { level: levels[task.id] || 0 });
      levels[task.id] = Math.min(
        5,
        Math.max(levels[task.id] || 0, ex.stage + 1),
      );
      progress.events.push({
        ...answer(`sim-${time}`, task.id, true, time++, ex.stage),
        step: step.id,
      });
      attempts.push({
        item: task.id,
        correct: true,
        stage: ex.stage,
        targetStage: task.taskStage,
      });
      if (ex.stage < task.taskStage) queue.push(task);
    }
    assert.equal(sessionOutcome(step, attempts).passed, true, step.id);
    progress.events.push(pass(step, time++));
  }
  const result = stats(progress, time);
  assert.equal(result.passedSteps.size, courseSteps.length);
  assert.equal(
    result.completed.size,
    lessons.filter((l) => !l.optional).length,
  );
  assert.equal(result.nextStep, undefined);
  assert.equal(
    result.learned,
    0,
    "A single sitting cannot establish spaced retention",
  );
});
