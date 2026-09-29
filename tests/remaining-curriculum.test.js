import test from "node:test";
import assert from "node:assert/strict";
import { courses } from "./helpers.js";
import { createCourseRuntime } from "../src/learning/session.js";
import { words } from "./helpers.js";

for (const course of courses.filter((c) => c.number !== 2)) {
  test(`chapter ${course.number}: source inventory retained, playable contracts and bounded production`, () => {
    const r = createCourseRuntime(course),
      seen = new Set(),
      all = [];
    for (const l of course.lessons) {
      assert.ok(l.steps.length && l.goal && l.sourcePages, l.id);
      assert.equal(r.startLesson(r.createState(), l.id).run.lessonId, l.id);
      for (const q of l.steps) {
        assert.ok(!seen.has(q.id), `duplicate ${q.id}`);
        seen.add(q.id);
        all.push(q);
        if (q.kind === "model") {
          assert.ok(q.pairs.length <= 3, q.id);
          continue;
        }
        if (q.kind === "writing") {
          assert.ok(q.sample && q.checklist.length);
          continue;
        }
        if (q.kind === "match") continue;
        assert.ok(q.correction, q.id);
        if (q.hint !== undefined) assert.ok(q.hint.trim(), q.id);
        for (const a of q.answers)
          assert.equal(
            r.gradeAnswer(q, a, { editIndex: q.editIndex }).status,
            "correct",
            `${q.id}: ${a}`,
          );
        if (q.kind === "type")
          assert.ok(
            words(q.answers[0]).length <= 3 || course.number === 1,
            q.id,
          );
        if (q.options) {
          assert.ok(q.options.length >= 2, q.id);
          assert.equal(new Set(q.options).size, q.options.length, q.id);
        }
        if (q.kind === "bank") {
          const tiles = [...q.words];
          for (const w of words(q.answers[0])) {
            const i = tiles.indexOf(w);
            assert.ok(i >= 0, `${q.id}: ${w}`);
            tiles.splice(i, 1);
          }
        }
      }
    }
    const located = course.lessons.flatMap((l, index) =>
      l.steps.map((q) => ({ q, index })),
    );
    for (const { q, index } of located.filter(
      ({ q }) =>
        ["type", "gap-type"].includes(q.kind) &&
        !q.plannedReturn &&
        !q.changedContext &&
        !q.id.startsWith("open"),
    )) {
      // Accepted opening has its own explicitly authored returns.
      if (!q.id.startsWith("a-")) continue;
      const returns = located.filter(
        (x) => x.q.plannedReturn && x.q.returnOf === q.id,
      );
      assert.equal(returns.length, 2, `${q.id} return count`);
      assert.ok(returns[0].index >= index + 2, `${q.id} spacing`);
      assert.ok(
        returns[1].index >= returns[0].index + 2,
        `${q.id} second spacing`,
      );
    }
    assert.ok(all.some((q) => q.kind === "chat-choice"));
    assert.ok(all.some((q) => q.kind === "reading"));
    assert.ok(all.filter((q) => q.changedContext).length >= 3);
  });
}

test("new chapters preserve rich grading and support in Course and Practice", () => {
  const course = courses.find((c) => c.number === 3),
    r = createCourseRuntime(course);
  const q = course.lessons
    .flatMap((l) => l.steps)
    .find((q) => q.kind === "type" && q.answers[0] === "šeštadienis");
  assert.ok(q);
  assert.equal(r.gradeAnswer(q, "sestadienis").status, "spelling");
  const grammar = course.lessons
    .flatMap((l) => l.steps)
    .find((q) => q.changedContext && q.answers[0] === "muziejų");
  assert.equal(r.gradeAnswer(grammar, "muziejaus").status, "incorrect");
});

test("all new lessons finish through the runtime without granting later-day mastery", () => {
  for (const course of courses.filter((c) => c.number !== 2)) {
    const r = createCourseRuntime(course);
    let state = r.createState(),
      now = new Date(2026, 8, 26, 10).getTime();
    for (const lesson of course.lessons) {
      state = r.advance(r.startLesson(state, lesson.id, now++, 0), now++);
      let guard = 0;
      while (!state.run.done) {
        assert.ok(guard++ < 80, lesson.id);
        const q = state.run.queue[state.run.index];
        if (q.kind !== "model") {
          state = {
            ...state,
            run: {
              ...state.run,
              answer: q.sample || q.answers?.[0] || "matched",
              editIndex: q.editIndex ?? null,
              matched: q.kind === "match" ? q.pairs.map((_, i) => i) : [],
              checked: q.checklist?.map((_, i) => i) || [],
            },
          };
          state = r.submitAnswer(state, now++);
          assert.ok(
            ["correct", "self-reviewed"].includes(state.run.feedback?.status),
            q.id,
          );
        }
        state = r.advance(state, now++);
      }
    }
    assert.equal(state.completed.length, course.lessons.length);
    assert.ok(
      r.learningEvidence(state, now).every((row) => row.familiarity < 4),
    );
  }
});

test("chapter vocabulary is taught explicitly or in an identified model", () => {
  for (const course of courses.filter((c) => c.number !== 2)) {
    const norm = (t) => words(t).join(" ").toLowerCase();
    const models = course.lessons
      .flatMap((l) => l.steps)
      .filter((q) => q.kind === "model");
    const taught = new Set(
      models.flatMap((q) => q.pairs.map((p) => norm(p[0]))),
    );
    for (const word of course.vocabulary) {
      if (word.model)
        assert.ok(
          models
            .find((q) => q.id === word.model)
            ?.pairs.some(([lt]) =>
              ` ${norm(lt)} `.includes(` ${norm(word.lt)} `),
            ),
          word.lt,
        );
      else assert.ok(taught.has(norm(word.lt)), word.lt);
    }
  }
});

test("wrong conversation replies receive the matching recovery message and translation", () => {
  const course = courses.find((c) => c.number === 4),
    r = createCourseRuntime(course);
  const lesson = course.lessons.find((l) => l.id === "a-c4-route-rental");
  let s = r.advance(r.startLesson(r.createState(), lesson.id, 1, 0));
  s.run.index = s.run.queue.findIndex((q) => q.kind === "chat-choice");
  const q = s.run.queue[s.run.index];
  s.run.answer = q.options.find((a) => !q.answers.includes(a));
  s = r.submitAnswer(s, 2);
  const reply = s.run.threads[q.thread].at(-1);
  assert.equal(reply.text, q.wrongNext);
  assert.equal(reply.gloss, q.wrongFollowGloss);
  assert.equal(s.run.feedback.status, "incorrect");
});
