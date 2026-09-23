// Read-only audit. Usage: node scripts/content/learning-audit.mjs [course.json] [resource-directory]
import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { join } from "node:path";
import {
  chapters,
  lessons,
  items,
  courseSteps,
  extraSteps,
} from "../../src/curriculum.js";
import { objectives } from "../../src/content/objectives.js";
import { exerciseFor } from "../../src/engine.js";
import { practiceExample } from "../../src/practice.js";
const countBy = (xs, fn) =>
  xs.reduce((out, x) => {
    const key = fn(x);
    out[key] = (out[key] || 0) + 1;
    return out;
  }, {});
const hash = (data) => createHash("sha256").update(data).digest("hex");
const main = lessons.filter((l) => !l.optional);
const vocabulary = items.filter(
  (i) => i.teachingKind === "vocabulary" && i.role === "core",
);
const firstKind = (kind) => {
  const index = courseSteps.findIndex(
    (step) => lessons.find((l) => l.id === step.classId).kind === kind,
  );
  return index < 0
    ? null
    : { oneBasedSession: index + 1, stepId: courseSteps[index].id };
};
const report = {
  generatedOn: new Date().toISOString().slice(0, 10),
  local: {
    chapters: chapters.length,
    mainClasses: main.length,
    optionalClasses: lessons.length - main.length,
    mainSessions: courseSteps.length,
    optionalSessions: extraSteps.length,
    targets: items.length,
    mainClassKinds: countBy(main, (l) => l.kind),
    phases: countBy(courseSteps, (s) => s.phase),
    mappedCommunicativeObjectives: objectives.length,
    targetsWithExplanation: items.filter((i) => i.explanation).length,
    targetsWithTeachingMetadata: items.filter((i) => i.teaching).length,
    targetsWithAlternatives: items.filter((i) => i.alternatives?.length).length,
    targetsWithCloze: items.filter((i) => i.cloze?.includes("___")).length,
    targetsWithAudio: items.filter((i) => i.audio || i.audioUrl || i.ttsURL)
      .length,
    vocabularyTargets: vocabulary.length,
    vocabularyWithSameLessonExactFormExample:
      vocabulary.filter(practiceExample).length,
    first100SessionClassKinds: countBy(
      courseSteps.slice(0, 100),
      (s) => lessons.find((l) => l.id === s.classId).kind,
    ),
    firstReading: firstKind("reading"),
    firstWriting: firstKind("writing"),
    examples: [
      "Ji gyvena Kaune",
      "Mes gyvename centre",
      "Salotos su sūriu",
    ].map((lt) => {
      const item = items.find((i) => i.lt === lt);
      return {
        id: item.id,
        lt: item.lt,
        en: item.en,
        skill: item.skill,
        lesson: item.lesson,
        stagePlan: Array.from({ length: 6 }, (_, stage) => {
          const ex = exerciseFor(
            { ...item, taskStage: stage },
            { level: 5 },
            () => 0.5,
          );
          return {
            stage,
            type: ex.type,
            prompt: ex.prompt,
            answer: ex.answer,
            ...(ex.type === "choice" ? { options: ex.options } : {}),
          };
        }),
      };
    }),
  },
};
if (process.argv[2]) {
  const bytes = await readFile(process.argv[2]);
  const c = JSON.parse(bytes).currentCourse;
  const learning = c.pathSectioned.filter((s) => s.type === "learning");
  const units = c.pathSectioned.flatMap((s) =>
    s.units.map((u) => ({ ...u, sectionIndex: s.index, sectionType: s.type })),
  );
  const nodes = units.flatMap((u) =>
    u.levels.map((n) => ({
      ...n,
      unitIndex: u.unitIndex,
      sectionIndex: u.sectionIndex,
      sectionType: u.sectionType,
    })),
  );
  const skills = c.skills.flat();
  const firstNode = (type) => {
    const node = nodes.find((n) => n.type === type);
    return node
      ? {
          absoluteNodeIndex: node.absoluteNodeIndex,
          sectionIndex: node.sectionIndex,
          unitIndex: node.unitIndex,
        }
      : null;
  };
  const allKeys = new Set();
  const walkKeys = (x) => {
    if (x && typeof x === "object")
      for (const [key, value] of Object.entries(x)) {
        if (!Array.isArray(x)) allKeys.add(key);
        walkKeys(value);
      }
  };
  walkKeys(c);
  report.archive = {
    source: "https://duolingodata.com/json/esfen286.7z",
    extractedJsonBytes: bytes.length,
    extractedJsonSha256: hash(bytes),
    direction: { from: c.fromLanguage, learning: c.learningLanguage },
    courseId: c.id,
    learningSections: learning.length,
    learningUnits: learning.reduce((n, s) => n + s.units.length, 0),
    refreshUnits: units.filter((u) => u.sectionType === "daily_refresh").length,
    sections: c.pathSectioned.map((s) => ({
      index: s.index,
      type: s.type,
      units: s.units.length,
      cefr: s.cefr,
    })),
    nodes: nodes.length,
    nodeTypes: countBy(nodes, (n) => `${n.type}/${n.subtype}`),
    learningNodeTypes: countBy(
      nodes.filter((n) => n.sectionType === "learning"),
      (n) => `${n.type}/${n.subtype}`,
    ),
    nodesExcludingRewardChests: nodes.filter((n) => n.type !== "chest").length,
    declaredSessionSlotsExcludingRewardChests: nodes
      .filter((n) => n.type !== "chest")
      .reduce((n, level) => n + level.totalSessions, 0),
    legacySkillRows: c.skills.length,
    legacySkills: skills.length,
    skillsWithExplanationResource: skills.filter((s) => s.explanation?.url)
      .length,
    skillsWithInlineNotes: skills.filter((s) => s.tipsAndNotes).length,
    smartTipReferences: c.smartTips.length,
    unitsWithGuidebookReference: units.filter((u) => u.guidebook?.url).length,
    distinctStories: new Set(
      nodes
        .filter((n) => n.type === "story")
        .map((n) => n.pathLevelClientData.storyId),
    ).size,
    firstStory: firstNode("story"),
    firstRadio: firstNode("duo_radio"),
    firstEightUnits: units.slice(0, 8).map((u) => ({
      unitIndex: u.unitIndex,
      nodeTypes: countBy(u.levels, (n) => n.type),
      sequence: u.levels.map((n) => ({
        type: n.type,
        subtype: n.subtype,
        sessions: n.totalSessions,
        crownLevelIndex: n.pathLevelMetadata.crownLevelIndex,
      })),
    })),
    declaredInventoryCountsNotContainedContent: {
      words: c.numberOfWords,
      sentences: c.numberOfSentences,
    },
    exercisePayloadKeysPresent: [
      "challenges",
      "correctSolutions",
      "solutionTranslation",
      "tokens",
      "graderVersion",
    ].filter((k) => allKeys.has(k)),
    fieldNames: [...allKeys].sort(),
  };
}
if (process.argv[3]) {
  const dir = process.argv[3],
    manifest = JSON.parse(
      await readFile(join(dir, "reference-manifest.json"), "utf8"),
    );
  report.linkedResourceSample = [];
  for (const ref of manifest) {
    if (ref.status !== "ok") {
      report.linkedResourceSample.push(ref);
      continue;
    }
    const data = JSON.parse(
      await readFile(join(dir, `${ref.name}.json`), "utf8"),
    );
    const elementTypes = [],
      keys = new Set();
    let challenges = 0,
      audioReferences = 0,
      hintTables = 0,
      styledRanges = 0;
    const walk = (x) => {
      if (!x || typeof x !== "object") return;
      if (x.type && x.element !== undefined) {
        elementTypes.push(x.type);
        if (x.type === "challenge") challenges++;
      }
      for (const [k, v] of Object.entries(x)) {
        if (!Array.isArray(x)) keys.add(k);
        if (
          ["tts", "ttsURL"].includes(k) &&
          typeof v === "string" &&
          v.startsWith("https://")
        )
          audioReferences++;
        if (k === "hintTable") hintTables++;
        if (k === "styling" && Array.isArray(v)) styledRanges += v.length;
        walk(v);
      }
    };
    walk(data);
    report.linkedResourceSample.push({
      ...ref,
      elementTypes: countBy(elementTypes, (x) => x),
      challenges,
      audioReferences,
      hintTables,
      styledRanges,
      ...(data.policy
        ? {
            policy: {
              allowedSkillLevels: data.policy.allowedSkillLevels,
              earliestRow: data.policy.earliestRow,
              minimumTimeBetweenShows: data.policy.minimumTimeBetweenShows,
            },
          }
        : {}),
      parameterized: JSON.stringify(data).includes("{{"),
      hasCorrectSolution: Boolean(data.correctSolution),
      keys: [...keys].sort(),
    });
  }
}
console.log(JSON.stringify(report, null, 2));
