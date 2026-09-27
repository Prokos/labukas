import test from "node:test";
import assert from "node:assert/strict";
import {
  chapterTwoCourse as course,
  chapterTwoLessons as lessons,
  chapterTwoRuntime as r,
} from "../src/chapter-two-content.js";
const steps = lessons.flatMap((l) => l.steps);
const step = (id) => steps.find((q) => q.id === id);
function at(id) {
  const l = lessons.find((l) => l.steps.some((q) => q.id === id));
  let s = r.advanceOpening(r.startOpening(r.freshOpening(), l.id, 1, 0), 2);
  s.run.index = s.run.queue.findIndex((q) => q.id === id);
  return s;
}
function answer(s, value, patch = {}) {
  return r.answerOpening(
    { ...s, run: { ...s.run, answer: value, ...patch } },
    Date.now(),
  );
}

test("all chapter lessons are accessible directly, teach their targets and have executable response controls", () => {
  assert.equal(lessons.length, 53);
  assert.equal(new Set(steps.map((q) => q.id)).size, steps.length);
  const known = new Set();
  for (const l of lessons) {
    assert.ok(l.goal && l.sourcePages && l.steps.length > 0, l.id);
    assert.equal(r.startOpening(r.freshOpening(), l.id).run.lessonId, l.id);
    for (const q of l.steps) {
      if (q.kind === "model") {
        q.targets.forEach((t) => known.add(t));
        continue;
      }
      if (q.kind === "writing") {
        assert.ok(q.checklist.length && q.sample);
        continue;
      }
      assert.ok(
        known.has(q.target),
        `${q.id} lacks prior teaching for ${q.target}`,
      );
      assert.ok(q.hint && q.correction, q.id);
      if (q.kind === "match") continue;
      for (const a of q.answers)
        assert.equal(
          r.gradeOpening(q, a, { editIndex: q.editIndex }).status,
          "correct",
          `${q.id}: ${a}`,
        );
      if (q.options) {
        assert.ok(q.options.length >= 2, q.id);
        assert.equal(new Set(q.options).size, q.options.length, q.id);
        assert.ok(
          q.answers.some((a) => q.options.includes(a)),
          q.id,
        );
      }
      if (["bank", "chat-bank"].includes(q.kind)) {
        const tiles = [...q.words];
        for (const w of q.answers[0].replace(/[.!?,]/g, "").split(" ")) {
          const i = tiles.indexOf(w);
          assert.notEqual(i, -1, `${q.id}: missing tile ${w}`);
          tiles.splice(i, 1);
        }
      }
    }
  }
});

test("grammatical diacritics, person shifts and quantities remain meaningful errors", () => {
  for (const [id, a, status] of [
    ["c2-object-coffee", "kava", "incorrect"],
    ["c2-object-coffee", "kavą", "correct"],
    ["c2-object-potatoes", "bulvės", "incorrect"],
    ["c2-object-potatoes", "bulves", "correct"],
    ["c2-quantity-water", "vandenį", "incorrect"],
    ["c2-quantity-water", "vandens", "correct"],
    ["c2-like-group-chat", "Taip, jums patinka.", "incorrect"],
    ["c2-like-group-chat", "Taip, mums patinka.", "correct"],
    ["c2-request-juice", "sultys", "incorrect"],
    ["c2-request-juice", "sulčių", "correct"],
    ["c2-phrase-plural-recall", "šviežios", "incorrect"],
    ["c2-phrase-plural-recall", "šviežių", "correct"],
    ["c2-ingredient-tuna", "tunas", "incorrect"],
    ["c2-ingredient-tuna", "tuno", "correct"],
    ["c2-ingredient-honey", "medus", "incorrect"],
    ["c2-ingredient-honey", "medaus", "correct"],
    ["c2-food-recall", "duona", "correct"],
    ["c2-ingredients-recall", "pienas", "correct"],
  ])
    assert.equal(r.gradeOpening(step(id), a).status, status, `${id}: ${a}`);
  assert.equal(
    r.gradeOpening(step("c2-menu-extras-recall"), "kiauliena").status,
    "correct",
  );
  assert.equal(
    r.gradeOpening(step("c2-more-menu-recall"), "pyragas").status,
    "correct",
  );
});

test("chapter completion traverses every authored task without claiming writing mastery", () => {
  let s = r.freshOpening();
  let time = 1;
  for (const l of lessons) {
    s = r.advanceOpening(r.startOpening(s, l.id, time++, 1), time++);
    let guard = 0;
    while (!s.run.done) {
      assert.ok(guard++ < 60, l.id);
      const q = s.run.queue[s.run.index];
      if (q.kind !== "model") {
        s = r.answerOpening(
          {
            ...s,
            run: {
              ...s.run,
              answer: q.answers?.[0] || q.sample || "matched",
              matched: q.pairs?.map((_, i) => i) || [],
              editIndex: q.editIndex,
              checked: q.checklist?.map((_, i) => i) || [],
            },
          },
          time++,
        );
        assert.ok(s.run.feedback, q.id);
      }
      s = r.advanceOpening(s, time++);
    }
  }
  assert.equal(s.completed.length, lessons.length);
  const writing = s.events.filter((e) => e.ability === "self-reviewed-writing");
  assert.equal(writing.length, 2);
  for (const e of writing) {
    assert.equal(e.correctness, null);
    assert.equal(e.independentRecall, false);
    assert.equal(e.outcome, "self-reviewed");
  }
  const form = s.events.find((e) => e.step === "c2-object-potatoes");
  assert.equal(form.targetForm, "bulves");
  assert.equal(form.independentRecall, true);
});

test("errors repair the same target; help, transcripts and writing drafts survive serialization", () => {
  let s = answer(at("c2-with-milk"), "pieno");
  const repair = s.run.queue.find((q) => q.repair);
  assert.equal(repair.target, "c2-with");
  assert.match(repair.teaching, /pienu/);
  assert.equal(repair.kind, "gap");
  s = at("c2-request-fish");
  s = r.helpOpening(s, "reveal");
  s = answer(s, "žuvies");
  assert.equal(s.events.at(-1).independentRecall, false);
  s = at("c2-final-food");
  s = answer(s, "Norėčiau grybų sriubos.");
  assert.equal(s.run.threads.final.at(-1).text, "Prašom. Gero apetito!");
  s = at("c2-habits-writing");
  s = {
    ...s,
    run: {
      ...s.run,
      answer: "Man patinka arbata.",
      reviewing: true,
      checked: [0],
    },
  };
  s = JSON.parse(JSON.stringify(s));
  assert.equal(r.answerOpening(s), s);
  s = answer(s, s.run.answer, { checked: [0, 1, 2] });
  assert.equal(s.events.at(-1).answer, "Man patinka arbata.");
  const next = r.advanceOpening(s);
  assert.deepEqual(next.run.checked, []);
});

test("switching lessons preserves unfinished writing and does not invent completed prerequisites", () => {
  let s = at("c2-habits-writing");
  s.run.answer = "Geriu arbatą.";
  s.run.checked = [0];
  s.run.reviewing = true;
  s = r.startOpening(s, "c2-drinks");
  assert.equal(s.completed.length, 0);
  s = r.startOpening(JSON.parse(JSON.stringify(s)), "c2-food-reading");
  assert.equal(s.run.answer, "Geriu arbatą.");
  assert.deepEqual(s.run.checked, [0]);
  assert.equal(s.run.reviewing, true);
});

test("chapter practice shares grading and evidence without granting course completion", () => {
  let s = answer(at("c2-object-potatoes"), "bulvės");
  assert.equal(r.reviewQueue(s)[0].reviewNeed, "target");
  s = r.startReview(s);
  assert.equal(s.run.review, true);
  s = r.advanceOpening(s);
  s = answer(s, "bulves");
  s = r.advanceOpening(s);
  const attempt = s.events.findLast((e) => e.type === "answer");
  assert.equal(
    attempt.independentRecall,
    false,
    "visible correction is support",
  );
  assert.equal(
    s.run.done,
    true,
    "with one target, defer retrieval instead of looping a just-shown answer",
  );
  assert.deepEqual(s.completed, []);
  assert.equal(r.learningEvidence(s)[0].independentRun, 0);
  assert.equal(r.learningEvidence(s)[0].needsSupport, true);
  const later = Date.now() + 86400000;
  s = r.advanceOpening(r.startReview(s, later), later);
  assert.equal(s.run.queue[0].answerVisible, undefined);
  s = r.answerOpening({ ...s, run: { ...s.run, answer: "bulves" } }, later + 1);
  s = r.advanceOpening(s, later + 2);
  assert.equal(r.learningEvidence(s)[0].independentRun, 1);
  assert.equal(r.learningEvidence(s)[0].recallVisits, 1);
  const restored = r.startOpening(s, "c2-objects");
  assert.equal(restored.run.feedback.status, "incorrect");
  assert.equal(restored.run.answer, "bulvės");
  assert.equal(
    r.gradeOpening(step("c2-drinks-recall"), "kavą").status,
    "incorrect",
  );
});

test("conversation variants preserve the actual payment target in later practice", () => {
  for (const [variant, expected] of [
    [0, "Kortele."],
    [1, "Grynaisiais."],
  ]) {
    let s = r.advanceOpening(
      r.startOpening(r.freshOpening(), "c2-chapter-check", 1, variant),
    );
    s.run.index = s.run.queue.findIndex((q) => q.id.startsWith("c2-final-pay"));
    s = answer(s, expected);
    const row = r.learningEvidence(s)[0];
    assert.equal(row.lastProduction.answers[0], expected);
    assert.equal(r.reviewQueue(s)[0].answers[0], expected);
    assert.equal(row.independentRun, 1);
    const negative = s.run.queue.find((q) => q.id === "c2-final-negative");
    assert.equal(negative.reviewKey, "c2-object:form:arbatos");
  }
});

test("phrase spelling is shared by Course, saved queues and Practice without a meaning penalty", () => {
  for (const [text, canonical] of [
    ["juodos kavos prasom", "Juodos kavos, prašom."],
    ["prasom juodos kavos", "Prašom juodos kavos."],
    ["juodos kavos prasau", "Juodos kavos, prašau."],
    ["noreciau juodos kavos", "Norėčiau juodos kavos."],
  ]) {
    let s = answer(JSON.parse(JSON.stringify(at("c2-phrase-short"))), text);
    assert.equal(s.run.feedback.status, "spelling");
    assert.equal(s.run.feedback.detail, canonical);
    assert.equal(s.events.at(-1).correctness, true);
    assert.equal(s.events.at(-1).independentRecall, false);
    assert.equal(s.events.at(-1).spellingCorrect, false);
    assert.ok(!s.run.queue.some((q) => q.repair));
    let row = r.learningEvidence(s)[0];
    assert.equal(row.needsTarget, false);
    assert.equal(row.recentErrors, 0);
    assert.equal(row.needsSpelling, true);
    s = r.advanceOpening(r.startReview(s));
    s = answer(s, text);
    assert.equal(s.run.feedback.status, "spelling");
    s = r.advanceOpening(s);
    assert.equal(s.run.done, true, "defer the isolated spelling return");
    const later = Date.now() + 86400000;
    s = r.advanceOpening(r.startReview(s, later), later);
    s = r.answerOpening(
      { ...s, run: { ...s.run, answer: canonical } },
      later + 1,
    );
    row = r.learningEvidence(s)[0];
    assert.equal(row.needsSpelling, false);
    assert.equal(row.independentRun, 1);
    assert.equal(row.recallVisits, 1);
  }
  assert.equal(
    r.gradeOpening(
      { ...step("c2-phrase-short"), assessmentPolicy: { spelling: "strict" } },
      "juodos kavos prasom",
    ).status,
    "unassessed",
  );
});
