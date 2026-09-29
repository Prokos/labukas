export const emptyProgress = () => ({
  version: 1,
  courses: {},
  events: [],
  preferences: { chapter: 1, goal: 10 },
});
export function validateEvent(e) {
  if (
    !e ||
    typeof e.id !== "string" ||
    !Number.isFinite(e.at) ||
    typeof e.type !== "string"
  )
    throw new Error("Invalid learning record.");
  return e;
}
function canonical(value) {
  if (Array.isArray(value)) return value.map(canonical);
  if (value && typeof value === "object")
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .filter((key) => value[key] !== undefined)
        .map((key) => [key, canonical(value[key])]),
    );
  return value;
}
export function mergeEvents(...groups) {
  const records = new Map();
  for (const e of groups.flat()) {
    validateEvent(e);
    if (
      records.has(e.id) &&
      JSON.stringify(canonical(records.get(e.id))) !==
        JSON.stringify(canonical(e))
    )
      throw new Error(
        "Conflicting learning records. Both backups have been kept.",
      );
    records.set(e.id, e);
  }
  return [...records.values()].sort((a, b) => a.at - b.at);
}
export function validateCourse(value) {
  if (
    !value ||
    value.version !== 1 ||
    !Array.isArray(value.events) ||
    !Array.isArray(value.completed) ||
    value.completed.some((x) => typeof x !== "string")
  )
    throw new Error("Invalid course progress.");
  const events = mergeEvents(value.events);
  if (events.length !== value.events.length)
    throw new Error("Duplicate learning records.");
  for (const run of [value.run, ...Object.values(value.suspended || {})].filter(
    Boolean,
  )) {
    if (
      typeof run.lessonId !== "string" ||
      !Array.isArray(run.queue) ||
      !Number.isInteger(run.index) ||
      run.index < 0 ||
      run.index >= run.queue.length ||
      !Array.isArray(run.help)
    )
      throw new Error("Invalid saved lesson.");
  }
  return value;
}
export function validateProgress(value) {
  if (
    !value ||
    value.version !== 1 ||
    !value.courses ||
    typeof value.courses !== "object" ||
    Array.isArray(value.courses) ||
    !Array.isArray(value.events) ||
    !Number.isInteger(value.preferences?.chapter) ||
    value.preferences.chapter < 1 ||
    value.preferences.chapter > 10 ||
    ![5, 10, 15, 20].includes(value.preferences?.goal)
  )
    throw new Error("Invalid progress backup.");
  mergeEvents(value.events);
  for (const [key, course] of Object.entries(value.courses)) {
    if (!/^chapter-(10|[1-9])$/.test(key)) throw new Error("Unknown chapter.");
    validateCourse(course);
  }
  return value;
}
export function mergeCourse(a, b) {
  if (!a) return validateCourse(b);
  validateCourse(a);
  validateCourse(b);
  if (a.version !== b.version)
    throw new Error("Incompatible course record version.");
  const time = (s) => s.savedAt || Math.max(0, ...s.events.map((e) => e.at));
  const latest = time(b) > time(a) ? b : a,
    other = latest === a ? b : a;
  const suspended = { ...other.suspended, ...latest.suspended };
  if (
    other.run &&
    !other.run.done &&
    other.run.lessonId !== latest.run?.lessonId
  )
    suspended[other.run.lessonId] = other.run;
  if (latest.run) delete suspended[latest.run.lessonId];
  return {
    ...latest,
    events: mergeEvents(a.events, b.events),
    completed: [...new Set([...a.completed, ...b.completed])],
    suspended,
  };
}
export function mergeProgress(a, b) {
  validateProgress(a);
  validateProgress(b);
  const courses = { ...a.courses };
  for (const [key, value] of Object.entries(b.courses))
    courses[key] = mergeCourse(courses[key], value);
  return { ...a, courses, events: mergeEvents(a.events, b.events) };
}
export function encodeRecords(progress) {
  const records = progress.events.map((e, order) => ({
    order,
    id: e.id,
    course: null,
    event: e,
  }));
  const states = [{ key: "preferences", value: progress.preferences }];
  for (const [key, { events, ...state }] of Object.entries(progress.courses)) {
    records.push(
      ...events.map((e, order) => ({ id: e.id, course: key, event: e, order })),
    );
    states.push({ key, value: state });
  }
  return { records, states };
}
export function decodeRecords({ records, states }) {
  const result = emptyProgress();
  for (const { key, value } of states) {
    if (key === "preferences") result.preferences = value;
    else result.courses[key] = { ...value, events: [] };
  }
  const ordered = [...records].sort(
    (a, b) => a.event.at - b.event.at || (a.order || 0) - (b.order || 0),
  );
  for (const { course, event } of ordered) {
    validateEvent(event);
    if (!course) result.events.push(event);
    else {
      result.courses[course] ||= {
        version: 1,
        events: [],
        completed: [],
        run: null,
      };
      result.courses[course].events.push(event);
    }
  }
  for (const course of Object.values(result.courses)) {
    course.events = mergeEvents(course.events);
    course.completed = [
      ...new Set([
        ...course.completed,
        ...course.events
          .filter(
            (e) =>
              e.type === "complete" &&
              e.lesson &&
              !e.review &&
              !["authored-review", "practice"].includes(e.lesson),
          )
          .map((e) => e.lesson),
      ]),
    ];
  }
  return validateProgress(result);
}
function decodeCourse(value) {
  if (![1, 3].includes(value?.version))
    throw new Error("Unknown course record version.");
  return validateCourse({ ...value, version: 1 });
}
export function decodeBackup(value) {
  if (!value || typeof value !== "object")
    throw new Error("Invalid progress backup.");
  if (value.courses) return validateProgress(value);
  const result = emptyProgress();
  const profile = value.progress || value;
  if (!Array.isArray(profile.events) && !value.authored)
    throw new Error("Invalid progress backup.");
  if (Array.isArray(profile.events))
    result.events = mergeEvents(profile.events);
  for (const [key, state] of Object.entries(value.authored || {})) {
    const number =
      key.match(/chapter-(\d+)/)?.[1] ||
      (key.includes("opening-sequence") ? "1" : null);
    if (!number) throw new Error("Unknown course in backup.");
    result.courses[`chapter-${number}`] = mergeCourse(
      result.courses[`chapter-${number}`],
      decodeCourse(state),
    );
  }
  return validateProgress(result);
}
export function readDeviceRecords(storage) {
  const result = emptyProgress();
  const profile = storage.getItem("labukas.progress.v1");
  if (profile) result.events = mergeEvents(JSON.parse(profile).events || []);
  for (let i = 0; i < storage.length; i++) {
    const key = storage.key(i);
    const number =
      key.match(/^sakyk\.authored\.chapter-(10|[1-9])\.v1$/)?.[1] ||
      (key === "sakyk.opening-sequence.v3" ? "1" : null);
    if (!number) continue;
    const state = decodeCourse(JSON.parse(storage.getItem(key)));
    result.courses[`chapter-${number}`] = mergeCourse(
      result.courses[`chapter-${number}`],
      decodeCourse(state),
    );
  }
  return result;
}
