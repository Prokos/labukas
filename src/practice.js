import { lessons, items, courseSteps } from "./curriculum.js";
import {
  stats,
  separateRepeats,
  localDay,
  exerciseFor,
  normalize,
} from "./engine.js";

export const practiceGroups = [
  { id: "words", title: "Words & expressions", icon: "BookOpen" },
  { id: "grammar", title: "Grammar in use", icon: "Puzzle" },
  { id: "numbers", title: "Numbers, time & dates", icon: "Clock3" },
  { id: "texts", title: "Reading & writing", icon: "PencilLine" },
];
function groupFor(lesson) {
  if (["reading", "writing"].includes(lesson.kind)) return "texts";
  if (lesson.items.some((i) => i.role === "core" && i.skill === "numbers"))
    return "numbers";
  return lesson.kind === "pattern" ? "grammar" : "words";
}
// Existing introduction groups provide small, authored scopes, independent of skill tags.
export const practiceSets = courseSteps
  .filter((s) => ["discover", "writing"].includes(s.phase))
  .map((step) => {
    const lesson = lessons.find((l) => l.id === step.classId);
    const siblings = courseSteps.filter(
      (s) => s.classId === lesson.id && s.phase === step.phase,
    );
    return {
      id: step.id,
      lesson,
      group: groupFor(lesson),
      chapter: step.chapter,
      title:
        lesson.title +
        (siblings.length > 1
          ? ` · Set ${siblings.indexOf(step) + 1} of ${siblings.length}`
          : ""),
      items: step.items,
    };
  });
export function wordPracticeSet(item) {
  const existing = practiceSets.find((s) =>
    s.items.some((i) => i.id === item.id),
  );
  if (existing) return existing;
  const lesson = lessons.find((l) => l.id === item.lesson);
  return {
    id: `word-${item.id}`,
    title: lesson.title,
    lesson,
    chapter: item.chapter,
    items: [
      item,
      ...lesson.items
        .filter((i) => i.id !== item.id && i.role === "core")
        .slice(0, 2),
    ],
  };
}
export const PRACTICE_BATCH_SIZE = 5;

// Familiarity requires both independent production and recall on separate visits.
// Repeating a word in one sitting alone cannot mark it as internalized.
export function familiarity(record) {
  if (!record || record.level === 0 || record.recentErrors >= 2) return 0;
  if (record.recallVisits >= 2 && record.independentRun >= 2) return 4;
  if (record.independentRun >= 1) return 3;
  if (record.level < 3) return 1;
  return 2;
}
export const familiarityLabels = [
  "Needs support",
  "Recognizing",
  "Building recall",
  "Recalled unaided",
  "Remembered later",
];
export function practiceReason(record) {
  if (record?.recentErrors >= 2)
    return "Recent difficulty · revisit the explanation";
  if (!record || record.level < 2)
    return "Still learning · meaning before recall";
  if (!record.independentRun) return "Ready to try without help";
  if (record.recallVisits < 2)
    return "Recalled in one visit · check again another day";
  return "Recalled across days";
}
export function practiceCollection(records) {
  return items
    .filter((i) => records[i.id])
    .sort((a, b) => {
      const left = records[a.id],
        right = records[b.id];
      return (
        Number(right.recentErrors >= 2) - Number(left.recentErrors >= 2) ||
        (left.recentErrors >= 2 && right.recentErrors >= 2
          ? right.recentErrors - left.recentErrors
          : 0) ||
        familiarity(left) - familiarity(right) ||
        left.level - right.level ||
        (left.recallVisits || 0) - (right.recallVisits || 0) ||
        left.last - right.last ||
        a.id.localeCompare(b.id)
      );
    });
}
export function nextPracticeItems(records) {
  const collection = practiceCollection(records);
  const learning = collection.filter((i) => familiarity(records[i.id]) < 4);
  return (learning.length ? learning : collection).slice(
    0,
    PRACTICE_BATCH_SIZE,
  );
}
// Focus on a word without turning it into consecutive copies of one question.
export function focusedPracticeItems(records, item) {
  const others = practiceCollection(records).filter((i) => i.id !== item.id);
  return [item, ...others].slice(0, PRACTICE_BATCH_SIZE);
}
export function practiceSession(progress, selection = "all") {
  const records = stats(progress).records;
  const set = typeof selection === "object" ? selection : null;
  // Preserve authored introduction sets for callers introducing new material.
  if (set?.items) {
    const rounds = [0, 1, 2].flatMap((round) =>
      set.items
        .filter(
          (i) => round === 0 || (!records[i.id] && i.activity !== "writing"),
        )
        .map((i) => ({
          ...i,
          taskStage: records[i.id]?.level ?? round,
          taskId: `practice:${i.id}:${round}`,
        })),
    );
    return {
      mode: "practice",
      skill: "all",
      title: set.title,
      lesson: set.lesson,
      practiceSet: set,
      targets: set.items.length,
      queue: separateRepeats(rounds),
    };
  }
  const targets = set?.focus
    ? focusedPracticeItems(records, set.focus)
    : nextPracticeItems(records);
  const config = {
    mode: "practice",
    skill: "all",
    title: set?.focus ? `Practice with ${set.focus.lt}` : "Your next words",
    targets: targets.length,
    practiceTargets: targets.map((item) => ({
      ...item,
      needsSupport:
        !records[item.id] ||
        records[item.id].level < 2 ||
        records[item.id].recentErrors >= 2,
    })),
  };
  const first = practiceTurn(config, []);
  return { ...config, queue: first.item ? [first.item] : [] };
}

// A bounded learning loop: explain/recognize as needed, then retrieve twice
// with other targets in between. Support never satisfies the recall goal.
export function practiceTurn(config, attempts) {
  const goal = config.practiceTargets.length === 1 ? 1 : 2;
  const states = config.practiceTargets.map((item) => ({
    item,
    support: item.needsSupport,
    recalls: 0,
    turns: 0,
    failures: 0,
    last: -1,
  }));
  for (const [index, attempt] of attempts.entries()) {
    const state = states.find((s) => s.item.id === attempt.item);
    if (!state) continue;
    state.turns++;
    state.last = index;
    if (!attempt.correct) {
      state.recalls = 0;
      state.support = true;
      state.failures++;
    } else if (attempt.practiceKind === "recognize") state.support = false;
    else {
      state.recalls++;
      state.support = false;
    }
  }
  const complete = (s) => s.recalls >= goal;
  const deferred = (s) => !complete(s) && (s.failures >= 3 || s.turns >= 7);
  const remaining = states.filter((s) => !complete(s) && !deferred(s));
  const report = {
    recalled: states.filter(complete).map((s) => s.item),
    revisit: states.filter((s) => !complete(s)).map((s) => s.item),
    deferred: states.filter(deferred).map((s) => s.item),
  };
  if (!remaining.length || attempts.length >= 35) return report;
  const gap = Math.min(2, states.length - 1);
  const spaced = (s) => s.last < 0 || attempts.length - s.last > gap;
  let candidates = remaining.filter(spaced);
  // A finished word can provide spacing while another target needs repair.
  if (!candidates.length)
    candidates = states.filter((s) => !deferred(s) && spaced(s));
  if (!candidates.length) return report; // Revisit later rather than drill back-to-back.
  const state = candidates.sort((a, b) => a.last - b.last)[0];
  return {
    ...report,
    item: {
      ...state.item,
      practiceKind: state.support ? "recognize" : "recall",
      showModel: state.support,
      taskStage: state.support ? 0 : 5,
      practiceContext:
        !state.support && state.recalls === 1
          ? practiceExample(state.item)
          : null,
      taskId: `practice:${state.item.id}:${attempts.length}`,
    },
  };
}
export function practiceExercise(item) {
  // Distractors come from authored lesson peers, independently of which words
  // are being tested. A one-word batch must never become a one-option quiz.
  const ex = exerciseFor(
    { ...item, peerIds: undefined },
    { level: item.taskStage },
  );
  if (item.practiceContext) {
    const cloze = item.practiceContext.lt
      .split(/(\s+)/)
      .map((part) =>
        normalize(part) === normalize(item.lt)
          ? part.replace(/[\p{L}\p{M}]+/u, "___")
          : part,
      )
      .join("");
    return {
      ...ex,
      type: "cloze",
      cloze,
      contextMeaning: item.practiceContext.en,
      answer: item.lt,
      alternatives: item.alternatives,
      reverse: false,
      stage: 5,
    };
  }
  if (ex.type === "choice" && ex.options.length < 2) {
    // No meaningful choice is available; use supported production instead.
    return exerciseFor({ ...item, taskStage: 5 }, { level: 5 });
  }
  return ex;
}
export function practiceExample(item) {
  const word = normalize(item.lt);
  if (item.teachingKind !== "vocabulary" || word.includes(" ")) return null;
  return lessons
    .find((l) => l.id === item.lesson)
    ?.items.find(
      (example) =>
        example.id !== item.id &&
        example.role === "context" &&
        normalize(example.lt).split(" ").includes(word),
    );
}
const dailyPool = [
  ...new Map(
    items
      .filter(
        (i) =>
          i.teachingKind === "vocabulary" &&
          i.role === "core" &&
          !i.lt.includes(" "),
      )
      .map((i) => [i.lt.toLocaleLowerCase("lt"), i]),
  ).values(),
];
export function dailyWord(now = Date.now()) {
  const day = Math.floor(Date.parse(localDay(now) + "T00:00:00Z") / 86400000);
  return dailyPool[
    ((day % dailyPool.length) + dailyPool.length) % dailyPool.length
  ];
}
