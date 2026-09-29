import { normalizeAnswer } from "./answer-assessment.js";

// Index canonical target-language data, never English prompts/translations or
// arbitrary wrong answers (which can contain invented spellings). New content
// contributes automatically through its semantic fields.
export function buildAssessmentLexicon(steps, referenceForms = []) {
  const forms = new Set();
  function add(text) {
    for (const word of String(text || "").match(/[\p{L}\p{M}]+/gu) || [])
      forms.add(normalizeAnswer(word));
  }
  referenceForms.forEach(add);
  for (const q of steps) {
    if (q.kind === "model" || q.kind === "match")
      q.pairs?.forEach(([lt]) => add(lt));
    if (
      [
        "type",
        "gap-type",
        "gap",
        "bank",
        "chat-bank",
        "chat-choice",
        "edit",
      ].includes(q.kind)
    )
      q.answers?.forEach(add);
    q.formAlternatives?.forEach(add);
    if (q.passage) add(q.passage);
    q.menu?.forEach(([dish]) => add(dish));
  }
  return forms;
}
