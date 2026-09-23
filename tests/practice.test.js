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

function practiceSeed(count = 10) {
  const pool = items
    .filter((i) => i.teachingKind === "vocabulary" && i.role === "core")
    .slice(0, count);
  return {
    pool,
    progress: {
      version: 1,
      events: pool.map((i, n) => ({
        id: `seed-${n}`,
        type: "answer",
        item: i.id,
        stage: 0,
        correct: false,
        at: n,
      })),
    },
  };
}

test("Recent unresolved difficulty outranks incomplete introduction; recovery clears that priority", async () => {
  const { practiceCollection, familiarity, nextPracticeItems } =
    await import("../src/practice.js");
  const { pool, progress } = practiceSeed();
  const hard = pool[5];
  for (let n = 0; n < 3; n++)
    progress.events.push({
      id: `miss-${n}`,
      type: "answer",
      item: hard.id,
      correct: false,
      stage: 5,
      at: 100 + n,
    });
  assert.equal(practiceCollection(stats(progress).records)[0].id, hard.id);
  for (let n = 0; n < 2; n++)
    progress.events.push({
      id: `recover-${n}`,
      type: "answer",
      item: hard.id,
      correct: true,
      stage: 5,
      at: 200 + n,
    });
  const state = stats(progress);
  assert.equal(state.records[hard.id].recentErrors, 0);
  assert.notEqual(practiceCollection(state.records)[0].id, hard.id);
  assert.equal(familiarity(state.records[hard.id]), 3);
  assert.equal(nextPracticeItems(state.records).length, 5);
  assert.deepEqual(practiceSession(emptyProgress()).queue, []);
});

test("Recognition and same-day drilling never count as remembered across days", async () => {
  const { familiarity } = await import("../src/practice.js");
  const { pool, progress } = practiceSeed(1);
  const at = new Date(2026, 8, 23, 9).getTime();
  for (let n = 0; n < 5; n++)
    progress.events.push({
      id: `recognition-${n}`,
      type: "answer",
      item: pool[0].id,
      correct: true,
      stage: 0,
      at: at + n * 86400000,
    });
  let record = stats(progress).records[pool[0].id];
  assert.equal(record.recallVisits, 0);
  assert.ok(familiarity(record) < 4);
  const later = at + 5 * 86400000;
  for (let n = 0; n < 10; n++)
    progress.events.push({
      id: `recall-${n}`,
      type: "answer",
      item: pool[0].id,
      correct: true,
      stage: 5,
      at: later + n,
    });
  record = stats(progress).records[pool[0].id];
  assert.equal(record.recallVisits, 1);
  assert.equal(familiarity(record), 3);
  progress.events.push({
    id: "tomorrow",
    type: "answer",
    item: pool[0].id,
    correct: true,
    stage: 5,
    at: later + 86400000,
  });
  assert.equal(familiarity(stats(progress).records[pool[0].id]), 4);
  progress.events.push({
    id: "forgot",
    type: "answer",
    item: pool[0].id,
    correct: false,
    stage: 5,
    at: later + 2 * 86400000,
  });
  assert.ok(familiarity(stats(progress).records[pool[0].id]) < 4);
});

test("A practice session teaches first, spaces retrieval, and reselects from updated progress", async () => {
  const { practiceTurn, practiceExercise, nextPracticeItems } =
    await import("../src/practice.js");
  const { pool, progress } = practiceSeed();
  const config = practiceSession(progress);
  const attempts = [];
  let turn = practiceTurn(config, attempts);
  while (turn.item) {
    assert.ok(attempts.length < 35);
    const item = turn.item,
      ex = practiceExercise(item);
    assert.ok(!attempts.slice(-2).some((a) => a.item === item.id));
    if (attempts.length < 5) {
      assert.equal(item.showModel, true);
      assert.equal(item.practiceKind, "recognize");
      if (ex.type === "choice") assert.ok(ex.options.length >= 2);
    } else {
      assert.equal(item.practiceKind, "recall");
      assert.ok(["type", "cloze"].includes(ex.type));
    }
    attempts.push({
      item: item.id,
      correct: true,
      practiceKind: item.practiceKind,
    });
    progress.events.push({
      id: `answer-${attempts.length}`,
      type: "answer",
      item: item.id,
      correct: true,
      stage: item.practiceKind === "recognize" ? 0 : ex.stage,
      at: 1000 + attempts.length,
    });
    turn = practiceTurn(config, attempts);
  }
  assert.equal(turn.recalled.length, 5);
  assert.equal(turn.revisit.length, 0);
  assert.equal(attempts.length, 15);
  assert.equal(stats(progress).passedSteps.size, 0);
  assert.deepEqual(
    nextPracticeItems(stats(progress).records).map((i) => i.id),
    pool.slice(5).map((i) => i.id),
  );
});

test("Mistakes and hints restore support and require fresh unaided recall; repeated failure is bounded", async () => {
  const { practiceTurn } = await import("../src/practice.js");
  const { progress } = practiceSeed(3);
  const config = practiceSession(progress),
    attempts = [];
  let turn = practiceTurn(config, attempts),
    failedRecall = false;
  while (turn.item) {
    const item = turn.item;
    const fail = !failedRecall && item.practiceKind === "recall";
    if (fail) failedRecall = true;
    attempts.push({
      item: item.id,
      correct: !fail,
      practiceKind: item.practiceKind,
    });
    const next = practiceTurn(config, attempts);
    if (fail) {
      assert.ok(!next.recalled.some((i) => i.id === item.id));
      assert.notEqual(next.item.id, item.id);
    }
    turn = next;
    assert.ok(attempts.length <= 35);
  }
  assert.equal(turn.recalled.length, 3);
  const failed = [];
  turn = practiceTurn(config, failed);
  while (turn.item) {
    failed.push({
      item: turn.item.id,
      correct: false,
      practiceKind: turn.item.practiceKind,
    });
    turn = practiceTurn(config, failed);
    assert.ok(failed.length <= 35);
  }
  assert.equal(turn.recalled.length, 0);
  assert.equal(turn.revisit.length, 3);
});

test("Selecting a word creates mixed practice; a tiny collection does not claim spaced recall", async () => {
  const { practiceTurn, practiceExercise } = await import("../src/practice.js");
  const { pool, progress } = practiceSeed(10);
  const focused = practiceSession(progress, { focus: pool[8] });
  assert.equal(focused.practiceTargets[0].id, pool[8].id);
  assert.equal(focused.practiceTargets.length, 5);
  const tiny = practiceSeed(1),
    config = practiceSession(tiny.progress);
  let turn = practiceTurn(config, []);
  assert.ok(practiceExercise(turn.item).options.length >= 2);
  const attempts = [
    { item: tiny.pool[0].id, correct: true, practiceKind: "recognize" },
  ];
  turn = practiceTurn(config, attempts);
  attempts.push({ item: turn.item.id, correct: true, practiceKind: "recall" });
  assert.equal(practiceTurn(config, attempts).item, undefined);
});

test("Sentence recall uses an existing exact word form and preserves its target", async () => {
  const { practiceExample, practiceExercise } =
    await import("../src/practice.js");
  const word = items.find((i) => practiceExample(i));
  assert.ok(word);
  const context = practiceExample(word);
  const ex = practiceExercise({
    ...word,
    practiceKind: "recall",
    taskStage: 5,
    practiceContext: context,
  });
  assert.equal(ex.type, "cloze");
  assert.ok(ex.cloze.includes("___"));
  assert.ok(isCorrect(word.lt, ex));
  assert.equal(ex.contextMeaning, context.en);
});
