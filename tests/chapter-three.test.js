import test from "node:test";
import assert from "node:assert/strict";
import {
  authoredChapters,
  authoredChapter,
} from "../src/remaining-curriculum.js";
import { normalizeAnswer } from "../src/answer-assessment.js";
import { createCourseRuntime } from "../src/authored-course.js";
const course = authoredChapter(3);
const route = course.lessons.filter((l) => l.reviewStatus);
const located = course.lessons.flatMap((l, index) =>
  l.steps.map((q) => ({ q, index, lesson: l })),
);

test("the functional route prepares concepts before using them and reaches a meeting before wider lists", () => {
  const known = new Set();
  for (const l of course.lessons) {
    for (const requirement of l.requires || [])
      assert.ok(known.has(requirement), `${l.id}: ${requirement}`);
    (l.provides || []).forEach((p) => known.add(p));
  }
  const pos = (id) => course.lessons.findIndex((l) => l.id === id);
  assert.ok(pos("a-c3-route-arrange") < 10);
  assert.ok(pos("a-c3-route-arrange") < pos("a-c3-lex-landmarks-1"));
  assert.ok(pos("a-c3-route-travel") < pos("a-c3-ordinals-later-1"));
  assert.ok(pos("a-c3-route-half-hour-contrast") < pos("a-c3-half-hours-1"));
});

test("grammar contrasts isolate person and noun endings instead of changing both at once", () => {
  const model = (id) => located.find(({ q }) => q.id === `a-c3-route-${id}`).q;
  assert.deepEqual(
    model("destination-model").pairs.map(([lt]) => lt),
    ["Aš einu į banką.", "Aš einu į parką."],
  );
  assert.ok(model("who-model").pairs.every(([lt]) => lt.endsWith("į parką.")));
  assert.ok(
    model("travel-model").pairs.every(([lt]) => lt.startsWith("Aš važiuoju ")),
  );
  const half = located.find(
    ({ q }) => q.id === "a-c3-route-half-two-meaning",
  ).q;
  assert.ok(
    half.options.includes("At 3:30."),
    "diagnose the next-hour misconception",
  );
  assert.deepEqual(half.answers, ["At 2:30."]);
});

test("reserved combinations reference earlier forms, are spaced and were not already modelled", () => {
  const checks = located.filter(
    ({ q, lesson }) =>
      lesson.reviewStatus && q.changedContext && !q.plannedReturn,
  );
  assert.equal(checks.length, 28);
  for (const { q, index } of checks) {
    const original = located.find((x) => x.q.id === q.returnOf);
    assert.ok(original, q.id);
    assert.ok(index - original.index >= 3, q.id);
    assert.equal(q.reviewKey, original.q.reviewKey);
    const sentence = normalizeAnswer(q.source.replace("___", q.answers[0]));
    const prior = located
      .filter((x) => x.index <= index && x.q.kind === "model")
      .flatMap((x) => x.q.pairs);
    assert.ok(!prior.some(([lt]) => normalizeAnswer(lt) === sentence), q.id);
  }
});

test("both replies in the meeting conversation are prepared; it progresses through actual questions", () => {
  const index = course.lessons.findIndex((l) => l.id === "a-c3-route-arrange");
  const models = course.lessons
    .slice(0, index)
    .flatMap((l) => l.steps)
    .filter((q) => q.kind === "model")
    .flatMap((q) => q.pairs.map(([lt]) => normalizeAnswer(lt)));
  const turns = course.lessons[index].steps.filter(
    (q) => q.kind === "chat-choice",
  );
  assert.equal(turns.length, 4);
  for (const [i, q] of turns.entries()) {
    q.options.forEach((a) =>
      assert.ok(
        models.includes(normalizeAnswer(a)),
        `${q.id}: untaught reply ${a}`,
      ),
    );
    if (i) assert.equal(turns[i - 1].next, q.source);
  }
});

test("every model contributes reference for all its targets, including second and third entries", () => {
  for (const c of authoredChapters.filter((c) => c.number !== 2)) {
    for (const m of c.lessons
      .flatMap((l) => l.steps)
      .filter((q) => q.kind === "model")) {
      for (const t of m.targets) {
        const related = new Set(
          c.lessons
            .flatMap((l) => l.steps)
            .filter((q) => q.kind === "model" && q.targets.includes(t))
            .map((q) => q.id),
        );
        const rows = c.reference.filter(
          (row) => row.target === t || related.has(row.target),
        );
        m.pairs.forEach(([lt]) =>
          assert.ok(
            rows.some((row) => row.lt === lt),
            `${c.number}: ${m.id}: ${t}: ${lt}`,
          ),
        );
      }
    }
  }
});

test("the café bridge retains real chapter-2 targets and writing uses prepared travel forms", () => {
  const bridge = course.lessons.find((l) => l.id === "a-c3-earlier");
  assert.deepEqual(
    bridge.steps.map((q) => q.answers[0]),
    ["kava", "arbata", "arbatos"],
  );
  assert.ok(bridge.steps.every((q) => q.fromChapter === 2));
  const sample = course.lessons.at(-1).steps[0].sample;
  assert.ok(sample.includes("važiuoju autobusu"));
  assert.ok(!/važiuosiu|eisiu|\beik\b/i.test(sample));
});

test("unfinished retired queues, answers and evidence survive the revised sequence", () => {
  const r = createCourseRuntime(course),
    id = "a-c3l2-1";
  assert.ok(!course.lessons.some((l) => l.id === id));
  assert.ok(course.retiredLessons.some((l) => l.id === id));
  let s = r.startOpening(r.freshOpening(), id, 1);
  s.run.answer = "universitetą";
  s.run.help = ["hint"];
  const suspended = structuredClone(s.run);
  s = r.startOpening(s, "a-c3-route-destination", 2);
  assert.deepEqual(s.suspended[id], suspended);
  s = r.startOpening(JSON.parse(JSON.stringify(s)), id, 3);
  assert.equal(s.run.answer, "universitetą");
  assert.deepEqual(s.run.help, ["hint"]);
  assert.deepEqual(s.completed, []);
});

test("source functions point to real teaching and distinguish productive checks from supported applications", async () => {
  const { chapterThreeOutcomes } =
    await import("../src/chapter-three-outcomes.js");
  const all = new Map(located.map(({ q }) => [q.id, q]));
  for (const outcome of chapterThreeOutcomes) {
    assert.ok(outcome.pages && outcome.goal);
    for (const id of outcome.models)
      assert.equal(
        all.get(`a-c3-route-${id}`)?.kind,
        "model",
        `${outcome.key}: ${id}`,
      );
    for (const id of outcome.checks || []) {
      const q = all.get(id);
      assert.ok(q?.changedContext && !q.plannedReturn, `${outcome.key}: ${id}`);
      assert.equal(q.kind, "gap-type");
    }
    for (const id of outcome.applications || [])
      assert.ok(all.has(id), `${outcome.key}: ${id}`);
    if (!outcome.checks?.length)
      assert.ok(
        outcome.limit,
        `${outcome.key}: do not imply unaided transfer without a check`,
      );
  }
  const r = createCourseRuntime(course);
  const how = all.get("a-c3-route-by-what-recall");
  for (const answer of ["Kuo", "Kaip"])
    assert.equal(r.gradeOpening(how, answer).status, "correct");
  assert.equal(r.gradeOpening(how, "Kada").status, "incorrect");
  const which = all.get("a-c3-route-which-bus-recall");
  for (const answer of ["Koks", "Kelintas"])
    assert.equal(r.gradeOpening(which, answer).status, "correct");
});

test("earlier-chapter returns bring their reference examples with them", () => {
  for (const c of authoredChapters.filter((c) => c.number >= 3)) {
    for (const q of c.lessons
      .flatMap((l) => l.steps)
      .filter((q) => q.fromChapter)) {
      assert.ok(
        c.reference.some((row) => row.target === q.target),
        `${c.number}: ${q.id}`,
      );
    }
  }
});
