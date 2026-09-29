import { assessAnswer, normalizeAnswer } from "./answer-assessment.js";
import { isClosedVocabulary } from "./support.js";
export function createGrader({ stepById, knownForms, assessmentPolicy }) {
  function gradeAnswer(step, answer, run = {}) {
    if (step.kind === "writing")
      return {
        status: "self-reviewed",
        message: "Writing saved.",
        detail: "",
      };
    const typed =
      ["type", "gap-type"].includes(step.kind) && !run.help?.includes("words");
    const authored = stepById.get(step.id);
    // Explicit assessment contracts supply canonical forms for saved tasks.
    // Distinct accepted forms can differ only by their diacritics.
    const answers =
      !step.assessmentPolicy && authored?.assessmentPolicy
        ? authored.answers
        : step.answers || [];
    if (step.kind === "match")
      return {
        status: "correct",
        message: "Correct!",
        detail: "All meanings matched.",
      };
    if (step.kind === "edit" && run.editIndex !== step.editIndex)
      return {
        status: "incorrect",
        message: "Check which word needs changing.",
        detail: step.correction,
      };
    // Grade new responses using the task contract; recorded events are immutable.
    const policy =
      step.assessmentPolicy || authored?.assessmentPolicy || assessmentPolicy;
    const assessment = assessAnswer(answer, {
      answers,
      incorrectAnswers: step.wrong,
      spelling: typed ? policy?.spelling || "strict" : "strict",
      knownForms,
      vocabularyTypos:
        typed &&
        isClosedVocabulary(authored || step) &&
        (authored || step).ability === "word-recall" &&
        !["form-recall", "form-choice"].includes(step.ability),
      unknown:
        !typed ||
        step.kind === "gap-type" ||
        isClosedVocabulary(authored || step)
          ? "incorrect"
          : "unassessed",
      partialIsIncorrect: typed,
    });
    if (assessment.outcome === "correct")
      return {
        assessment,
        status: "correct",
        message: "Correct!",
        detail: "",
      };
    if (assessment.outcome === "spelling")
      return {
        assessment,
        status: "spelling",
        message:
          assessment.reason === "vocabulary-typo"
            ? "Check the spelling:"
            : normalizeAnswer(assessment.matchedAnswer).includes(" ")
              ? "Right phrase. Check the spelling:"
              : "Right word. Check the spelling:",
        detail: assessment.matchedAnswer,
      };
    if (assessment.outcome === "incorrect")
      return {
        assessment,
        status: "incorrect",
        message: "Not quite.",
        detail: step.correction,
      };
    return {
      assessment,
      status: "unassessed",
      message: "One way to say it:",
      detail: step.answers[0],
    };
  }
  return gradeAnswer;
}
