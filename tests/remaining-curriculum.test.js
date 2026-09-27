import test from "node:test";
import assert from "node:assert/strict";
import { authoredChapters } from "../src/remaining-curriculum.js";
import { lessons as originalLessons } from "../src/curriculum.js";
import { createCourseRuntime } from "../src/authored-course.js";
import { words } from "../src/course-authoring.js";

for (const course of authoredChapters.filter((c) => c.number !== 2)) {
  test(`chapter ${course.number}: source inventory retained, playable contracts and bounded production`, () => {
    const r = createCourseRuntime(course),
      seen = new Set(),
      all = [];
    const covered = new Set(course.ledger.map((x) => x.source));
    for (const l of originalLessons.filter(
      (l) => l.chapter === course.number - 1 && !l.optional,
    ))
      for (const i of l.items.filter((i) => !i.extension))
        assert.ok(covered.has(i.id), `missing ${i.id}`);
    for (const l of course.lessons) {
      assert.ok(l.steps.length && l.goal && l.sourcePages, l.id);
      assert.equal(r.startOpening(r.freshOpening(), l.id).run.lessonId, l.id);
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
        assert.ok(q.hint && q.correction, q.id);
        for (const a of q.answers)
          assert.equal(
            r.gradeOpening(q, a, { editIndex: q.editIndex }).status,
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
  const course = authoredChapters.find((c) => c.number === 3),
    r = createCourseRuntime(course);
  const q = course.lessons
    .flatMap((l) => l.steps)
    .find((q) => q.kind === "type" && q.answers[0] === "šeštadienis");
  assert.ok(q);
  assert.equal(r.gradeOpening(q, "sestadienis").status, "spelling");
  const grammar = course.lessons
    .flatMap((l) => l.steps)
    .find((q) => q.changedContext && q.answers[0] === "muziejų");
  assert.equal(r.gradeOpening(grammar, "muziejaus").status, "incorrect");
});

test("all new lessons finish through the runtime without granting later-day mastery", () => {
  for (const course of authoredChapters.filter((c) => c.number !== 2)) {
    const r = createCourseRuntime(course);
    let state = r.freshOpening(),
      now = new Date(2026, 8, 26, 10).getTime();
    for (const lesson of course.lessons) {
      state = r.advanceOpening(
        r.startOpening(state, lesson.id, now++, 0),
        now++,
      );
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
          state = r.answerOpening(state, now++);
          assert.ok(
            ["correct", "self-reviewed"].includes(state.run.feedback?.status),
            q.id,
          );
        }
        state = r.advanceOpening(state, now++);
      }
    }
    assert.equal(state.completed.length, course.lessons.length);
    assert.ok(
      r.learningEvidence(state, now).every((row) => row.familiarity < 4),
    );
  }
});

test("source coverage names actual taught expressions, not only ledger entries", () => {
  for (const course of authoredChapters.filter((c) => c.number !== 2)) {
    const normalize = (t) => words(t).join(" ").toLowerCase();
    const taught = new Set(
      course.lessons
        .flatMap((l) => l.steps)
        .filter((q) => q.kind === "model")
        .flatMap((q) => q.pairs.map((p) => normalize(p[0]))),
    );
    for (const l of originalLessons.filter(
      (l) =>
        l.chapter === course.number - 1 &&
        !l.optional &&
        !["reading", "writing"].includes(l.kind),
    ))
      for (const i of l.items.filter((i) => !i.extension)) {
        const replacement = course.ledger.find(
          (e) => e.source === i.id && e.disposition === "taught-in-context",
        );
        if (replacement) {
          const lesson = course.lessons.find(
            (l) => l.id === replacement.lesson,
          );
          const model = lesson?.steps.find(
            (q) => q.id === replacement.model && q.kind === "model",
          );
          assert.ok(
            model?.pairs.some(([lt]) =>
              ` ${normalize(lt)} `.includes(` ${normalize(i.lt)} `),
            ),
            `${i.id}: missing expression in replacement model`,
          );
          assert.ok(
            lesson.steps.some(
              (q) => q.kind !== "model" && model.targets.includes(q.target),
            ),
            `${i.id}: replacement has no practice`,
          );
        } else assert.ok(taught.has(normalize(i.lt)), `${i.id}: ${i.lt}`);
      }
    const positions = course.lessons.map((l) => l.sourceLesson);
    for (const source of originalLessons.filter(
      (l) => l.chapter === course.number - 1 && l.kind === "vocabulary",
    )) {
      const context = course.lessons.findIndex(
        (l) => l.id === `a-${source.id}-use`,
      );
      if (context < 0) continue;
      assert.ok(
        !positions.slice(context + 1).includes(source.id),
        `context before teaching: ${source.id}`,
      );
    }
  }
});

test("wrong conversation replies receive the matching recovery message and translation", () => {
  const course = authoredChapters.find((c) => c.number === 4),
    r = createCourseRuntime(course);
  const lesson = course.lessons.find((l) => l.id === "a-c4-route-rental");
  let s = r.advanceOpening(r.startOpening(r.freshOpening(), lesson.id, 1, 0));
  s.run.index = s.run.queue.findIndex((q) => q.kind === "chat-choice");
  const q = s.run.queue[s.run.index];
  s.run.answer = q.options.find((a) => !q.answers.includes(a));
  s = r.answerOpening(s, 2);
  const reply = s.run.threads[q.thread].at(-1);
  assert.equal(reply.text, q.wrongNext);
  assert.equal(reply.gloss, q.wrongFollowGloss);
  assert.equal(s.run.feedback.status, "incorrect");
});
