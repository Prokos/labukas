import { createGrader } from "./assessment.js";
import { createEvidenceReader } from "./evidence.js";
import { createReviewQueue, nextReviewTask } from "./review.js";
import { RECALL_POLICY } from "./recall-policy.js";
import { normalizeAnswer } from "./answer-assessment.js";
import { buildAssessmentLexicon } from "./lexicon.js";
import {
  rememberExposure,
  rememberVisibleStep,
  isAnswerPrimed,
} from "./exposure.js";
import {
  hintForStep,
  limitChoices,
  supportChoices,
  repairStep,
  shuffleChoices,
} from "./support.js";

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

// One runtime for authored courses: content owns targets and alternatives;
// shared policy owns assistance, retries and evidence.
export function createCourseRuntime({
  lessons,
  version: courseVersion,
  stepsFor = (lesson) => lesson.steps,
  assessmentSteps = [],
  reference = [],
  historyEvents = () => [],
  assessmentPolicy = { spelling: "diacritics" },
  allowDirectEntry = false,
}) {
  const steps = [...lessons.flatMap((l) => stepsFor(l, 0)), ...assessmentSteps];
  // Resolve evidence by stable identity without rescanning the entire chapter
  // for every historic answer on every interaction.
  const stepById = new Map(),
    tasksByKey = new Map(),
    recallByKey = new Map();
  const lexicalByTarget = new Map(),
    lexicalByWord = new Map();
  const add = (index, key, q) => index.set(key, [...(index.get(key) || []), q]);
  for (const q of steps) {
    if (!stepById.has(q.id)) stepById.set(q.id, q);
    const key = q.reviewKey || q.target;
    add(tasksByKey, key, q);
    if (!["type", "gap-type"].includes(q.kind)) continue;
    if (!q.plannedReturn && !recallByKey.has(key)) recallByKey.set(key, q);
    if (q.ability !== "word-recall") continue;
    add(lexicalByTarget, q.target, q);
    for (const answer of q.answers || [])
      add(lexicalByWord, normalizeAnswer(answer), q);
  }
  const productionKeys = new Set(
    steps
      .filter((q) => ["type", "gap-type"].includes(q.kind))
      .map((q) => q.reviewKey || q.target),
  );
  const knownForms = buildAssessmentLexicon(
    steps,
    assessmentPolicy.referenceForms,
  );
  const gradeAnswer = createGrader({ stepById, knownForms, assessmentPolicy });
  const learningEvidence = createEvidenceReader({
    stepById,
    tasksByKey,
    lexicalByTarget,
    lexicalByWord,
    productionKeys,
    historyEvents,
  });
  const reviewQueue = createReviewQueue({ learningEvidence, recallByKey });
  const normalize = normalizeAnswer;

  const createState = () => ({
    version: courseVersion,
    events: [],
    completed: [],
    run: null,
  });
  const stamp = (type, data, now = Date.now()) => ({
    id: crypto.randomUUID(),
    type,
    version: courseVersion,
    at: now,
    ...data,
  });
  function refreshPendingContent(state) {
    const refreshRun = (run) => {
      if (!run || run.done) return run;
      const engaged =
        run.feedback ||
        run.answer ||
        run.help?.length ||
        run.selected?.length ||
        run.matched?.length ||
        run.pending != null ||
        run.pendingRight != null;
      const lesson = lessons.find((l) => l.id === run.lessonId);
      const currentTasks = lesson ? stepsFor(lesson, run.variant || 0) : [];
      return {
        ...run,
        queue: run.queue.map((q, i) => {
          if (i < run.index || (i === run.index && engaged)) return q;
          const id = q.id.replace(/(?:-repair)+$/, "");
          const original =
            currentTasks.find((s) => s.id === id) ||
            stepById.get(id) ||
            (q.adaptiveReturn && stepById.get(q.returnOf));
          if (
            !original ||
            JSON.stringify(original.answers) !== JSON.stringify(q.answers)
          )
            return q;
          // Keep answered screens, drafts, variant answers, IDs and queue order.
          // Only unanswered tasks receive corrected copy and support contracts.
          if (q.repair && !q.repairStage) {
            const repaired = repairStep(original);
            return repaired ? { ...repaired, id: q.id } : q;
          }
          if (q.repair) return q;
          return {
            ...q,
            kind: original.kind,
            source: original.source,
            translation: original.translation,
            instruction: original.instruction,
            hint: original.hint,
            cue: original.cue,
            correction: original.correction,
            note: original.note,
            answerScope: original.answerScope,
            pairTargets: original.pairTargets,
            supportOptions: original.supportOptions,
            options: q.options ? limitChoices(q.options, q.answers) : undefined,
          };
        }),
      };
    };
    return {
      ...state,
      run: refreshRun(state.run),
      ...(state.suspended
        ? {
            suspended: Object.fromEntries(
              Object.entries(state.suspended).map(([id, run]) => [
                id,
                refreshRun(run),
              ]),
            ),
          }
        : {}),
    };
  }
  function startLesson(
    state,
    lessonId,
    now = Date.now(),
    variant = Math.floor(Math.random() * 2),
  ) {
    if (state.run?.lessonId === lessonId && !state.run.done) return state;
    const index = lessons.findIndex((l) => l.id === lessonId);
    const saved = state.suspended?.[lessonId];
    if (
      !saved &&
      (index < 0 ||
        (!allowDirectEntry &&
          index > 0 &&
          !state.completed.includes(lessons[index - 1].id)))
    )
      return state;
    const suspended = { ...state.suspended };
    if (state.run && !state.run.done) suspended[state.run.lessonId] = state.run;
    if (saved) {
      delete suspended[lessonId];
      return {
        ...state,
        suspended,
        run: {
          ...saved,
          paused: false,
          responseTurn: state.run?.responseTurn ?? saved.responseTurn,
          answerExposures: state.run?.answerExposures ?? saved.answerExposures,
        },
      };
    }
    const lesson = lessons[index];
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
      ...(q.options
        ? { options: shuffled(limitChoices(shuffled(q.options), q.answers)) }
        : {}),
      ...(q.words ? { words: shuffled(q.words) } : {}),
      ...(q.kind === "match"
        ? { pairOrder: shuffled([...q.pairs.keys()]) }
        : {}),
    }));
    if (lessonId !== "authored-review" && lessons.includes(lesson)) {
      const present = new Set(queue.map((q) => q.reviewKey || q.target));
      const carry = reviewQueue(state, now)
        .filter(
          (q) =>
            ["target", "verification"].includes(q.reviewNeed) &&
            !present.has(q.reviewKey || q.target),
        )
        .slice(0, 2)
        .map((q) => ({
          ...q,
          id: `${q.id}-return-in-${lesson.id}`,
          adaptiveReturn: true,
          plannedReturn: true,
          returnOf: q.id,
        }));
      let responses = 0,
        insert = 0;
      while (insert < queue.length && responses < RECALL_POLICY.spacing) {
        if (queue[insert].kind !== "model") responses++;
        insert++;
      }
      while (insert < queue.length && queue[insert].continuation) insert++;
      queue.splice(insert, 0, ...carry);
    }
    const run = {
      id: crypto.randomUUID(),
      lessonId,
      lessonTitle: lesson.title,
      lessonGoal: lesson.goal,
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
  function submitAnswer(state, now = Date.now()) {
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
    const feedback = gradeAnswer(step, run.answer, run);
    const nextRepair =
      feedback.status === "incorrect" ? repairStep(step) : null;
    const scheduleRepair =
      nextRepair &&
      (run.review ||
        step.repairStage === 1 ||
        (!run.repairTargets.includes(step.target) &&
          run.repairTargets.length < 3));
    if (scheduleRepair && !run.help.includes("reveal"))
      feedback.detail = "You’ll get another try with support.";
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
        contentVersion: step.contentVersion || courseVersion,
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
          feedback.assessment?.reason !== "vocabulary-typo" &&
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
    if (!run.review && feedback.status === "incorrect" && scheduleRepair) {
      // Keep a live exchange together; put repairs after the conversation and two other turns.
      let insert = Math.min(run.index + 3, queue.length);
      while (insert < queue.length && queue[insert].continuation) insert++;
      const repair = nextRepair;
      if (repair) {
        queue.splice(insert, 0, repair);
        if (!repairTargets.includes(step.target))
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
  function advance(state, now = Date.now()) {
    let run = state.run;
    const step = run.queue[run.index];
    if (run.intro)
      return {
        ...state,
        run: {
          ...run,
          ...rememberVisibleStep(run, step, now),
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
        stamp(
          "complete",
          { lesson: run.lessonId, run: run.id, review: !!run.review },
          now,
        ),
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
        ...(!done
          ? rememberVisibleStep(run, run.queue[run.index + 1], now)
          : {}),
        index: done ? run.index : run.index + 1,
        done,
        answer: "",
        selected: [],
        help: [],
        helpOpen: false,
        supportChoices: undefined,
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
  function requestHelp(state, kind, now = Date.now()) {
    const run = state.run;
    if (
      (run.feedback && kind !== "conversation-history") ||
      run.help.includes(kind)
    )
      return state;
    const step = run.queue[run.index];
    // Opening an empty help menu is not linguistic assistance. Record help
    // only when a cue, choices or an answer is actually delivered.
    if (kind === "hint" && !hintForStep(step))
      return { ...state, run: { ...run, helpOpen: true } };
    return {
      ...state,
      run: {
        ...run,
        ...(kind === "hint" ? { helpOpen: true } : {}),
        ...rememberExposure(
          run,
          {
            kind: "model",
            pairs: (kind === "conversation-history"
              ? (run.threads?.[step.thread] || []).map((m) => m.text)
              : kind === "reference"
                ? referenceForTarget(steps, reference, step.target).map(
                    (row) => row.lt,
                  )
                : kind === "words"
                  ? supportChoices(step)
                  : kind === "reveal"
                    ? [step.answers?.[0]].filter(Boolean)
                    : [hintForStep(step)].filter(Boolean)
            ).map((text) => [text]),
          },
          now,
        ),
        help: [...run.help, kind],
        ...(kind === "words"
          ? {
              answer: "",
              selected: [],
              supportChoices: shuffleChoices(supportChoices(step)),
            }
          : {}),
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
  function matchPair(state, right, now = Date.now()) {
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
        pairError: correct ? "" : "Those don’t match. Try another pair.",
      },
      events: [
        ...state.events,
        stamp(
          "pair-answer",
          {
            lesson: run.lessonId,
            run: run.id,
            step: step.id,
            target: step.pairTargets?.[left] || step.pairs[left][0],
            pairWord: step.pairs[left][0],
            answer: step.pairs[right][1],
            correctness: correct,
            requestedHelp: [...run.help],
          },
          now,
        ),
      ],
    };
  }

  function selectPair(state, side, index, now = Date.now()) {
    const run = state.run,
      step = run.queue[run.index];
    if (run.feedback || run.matched.includes(index) || !step.pairs?.[index])
      return state;
    if (side === "right" && run.pending != null)
      return matchPair(state, index, now);
    if (side === "left" && run.pendingRight != null)
      return matchPair(
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
      version: courseVersion,
      assessmentPolicy,
      allowDirectEntry: true,
    });
    const next = runtime.startLesson(state, "authored-review", now, 0);
    return {
      ...next,
      run: {
        ...next.run,
        queue: next.run.queue,
        review: true,
        reviewTargets: next.run.reviewTargets || queue,
      },
    };
  }

  return {
    createState,
    refreshPendingContent,
    startLesson,
    submitAnswer,
    advance,
    requestHelp,
    matchPair,
    gradeAnswer,
    reviewQueue,
    learningEvidence,
    startReview,
    selectPair,
  };
}
