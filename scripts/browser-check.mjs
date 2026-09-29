import { checkApp } from "./browser-app.mjs";
import { readCourse, seedCourse } from "./browser-helpers.mjs";
import { chromium, expect } from "@playwright/test";
import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import {
  chapterTwoCourse as course,
  chapterTwoRuntime as r,
} from "../tests/helpers.js";
const base = process.env.APP_URL || "http://127.0.0.1:5173/";
const output = "test-results/browser";
await mkdir(output, { recursive: true });
const browser = await chromium.launch({
  headless: true,
  executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE,
});
const all = course.lessons.flatMap((l) => l.steps);
const word = (lt) =>
  all.find(
    (q) =>
      q.kind === "type" && q.target === `c2-word:${lt}` && !q.plannedReturn,
  );
const event = (q, at, wrong = true) => ({
  id: `seed-${q.id}`,
  at,
  type: "answer",
  step: q.id,
  target: q.target,
  reviewKey: q.reviewKey,
  run: "seed",
  answer: wrong ? "wrong" : q.answers[0],
  correctness: !wrong,
  outcome: wrong ? "incorrect" : "correct",
  independentRecall: !wrong,
  requestedHelp: [],
  responseMode: q.kind,
});
const errors = [],
  checks = [];
try {
  for (const width of [1440, 390]) {
    const ctx = await browser.newContext({
      viewport: { width, height: 844 },
      isMobile: width === 390,
      hasTouch: width === 390,
    });
    const p = await ctx.newPage();
    p.setDefaultTimeout(10000);
    p.on("pageerror", (e) => errors.push(e.message));
    const saved = () => readCourse(p, course.key);
    async function load(s) {
      await p.goto(`${base}?chapter=2`);
      await seedCourse(p, course.key, s);
      await p.reload();
      await p.locator(".lesson-exercise").waitFor();
    }
    async function at(q) {
      const l = course.lessons.find((l) => l.steps.some((s) => s.id === q.id));
      let s = r.startLesson(r.createState(), l.id, Date.now(), 0);
      s = r.advance(s);
      s.run.index = s.run.queue.findIndex((s) => s.id === q.id);
      await load(s);
    }
    await at(word("vynuogė"));
    assert.equal(
      await p
        .locator(".session")
        .getByRole("button", { name: "Reference", exact: true })
        .count(),
      0,
    );
    assert.equal(
      await p.getByRole("button", { name: "Show answer", exact: true }).count(),
      0,
    );
    await p.getByRole("button", { name: "Help", exact: true }).click();
    assert.equal(
      await p.locator(".lesson-hint").innerText(),
      "Starts with “v”.",
    );
    await p.getByRole("button", { name: "Show choices", exact: true }).click();
    const choices = p.locator(".lesson-support-words button");
    assert.ok((await choices.count()) <= 4);
    const order = await choices.allTextContents();
    await p.reload();
    await choices.first().waitFor();
    assert.deepEqual(await choices.allTextContents(), order);
    await p.screenshot({ path: `${output}/${width}-help.png` });
    await choices.getByText("vynuogė", { exact: true }).click();
    await p.getByRole("button", { name: "Check answer", exact: true }).click();
    assert.equal((await saved()).events.at(-1).independentRecall, false);
    const match = all.find(
      (q) => q.kind === "match" && q.pairs.some(([lt]) => lt === "vynuogė"),
    );
    await at(match);
    await p.getByRole("button", { name: "Help", exact: true }).click();
    assert.deepEqual(
      (await saved()).run.help,
      [],
      "an empty help menu is not linguistic support",
    );
    assert.equal(
      await p.getByRole("button", { name: "Show answer", exact: true }).count(),
      1,
    );
    await p
      .locator(".lesson-match")
      .getByRole("button", { name: match.pairs[1][1], exact: true })
      .click();
    await p
      .locator(".lesson-match")
      .getByRole("button", { name: match.pairs[0][0], exact: true })
      .click();
    assert.equal(
      (await saved()).run.pairError,
      "Those don’t match. Try another pair.",
    );
    await at(word("salotos"));
    await p.getByRole("textbox").fill("pomidoras");
    await p.keyboard.press("Enter");
    await p.locator(".lesson-feedback.incorrect").waitFor();
    assert.ok(
      !(await p.locator(".lesson-feedback").innerText()).includes("salotos"),
    );
    await at(word("salotos"));
    await p.getByRole("textbox").fill("salatos");
    await p.keyboard.press("Enter");
    await p.locator(".lesson-feedback.spelling").waitFor();
    await expect
      .poll(async () => (await saved()).events.at(-1)?.assessment?.reason)
      .toBe("vocabulary-typo");
    assert.equal(
      (await saved()).events.at(-1).assessment.reason,
      "vocabulary-typo",
    );
    assert.equal((await saved()).events.at(-1).independentRecall, false);
    await p.screenshot({ path: `${output}/${width}-vocabulary-typo.png` });
    await at(word("ryžiai"));
    await p.getByRole("textbox").fill("ryziai");
    await p.keyboard.press("Enter");
    await p.locator(".lesson-feedback.spelling").waitFor();
    assert.ok(
      (await p.locator(".lesson-feedback").innerText()).includes("ryžiai"),
    );
    checks.push(
      `${width}px: one Help entry, useful cue, persisted bounded choices, right-first matching without translation, distinct wrong-word/spelling outcomes`,
    );
    const now = Date.now();
    const fruits = ["vynuogė", "slyva", "vyšnia"].map(word);
    const seed = {
      ...r.createState(),
      events: [
        event(word("kava"), now - 5000, false),
        ...fruits.map((q, i) => event(q, now - 4000 + i)),
      ],
    };
    let s = r.startReview(seed, now);
    s = r.advance(s, now + 1);
    await load(s);
    const seen = new Map();
    for (let i = 0; i < 36; i++) {
      s = await saved();
      if (s.run.done) break;
      const q = s.run.queue[s.run.index],
        n = seen.get(q.target) || 0;
      assert.notEqual(q.target, "c2-word:kava");
      if (q.options) {
        assert.ok(q.options.length <= 4);
        assert.equal(q.teaching, undefined);
        const wrong = q.options.findIndex((a) => !q.answers.includes(a));
        await p.keyboard.press(String(wrong + 1));
      } else await p.getByRole("textbox").fill(n < 2 ? "wrong" : q.answers[0]);
      if (q.repairStage === 2) assert.equal(q.answerVisible, true);
      await p
        .getByRole("button", { name: "Check answer", exact: true })
        .click();
      await p.locator(".lesson-feedback").waitFor();
      if (n < 3)
        assert.equal((await saved()).events.at(-1).independentRecall, false);
      else assert.equal((await saved()).events.at(-1).independentRecall, true);
      if (i === 3 || i === 6) {
        await p.screenshot({
          path: `${output}/${width}-repair-${q.repairStage}.png`,
        });
        await p.reload();
        await p.locator(".lesson-feedback").waitFor();
      }
      await p.keyboard.press("Space");
      await p.locator(".lesson-feedback").waitFor({ state: "hidden" });
      seen.set(q.target, n + 1);
    }
    assert.equal((await saved()).run.done, true);
    assert.deepEqual([...seen.values()], [5, 5, 5]);
    assert.equal(await p.locator(".lesson-complete").count(), 1);
    s = r.startLesson(seed, "c2-describe", now + 1, 0);
    s = r.advance(s, now + 2);
    await load(s);
    assert.equal(
      (await saved()).run.queue.filter((q) => q.adaptiveReturn).length,
      2,
    );
    assert.ok(
      await p.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    );
    checks.push(
      `${width}px: 15-turn weak-fruit practice, graduated repairs, no coffee filler, supported success has no recall credit, separated recall resolves difficulty, adaptive course returns`,
    );
    await ctx.close();
  }
  checks.push(...(await checkApp(browser, base, output)));
  assert.deepEqual(errors, []);
  await writeFile(
    `${output}/browser-check.json`,
    JSON.stringify(
      { checkedAt: new Date().toISOString(), checks, errors },
      null,
      2,
    ) + "\n",
  );
  console.log(checks.join("\n"));
} finally {
  await browser.close();
}
