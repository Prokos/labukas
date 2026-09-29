import test from "node:test";
import assert from "node:assert/strict";
import { compileCourses } from "../src/curriculum/compiler.js";
const task = {
  id: "word",
  kind: "type",
  target: "coffee",
  instruction: "Write in Lithuanian.",
  answers: ["kava"],
};
const chapter = (steps) => ({
  schemaVersion: 1,
  number: 1,
  lessons: [{ id: "lesson", title: "Coffee", steps }],
});
test("explicit returns resolve independently without changing the base task", () => {
  const base = { ...task, cue: "First letter: k" };
  const [course] = compileCourses([
    chapter([
      base,
      { id: "return", repeat: "word", cue: null, source: "coffee" },
    ]),
  ]);
  assert.equal(course.lessons[0].steps[1].cue, undefined);
  assert.equal(course.lessons[0].steps[0].cue, base.cue);
  course.lessons[0].steps[1].answers.push("water");
  assert.deepEqual(base.answers, ["kava"]);
  assert.deepEqual(course.lessons[0].steps[0].answers, ["kava"]);
});
test("content errors are rejected with exercise identity", () => {
  for (const steps of [
    [task, task],
    [{ id: "return", repeat: "absent" }],
    [
      { id: "one", repeat: "two" },
      { id: "two", repeat: "one" },
    ],
    [{ ...task, kind: "gap-type", source: "___ and ___" }],
    [{ ...task, options: ["tea", "water"] }],
    [{ ...task, options: ["kava", "kava"] }],
  ])
    assert.throws(() => compileCourses([chapter(steps)]));
  assert.throws(
    () => compileCourses([chapter([task]), chapter([task])]),
    /duplicate chapter/,
  );
  assert.throws(
    () => compileCourses([{ ...chapter([task]), dependencies: [2] }]),
    /dependency/,
  );
});
