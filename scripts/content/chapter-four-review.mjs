import { mkdir, writeFile } from "node:fs/promises";
import { authoredChapter } from "../../src/remaining-curriculum.js";
import { chapterFourOutcomes } from "../../src/chapter-four-outcomes.js";
const course = authoredChapter(4);
const path = "docs/evidence/chapter-four";
await mkdir(path, { recursive: true });
const steps = course.lessons.flatMap((l, i) =>
  l.steps.map((q) => ({ ...q, lesson: l.id, position: i + 1 })),
);
const task = (id) => {
  const q = steps.find((q) => q.id === id);
  if (!q) throw new Error(`Missing chapter 4 evidence: ${id}`);
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
      outcomes: chapterFourOutcomes.map((o) => ({
        ...o,
        models: o.models.map((id) => task(`a-c4-route-${id}`)),
        checks: (o.checks || []).map(task),
        applications: (o.applications || []).map(task),
      })),
      remainingRisks: [
        "Wider vocabulary retains repetitive dictionary scaffolding; revised functional teaching is not a full editorial approval of that scaffold.",
        "Room-number questions, hosting phrases and infinitive need have narrower new-context evidence than core case, agreement and permission contrasts.",
        "Social replies use choices. Reading displays the text; writing is self-reviewed. Neither establishes spontaneous spoken interaction.",
        "Two copied course returns provide opportunities, not proof of retention; mastery still requires unaided evidence across later visits.",
      ],
    },
    null,
    2,
  ) + "\n",
);
console.log(
  `Wrote ${path}/teaching-review.json: ${chapterFourOutcomes.length} source functions.`,
);
