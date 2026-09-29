import { RECALL_POLICY } from "./recall-policy.js";
import { repairStep } from "./support.js";
import { isAnswerPrimed } from "./exposure.js";
export function createReviewQueue({ learningEvidence, recallByKey }) {
  function reviewQueue(state, now = Date.now()) {
    const rows = learningEvidence(state, now).sort((a, b) => {
      const priority = (r) =>
        r.needsTarget
          ? 0
          : r.needsVerification
            ? 1
            : r.needsSpelling
              ? 2
              : r.needsSupport
                ? 3
                : r.isDue
                  ? 4
                  : 5;
      return (
        priority(a) - priority(b) ||
        b.recentErrors - a.recentErrors ||
        a.last.at - b.last.at
      );
    });
    const seen = new Set(),
      selected = [];
    for (const row of rows) {
      if (
        !row.needsTarget &&
        !row.needsVerification &&
        !row.needsSpelling &&
        !row.needsSupport &&
        !row.isDue &&
        (row.lastIndependent || row.lastDecision)
      )
        continue;
      if (seen.has(row.target)) continue;
      seen.add(row.target);
      const q = row.lastProduction || row.task;
      const recall = recallByKey.get(row.key);
      selected.push({
        ...(recall || q),
        thread: undefined,
        continuation: undefined,
        showSupport: false,
        reviewNeed: row.needsTarget
          ? "target"
          : row.needsVerification
            ? "verification"
            : row.needsSpelling
              ? "spelling"
              : row.needsSupport
                ? "unassisted"
                : "return",
      });
      if (selected.length === RECALL_POLICY.batchSize) break;
    }
    return selected;
  }
  return reviewQueue;
}
export function nextReviewTask(run, events, now) {
  const attempts = events.filter(
    (e) => e.type === "answer" && e.run === run.id,
  );
  if (attempts.length >= RECALL_POLICY.maxSessionTurns) return null;
  const targets = run.reviewTargets.map((q) => {
    const key = q.reviewKey || q.target;
    let recalls = 0,
      failures = 0,
      last = -1,
      turns = 0,
      lastAttempt = null;
    for (const [i, e] of attempts.entries())
      if ((e.reviewKey || e.target) === key) {
        turns++;
        last = i;
        lastAttempt = e;
        if (e.correctness === false) {
          recalls = 0;
          failures++;
        } else if (
          ["type", "gap-type"].includes(q.kind)
            ? e.independentRecall
            : e.correctness && !e.answerVisible && !e.requestedHelp.length
        )
          recalls++;
        else recalls = 0;
      }
    const goal = ["type", "gap-type"].includes(q.kind)
      ? run.reviewTargets.length === 1
        ? 1
        : RECALL_POLICY.goal
      : 1;
    return {
      q,
      recalls,
      failures,
      last,
      turns,
      lastAttempt,
      done: recalls >= goal,
    };
  });
  const available = (t) =>
    t.failures < RECALL_POLICY.maxFailures &&
    t.turns < RECALL_POLICY.maxTurns &&
    // A correction may be rehearsed once. When there are too few other
    // targets to separate a later retrieval, leave it due instead of drilling
    // the just-shown answer until it falsely looks mastered.
    (t.lastAttempt?.correctness === false ||
      !["type", "gap-type"].includes(t.q.kind) ||
      !isAnswerPrimed(run, t.q, now));
  if (targets.every((t) => t.done || !available(t))) return null;
  const gap = Math.min(RECALL_POLICY.spacing, targets.length - 1);
  const spaced = (t) => t.last < 0 || attempts.length - t.last > gap;
  let candidates = targets.filter((t) => !t.done && available(t) && spaced(t));
  if (!candidates.length)
    candidates = targets.filter((t) => available(t) && spaced(t));
  const chosen = candidates.sort((a, b) => a.last - b.last)[0];
  if (!chosen) return null;
  if (chosen.lastAttempt?.correctness === false) {
    const lastTask =
      run.queue.find((q) => q.id === chosen.lastAttempt.step) || chosen.q;
    const repair = repairStep(lastTask);
    if (repair) return repair;
  }
  return {
    ...chosen.q,
    teaching: undefined,
    answerVisible: false,
  };
}
