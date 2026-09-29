export async function readCourse(page, key) {
  return page.evaluate(async (key) => {
    const db = await new Promise((resolve, reject) => {
      const r = indexedDB.open("sakyk", 1);
      r.onsuccess = () => resolve(r.result);
      r.onerror = () => reject(r.error);
    });
    try {
      return await new Promise((resolve, reject) => {
        const tx = db.transaction(["states", "records"], "readonly");
        const s = tx.objectStore("states").get(key),
          e = tx.objectStore("records").getAll();
        tx.oncomplete = () =>
          resolve({
            ...s.result?.value,
            events: e.result
              .filter((r) => r.course === key)
              .sort(
                (a, b) =>
                  a.event.at - b.event.at || (a.order || 0) - (b.order || 0),
              )
              .map((r) => r.event),
          });
        tx.onerror = () => reject(tx.error);
      });
    } finally {
      db.close();
    }
  }, key);
}
export async function seedCourse(page, key, state) {
  await page.evaluate(
    async ({ key, state }) => {
      const db = await new Promise((resolve, reject) => {
        const r = indexedDB.open("sakyk", 1);
        r.onsuccess = () => resolve(r.result);
        r.onerror = () => reject(r.error);
      });
      try {
        await new Promise((resolve, reject) => {
          const tx = db.transaction(["states", "records"], "readwrite");
          tx.objectStore("records").clear();
          tx.objectStore("states").clear();
          const { events, ...value } = state;
          tx.objectStore("states").put({ key, value });
          tx.objectStore("states").put({
            key: "preferences",
            value: { chapter: 2, goal: 10 },
          });
          events.forEach((event, order) =>
            tx
              .objectStore("records")
              .put({ id: event.id, course: key, event, order }),
          );
          tx.oncomplete = resolve;
          tx.onerror = () => reject(tx.error);
        });
      } finally {
        db.close();
      }
    },
    { key, state },
  );
}
