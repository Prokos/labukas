import { normalizeAnswer } from "./answer-assessment.js";

export const MAX_CHOICES = 4;
export function shuffleChoices(values) {
  const copy = [...values];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}
export function isClosedVocabulary(step) {
  return (
    step.answerScope === "closed" ||
    (step.ability === "word-recall" &&
      step.answers?.length > 0 &&
      step.answers.every((a) => !normalizeAnswer(a).includes(" ")))
  );
}

// Use only authored alternatives, never the learner's arbitrary wrong text.
// Sentence tiles are not sentence-level multiple-choice alternatives.
export function supportChoices(step) {
  const pool =
    step.supportOptions ||
    step.options ||
    (["gap", "gap-type"].includes(step.kind)
      ? step.formAlternatives || step.words
      : isClosedVocabulary(step)
        ? step.words
        : []) ||
    [];
  if (!pool.length) return [];
  const selected = limitChoices(
    [...new Set([...(step.answers || []), ...pool])],
    step.answers,
  );
  return selected.length > 1 ? selected : [];
}
export function limitChoices(options, answers = []) {
  const accepted = new Set(answers.map(normalizeAnswer));
  const correct = options.find((o) => accepted.has(normalizeAnswer(o)));
  const distractors = options.filter((o) => !accepted.has(normalizeAnswer(o)));
  // Present one accepted answer and genuine alternatives. Multiple accepted
  // synonyms must not fill the entire choice set and make every answer correct.
  const selected = new Set([
    ...(correct === undefined ? [] : [correct]),
    ...distractors.slice(0, MAX_CHOICES - 1),
  ]);
  return options
    .filter((o) => selected.has(o))
    .filter((o, i, a) => a.indexOf(o) === i)
    .slice(0, MAX_CHOICES);
}

// A cue must narrow the decision. Generic instructions to remember or
// compare do not provide actionable assistance.
const placeholder =
  /^(recall |think about the contrast|look at the part of the sentence|check what the sentence needs|use the examples to check|compare the meanings in this group|pair each Lithuanian|match each expression|check the person, time or preposition|look at the person and the word before|build the message around its verb)/i;
export function hintForStep(step) {
  const candidate = step.cue || step.hint;
  const reveals = (step.answers || []).some(
    (a) =>
      normalizeAnswer(a).length > 1 &&
      ` ${normalizeAnswer(candidate || "")} `.includes(
        ` ${normalizeAnswer(a)} `,
      ),
  );
  if (candidate && !placeholder.test(candidate) && !reveals) return candidate;
  if (
    isClosedVocabulary(step) &&
    step.answers?.length &&
    ["type", "gap-type"].includes(step.kind)
  ) {
    return `Starts with “${Array.from(step.answers[0])[0]}”.`;
  }
  return null;
}

export function repairStep(step) {
  if (
    !step.answers?.length ||
    step.repairStage >= 2 ||
    step.kind === "writing" ||
    step.kind === "match"
  )
    return null;
  const baseKind = step.repairOriginalKind || step.kind;
  const common = {
    ...step,
    id: `${step.id}-repair`,
    repair: true,
    repairOriginalKind: baseKind,
    ability: "supported-repair",
    thread: undefined,
    continuation: undefined,
    teaching: undefined,
    answerVisible: false,
  };
  if (step.repairStage === 1) {
    const kind = ["gap", "gap-type"].includes(baseKind)
      ? "gap-type"
      : ["bank", "chat-bank"].includes(baseKind)
        ? "bank"
        : baseKind === "type"
          ? "type"
          : "choice";
    return {
      ...common,
      kind,
      options: kind === "choice" ? step.options : undefined,
      repairStage: 2,
      teaching: step.answers[0],
      answerVisible: true,
      instruction:
        kind === "choice"
          ? "Use the answer above to choose."
          : "Use the answer above to complete this practice step.",
    };
  }
  if (["bank", "chat-bank"].includes(baseKind))
    return {
      ...common,
      kind: "bank",
      options: undefined,
      repairStage: 1,
      instruction: "Build the sentence again.",
    };
  const options = supportChoices(step);
  if (!options.length) return null;
  return {
    ...common,
    kind: ["gap", "gap-type"].includes(baseKind) ? "gap" : "choice",
    options: shuffleChoices(options),
    repairStage: 1,
    instruction: ["gap", "gap-type"].includes(baseKind)
      ? "Choose the missing form."
      : "Choose the answer.",
  };
}
