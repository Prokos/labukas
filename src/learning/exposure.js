import { normalizeAnswer } from "./answer-assessment.js";
import { RECALL_POLICY, isLaterRecallVisit } from "./recall-policy.js";

// Short-term answer exposure is support, even when it was supplied by a previous
// question rather than requested through Help. Store it in the run for reloads;
// keep historical answer events immutable.
export function rememberExposure(run, step, now) {
  run = exposureState(run, now);
  const turn = (run.responseTurn || 0) + (step.kind === "model" ? 0 : 1);
  const texts =
    step.kind === "model"
      ? [...step.pairs.map(([lt]) => lt), step.note].filter(Boolean)
      : [
          run.answer,
          run.feedback?.detail,
          ...(step.options || []),
          ...(["bank", "chat-bank"].includes(step.kind)
            ? step.words || []
            : []),
          ...(run.help?.includes("words") ? run.supportChoices || [] : []),
          ...(step.pairs || []).map(([lt]) => lt),
          step.source,
          step.passage,
          run.feedback?.status === "incorrect" ? step.wrongNext : step.next,
          step.teaching,
          ...(step.messages || []).map((m) => m.text),
        ];
  return {
    responseTurn: turn,
    answerExposures: [
      ...(run.answerExposures || []).filter(
        (e) => turn - e.turn < RECALL_POLICY.spacing,
      ),
      { turn, at: now, texts: texts.filter(Boolean).map(normalizeAnswer) },
    ],
  };
}
// Record a displayed screen before any submission. A learner may leave it
// for Practice; visible choices/models still count as recent support there.
export function rememberVisibleStep(run, step, now) {
  if (step.kind === "model") return rememberExposure(run, step, now);
  const texts = [
    step.source,
    step.passage,
    step.teaching,
    ...(step.options || []),
    ...(step.pairs || []).map(([lt]) => lt),
    ...(["bank", "chat-bank"].includes(step.kind) ? step.words || [] : []),
    ...(step.messages || []).map((m) => m.text),
  ].filter(Boolean);
  return rememberExposure(
    run,
    { kind: "model", pairs: texts.map((t) => [t]) },
    now,
  );
}
export function isAnswerPrimed(run, step, now) {
  run = exposureState(run, now);
  return (run.answerExposures || []).some(
    (e) =>
      (run.responseTurn || 0) - e.turn < RECALL_POLICY.spacing &&
      !isLaterRecallVisit(e.at, now) &&
      (step.answers || []).some((answer) => {
        const needle = ` ${normalizeAnswer(answer)} `;
        return e.texts.some((t) => ` ${t} `.includes(needle));
      }),
  );
}

function exposureState(run, now) {
  if (run.answerExposures) return run;
  // When exposure is absent, reconstruct what completed screens displayed.
  // This records possible priming without creating answer evidence.
  let memory = { answerExposures: [], responseTurn: 0 };
  for (const q of (run.queue || []).slice(0, run.index || 0)) {
    memory = rememberExposure({ ...memory, answer: q.answers?.[0] }, q, now);
  }
  return { ...run, ...memory };
}
