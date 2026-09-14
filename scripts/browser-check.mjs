import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawn } from "node:child_process";
import { items, lessons, courseSteps, classSteps } from "../src/curriculum.js";
import {
  normalize,
  clozeAnswer,
  STORAGE_KEY,
  stats,
  reinforcement,
} from "../src/engine.js";
const browser = await chromium.launch({
  headless: true,
  executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE,
});
const errors = [];
const page = await browser.newPage({ viewport: { width: 1440, height: 1100 } });
page.on("pageerror", (e) => {
  errors.push(e.message);
  console.error(e.message);
});
async function reveal(p) {
  if (await p.getByRole("button", { name: "Try it", exact: true }).isVisible())
    await p.getByRole("button", { name: "Try it", exact: true }).click();
}
async function solve(p, wrong = false) {
  await reveal(p);
  const form = p.locator("form.exercise");
  await form.waitFor();
  const id = await form.getAttribute("data-item-id"),
    card = items.find((i) => i.id === id),
    type = await form.getAttribute("data-exercise-type");
  if (type === "match") {
    for (const button of await p
      .locator(".matching-grid>div")
      .first()
      .locator("button")
      .all()) {
      const lt = await button.innerText(),
        i = items.find((i) => i.lt === lt);
      await button.click();
      await p
        .locator(".matching-grid>div")
        .nth(1)
        .getByRole("button", { name: i.en, exact: true })
        .click();
    }
  } else {
    const question = await p.locator(".question-bubble p").innerText(),
      reverse = (
        await p.locator(".question-bubble small").innerText()
      ).includes("CHOOSE THE ENGLISH");
    const expected =
      card.activity === "reading"
        ? card.lt
        : question.includes("___")
          ? clozeAnswer(card)
          : reverse
            ? card.en
            : card.lt;
    if (type === "choice") {
      const buttons = await p.locator(".answer-options button").all();
      for (const b of buttons) {
        const text = await b.locator("strong").innerText();
        if (
          wrong
            ? normalize(text) !== normalize(expected)
            : normalize(text) === normalize(expected)
        ) {
          await b.click();
          break;
        }
      }
    } else if (type === "order") {
      const tokens = wrong
        ? [normalize(card.lt).split(" ")[0]]
        : normalize(card.lt).split(" ");
      for (const t of tokens)
        for (const b of await p.locator(".word-tiles button:enabled").all())
          if (normalize(await b.innerText()) === t) {
            await b.click();
            break;
          }
    } else await p.locator("#answer").fill(wrong ? "wrong" : expected);
  }
  await p.getByRole("button", { name: "Check answer", exact: true }).click();
  return type;
}
async function finish(p, failFirst = 0) {
  const types = [];
  while (!(await p.locator(".summary").count())) {
    assert.ok(types.length < 45, "Session did not end");
    types.push(await solve(p, types.length < failFirst));
    await p.getByRole("button", { name: "Continue", exact: true }).click();
  }
  return types;
}
async function chooseClass(p, id, n = 0, mobile = false) {
  await p
    .locator(mobile ? ".mobile-nav" : ".sidebar nav")
    .getByRole("button", { name: "Your course" })
    .click();
  const l = lessons.find((l) => l.id === id),
    chapter = p.locator(".course-chapter").nth(l.chapter);
  if (
    (await chapter.locator(".chapter-toggle").getAttribute("aria-expanded")) !==
    "true"
  )
    await chapter.locator(".chapter-toggle").click();
  const block = chapter.locator(".class-block").filter({
    has: p.locator("summary strong").getByText(l.title, { exact: true }),
  });
  // Match through the summary itself, so repeated lesson labels do not collide.
  const all = await chapter.locator(".class-block").all();
  let target;
  for (const b of all)
    if ((await b.locator("summary strong").innerText()) === l.title) {
      target = b;
      break;
    }
  assert.ok(target);
  if ((await target.getAttribute("open")) === null)
    await target.locator("summary").click();
  await target.locator("button").nth(n).click();
}
if (!process.argv.includes("--offline-only")) {
  await page.goto("http://127.0.0.1:5173/");
  await page.getByRole("heading", { name: "Labas, new beginnings." }).waitFor();
  await page.screenshot({
    path: join(tmpdir(), "labukas-desktop.png"),
    fullPage: true,
  });
  // Reproduce the actual complaint, fresh: café discovery must include production,
  // remain in the same class, then require guided use before another subject.
  await chooseClass(page, "c2l1");
  await page.getByRole("button", { name: "Let’s try it" }).click();
  const first = await finish(page);
  assert.equal(first.length, 9);
  assert.ok(first.includes("type"));
  assert.ok(first.includes("choice"));
  await page
    .getByRole("button", { name: "Continue course", exact: true })
    .click();
  await page
    .getByRole("heading", {
      name: "Something delicious",
      exact: true,
      level: 1,
    })
    .waitFor();
  await page.getByText("Session 2 of 5 in this class").waitFor();
  await page.getByRole("button", { name: "Let’s try it" }).click();
  await finish(page);
  await page
    .getByRole("button", { name: "Continue course", exact: true })
    .click();
  await page.getByText("Build with support", { exact: true }).waitFor();
  await page
    .getByRole("heading", {
      name: "Something delicious",
      exact: true,
      level: 1,
    })
    .waitFor();
  await page.getByRole("button", { name: "Let’s try it" }).click();
  assert.ok((await finish(page)).includes("type"));
  await page
    .getByRole("button", { name: "Continue course", exact: true })
    .click();
  await page
    .getByRole("heading", { name: "Choose a drink", exact: true, level: 1 })
    .waitFor();
  await page.getByRole("button", { name: "Close lesson" }).click();
  await page.reload();
  const saved = await page.evaluate(
    (key) => JSON.parse(localStorage.getItem(key)),
    STORAGE_KEY,
  );
  assert.equal(
    saved.events.filter((e) => e.type === "lessonPass" && e.lesson === "c2l1")
      .length,
    3,
  );
  // The recall visit is separate, and doesn't show its answer list in the intro.
  await chooseClass(page, "c2l1", 3);
  assert.equal(await page.locator(".intro-words").count(), 0);
  await page.getByRole("button", { name: "Let’s try it" }).click();
  const recall = await finish(page);
  assert.ok(recall.includes("type"));
  await page.getByRole("button", { name: "Back to your journey" }).click();
  // Pattern introduction differs: a worked example, a missing-form choice, then building.
  await chooseClass(page, "c1l2");
  await page
    .locator(".session-top-middle > span")
    .filter({ hasText: "Lesson 1 of" })
    .waitFor();
  await page.getByRole("button", { name: "Let’s try it" }).click();
  await page.getByText("A WORKED EXAMPLE").waitFor();
  await reveal(page);
  assert.ok(
    (await page.locator(".question-bubble p").innerText()).includes("___"),
  );
  const grammar = await finish(page);
  assert.ok(grammar.includes("order"));
  assert.ok(grammar.includes("cloze"));
  await page.getByRole("button", { name: "Back to your journey" }).click();
  // The chapter check cannot be used to jump past its teaching sessions.
  await page
    .locator(".sidebar nav")
    .getByRole("button", { name: "Your course" })
    .click();
  const c1 = page.locator(".course-chapter").first();
  if (
    (await c1.locator(".chapter-toggle").getAttribute("aria-expanded")) !==
    "true"
  )
    await c1.locator(".chapter-toggle").click();
  await c1
    .getByRole("button", { name: /Chapter check/ })
    .first()
    .click();
  await page
    .getByText(
      "Finish the chapter’s learning sessions before taking its check.",
    )
    .waitFor();
  assert.equal(await page.locator(".session").count(), 0);
  await page.screenshot({
    path: join(tmpdir(), "labukas-course.png"),
    fullPage: true,
  });
  // Existing saves retain introduction credit but lead back into the same class's practice.
  const legacy = await browser.newPage();
  await legacy.goto("http://127.0.0.1:5173/");
  await legacy.evaluate(
    (key) =>
      localStorage.setItem(
        key,
        JSON.stringify({
          version: 1,
          events: [
            {
              id: "old-pass",
              type: "complete",
              lesson: "c2l1",
              at: Date.now(),
            },
          ],
        }),
      ),
    STORAGE_KEY,
  );
  await legacy.reload();
  await legacy
    .getByRole("button", { name: "Continue course", exact: true })
    .click();
  await legacy
    .getByRole("heading", {
      name: "Something delicious",
      exact: true,
      level: 1,
    })
    .waitFor();
  await legacy.getByText("Session 2 of 5 in this class").waitFor();
  await legacy.close();
  // Due work and weak spots must never hijack the curriculum continuation.
  const routing = await browser.newPage();
  await routing.goto("http://127.0.0.1:5173/");
  const old = Date.now() - 7 * 86400000;
  const overdue = {
    version: 1,
    events: items.slice(0, 4).map((item, n) => ({
      id: `due-${n}`,
      type: "answer",
      item: item.id,
      correct: true,
      stage: 0,
      at: old + n,
    })),
  };
  async function seedRouting(progress) {
    await routing.evaluate(
      ({ key, progress }) =>
        localStorage.setItem(key, JSON.stringify(progress)),
      { key: STORAGE_KEY, progress },
    );
    await routing.reload();
  }
  async function assertCourse(progress) {
    await routing
      .getByRole("button", { name: "Continue course", exact: true })
      .click();
    assert.equal(
      await routing.locator(".session").getAttribute("data-session-mode"),
      "lesson",
    );
    assert.equal(
      await routing.locator(".session").getAttribute("data-course-step"),
      stats(progress).nextStep.id,
    );
  }
  await seedRouting(overdue);
  assert.equal(stats(overdue).due.length, 4);
  await assertCourse(overdue);
  await routing.getByRole("button", { name: "Close lesson" }).click();
  await routing
    .getByRole("button", { name: "Review 4 due", exact: true })
    .click();
  assert.equal(
    await routing.locator(".session").getAttribute("data-session-mode"),
    "review",
  );
  const weak = {
    version: 1,
    events: [
      {
        id: "weak-pass",
        type: "lessonPass",
        lesson: "c2l1",
        step: classSteps("c2l1")[0].id,
        reinforce: [lessons.find((l) => l.id === "c2l1").items[0].id],
        at: old,
      },
    ],
  };
  await seedRouting(weak);
  await assertCourse(weak);
  await routing.getByRole("button", { name: "Close lesson" }).click();
  await routing
    .getByRole("button", { name: "Review weak spots", exact: true })
    .click();
  assert.equal(
    await routing.locator(".session").getAttribute("data-session-mode"),
    "review",
  );
  // A difficult completed session still continues into its next scheduled lesson.
  await seedRouting({ version: 1, events: [] });
  await chooseClass(routing, "c2l1");
  await routing.getByRole("button", { name: "Let’s try it" }).click();
  await finish(routing, 3);
  const difficult = await routing.evaluate(
    (key) => JSON.parse(localStorage.getItem(key)),
    STORAGE_KEY,
  );
  assert.ok(
    reinforcement(difficult),
    "Expected weak spots after difficult lesson",
  );
  await assertCourse(difficult);
  const completedCourse = {
    version: 1,
    events: courseSteps.map((step, n) => ({
      id: `pass-${n}`,
      type: "lessonPass",
      lesson: step.classId,
      step: step.id,
      at: old + n,
    })),
  };
  await seedRouting(completedCourse);
  await routing
    .getByRole("button", { name: "View completed course", exact: true })
    .click();
  assert.equal(await routing.locator(".session").count(), 0);
  assert.ok(await routing.locator(".course-chapter").count());
  await routing.close();
  const mobile = await browser.newPage({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  });
  mobile.on("pageerror", (e) => errors.push(e.message));
  await mobile.goto("http://127.0.0.1:5173/");
  assert.ok(
    await mobile.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  );
  await mobile.screenshot({
    path: join(tmpdir(), "labukas-mobile.png"),
    fullPage: true,
  });
  await chooseClass(mobile, "c2l1", 0, true);
  await mobile.getByRole("button", { name: "Let’s try it" }).click();
  await finish(mobile);
  assert.ok(
    await mobile.evaluate(
      () => document.querySelector(".session").scrollWidth <= innerWidth,
    ),
  );
  // Reading uses a passage and a question, without a first-look answer reveal.
  await mobile
    .getByRole("button", { name: "Back to your journey", exact: true })
    .click();
  await chooseClass(mobile, "c2-situation-menu", 0, true);
  assert.equal(await mobile.locator(".intro-words").count(), 0);
  await mobile.getByRole("button", { name: "Let’s try it" }).click();
  await mobile.locator(".reading-passage").waitFor();
  assert.equal(await mobile.locator(".first-look").count(), 0);
  await mobile.screenshot({
    path: join(tmpdir(), "labukas-reading-mobile.png"),
    fullPage: false,
  });
  await finish(mobile);
  await mobile
    .getByRole("button", { name: "Back to your journey", exact: true })
    .click();
  await chooseClass(mobile, "c2-situation-menu", 1, true);
  await mobile.getByRole("button", { name: "Let’s try it" }).click();
  assert.ok((await finish(mobile)).includes("type"));
  await mobile
    .getByRole("button", { name: "Back to your journey", exact: true })
    .click();
  // Writing is saved and explicitly self-reviewed, never automatically graded.
  await chooseClass(mobile, "c2-writing", 0, true);
  assert.equal(await mobile.locator(".intro-words").count(), 0);
  await mobile.getByRole("button", { name: "Let’s try it" }).click();
  await mobile
    .locator("textarea#answer")
    .fill("Norėčiau arbatos be cukraus. Mokėsiu kortele.");
  await mobile
    .getByRole("button", { name: "Compare my draft", exact: true })
    .click();
  assert.ok(
    await mobile
      .getByRole("button", { name: "Continue", exact: true })
      .isDisabled(),
  );
  await mobile.getByRole("checkbox").check();
  await mobile.screenshot({
    path: join(tmpdir(), "labukas-writing-mobile.png"),
    fullPage: false,
  });
  await mobile.getByRole("button", { name: "Continue", exact: true }).click();
  await mobile
    .getByText("self-reviewed, not graded", { exact: true })
    .waitFor();
  const writingSave = await mobile.evaluate(
    (key) => JSON.parse(localStorage.getItem(key)),
    STORAGE_KEY,
  );
  assert.ok(
    writingSave.events.some(
      (e) => e.selfAssessed && e.draft.includes("Mokėsiu kortele"),
    ),
  );
  assert.equal(stats(writingSave).records["c2-writing-draft"], undefined);
  await mobile
    .getByRole("button", { name: "Back to your journey", exact: true })
    .click();
  await chooseClass(mobile, "c2-writing", 0, true);
  await mobile.getByRole("button", { name: "Let’s try it" }).click();
  assert.ok(
    (await mobile.locator("textarea#answer").inputValue()).includes(
      "Mokėsiu kortele",
    ),
  );
  assert.ok(
    await mobile.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  );
  await mobile.getByRole("button", { name: "Close lesson" }).click();
  // Optional appendix sessions are available but absent from the guided path.
  const extra = lessons.find((l) => l.optional);
  await chooseClass(page, extra.id);
  await page.getByRole("button", { name: "Let’s try it" }).click();
  await finish(page);
  await page
    .getByRole("button", { name: "Back to your journey", exact: true })
    .click();
  assert.ok(!courseSteps.some((step) => step.classId === extra.id));
}

// Production offline behavior still works with the expanded course and event schema.
const preview = spawn(
  process.execPath,
  [
    "node_modules/vite/bin/vite.js",
    "preview",
    "--host",
    "127.0.0.1",
    "--port",
    "4179",
    "--strictPort",
  ],
  { stdio: "ignore" },
);
try {
  for (let i = 0; i < 60; i++) {
    try {
      if ((await fetch("http://127.0.0.1:4179/")).ok) break;
    } catch {}
    await new Promise((r) => setTimeout(r, 100));
  }
  const ctx = await browser.newContext(),
    p = await ctx.newPage();
  p.on("pageerror", (e) => errors.push(e.message));
  await p.goto("http://127.0.0.1:4179/");
  await p.getByRole("button", { name: "Start course", exact: true }).waitFor();
  await p.evaluate(() => navigator.serviceWorker.ready);
  await p.waitForFunction(() => Boolean(navigator.serviceWorker.controller));

  await ctx.setOffline(true);
  await p.reload();
  await p
    .getByRole("button", { name: "Start course", exact: true })
    .waitFor({ timeout: 10000 })
    .catch(async (e) => {
      console.error(
        "Offline page:",
        await p.locator("body").innerText(),
        errors,
      );
      throw e;
    });
  await p.getByRole("button", { name: "Start course", exact: true }).click();
  await p.getByRole("button", { name: "Let’s try it" }).click();
  await solve(p);
  assert.ok(
    (
      await p.evaluate(
        (key) => JSON.parse(localStorage.getItem(key)),
        STORAGE_KEY,
      )
    ).events.length,
  );
  await ctx.close();
} finally {
  preview.kill();
}
assert.equal(errors.length, 0, errors.join("\n"));
console.log(
  process.argv.includes("--offline-only")
    ? "PASS: offline production loading and saved answers."
    : "PASS: reading comprehension, writing self-review and saved drafts, optional appendix, curriculum continuation with overdue reviews and weak spots, explicit review, completed-course routing, café production before advancement, multi-session class progression, separate recall, grammar-specific introduction, checkpoint prerequisites, legacy progress, mobile, offline, no browser errors.",
);
await browser.close();
