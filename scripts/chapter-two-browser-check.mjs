import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import {
  chapterTwoCourse as course,
  chapterTwoRuntime as runtime,
} from "../src/chapter-two-content.js";
const base = process.env.APP_URL || "http://127.0.0.1:5174/";
const output = "docs/evidence/chapter-two";
await mkdir(output, { recursive: true });
const browser = await chromium.launch({
  headless: true,
  executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE,
});
const checks = [],
  errors = [];
const saved = (p) =>
  p.evaluate((key) => JSON.parse(localStorage.getItem(key)), course.key);
const shot = (p, name) =>
  p.screenshot({ path: `${output}/${name}.png`, animations: "disabled" });
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
    if (q.kind === "match") {
      for (const pair of q.pairs) {
        await p
          .locator(".opening-match")
          .getByRole("button", { name: pair[0], exact: true })
          .click();
        await p
          .locator(".opening-match")
          .getByRole("button", { name: pair[1], exact: true })
          .click();
      }
    } else if (q.kind === "edit") {
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
    } else if (["bank", "chat-bank"].includes(q.kind)) {
      for (const word of q.answers[0].replace(/[.!?,]/g, "").split(" "))
        await p
          .locator(".opening-tiles")
          .getByRole("button", { name: word, exact: true })
          .click();
    } else if (q.options) {
      const index = q.options.indexOf(q.answers[0]);
      assert.ok(index >= 0, q.id);
      await p.locator(".opening-options button").nth(index).click();
    } else await p.getByRole("textbox").fill(q.answers[0]);
    await p.getByRole("button", { name: "Check answer", exact: true }).click();
  }
  await p.locator(".opening-feedback").waitFor();
  assert.ok(
    ["correct", "self-reviewed"].includes((await saved(p)).run.feedback.status),
    q.id,
  );
  await p.getByRole("button", { name: "Continue", exact: true }).click();
}
async function load(p, id, variant = 0) {
  const l = course.lessons.find((l) =>
    course.stepsFor(l, variant).some((q) => q.id === id),
  );
  let s = runtime.advanceOpening(
    runtime.startOpening(runtime.freshOpening(), l.id, 1, variant),
    2,
  );
  s.run.index = s.run.queue.findIndex((q) => q.id === id);
  await p.evaluate(
    ({ key, s }) => localStorage.setItem(key, JSON.stringify(s)),
    { key: course.key, s },
  );
  await p.reload();
  await p.locator(`[data-step="${id}"]`).waitFor();
  return s;
}
try {
  for (const [device, viewport] of [
    ["desktop", { width: 1440, height: 1000 }],
    ["phone", { width: 390, height: 844 }],
  ]) {
    const ctx = await browser.newContext({ viewport, reducedMotion: "reduce" });
    const p = await ctx.newPage();
    p.on("pageerror", (e) => errors.push(e.message));
    await p.goto(`${base}?preview=chapter2`);
    await p.evaluate(() => {
      localStorage.setItem(
        "labukas.progress.v1",
        '{"version":1,"events":[],"untouched":true}',
      );
      localStorage.setItem("sakyk.opening-sequence.v3", '{"untouched":true}');
    });
    assert.equal(
      await p.locator(".opening-lesson").count(),
      course.lessons.length,
    );
    await shot(p, `${device}-course`);
    await p.getByRole("button", { name: "Start lesson", exact: true }).click();
    let total = 0;
    for (const l of course.lessons) {
      await p.getByRole("button", { name: "Let’s begin", exact: true }).click();
      let guard = 0;
      while (!(await saved(p)).run.done) {
        assert.ok(guard++ < 60, l.id);
        const s = await saved(p);
        const q = s.run.queue[s.run.index];
        await p.locator(`[data-step="${q.id}"]`).waitFor();
        if (
          [
            "c2-phrase-gen",
            "c2-with-edit",
            "c2-menu-budget",
            "c2-culture-cold",
            "c2-object-coffee",
            "c2-final-pay",
            "c2-cents",
            "c2-habits-writing",
          ].includes(q.id)
        )
          await shot(p, `${device}-${q.id}`);
        const overflow = await p.evaluate(
          () => document.documentElement.scrollWidth > window.innerWidth + 1,
        );
        assert.equal(overflow, false, q.id);
        await solve(p, q);
        total++;
      }
      console.log(`${device}: ${l.id} (${guard} screens)`);
      if (l !== course.lessons.at(-1))
        await p
          .getByRole("button", { name: "Next lesson", exact: true })
          .click();
    }
    assert.equal((await saved(p)).completed.length, course.lessons.length);
    const history = await saved(p);
    await writeFile(
      `${output}/${device}-progress.json`,
      JSON.stringify(history, null, 2),
    );
    await p
      .getByRole("button", { name: "Back to course", exact: true })
      .click();
    assert.match(
      await p.locator(".opening-course-meta").innerText(),
      new RegExp(`${course.lessons.length} of ${course.lessons.length}`),
    );
    assert.equal(
      await p.evaluate(() => localStorage.getItem("labukas.progress.v1")),
      '{"version":1,"events":[],"untouched":true}',
    );
    assert.equal(
      await p.evaluate(() => localStorage.getItem("sakyk.opening-sequence.v3")),
      '{"untouched":true}',
    );
    checks.push(
      `${device}: ${total} screens, all ${course.lessons.length} lessons, menu and writing controls, next-lesson progression, old records untouched`,
    );
    await p.getByRole("button", { name: "Practice", exact: true }).click();
    await p.getByRole("region", { name: "Learning progress" }).waitFor();
    assert.match(
      await p.locator(".authored-progress").innerText(),
      /0 remembered later/,
    );
    await shot(p, `${device}-mastery`);
    await p
      .getByRole("button", { name: "Start practice", exact: true })
      .click();
    await p.getByRole("button", { name: "Let’s begin", exact: true }).click();
    let reviewTurns = 0;
    while (!(await saved(p)).run.done) {
      assert.ok(reviewTurns++ < 35);
      const s = await saved(p);
      await solve(p, s.run.queue[s.run.index]);
    }
    assert.equal((await saved(p)).completed.length, course.lessons.length);
    await p
      .getByRole("button", { name: "Back to course", exact: true })
      .click();
    checks.push(
      `${device}: chapter Practice, mastery view, bounded review and no extra course pass`,
    );
    for (const [variant, id, answer] of [
      [0, "c2-final-pay", "Kortele."],
      [1, "c2-final-pay-cash", "Grynaisiais."],
    ]) {
      await load(p, id, variant);
      await p.getByRole("textbox").fill(answer);
      await p.getByRole("textbox").press("Enter");
      await p.locator(".opening-feedback.correct").waitFor();
      assert.equal(runtime.reviewQueue(await saved(p))[0].answers[0], answer);
    }
    checks.push(
      `${device}: card and cash variants retain their own Practice answers`,
    );
    await load(p, "c2-object-potatoes");
    await p.getByRole("textbox").fill("bulvės");
    await p.getByRole("button", { name: "Check answer", exact: true }).click();
    await p.locator(".opening-feedback.incorrect").waitFor();
    assert.match(await p.locator(".opening-feedback").innerText(), /bulves/);
    await shot(p, `${device}-case-correction`);
    assert.ok(
      (await saved(p)).run.queue.some(
        (q) => q.repair && q.target === "c2-object-plural",
      ),
    );
    await load(p, "c2-request-fish");
    await p.getByRole("button", { name: "Show answer", exact: true }).click();
    await p.getByRole("textbox").fill("žuvies");
    await p.reload();
    await p.getByRole("button", { name: "Check answer", exact: true }).click();
    assert.equal((await saved(p)).events.at(-1).independentRecall, false);
    await load(p, "c2-habits-writing");
    await p.getByRole("textbox").fill("Man patinka arbata.");
    await p
      .getByRole("button", { name: "Review my writing", exact: true })
      .click();
    await p.getByRole("checkbox").first().check();
    await p.reload();
    assert.equal(
      await p.getByRole("textbox").inputValue(),
      "Man patinka arbata.",
    );
    assert.equal(await p.getByRole("checkbox").first().isChecked(), true);
    assert.equal(
      await p
        .getByRole("button", { name: "Save my writing", exact: true })
        .isEnabled(),
      false,
    );
    await shot(p, `${device}-writing-review`);
    if (device === "phone") {
      await load(p, "c2-object-water");
      await p.setViewportSize({ width: 390, height: 430 });
      await p.getByRole("textbox").focus();
      await shot(p, "phone-keyboard-space");
      const b = await p
        .getByRole("button", { name: "Check answer", exact: true })
        .boundingBox();
      assert.ok(b.y + b.height <= 431);
    }
    checks.push(
      `${device}: case-ending mistake, targeted repair, revealed answer evidence, draft/checklist reload`,
    );
    await ctx.close();
  }
  assert.deepEqual(errors, []);
  await writeFile(
    `${output}/browser-results.json`,
    JSON.stringify({ checks, errors }, null, 2),
  );
  console.log("PASS", checks);
} finally {
  await browser.close();
}
