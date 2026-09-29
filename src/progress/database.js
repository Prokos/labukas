import { mergeCourse } from "./model.js";
export const DATABASE = "sakyk";
const open = () =>
  new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE, 1);
    request.onupgradeneeded = () => {
      request.result.createObjectStore("records", { keyPath: "id" });
      request.result.createObjectStore("states", { keyPath: "key" });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
export async function readDatabase() {
  const db = await open();
  try {
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(["records", "states"], "readonly");
      const records = tx.objectStore("records").getAll();
      const states = tx.objectStore("states").getAll();
      tx.oncomplete = () =>
        resolve({ records: records.result, states: states.result });
      tx.onerror = () => reject(tx.error);
    });
  } finally {
    db.close();
  }
}
export async function writeDatabase(records, states) {
  const db = await open();
  try {
    await new Promise((resolve, reject) => {
      const tx = db.transaction(["records", "states"], "readwrite");
      for (const record of records) tx.objectStore("records").put(record);
      for (const state of states) {
        const store = tx.objectStore("states");
        const request = store.get(state.key);
        request.onsuccess = () => {
          try {
            const existing = request.result;
            if (existing && state.key !== "preferences") {
              const { events, ...value } = mergeCourse(
                { ...existing.value, events: [] },
                { ...state.value, events: [] },
              );
              store.put({ ...state, value });
            } else store.put(state);
          } catch {
            tx.abort();
          }
        };
      }
      tx.oncomplete = resolve;
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error || new Error("Save interrupted"));
    });
  } finally {
    db.close();
  }
}
