import test from "node:test";
import assert from "node:assert/strict";
import { classSteps, courseSteps, lessons } from "../src/curriculum.js";
import {
  exerciseFor,
  isCorrect,
  sessionItems,
  stats,
  validateProgress,
} from "../src/engine.js";
import {
  teachingGuideFor,
  teachingRecognition,
} from "../src/content/teaching-pilots.js";

const pilotIds = [
  "c1-present-people",
  "c1-possession",
  "c2-with-without-forms",
];

test("pilot stages interpret a grammar signal, choose and write its form, then produce the phrase", () => {
  for (const id of pilotIds) {
    const lesson = lessons.find((l) => l.id === id);
    assert.ok(teachingGuideFor(id)?.examples.length >= 2);
    const core = lesson.items.filter((item) => item.role === "core");
    assert.equal(core.length, 6);
    for (const item of core) {
      const teaching = item.teaching;
      assert.ok(teaching, item.id);
      assert.equal(teaching.forms.length, 4);
      assert.ok(teaching.forms.includes(teaching.focus));
      assert.ok(item.lt.includes(teaching.focus));
      const recognition = teachingRecognition(item);
      const exercises = Array.from({ length: 6 }, (_, stage) =>
        exerciseFor({ ...item, taskStage: stage }, { level: 5 }),
      );
      assert.deepEqual(
        exercises.map((exercise) => exercise.type),
        ["choice", "choice", "cloze", "type", "cloze", "type"],
      );
      assert.equal(exercises[0].answer, recognition.answer);
      assert.deepEqual(
        [...exercises[0].options].sort(),
        [...recognition.options].sort(),
      );
      if (teaching.kind === "owner")
        assert.equal(exercises[0].answer, teaching.focus);
      else assert.notEqual(exercises[0].answer, teaching.focus);
      assert.equal(exercises[1].answer, teaching.focus);
      if (teaching.kind === "owner")
        assert.equal(exercises[1].prompt, teaching.switchPrompt);
      assert.deepEqual(
        [...exercises[1].options].sort(),
        [...teaching.forms].sort(),
      );
      assert.equal(exercises[2].answer, teaching.focus);
      assert.equal(exercises[3].answer, item.lt);
      assert.equal(exercises[4].answer, teaching.focus);
      assert.equal(exercises[5].answer, item.lt);
      for (const exercise of exercises) {
        assert.ok(isCorrect(exercise.answer, exercise));
        assert.ok(exercise.explanation);
      }
      for (const exercise of exercises.slice(0, 2))
        assert.equal(
          exercise.options.filter((option) => isCorrect(option, exercise))
            .length,
          1,
        );
    }
  }
});

test("completed sessions still resolve after a learner has passed over 100 steps", () => {
  const events = courseSteps.slice(0, 125).map((step, index) => ({
    id: `passed-${index}`,
    type: "lessonPass",
    lesson: step.classId,
    step: step.id,
    at: index + 1,
  }));
  const progress = validateProgress({ version: 1, events });
  const state = stats(progress);
  assert.ok(
    courseSteps.slice(0, 125).every((step) => state.passedSteps.has(step.id)),
  );
  assert.equal(state.nextStep.id, courseSteps[125].id);
  assert.equal(
    state.completed.size,
    lessons.filter((lesson) =>
      classSteps(lesson.id).every((step) => state.passedSteps.has(step.id)),
    ).length,
  );
  for (const id of pilotIds) {
    const step = classSteps(id)[0];
    assert.ok(sessionItems(progress, step).length > 0);
  }
});
