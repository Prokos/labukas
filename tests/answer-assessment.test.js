import test from "node:test";
import assert from "node:assert/strict";
import { assessAnswer } from "../src/learning/answer-assessment.js";

test("shared assessment distinguishes typography, spelling, wrong forms and unknown wording", () => {
  const thanks = {
    answers: ["Ačiū!", "Dėkui!"],
    spelling: "diacritics",
    incorrectAnswers: ["Labas!"],
  };
  for (const a of ["Ačiū", " AČIŪ! ", "Ac\u030ciu\u0304", "De\u0307kui."])
    assert.equal(assessAnswer(a, thanks).outcome, "correct", a);
  for (const a of ["Aciu", "Ačiu", "Aciū", "ačiu!"])
    assert.deepEqual(assessAnswer(a, thanks), {
      version: 3,
      outcome: "spelling",
      reason: "diacritics",
      matchedAnswer: "Ačiū!",
      wordingCorrect: true,
      spellingCorrect: false,
    });
  assert.equal(assessAnswer("Dekui", thanks).matchedAnswer, "Dėkui!");
  assert.equal(assessAnswer("Labas", thanks).outcome, "incorrect");
  assert.equal(assessAnswer("Something else", thanks).outcome, "unassessed");
  assert.equal(assessAnswer("", thanks).outcome, "unassessed");
  assert.equal(
    assessAnswer("esi", { answers: ["esu"], unknown: "incorrect" }).outcome,
    "incorrect",
  );
});

test("diacritic spelling is shared by whole phrases and protects canonical forms", () => {
  const policy = {
    answers: ["Juodos kavos, prašom.", "Prašau juodos kavos."],
    spelling: "diacritics",
    knownForms: new Set(["kava", "bulvės"]),
    unknown: "incorrect",
    partialIsIncorrect: true,
  };
  for (const [answer, canonical] of [
    ["juodos kavos prasom", "Juodos kavos, prašom."],
    ["Prasau juodos kavos!", "Prašau juodos kavos."],
  ]) {
    const result = assessAnswer(answer, policy);
    assert.equal(result.outcome, "spelling");
    assert.equal(result.wordingCorrect, true);
    assert.equal(result.spellingCorrect, false);
    assert.equal(result.matchedAnswer, canonical);
  }
  for (const answer of [
    "juoda kava prasom",
    "juodos kavos pras",
    "juodos kavos prasomm",
  ])
    assert.equal(assessAnswer(answer, policy).outcome, "incorrect", answer);
  assert.equal(
    assessAnswer("kava prasom", { ...policy, answers: ["Kavą, prašom."] })
      .outcome,
    "incorrect",
  );
  assert.equal(
    assessAnswer("bulvės prasom", { ...policy, answers: ["Bulves, prašom."] })
      .outcome,
    "incorrect",
  );
  assert.equal(
    assessAnswer("juodos kavos prasom", {
      ...policy,
      incorrectAnswers: ["juodos kavos prasom"],
    }).reason,
    "known-wrong",
  );
  assert.equal(
    assessAnswer("juodos kavos prasom", { ...policy, spelling: "strict" })
      .outcome,
    "incorrect",
  );
});

test("a full diacritic-only mismatch is never diagnosed as an incomplete answer", () => {
  const policy = {
    answers: ["Juodos kavos, prašom.", "Juodos kavos, prašom, ir arbatos."],
    partialIsIncorrect: true,
  };
  assert.equal(
    assessAnswer("juodos kavos prasom", policy).reason,
    "unrecognized",
  );
  assert.equal(assessAnswer("juodos kavos pras", policy).reason, "incomplete");
});

test("diacritic-only tolerance is opt-in and does not infer arbitrary typos", () => {
  assert.equal(
    assessAnswer("Aciu", { answers: ["Ačiū!"], unknown: "incorrect" }).outcome,
    "incorrect",
  );
  // Even a diacritic-only contrast is a real error when the task tests that form.
  assert.equal(
    assessAnswer("kasa", {
      answers: ["kasą"],
      incorrectAnswers: ["kasa"],
      spelling: "diacritics",
    }).outcome,
    "incorrect",
  );
  assert.equal(
    assessAnswer("Aču", { answers: ["Ačiū"], spelling: "diacritics" }).outcome,
    "unassessed",
  );
  assert.equal(
    assessAnswer("Pras", {
      answers: ["Prašom"],
      spelling: "diacritics",
      partialIsIncorrect: true,
    }).reason,
    "incomplete",
  );
});

test("new vocabulary inherits spelling support without a word allowlist", () => {
  for (const [entered, expected] of [
    ["sumustinio su suriu", "sumuštinio su sūriu"],
    ["noreciau zalios arbatos", "norėčiau žalios arbatos"],
    ["siandien salta", "šiandien šalta"],
    ["susitinkame sestadieni", "susitinkame šeštadienį"],
  ]) {
    const result = assessAnswer(entered, {
      answers: [expected],
      spelling: "diacritics",
    });
    assert.equal(result.outcome, "spelling", entered);
    assert.equal(result.matchedAnswer, expected);
  }
});

test("canonical form collisions stay errors inside phrases", () => {
  const knownForms = new Set(["jūs", "jus", "sūnus", "sūnūs", "kava", "kavą"]);
  for (const [entered, expected] of [
    ["kviečiu jūs", "kviečiu jus"],
    ["mano sūnus", "mano sūnūs"],
    ["geriu kava", "geriu kavą"],
  ]) {
    assert.equal(
      assessAnswer(entered, {
        answers: [expected],
        spelling: "diacritics",
        knownForms,
      }).reason,
      "known-form",
    );
  }
  assert.equal(
    assessAnswer("Jūs", {
      answers: ["jus", "jūs"],
      spelling: "diacritics",
      knownForms,
    }).outcome,
    "correct",
  );
});

test("vocabulary typos protect real words, endings, short words and distant guesses", () => {
  const grade = (answer, expected, known = []) =>
    assessAnswer(answer, {
      answers: [expected],
      spelling: "diacritics",
      vocabularyTypos: true,
      knownForms: new Set(known),
      unknown: "incorrect",
    });
  for (const [answer, expected] of [
    ["salatos", "salotos"],
    ["autobuas", "autobusas"],
    ["banndelė", "bandelė"],
    ["autobusas", "autobusas"],
    ["vynouge", "vynuogė"],
    ["ryzai", "ryžiai"],
  ]) {
    assert.equal(
      grade(answer, expected).outcome,
      answer === expected ? "correct" : "spelling",
      answer,
    );
  }
  for (const [answer, expected] of [
    ["salata", "salotos"],
    ["salotų", "salotos"],
    ["sltos", "salotos"],
    ["bananai", "vynuogė"],
    ["kasa", "kava"],
    ["pinigus", "pinigai"],
    ["slyvos", "slyva"],
  ])
    assert.equal(grade(answer, expected).outcome, "incorrect", answer);
  assert.equal(grade("darbas", "daržas", ["darbas"]).outcome, "incorrect");
  assert.equal(grade("darzas", "darbas", ["daržas"]).outcome, "incorrect");
  assert.equal(
    assessAnswer("salatos", {
      answers: ["salotos"],
      spelling: "diacritics",
      vocabularyTypos: true,
      incorrectAnswers: ["salatos"],
    }).reason,
    "known-wrong",
  );
  assert.equal(
    assessAnswer("salatos", { answers: ["salotos"], spelling: "diacritics" })
      .outcome,
    "unassessed",
    "open phrases/form tasks do not opt in",
  );
});
