import index from "./index.json" with { type: "json" };
import { compileCourses } from "./compiler.js";
import { lithuanianAssessmentPolicy } from "../learning/lithuanian-policy.js";
const sources = [
  () => import("./chapters/01.json"),
  () => import("./chapters/02.json"),
  () => import("./chapters/03.json"),
  () => import("./chapters/04.json"),
  () => import("./chapters/05.json"),
  () => import("./chapters/06.json"),
  () => import("./chapters/07.json"),
  () => import("./chapters/08.json"),
  () => import("./chapters/09.json"),
  () => import("./chapters/10.json"),
];
const pending = new Map();
async function definition(number) {
  if (!sources[number - 1]) throw new Error(`Unknown chapter ${number}`);
  if (!pending.has(number))
    pending.set(
      number,
      sources[number - 1]().then((m) => m.default),
    );
  return pending.get(number);
}
export const chapters = index;
export async function loadCourse(number) {
  const definitions = new Map();
  async function visit(n) {
    if (definitions.has(n)) return;
    const data = await definition(n);
    definitions.set(n, data);
    await Promise.all((data.dependencies || []).map(visit));
  }
  await visit(Number(number));
  const courses = compileCourses([...definitions.values()]);
  return {
    ...courses.find((c) => c.number === Number(number)),
    assessmentPolicy: lithuanianAssessmentPolicy,
  };
}
export async function loadCourses() {
  return Promise.all(chapters.map((c) => loadCourse(c.number)));
}
