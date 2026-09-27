import { mkdir, writeFile } from "node:fs/promises";
import { authoredChapters } from "../../src/remaining-curriculum.js";
const rows = authoredChapters.map((c) => {
  const qs = c.lessons.flatMap((l) => l.steps);
  return {
    chapter: c.number,
    lessons: c.lessons.length,
    screens: qs.length,
    models: qs.filter((q) => q.kind === "model").length,
    responseModes: [
      ...new Set(qs.filter((q) => q.kind !== "model").map((q) => q.kind)),
    ],
    sourceItems: c.ledger?.length ?? null,
    plannedReturns: qs.filter((q) => q.plannedReturn).length,
    changedContexts: qs.filter(
      (q) => q.changedContext || q.id.endsWith("-cumulative"),
    ).length,
    earlierChapterReturns: qs.filter((q) => q.fromChapter).length,
    limitations: [
      "Text only",
      "Internal source-based review; no independent teacher or learner validation",
      "Authored progress included in local backup; cloud migration pending",
    ],
  };
});
await mkdir("docs/evidence/remaining-curriculum", { recursive: true });
await writeFile(
  "docs/evidence/remaining-curriculum/coverage.json",
  JSON.stringify(rows, null, 2) + "\n",
);
await writeFile(
  "docs/evidence/remaining-curriculum/source-ledger.json",
  JSON.stringify(
    authoredChapters
      .filter((c) => c.ledger)
      .map((c) => ({
        chapter: c.number,
        items: c.ledger,
        optionalSourceIds: c.optionalSourceIds,
      })),
    null,
    2,
  ) + "\n",
);
// Exact question-by-question contracts, including models, variants, help and
// return links, can be reviewed without reverse engineering a browser session.
if (process.argv.includes("--contracts"))
  await writeFile(
    "docs/evidence/remaining-curriculum/lesson-contracts.json",
    JSON.stringify(
      authoredChapters
        .filter((c) => c.number !== 2)
        .map((c) => ({ chapter: c.number, lessons: c.lessons })),
      null,
      2,
    ) + "\n",
  );
console.table(
  rows.map(
    ({ chapter, lessons, screens, plannedReturns, changedContexts }) => ({
      chapter,
      lessons,
      screens,
      plannedReturns,
      changedContexts,
    }),
  ),
);
