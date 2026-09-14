import test from "node:test";
import assert from "node:assert/strict";
import {
  items,
  courseSteps,
  historicalSteps,
  classSteps,
} from "../src/curriculum.js";
import {
  stats,
  validateProgress,
  mergeProgress,
  sessionItems,
  practiceItems,
  emptyProgress,
  isCorrect,
  exerciseFor,
} from "../src/engine.js";
import {
  practiceSets,
  practiceSession,
  wordPracticeSet,
  dailyWord,
} from "../src/practice.js";
const pass = (step) => ({
  id: `pass-${step.id}`,
  type: "lessonPass",
  lesson: step.classId,
  step: step.id,
  at: 1,
});

test("Every combination of historical number completions preserves exactly the covered targets", () => {
  const ordered = courseSteps.filter((s) =>
    s.id.startsWith("c1l6-discover-ordered-"),
  );
  assert.deepEqual(
    ordered.flatMap((s) => s.items.map((i) => i.lt)),
    [
      "vienas",
      "du",
      "trys",
      "keturi",
      "penki",
      "šeši",
      "septyni",
      "aštuoni",
      "devyni",
      "dešimt",
    ],
  );
  const zeroStep = courseSteps.find(
    (s) => s.phase === "discover" && s.items.some((i) => i.lt === "nulis"),
  );
  assert.ok(
    courseSteps.indexOf(ordered.at(-1)) < courseSteps.indexOf(zeroStep),
  );
  for (let mask = 0; mask < 16; mask++) {
    const old = historicalSteps.filter((_, n) => mask & (1 << n));
    const p = { version: 1, events: old.map(pass) };
    const before = JSON.stringify(p);
    assert.doesNotThrow(() => validateProgress(p));
    const covered = new Set(old.flatMap((s) => s.items.map((i) => i.id)));
    const state = stats(p);
    for (const step of ordered) {
      assert.equal(
        state.passedSteps.has(step.id),
        step.items.every((i) => covered.has(i.id)),
      );
      if (!state.passedSteps.has(step.id)) {
        const tasks = sessionItems(p, step);
        assert.ok(tasks.every((i) => !covered.has(i.id)));
        assert.deepEqual(
          new Set(tasks.map((i) => i.id)),
          new Set(
            step.items.filter((i) => !covered.has(i.id)).map((i) => i.id),
          ),
        );
      }
    }
    assert.equal(JSON.stringify(p), before);
    assert.deepEqual(mergeProgress(p, p), p);
  }
  const p = {
    version: 1,
    events: [{ id: "legacy", type: "complete", lesson: "c1l6", at: 1 }],
  };
  assert.ok(stats(p).passedSteps.has(ordered[1].id));
  assert.ok(!stats(p).passedSteps.has(ordered[0].id));
});

test("Completed historical number class remains completed", () => {
  const steps = [
    ...historicalSteps,
    ...classSteps("c1l6").filter((s) => s.phase !== "discover"),
  ];
  assert.ok(
    stats({ version: 1, events: steps.map(pass) }).completed.has("c1l6"),
  );
});

test("Word practice is finite, anchored, and introduces only its selected targets", () => {
  for (const word of [
    items.find((i) => i.lt === "šuo"),
    items.find((i) => i.lt === "Tai yra katė"),
  ]) {
    const set = wordPracticeSet(word);
    assert.ok(set.items.some((i) => i.id === word.id));
    assert.ok(set.items.length <= 3);
    const config = practiceSession(emptyProgress(), set);
    assert.equal(config.step, undefined);
    assert.ok(config.queue.length <= 9);
    assert.deepEqual(
      new Set(config.queue.map((i) => i.id)),
      new Set(set.items.map((i) => i.id)),
    );
    for (const item of set.items)
      assert.deepEqual(
        config.queue.filter((i) => i.id === item.id).map((i) => i.taskStage),
        [0, 1, 2],
      );
  }
  assert.ok(
    practiceSets.every((s) => s.items.length >= 1 && s.items.length <= 3),
  );
});

test("A recovered old mistake does not outrank a due word or return immediately inside a lesson", () => {
  const now = Date.now();
  const dog = items.find((i) => i.lt === "šuo"),
    cat = items.find((i) => i.lt === "katė");
  const answer = (item, correct, at, n) => ({
    id: `${item.id}-${n}`,
    type: "answer",
    item: item.id,
    correct,
    stage: 2,
    at,
  });
  const p = {
    version: 1,
    events: [
      answer(dog, false, now - 120000, 0),
      answer(dog, true, now - 60000, 1),
      answer(dog, true, now - 1000, 2),
      answer(cat, true, now - 86400000, 0),
    ],
  };
  assert.equal(practiceItems(p, "all", 1)[0].id, cat.id);
  const step = courseSteps.find(
    (s) =>
      s.phase === "guided" &&
      s.items.every((i) => ![dog.id, cat.id].includes(i.id)),
  );
  assert.ok(!sessionItems(p, step).some((i) => i.id === dog.id));
  assert.ok(sessionItems(p, step).some((i) => i.id === cat.id));
});

test("Guided rounds vary without adjacent repeats or reversing teaching stages", () => {
  const step = courseSteps.find(
    (s) => s.phase === "guided" && s.items.length === 6,
  );
  const orders = new Set();
  for (let n = 0; n < 12; n++) {
    const tasks = sessionItems(emptyProgress(), step);
    orders.add(tasks.map((i) => i.id).join(","));
    assert.ok(
      tasks.every((i, index) => !index || i.id !== tasks[index - 1].id),
    );
    assert.ok(tasks.slice(0, 6).every((i) => i.taskStage === 2));
    assert.ok(tasks.slice(6).every((i) => i.taskStage === 3));
  }
  assert.ok(orders.size > 1);
});

test("Daily words stay stable within a local day and do not repeat weekly", () => {
  const start = new Date(2026, 8, 14, 9).getTime();
  assert.equal(dailyWord(start).id, dailyWord(start + 3600000).id);
  assert.equal(
    new Set(
      Array.from({ length: 30 }, (_, n) => dailyWord(start + n * 86400000).lt),
    ).size,
    30,
  );
});

test("Explicit identification variants retain spelling and do not loosen unrelated answers", () => {
  const cat = items.find((i) => i.lt === "Tai yra katė");
  const ex = exerciseFor({ ...cat, taskStage: 5 }, { level: 5 });
  assert.ok(isCorrect("Tai katė", ex));
  assert.ok(!isCorrect("Tai kate", ex));
  assert.ok(!isCorrect("Tai šuo", ex));
});

test("Discovery revisions work for arbitrary lesson content without special cases", async () => {
  const { discoveryPlan, inheritedTargets, applyTeachingOrder } =
    await import("../src/lesson-plan.js");
  const lesson = {
    id: "unrelated-lesson",
    chapter: 4,
    items: Array.from({ length: 6 }, (_, n) => ({
      id: `target-${n}`,
      role: "core",
    })),
    discovery: {
      version: "revised",
      order: [3, 0, 4, 1, 5, 2],
      previous: [{}],
    },
  };
  const plan = discoveryPlan(lesson);
  const passed = new Set([plan.previous[0].id]);
  for (const step of plan.current) {
    assert.deepEqual(
      inheritedTargets(passed, step, plan.previous),
      new Set(["target-0", "target-1", "target-2"]),
    );
    assert.ok(
      step.items.some(
        (i) => !inheritedTargets(passed, step, plan.previous).has(i.id),
      ),
    );
  }
  assert.throws(() =>
    discoveryPlan({ ...lesson, discovery: { order: [0, 0, 1, 2, 3, 4] } }),
  );
  assert.throws(() =>
    discoveryPlan({ ...lesson, discovery: { previous: [{}] } }),
  );
  const chapters = [
    {
      lessons: [
        { key: "c" },
        { key: "b", teachBefore: "c" },
        { key: "a", teachBefore: "b" },
      ],
    },
  ];
  applyTeachingOrder(chapters);
  assert.deepEqual(
    chapters[0].lessons.map((l) => l.key),
    ["a", "b", "c"],
  );
  assert.deepEqual(
    chapters[0].lessons.map((l) => l.assessmentPosition),
    [2, 1, 0],
  );
  assert.throws(() =>
    applyTeachingOrder([
      {
        lessons: [
          { key: "a", teachBefore: "b" },
          { key: "b", teachBefore: "a" },
        ],
      },
    ]),
  );
});
