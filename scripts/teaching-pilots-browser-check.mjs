import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import { resolve } from "node:path";
import { lessons, items, classSteps } from "../src/curriculum.js";
import { exerciseFor, STORAGE_KEY } from "../src/engine.js";
import { teachingExplanation } from "../src/content/teaching-pilots.js";

const base = process.env.PILOT_BASE_URL || "http://127.0.0.1:5173";
const screenshots = resolve("docs/screenshots/teaching-pilots");
await mkdir(screenshots, { recursive: true });
const browser = await chromium.launch({
  headless: true,
  executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE,
});
const errors = [];

async function openPilot(page, id, mobile = false, stepIndex = 0, kind = "") {
  const lesson = lessons.find((entry) => entry.id === id);
  await page.goto(base);
  await page
    .locator(mobile ? ".mobile-nav" : ".sidebar nav")
    .getByRole("button", { name: "Your course" })
    .click();
  const chapter = page.locator(".course-chapter").nth(lesson.chapter);
  if (
    (await chapter.locator(".chapter-toggle").getAttribute("aria-expanded")) !==
    "true"
  )
    await chapter.locator(".chapter-toggle").click();
  const blocks = await chapter.locator(".class-block").all();
  const block = await (async () => {
    for (const entry of blocks)
      if ((await entry.locator("summary strong").innerText()) === lesson.title)
        return entry;
  })();
  assert.ok(block, `Could not find ${lesson.title}`);
  if ((await block.getAttribute("open")) === null)
    await block.locator("summary").click();
  await block.locator("button").nth(stepIndex).click();
  if (kind)
    await page.screenshot({
      path: join(screenshots, `${kind}-intro.png`),
      animations: "disabled",
    });
  await page.getByRole("button", { name: "Let’s try it" }).click();
  await page.locator("form.exercise .question-bubble").waitFor();
  assert.equal(await page.locator(".first-look").count(), 0);
  return lesson;
}

try {
  for (const [id, kind, viewport] of [
    ["c1-present-people", "verb", { width: 1280, height: 900 }],
    ["c1-possession", "owner", { width: 390, height: 844 }],
    ["c2-with-without-forms", "ingredients", { width: 390, height: 844 }],
  ]) {
    const page = await browser.newPage({ viewport });
    page.on("pageerror", (error) => errors.push(error.message));
    await openPilot(page, id, viewport.width < 500, 0, kind);
    const form = page.locator("form.exercise");
    await form.waitFor();
    assert.equal(await form.getAttribute("data-stage"), "0");
    assert.ok(await form.locator(".question-bubble").isVisible());
    assert.equal(await form.locator(".question-bubble").count(), 1);
    const itemId = await form.getAttribute("data-item-id");
    const item = items.find((entry) => entry.id === itemId);
    assert.ok(item.teaching);
    const exercise = exerciseFor({ ...item, taskStage: 0 });
    await page.screenshot({
      path: join(screenshots, `${kind}-task.png`),
      animations: "disabled",
    });
    const wrong = exercise.options.find((option) => option !== exercise.answer);
    await form
      .locator(".answer-options button")
      .filter({ has: page.getByText(wrong, { exact: true }) })
      .click();
    await page.getByRole("button", { name: "Check answer" }).click();
    assert.equal(
      await page.locator(".feedback-explanation").innerText(),
      teachingExplanation(item),
    );
    const continueBox = await page
      .getByRole("button", { name: "Continue", exact: true })
      .boundingBox();
    assert.ok(
      continueBox && continueBox.y + continueBox.height <= viewport.height,
      `${id} feedback action is below the viewport`,
    );
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      true,
      `${id} overflows the viewport`,
    );
    await page.screenshot({
      path: join(screenshots, `${kind}-feedback.png`),
      animations: "disabled",
    });
    await page.getByRole("button", { name: "Continue", exact: true }).click();
    for (let tries = 0; tries < 6; tries++) {
      const current = page.locator("form.exercise");
      if ((await current.getAttribute("data-stage")) === "1") break;
      const currentId = await current.getAttribute("data-item-id");
      const currentItem = items.find((entry) => entry.id === currentId);
      const currentExercise = exerciseFor({ ...currentItem, taskStage: 0 });
      await current
        .locator(".answer-options button")
        .filter({
          has: page.getByText(currentExercise.answer, { exact: true }),
        })
        .click();
      await page.getByRole("button", { name: "Check answer" }).click();
      await page.getByRole("button", { name: "Continue", exact: true }).click();
    }
    assert.equal(await form.getAttribute("data-stage"), "1");
    await page.screenshot({
      path: join(screenshots, `${kind}-form.png`),
      animations: "disabled",
    });
    await page.close();

    const guided = await browser.newPage({
      viewport: { width: 390, height: 844 },
    });
    guided.on("pageerror", (error) => errors.push(error.message));
    const lesson = lessons.find((entry) => entry.id === id);
    const progress = {
      version: 1,
      events: lesson.items
        .filter((entry) => entry.teaching)
        .flatMap((entry, n) =>
          [0, 1, 2].map((stage) => ({
            id: `${id}-${n}-${stage}`,
            type: "answer",
            item: entry.id,
            correct: true,
            stage,
            at: n * 3 + stage + 1,
          })),
        ),
    };
    await guided.addInitScript(
      ({ key, value }) => localStorage.setItem(key, JSON.stringify(value)),
      { key: STORAGE_KEY, value: progress },
    );
    const guidedIndex = classSteps(id).findIndex(
      (step) => step.phase === "guided",
    );
    await openPilot(guided, id, true, guidedIndex);
    for (let n = 0; n < 6; n++) {
      const gap = guided.locator('form.exercise[data-stage="2"]');
      await gap.waitFor();
      const currentId = await gap.getAttribute("data-item-id");
      const current = items.find((entry) => entry.id === currentId);
      await gap.locator("#answer").fill(current.teaching.focus);
      await guided.getByRole("button", { name: "Check answer" }).click();
      await guided
        .getByRole("button", { name: "Continue", exact: true })
        .click();
    }
    const change = guided.locator('form.exercise[data-stage="3"]');
    await change.waitFor();
    assert.ok(await change.locator("#answer").isVisible());
    await guided.screenshot({
      path: join(screenshots, `${kind}-change.png`),
      animations: "disabled",
    });
    await guided.close();
  }
  assert.deepEqual(errors, []);
  console.log(
    "Three teaching pilots render and explain errors at desktop/phone widths.",
  );
} finally {
  await browser.close();
}
