import { createCourseRuntime } from "../src/learning/session.js";
import test from "node:test";
import assert from "node:assert/strict";
import {
  chapterTwoCourse as course,
  chapterTwoRuntime as r,
} from "./helpers.js";
import {
  hintForStep,
  repairStep,
  supportChoices,
  limitChoices,
} from "../src/learning/support.js";
const all = course.lessons.flatMap((l) => l.steps);
const word = (lt) =>
  all.find(
    (q) =>
      q.kind === "type" && q.target === `c2-word:${lt}` && !q.plannedReturn,
  );
const at = (q, now = 1000) => {
  const lesson = course.lessons.find((l) => l.steps.some((s) => s.id === q.id));
  const s = r.startLesson(r.createState(), lesson.id, now, 0);
  return {
    ...s,
    run: {
      ...s.run,
      intro: false,
      index: s.run.queue.findIndex((s) => s.id === q.id),
    },
  };
};
const submit = (s, answer, now) =>
  r.submitAnswer({ ...s, run: { ...s.run, answer } }, now);
const event = (q, at, extra = {}) => ({
  id: `test-${q.id}-${at}`,
  type: "answer",
  step: q.id,
  target: q.target,
  reviewKey: q.reviewKey,
  at,
  run: "earlier",
  answer: q.answers[0],
  outcome: "correct",
  correctness: true,
  independentRecall: true,
  requestedHelp: [],
  responseMode: q.kind,
  ...extra,
});

test("closed vocabulary rejects wrong words while diacritic spelling remains a separate outcome", () => {
  const q = word("salotos");
  for (const answer of ["pomidoras", "slto"])
    assert.equal(r.gradeAnswer(q, answer).status, "incorrect", answer);
  assert.equal(r.gradeAnswer(q, "SALOTOS!").status, "correct");
  assert.equal(r.gradeAnswer(word("ryžiai"), "ryziai").status, "spelling");
  assert.equal(r.gradeAnswer(word("ryžiai"), "ryzai").status, "spelling");
  assert.equal(r.gradeAnswer(word("vyšnia"), "vysnia").status, "spelling");
});

test("first repair has real bounded choices; second failure gets a supported reconstruction", () => {
  const q = word("vynuogė");
  let s = submit(at(q), "a wildly wrong sentence", 1100);
  assert.equal(s.run.feedback.status, "incorrect");
  assert.equal(s.run.feedback.detail, "You’ll get another try with support.");
  const first = s.run.queue.find((q) => q.repairStage === 1);
  assert.ok(first);
  assert.equal(first.kind, "choice");
  assert.equal(first.teaching, undefined);
  assert.ok(first.options.length >= 2 && first.options.length <= 4);
  assert.ok(first.options.every((a) => q.words.includes(a)));
  assert.ok(!first.options.includes("a wildly wrong sentence"));
  s = {
    ...s,
    run: {
      ...s.run,
      index: s.run.queue.indexOf(first),
      feedback: null,
      help: [],
    },
  };
  s = submit(
    s,
    first.options.find((a) => !first.answers.includes(a)),
    1200,
  );
  const second = s.run.queue.find((q) => q.repairStage === 2);
  assert.equal(second.kind, "type");
  assert.equal(second.teaching, "vynuogė");
  assert.equal(second.answerVisible, true);
  s = {
    ...s,
    run: {
      ...s.run,
      index: s.run.queue.indexOf(second),
      feedback: null,
      help: [],
    },
  };
  s = submit(s, "vynuogė", 1300);
  assert.equal(s.events.at(-1).independentRecall, false);
  assert.equal(
    r.learningEvidence(s, 1400).find((row) => row.target === q.target)
      .needsTarget,
    true,
  );
  const restored = JSON.parse(JSON.stringify(s));
  assert.equal(JSON.stringify(restored.run.queue), JSON.stringify(s.run.queue));
});

test("sentence repair keeps sentence construction instead of contrasting a word with a full answer", () => {
  const q = all.find((q) => q.id === "c2-plural-apply");
  const repair = repairStep(q);
  assert.equal(repair.kind, "bank");
  assert.equal(repair.options, undefined);
  assert.equal(repair.teaching, undefined);
  assert.deepEqual(repair.words, q.words);
});

test("matching mistakes do not reveal the pair and remain an unresolved word need", () => {
  const q = all.find(
    (q) => q.kind === "match" && q.pairs.some(([lt]) => lt === "vynuogė"),
  );
  let s = at(q);
  const left = q.pairs.findIndex(([lt]) => lt === "vynuogė");
  s = r.selectPair(s, "left", left, 1100);
  s = r.selectPair(s, "right", (left + 1) % q.pairs.length, 1101);
  assert.equal(s.run.pairError, "Those don’t match. Try another pair.");
  assert.ok(!s.run.pairError.includes("grape"));
  assert.equal(
    r.learningEvidence(s, 1200).find((row) => row.target === "c2-word:vynuogė")
      .needsTarget,
    true,
  );
  s = r.selectPair(s, "right", left, 1201);
  s = r.selectPair(s, "left", left, 1202);
  const row = r
    .learningEvidence(s, 1300)
    .find((row) => row.target === "c2-word:vynuogė");
  assert.equal(row.needsTarget, true);
  assert.equal(row.independentRun, 0);
});

test("weak fruit outranks known coffee; incidental exposure does not reset prior recall", () => {
  const coffee = word("kava"),
    fruits = ["vynuogė", "slyva", "vyšnia"].map(word),
    now = 10000;
  const events = [
    event(coffee, 1000),
    event(coffee, 2000, { answerPrimed: true, independentRecall: false }),
    ...fruits.map((q, i) =>
      event(q, 3000 + i, {
        outcome: "incorrect",
        correctness: false,
        answer: "wrong",
        independentRecall: false,
      }),
    ),
  ];
  const s = { ...r.createState(), events };
  const rows = r.learningEvidence(s, now);
  const c = rows.find((row) => row.target === coffee.target);
  assert.equal(c.independentRun, 1);
  assert.equal(c.needsSupport, false);
  assert.deepEqual(
    r.reviewQueue(s, now).map((q) => q.target),
    fruits.map((q) => q.target),
  );
  const review = r.startReview(s, now);
  assert.ok(review.run.queue.every((q) => !q.teaching && !q.answerVisible));
  assert.ok(review.run.queue.every((q) => q.target !== "c2-word:kava"));
});

test("historical unassessed vocabulary returns for verification without rewriting old events", () => {
  const q = word("slyva");
  const old = event(q, 1000, {
    outcome: "unassessed",
    correctness: null,
    independentRecall: false,
    answer: "sleiva",
  });
  const s = { ...r.createState(), events: [old] };
  const original = structuredClone(s.events);
  assert.equal(r.reviewQueue(s, 2000)[0].reviewNeed, "verification");
  assert.equal(
    r.learningEvidence(s, 2000)[0].needsTarget,
    false,
    "not retroactively marked wrong",
  );
  assert.deepEqual(s.events, original);
});

test("unresolved words return during the next course lesson with identities and saved order preserved", () => {
  const fruit = ["vynuogė", "slyva", "vyšnia"].map(word);
  const events = fruit.map((q, i) =>
    event(q, 1000 + i, {
      outcome: "incorrect",
      correctness: false,
      independentRecall: false,
      answer: "wrong",
    }),
  );
  let s = r.startLesson({ ...r.createState(), events }, "c2-describe", 2000, 0);
  const returns = s.run.queue.filter((q) => q.adaptiveReturn);
  assert.equal(returns.length, 2);
  returns.forEach((q) => {
    assert.ok(
      fruit.some((w) => w.target === q.target && w.reviewKey === q.reviewKey),
    );
    assert.ok(!q.repair && !q.teaching && !q.answerVisible);
  });
  const firstIndex = s.run.queue.indexOf(returns[0]);
  assert.ok(
    s.run.queue.slice(0, firstIndex).filter((q) => q.kind !== "model").length >=
      2,
  );
  const saved = JSON.parse(JSON.stringify(s.run.queue));
  s = r.startLesson(JSON.parse(JSON.stringify(s)), "c2-describe", 3000, 1);
  assert.deepEqual(s.run.queue, saved);
});

test("choice limits retain the answer and hints offer a cue rather than a recall instruction", () => {
  const q = word("vynuogė");
  assert.equal(hintForStep(q), "Starts with “v”.");
  const choices = supportChoices(q);
  assert.ok(choices.length <= 4);
  assert.ok(choices.includes("vynuogė"));
  const limited = limitChoices(["a", "b", "c", "d", "e", "f"], ["f"]);
  assert.equal(limited.length, 4);
  assert.ok(limited.includes("f"));
  const gap = all.find((q) => q.id === "c2-with-milk");
  assert.equal(
    hintForStep(gap),
    "Su (with) takes instrumental; be (without) takes genitive.",
  );
  assert.ok(!hintForStep(gap).includes("pienu"));
});

test("Practice graduates support, then requires separated unaided retrieval without familiar filler", () => {
  const fruits = ["vynuogė", "slyva", "vyšnia"].map(word);
  let s = r.startReview(
    {
      ...r.createState(),
      events: fruits.map((q, i) =>
        event(q, 1000 + i, {
          correctness: false,
          outcome: "incorrect",
          independentRecall: false,
          answer: "wrong",
        }),
      ),
    },
    2000,
  );
  s = r.advance(s, 2001);
  const attempts = [];
  for (let i = 0; i < 36 && !s.run.done; i++) {
    const q = s.run.queue[s.run.index];
    const prior = attempts.filter((a) => a.target === q.target);
    assert.notEqual(q.target, "c2-word:kava");
    if (prior.length === 1) {
      assert.equal(q.repairStage, 1);
      assert.ok(q.options.length <= 4);
      assert.ok(!q.teaching && !q.answerVisible);
    }
    if (prior.length === 2) {
      assert.equal(q.repairStage, 2);
      assert.equal(q.teaching, q.answers[0]);
    }
    if (prior.length >= 3) {
      assert.ok(!q.repair && !q.teaching && !q.answerVisible);
      assert.ok(i - attempts.findLastIndex((a) => a.target === q.target) >= 3);
    }
    s = submit(
      s,
      prior.length < 2
        ? q.options?.find((a) => !q.answers.includes(a)) || "wrong"
        : q.answers[0],
      3000 + i,
    );
    const e = s.events.at(-1);
    if (prior.length === 2) assert.equal(e.independentRecall, false);
    if (prior.length >= 3) assert.equal(e.independentRecall, true);
    attempts.push(e);
    s = r.advance(JSON.parse(JSON.stringify(s)), 3000 + i);
  }
  assert.equal(s.run.done, true);
  assert.ok(attempts.length <= 35);
  assert.equal(r.reviewQueue(s, 4000).length, 0);
  for (const q of fruits) {
    const row = r
      .learningEvidence(s, 4000)
      .find((row) => row.target === q.target);
    assert.equal(row.needsTarget, false);
    assert.equal(row.independentRun, 2);
    assert.equal(
      row.recallVisits,
      1,
      "one session never proves later retention",
    );
  }
});

test("a lone weak word stops after supported reconstruction and stays due", () => {
  const q = word("slyva");
  let s = r.startReview(
    {
      ...r.createState(),
      events: [
        event(q, 1000, {
          correctness: false,
          outcome: "incorrect",
          independentRecall: false,
        }),
      ],
    },
    2000,
  );
  s = r.advance(s, 2001);
  for (let i = 0; i < 3; i++) {
    const step = s.run.queue[s.run.index];
    s = submit(s, i < 2 ? "wrong" : step.answers[0], 3000 + i);
    s = r.advance(s, 3000 + i);
  }
  assert.equal(s.run.done, true);
  assert.equal(r.learningEvidence(s, 4000)[0].needsTarget, true);
  assert.equal(r.reviewQueue(s, 4000)[0].showSupport, false);
});

test("a repair cap never suppresses the only available correction", () => {
  const q = word("vyšnia");
  let s = at(q);
  s.run.repairTargets = ["a", "b", "c"];
  s = submit(s, "wrong", 1200);
  assert.equal(s.run.feedback.detail, q.correction);
  assert.equal(
    s.run.queue.some((q) => q.repair),
    false,
  );
});

test("construction-only difficulty recovers without inventing typed mastery or looping forever", () => {
  const q = {
    id: "construction",
    target: "construction",
    kind: "bank",
    ability: "construction",
    source: "She likes rice.",
    answers: ["Jai patinka ryžiai"],
    words: ["Jai", "patinka", "ryžiai"],
    correction: "Jai patinka ryžiai",
  };
  const runtime = createCourseRuntime({
    lessons: [{ id: "lesson", steps: [q] }],
    version: 1,
  });
  const wrong = event(q, 1000, {
    correctness: false,
    outcome: "incorrect",
    independentRecall: false,
  });
  const success = (at) => event(q, at, { independentRecall: false });
  const state = {
    ...runtime.createState(),
    events: [wrong, success(2000), success(3000)],
  };
  const row = runtime.learningEvidence(state, 4000)[0];
  assert.equal(row.needsTarget, false);
  assert.equal(row.independentRun, 0);
  assert.equal(row.recallVisits, 0);
  assert.equal(row.label, "Recognizing");
  assert.equal(runtime.reviewQueue(state, 4000).length, 0);
  assert.equal(runtime.reviewQueue(state, 86404000).length, 1);
});

test("saved content refresh fixes upcoming questions without touching an engaged answer or old events", () => {
  const q = word("slyva");
  let s = at(q);
  s.run.answer = "sly";
  s.events = [event(q, 1000)];
  const oldReturn = {
    ...q,
    id: "return-in-old-lesson",
    returnOf: q.id,
    adaptiveReturn: true,
    source: "bad old prompt",
    hint: "Recall the previous example",
    options: undefined,
  };
  const oldRepair = {
    ...q,
    id: `${q.id}-repair`,
    repair: true,
    kind: "choice",
    teaching: q.answers[0],
    options: [q.answers[0], "garbage"],
  };
  s.run.queue.push(oldReturn, oldRepair);
  const original = JSON.parse(JSON.stringify(s));
  const refreshed = r.refreshPendingContent(original);
  assert.deepEqual(refreshed.events, original.events);
  assert.deepEqual(
    refreshed.run.queue[refreshed.run.index],
    original.run.queue[original.run.index],
  );
  assert.equal(refreshed.run.answer, "sly");
  assert.deepEqual(
    refreshed.run.queue.map((q) => q.id),
    original.run.queue.map((q) => q.id),
  );
  assert.equal(refreshed.run.queue.at(-2).source, q.source);
  assert.equal(refreshed.run.queue.at(-1).repairStage, 1);
  assert.equal(refreshed.run.queue.at(-1).teaching, undefined);
  assert.ok(!refreshed.run.queue.at(-1).options.includes("garbage"));
  const again = r.refreshPendingContent(refreshed);
  assert.deepEqual(again, refreshed, "refresh is idempotent");
});

test("saved context returns retain their context and original response mode", () => {
  const q = all.find((q) => q.plannedReturn && q.kind === "gap-type");
  assert.ok(q);
  const state = at(q);
  const refreshed = r.refreshPendingContent(state);
  const next = refreshed.run.queue[refreshed.run.index];
  assert.equal(next.kind, "gap-type");
  assert.equal(next.source, q.source);
});

test("viewing choices then switching to Practice cannot turn their answer into unaided recall", () => {
  const q = word("slyva");
  const choice = {
    ...q,
    id: "viewed-options",
    kind: "choice",
    options: ["slyva", "vyšnia"],
  };
  const runtime = createCourseRuntime({
    lessons: [{ id: "lesson", steps: [choice, q] }],
    version: 1,
  });
  let state = {
    ...runtime.createState(),
    events: [
      event(q, 1000, {
        correctness: false,
        outcome: "incorrect",
        independentRecall: false,
      }),
    ],
  };
  state = runtime.advance(runtime.startLesson(state, "lesson", 2000), 2001);
  state = runtime.advance(runtime.startReview(state, 2002), 2003);
  state = runtime.submitAnswer(
    { ...state, run: { ...state.run, answer: "slyva" } },
    2004,
  );
  assert.equal(state.events.at(-1).answerPrimed, true);
  assert.equal(state.events.at(-1).independentRecall, false);
});

test("phrase replies can author support alternatives without repurposing sentence tiles", () => {
  const step = {
    id: "reply",
    target: "reply",
    kind: "type",
    ability: "reply-recall",
    source: "Thank you",
    answers: ["Prašom", "Nėra už ką"],
    supportOptions: ["Prašom", "Labas", "Iki"],
    words: ["Prašom"],
  };
  const repair = repairStep(step);
  assert.equal(repair.kind, "choice");
  assert.deepEqual(
    new Set(repair.options),
    new Set(["Prašom", "Labas", "Iki"]),
  );
  assert.equal(repair.teaching, undefined);
});

test("a minor vocabulary typo leaves spelling unresolved without meaning repair or inferred recall", () => {
  const q = word("salotos");
  const state = submit(at(q), "salatos", 1100);
  assert.equal(state.run.feedback.status, "spelling");
  assert.equal(state.events.at(-1).assessment.reason, "vocabulary-typo");
  assert.equal(state.events.at(-1).independentRecall, false);
  assert.equal(state.events.at(-1).independentWordRecall, false);
  assert.equal(
    state.run.queue.some((q) => q.repair),
    false,
  );
  assert.equal(r.reviewQueue(state, 1200)[0].reviewNeed, "spelling");
  assert.equal(r.learningEvidence(state, 1200)[0].needsTarget, false);
});

test("opening Help without an available cue does not manufacture assistance evidence", () => {
  const q = {
    id: "phrase",
    target: "phrase",
    kind: "type",
    ability: "phrase-recall",
    source: "My name is Mantas.",
    answers: ["Mano vardas Mantas."],
  };
  const runtime = createCourseRuntime({
    lessons: [{ id: "lesson", steps: [q] }],
    version: 1,
  });
  let s = runtime.advance(
    runtime.startLesson(runtime.createState(), "lesson", 1000),
    1001,
  );
  s = runtime.requestHelp(s, "hint", 1002);
  assert.equal(s.run.helpOpen, true);
  assert.deepEqual(s.run.help, []);
  s = runtime.submitAnswer(
    { ...s, run: { ...s.run, answer: q.answers[0] } },
    1003,
  );
  assert.equal(s.events.at(-1).independentRecall, true);
  assert.deepEqual(s.events.at(-1).requestedHelp, []);
});
