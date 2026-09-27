import { normalizeAnswer } from "./answer-assessment.js";

export const words = (text) =>
  text
    .replace(/[.,!?;:“”"‘’]/g, "")
    .split(/\s+/)
    .filter(Boolean);
export const chunks = (xs, n = 3) =>
  Array.from({ length: Math.ceil(xs.length / n) }, (_, i) =>
    xs.slice(i * n, i * n + n),
  );
export const gapAnswer = (item) => {
  if (!item.cloze?.includes("___")) return null;
  const [before, after] = item.cloze.split("___");
  if (!item.lt.startsWith(before) || !item.lt.endsWith(after))
    throw new Error(`Invalid gap: ${item.id}`);
  return item.lt.slice(before.length, after ? -after.length : undefined);
};
export function model(id, title, pairs, note, targets, focus) {
  return {
    id,
    kind: "model",
    title,
    pairs,
    note,
    targets,
    ...(focus ? { focus } : {}),
  };
}
export function repairFor(step, answer) {
  if (!step.answers?.length) return null;
  const gap = ["gap", "gap-type"].includes(step.kind);
  return {
    ...step,
    id: `${step.id}-repair`,
    kind: gap ? "gap" : "choice",
    ability: "supported-repair",
    repair: true,
    teaching: step.correction,
    thread: undefined,
    continuation: undefined,
    options: [...new Set([step.answers[0], answer, ...(step.options || [])])],
    instruction: "Use the correction, then choose.",
  };
}

// Source items remain traceable; response modes are chosen by the actual demand.
// No whole-sentence typing is generated from a dictionary entry or a grammar rule.
export function responseFor(item, suffix = "recall") {
  const gap = gapAnswer(item);
  const short = words(item.lt).length <= 3;
  const kind = gap ? "gap-type" : short ? "type" : "bank";
  const answers = gap ? [gap] : [item.lt, ...(item.alternatives || [])];
  return {
    id: `a-${item.id}-${suffix}`,
    target: item.id,
    reviewKey: `${item.id}:${gap ? "form" : short ? "word" : "construction"}`,
    sourceIds: [item.id],
    kind,
    ability: gap ? "form-recall" : short ? "word-recall" : "construction",
    source: gap ? item.cloze : item.en,
    ...(gap ? { translation: item.en } : {}),
    answers,
    words: words(answers[0]),
    instruction: gap
      ? "Complete the sentence."
      : short
        ? "Write in Lithuanian."
        : "Build the Lithuanian.",
    hint:
      item.cue ||
      (gap
        ? "Check the person, time or preposition beside the gap."
        : "Recall the meaning from the earlier examples."),
    correction: item.correction || `${item.lt} — ${item.en}`,
  };
}

export function teachGroup({
  id,
  title,
  goal,
  pages,
  items,
  note,
  contrasts = {},
}) {
  const pairs = items.map((i) => [i.lt, i.en]);
  const focus = items.map((i) => gapAnswer(i) || i.lt);
  const steps = [
    model(
      `${id}-model`,
      title,
      pairs,
      note,
      items.map((i) => i.id),
      focus,
    ),
  ];
  // Recognition uses only meanings actually introduced in this group. Singletons
  // go straight to supported construction; never invent an unrelated distractor.
  for (const item of items) {
    const options = [...new Set(items.map((i) => i.en))];
    if (options.length > 1)
      steps.push({
        id: `a-${item.id}-meaning`,
        kind: "choice",
        target: item.id,
        reviewKey: `${item.id}:meaning`,
        sourceIds: [item.id],
        ability: "meaning",
        source: item.lt,
        instruction: "Choose the meaning.",
        options,
        answers: [item.en],
        hint: "Compare the meanings in this group.",
        correction: `${item.lt} — ${item.en}`,
      });
  }
  const uniquePairs = pairs.filter(
    (p, i) =>
      pairs.findIndex(
        (x) => normalizeAnswer(x[0]) === normalizeAnswer(p[0]) || x[1] === p[1],
      ) === i,
  );
  if (
    uniquePairs.length >= 2 &&
    items.every((i) => !gapAnswer(i) && words(i.lt).length <= 3)
  )
    steps.push({
      id: `${id}-match`,
      kind: "match",
      ability: "recognition",
      target: items[0].id,
      source: "Match the words and meanings.",
      instruction: "Choose either side first.",
      pairs: uniquePairs,
      hint: "Match each expression to its meaning.",
      correction: "Compare the pairs in the example.",
    });
  for (const item of items) {
    const q = responseFor(item, "guided");
    const gap = gapAnswer(item);
    const choices = gap && contrasts[gap];
    if (choices?.length > 1) {
      steps.push({
        ...q,
        kind: "gap",
        ability: "form-choice",
        options: choices,
        formAlternatives: choices,
        wrong: choices.filter((x) => x !== gap),
      });
    } else if (words(item.lt).length > 1) {
      steps.push({
        ...q,
        kind: "bank",
        ability: "construction",
        source: item.en,
        translation: undefined,
        answers: [item.lt, ...(item.alternatives || [])],
        words: words(item.lt),
        instruction: "Build the Lithuanian.",
      });
    }
  }
  // Retrieval follows the entire recognition/construction round, not a visible model.
  for (const item of items) steps.push(responseFor(item));
  return {
    id,
    title,
    goal,
    sourcePages: pages,
    newLanguage: items.map((i) => gapAnswer(i) || i.lt),
    returns: [],
    steps,
  };
}

// Required returns are part of course continuation. Every bounded productive
// target gets two later attempts, with at least one complete intervening lesson.
// Matching, banks, reading and writing never masquerade as productive recall.
export function scheduleReturns(lessons, chapter) {
  const originals = lessons.flatMap((l, index) =>
    l.steps
      .filter(
        (q) =>
          ["type", "gap-type"].includes(q.kind) &&
          !q.plannedReturn &&
          !q.changedContext,
      )
      .map((q) => ({ q, index, lesson: l.id })),
  );
  for (let n = 0; n < 4; n++)
    lessons.push({
      id: `a-c${chapter}-consolidate-${n + 1}`,
      title: [
        "Bring the chapter together",
        "Words and forms in use",
        "Recall across topics",
        "One more mixed return",
      ][n],
      goal: "Retrieve words and forms from different parts of the chapter.",
      sourcePages: "review",
      newLanguage: [],
      returns: [],
      steps: [],
    });
  const ensureRoom = (start) => {
    let index = start;
    for (;;) {
      while (lessons.length <= index)
        lessons.push({
          id: `a-c${chapter}-return-${lessons.length}`,
          title: "Recall across topics",
          goal: "Retrieve earlier words and forms without the examples.",
          sourcePages: "review",
          newLanguage: [],
          returns: [],
          steps: [],
        });
      if (lessons[index].steps.filter((q) => q.plannedReturn).length < 9)
        return index;
      index++;
    }
  };
  for (const { q, index, lesson } of originals) {
    let destination = ensureRoom(index + 3);
    for (let visit = 1; visit <= 2; visit++) {
      const l = lessons[destination];
      l.steps.push({
        ...q,
        id: `${q.id}-return-${visit}`,
        plannedReturn: true,
        returnOf: q.id,
        taughtIn: lesson,
      });
      if (l.returns.length < 3 && !l.returns.includes(q.answers[0]))
        l.returns.push(q.answers[0]);
      if (visit < 2) destination = ensureRoom(destination + 3);
    }
  }
  // Empty review slots cannot count as intervening lessons. Populate them by
  // delaying existing second returns from earlier teaching lessons; do not add
  // duplicate questions just to manufacture spacing or drop the empty slots
  // and silently make the late returns adjacent.
  for (const [index, lesson] of lessons.entries()) {
    if (lesson.steps.length) continue;
    for (let count = 0; count < 3; count++) {
      const donor = lessons
        .slice(0, index)
        .findLast(
          (l) =>
            l.steps.some((q) => !q.plannedReturn) &&
            l.steps.some((q) => q.plannedReturn && q.id.endsWith("-return-2")),
        );
      if (!donor) break;
      const at = donor.steps.findLastIndex(
        (q) => q.plannedReturn && q.id.endsWith("-return-2"),
      );
      lesson.steps.push(...donor.steps.splice(at, 1));
    }
  }
  for (const lesson of lessons)
    lesson.returns = [
      ...new Set(
        lesson.steps.filter((q) => q.plannedReturn).map((q) => q.answers[0]),
      ),
    ].slice(0, 3);
  return lessons.filter((l) => l.steps.length);
}
