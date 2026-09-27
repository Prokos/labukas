import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { authoredChapters } from "../src/remaining-curriculum.js";
import { createCourseRuntime } from "../src/authored-course.js";
import { words } from "../src/course-authoring.js";
const base = process.env.APP_URL || "http://127.0.0.1:5176/";
const routeReview = process.env.REVIEW_ROUTE === "1";
const chapterName = [
  null,
  "one",
  "two",
  "three",
  "four",
  "five",
  "six",
  "seven",
  "eight",
  "nine",
  "ten",
][Number(process.env.CHAPTER || 3)];
if (routeReview && !chapterName)
  throw new Error("REVIEW_ROUTE requires a chapter from 1 to 10");
const output = routeReview
  ? `docs/evidence/chapter-${chapterName}`
  : "docs/evidence/remaining-curriculum";
await mkdir(output, { recursive: true });
const browser = await chromium.launch({
  headless: true,
  executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE,
});
const results = [],
  errors = [];
async function saved(p, c) {
  return p.evaluate((key) => JSON.parse(localStorage.getItem(key)), c.key);
}
async function solve(p, q) {
  if (q.kind === "model") {
    await p.getByRole("button", { name: "Continue", exact: true }).click();
    return;
  }
  if (q.kind === "writing") {
    await p.getByRole("textbox").fill(q.sample);
    await p
      .getByRole("button", { name: "Review my writing", exact: true })
      .click();
    for (const box of await p.getByRole("checkbox").all()) await box.check();
    await p
      .getByRole("button", { name: "Save my writing", exact: true })
      .click();
  } else {
    if (q.kind === "match")
      for (const [lt, en] of q.pairs) {
        await p
          .locator(".opening-match")
          .getByRole("button", { name: en, exact: true })
          .click();
        await p
          .locator(".opening-match")
          .getByRole("button", { name: lt, exact: true })
          .click();
      }
    else if (q.kind === "edit") {
      await p
        .locator(".opening-edit > div")
        .first()
        .getByRole("button")
        .nth(q.editIndex)
        .click();
      await p
        .locator(".opening-replacements")
        .getByRole("button", { name: q.answers[0], exact: true })
        .click();
    } else if (["bank", "chat-bank"].includes(q.kind))
      for (const word of words(q.answers[0]))
        await p
          .locator(".opening-tiles button:not(:disabled)")
          .filter({
            hasText: new RegExp(
              "^" + word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "$",
            ),
          })
          .first()
          .click();
    else if (q.options)
      await p
        .locator(".opening-options")
        .getByRole("button", { name: q.answers[0], exact: true })
        .click();
    else await p.getByRole("textbox").fill(q.answers[0]);
    await p.getByRole("button", { name: "Check answer", exact: true }).click();
  }
  await p
    .locator(".opening-feedback.correct, .opening-feedback.self-reviewed")
    .waitFor();
  await p.getByRole("button", { name: "Continue", exact: true }).click();
}
try {
  for (const width of [1440, 390]) {
    const context = await browser.newContext({
        viewport: { width, height: 844 },
        reducedMotion: "reduce",
      }),
      p = await context.newPage();
    p.on("pageerror", (e) => errors.push(e.message));
    for (const c of authoredChapters.filter(
      (c) =>
        c.number !== 2 &&
        (!process.env.CHAPTER || c.number === Number(process.env.CHAPTER)),
    )) {
      const r = createCourseRuntime(c);
      await p.goto(`${base}?preview=chapter${c.number}`);
      assert.equal(
        await p.locator(".opening-lesson").count(),
        c.lessons.length,
      );
      assert.equal(
        await p.locator("#authored-chapter").inputValue(),
        String(c.number),
      );
      const selected = [
        ...new Set(
          [
            ...c.lessons.slice(0, 5),
            ...(routeReview ? c.lessons.filter((l) => l.reviewStatus) : []),
            ...(routeReview ? c.retiredLessons || [] : []),
            c.lessons.find((l) => l.id === `a-c${c.number}-conversation`),
            c.lessons.find((l) => l.steps.some((q) => q.kind === "reading")),
            c.lessons.find((l) => l.steps.some((q) => q.changedContext)),
            c.lessons.at(-1),
          ].filter(Boolean),
        ),
      ];
      let total = 0;
      for (const l of selected) {
        const state = r.advanceOpening(
          r.startOpening(r.freshOpening(), l.id, Date.now(), 0),
        );
        await p.evaluate(
          ({ key, state }) => localStorage.setItem(key, JSON.stringify(state)),
          { key: c.key, state },
        );
        await p.reload();
        for (let turn = 0; turn < 60; turn++) {
          const s = await saved(p, c);
          if (s.run.done) break;
          const q = s.run.queue[s.run.index];
          await p.locator(`[data-step="${q.id}"]`).waitFor();
          assert.equal(
            await p.evaluate(
              () => document.documentElement.scrollWidth > innerWidth + 1,
            ),
            false,
            q.id,
          );
          if (q.kind === "chat-choice" && q.continuation) {
            await p.reload();
            await p.locator(`[data-step="${q.id}"]`).waitFor();
            assert.ok(
              (await p.locator(".opening-message").last().innerText()).includes(
                q.source,
              ),
              `missing next question ${q.id}`,
            );
            const current = await p
              .locator(".opening-conversation > .opening-message")
              .last()
              .boundingBox();
            assert.ok(
              current.y >= 0 && current.y + current.height < 844,
              `current turn outside viewport: ${q.id}`,
            );
            const history = p.locator(".opening-conversation-history");
            if (await history.count()) {
              await history.locator("summary").click();
              await p.waitForFunction(
                (key) =>
                  JSON.parse(localStorage.getItem(key)).run.help.includes(
                    "conversation-history",
                  ),
                c.key,
              );
              assert.ok(
                (await saved(p, c)).run.help.includes("conversation-history"),
              );
              await history.locator("summary").click();
            }
          }
          if (
            (q.changedContext && q.id.endsWith("-0")) ||
            (q.kind === "chat-choice" && q.continuation) ||
            q.map ||
            [
              "a-c3-route-destination-model",
              "a-c3-route-half-hour-model",
              "a-c3-route-bus-mix",
              "a-c4-route-table-presence-model",
              "a-c4-route-permission-request-model",
              "a-c4-route-compare-flats-rooms",
            ].includes(q.id)
          )
            await p.screenshot({
              path: `${output}/${width}-chapter${c.number}-${routeReview ? q.id : q.kind}.png`,
              animations: "disabled",
            });
          await solve(p, q);
          total++;
        }
        assert.equal((await saved(p, c)).run.done, true, l.id);
      }
      if (c.number < 10)
        assert.equal(
          await p
            .getByRole("link", { name: "Next chapter" })
            .getAttribute("href"),
          `?preview=chapter${c.number + 1}`,
        );
      console.log(`${width}: chapter ${c.number}, ${total} screens`);
      results.push({
        width,
        chapter: c.number,
        screens: total,
        lessons: selected.map((l) => l.id),
      });
    }
    await context.close();
  }
  assert.deepEqual(errors, []);
  await writeFile(
    `${output}/browser-checks.json`,
    JSON.stringify({ results, errors }, null, 2) + "\n",
  );
} finally {
  await browser.close();
}
