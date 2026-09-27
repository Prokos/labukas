// Orthography and linguistic contrasts are separate inputs. A spelling match
// cannot override a known competing form, even inside a complete sentence.
export const ASSESSMENT_VERSION = 2;
export const normalizeAnswer = (value) =>
  String(value)
    .normalize("NFC")
    .toLocaleLowerCase("lt")
    .replace(/[.,!?;:“”"'‘’]/g, "")
    .replace(/\s+/g, " ")
    .trim();
export const withoutDiacritics = (value) =>
  normalizeAnswer(value).normalize("NFD").replace(/\p{M}/gu, "");

export function assessAnswer(
  answer,
  {
    answers,
    incorrectAnswers = [],
    spelling = "strict",
    knownForms = new Set(),
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
