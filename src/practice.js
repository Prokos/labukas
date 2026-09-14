import { lessons, items, courseSteps } from "./curriculum.js";
import { stats, practiceItems, separateRepeats, localDay } from "./engine.js";

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
export function practiceSession(progress, selection = "all") {
  const records = stats(progress).records;
  const set = typeof selection === "object" ? selection : null;
  const targets = set ? set.items : practiceItems(progress);
  // A known target gets independent retrieval at its current level. New targets
  // get three supported rounds, with retries confined to this same target set.
  const peerIds = targets.map((i) => i.id);
  const rounds = [0, 1, 2].flatMap((round) =>
    targets
      .filter(
        (i) => round === 0 || (!records[i.id] && i.activity !== "writing"),
      )
      .map((i) => ({
        ...i,
        peerIds,
        taskStage: records[i.id]?.level ?? round,
        taskId: `practice:${i.id}:${round}`,
      })),
  );
  return {
    mode: "practice",
    skill: "all",
    title: set?.title || "Your review",
    lesson: set?.lesson,
    practiceSet: set,
    targets: targets.length,
    queue: separateRepeats(rounds),
  };
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
