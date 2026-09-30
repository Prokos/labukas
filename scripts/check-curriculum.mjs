import { readFile, readdir } from "node:fs/promises";
import assert from "node:assert/strict";
import { compileCourses } from "../src/curriculum/compiler.js";
const chapterDirectory = new URL("../src/curriculum/chapters/", import.meta.url);
const files = (await readdir(chapterDirectory))
  .filter((file) => /^\d+\.json$/.test(file))
  .sort();
const definitions = await Promise.all(
  files.map((file) => readFile(new URL(file, chapterDirectory), "utf8").then(JSON.parse)),
);
const courses = compileCourses(definitions);
for (const c of courses) {
  const known = new Set(),
    tasks = new Map(c.lessons.flatMap((l) => l.steps).map((q) => [q.id, q]));
  for (const lesson of c.lessons) {
    for (const requirement of lesson.requires || [])
      assert.ok(
        known.has(requirement),
        `${lesson.id}: missing prerequisite ${requirement}`,
      );
    for (const concept of lesson.provides || []) known.add(concept);
  }
  for (const objective of c.objectives || []) {
    assert.ok(objective.goal, `Chapter ${c.number}: objective goal`);
    for (const id of objective.models || [])
      assert.equal(
        tasks.get(id)?.kind,
        "model",
        `${objective.key}: model ${id}`,
      );
    for (const id of [
      ...(objective.checks || []),
      ...(objective.applications || []),
    ])
      assert.ok(tasks.has(id), `${objective.key}: exercise ${id}`);
    assert.ok(
      objective.checks?.length || objective.limit,
      `${objective.key}: identify evidence limits`,
    );
  }
  console.log(
    `Chapter ${c.number}: ${c.lessons.length} lessons, ${tasks.size} exercises, ${c.vocabulary.length} required expressions`,
  );
}
