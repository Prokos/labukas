import { mkdir, writeFile } from "node:fs/promises";
import assert from "node:assert/strict";
import {
  lessons as oldLessons,
  courseSteps,
  items,
} from "../../src/curriculum.js";
import {
  chapterTwoCourse as course,
  chapterTwoReturnPlan,
} from "../../src/chapter-two-content.js";
import { chapterTwoLexicon as lexicon } from "../../src/chapter-two-lexicon.js";
const all = course.lessons.flatMap((l, index) =>
  l.steps.map((q) => ({ ...q, lesson: l.id, lessonIndex: index })),
);
const targetLocations = new Map();
for (const q of all)
  if (q.target)
    targetLocations.set(q.target, [
      ...(targetLocations.get(q.target) || []),
      q,
    ]);
const vocabulary = lexicon.map((w) => {
  const target = `c2-word:${w.lt}`,
    qs = targetLocations.get(target) || [];
  const introduction = all.find((q) => q.lexemes?.includes(w.lt));
  const productive = qs.filter((q) => ["type", "gap-type"].includes(q.kind));
  const first = productive.find((q) => !q.plannedReturn),
    later = productive.find((q) => q.plannedReturn);
  return {
    ...w,
    introduction: introduction?.id,
    lesson: introduction?.lesson,
    recognition: qs.filter((q) => q.options).map((q) => q.id),
    recall: first?.id,
    laterRecall: later?.id,
    laterLesson: later?.lesson,
    interveningLessons:
      first && later ? later.lessonIndex - first.lessonIndex - 1 : null,
  };
});
assert.ok(
  vocabulary.every(
    (w) =>
      w.introduction &&
      w.recognition.length &&
      w.recall &&
      w.laterRecall &&
      w.interveningLessons >= 1,
  ),
);
// Mapping states explicitly distinguish preserved learning objectives from
// identical sentences. Old completion is not converted into new mastery.
const objectiveMap = {
  c2l7: ["c2-preferences", "c2-group-preferences"],
  "c2-dative-people": ["c2-group-preferences"],
  "c2-plural-food": ["c2-plurals"],
  c2l2: ["c2-first-order", "c2-want", "c2-eat-drink"],
  "c2-verb-types": ["c2-want", "c2-eat-drink"],
  "c2-ordering-forms": ["c2-requests", "c2-whole-order"],
  c2l3: ["c2-with-without", "c2-describe"],
  "c2-with-without-forms": ["c2-dish-ingredients"],
  "c2-eat-not-eat": ["c2-objects"],
  c2l8: ["c2-quantities", "c2-describe"],
  "c2-which-food": ["c2-which-kind"],
  "c2-teens": ["c2-teens"],
  "c2-tens": ["c2-tens"],
  "c2-compound-prices": ["c2-pay"],
  c2l4: ["c2-pay", "c2-signs-host"],
  "c2-situation-menu": ["c2-menu-reading"],
  "c2-situation-cafe-exchange": ["c2-chapter-check"],
  "c2-situation-host-drink": ["c2-signs-host"],
  "c2-writing": ["c2-food-reading", "c2-chapter-check"],
};
const old = oldLessons.filter((l) => l.chapter === 1);
const mapping = old.flatMap((l) =>
  l.items.map((i) => {
    const lexical = lexicon.find((w) => w.legacyIds.includes(i.id));
    const lexicalRow = lexical && vocabulary.find((w) => w.lt === lexical.lt);
    const destinations = lexicalRow
      ? [lexicalRow.lesson]
      : objectiveMap[l.id] || [
          ...new Set(
            l.items.flatMap((item) => {
              const w = vocabulary.find((w) => w.legacyIds.includes(item.id));
              return w ? [w.lesson] : [];
            }),
          ),
        ];
    assert.ok(destinations.length, `Unmapped ${i.id}`);
    for (const id of destinations)
      assert.ok(
        course.lessons.some((l) => l.id === id),
        id,
      );
    return {
      oldId: i.id,
      oldClass: l.id,
      lt: i.lt,
      en: i.en,
      role: i.role || "core",
      disposition: lexicalRow
        ? "word teaching, recognition and two recall occasions"
        : "objective retained in rewritten exercises; not an exact sentence copy",
      lessons: destinations,
    };
  }),
);
const report = {
  old: {
    classes: old.length,
    scheduledSessions: courseSteps.filter((s) => s.chapter === 1).length,
    contentItems: items.filter((i) => i.chapter === 1).length,
    uniqueCoreVocabulary: new Set(
      old
        .filter((l) => l.kind === "vocabulary")
        .flatMap((l) =>
          l.items.filter((i) => i.role !== "context").map((i) => i.lt),
        ),
    ).size,
  },
  replacement: {
    lessons: course.lessons.length,
    screens: all.length,
    models: all.filter((q) => q.kind === "model").length,
    assessedOrSelfReviewedTasks: all.filter((q) => q.kind !== "model").length,
    lexicalTargets: vocabulary.length,
    plannedLaterReturns: chapterTwoReturnPlan.length,
    referenceOnlyLexicalTargets: vocabulary.filter((w) => !w.recall).length,
  },
  vocabulary,
  returnPlan: chapterTwoReturnPlan,
  mapping,
  limits: [
    "Counts establish coverage and scheduled opportunities, not retained knowledge.",
    "Rewritten grammar and communication mappings preserve the objective, not every old sentence.",
    "Text adaptations do not establish listening or speaking ability.",
  ],
};
await mkdir("docs/evidence/chapter-two", { recursive: true });
await writeFile(
  "docs/evidence/chapter-two/coverage.json",
  JSON.stringify(report, null, 2),
);
console.log(
  JSON.stringify({ old: report.old, replacement: report.replacement }, null, 2),
);
