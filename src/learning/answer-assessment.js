// Orthography and linguistic contrasts are separate inputs. A spelling match
// cannot override a known competing form, even inside a complete sentence.
export const ASSESSMENT_VERSION = 3;
export const normalizeAnswer = (value) =>
  String(value)
    .normalize("NFC")
    .toLocaleLowerCase("lt")
    .replace(/[.,!?;:“”"'‘’]/g, "")
    .replace(/\s+/g, " ")
    .trim();
export const withoutDiacritics = (value) =>
  normalizeAnswer(value).normalize("NFD").replace(/\p{M}/gu, "");

// A conservative vocabulary-only typo, not a general linguistic distance.
// Protect short words, the first letter and the final two letters; those often
// carry word identity or grammatical contrasts. Accept at most one internal
// insertion/deletion/substitution or adjacent transposition.
function internalTypo(entered, expected) {
  if (
    !/^[a-z]+$/.test(entered) ||
    !/^[a-z]+$/.test(expected) ||
    expected.length < 5 ||
    entered[0] !== expected[0] ||
    entered.slice(-2) !== expected.slice(-2) ||
    Math.abs(entered.length - expected.length) > 1
  )
    return false;
  let i = 0;
  while (
    entered[i] === expected[i] &&
    i < Math.min(entered.length, expected.length)
  )
    i++;
  if (entered.length === expected.length) {
    if (entered.slice(i + 1) === expected.slice(i + 1)) return true;
    return (
      entered[i] === expected[i + 1] &&
      entered[i + 1] === expected[i] &&
      entered.slice(i + 2) === expected.slice(i + 2)
    );
  }
  return entered.length > expected.length
    ? entered.slice(i + 1) === expected.slice(i)
    : entered.slice(i) === expected.slice(i + 1);
}

export function assessAnswer(
  answer,
  {
    answers,
    incorrectAnswers = [],
    spelling = "strict",
    knownForms = new Set(),
    vocabularyTypos = false,
    unknown = "unassessed",
    partialIsIncorrect = false,
  },
) {
  const value = normalizeAnswer(answer);
  const result = (outcome, reason, matchedAnswer = null) => ({
    version: ASSESSMENT_VERSION,
    outcome,
    reason,
    matchedAnswer,
    wordingCorrect:
      outcome === "unassessed"
        ? null
        : ["correct", "spelling"].includes(outcome),
    spellingCorrect:
      outcome === "correct" ? true : outcome === "spelling" ? false : null,
  });
  const exact = answers.find((a) => normalizeAnswer(a) === value);
  if (exact !== undefined) return result("correct", "exact", exact);
  // An authored wrong word/form always takes precedence over tolerance.
  if (incorrectAnswers.some((a) => normalizeAnswer(a) === value))
    return result("incorrect", "known-wrong");
  if (spelling === "diacritics" && value) {
    const matches = answers.filter(
      (a) => withoutDiacritics(a) === withoutDiacritics(value),
    );
    const entered = value.split(" ");
    const match = matches.find((answer) => {
      const expected = normalizeAnswer(answer).split(" ");
      return (
        expected.length === entered.length &&
        expected.every(
          (word, i) => word === entered[i] || !knownForms.has(entered[i]),
        )
      );
    });
    if (match !== undefined) return result("spelling", "diacritics", match);
    if (matches.length) return result("incorrect", "known-form");
  }
  if (vocabularyTypos && spelling !== "strict" && value) {
    const entered = value.split(" ");
    const canonicalSpellings = new Set([...knownForms].map(withoutDiacritics));
    const matches = answers.filter((answer) => {
      const expected = normalizeAnswer(answer).split(" ");
      let typos = 0;
      return (
        expected.length === entered.length &&
        expected.every((word, i) => {
          if (word === entered[i]) return true;
          if (knownForms.has(entered[i])) return false;
          const from = withoutDiacritics(entered[i]),
            to = withoutDiacritics(word);
          if (from === to) return true;
          if (canonicalSpellings.has(from) || !internalTypo(from, to))
            return false;
          return ++typos === 1;
        }) &&
        typos === 1
      );
    });
    // Ambiguous near-matches do not guess which word the learner intended.
    if (new Set(matches.map(normalizeAnswer)).size === 1)
      return result("spelling", "vocabulary-typo", matches[0]);
  }
  if (
    partialIsIncorrect &&
    value.length >= 2 &&
    !answers.some((a) => withoutDiacritics(a) === withoutDiacritics(value)) &&
    answers.some((a) => {
      const expected = withoutDiacritics(a),
        entered = withoutDiacritics(value);
      return entered.length < expected.length && expected.startsWith(entered);
    })
  )
    return result("incorrect", "incomplete");
  return result(unknown, unknown === "incorrect" ? "mismatch" : "unrecognized");
}
