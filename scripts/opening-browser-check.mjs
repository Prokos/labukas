import { spawn } from "node:child_process";
import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import {
  openingLessons,
  OPENING_KEY,
  freshOpening,
  startOpening,
  advanceOpening,
} from "../src/opening-content.js";
const base = process.env.APP_URL || "http://127.0.0.1:5174/";
const output = "docs/evidence/stage-a-connected";
await mkdir(output, { recursive: true });
const browser = await chromium.launch({
  headless: true,
  executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE,
});
const errors = [],
  checks = [];
const saved = (p) =>
  p.evaluate((key) => JSON.parse(localStorage.getItem(key)), OPENING_KEY);
const shot = (p, name) =>
  p.screenshot({ path: `${output}/${name}.png`, animations: "disabled" });
async function solve(p, q, answer = q.answers?.[0]) {
  if (q.kind === "match") {
    for (let i = 0; i < q.pairs.length; i++) {
      await p
        .locator(".opening-match")
        .getByRole("button", { name: q.pairs[i][0], exact: true })
        .click();
      await p
        .locator(".opening-match")
        .getByRole("button", { name: q.pairs[i][1], exact: true })
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
      .getByRole("button", { name: answer, exact: true })
      .click();
  } else if (["bank", "chat-bank"].includes(q.kind)) {
    for (const word of answer.replace(/[.!]/g, "").split(" "))
      await p
        .locator(".opening-tiles")
        .getByRole("button", { name: word, exact: true })
        .click();
  } else if (q.options)
    await p
      .locator(".opening-options")
      .getByRole("button", { name: answer, exact: false })
      .click();
  else await p.getByRole("textbox").fill(answer);
  await p.getByRole("button", { name: "Check answer", exact: true }).click();
}
async function at(p, id) {
  const index = openingLessons.findIndex((l) =>
    l.steps.some((s) => s.id === id),
  );
  let s = startOpening(
    {
      ...freshOpening(),
      completed: openingLessons.slice(0, index).map((l) => l.id),
    },
    openingLessons[index].id,
    1,
    0,
  );
  s = advanceOpening(s, 2);
  s.run.index = s.run.queue.findIndex((q) => q.id === id);
  // Carry real preceding model exposures so Reference is scoped normally.
  s.events.push(
    ...openingLessons.slice(0, index + 1).flatMap((l) =>
      l.steps
        .filter((q) => q.kind === "model")
        .map((q) => ({
          id: `exposure-${q.id}`,
          type: "exposure",
          targets: q.targets,
        })),
    ),
  );
  await p.goto(`${base}?preview=opening`);
  await p.evaluate(
    ({ key, s }) => localStorage.setItem(key, JSON.stringify(s)),
    { key: OPENING_KEY, s },
  );
  await p.reload();
  await p.locator(`[data-step="${id}"]`).waitFor();
  await p.waitForFunction(() => document.querySelector(".sidebar").inert);
  return s.run.queue[s.run.index];
}
try {
  for (const [device, viewport] of [
    ["desktop", { width: 1440, height: 1000 }],
    ["phone", { width: 390, height: 844 }],
  ]) {
    const ctx = await browser.newContext({
        viewport,
        isMobile: device === "phone",
        hasTouch: device === "phone",
      }),
      p = await ctx.newPage();
    p.setDefaultTimeout(10000);
    p.on("pageerror", (e) => errors.push(e.message));
    const legacy =
      '{"version":1,"events":[{"id":"keep-raw","type":"learningRun","at":1}]}';
    await ctx.addInitScript(
      ({ legacy }) => {
        if (!localStorage.getItem("labukas.progress.v1"))
          localStorage.setItem("labukas.progress.v1", legacy);
        if (!localStorage.getItem("sakyk.opening-preview.v2.course"))
          localStorage.setItem(
            "sakyk.opening-preview.v2.course",
            '{"answer":"Praš","index":11}',
          );
      },
      { legacy },
    );
    await p.goto(`${base}?preview=opening`);
    assert.equal(
      await p
        .getByText(
          /no free typing|typing class|copy the|about 3 minutes|try the same experience/i,
        )
        .count(),
      0,
    );
    await p.getByRole("heading", { name: /A little Lithuanian/ }).waitFor();
    const logo = p.locator(
      device === "phone"
        ? ".mobile-brand .sakyk-wordmark"
        : ".brand .sakyk-wordmark",
    );
    assert.ok(
      parseFloat(await logo.evaluate((el) => getComputedStyle(el).fontSize)) >=
        30,
    );
    assert.equal(await p.locator(".opening-lesson-start:disabled").count(), 3);
    await shot(p, `${device}-course`);
    await p.getByRole("button", { name: "Start lesson", exact: true }).click();
    for (let li = 0; li < openingLessons.length; li++) {
      await p
        .getByRole("button", { name: "Let’s begin", exact: true })
        .waitFor();
      await shot(p, `${device}-lesson-${li + 1}-intro`);
      await p.getByRole("button", { name: "Let’s begin", exact: true }).click();
      let turn = 0;
      while (!(await saved(p)).run.done) {
        assert.ok(turn++ < 25, "lesson stays bounded");
        const s = await saved(p),
          q = s.run.queue[s.run.index];
        await p.locator(`[data-step="${q.id}"]`).waitFor();
        if (
          [
            "hello-choice",
            "first-match",
            "name-bank",
            "person-model",
            "you-form",
            "fix-person",
            "person-contrast",
            "final-name",
            "final-name-bank",
          ].includes(q.id)
        )
          await shot(p, `${device}-${q.id}`);
        if (q.id === "final-name-bank") {
          assert.equal(
            await p.getByText("tavo · your", { exact: true }).count(),
            0,
          );
          await p.getByRole("button", { name: "Hint", exact: true }).click();
          assert.match(
            await p.locator(".opening-hint").innerText(),
            /tavo means/,
          );
        }
        if (q.kind !== "model") {
          if (device === "phone" && q.id === "i-form") {
            await solve(p, q, "esi");
            await p.locator(".opening-feedback.incorrect").waitFor();
            await shot(p, "phone-person-correction");
          } else if (q.id === "thanks-recall") {
            await p.getByRole("button", { name: "Hint", exact: true }).click();
            await p.reload();
            assert.ok(await p.locator(".opening-hint").isVisible());
            await solve(p, q, "Dėkui!");
          } else await solve(p, q);
          if (!(device === "phone" && q.id === "i-form"))
            assert.ok(
              await p.locator(".opening-feedback.correct").isVisible(),
              q.id,
            );
          if (q.id === "meet-name" || q.id === "final-name") {
            assert.equal(await p.locator(".opening-message").count(), 5);
            await p.reload();
            assert.equal(await p.locator(".opening-message").count(), 5);
            await shot(p, `${device}-${q.id}-complete`);
          }
          if (q.repair) {
            await shot(p, `${device}-repair`);
            assert.equal(
              (await saved(p)).events.at(-1).independentRecall,
              false,
            );
          }
        }
        assert.ok(
          await p
            .locator(".session")
            .evaluate((el) => el.scrollWidth <= el.clientWidth),
          `no overflow ${q.id}`,
        );
        await p
          .getByRole("button", { name: "Continue", exact: true })
          .press("Enter");
      }
      await p.getByRole("heading", { name: "Lesson complete." }).waitFor();
      await shot(p, `${device}-lesson-${li + 1}-complete`);
      assert.equal((await saved(p)).completed.length, li + 1);
      console.log(`${device}: lesson ${li + 1} complete (${turn} tasks)`);
      if (li < 3)
        await p
          .getByRole("button", { name: "Next lesson", exact: true })
          .click();
    }
    await p
      .getByRole("button", { name: "Back to course", exact: true })
      .click();
    await p.getByText("4 of 4 lessons complete", { exact: true }).waitFor();
    await shot(p, `${device}-course-complete`);
    const history = await saved(p);
    await writeFile(
      `${output}/${device}-progress.json`,
      JSON.stringify(history, null, 2),
    );
    assert.equal(
      await p.evaluate(() => localStorage.getItem("labukas.progress.v1")),
      legacy,
    );
    assert.equal(
      await p.evaluate(() =>
        localStorage.getItem("sakyk.opening-preview.v2.course"),
      ),
      '{"answer":"Praš","index":11}',
    );
    assert.ok(
      history.events.some(
        (e) => e.independentRecall && e.ability === "form-recall",
      ),
    );
    assert.ok(
      history.events.some(
        (e) =>
          e.step === "thanks-recall" &&
          e.correctness &&
          !e.independentRecall &&
          e.requestedHelp.includes("hint"),
      ),
    );
    checks.push(
      `${device}: all four connected lessons, ${history.events.filter((e) => e.type === "answer").length} graded tasks, persistent multi-turn conversation, actual course continuation, old history untouched`,
    );
    // Exact user-reported partial word after genuine preparation in lesson 3.
    const q = await at(p, "reply-recall");
    await p.getByRole("textbox").fill("Praš");
    await p.reload();
    assert.equal(await p.getByRole("textbox").inputValue(), "Praš");
    await p.getByRole("textbox").press("Enter");
    await p.locator(".opening-feedback.incorrect").waitFor();
    assert.equal(
      await p.locator(".opening-feedback p").innerText(),
      "Prašom! — You’re welcome.",
    );
    await shot(p, `${device}-partial-word`);
    assert.ok(
      await p
        .locator(".opening-feedback")
        .evaluate(
          (el) =>
            getComputedStyle(el).color ===
            getComputedStyle(el.querySelector("strong")).color,
        ),
    );
    await at(p, "thanks-recall");
    await p.getByRole("textbox").fill("Ačiu");
    await p.getByRole("textbox").press("Enter");
    await p.locator(".opening-feedback.spelling").waitFor();
    assert.equal(
      await p.locator(".opening-feedback strong").innerText(),
      "Right word. Check the spelling:",
    );
    assert.equal(await p.locator(".opening-feedback p").innerText(), "Ačiū!");
    const spellingEvent = (await saved(p)).events.at(-1);
    assert.equal(spellingEvent.independentWordRecall, true);
    assert.equal(spellingEvent.independentRecall, false);
    assert.equal(spellingEvent.spellingCorrect, false);
    await p.reload();
    await p.locator(".opening-feedback.spelling").waitFor();
    await shot(p, `${device}-spelling-correction`);
    await p.getByRole("button", { name: "Continue", exact: true }).click();
    assert.equal(await p.locator(".opening-feedback").count(), 0);
    checks.push(
      `${device}: spelling correction retains word recall, survives reload, advances without meaning repair`,
    );
    await at(p, "thanks-recall");
    await p.getByRole("textbox").fill("Ači");
    await p.getByRole("textbox").press("End");
    await p.getByRole("button", { name: "ū", exact: true }).click();
    assert.equal(await p.getByRole("textbox").inputValue(), "Ačiū");
    if (device === "phone") {
      await p.setViewportSize({ width: 390, height: 430 });
      await p.getByRole("textbox").focus();
      await p.waitForFunction(
        () =>
          parseFloat(
            document
              .querySelector(".session")
              .style.getPropertyValue("--session-height"),
          ) <= 430,
      );
      await p
        .getByRole("button", { name: "Check answer", exact: true })
        .scrollIntoViewIfNeeded();
      const bounds = await p
          .getByRole("button", { name: "Check answer", exact: true })
          .boundingBox(),
        input = await p.getByRole("textbox").boundingBox();
      assert.ok(
        bounds.y + bounds.height <= 430 &&
          input.y >= 0 &&
          input.y + input.height < bounds.y,
      );
      await shot(p, "phone-keyboard-height");
      await p.setViewportSize(viewport);
    }
    await p.getByRole("button", { name: "Close lesson", exact: true }).click();
    assert.equal(await p.locator(".session").count(), 0);
    await p.reload();
    assert.equal(await p.locator(".session").count(), 0);
    await p.getByRole("button", { name: "Resume lesson", exact: true }).click();
    assert.equal(await p.getByRole("textbox").inputValue(), "Ačiū");
    await p.getByRole("textbox").press("Enter");
    await p.locator(".opening-feedback.correct").waitFor();
    await ctx.close();
  }
  const ctx = await browser.newContext({
      viewport: { width: 390, height: 844 },
    }),
    p = await ctx.newPage();
  p.setDefaultTimeout(10000);
  p.on("pageerror", (e) => errors.push(e.message));
  for (const id of [
    "thanks-reply",
    "name-bank",
    "thanks-recall",
    "i-form-recall",
  ])
    for (const kind of [
      null,
      "hint",
      "reference",
      "reveal",
      ...(["thanks-recall", "i-form-recall"].includes(id) ? ["words"] : []),
    ]) {
      const q = await at(p, id);
      if (kind)
        await p
          .locator(".session")
          .getByRole("button", {
            name: {
              hint: "Hint",
              reference: "Reference",
              reveal: "Show answer",
              words: "Use words instead",
            }[kind],
            exact: true,
          })
          .click();
      await p.reload();
      if (kind === "words") {
        await p
          .locator(".opening-support-words")
          .getByRole("button", { name: q.answers[0], exact: true })
          .click();
        await p
          .getByRole("button", { name: "Check answer", exact: true })
          .click();
      } else await solve(p, q);
      await p.locator(".opening-feedback.correct").waitFor();
      const record = (await saved(p)).events.at(-1);
      assert.deepEqual(record.requestedHelp, kind ? [kind] : []);
      assert.equal(
        record.independentRecall,
        !kind && ["type", "gap-type"].includes(q.kind),
      );
      await p.getByRole("button", { name: "Continue", exact: true }).click();
      assert.deepEqual((await saved(p)).run.help, []);
    }
  checks.push(
    "18 model/bank/choice/typing/help paths; positive supported feedback with scoped evidence, correction and saved resume",
  );
  await ctx.close();
  const server = spawn(
    process.execPath,
    [
      "node_modules/vite/bin/vite.js",
      "preview",
      "--host",
      "127.0.0.1",
      "--port",
      "4184",
      "--strictPort",
    ],
    { stdio: "ignore" },
  );
  try {
    for (let i = 0; i < 60; i++) {
      try {
        if ((await fetch("http://127.0.0.1:4184/")).ok) break;
      } catch {}
      await new Promise((r) => setTimeout(r, 100));
    }
    const offline = await browser.newContext(),
      p = await offline.newPage();
    p.setDefaultTimeout(10000);
    p.on("pageerror", (e) => errors.push(e.message));
    await p.goto("http://127.0.0.1:4184/?preview=opening");
    await p.evaluate(() => navigator.serviceWorker.ready);
    await p.waitForFunction(() => Boolean(navigator.serviceWorker.controller));
    await offline.setOffline(true);
    await p.reload();
    await p.getByRole("button", { name: "Start lesson", exact: true }).click();
    await p.getByRole("button", { name: "Let’s begin", exact: true }).click();
    await p.getByRole("button", { name: "Continue", exact: true }).click();
    await solve(p, openingLessons[0].steps[1]);
    await p.reload();
    await p.locator(".opening-feedback.correct").waitFor();
    await offline.close();
    checks.push("Production offline course, exercise and answer restoration");
  } finally {
    server.kill();
  }
  assert.deepEqual(errors, []);
  await writeFile(
    `${output}/browser-results.json`,
    JSON.stringify(
      {
        checks,
        errors,
        nativeKeyboard:
          "Not tested on physical iOS/Android; reduced visual viewport checked.",
      },
      null,
      2,
    ),
  );
  console.log("PASS", checks);
} finally {
  await browser.close();
}
