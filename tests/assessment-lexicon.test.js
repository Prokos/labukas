import test from "node:test";
import assert from "node:assert/strict";
import { buildAssessmentLexicon } from "../src/assessment-lexicon.js";
import { createCourseRuntime } from "../src/authored-course.js";
import { lithuanianAssessmentPolicy } from "../src/lithuanian-assessment-policy.js";

test("canonical index excludes English and invented wrong spellings", () => {
  const forms = buildAssessmentLexicon(
    [
      { kind: "model", pairs: [["aš", "as a pronoun"]] },
      {
        kind: "gap-type",
        source: "___",
        answers: ["sūnūs"],
        wrong: ["sunuss"],
        formAlternatives: ["sūnus"],
      },
      { kind: "choice", answers: ["English only"], options: ["as"] },
    ],
    ["jūs"],
  );
  assert.deepEqual([...forms].sort(), ["aš", "jūs", "sūnus", "sūnūs"].sort());
});

test("new authored lessons get phrase spelling, form protection and strict overrides automatically", () => {
  const step = {
    id: "new",
    kind: "type",
    target: "new",
    answers: ["Šiandien šalta."],
    correction: "Šiandien šalta.",
  };
  const runtime = createCourseRuntime({
    version: 1,
    lessons: [{ id: "lesson", steps: [step] }],
    assessmentPolicy: lithuanianAssessmentPolicy,
  });
  assert.equal(runtime.gradeOpening(step, "Siandien salta").status, "spelling");
  assert.equal(
    runtime.gradeOpening({ ...step, answers: ["Kviečiu jus."] }, "kviečiu jūs")
      .status,
    "incorrect",
  );
  assert.equal(
    runtime.gradeOpening(
      { ...step, assessmentPolicy: { spelling: "strict" } },
      "Siandien salta",
    ).status,
    "unassessed",
  );
});
