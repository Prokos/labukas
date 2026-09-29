import assert from "node:assert/strict";
import { expect } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { courses, chapterTwoCourse as course } from "../tests/helpers.js";
import { createCourseRuntime } from "../src/learning/session.js";
import { readCourse, seedCourse } from "./browser-helpers.mjs";
export async function checkApp(browser, base, output) {
  const checks = [];
  for (const width of [1440, 390]) {
    const context = await browser.newContext({
      viewport: { width, height: 844 },
      isMobile: width === 390,
      hasTouch: width === 390,
    });
    const p = await context.newPage();
    const errors = [];
    p.on("pageerror", (e) => errors.push(e.message));
    p.setDefaultTimeout(10000);
    try {
      await p.goto(base);
      await p
        .getByRole("button", { name: "Continue course", exact: true })
        .waitFor();
      assert.ok(
        await p
          .locator(width === 390 ? ".mobile-brand svg" : ".brand svg")
          .first()
          .isVisible(),
      );
      await p
        .getByRole("button", { name: "Continue course", exact: true })
        .click();
      await p.getByLabel("Choose chapter").selectOption("2");
      await p
        .getByRole("button", { name: "Start lesson", exact: true })
        .click();
      await p.getByRole("button", { name: "Let’s begin" }).click();
      await p.keyboard.press("Space");
      await p.locator(".lesson-options button").first().waitFor();
      await p.keyboard.press("1");
      await p.keyboard.press("Enter");
      await p.locator(".lesson-feedback").waitFor();
      await p.screenshot({ path: `${output}/${width}-shell.png` });
      await p
        .getByRole("button", { name: "Close lesson", exact: true })
        .click();
      await p.getByRole("button", { name: "Open settings" }).click();
      await p.getByRole("button", { name: "Sign in & sync" }).waitFor();
      const downloadPromise = p.waitForEvent("download");
      await p.getByRole("button", { name: "Export backup" }).click();
      const downloaded = await downloadPromise,
        backup = JSON.parse(await readFile(await downloaded.path(), "utf8"));
      assert.ok(
        backup.courses["chapter-2"].events.some((e) => e.type === "answer"),
      );
      const answer = backup.courses["chapter-2"].events.find(
        (e) => e.type === "answer",
      );
      await p.locator("input[type=file]").setInputFiles({
        name: "progress.json",
        mimeType: "application/json",
        buffer: Buffer.from(JSON.stringify(backup)),
      });
      await p.getByText("Backup combined with your progress.").waitFor();
      assert.deepEqual(
        (await readCourse(p, "chapter-2")).events.find(
          (e) => e.id === answer.id,
        ),
        answer,
      );
      const tasks = new Map();
      for (const c of courses)
        for (const lesson of c.lessons)
          for (const q of lesson.steps)
            if (!tasks.has(q.kind)) tasks.set(q.kind, { c, lesson, q });
      for (const [kind, { c, lesson, q }] of tasks) {
        const runtime = createCourseRuntime(c);
        let state = runtime.startLesson(
          {
            ...runtime.createState(),
            completed: c.lessons
              .slice(0, c.lessons.indexOf(lesson))
              .map((l) => l.id),
          },
          lesson.id,
          Date.now(),
          0,
        );
        state = runtime.advance(state);
        state.run.index = state.run.queue.findIndex((s) => s.id === q.id);
        await p.goto(`${base}?chapter=${c.number}`);
        await p.getByLabel("Choose chapter").waitFor();
        await seedCourse(p, c.key, state);
        await p.reload();
        await p.locator(`[data-step="${q.id}"]`).waitFor();
        if (kind === "model") {
          await p
            .getByRole("button", { name: "Continue", exact: true })
            .click();
          continue;
        }
        if (kind === "match") {
          for (const [lt, en] of q.pairs) {
            await p
              .locator(".lesson-match")
              .getByRole("button", { name: en, exact: true })
              .click();
            await p
              .locator(".lesson-match")
              .getByRole("button", { name: lt, exact: true })
              .click();
          }
        } else if (kind === "writing") {
          await p.getByRole("textbox").fill(q.sample);
          await p.getByRole("button", { name: "Review my writing" }).click();
          for (const box of await p.getByRole("checkbox").all())
            await box.check();
          await p.getByRole("button", { name: "Save my writing" }).click();
        } else if (kind === "edit") {
          await p
            .locator(".lesson-edit > div")
            .first()
            .getByRole("button")
            .nth(q.editIndex)
            .click();
          await p
            .locator(".lesson-replacements")
            .getByRole("button", { name: q.answers[0], exact: true })
            .click();
        } else if (["bank", "chat-bank"].includes(kind)) {
          for (const word of q.answers[0].replace(/[.!?,]/g, "").split(" "))
            await p
              .locator(".lesson-bank")
              .getByRole("button", { name: word, exact: true })
              .first()
              .click();
        } else if (q.options) {
          await p
            .locator(".lesson-options")
            .getByRole("button")
            .filter({ hasText: q.answers[0] })
            .first()
            .click();
        } else await p.getByRole("textbox").fill(q.answers[0]);
        if (kind !== "writing")
          await p
            .getByRole("button", { name: "Check answer", exact: true })
            .click();
        await p.locator(".lesson-feedback").waitFor();
        await expect
          .poll(async () => (await readCourse(p, c.key)).run.feedback?.status)
          .toBe(kind === "writing" ? "self-reviewed" : "correct");
        assert.ok(
          await p.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
          kind,
        );
        const button = await p
          .getByRole("button", { name: "Continue", exact: true })
          .boundingBox();
        assert.ok(button.y >= 0 && button.y + button.height <= 844, kind);
        await p.screenshot({ path: `${output}/${width}-${kind}.png` });
      }
      const wordLesson = course.lessons.find((l) =>
        l.steps.some((q) => q.kind === "type"),
      );
      const word = wordLesson.steps.find((q) => q.kind === "type");
      const r = createCourseRuntime(course);
      let draft = r.advance(
        r.startLesson(r.createState(), wordLesson.id, Date.now(), 0),
      );
      draft.run.index = draft.run.queue.findIndex((q) => q.id === word.id);
      await p.goto(`${base}?chapter=2`);
      await p.getByLabel("Choose chapter").waitFor();
      await seedCourse(p, course.key, draft);
      await p.reload();
      await p.getByRole("textbox").fill("draft");
      await expect
        .poll(async () => (await readCourse(p, course.key)).run.answer)
        .toBe("draft");
      await p.reload();
      await expect(p.getByRole("textbox")).toHaveValue("draft");
      const second = await context.newPage();
      await second.goto(`${base}?chapter=2`);
      await expect(second.getByRole("textbox")).toHaveValue("draft");
      await p.getByRole("textbox").fill("cross tab");
      await expect(second.getByRole("textbox")).toHaveValue("cross tab");
      await second.close();
      if (await p.locator('meta[name="app-version"]').count()) {
        await p.evaluate(() => navigator.serviceWorker.ready);
        await expect
          .poll(() => p.evaluate(() => !!navigator.serviceWorker.controller))
          .toBe(true);
        await context.setOffline(true);
        await p.reload();
        await expect(p.getByRole("textbox")).toHaveValue("cross tab");
        await p.getByRole("textbox").fill(word.answers[0]);
        await p.keyboard.press("Enter");
        await p.locator(".lesson-feedback.correct").waitFor();
        await expect
          .poll(
            async () =>
              (await readCourse(p, course.key)).events.at(-1)?.outcome,
          )
          .toBe("correct");
        await context.setOffline(false);
        checks.push(
          `${width}px: offline reload, draft recovery and answer persistence`,
        );
      }
      checks.push(
        `${width}px: typed drafts survive reload and changes arrive in a second tab`,
      );
      assert.deepEqual(errors, []);
      checks.push(
        `${width}px: navigation, branding, backup round trip, number/Enter/Space shortcuts and all ${tasks.size} exercise kinds`,
      );
    } finally {
      await context.close();
    }
  }
  return checks;
}
