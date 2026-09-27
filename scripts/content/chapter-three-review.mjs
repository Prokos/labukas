import { mkdir, writeFile } from "node:fs/promises";
import { authoredChapter } from "../../src/remaining-curriculum.js";
import { chapterThreeOutcomes } from "../../src/chapter-three-outcomes.js";
const course = authoredChapter(3);
const path = "docs/evidence/chapter-three";
await mkdir(path, { recursive: true });
const steps = course.lessons.flatMap((l, index) =>
  l.steps.map((q) => ({ ...q, lesson: l.id, position: index + 1 })),
);
const task = (id) => {
  const q = steps.find((q) => q.id === id);
  if (!q) throw new Error(`Missing review evidence: ${id}`);
  return q;
};
await writeFile(
  `${path}/teaching-review.json`,
  JSON.stringify(
    {
      status:
        "Internal teaching revision; not independently teacher-reviewed or learner-validated",
      counts: {
        lessons: course.lessons.length,
        authoredLessons: course.lessons.filter((l) => l.reviewStatus).length,
        screens: steps.length,
        distinctChangedContexts: steps.filter(
          (q) => q.changedContext && !q.plannedReturn,
        ).length,
        copiedReturns: steps.filter((q) => q.plannedReturn).length,
        retiredLessons: course.retiredLessons.map((l) => l.id),
      },
      outcomes: chapterThreeOutcomes.map((outcome) => ({
        ...outcome,
        models: outcome.models.map((id) => task(`a-c3-route-${id}`)),
        checks: (outcome.checks || []).map(task),
        applications: (outcome.applications || []).map(task),
      })),
      remainingRisks: [
        "Wider vocabulary still uses a repetitive scaffold; individual dictionary recall does not prove flexible use.",
        "Questions, ticket exchanges and social replies have narrower transfer evidence than the core grammatical contrasts.",
        "Writing is self-reviewed; pronunciation, listening and spontaneous conversation are not assessed.",
        "Older historical answer events are preserved under their original evidence policy, not retroactively certified by the new exposure guard.",
      ],
    },
    null,
    2,
  ) + "\n",
);
console.log(
  `Wrote ${path}/teaching-review.json: ${chapterThreeOutcomes.length} source functions.`,
);
