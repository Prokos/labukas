import { compileCourses } from "./compiler.js";
import { lithuanianAssessmentPolicy } from "../learning/lithuanian-policy.js";
const sources = import.meta.glob("./chapters/*.json");
const sourceByNumber = new Map(
  Object.entries(sources).map(([path, load]) => [
    Number(path.match(/(\d+)\.json$/)[1]),
    load,
  ]),
);
export const chapters = [...sourceByNumber.keys()]
  .sort((a, b) => a - b)
  .map((number) => ({ number }));
const pending = new Map();
async function definition(number) {
  const load = sourceByNumber.get(Number(number));
  if (!load) throw new Error(`Unknown chapter ${number}`);
  if (!pending.has(number))
    pending.set(number, load().then((m) => m.default));
  return pending.get(number);
}
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
