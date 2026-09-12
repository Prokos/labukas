import { nounForms, pluralForms, pronounForms } from "./content/reference.js";
import {
  items,
  lessons,
  courseSteps,
  classSteps,
  legacyCheckpoints,
  extraSteps,
} from "./curriculum.js";
const itemById = new Map(items.map((i) => [i.id, i]));
const lessonById = new Map(lessons.map((l) => [l.id, l]));
const stepById = new Map(
  [...courseSteps, ...extraSteps, ...legacyCheckpoints].map((s) => [s.id, s]),
);
export const STORAGE_KEY = "labukas.progress.v1";
export const emptyProgress = () => ({ version: 1, events: [] });
export function validateProgress(value) {
  if (!value || value.version !== 1 || !Array.isArray(value.events))
    throw new Error("This is not a Labukas progress backup.");
  const ids = new Set();
  for (const e of value.events) {
    if (
      !e ||
      typeof e.id !== "string" ||
      !Number.isFinite(e.at) ||
      !["answer", "complete", "goal", "lessonPass"].includes(e.type) ||
      ids.has(e.id)
    )
      throw new Error("The progress file contains invalid events.");
    ids.add(e.id);
    if (
      e.type === "answer" &&
      (!itemById.has(e.item) || typeof e.correct !== "boolean")
    )
      throw new Error("The progress file contains an unknown exercise.");
    if (
      e.selfAssessed !== undefined &&
      (e.type !== "answer" ||
        typeof e.selfAssessed !== "boolean" ||
        itemById.get(e.item)?.activity !== "writing" ||
        typeof e.draft !== "string" ||
        e.draft.length > 5000)
    )
      throw new Error("Invalid writing draft.");
    if (
      e.type === "answer" &&
      e.stage !== undefined &&
      (!Number.isInteger(e.stage) || e.stage < 0 || e.stage > 5)
    )
      throw new Error("Invalid exercise stage.");
    if (
      (e.type === "complete" || e.type === "lessonPass") &&
      e.reinforce !== undefined &&
      (!Array.isArray(e.reinforce) ||
        e.reinforce.some(
          (id) =>
            !items.some(
              (i) =>
                i.id === id &&
                (i.lesson === e.lesson ||
                  i.sourceLesson === e.lesson ||
                  (e.type === "lessonPass" &&
                    stepById
                      .get(e.step)
                      ?.items.some((target) => target.id === i.id))),
            ),
        ))
    )
      throw new Error("Invalid lesson review.");
    if (e.type === "complete" && !lessonById.has(e.lesson))
      throw new Error("The progress file contains an unknown lesson.");
    if (e.type === "lessonPass" && stepById.get(e.step)?.classId !== e.lesson)
      throw new Error("Invalid course session.");
    if (e.type === "goal" && ![5, 10, 15, 20].includes(e.value))
      throw new Error("The progress file contains an invalid goal.");
  }
  return value;
}
export function readProgress() {
  try {
    return validateProgress(JSON.parse(localStorage.getItem(STORAGE_KEY)));
  } catch {
    return emptyProgress();
  }
}
export function mergeProgress(...values) {
  const map = new Map();
  for (const p of values)
    for (const e of validateProgress(p).events) map.set(e.id, e);
  return {
    version: 1,
    events: [...map.values()].sort(
      (a, b) => a.at - b.at || a.id.localeCompare(b.id),
    ),
  };
}
export const newId = () =>
  globalThis.crypto.randomUUID?.() ||
  Array.from(globalThis.crypto.getRandomValues(new Uint8Array(16)), (b) =>
    b.toString(16).padStart(2, "0"),
  ).join("");
export const event = (type, data) => ({
  id: newId(),
  type,
  at: Date.now(),
  ...data,
});
export function localDay(time = Date.now()) {
  const d = new Date(time);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
export function stats(progress, now = Date.now()) {
  const records = {};
  const completed = new Set(),
    passedSteps = new Set();
  let activeChapter = 0;
  let xp = 0,
    goal = 10;
  const days = new Set();
  let today = 0;
  for (const e of [...progress.events].sort(
    (a, b) => a.at - b.at || a.id.localeCompare(b.id),
  )) {
    if (e.type === "complete") {
      const l = lessonById.get(e.lesson);
      activeChapter = l.chapter;
      passedSteps.add(classSteps(e.lesson)[0].id);
    }
    if (e.type === "lessonPass") {
      passedSteps.add(e.step);
      activeChapter = stepById.get(e.step).chapter;
    }
    if (e.type === "lessonPass" && stepById.get(e.step)?.classId !== e.lesson)
      throw new Error("Invalid course session.");
    if (e.type === "goal") goal = e.value;
    if (e.type !== "answer") continue;
    days.add(localDay(e.at));
    if (localDay(e.at) === localDay(now)) today++;
    xp += e.correct ? 10 : 2;
    // A self-reviewed draft earns activity credit, never inferred vocabulary mastery.
    if (e.selfAssessed || itemById.get(e.item)?.activity === "writing")
      continue;
    const r = records[e.item] || {
      seen: 0,
      correct: 0,
      streak: 0,
      due: 0,
      last: 0,
      level: 0,
      memoryStreak: 0,
      lastMemory: null,
      production: 0,
    };
    r.level =
      e.stage === undefined
        ? Math.min(1, r.level + (e.correct ? 1 : 0))
        : e.correct
          ? Math.min(5, Math.max(r.level, e.stage + 1))
          : Math.max(0, Math.min(r.level, e.stage) - 1);
    if (!e.correct) {
      r.memoryStreak = 0;
      r.lastMemory = null;
    } else if (r.lastMemory === null || e.at - r.lastMemory >= 4 * 3600000) {
      r.memoryStreak++;
      r.lastMemory = e.at;
    }
    if (e.correct && e.stage >= 4) r.production++;
    r.seen++;
    r.correct += e.correct ? 1 : 0;
    r.streak = e.correct ? r.streak + 1 : 0;
    r.last = e.at;
    r.due =
      e.at +
      (e.correct
        ? [
            0,
            4 * 3600000,
            86400000,
            3 * 86400000,
            7 * 86400000,
            14 * 86400000,
            30 * 86400000,
          ][Math.min(r.memoryStreak, 6)]
        : 60000);
    records[e.item] = r;
  }
  let streak = 0;
  const date = new Date(now);
  if (!days.has(localDay(date))) date.setDate(date.getDate() - 1);
  while (days.has(localDay(date))) {
    streak++;
    date.setDate(date.getDate() - 1);
  }
  for (const l of lessons)
    if (classSteps(l.id).every((step) => passedSteps.has(step.id)))
      completed.add(l.id);
  const nextStep =
    courseSteps.find(
      (step) => step.chapter >= activeChapter && !passedSteps.has(step.id),
    ) || courseSteps.find((step) => !passedSteps.has(step.id));
  return {
    nextStep,
    passedSteps,
    records,
    completed,
    xp,
    goal,
    today,
    streak,
    days,
    due: items.filter((i) => records[i.id]?.due <= now),
    next: lessons.find((l) => l.id === nextStep?.classId),
    learned: Object.values(records).filter(
      (r) => r.memoryStreak >= 2 && r.production >= 2,
    ).length,
  };
}
export const normalize = (s) =>
  s
    .normalize("NFC")
    .toLocaleLowerCase("lt")
    .replace(/[.,!?;:“”"'‘’]/g, "")
    .replace(/\s+/g, " ")
    .trim();
export const shuffle = (a, rng = Math.random) => {
  const copy = [...a];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};
export function clozeAnswer(item) {
  if (!item.cloze?.includes("___")) return null;
  const [before, after] = item.cloze.split("___");
  return item.lt.slice(before.length, after ? -after.length : undefined);
}
export function isCorrect(answer, exercise) {
  const optionalSubject =
    exercise.type === "type" &&
    !exercise.reverse &&
    /^(Aš|Tu|Mes|Jūs) /i.test(exercise.answer)
      ? [exercise.answer.replace(/^(Aš|Tu|Mes|Jūs) /i, "")]
      : [];
  return [
    exercise.answer,
    ...(exercise.alternatives || []),
    ...optionalSubject,
  ].some((a) => normalize(answer) === normalize(a));
}
export function exerciseFor(item, record = {}, rng = Math.random) {
  if (item.activity === "writing")
    return {
      item,
      type: "writing",
      stage: 0,
      prompt: item.question,
      answer: item.lt,
      alternatives: [],
    };
  const cloze = clozeAnswer(item);
  const stage = Math.max(
    0,
    Math.min(5, record.level || 0, item.taskStage ?? 5),
  );
  if (item.activity === "reading")
    return {
      item,
      stage,
      type: stage < 3 ? "choice" : "type",
      reverse: false,
      prompt: item.question,
      answer: item.lt,
      alternatives: item.alternatives || [],
      passage: item.passage,
      options: shuffle([item.lt, ...item.distractors], rng),
    };
  const gap = item.teachingKind === "pattern" && cloze && stage === 0;
  const reverse = stage === 0 && !gap && item.teachingKind !== "conversation";
  const multi = normalize(item.lt).split(" ").length > 1;
  const type =
    stage === 2 &&
    item.taskStage !== undefined &&
    item.teachingKind === "vocabulary" &&
    !multi
      ? "type"
      : stage === 2 &&
          item.taskStage !== undefined &&
          item.teachingKind === "pattern" &&
          cloze
        ? "cloze"
        : stage === 1 && item.teachingKind !== "vocabulary" && multi
          ? "order"
          : stage < 2
            ? "choice"
            : stage === 2
              ? multi
                ? "order"
                : "match"
              : stage === 3
                ? multi
                  ? "order"
                  : "type"
                : stage === 4 && cloze
                  ? "cloze"
                  : "type";
  const peers = shuffle(
    items.filter(
      (i) =>
        i.lesson === item.lesson &&
        (!item.peerIds || item.peerIds.includes(i.id)) &&
        i.id !== item.id &&
        i.en !== item.en &&
        i.lt !== item.lt,
    ),
    rng,
  ).sort((a, b) => (b.chapter === item.chapter) - (a.chapter === item.chapter));
  const matching = [
    item,
    ...peers
      .filter(
        (p, i, all) =>
          all.findIndex((x) => x.lt === p.lt || x.en === p.en) === i,
      )
      .slice(0, 3),
  ];
  const tileWords = (text) =>
    text
      .normalize("NFC")
      .replace(/[.,!?;:“”"'‘’]/g, "")
      .trim()
      .split(/\s+/);
  const words = tileWords(item.lt);
  const extras =
    (stage === 3 || (stage === 2 && item.teachingKind === "conversation")) &&
    multi
      ? shuffle(
          [...new Set(peers.flatMap((p) => tileWords(p.lt)))].filter(
            (w) => !words.some((word) => normalize(word) === normalize(w)),
          ),
          rng,
        ).slice(0, 2)
      : [];
  return {
    item,
    type,
    stage,
    reverse,
    isGap: Boolean(gap),
    prompt: gap ? item.cloze : reverse ? item.lt : item.en,
    answer: gap
      ? cloze
      : reverse
        ? item.en
        : cloze && type === "cloze"
          ? cloze
          : item.lt,
    alternatives: gap || reverse || type === "cloze" ? [] : item.alternatives,
    options: gap
      ? shuffle(
          [
            cloze,
            ...[
              ...new Set([
                ...[...nounForms, ...pluralForms, ...pronounForms]
                  .filter((forms) => forms.includes(cloze))
                  .flat(),
                ...peers
                  .flatMap((i) => [clozeAnswer(i), ...i.lt.split(" ")])
                  .filter(Boolean),
              ]),
            ]
              .filter((w) => normalize(w) !== normalize(cloze))
              .slice(0, 3),
          ],
          rng,
        )
      : shuffle(
          [
            reverse ? item.en : item.lt,
            ...[...new Set(peers.map((i) => (reverse ? i.en : i.lt)))].slice(
              0,
              3,
            ),
          ],
          rng,
        ),
    tokens: shuffle(
      [...words, ...extras].map((text, id) => ({ text, id })),
      rng,
    ),
    hasDistractors: extras.length > 0,
    pairs: matching,
    right: shuffle(matching, rng),
  };
}
export function practiceItems(progress, skill = "all", limit = 8, recent = []) {
  const s = stats(progress);
  const anySeen = Object.keys(s.records).length > 0;
  const pool = items.filter((i) =>
    skill === "all"
      ? Boolean(s.records[i.id]) ||
        (!anySeen && i.lesson === lessons[0].id && i.role === "core")
      : i.skill === skill,
  );
  return shuffle(pool)
    .sort((a, b) => {
      const priority = (i) => {
        const r = s.records[i.id];
        return (
          (recent.includes(i.id) ? -100 : 0) +
          (r
            ? (r.streak === 0 ? 35 : 0) +
              (r.due <= Date.now() ? 20 : 0) +
              (1 - r.correct / r.seen) * 10
            : 5)
        );
      };
      return priority(b) - priority(a);
    })
    .slice(0, limit);
}
// Offer explicit optional consolidation for difficult completed lessons.
export function reinforcement(progress) {
  const completions = new Map();
  for (const e of progress.events)
    if (e.type === "lessonPass") {
      const previous = completions.get(e.lesson);
      if (!previous || e.at > previous.at) completions.set(e.lesson, e);
    }
  for (const lesson of lessons) {
    const completion = completions.get(lesson.id);
    const pending = lesson.items
      .filter((item) => completion?.reinforce?.includes(item.id))
      .filter((item) => {
        let streak = 0;
        for (const e of [...progress.events].sort((a, b) => a.at - b.at))
          if (e.type === "answer" && e.item === item.id && e.at > completion.at)
            streak = e.correct ? streak + 1 : 0;
        return streak < 2;
      });
    if (pending.length) return { lesson, items: pending };
  }
  return null;
}
export function sessionItems(progress, step) {
  const state = stats(progress),
    peerIds = [
      ...new Set([
        ...step.items.map((i) => i.id),
        ...items.filter((i) => state.records[i.id]).map((i) => i.id),
      ]),
    ];
  const task = (item, stage, round) => ({
    ...item,
    peerIds,
    taskStage: stage,
    taskId: `${step.id}:${item.id}:${round}`,
  });
  const rotate = (xs, n) => [
    ...xs.slice(n % xs.length),
    ...xs.slice(0, n % xs.length),
  ];
  let tasks = [];
  if (step.phase === "writing") return step.items.map((i) => task(i, 0, 0));
  if (step.phase === "discover")
    tasks = [0, 1, 2].flatMap((stage, n) =>
      rotate(step.items, n).map((i) => task(i, stage, n)),
    );
  if (step.phase === "guided")
    tasks = [2, 3].flatMap((stage, n) =>
      rotate(step.items, n).map((i) => task(i, stage, n)),
    );
  if (step.phase === "recall")
    tasks = shuffle(step.items).map((i) => task(i, 5, 0));
  if (step.phase === "checkpoint") {
    const checked = new Map();
    for (const event of progress.events)
      if (event.type === "answer" && event.step === step.id)
        checked.set(event.item, (checked.get(event.item) || 0) + 1);
    const selected = [...new Set(step.items.map((i) => i.lesson))].flatMap(
      (id) => {
        const candidates = shuffle(step.items.filter((i) => i.lesson === id));
        candidates.sort(
          (a, b) =>
            (checked.get(a.id) || 0) - (checked.get(b.id) || 0) ||
            (state.records[a.id]?.level || 0) -
              (state.records[b.id]?.level || 0),
        );
        return candidates.slice(0, 2);
      },
    );
    tasks = shuffle(selected).map((i) => task(i, 5, 0));
  }
  if (step.phase === "apply")
    tasks = [
      ...step.items.map((i) => task(i, i.role === "context" ? 2 : 4, 0)),
      ...step.items
        .filter((i) => i.role === "context")
        .map((i) => task(i, i.cloze?.includes("___") ? 4 : 5, 1)),
    ];
  // Include known earlier material even if a learner studies several sessions at once.
  if (step.phase !== "checkpoint") {
    const known = practiceItems(progress)
      .filter(
        (i) => state.records[i.id] && !step.items.some((x) => x.id === i.id),
      )
      .slice(0, 2);
    tasks.push(
      ...known.map((i) =>
        task(i, Math.min(4, state.records[i.id]?.level || 0), "review"),
      ),
    );
  }
  return tasks;
}
export function sessionOutcome(step, attempts) {
  const first = new Map();
  for (const a of attempts)
    if (
      step.items.some((i) => i.id === a.item) &&
      (!a.correct || a.stage === undefined || a.stage >= a.targetStage) &&
      !first.has(a.item)
    )
      first.set(a.item, a.correct);
  const missed = [...first].filter(([, correct]) => !correct).map(([id]) => id);
  const accuracy = first.size ? (first.size - missed.length) / first.size : 0;
  return {
    firstAccuracy: accuracy,
    reinforce: missed.length / Math.max(first.size, 1) > 0.25 ? missed : [],
    passed: step.phase !== "checkpoint" || accuracy >= 0.8,
  };
}
