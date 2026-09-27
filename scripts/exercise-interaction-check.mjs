import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import {
  chapterTwoCourse as chapter,
  chapterTwoRuntime as chapterRuntime,
} from "../src/chapter-two-content.js";
import {
  openingCourse as opening,
  openingRuntime,
} from "../src/opening-content.js";
const browser = await chromium.launch({
  headless: true,
  executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE,
});
const base = process.env.APP_URL || "http://127.0.0.1:5174/";
const output = "docs/evidence/chapter-two";
await mkdir(output, { recursive: true });
const checks = [];
async function at(p, course, runtime, id, route) {
  const l = course.lessons.find((l) => l.steps.some((q) => q.id === id));
  let s = runtime.startOpening(
    {
      ...runtime.freshOpening(),
      completed: course.lessons
        .slice(0, course.lessons.indexOf(l))
        .map((l) => l.id),
    },
    l.id,
    1,
    0,
  );
  s = runtime.advanceOpening(s, 2);
  s.run.index = s.run.queue.findIndex((q) => q.id === id);
  await p.goto(`${base}?preview=${route}`);
  await p.evaluate(
    ({ s, key }) => localStorage.setItem(key, JSON.stringify(s)),
    { s, key: course.key },
  );
  await p.reload();
  await p.locator(`[data-step="${id}"]`).waitFor();
  return s.run.queue[s.run.index];
}
try {
  for (const width of [1440, 390]) {
    const ctx = await browser.newContext({ viewport: { width, height: 844 } }),
      p = await ctx.newPage();
    for (const [course, runtime, route, choiceId, matchId, bankId] of [
      [
        chapter,
        chapterRuntime,
        "chapter2",
        "c2-order-coffee",
        "c2-drinks-0-match",
        "c2-order-bank",
      ],
      [
        opening,
        openingRuntime,
        "opening",
        "hello-choice",
        "first-match",
        "name-bank",
      ],
    ]) {
      for (const key of ["Enter", "Space"]) {
        const q = await at(p, course, runtime, choiceId, route);
        const index = q.options.indexOf(q.answers[0]);
        await p.keyboard.press(String(index + 1));
        assert.equal(
          await p.locator(".opening-options button.selected").count(),
          1,
        );
        await p.keyboard.press(key);
        await p.locator(".opening-feedback.correct").waitFor();
        await p.keyboard.press(key);
        assert.equal(await p.locator(".opening-feedback").count(), 0);
      }
      let q = await at(p, course, runtime, matchId, route);
      await p
        .locator(".opening-match")
        .getByRole("button", { name: q.pairs[0][1], exact: true })
        .click();
      await p.reload();
      assert.equal(
        await p.locator(".opening-match button.selected").innerText(),
        q.pairs[0][1],
      );
      await p
        .locator(".opening-match")
        .getByRole("button", { name: q.pairs[0][0], exact: true })
        .click();
      for (let i = 1; i < q.pairs.length; i++) {
        await p
          .locator(".opening-match")
          .getByRole("button", { name: q.pairs[i][1], exact: true })
          .click();
        await p
          .locator(".opening-match")
          .getByRole("button", { name: q.pairs[i][0], exact: true })
          .click();
      }
      await p.keyboard.press("Enter");
      await p.locator(".opening-feedback.correct").waitFor();
      q = await at(p, course, runtime, bankId, route);
      for (const word of q.answers[0].replace(/[.!?,]/g, "").split(" "))
        await p
          .locator(".opening-tiles")
          .getByRole("button", { name: word, exact: true })
          .click();
      await p.keyboard.press("Space");
      await p.locator(".opening-feedback.correct").waitFor();
      checks.push(
        `${width}px ${route}: numbered keys, Enter/Space Check and Continue, right-first pairs and reload, bank Space submission`,
      );
    }
    for (const [id, value] of [
      ["c2-order-tea", "arbatos"],
      ["c2-request-sandwich", "sumuštinio"],
    ]) {
      await at(p, chapter, chapterRuntime, id, "chapter2");
      await p.getByRole("textbox").fill(value);
      const dimensions = await p
        .getByRole("textbox")
        .evaluate((el) => ({ scroll: el.scrollWidth, client: el.clientWidth }));
      assert.ok(
        dimensions.scroll <= dimensions.client + 1,
        `${id}: full answer visible`,
      );
      assert.equal(
        await p.evaluate(
          () => document.documentElement.scrollWidth > innerWidth,
        ),
        false,
      );
      await p.screenshot({ path: `${output}/${width}-${id}-input.png` });
      await p.getByRole("textbox").press("Enter");
      await p.locator(".opening-feedback.correct").waitFor();
    }
    await at(p, chapter, chapterRuntime, "c2-compound-recall", "chapter2");
    await p.getByRole("textbox").fill("dvidešimt");
    await p.getByRole("textbox").press("Space");
    assert.equal(await p.locator(".opening-feedback").count(), 0);
    assert.equal(await p.getByRole("textbox").inputValue(), "dvidešimt ");
    await at(p, chapter, chapterRuntime, "c2-habits-writing", "chapter2");
    await p.getByRole("textbox").fill("Man patinka arbata.");
    await p.getByRole("textbox").press("Enter");
    assert.match(await p.getByRole("textbox").inputValue(), /\n$/);
    checks.push(
      `${width}px: full gap answers visible; Enter submits text; spaces/newlines remain editable`,
    );
    await at(p, chapter, chapterRuntime, "c2-phrase-short", "chapter2");
    await p.getByRole("textbox").fill("juodos kavos prasom");
    await p.getByRole("textbox").press("Enter");
    await p.locator(".opening-feedback.spelling").waitFor();
    assert.match(
      await p.locator(".opening-feedback").innerText(),
      /Right phrase\. Check the spelling:/,
    );
    const saved = () =>
      p.evaluate((key) => JSON.parse(localStorage.getItem(key)), chapter.key);
    let evidence = (await saved()).events.at(-1);
    assert.equal(evidence.correctness, true);
    assert.equal(evidence.spellingCorrect, false);
    assert.equal(evidence.independentRecall, false);
    assert.equal(
      chapterRuntime.learningEvidence(await saved())[0].needsTarget,
      false,
    );
    await p.reload();
    await p.locator(".opening-feedback.spelling").waitFor();
    await p.screenshot({ path: `${output}/${width}-phrase-spelling.png` });
    await p.getByRole("button", { name: "Continue", exact: true }).click();
    await p.getByRole("button", { name: "Close lesson", exact: true }).click();
    await p.getByRole("button", { name: "Practice", exact: true }).click();
    await p
      .getByRole("button", { name: "Start practice", exact: true })
      .click();
    await p.getByRole("button", { name: "Let’s begin", exact: true }).click();
    await p.getByRole("textbox").fill("juodos kavos prasom");
    await p.getByRole("textbox").press("Enter");
    await p.locator(".opening-feedback.spelling").waitFor();
    await p.getByRole("button", { name: "Continue", exact: true }).click();
    await p.getByRole("heading", { name: "Done for now." }).waitFor();
    assert.equal(
      chapterRuntime.learningEvidence(await saved())[0].needsSpelling,
      true,
    );
    await p.clock.setFixedTime(new Date(Date.now() + 86400000));
    await p
      .getByRole("button", { name: "Back to course", exact: true })
      .click();
    await p.getByRole("button", { name: "Practice", exact: true }).click();
    await p
      .getByRole("button", { name: "Start practice", exact: true })
      .click();
    await p.getByRole("button", { name: "Let’s begin", exact: true }).click();
    await p.getByRole("textbox").fill("Juodos kavos, prašom.");
    await p.getByRole("textbox").press("Enter");
    await p.locator(".opening-feedback.correct").waitFor();
    assert.equal(
      chapterRuntime.learningEvidence(await saved())[0].needsSpelling,
      false,
    );
    checks.push(
      `${width}px: phrase spelling in Course and Practice, persisted correction, no meaning penalty and later exact recovery`,
    );
    await ctx.close();
  }
  await writeFile(
    `${output}/interaction-results.json`,
    JSON.stringify({ checks }, null, 2),
  );
  console.log("PASS", checks);
} finally {
  await browser.close();
}
