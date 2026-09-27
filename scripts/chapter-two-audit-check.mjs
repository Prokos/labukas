import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
import { writeFile } from "node:fs/promises";
import {
  chapterTwoCourse as course,
  chapterTwoRuntime as r,
} from "../src/chapter-two-content.js";
const base = process.env.APP_URL || "http://127.0.0.1:5174/";
const selected = course.lessons.flatMap((l) =>
  l.steps
    .filter((q) =>
      /^(c2-phrase-plural|c2-ingredient-singular|c2-ingredient-tuna|c2-ingredient-honey)/.test(
        q.id,
      ),
    )
    .map((q) => ({ l, q })),
);
const browser = await chromium.launch({
  headless: true,
  executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE,
});
const checks = [],
  errors = [];
try {
  for (const width of [1440, 390]) {
    const context = await browser.newContext({
      viewport: { width, height: 844 },
      reducedMotion: "reduce",
    });
    const p = await context.newPage();
    p.on("pageerror", (e) => errors.push(e.message));
    await p.goto(`${base}?preview=chapter2`);
    for (const { l, q } of selected) {
      let s = r.advanceOpening(r.startOpening(r.freshOpening(), l.id, 1, 0));
      s.run.index = s.run.queue.findIndex((t) => t.id === q.id);
      await p.evaluate(
        ({ key, s }) => localStorage.setItem(key, JSON.stringify(s)),
        { key: course.key, s },
      );
      await p.reload();
      await p.locator(`[data-step="${q.id}"]`).waitFor();
      await p.evaluate(() => document.fonts.ready);
      if (q.kind === "model") {
        await p.screenshot({
          path: `docs/evidence/chapter-two/${width}-${q.id}.png`,
        });
        await p.getByRole("button", { name: "Continue", exact: true }).click();
        continue;
      }
      if (q.kind === "bank") {
        for (const word of q.answers[0].replace(/[.!?,]/g, "").split(" "))
          await p
            .locator(".opening-tiles")
            .getByRole("button", { name: word, exact: true })
            .click();
      } else if (q.options) {
        const options = s.run.queue[s.run.index].options;
        await p
          .locator(".opening-options button")
          .nth(options.indexOf(q.answers[0]))
          .click();
      } else await p.getByRole("textbox").fill(q.answers[0]);
      await p.keyboard.press("Enter");
      await p.locator(".opening-feedback.correct").waitFor();
      assert.equal(
        await p.evaluate(
          () => document.documentElement.scrollWidth > innerWidth,
        ),
        false,
      );
    }
    checks.push(
      `${width}px: all ${selected.length} added plural-request and singular-ingredient screens, including later returns`,
    );
    await p.getByRole("button", { name: "Close lesson", exact: true }).click();
    await p.getByRole("button", { name: "Practice", exact: true }).click();
    await p.getByRole("region", { name: "Learning progress" }).waitFor();
    const layout = await p.locator(".authored-progress").evaluate((el) => ({
      overflow: el.scrollWidth > el.clientWidth,
      wordSize: parseFloat(
        getComputedStyle(el.querySelector("strong")).fontSize,
      ),
      noteSize: parseFloat(
        getComputedStyle(el.querySelector(".authored-progress-note")).fontSize,
      ),
    }));
    assert.equal(layout.overflow, false);
    assert.ok(layout.wordSize >= 16 && layout.noteSize >= 14);
    assert.match(
      await p.locator(".authored-progress-list").innerText(),
      /Medaus pyragas/,
    );
    await p.screenshot({
      path: `docs/evidence/chapter-two/${width}-final-mastery.png`,
    });
    checks.push(
      `${width}px: mastery labels and explanatory text stay readable without horizontal clipping`,
    );
    await context.close();
  }
  assert.deepEqual(errors, []);
  await writeFile(
    "docs/evidence/chapter-two/audit-additions-results.json",
    JSON.stringify({ checks, errors }, null, 2),
  );
  console.log("PASS", checks);
} finally {
  await browser.close();
}
