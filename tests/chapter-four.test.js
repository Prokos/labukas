import test from "node:test";
import assert from "node:assert/strict";
import { authoredChapter } from "../src/remaining-curriculum.js";
import { normalizeAnswer as norm } from "../src/answer-assessment.js";
import { createCourseRuntime } from "../src/authored-course.js";
const course = authoredChapter(4);
const located = course.lessons.flatMap((lesson, index) =>
  lesson.steps.map((q) => ({ q, lesson, index })),
);
const task = (id) => located.find((x) => x.q.id === id)?.q;
const r = createCourseRuntime(course);

test("chapter 4 prepares its functional route and preserves a purposeful earlier-chapter bridge", () => {
  const known = new Set();
  for (const l of course.lessons) {
    for (const required of l.requires || [])
      assert.ok(known.has(required), `${l.id}: ${required}`);
    (l.provides || []).forEach((k) => known.add(k));
  }
  const index = (id) => course.lessons.findIndex((l) => l.id === id);
  assert.ok(
    index("a-c4-route-rental") < index("a-c4-lex-rooms-and-buildings-1"),
  );
  assert.ok(index("a-c4-route-rental") <= 11);
  assert.ok(
    index("a-c4-route-ten-and-how-many") < index("a-c4-count-gender-use"),
  );
  const bridge = course.lessons.find((l) => l.id === "a-c4-earlier");
  assert.deepEqual(
    bridge.steps.map((q) => q.answers[0]),
    ["banko", "penktadienį", "Antrą"],
  );
  assert.ok(
    bridge.steps.every(
      (q) => q.fromChapter === 3 && q.target.startsWith("c3-"),
    ),
  );
});

test("chapter 4 grammar contrasts keep the meaning or surrounding frame stable", () => {
  const pairs = (id) => task(`a-c4-route-${id}`).pairs.map(([lt]) => lt);
  assert.deepEqual(pairs("table-presence-model"), [
    "Yra stalas.",
    "Nėra stalo.",
  ]);
  assert.deepEqual(pairs("permission-request-model").slice(0, 2), [
    "Ar galiu atidaryti langą?",
    "Ar galite atidaryti langą?",
  ]);
  assert.deepEqual(pairs("big-model"), ["Didelis butas.", "Didelė virtuvė."]);
  assert.deepEqual(pairs("want-must-model"), [
    "Noriu tvarkyti kambarį.",
    "Turiu tvarkyti kambarį.",
  ]);
  assert.deepEqual(pairs("cosy-adjective-model"), [
    "Jaukus butas.",
    "Jauki virtuvė.",
  ]);
});

test("every reviewed conversation option is prepared and connected turns follow the actual reply", () => {
  const taught = new Set();
  let turns = 0;
  for (const l of course.lessons) {
    let previous;
    for (const q of l.steps) {
      if (q.kind === "model") q.pairs.forEach(([lt]) => taught.add(norm(lt)));
      if (q.kind !== "chat-choice" || !l.reviewStatus) continue;
      turns++;
      for (const answer of q.options)
        assert.ok(taught.has(norm(answer)), `${q.id}: ${answer}`);
      if (q.continuation) assert.equal(previous?.next, q.source, q.id);
      previous = q;
    }
  }
  assert.equal(turns, 8);
});

test("reserved chapter 4 combinations use earlier target identities after spacing, without repeated model sentences", () => {
  const checks = located.filter(
    ({ q }) =>
      q.changedContext && !q.plannedReturn && !q.id.startsWith("a-c4-mixed"),
  );
  assert.equal(checks.length, 27);
  for (const { q, index } of checks) {
    const original = located.find((x) => x.q.id === q.returnOf);
    assert.ok(original, q.id);
    assert.ok(index - original.index >= 3, `${q.id}: spacing`);
    assert.equal(q.target, original.q.target);
    assert.equal(q.reviewKey, original.q.reviewKey);
    const sentence = norm(q.source.replace("___", q.answers[0]));
    const prior = located
      .filter((x) => x.index <= index && x.q.kind === "model")
      .flatMap((x) => x.q.pairs);
    assert.ok(
      !prior.some(([lt]) => norm(lt) === sentence),
      `${q.id}: already modelled`,
    );
    for (const wrong of q.wrong)
      assert.equal(
        r.gradeOpening(q, wrong).status,
        "incorrect",
        `${q.id}: ${wrong}`,
      );
  }
});

test("chapter 4 spelling slips preserve words while wrong case, number and person forms remain errors", () => {
  for (const [id, misspelled] of [
    ["mirror-recall", "veidrodzio"],
    ["need-towel-recall", "ranksluoscio"],
    ["ten-chairs-recall", "kedziu"],
    ["trees-two-recall", "medziai"],
    ["big-kitchen-recall", "Didele"],
  ]) {
    const q = task(`a-c4-route-${id}`);
    assert.equal(r.gradeOpening(q, misspelled).status, "spelling", id);
    for (const wrong of q.wrong)
      assert.equal(
        r.gradeOpening(q, wrong).status,
        "incorrect",
        `${id}: ${wrong}`,
      );
  }
  for (const id of [
    "permission-recall",
    "request-recall",
    "room-number-recall",
    "floor-question-recall",
  ]) {
    const q = task(`a-c4-route-${id}`);
    for (const a of q.answers)
      assert.equal(r.gradeOpening(q, a).status, "correct", id);
    for (const a of q.wrong)
      assert.equal(r.gradeOpening(q, a).status, "incorrect", id);
  }
});

test("retired chapter 4 work remains resumable without completing new teaching", () => {
  const id = "a-c4l1-1";
  assert.ok(course.retiredLessons.some((l) => l.id === id));
  assert.ok(!course.lessons.some((l) => l.id === id));
  let state = r.startOpening(r.freshOpening(), id, 1);
  state.run.answer = "kambarys";
  state.run.help = ["reference"];
  const old = structuredClone(state.run);
  state = r.startOpening(state, "a-c4-route-home-location", 2);
  assert.deepEqual(state.suspended[id], old);
  state = r.startOpening(JSON.parse(JSON.stringify(state)), id, 3);
  assert.equal(state.run.answer, "kambarys");
  assert.deepEqual(state.run.help, ["reference"]);
  assert.deepEqual(state.completed, []);
});

test("adverts require combining information and visible text never grants productive recall", () => {
  for (const id of ["compare-flats-rooms", "compare-flats-floor"]) {
    const q = task(`a-c4-route-${id}`);
    assert.equal(q.kind, "reading");
    assert.equal(q.answerVisible, true);
    let s = r.advanceOpening(
      r.startOpening(r.freshOpening(), "a-c4-route-compare-flats", 1),
      2,
    );
    s.run.queue = [q];
    s.run.index = 0;
    s.run.answer = q.answers[0];
    s = r.answerOpening(s, 3);
    assert.equal(s.run.feedback.status, "correct");
    const event = s.events.at(-1);
    assert.equal(event.independentRecall, false);
  }
});

test("chapter 4 source-function claims point to actual teaching and label supported evidence", async () => {
  const { chapterFourOutcomes } =
    await import("../src/chapter-four-outcomes.js");
  const sentences = new Set();
  for (const { q } of located.filter(
    ({ q }) => q.changedContext && !q.plannedReturn,
  )) {
    const sentence = norm(q.source.replace("___", q.answers[0]));
    assert.ok(!sentences.has(sentence), `duplicate new-context check: ${q.id}`);
    sentences.add(sentence);
  }
  for (const o of chapterFourOutcomes) {
    assert.ok(o.pages && o.goal);
    for (const id of o.models)
      assert.equal(task(`a-c4-route-${id}`)?.kind, "model", `${o.key}: ${id}`);
    for (const id of o.checks || []) {
      const q = task(id);
      assert.ok(q?.changedContext && !q.plannedReturn, `${o.key}: ${id}`);
      assert.equal(q.kind, "gap-type");
    }
    for (const id of o.applications || [])
      assert.ok(task(id), `${o.key}: ${id}`);
    if (!o.checks?.length)
      assert.ok(o.limit, `${o.key}: describe the evidence limit`);
  }
});
