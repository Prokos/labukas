import { readDatabase, writeDatabase } from "./database.js";
import {
  emptyProgress,
  encodeRecords,
  decodeRecords,
  readDeviceRecords,
  mergeProgress,
  decodeBackup,
  validateCourse,
} from "./model.js";
let snapshot = { ...emptyProgress(), ready: false, error: null };
let pending = Promise.resolve(),
  initialization,
  blocked = false;
const channel =
  typeof window !== "undefined" && typeof BroadcastChannel !== "undefined"
    ? new BroadcastChannel("sakyk-progress")
    : null;
const listeners = new Set(),
  savedRecords = new Set();
const emit = () => listeners.forEach((fn) => fn());
export const subscribe = (fn) => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};
export const getSnapshot = () => snapshot;
function persist(next, keys) {
  if (blocked)
    return Promise.reject(
      new Error(
        "Progress could not be opened. Existing records have been kept.",
      ),
    );
  snapshot = { ...next, ready: true, error: null };
  emit();
  const changed = keys
    ? {
        ...next,
        events: [],
        courses: Object.fromEntries(
          Object.entries(next.courses).filter(([key]) => keys.includes(key)),
        ),
      }
    : next;
  const { records, states } = encodeRecords(changed);
  const fresh = records.filter((r) => !savedRecords.has(r.id));
  const selected = keys ? states.filter((s) => keys.includes(s.key)) : states;
  pending = pending
    .catch(() => {})
    .then(async () => {
      await writeDatabase(fresh, selected);
      fresh.forEach((r) => savedRecords.add(r.id));
      channel?.postMessage("saved");
    })
    .catch((error) => {
      snapshot = { ...snapshot, error: error.message };
      emit();
      throw error;
    });
  pending.catch(() => {});
  return pending;
}
export function initialize() {
  return (initialization ||= (async () => {
    try {
      const data = await readDatabase();
      if (data.states.some((s) => s.key === "preferences")) {
        snapshot = { ...decodeRecords(data), ready: true, error: null };
        data.records.forEach((r) => savedRecords.add(r.id));
        emit();
      } else await persist(readDeviceRecords(localStorage));
    } catch (error) {
      blocked = true;
      snapshot = { ...snapshot, ready: false, error: error.message };
      emit();
    }
  })());
}
export function saveCourse(key, value) {
  const state = {
    ...validateCourse(value),
    savedAt: Math.max(Date.now(), (snapshot.courses[key]?.savedAt || 0) + 1),
  };
  return persist(
    { ...snapshot, courses: { ...snapshot.courses, [key]: state } },
    [key],
  );
}
export function setPreferences(values) {
  return persist(
    { ...snapshot, preferences: { ...snapshot.preferences, ...values } },
    ["preferences"],
  );
}
export function importProgress(value) {
  return persist(mergeProgress(snapshot, decodeBackup(value)));
}
export function applySync(value) {
  return persist(mergeProgress(snapshot, value));
}
export function exportProgress() {
  const { ready, error, ...data } = snapshot;
  return data;
}
export function flush() {
  return pending;
}
export function historyExcept(key) {
  return Object.entries(snapshot.courses)
    .filter(([id]) => id !== key)
    .flatMap(([, state]) => state.events);
}

if (channel)
  channel.onmessage = async () => {
    try {
      await pending.catch(() => {});
      const data = await readDatabase();
      const combined = mergeProgress(exportProgress(), decodeRecords(data));
      data.records.forEach((r) => savedRecords.add(r.id));
      snapshot = { ...snapshot, ...combined };
      emit();
    } catch (error) {
      snapshot = { ...snapshot, error: error.message };
      emit();
    }
  };
