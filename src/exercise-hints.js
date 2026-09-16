import { isCorrect, normalize } from "./engine.js";

export function exerciseHint(ex, state = {}) {
  if (!ex) return null;
  const {
    eliminated = [],
    revealed = 0,
    selected = [],
    matched = [],
    pendingMatch,
  } = state;
  if (ex.type === "choice") {
    const wrong = ex.options.find(
      (option) => !eliminated.includes(option) && !isCorrect(option, ex),
    );
    return wrong === undefined
      ? null
      : {
          eliminated: [...eliminated, wrong],
          message: "One incorrect option removed.",
        };
  }
  if (["type", "cloze"].includes(ex.type)) {
    const characters = Array.from(ex.answer.normalize("NFC"));
    const isLetter = (c) => /[\p{L}\p{N}]/u.test(c);
    if (revealed >= characters.filter(isLetter).length) return null;
    let letters = 0;
    return {
      revealed: revealed + 1,
      spelling: characters
        .map((c) => (!isLetter(c) || ++letters <= revealed + 1 ? c : "_"))
        .join(""),
      message: revealed
        ? "Another letter revealed."
        : "Start with this letter.",
    };
  }
  if (ex.type === "order") {
    let prefix = 0;
    while (
      prefix < selected.length &&
      prefix < ex.answerTokens.length &&
      normalize(selected[prefix].text) ===
        normalize(ex.answerTokens[prefix].text)
    )
      prefix++;
    if (prefix === ex.answerTokens.length && selected.length === prefix)
      return null;
    const kept = selected.slice(0, prefix);
    const next = ex.answerTokens[prefix];
    const token =
      next &&
      ex.tokens.find(
        (t) =>
          !kept.some((k) => k.id === t.id) &&
          normalize(t.text) === normalize(next.text),
      );
    return {
      selected: token ? [...kept, token] : kept,
      message:
        prefix < selected.length
          ? "Corrected the word order up to here."
          : "The next word is in place.",
    };
  }
  if (ex.type === "match") {
    const pair =
      ex.pairs.find(
        (p) => p.id === pendingMatch?.id && !matched.includes(p.id),
      ) || ex.pairs.find((p) => !matched.includes(p.id));
    return pair
      ? {
          matched: [...matched, pair.id],
          message: `${pair.lt} — ${pair.en}`,
        }
      : null;
  }
  return null;
}
