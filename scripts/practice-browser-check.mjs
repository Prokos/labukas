import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
import { items } from "../src/curriculum.js";
import { normalize, clozeAnswer, STORAGE_KEY, stats } from "../src/engine.js";
import {
  nextPracticeItems,
  practiceCollection,
  familiarity,
} from "../src/practice.js";
import { tmpdir } from "node:os";
import { join } from "node:path";
const browser = await chromium.launch({
  headless: true,
  executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE,
});
const errors = [];
let checkedTypingResize = false;
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
    let n = 0;
    for (const button of await p
      .locator(".matching-grid>div")
      .first()
      .locator("button")
      .all()) {
      if (await button.isDisabled()) continue;
      const lt = await button.innerText();
      const item = items.find((i) => i.lt === lt);
      const right = p
        .locator(".matching-grid>div")
        .nth(1)
        .getByRole("button", { name: item.en, exact: true });
      const [first, second] = n++ % 2 ? [button, right] : [right, button];
      await first.click();
      assert.equal(await first.getAttribute("aria-pressed"), "true");
      await second.click();
      assert.equal(await button.isDisabled(), true);
      assert.equal(await right.isDisabled(), true);
    }
  } else {
    if (["type", "cloze"].includes(type)) {
      if (!checkedTypingResize && p.viewportSize().width === 390) {
        checkedTypingResize = true;
        assert.equal(await p.evaluate(() => document.fullscreenElement), null);
        await p.setViewportSize({ width: 390, height: 400 });
        await p.waitForFunction(
          () => document.querySelector(".session").clientHeight === 400,
        );
        const action = await p.locator(".answer-footer button").boundingBox();
        const field = await p.locator("#answer").boundingBox();
        const header = await p.locator(".session-top").boundingBox();
        assert.ok(
          action.y >= 0 && action.y + action.height <= 400,
          JSON.stringify(action),
        );
        assert.ok(
          field.y >= 0 && field.y + field.height <= 400,
          JSON.stringify(field),
        );
        assert.ok(
          header.y < 0,
          "Typing must push the progress header off screen",
        );
        await p.screenshot({
          path: join(tmpdir(), "labukas-typing-mobile.png"),
        });
        await p.setViewportSize({ width: 390, height: 844 });
        await p.waitForFunction(
          () => document.querySelector(".session").clientHeight === 844,
        );
        await p.locator(".hint-button").click();
        const firstSpelling = await p.locator(".hint-spelling").innerText();
        assert.equal(firstSpelling[0], card.lt[0]);
        assert.ok(firstSpelling.includes("_"));
        await p.locator(".hint-button").click();
        assert.notEqual(
          await p.locator(".hint-spelling").innerText(),
          firstSpelling,
        );
        assert.equal(await p.locator("#answer").inputValue(), "");
      }

      assert.equal(
        await p
          .locator("#answer")
          .evaluate((el) => document.activeElement === el),
        true,
      );
      assert.equal(
        await p
          .locator("#answer")
          .evaluate((el) => getComputedStyle(el).outlineStyle),
        "none",
      );
    }
    const question = await p.locator(".question-bubble p").innerText(),
      reverse = (await p.locator(".question-bubble small").allTextContents())
        .join(" ")
        .includes("CHOOSE THE ENGLISH");
    const expected =
      card.activity === "reading"
        ? card.lt
        : question.includes("___")
          ? clozeAnswer(card) || card.lt
          : reverse
            ? card.en
            : card.lt;
    if (type === "choice") {
      const buttons = await p.locator(".answer-options button").all();
      const firstEnabled = await p
        .locator(".answer-options button:enabled")
        .first()
        .locator("span")
        .innerText();
      const firstChoice = buttons[Number(firstEnabled) - 1];
      for (const b of buttons) {
        if (await b.isDisabled()) continue;
        const text = await b.locator("strong").innerText();
        if (
          wrong
            ? normalize(text) !== normalize(expected)
            : normalize(text) === normalize(expected)
        ) {
          await p.keyboard.press(firstEnabled);
          assert.ok(
            (await firstChoice.getAttribute("class")).includes("selected"),
          );
          await p.keyboard.press("9");
          await p.keyboard.press("Control+2");
          assert.ok(
            (await firstChoice.getAttribute("class")).includes("selected"),
          );
          const number = buttons.indexOf(b) + 1;
          await p.keyboard.press(`Numpad${number}`);
          assert.ok((await b.getAttribute("class")).includes("selected"));
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
  await p.goto(process.env.APP_URL || "http://127.0.0.1:5173/");
  await p
    .locator(".sidebar nav")
    .getByRole("button", { name: /^Practice/ })
    .click();
  assert.equal(
    await p.getByRole("button", { name: "My words", exact: true }).count(),
    0,
  );
  await p.getByRole("button", { name: "Go to your course" }).click();
  assert.ok(await p.locator(".course-chapter").first().isVisible());
  const pool = items
    .filter((i) => i.teachingKind === "vocabulary" && i.role === "core")
    .slice(0, 10);
  const seed = {
    version: 1,
    events: pool.map((i, n) => ({
      id: `seed-${n}`,
      type: "answer",
      item: i.id,
      stage: 0,
      correct: false,
      at: n,
    })),
  };
  await p.evaluate(
    ({ key, seed }) => localStorage.setItem(key, JSON.stringify(seed)),
    { key: STORAGE_KEY, seed },
  );
  await p.reload();
  await p
    .locator(".sidebar nav")
    .getByRole("button", { name: /^Practice/ })
    .click();
  assert.equal(await p.locator(".sidebar .nav-count").innerText(), "10");
  assert.deepEqual(
    await p
      .locator(".word-table-row")
      .evaluateAll((rows) => rows.map((r) => r.dataset.itemId)),
    practiceCollection(stats(seed).records).map((i) => i.id),
  );
  assert.equal(await p.locator(".up-next").count(), 5);
  await p.getByLabel("Search words").fill("no such word");
  assert.ok(
    await p.getByRole("heading", { name: "No words found" }).isVisible(),
  );
  await p.getByRole("button", { name: "Clear search" }).click();
  await p.screenshot({
    path: join(tmpdir(), "labukas-practice-desktop.png"),
    fullPage: true,
  });
  await p.getByRole("button", { name: "Practice next 5 words" }).click();
  await finish(p, 1);
  const progress = await p.evaluate(
    (key) => JSON.parse(localStorage.getItem(key)),
    STORAGE_KEY,
  );
  const allowed = new Set(
    nextPracticeItems(stats(seed).records).map((i) => i.id),
  );
  assert.ok(
    progress.events
      .slice(seed.events.length)
      .every((e) => e.type === "answer" && allowed.has(e.item)),
  );
  assert.equal(
    progress.events.filter((e) => e.type === "lessonPass").length,
    0,
  );
  assert.ok(
    pool
      .slice(0, 5)
      .every((i) => familiarity(stats(progress).records[i.id]) > 0),
  );
  await p.getByRole("button", { name: "Start next practice" }).click();
  await reveal(p);
  assert.equal(
    await p.locator("form.exercise").getAttribute("data-item-id"),
    nextPracticeItems(stats(progress).records)[0].id,
  );
  assert.equal(
    await p.locator("form.exercise").getAttribute("data-item-id"),
    pool[5].id,
  );
  await finish(p);
  await p.getByRole("button", { name: "Back to your words" }).click();
  assert.equal(await p.locator(".session").count(), 0);
  const first = await p
    .locator(".word-table-row")
    .first()
    .getAttribute("data-item-id");
  await p.locator(".word-table-row").first().click();
  await reveal(p);
  assert.equal(
    await p.locator("form.exercise").getAttribute("data-item-id"),
    first,
  );
  await finish(p);
  // Selecting a word retains a mixed batch, and the next session repicks it.
  await p.getByRole("button", { name: "Start next practice" }).click();
  assert.equal(await p.locator(".session-count").innerText(), "0 / 5 recalled");
  await p.getByRole("button", { name: "Close lesson" }).click();
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
    .locator(".sidebar nav")
    .getByRole("button", { name: "Your course" })
    .click();
  const chapter = p.locator(".course-chapter").nth(0);
  if (
    (await chapter.locator(".chapter-toggle").getAttribute("aria-expanded")) !==
    "true"
  )
    await chapter.locator(".chapter-toggle").click();
  const writing = chapter.locator(".class-block").filter({
    has: p
      .locator("summary strong")
      .getByText("Introduce yourself", { exact: true }),
  });
  await writing.locator("summary").click();
  await writing.locator("button").first().click();
  await p.keyboard.press("Enter");
  const draft = p.locator("textarea");
  await draft.fill("Labas");
  await draft.press("Enter");
  assert.equal(await draft.inputValue(), "Labas\n");
  assert.equal(await p.locator(".summary").count(), 0);
  const practiceMobile = await browser.newPage({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  });
  practiceMobile.on("pageerror", (e) => errors.push(e.message));
  await practiceMobile.addInitScript(
    ({ key, seed }) => localStorage.setItem(key, JSON.stringify(seed)),
    { key: STORAGE_KEY, seed },
  );
  await practiceMobile.goto(process.env.APP_URL || "http://127.0.0.1:5173/");
  await practiceMobile
    .locator(".mobile-nav")
    .getByRole("button", { name: /^Practice/ })
    .click();
  assert.ok(
    await practiceMobile
      .getByRole("button", { name: "Practice next 5 words" })
      .isVisible(),
  );
  assert.ok(
    await practiceMobile.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  );
  await practiceMobile.screenshot({
    path: join(tmpdir(), "labukas-practice-mobile.png"),
    fullPage: true,
  });
  await practiceMobile.close();
  const mobile = await browser.newPage({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  });
  mobile.on("pageerror", (e) => errors.push(e.message));
  await mobile.goto(process.env.APP_URL || "http://127.0.0.1:5173/");
  assert.ok(
    await mobile.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  );
  await mobile.evaluate(() => {
    const keyboard = new EventTarget();
    keyboard.overlaysContent = false;
    keyboard.boundingRect = { top: 844, height: 0 };
    Object.defineProperty(navigator, "virtualKeyboard", {
      configurable: true,
      value: keyboard,
    });
    window.fullscreenCalls = 0;
    const requestFullscreen = document.documentElement.requestFullscreen.bind(
      document.documentElement,
    );
    document.documentElement.requestFullscreen = async (...args) => {
      window.fullscreenCalls++;
      return requestFullscreen(...args);
    };
  });
  await mobile
    .getByRole("button", { name: "Start course", exact: true })
    .click();
  assert.equal(await mobile.evaluate(() => window.fullscreenCalls), 0);
  assert.equal(
    await mobile.evaluate(() => navigator.virtualKeyboard.overlaysContent),
    false,
  );
  await mobile.locator(".intro-footer button").scrollIntoViewIfNeeded();
  const introFooter = await mobile.locator(".intro-footer").boundingBox();
  assert.ok(Math.abs(introFooter.y + introFooter.height - 844) < 2);
  await mobile.keyboard.press("Enter");
  await reveal(mobile);
  assert.equal(
    await mobile.locator(".session-top-middle > span").innerText(),
    "Chapter 1 - Module 1 · Lesson 1/5",
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
  // The keyboard changes the visual viewport, not the layout viewport.
  // The footer must follow the visible viewport without covering the body.
  await mobile.evaluate(() => {
    Object.defineProperty(window.visualViewport, "height", {
      configurable: true,
      value: 420,
    });
    Object.defineProperty(window.visualViewport, "offsetTop", {
      configurable: true,
      value: 50,
    });
    window.visualViewport.dispatchEvent(new Event("resize"));
    window.visualViewport.dispatchEvent(new Event("scroll"));
  });
  await mobile.waitForTimeout(100);
  const visibleSession = await mobile.locator(".session").boundingBox();
  assert.equal(visibleSession.height, 420);
  assert.equal(visibleSession.y, 50);
  rect = await footer.boundingBox();
  assert.ok(Math.abs(rect.y + rect.height - 470) < 2, JSON.stringify(rect));
  const bodyRect = await mobile.locator(".exercise-body").boundingBox();
  assert.ok(
    bodyRect.y + bodyRect.height <= rect.y + 1,
    "Action must not overlap scrollable exercise content",
  );
  await mobile.evaluate(() => {
    delete window.visualViewport.height;
    delete window.visualViewport.offsetTop;
    window.visualViewport.dispatchEvent(new Event("resize"));
  });
  // A keyboard may overlay an unchanged visual viewport.
  await mobile.evaluate(() => {
    navigator.virtualKeyboard.boundingRect = { top: 390, height: 454 };
    navigator.virtualKeyboard.dispatchEvent(new Event("geometrychange"));
  });
  await mobile.waitForFunction(
    () => document.querySelector(".session").clientHeight === 390,
  );
  rect = await footer.boundingBox();
  assert.ok(Math.abs(rect.y + rect.height - 390) < 2, JSON.stringify(rect));
  const action = await footer.locator("button").boundingBox();
  assert.ok(action.y >= 0 && action.y + action.height <= 390);
  const header = await mobile.locator(".session-top").boundingBox();
  assert.ok(header.y < 0, "The progress header must scroll off screen");
  assert.equal(
    await mobile.locator(".session-top").isVisible(),
    true,
    "The header is regular content, not conditionally hidden",
  );
  assert.equal(
    await mobile
      .locator(".exercise-body")
      .evaluate((el) => getComputedStyle(el).overflowY),
    "visible",
  );
  const oldScroll = await mobile
    .locator(".session")
    .evaluate((el) => el.scrollTop);
  await mobile.locator(".session").evaluate((el) => {
    el.scrollTop -= 40;
  });
  const scrolledHeader = await mobile.locator(".session-top").boundingBox();
  assert.ok(
    Math.abs(scrolledHeader.y - header.y - Math.min(40, oldScroll)) < 2,
  );
  await mobile.locator(".session").evaluate((el) => {
    el.scrollTop = el.scrollHeight;
  });
  const overlayBody = await mobile.locator(".exercise-body").boundingBox();
  assert.ok(overlayBody.y + overlayBody.height <= rect.y + 1);
  await mobile.evaluate(() => {
    navigator.virtualKeyboard.boundingRect = { top: 844, height: 0 };
    navigator.virtualKeyboard.dispatchEvent(new Event("geometrychange"));
  });
  assert.equal(await mobile.locator(".session-top").isVisible(), true);
  await mobile.locator(".hint-button").click();
  assert.equal(await mobile.locator(".answer-options .eliminated").count(), 1);
  const excluded = mobile.locator(".answer-options .eliminated");
  await mobile.keyboard.press(await excluded.locator("span").innerText());
  assert.equal(await mobile.locator(".answer-options .selected").count(), 0);
  assert.equal(
    await mobile.locator(".exercise-hint p").innerText(),
    "One incorrect option removed.",
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
  await finish(mobile);
  assert.equal(
    await mobile.evaluate(() => window.fullscreenCalls),
    0,
    "Lessons must not request browser fullscreen",
  );
  assert.equal(await mobile.evaluate(() => document.fullscreenElement), null);
  await mobile
    .locator(".session")
    .getByRole("button", { name: "Continue course", exact: true })
    .click();
  await mobile.locator(".lesson-intro").waitFor();
  assert.equal(
    await mobile.evaluate(
      () => document.querySelector(".session-content").scrollTop,
    ),
    0,
  );
  assert.ok(
    await mobile.evaluate(
      () => !["INPUT", "TEXTAREA"].includes(document.activeElement.tagName),
    ),
  );
  assert.ok(checkedTypingResize, "Must exercise a focused mobile text field");
  const matching = await browser.newPage();
  matching.on("pageerror", (e) => errors.push(e.message));
  await matching.goto(process.env.APP_URL || "http://127.0.0.1:5173/");
  const targets = items
    .filter((i) => i.teachingKind === "vocabulary" && !i.lt.includes(" "))
    .slice(0, 4);
  await matching.evaluate(
    ({ key, targets }) => {
      localStorage.setItem(
        key,
        JSON.stringify({
          version: 1,
          events: targets.map((item, n) => ({
            id: `matching-${n}`,
            type: "answer",
            item: item.id,
            correct: true,
            stage: 1,
            at: Date.now() - 7 * 86400000 + n,
          })),
        }),
      );
    },
    { key: STORAGE_KEY, targets },
  );
  await matching.reload();
  await matching
    .getByRole("button", { name: "See your words", exact: true })
    .click();
  await matching.getByRole("button", { name: "Practice next 4 words" }).click();
  await matching.locator(".hint-button").click();
  await solve(matching);
  assert.equal(await matching.locator(".answer-footer.retry").count(), 1);
  await matching.keyboard.press("Enter");
  await finish(matching, 35);
  assert.ok(
    await matching
      .getByRole("heading", { name: "Progress saved." })
      .isVisible(),
  );
  assert.equal(
    await matching
      .locator(".practice-outcomes")
      .getByText("Needs more support", { exact: true })
      .count(),
    4,
  );
  await matching
    .getByRole("button", { name: "Revisit the lesson" })
    .first()
    .click();
  assert.equal(
    await matching.locator(".session").getAttribute("data-session-mode"),
    "lesson",
  );
  await matching.close();
  assert.deepEqual(errors, []);
  console.log(
    "PASS: bounded adaptive practice and lesson recovery, no course credit from practice, Enter through the complete session, writing newlines, reference search, familiarity ordering and fresh practice batches, no automatic browser fullscreen, a single lesson scroll surface, and fully visible input/action during keyboard viewport resize.",
  );
} finally {
  await browser.close();
}
