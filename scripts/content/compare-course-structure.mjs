// Inspect the supplied archive and executable course; never modifies app content.
// Usage: node scripts/content/compare-course-structure.mjs course.json resource-dir output-dir
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { createHash } from "node:crypto";
import { chapters, lessons, courseSteps } from "../../src/curriculum.js";
import { emptyProgress, sessionItems, exerciseFor } from "../../src/engine.js";

const [archivePath, resourceDirectory, outputDirectory] = process.argv.slice(2);
if (!archivePath || !resourceDirectory || !outputDirectory)
  throw new Error(
    "Expected extracted course JSON, downloaded resource directory, and output directory",
  );
await mkdir(outputDirectory, { recursive: true });
const bytes = await readFile(archivePath);
const course = JSON.parse(bytes).currentCourse;
const manifest = JSON.parse(
  await readFile(join(resourceDirectory, "manifest.json")),
);
const count = (xs, key = (x) => x) =>
  xs.reduce((out, x) => {
    const k = key(x);
    out[k] = (out[k] || 0) + 1;
    return out;
  }, {});
const csv = (rows) =>
  rows
    .map((row) =>
      row
        .map((v) => '"' + String(v ?? "").replaceAll('"', '""') + '"')
        .join(","),
    )
    .join("\n") + "\n";
const skills = new Map(course.skills.flat().map((s) => [s.id, s]));
const skillName = (id) => skills.get(id)?.shortName || id;
const units = course.pathSectioned.flatMap((s) =>
  s.units.map((u) => ({ ...u, section: s.index + 1, sectionType: s.type })),
);
const nodes = units.flatMap((u) =>
  u.levels.map((n) => ({
    ...n,
    unit: u.unitIndex + 1,
    section: u.section,
    sectionType: u.sectionType,
  })),
);
const mainNodes = nodes.filter((n) => n.sectionType === "learning");
const firstSkillUnit = new Map();
for (const n of mainNodes)
  if (n.type === "skill" && !firstSkillUnit.has(n.pathLevelMetadata.skillId))
    firstSkillUnit.set(n.pathLevelMetadata.skillId, n.unit);
const seq = (n) => {
  const d = n.pathLevelClientData;
  const detail =
    n.type === "skill"
      ? `${n.debugName} [crown ${d.crownLevelIndex}]`
      : ["practice", "unit_review"].includes(n.type)
        ? (d.skillIds || []).map(skillName).join(" + ")
        : n.debugName;
  return `${n.type}/${n.subtype}: ${detail} (${n.totalSessions} sessions)`;
};
await writeFile(
  join(outputDirectory, "duolingo-esfen286-units.csv"),
  csv([
    [
      "unit",
      "section",
      "section_type",
      "cefr",
      "objective",
      "declared_sessions_excluding_chests",
      "ordered_nodes",
      "guidebook_url",
    ],
    ...units.map((u) => [
      u.unitIndex + 1,
      u.section,
      u.sectionType,
      u.cefrLevel,
      u.teachingObjective,
      u.levels
        .filter((n) => n.type !== "chest")
        .reduce((sum, n) => sum + n.totalSessions, 0),
      u.levels.map(seq).join(" -> "),
      u.guidebook?.url,
    ]),
  ]),
);

// Fix randomness only in this audit process, for repeatable checkpoint samples.
Math.random = () => 0.5;
const plannedTasks = [];
const localSteps = courseSteps.map((s, i) => {
  const tasks = sessionItems(emptyProgress(), s);
  const exercises = tasks.map((t) => exerciseFor(t, { level: 5 }, () => 0.5));
  plannedTasks.push(
    ...exercises.map((e) => ({
      type: e.type,
      activity: e.item.activity || "translation-or-form",
      chapter: s.chapter + 1,
    })),
  );
  return {
    session: i + 1,
    id: s.id,
    classId: s.classId,
    chapter: s.chapter + 1,
    phase: s.phase,
    targetCount: s.items.length,
    taskCount: tasks.length,
    exerciseTypes: count(exercises, (e) => e.type),
  };
});
const classRows = lessons.map((l) => {
  const steps = localSteps.filter(
    (s) => s.classId === l.id && s.phase !== "checkpoint",
  );
  return {
    id: l.id,
    chapter: l.chapter + 1,
    title: l.title,
    kind: l.kind,
    optional: !!l.optional,
    coreTargets: l.items.filter((i) => i.role === "core").length,
    contextTargets: l.items.filter((i) => i.role === "context").length,
    firstSession: steps[0]?.session,
    lastSession: steps.at(-1)?.session,
  };
});
await writeFile(
  join(outputDirectory, "sakyk-course-classes.csv"),
  csv([
    [
      "chapter",
      "class_id",
      "title",
      "kind",
      "optional",
      "core_targets",
      "context_targets",
      "first_main_session",
      "last_main_session_excluding_checkpoints",
    ],
    ...classRows.map((l) => [
      l.chapter,
      l.id,
      l.title,
      l.kind,
      l.optional,
      l.coreTargets,
      l.contextTargets,
      l.firstSession,
      l.lastSession,
    ]),
  ]),
);
await writeFile(
  join(outputDirectory, "sakyk-course-sessions.csv"),
  csv([
    [
      "session",
      "chapter",
      "class_id",
      "phase",
      "planned_tasks_without_dynamic_review",
      "exercise_types",
    ],
    ...localSteps.map((s) => [
      s.session,
      s.chapter,
      s.classId,
      s.phase,
      s.taskCount,
      JSON.stringify(s.exerciseTypes),
    ]),
  ]),
);

const resourcePresence = {},
  resourceElements = {};
const resources = [];
for (const ref of manifest) {
  if (ref.status !== "ok") {
    resources.push(ref);
    continue;
  }
  const dataBytes = await readFile(join(resourceDirectory, ref.name + ".json"));
  if (createHash("sha256").update(dataBytes).digest("hex") !== ref.sha256)
    throw new Error(`Resource hash mismatch: ${ref.name}`);
  const data = JSON.parse(dataBytes),
    found = [];
  const walk = (x) => {
    if (!x || typeof x !== "object") return;
    if (x.type && x.element !== undefined) found.push("element:" + x.type);
    for (const [k, v] of Object.entries(x)) {
      if (
        ["tts", "ttsURL"].includes(k) &&
        typeof v === "string" &&
        v.startsWith("https://")
      )
        found.push("audio");
      if (k === "hintTable") found.push("hintTable");
      if (k === "styledString" && v.text === "TIP") found.push("tipMarker");
      walk(v);
    }
  };
  walk(data);
  resourcePresence[ref.kind] ||= {};
  resourceElements[ref.kind] ||= {};
  for (const k of new Set(found))
    resourcePresence[ref.kind][k] = (resourcePresence[ref.kind][k] || 0) + 1;
  for (const k of found)
    resourceElements[ref.kind][k] = (resourceElements[ref.kind][k] || 0) + 1;
  resources.push({ ...ref, features: count(found) });
}
await writeFile(
  join(outputDirectory, "duolingo-resource-manifest.json"),
  JSON.stringify(resources, null, 2) + "\n",
);

const firstNode = (type, subtype) => {
  const index = mainNodes.findIndex(
    (n) => n.type === type && (!subtype || n.subtype === subtype),
  );
  const n = mainNodes[index];
  return {
    unit: n.unit,
    node: n.absoluteNodeIndex + 1,
    name: n.debugName,
    declaredSessionStartExcludingChests:
      1 +
      mainNodes
        .slice(0, index)
        .filter((n) => n.type !== "chest")
        .reduce((sum, n) => sum + n.totalSessions, 0),
  };
};
const practiceLags = mainNodes
  .filter((n) => n.type === "practice" && n.subtype === "practice")
  .flatMap((n) =>
    (n.pathLevelClientData.skillIds || []).map(
      (id) => n.unit - firstSkillUnit.get(id),
    ),
  )
  .filter(Number.isFinite)
  .sort((a, b) => a - b);
const storyDelays = [];
const seenStories = new Map();
for (const n of mainNodes.filter((n) => n.type === "story")) {
  const id = n.pathLevelClientData.storyId;
  if (n.subtype === "read" && !seenStories.has(id)) seenStories.set(id, n.unit);
  if (n.subtype === "listen" && seenStories.has(id))
    storyDelays.push(n.unit - seenStories.get(id));
}
const summary = {
  provenance: {
    source: "https://duolingodata.com/json/esfen286.7z",
    extractedJsonSha256: createHash("sha256").update(bytes).digest("hex"),
    numbering:
      "One-based units, chapters, nodes, and session positions in this report.",
    localTaskMethod:
      "Authored session tasks with empty history and level 5 supplied to exerciseFor, exposing each taskStage. Excludes dynamic review, errors, retries, and actual learner timing. Matching is counted as one exercise slot, not one pair.",
    interpretation:
      "Linked JSON schemas were inventoried exhaustively; content close-reading is documented separately. Path nodes are not individual questions. No normal-lesson challenge bank is contained in the archive.",
  },
  duolingo: {
    direction: { from: course.fromLanguage, learning: course.learningLanguage },
    sections: course.pathSectioned.map((s) => {
      const ns = nodes.filter((n) => n.section === s.index + 1);
      return {
        section: s.index + 1,
        type: s.type,
        cefr: s.cefr,
        units: s.units.length,
        firstUnit: s.units[0].unitIndex + 1,
        lastUnit: s.units.at(-1).unitIndex + 1,
        nodeTypes: count(ns, (n) => n.type + "/" + n.subtype),
        declaredSessionsExcludingChests: ns
          .filter((n) => n.type !== "chest")
          .reduce((sum, n) => sum + n.totalSessions, 0),
      };
    }),
    regularSkillCrownLevels: count(
      mainNodes.filter((n) => n.type === "skill" && n.subtype === "regular"),
      (n) => n.pathLevelClientData.crownLevelIndex,
    ),
    regularSkillIds: new Set(
      mainNodes
        .filter((n) => n.type === "skill" && n.subtype === "regular")
        .map((n) => n.pathLevelMetadata.skillId),
    ).size,
    grammarInsertions: mainNodes
      .filter((n) => n.type === "skill" && n.subtype === "grammar")
      .map((n) => ({
        unit: n.unit,
        name: n.debugName,
        objective: n.pathLevelClientData.teachingObjective,
      })),
    firstStory: firstNode("story", "read"),
    firstStoryListening: firstNode("story", "listen"),
    firstRadio: firstNode("duo_radio"),
    declaredEarlierSkillReferenceLagUnits: {
      min: practiceLags[0],
      median: practiceLags[Math.floor(practiceLags.length / 2)],
      max: practiceLags.at(-1),
      referenceCount: practiceLags.length,
    },
    storyReadToListenUnitLag: count(storyDelays),
    resourceStatuses: count(resources, (r) => r.kind + ":" + r.status),
    resourcePresence,
    resourceElements,
  },
  sakyk: {
    chapters: chapters.map((ch, i) => {
      const ls = classRows.filter((l) => l.chapter === i + 1 && !l.optional),
        ss = localSteps.filter((s) => s.chapter === i + 1);
      return {
        chapter: i + 1,
        title: ch.title,
        classes: ls.length,
        coreTargets: ls.reduce((n, l) => n + l.coreTargets, 0),
        sessions: ss.length,
        firstSession: ss[0].session,
        lastSession: ss.at(-1).session,
        firstReadingSession: ls.find((l) => l.kind === "reading")?.firstSession,
        writingSession: ls.find((l) => l.kind === "writing")?.firstSession,
        firstCheckpointSession: ss.find((s) => s.phase === "checkpoint")
          ?.session,
        exerciseTypes: count(
          plannedTasks.filter((t) => t.chapter === i + 1),
          (t) => t.type,
        ),
      };
    }),
    intendedExerciseTypes: count(plannedTasks, (t) => t.type),
    intendedActivityTypes: count(plannedTasks, (t) => t.activity),
    first40Sessions: localSteps.slice(0, 40),
    stageExamples: [
      "c1-lex-people-and-possession",
      "c1l2",
      "c1l7",
      "c1-situation-classmate",
      "c1-writing",
    ].map((id) => {
      const l = lessons.find((l) => l.id === id),
        i = l.items.find((i) => i.role === "core");
      return {
        classId: id,
        kind: l.kind,
        target: i.lt,
        stages: Array.from({ length: 6 }, (_, stage) => {
          const e = exerciseFor(
            { ...i, taskStage: stage },
            { level: 5 },
            () => 0.5,
          );
          return {
            stage,
            type: e.type,
            prompt: e.prompt,
            answer: e.answer,
            options: e.type === "choice" ? e.options : undefined,
          };
        }),
      };
    }),
  },
};
await writeFile(
  join(outputDirectory, "course-structure-comparison.json"),
  JSON.stringify(summary, null, 2) + "\n",
);
console.log(
  JSON.stringify(
    {
      units: units.length,
      localClasses: classRows.length,
      localSessions: localSteps.length,
      resources: resources.length,
      intendedExerciseTypes: summary.sakyk.intendedExerciseTypes,
      firstStory: summary.duolingo.firstStory,
      firstRadio: summary.duolingo.firstRadio,
      practiceLags: summary.duolingo.declaredEarlierSkillReferenceLagUnits,
    },
    null,
    2,
  ),
);
