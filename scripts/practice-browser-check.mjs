import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
import { items } from "../src/curriculum.js";
import { normalize, clozeAnswer, STORAGE_KEY } from "../src/engine.js";
import { wordPracticeSet } from "../src/practice.js";
import { tmpdir } from "node:os";
import { join } from "node:path";
const browser = await chromium.launch({
  headless: true,
  executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE,
});
const errors = [];
async function reveal(p) {
  if (await p.getByRole("button", { name: "Try it", exact: true }).isVisible())
    await p.keyboard.press("Enter");
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
  await p.keyboard.press("Enter");
  return type;
}
async function finish(p, failFirst = 0) {
  const types = [];
  while (!(await p.locator(".summary").count())) {
    assert.ok(types.length < 45, "Session did not end");
    types.push(await solve(p, types.length < failFirst));
    await p.keyboard.press("Enter");
  }
  return types;
}

try {
  const p = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  p.on("pageerror", (e) => errors.push(e.message));
  await p.goto("http://127.0.0.1:5173/");
  await p
    .locator(".sidebar")
    .getByRole("button", { name: "My words", exact: true })
    .click();
  await p.getByLabel("Filter words").selectOption("all");
  await p.getByLabel("Search words").fill("dog");
  await p
    .locator(".word-table-row")
    .filter({ has: p.locator("strong").getByText("šuo", { exact: true }) })
    .click();
  assert.equal(await p.locator(".session-top-middle > span").innerText(), "Practice");
  assert.equal(await p.locator(".intro-words > div").count(), 3);
  await p.keyboard.press("Enter");
  await finish(p);
  const progress = await p.evaluate(
    (key) => JSON.parse(localStorage.getItem(key)),
    STORAGE_KEY,
  );
  const allowed = new Set(
    wordPracticeSet(items.find((i) => i.lt === "šuo")).items.map((i) => i.id),
  );
  assert.ok(
    progress.events
      .filter((e) => e.type === "answer")
      .every((e) => allowed.has(e.item)),
  );
  assert.equal(
    progress.events.filter((e) => e.type === "lessonPass").length,
    0,
  );
  assert.equal(progress.events.filter((e) => e.type === "answer").length, 9);
  await p.keyboard.press("Enter");
  assert.equal(await p.locator(".session").count(), 0);
  await p
    .locator(".sidebar")
    .getByRole("button", { name: "Reference", exact: true })
    .click();
  await p.getByLabel("Search reference").fill("namas");
  assert.ok(
    await p
      .locator(".reference-scroll td")
      .getByText("namas", { exact: true })
      .isVisible(),
  );
  await p
    .locator(".sidebar")
    .getByRole("button", { name: "Practice", exact: true })
    .click();
  assert.equal(
    await p.getByLabel("Practice category").locator("option").count(),
    4,
  );
  await p.getByLabel("Practice category").selectOption("texts");
  await p
    .locator(".skill-card")
    .filter({ hasText: "Introduce yourself" })
    .click();
  await p.keyboard.press("Enter");
  const draft = p.locator("textarea");
  await draft.fill("Labas");
  await draft.press("Enter");
  assert.equal(await draft.inputValue(), "Labas\n");
  assert.equal(await p.locator(".summary").count(), 0);
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
  await mobile
    .getByRole("button", { name: "Start course", exact: true })
    .click();
  await mobile.keyboard.press("Enter");
  await reveal(mobile);
  assert.equal(
    await mobile.locator(".session-top-middle > span").innerText(),
    "Chapter 1 - Lesson 1 of 5",
  );
  const footer = mobile.locator(".answer-footer");
  let rect = await footer.boundingBox();
  assert.ok(
    rect.y + rect.height <= 846 && rect.y + rect.height >= 820,
    JSON.stringify(rect),
  );
  await mobile.screenshot({
    path: join(tmpdir(), "labukas-lesson-bottom.png"),
  });
  await mobile.setViewportSize({ width: 390, height: 520 });
  await mobile.waitForTimeout(150);
  rect = await footer.boundingBox();
  assert.ok(
    rect.y + rect.height <= 522 && rect.y + rect.height >= 500,
    JSON.stringify(rect),
  );
  await solve(mobile, true);
  assert.equal(
    await mobile.getByText("Why this answer?", { exact: true }).count(),
    0,
  );
  await mobile.keyboard.press("Enter");
  assert.ok(
    await mobile.evaluate(
      () => document.querySelector(".session").scrollWidth <= innerWidth,
    ),
  );
  assert.deepEqual(errors, []);
  console.log(
    "PASS: bounded word practice, no course credit from practice, Enter through the complete session, writing newlines, reference search, four categories, mobile bottom action at full and reduced viewport heights.",
  );
} finally {
  await browser.close();
}
