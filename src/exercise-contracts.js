import { model, words } from "./course-authoring.js";

// Shared response contracts only. Authors supply the actual contrasts, language,
// prerequisites and later combinations; this does not generate a teaching plan.
export function createExerciseAuthoring(chapter, pages) {
  const prefix = `a-c${chapter}-route-`;
  const target = (key) => `c${chapter}-route:${key}`;
  const M = (key, title, pairs, note, keys, focus) =>
    model(`${prefix}${key}`, title, pairs, note, keys.map(target), focus);
  const C = (key, concept, source, options, answer, correction) => ({
    id: `${prefix}${key}`,
    kind: "choice",
    ability: "meaning",
    target: target(concept),
    reviewKey: `${target(concept)}:meaning`,
    source,
    instruction: "Choose the meaning.",
    options,
    answers: [answer],
    hint: "Look at the part of the sentence that changes the meaning.",
    correction,
  });
  const G = (
    key,
    concept,
    source,
    translation,
    answer,
    other,
    correction,
    typed = false,
  ) => ({
    id: `${prefix}${key}`,
    kind: typed ? "gap-type" : "gap",
    ability: typed ? "form-recall" : "form-choice",
    target: target(concept),
    reviewKey: target(concept),
    source,
    translation,
    instruction: "Complete the sentence.",
    answers: [answer],
    ...(typed ? {} : { options: [answer, ...other] }),
    words: [answer, ...other],
    formAlternatives: [answer, ...other],
    wrong: other,
    hint: "Check what the sentence needs to say. You can open the example for help.",
    correction,
    contentVersion: 2,
  });
  const B = (key, concept, source, answer, distractors = []) => ({
    id: `${prefix}${key}`,
    kind: "bank",
    ability: "construction",
    target: target(concept),
    reviewKey: `${target(concept)}:construction`,
    source,
    instruction: "Build the Lithuanian.",
    answers: [answer],
    words: [...words(answer), ...distractors],
    hint: "Use the examples to check the word order.",
    correction: answer,
  });
  const L = (key, title, goal, requires, provides, steps) => ({
    id: `${prefix}${key}`,
    title,
    goal,
    sourcePages: pages,
    requires,
    provides,
    reviewStatus: "authored-functional-route",
    newLanguage: [],
    returns: [],
    steps,
  });
  function chat(
    key,
    concept,
    source,
    gloss,
    instruction,
    answer,
    other,
    next,
    followGloss,
    extra = {},
  ) {
    return {
      id: `${prefix}${key}`,
      kind: "chat-choice",
      ability: "social-reply",
      target: target(concept),
      reviewKey: `${target(concept)}:reply`,
      speaker: "Rasa",
      source,
      gloss,
      instruction,
      options: [answer, other],
      answers: [answer],
      next,
      followGloss,
      wrongNext: next,
      wrongFollowGloss: followGloss,
      hint: `Your reply should mean: ${instruction}`,
      correction: answer,
      ...extra,
    };
  }

  return { prefix, target, M, C, G, B, L, chat };
}
