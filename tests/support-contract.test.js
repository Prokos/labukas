import test from "node:test";
import assert from "node:assert/strict";
import { courses } from "./helpers.js";
import { course as courseByNumber } from "./helpers.js";
const openingCourse = courseByNumber(1);
import { chapterTwoCourse } from "./helpers.js";
import {
  repairStep,
  supportChoices,
  limitChoices,
  hintForStep,
} from "../src/learning/support.js";
import { normalizeAnswer } from "../src/learning/answer-assessment.js";

// Shared authoring acceptance gate. New chapters exercise the same policy;
// there is no chapter-specific retry implementation to silently diverge.
for (const course of [
  openingCourse,
  chapterTwoCourse,
  ...courses.filter((c) => c.number !== 2),
]) {
  test(`${course.key}: assistance uses bounded authored alternatives and never calls a copy recall`, () => {
    for (const lesson of course.lessons)
      for (const q of course.stepsFor?.(lesson, 0) || lesson.steps) {
        if (q.kind === "model" || q.kind === "writing" || q.kind === "match")
          continue;
        const answers = q.answers.map(normalizeAnswer);
        assert.ok(
          !/^(Recall |Think about the contrast|Look at the part of the sentence|Check what the sentence needs|Use the examples to check|Compare the meanings in this group|Check the person, time or preposition|Look at the person and the word before|Build the message around its verb)/i.test(
            q.cue || q.hint || "",
          ),
          `placeholder cue: ${q.id}`,
        );
        for (const choices of [
          supportChoices(q),
          ...(q.options ? [limitChoices(q.options, q.answers)] : []),
        ]) {
          assert.ok(choices.length <= 4, q.id);
          if (!choices.length) continue;
          assert.equal(
            choices.filter((c) => answers.includes(normalizeAnswer(c))).length,
            1,
            q.id,
          );
          assert.ok(
            choices.some((c) => !answers.includes(normalizeAnswer(c))),
            `no distractor: ${q.id}`,
          );
        }
        assert.ok(
          !/^Recall .*previous|^Recall .*earlier/i.test(hintForStep(q) || ""),
          q.id,
        );
        const first = repairStep(q);
        if (!first) continue;
        assert.equal(first.target, q.target, q.id);
        assert.equal(first.reviewKey, q.reviewKey, q.id);
        assert.equal(first.teaching, undefined, q.id);
        assert.equal(first.answerVisible, false, q.id);
        if (["bank", "chat-bank"].includes(q.kind)) {
          assert.equal(first.kind, "bank", q.id);
          assert.equal(first.options, undefined, q.id);
        }
        const second = repairStep(first);
        assert.equal(second.repairStage, 2, q.id);
        if (q.options && !["gap", "gap-type", "type"].includes(q.kind)) {
          assert.equal(second.kind, "choice", q.id);
          assert.ok(second.options.length <= 4, q.id);
        }
        assert.equal(second.answerVisible, true, q.id);
        assert.equal(second.ability, "supported-repair", q.id);
        assert.equal(repairStep(second), null, q.id);
      }
  });
}
