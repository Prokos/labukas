import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
import { readFile, writeFile } from "node:fs/promises";
import { authoredChapter } from "../src/remaining-curriculum.js";
import { createCourseRuntime } from "../src/authored-course.js";
import { items } from "../src/curriculum.js";
const browser = await chromium.launch({
  headless: true,
  executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE,
});
const base = process.env.APP_URL || "http://127.0.0.1:5176/";
const checks = [],
  errors = [];
try {
  for (const width of [1440, 390]) {
    const context = await browser.newContext({
      viewport: { width, height: 844 },
      acceptDownloads: true,
    });
    const p = await context.newPage();
    p.on("pageerror", (e) => errors.push(e.message));
    const c = authoredChapter(4),
      r = createCourseRuntime(c),
      l = c.lessons.find((l) => l.id === "a-c4-conversation");
    const state = r.advanceOpening(
      r.startOpening(r.freshOpening(), l.id, 1, 0),
    );
    state.run.index = state.run.queue.findIndex(
      (q) => q.kind === "chat-choice",
    );
    const q = state.run.queue[state.run.index];
    const legacy = {
      version: 1,
      events: [
        {
          id: "original-answer",
          at: 1,
          type: "answer",
          item: items[0].id,
          correct: true,
        },
      ],
    };
    await p.goto(`${base}?preview=chapter4`);
    await p.evaluate(
      ({ key, state, legacy }) => {
        localStorage.setItem(key, JSON.stringify(state));
        localStorage.setItem("labukas.progress.v1", JSON.stringify(legacy));
      },
      { key: c.key, state, legacy },
    );
    await p.reload();
    await p.locator(`[data-step="${q.id}"]`).waitFor();
    await p
      .locator(".opening-options")
      .getByRole("button", {
        name: q.options.find((a) => !q.answers.includes(a)),
        exact: true,
      })
      .click();
    await p.keyboard.press("Enter");
    await p.locator(".opening-feedback.incorrect").waitFor();
    assert.ok(
      (await p.locator(".opening-message").last().innerText()).includes(
        q.wrongNext,
      ),
    );
    assert.ok(
      (await p.locator(".opening-message").last().innerText()).includes(
        q.wrongFollowGloss,
      ),
    );
    await p.screenshot({
      path: `docs/evidence/remaining-curriculum/${width}-conversation-correction.png`,
    });
    await p.getByRole("button", { name: "Close lesson", exact: true }).click();
    await p.getByRole("button", { name: "Open settings", exact: true }).click();
    const downloaded = p.waitForEvent("download");
    await p.getByRole("button", { name: "Export backup", exact: true }).click();
    const backup = JSON.parse(
      await readFile(await (await downloaded).path(), "utf8"),
    );
    assert.deepEqual(backup.events, legacy.events);
    assert.equal(backup.authored[c.key].events.at(-1).outcome, "incorrect");
    assert.equal(backup.authored[c.key].run.feedback.status, "incorrect");
    await p.evaluate((key) => localStorage.removeItem(key), c.key);
    await p.reload();
    await p.getByRole("button", { name: "Open settings", exact: true }).click();
    await p
      .locator('input[type="file"]')
      .setInputFiles({
        name: "sakyk-test.json",
        mimeType: "application/json",
        buffer: Buffer.from(JSON.stringify(backup)),
      });
    await p
      .getByText("Backup imported. Your progress has been combined.")
      .waitFor();
    const restored = await p.evaluate(
      (key) => JSON.parse(localStorage.getItem(key)),
      c.key,
    );
    assert.deepEqual(restored.events, backup.authored[c.key].events);
    assert.deepEqual(restored.run, backup.authored[c.key].run);
    assert.deepEqual(
      await p.evaluate(
        () => JSON.parse(localStorage.getItem("labukas.progress.v1")).events,
      ),
      legacy.events,
    );
    checks.push(
      `${width}px: wrong reply and matching translation, backup export/import restores feedback and paused lesson, original evidence unchanged`,
    );
    await context.close();
  }
  assert.deepEqual(errors, []);
  await writeFile(
    "docs/evidence/remaining-curriculum/persistence-browser-checks.json",
    JSON.stringify({ checks, errors }, null, 2) + "\n",
  );
  console.log(checks);
} finally {
  await browser.close();
}
