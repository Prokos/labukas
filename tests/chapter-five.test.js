import test from "node:test";
import assert from "node:assert/strict";
import { course as courseByNumber } from "./helpers.js";
import { normalizeAnswer as norm } from "../src/learning/answer-assessment.js";
import { createCourseRuntime } from "../src/learning/session.js";
const c = courseByNumber(5),
  r = createCourseRuntime(c);
const located = c.lessons.flatMap((l, index) =>
  l.steps.map((q) => ({ l, index, q })),
);
const task = (id) => located.find((x) => x.q.id === id)?.q;

test("chapter 5 prepares its ticket exchange, verb contrasts and intentional earlier-chapter return", () => {
  const known = new Set();
  for (const l of c.lessons) {
    for (const p of l.requires || []) assert.ok(known.has(p), `${l.id}: ${p}`);
    (l.provides || []).forEach((p) => known.add(p));
  }
  const pos = (id) => c.lessons.findIndex((l) => l.id === id);
  assert.ok(pos("a-c5-route-buy-ticket") <= 11);
  assert.ok(
    pos("a-c5-route-buy-ticket") < pos("a-c5-lex-arts-and-evenings-out-1"),
  );
  assert.ok(pos("a-c5-route-one-person-three-times") < pos("a-c5l3-1"));
  assert.deepEqual(
    c.lessons
      .find((l) => l.id === "a-c5-earlier")
      .steps.map((q) => q.answers[0]),
    ["Du", "kambarių", "galite"],
  );
  const pairs = (id) => task(`a-c5-route-${id}`).pairs.map(([lt]) => lt);
  assert.deepEqual(pairs("liking-ability-model"), [
    "Aš mėgstu plaukti.",
    "Aš moku plaukti.",
  ]);
  assert.ok(pairs("being-times-model").every((s) => s.endsWith("Kaune.")));
  assert.deepEqual(pairs("listen-genitive-model"), [
    "Aš klausau muzikos.",
    "Aš neklausau muzikos.",
  ]);
});

test("every reviewed chapter 5 conversation option is prepared and connected", () => {
  const taught = new Set();
  let count = 0;
  for (const l of c.lessons) {
    let previous;
    for (const q of l.steps) {
      if (q.kind === "model") q.pairs.forEach(([s]) => taught.add(norm(s)));
      if (q.kind === "chat-choice" && l.reviewStatus) {
        count++;
        for (const a of q.options)
          assert.ok(taught.has(norm(a)), `${q.id}: ${a}`);
        if (q.continuation) assert.equal(previous?.next, q.source);
        previous = q;
      }
    }
  }
  assert.equal(count, 4);
});

test("chapter 5 transfer is spaced, retains target identity and does not copy a model or another check", () => {
  const checks = located.filter(
    ({ q }) => q.changedContext && !q.plannedReturn,
  );
  assert.equal(checks.length, 25);
  const seen = new Set();
  for (const { q, index } of checks) {
    const original = located.find((x) => x.q.id === q.returnOf);
    assert.ok(original, q.id);
    assert.ok(index - original.index >= 3, q.id);
    assert.equal(q.reviewKey, original.q.reviewKey);
    const sentence = norm(q.source.replace("___", q.answers[0]));
    assert.ok(!seen.has(sentence), q.id);
    seen.add(sentence);
    const models = located
      .filter((x) => x.index <= index && x.q.kind === "model")
      .flatMap((x) => x.q.pairs);
    assert.ok(!models.some(([s]) => norm(s) === sentence), q.id);
    for (const wrong of q.wrong)
      assert.equal(
        r.gradeAnswer(q, wrong).status,
        "incorrect",
        `${q.id}: ${wrong}`,
      );
  }
});

test("chapter 5 new grammar prompts do not hide untaught words outside the tested gap", () => {
  const seen = new Set();
  for (let n = 1; n < 5; n++)
    for (const q of courseByNumber(n).lessons.flatMap((l) => l.steps))
      if (q.kind === "model")
        for (const [s] of q.pairs)
          norm(s)
            .split(" ")
            .forEach((w) => seen.add(w));
  for (const l of c.lessons)
    for (const q of l.steps) {
      if (q.kind === "model")
        for (const [s] of q.pairs)
          norm(s)
            .split(" ")
            .forEach((w) => seen.add(w));
      if (
        !(l.reviewStatus || q.changedContext) ||
        q.plannedReturn ||
        !["gap", "gap-type"].includes(q.kind)
      )
        continue;
      for (const w of norm(q.source)
        .split(" ")
        .filter((w) => w && !w.includes("_")))
        assert.ok(seen.has(w), `${q.id}: ${w}`);
    }
});

test("chapter 5 assessment preserves spelling while keeping real person and case distinctions", () => {
  for (const [id, answer] of [
    ["future-being-recall", "busiu"],
    ["liking-recall", "megstu"],
    ["read-i-recall", "skaiciau"],
    ["female-friends-recall", "draugemis"],
  ]) {
    const q = task(`a-c5-route-${id}`);
    assert.equal(r.gradeAnswer(q, answer).status, "spelling", id);
  }
  for (const id of [
    "patinka-noun-recall",
    "megstu-noun-recall",
    "negative-music-recall",
    "being-you-recall",
    "female-companion-recall",
  ]) {
    const q = task(`a-c5-route-${id}`);
    for (const a of q.wrong)
      assert.equal(r.gradeAnswer(q, a).status, "incorrect", `${id}: ${a}`);
  }
});

test("chapter 5 source-function claims name real models and distinguish supported applications", async () => {
  const chapterFiveOutcomes = c.objectives;
  for (const o of chapterFiveOutcomes) {
    assert.ok(o.goal && o.pages);
    for (const id of o.models)
      assert.equal(task(id)?.kind, "model", `${o.key}: ${id}`);
    for (const id of o.checks || []) {
      const q = task(id);
      assert.ok(q?.changedContext && !q.plannedReturn, `${o.key}: ${id}`);
      assert.equal(q.kind, "gap-type");
    }
    for (const id of o.applications || [])
      assert.ok(task(id), `${o.key}: ${id}`);
    if (!o.checks?.length) assert.ok(o.limit, `${o.key}: evidence limit`);
  }
});
