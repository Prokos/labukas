import { readFile } from "node:fs/promises";
import { compileCourses } from "../src/curriculum/compiler.js";
import { lithuanianAssessmentPolicy } from "../src/learning/lithuanian-policy.js";
import { createCourseRuntime } from "../src/learning/session.js";
const definitions = await Promise.all(
  Array.from({ length: 10 }, (_, i) =>
    readFile(
      new URL(
        `../src/curriculum/chapters/${String(i + 1).padStart(2, "0")}.json`,
        import.meta.url,
      ),
      "utf8",
    ).then(JSON.parse),
  ),
);
export const courses = compileCourses(definitions).map((c) => ({
  ...c,
  assessmentPolicy: lithuanianAssessmentPolicy,
}));
export const course = (number) => courses.find((c) => c.number === number);
export const chapterTwoCourse = course(2),
  chapterTwoLessons = chapterTwoCourse.lessons,
  chapterTwoRuntime = createCourseRuntime(chapterTwoCourse);
export const words = (text) =>
  text
    .replace(/[.!?,:;]/g, "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
