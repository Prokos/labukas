import {
  RECALL_POLICY,
  familiarity,
  familiarityLabels,
  isLaterRecallVisit,
} from "./recall-policy.js";
import { assessAnswer, normalizeAnswer } from "./answer-assessment.js";
import { buildAssessmentLexicon } from "./assessment-lexicon.js";
import { rememberExposure, isAnswerPrimed } from "./answer-exposure.js";

export function referenceForTarget(steps, reference, target) {
  const models = steps.filter(
    (q) => q.kind === "model" && q.targets.includes(target),
  );
  const ids = new Set(models.map((m) => m.id));
  const rows = reference.filter(
    (row) => row.target === target || ids.has(row.target),
  );
  const resolved = rows.length
    ? rows
    : models.flatMap((m) => m.pairs.map(([lt, en]) => ({ target, lt, en })));
  return resolved.filter(
    (row, i) =>
      resolved.findIndex((r) => r.lt === row.lt && r.en === row.en) === i,
  );
}

// One runtime for authored courses: content owns targets, sequencing and repairs.
export function createCourseRuntime({
  lessons: openingLessons,
  retiredLessons = [],
  version: OPENING_VERSION,
  stepsFor = (lesson) => lesson.steps,
  assessmentSteps = [],
  reference = [],
  historyEvents = () => [],
  assessmentPolicy = { spelling: "diacritics" },
  repairFor,
  allowDirectEntry = false,
}) {
  const resumableLessons = [...openingLessons, ...retiredLessons];
  const openingSteps = [
    ...resumableLessons.flatMap((l) => stepsFor(l, 0)),
    ...assessmentSteps,
  ];
  const knownForms = buildAssessmentLexicon(
    openingSteps,
    assessmentPolicy.referenceForms,
  );
  const normalizeOpening = normalizeAnswer;
  function gradeOpening(step, answer, run = {}) {
    if (step.kind === "writing")
      return {
        status: "self-reviewed",
        message: "Writing saved.",
        detail: "",
      };
    const typed =
      ["type", "gap-type"].includes(step.kind) && !run.help?.includes("words");
    const authored = openingSteps.find((q) => q.id === step.id);
    // Only the old social-word queues need their ASCII aliases replaced. Never
    // deduplicate other accepted forms by stripping diacritics: both may be valid.
    const answers =
      !step.assessmentPolicy && authored?.assessmentPolicy
        ? authored.answers
        : step.answers || [];
    if (step.kind === "match")
      return {
        status: "correct",
        message: "Correct!",
        detail: "All meanings matched.",
      };
    if (step.kind === "edit" && run.editIndex !== step.editIndex)
      return {
        status: "incorrect",
        message: "Check which word needs changing.",
        detail: step.correction,
      };
    // Use the authored policy for old saved queues too; never rewrite past events.
    const policy =
      step.assessmentPolicy || authored?.assessmentPolicy || assessmentPolicy;
    const assessment = assessAnswer(answer, {
      answers,
      incorrectAnswers: step.wrong,
      spelling: typed ? policy?.spelling || "strict" : "strict",
      knownForms,
      unknown: !typed || step.kind === "gap-type" ? "incorrect" : "unassessed",
      partialIsIncorrect: typed,
    });
    if (assessment.outcome === "correct")
      return {
        assessment,
        status: "correct",
        message: "Correct!",
        detail: "",
      };
    if (assessment.outcome === "spelling")
      return {
        assessment,
        status: "spelling",
        message: normalizeAnswer(assessment.matchedAnswer).includes(" ")
          ? "Right phrase. Check the spelling:"
          : "Right word. Check the spelling:",
        detail: assessment.matchedAnswer,
      };
    if (assessment.outcome === "incorrect")
      return {
        assessment,
        status: "incorrect",
        message: "Not quite.",
        detail: step.correction,
      };
    return {
      assessment,
      status: "unassessed",
      message: "One way to say it:",
      detail: step.answers[0],
    };
  }
  const freshOpening = () => ({
    version: OPENING_VERSION,
    events: [],
    completed: [],
    run: null,
  });
  const stamp = (type, data, now = Date.now()) => ({
    id: crypto.randomUUID(),
    type,
    version: OPENING_VERSION,
    at: now,
    ...data,
  });
  function startOpening(
    state,
    lessonId,
    now = Date.now(),
    variant = Math.floor(Math.random() * 2),
  ) {
    const index = resumableLessons.findIndex((l) => l.id === lessonId);
    if (
      index < 0 ||
      (!allowDirectEntry &&
        index > 0 &&
        !state.completed.includes(openingLessons[index - 1].id))
    )
      return state;
    if (state.run?.lessonId === lessonId && !state.run.done) return state;
    const suspended = { ...state.suspended };
    if (state.run && !state.run.done) suspended[state.run.lessonId] = state.run;
    if (suspended[lessonId]) {
      const run = suspended[lessonId];
      delete suspended[lessonId];
      return {
        ...state,
        suspended,
        run: {
          ...run,
          paused: false,
          responseTurn: state.run?.responseTurn ?? run.responseTurn,
          answerExposures: state.run?.answerExposures ?? run.answerExposures,
        },
      };
    }
    const lesson = resumableLessons[index];
    const shuffled = (values) => {
      const copy = [...values];
      for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
      }
      return copy;
    };
    const queue = stepsFor(lesson, variant).map((q) => ({
      ...q,
      ...(q.options ? { options: shuffled(q.options) } : {}),
      ...(q.words ? { words: shuffled(q.words) } : {}),
      ...(q.kind === "match"
        ? { pairOrder: shuffled([...q.pairs.keys()]) }
        : {}),
    }));
    const run = {
      id: crypto.randomUUID(),
      lessonId,
      variant,
      index: 0,
      queue,
      intro: true,
      done: false,
      answer: "",
      selected: [],
      help: [],
      feedback: null,
      matched: [],
      pending: null,
      pendingRight: null,
      pairError: "",
      editIndex: null,
      repairTargets: [],
      threads: {},
      responseTurn: state.run?.responseTurn || 0,
      answerExposures: state.run?.answerExposures || [],
    };
    return {
      ...state,
      suspended,
      run,
      events: [
        ...state.events,
        stamp(
          "run",
          {
            lesson: lessonId,
            run: run.id,
            variant,
            replay: state.completed.includes(lessonId),
          },
          now,
        ),
      ],
    };
  }
  function answerOpening(state, now = Date.now()) {
    const run = state.run,
      step = run.queue[run.index];
    if (
      run.feedback ||
      (step.kind === "writing" &&
        run.checked?.length !== step.checklist.length) ||
      (step.kind === "match"
        ? run.matched.length !== step.pairs.length
        : !run.answer.trim())
    )
      return state;
    const feedback = gradeOpening(step, run.answer, run);
    const wordingCorrect = ["correct", "spelling"].includes(feedback.status);
    const answerPrimed = isAnswerPrimed(run, step, now);
    const unaided =
      !run.help.length &&
      !step.repair &&
      !step.teaching &&
      !step.answerVisible &&
      !answerPrimed;
    const suppliedSupport = [
      ...(step.options ? ["choices"] : []),
      ...(["bank", "chat-bank"].includes(step.kind) ? ["word-bank"] : []),
      ...(step.kind === "match" ? ["matching"] : []),
      ...(step.kind === "edit" ? ["replacement-options"] : []),
      ...(step.translation || (step.thread && step.gloss)
        ? ["translation"]
        : []),
      ...(step.teaching ? ["model"] : []),
      ...(answerPrimed ? ["recent-answer-exposure"] : []),
    ];
    const record = stamp(
      "answer",
      {
        lesson: run.lessonId,
        run: run.id,
        step: step.id,
        target: step.target,
        reviewKey: step.reviewKey || step.target,
        contentVersion: step.contentVersion || OPENING_VERSION,
        evidencePolicyVersion: 2,
        ability: step.ability,
        ...(step.ability === "form-recall" || step.ability === "form-choice"
          ? { targetForm: step.answers[0] }
          : {}),
        answer: run.answer,
        correctness: ["unassessed", "self-reviewed"].includes(feedback.status)
          ? null
          : wordingCorrect,
        outcome: feedback.status,
        ...(feedback.assessment ? { assessment: feedback.assessment } : {}),
        spellingCorrect:
          ["type", "gap-type"].includes(step.kind) &&
          !run.help.includes("words") &&
          wordingCorrect
            ? feedback.status !== "spelling"
            : null,
        responseMode: run.help.includes("words") ? "word-bank" : step.kind,
        suppliedSupport,
        requestedHelp: [...run.help],
        independentRecall:
          feedback.status === "correct" &&
          ["type", "gap-type"].includes(step.kind) &&
          unaided,
        independentWordRecall:
          wordingCorrect &&
          step.ability === "word-recall" &&
          ["type", "gap-type"].includes(step.kind) &&
          unaided,
        repair: !!step.repair,
        answerVisible: !!step.teaching || !!step.answerVisible,
        answerPrimed,
      },
      now,
    );
    const queue = [...run.queue],
      repairTargets = [...run.repairTargets];
    if (
      !run.review &&
      feedback.status === "incorrect" &&
      !step.repair &&
      !repairTargets.includes(step.target) &&
      repairTargets.length < 3
    ) {
      // Keep a live exchange together; put repairs after the conversation and two other turns.
      let insert = Math.min(run.index + 3, queue.length);
      while (insert < queue.length && queue[insert].continuation) insert++;
      const repair = repairFor(step, run.answer);
      if (repair) {
        queue.splice(insert, 0, repair);
        repairTargets.push(step.target);
      }
    }
    const threads = { ...run.threads };
    if (step.thread) {
      const prior = threads[step.thread] || [
        { speaker: step.speaker, text: step.source, gloss: step.gloss },
      ];
      threads[step.thread] = [
        ...prior,
        { speaker: "You", text: run.answer, outgoing: true },
        {
          speaker: step.speaker,
          text: wordingCorrect ? step.next : step.wrongNext,
          gloss: wordingCorrect
            ? step.followGloss
            : (step.wrongFollowGloss ?? step.followGloss),
        },
      ];
    }
    return {
      ...state,
      run: {
        ...run,
        ...rememberExposure({ ...run, feedback }, step, now),
        feedback,
        queue,
        repairTargets,
        threads,
      },
      events: [...state.events, record],
    };
  }
  function advanceOpening(state, now = Date.now()) {
    let run = state.run;
    const step = run.queue[run.index];
    if (run.intro)
      return {
        ...state,
        run: {
          ...run,
          ...(step.kind === "model" ? rememberExposure(run, step, now) : {}),
          intro: false,
        },
      };
    if (!run.feedback && step.kind !== "model") return state;
    if (step.kind === "model")
      run = { ...run, ...rememberExposure(run, step, now) };
    const events = [...state.events];
    if (step.kind === "model")
      events.push(
        stamp(
          "exposure",
          {
            lesson: run.lessonId,
            run: run.id,
            step: step.id,
            targets: step.targets,
          },
          now,
        ),
      );
    if (run.review && run.index === run.queue.length - 1 && run.reviewTargets) {
      const next = nextReviewTask(run, events, now);
      if (next) run = { ...run, queue: [...run.queue, next] };
    }
    const done = run.index === run.queue.length - 1;
    if (done)
      events.push(
        stamp("complete", { lesson: run.lessonId, run: run.id }, now),
      );
    return {
      ...state,
      events,
      completed:
        done && !run.review
          ? [...new Set([...state.completed, run.lessonId])]
          : state.completed,
      run: {
        ...run,
        ...(!done && run.queue[run.index + 1].kind === "model"
          ? rememberExposure(run, run.queue[run.index + 1], now)
          : {}),
        index: done ? run.index : run.index + 1,
        done,
        answer: "",
        selected: [],
        help: [],
        feedback: null,
        matched: [],
        pending: null,
        pendingRight: null,
        pairError: "",
        editIndex: null,
        reviewing: false,
        checked: [],
      },
    };
  }
  function helpOpening(state, kind, now = Date.now()) {
    const run = state.run;
    if (
      (run.feedback && kind !== "conversation-history") ||
      run.help.includes(kind)
    )
      return state;
    const step = run.queue[run.index];
    return {
      ...state,
      run: {
        ...run,
        ...rememberExposure(
          run,
          {
            kind: "model",
            pairs: (kind === "conversation-history"
              ? (run.threads?.[step.thread] || []).map((m) => m.text)
              : kind === "reference"
                ? referenceForTarget(openingSteps, reference, step.target).map(
                    (row) => row.lt,
                  )
                : kind === "words"
                  ? step.words || []
                  : kind === "reveal"
                    ? [step.answers?.[0]].filter(Boolean)
                    : [step.hint].filter(Boolean)
            ).map((text) => [text]),
          },
          now,
        ),
        help: [...run.help, kind],
        ...(kind === "words" ? { answer: "", selected: [] } : {}),
        ...(kind === "reveal" && step.kind === "match"
          ? { matched: step.pairs.map((_, i) => i) }
          : {}),
      },
      events: [
        ...state.events,
        stamp(
          "help",
          { lesson: run.lessonId, run: run.id, step: step.id, kind },
          now,
        ),
      ],
    };
  }
  function matchOpening(state, right, now = Date.now()) {
    const run = state.run,
      step = run.queue[run.index],
      left = run.pending;
    if (left === null || run.matched.includes(right) || run.feedback)
      return state;
    const correct = left === right;
    return {
      ...state,
      run: {
        ...run,
        pending: null,
        pendingRight: null,
        matched: correct ? [...run.matched, left] : run.matched,
        pairError: correct
          ? ""
          : `${step.pairs[left][0]} means “${step.pairs[left][1]}”.`,
      },
      events: [
        ...state.events,
        stamp(
          "pair-answer",
          {
            lesson: run.lessonId,
            run: run.id,
            step: step.id,
            target: step.pairs[left][0],
            answer: step.pairs[right][1],
            correctness: correct,
            requestedHelp: [...run.help],
          },
          now,
        ),
      ],
    };
  }

  function learningEvidence(state, now = Date.now()) {
    const rows = new Map();
    const combined = [
      ...new Map(
        [...historyEvents(), ...state.events].map((e) => [e.id, e]),
      ).values(),
    ].sort((a, b) => a.at - b.at);
    for (const e of combined) {
      if (
        e.type !== "answer" ||
        e.repair ||
        e.outcome === "self-reviewed" ||
        e.correctness === null
      )
        continue;
      const q =
        openingSteps.find((q) => q.id === e.step) ||
        (e.reviewKey &&
          openingSteps.find(
            (q) =>
              q.reviewKey === e.reviewKey &&
              (q.kind === e.responseMode ||
                (e.responseMode === "word-bank" &&
                  e.requestedHelp?.includes("words") &&
                  ["type", "gap-type"].includes(q.kind))),
          ));
      if (!q || ["match", "writing"].includes(q.kind)) continue;
      const key = e.reviewKey || q.reviewKey || q.target;
      const row = rows.get(key) || {
        key,
        target: q.target,
        visits: [],
        needsSpelling: false,
        needsSupport: false,
        needsTarget: false,
        lastProduction: null,
        level: 0,
        recentErrors: 0,
        independentRun: 0,
        recallVisits: 0,
        lastRecall: null,
      };
      row.last = e;
      row.task = q;
      const production = ["type", "gap-type"].includes(q.kind);
      if (production) row.lastProduction = q;
      row.level = Math.max(row.level, production ? 3 : 1);
      if (e.correctness === false) {
        row.needsTarget = true;
        row.recentErrors = Math.min(3, row.recentErrors + 1);
        row.independentRun = 0;
        row.recallVisits = 0;
        row.lastRecall = null;
        row.visits = [];
      }
      if (e.outcome === "spelling") {
        row.needsSpelling = true;
        row.independentRun = 0;
      }
      if (
        (e.requestedHelp?.length || e.answerVisible || e.answerPrimed) &&
        production
      ) {
        row.needsSupport = true;
        row.independentRun = 0;
      }
      if (e.independentRecall) {
        row.independentRun++;
        row.needsSpelling = false;
        row.needsSupport = false;
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
      row.due = (row.lastIndependent || e.at) + interval;
      row.isDue = row.due <= now;
      rows.set(key, row);
    }
    return [...rows.values()];
  }
  function reviewQueue(state, now = Date.now()) {
    const rows = learningEvidence(state, now).sort((a, b) => {
      const priority = (r) =>
        r.needsTarget
          ? 0
          : r.needsSpelling
            ? 1
            : r.needsSupport
              ? 2
              : r.isDue
                ? 3
                : 4;
      return priority(a) - priority(b) || a.due - b.due;
    });
    const seen = new Set(),
      selected = [];
    for (const row of rows) {
      if (seen.has(row.target)) continue;
      seen.add(row.target);
      const q = row.lastProduction || row.task;
      const recall = openingSteps.find(
        (task) =>
          (task.reviewKey || task.target) === row.key &&
          ["type", "gap-type"].includes(task.kind) &&
          !task.plannedReturn,
      );
      selected.push({
        ...(recall || q),
        thread: undefined,
        continuation: undefined,
        showSupport: row.needsTarget && row.last.correctness === false,
        reviewNeed: row.needsTarget
          ? "target"
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
  function selectPair(state, side, index, now = Date.now()) {
    const run = state.run,
      step = run.queue[run.index];
    if (run.feedback || run.matched.includes(index) || !step.pairs?.[index])
      return state;
    if (side === "right" && run.pending != null)
      return matchOpening(state, index, now);
    if (side === "left" && run.pendingRight != null)
      return matchOpening(
        { ...state, run: { ...run, pending: index } },
        run.pendingRight,
        now,
      );
    const key = side === "left" ? "pending" : "pendingRight";
    return {
      ...state,
      run: { ...run, [key]: run[key] === index ? null : index, pairError: "" },
    };
  }
  function startReview(state, now = Date.now()) {
    if (state.run?.review && !state.run.done)
      return { ...state, run: { ...state.run, paused: false } };
    const queue = reviewQueue(state, now);
    if (!queue.length) return state;
    const runtime = createCourseRuntime({
      lessons: [{ id: "authored-review", steps: queue }],
      version: OPENING_VERSION,
      repairFor,
      assessmentPolicy,
      allowDirectEntry: true,
    });
    const next = runtime.startOpening(state, "authored-review", now, 0);
    const supported = next.run.queue.map((q) =>
      q.showSupport ? { ...q, teaching: q.correction, answerVisible: true } : q,
    );
    return {
      ...next,
      run: {
        ...next.run,
        queue: supported,
        review: true,
        reviewTargets: next.run.reviewTargets || queue,
      },
    };
  }
  function nextReviewTask(run, events, now) {
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
    let candidates = targets.filter(
      (t) => !t.done && available(t) && spaced(t),
    );
    if (!candidates.length)
      candidates = targets.filter((t) => available(t) && spaced(t));
    const chosen = candidates.sort((a, b) => a.last - b.last)[0];
    if (!chosen) return null;
    const showAnswer = chosen.lastAttempt?.correctness === false;
    return {
      ...chosen.q,
      teaching: showAnswer ? chosen.q.correction : undefined,
      answerVisible: showAnswer,
    };
  }

  return {
    freshOpening,
    startOpening,
    answerOpening,
    advanceOpening,
    helpOpening,
    matchOpening,
    gradeOpening,
    reviewQueue,
    learningEvidence,
    startReview,
    selectPair,
  };
}
