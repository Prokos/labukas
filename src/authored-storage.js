// Local course records stay separate from legacy evidence. Backups carry both;
// no boolean legacy success is promoted to authored mastery.
export const authoredStorageKey = (key) =>
  /^sakyk\.(authored\.chapter-(10|[1-9])\.v1|opening-sequence\.v3)$/.test(key);
export function validateAuthoredState(value) {
  if (
    !value ||
    !Number.isInteger(value.version) ||
    !Array.isArray(value.events) ||
    !Array.isArray(value.completed) ||
    value.completed.some((x) => typeof x !== "string")
  )
    throw new Error("Invalid course progress.");
  const ids = new Set();
  for (const e of value.events) {
    if (
      !e ||
      typeof e.id !== "string" ||
      !Number.isFinite(e.at) ||
      typeof e.type !== "string" ||
      ids.has(e.id)
    )
      throw new Error("Invalid course event.");
    ids.add(e.id);
  }
  for (const run of [value.run, ...Object.values(value.suspended || {})].filter(
    Boolean,
  )) {
    if (
      typeof run.lessonId !== "string" ||
      !Array.isArray(run.queue) ||
      !Number.isInteger(run.index) ||
      run.index < 0 ||
      run.index > run.queue.length ||
      !Array.isArray(run.help)
    )
      throw new Error("Invalid saved lesson.");
  }
  return value;
}
export function collectAuthored(storage) {
  const states = {};
  for (let i = 0; i < storage.length; i++) {
    const key = storage.key(i);
    if (authoredStorageKey(key))
      states[key] = validateAuthoredState(JSON.parse(storage.getItem(key)));
  }
  return states;
}
export function mergeAuthored(a, b) {
  if (!a) return validateAuthoredState(b);
  validateAuthoredState(a);
  validateAuthoredState(b);
  if (a.version !== b.version)
    throw new Error(
      "Course progress versions differ; the originals have been kept.",
    );
  const events = new Map(a.events.map((e) => [e.id, e]));
  for (const e of b.events) {
    if (
      events.has(e.id) &&
      JSON.stringify(events.get(e.id)) !== JSON.stringify(e)
    )
      throw new Error(
        "Conflicting course events; the originals have been kept.",
      );
    events.set(e.id, e);
  }
  const recent = (s) => s.savedAt || Math.max(0, ...s.events.map((e) => e.at));
  const latest = recent(b) > recent(a) ? b : a,
    other = latest === a ? b : a;
  const suspended = { ...other.suspended, ...latest.suspended };
  if (
    other.run &&
    !other.run.done &&
    other.run.lessonId !== latest.run?.lessonId
  )
    suspended[other.run.lessonId] = other.run;
  return {
    ...latest,
    events: [...events.values()].sort((x, y) => x.at - y.at),
    completed: [...new Set([...a.completed, ...b.completed])],
    suspended,
  };
}
export function prepareAuthoredImport(incoming, storage) {
  const merged = {};
  for (const [key, state] of Object.entries(incoming || {})) {
    if (!authoredStorageKey(key))
      throw new Error("Unknown course storage key.");
    const local = storage.getItem(key);
    merged[key] = mergeAuthored(local ? JSON.parse(local) : null, state);
  }
  return merged;
}
export function authoredHistory(storage, exceptKey) {
  // Invalid data must remain available for recovery, not silently deleted. A
  // malformed unrelated preview must not stop the active course from working.
  const events = new Map();
  for (let i = 0; i < storage.length; i++) {
    const key = storage.key(i);
    if (!authoredStorageKey(key) || key === exceptKey) continue;
    try {
      for (const e of validateAuthoredState(JSON.parse(storage.getItem(key)))
        .events)
        events.set(e.id, e);
    } catch {}
  }
  return [...events.values()];
}
