import { normalizeAnswer } from "./answer-assessment.js";
import { isClosedVocabulary } from "./support.js";
import {
  familiarity,
  familiarityLabels,
  isLaterRecallVisit,
} from "./recall-policy.js";
export function createEvidenceReader({
  stepById,
  tasksByKey,
  lexicalByTarget,
  lexicalByWord,
  productionKeys,
  historyEvents,
}) {
  function learningEvidence(state, now = Date.now()) {
    const rows = new Map();
    const combined = [
      ...new Map(
        [...historyEvents(), ...state.events].map((e) => [e.id, e]),
      ).values(),
    ].sort((a, b) => a.at - b.at);
    for (const e of combined) {
      if (
        !["answer", "pair-answer"].includes(e.type) ||
        e.repair ||
        e.outcome === "self-reviewed"
      )
        continue;
      let q =
        stepById.get(e.step) ||
        (e.reviewKey &&
          (tasksByKey.get(e.reviewKey) || []).find(
            (q) =>
              q.kind === e.responseMode ||
              (e.responseMode === "word-bank" &&
                e.requestedHelp?.includes("words") &&
                ["type", "gap-type"].includes(q.kind)),
          ));
      if (e.type === "pair-answer") {
        const matches = [
          ...new Set([
            ...(lexicalByTarget.get(e.target) || []),
            ...(lexicalByWord.get(normalizeAnswer(e.pairWord || e.target)) ||
              []),
          ]),
        ];
        if (new Set(matches.map((t) => t.target)).size !== 1) continue;
        q = matches.find((t) => !t.plannedReturn) || matches[0];
      }
      if (!q || ["match", "writing"].includes(q.kind)) continue;
      const unresolved = e.outcome === "unassessed" && isClosedVocabulary(q);
      if (e.correctness === null && !unresolved) continue;
      const key =
        e.type === "pair-answer"
          ? q.reviewKey || q.target
          : e.reviewKey || q.reviewKey || q.target;
      const row = rows.get(key) || {
        key,
        target: q.target,
        visits: [],
        needsSpelling: false,
        needsSupport: false,
        needsTarget: false,
        needsVerification: false,
        lastProduction: null,
        level: 0,
        recentErrors: 0,
        independentRun: 0,
        decisionRun: 0,
        recallVisits: 0,
        lastRecall: null,
      };
      row.last = e;
      row.task = q;
      const production =
        e.type === "answer" && ["type", "gap-type"].includes(q.kind);
      if (production) row.lastProduction = q;
      row.level = Math.max(row.level, production ? 3 : 1);
      if (e.correctness === false) {
        row.needsTarget = true;
        row.recentErrors = Math.min(3, row.recentErrors + 1);
        row.independentRun = 0;
        row.decisionRun = 0;
        row.recallVisits = 0;
        row.lastRecall = null;
        row.visits = [];
      }
      if (e.outcome === "spelling") {
        row.needsSpelling = true;
        row.independentRun = 0;
      }
      if (unresolved) row.needsVerification = true;
      if (
        (e.requestedHelp?.length ||
          ((e.answerVisible || e.answerPrimed) && !row.lastIndependent)) &&
        production
      ) {
        row.needsSupport = true;
        row.independentRun = 0;
      }
      // A construction/recognition-only target can recover at its own level.
      // It must not earn productive recall or stay permanently "wrong" because
      // no typing task exists for that target. Matching never repairs retrieval.
      if (
        !productionKeys.has(key) &&
        e.type === "answer" &&
        !production &&
        e.correctness &&
        !e.requestedHelp?.length &&
        !e.answerVisible &&
        !e.answerPrimed
      ) {
        row.decisionRun++;
        row.lastDecision = e.at;
        if (row.decisionRun >= 2) {
          row.needsTarget = false;
          row.recentErrors = 0;
        }
      }
      if (e.independentRecall) {
        row.independentRun++;
        row.needsSpelling = false;
        row.needsSupport = false;
        row.needsVerification = false;
        if (row.independentRun >= 2) {
          row.needsTarget = false;
          row.recentErrors = 0;
        }
        if (isLaterRecallVisit(row.lastRecall, e.at)) {
          row.recallVisits++;
          row.lastRecall = e.at;
          row.visits.push(e.at);
        }
        row.lastIndependent = e.at;
      }
      row.familiarity = familiarity(row);
      row.label = familiarityLabels[row.familiarity];
      const interval =
        [1, 3, 7][Math.min(2, Math.max(0, row.visits.length - 1))] * 86400000;
      row.due = (row.lastIndependent || row.lastDecision || e.at) + interval;
      row.isDue = row.due <= now;
      rows.set(key, row);
    }
    return [...rows.values()];
  }
  return learningEvidence;
}
