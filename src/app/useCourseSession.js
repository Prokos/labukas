import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useMemo,
  useSyncExternalStore,
} from "react";
import {
  createCourseRuntime,
  referenceForTarget,
} from "../learning/session.js";
import * as progress from "../progress/store.js";
export function useCourseSession({ course, onActiveChange }) {
  const lessons = course.lessons;
  const runtime = useMemo(
    () =>
      createCourseRuntime({
        ...course,
        historyEvents: () => progress.historyExcept(course.key),
      }),
    [course],
  );
  const snapshot = useSyncExternalStore(
    progress.subscribe,
    progress.getSnapshot,
  );
  const empty = useMemo(() => runtime.createState(), [runtime]);
  const state = snapshot.courses[course.key] || empty;
  const setState = (update) => {
    const current = progress.getSnapshot().courses[course.key] || empty;
    progress
      .saveCourse(
        course.key,
        typeof update === "function" ? update(current) : update,
      )
      .catch(() => {});
  };
  const { startLesson, submitAnswer, advance, requestHelp } = runtime;
  const [open, setOpen] = useState(() =>
    Boolean(state.run && !state.run.done && !state.run.paused),
  );
  const storageError = snapshot.error;
  useEffect(() => {
    const current = progress.getSnapshot().courses[course.key];
    if (!current) return;
    const refreshed = runtime.refreshPendingContent(current);
    if (JSON.stringify(refreshed) !== JSON.stringify(current))
      setState(refreshed);
  }, [runtime]);
  const sessionRef = useRef(null),
    input = useRef(null),
    title = useRef(null),
    nextButton = useRef(null);
  const run = state.run,
    lesson = run?.review
      ? {
          id: "authored-review",
          title: "Bring it back",
          goal: "Return to words and patterns from your chapter.",
          newLanguage: [],
          returns: [],
        }
      : lessons.find((l) => l.id === run?.lessonId) ||
        (run
          ? {
              id: run.lessonId,
              title: run.lessonTitle || "Continue lesson",
              goal: run.lessonGoal || "",
            }
          : null),
    step = run?.queue[run.index];
  const nextLesson = lessons.find((l) => !state.completed.includes(l.id));
  const focusLesson = run && !run.done ? lesson : nextLesson;
  const active = open && !!run;
  useEffect(() => {
    if (!active || run.intro || run.done || run.feedback || !step?.options)
      return;
    const selectNumber = (e) => {
      if (
        e.defaultPrevented ||
        e.repeat ||
        e.isComposing ||
        e.ctrlKey ||
        e.metaKey ||
        e.altKey ||
        e.target.closest?.('input, textarea, select, [contenteditable="true"]')
      )
        return;
      if (!/^[1-9]$/.test(e.key)) return;
      const option = step.options[Number(e.key) - 1];
      if (option === undefined) return;
      e.preventDefault();
      setState((s) => ({ ...s, run: { ...s.run, answer: option } }));
      nextButton.current?.focus({ preventScroll: true });
    };
    document.addEventListener("keydown", selectNumber);
    return () => document.removeEventListener("keydown", selectNumber);
  }, [active, run?.intro, run?.done, run?.feedback, step]);
  useLayoutEffect(() => {
    onActiveChange(active);
    return () => onActiveChange(false);
  }, [active, onActiveChange]);
  useLayoutEffect(() => {
    if (!active) return;
    if (run.feedback) {
      input.current?.blur();
      nextButton.current?.focus({ preventScroll: true });
      nextButton.current?.scrollIntoView({ block: "nearest" });
    } else {
      sessionRef.current?.scrollTo(0, 0);
      (step &&
      ["type", "gap-type"].includes(step.kind) &&
      !run.intro &&
      !run.done
        ? input.current
        : title.current
      )?.focus({ preventScroll: true });
    }
  }, [active, run?.index, run?.intro, run?.done, run?.feedback, run?.id]);
  const updateRun = (patch) =>
    setState((s) => ({ ...s, run: { ...s.run, ...patch } }));
  function start(id) {
    setState((s) => {
      const next = startLesson(s, id);
      return next.run ? { ...next, run: { ...next.run, paused: false } } : next;
    });
    setOpen(true);
  }
  function submit(e) {
    e.preventDefault();
    if (
      step.kind === "writing" &&
      !run.intro &&
      !run.feedback &&
      !run.reviewing
    )
      updateRun({ reviewing: true, checked: [] });
    else if (run.intro || run.feedback || step.kind === "model")
      setState((s) => advance(s));
    else setState((s) => submitAnswer(s));
  }
  function help(kind) {
    setState((s) => requestHelp(s, kind));
  }
  function pickWord(index) {
    const selected = run.selected.includes(index)
      ? run.selected.filter((i) => i !== index)
      : [...run.selected, index];
    updateRun({
      selected,
      answer: selected.map((i) => step.words[i]).join(" "),
    });
  }
  function letter(c) {
    const el = input.current,
      start = el.selectionStart,
      end = el.selectionEnd;
    updateRun({
      answer: run.answer.slice(0, start) + c + run.answer.slice(end),
    });
    requestAnimationFrame(() => {
      el.focus({ preventScroll: true });
      el.setSelectionRange(start + 1, start + 1);
    });
  }
  function choose(answer) {
    updateRun({ answer });
    nextButton.current?.focus({ preventScroll: true });
  }
  const isTyping = step && ["type", "gap-type"].includes(step.kind),
    isBank = step && ["bank", "chat-bank"].includes(step.kind);
  const reference = useMemo(
    () =>
      referenceForTarget(
        lessons.flatMap((l) => l.steps),
        course.reference,
        step?.target,
      ),
    [course, step?.target],
  );
  const messages = step?.thread
    ? run.threads[step.thread] || [
        { speaker: step.speaker, text: step.source, gloss: step.gloss },
      ]
    : step?.messages;
  const canCheck =
    step?.kind === "match"
      ? run.matched.length === step.pairs.length
      : step?.kind === "writing" && run?.reviewing
        ? run.checked?.length === step.checklist.length
        : !!run?.answer.trim();
  useEffect(() => {
    if (!active) return;
    const activatePrimary = (e) => {
      if (
        !["Enter", " "].includes(e.key) ||
        e.defaultPrevented ||
        e.repeat ||
        e.isComposing ||
        e.ctrlKey ||
        e.metaKey ||
        e.altKey
      )
        return;
      const target = e.target;
      if (
        target.closest?.(
          'textarea, select, [contenteditable="true"], input[type="checkbox"], summary, .lesson-help, .lesson-letters',
        )
      )
        return;
      if (e.key === " " && target.closest?.("input")) return;
      if (
        !run.intro &&
        !run.done &&
        !run.feedback &&
        step.kind !== "model" &&
        !canCheck
      )
        return;
      const button = nextButton.current;
      if (!button || button.disabled) return;
      e.preventDefault();
      button.click();
    };
    document.addEventListener("keydown", activatePrimary);
    return () => document.removeEventListener("keydown", activatePrimary);
  }, [active, run?.intro, run?.done, run?.feedback, step, canCheck]);
  const after =
    lesson && !run?.review
      ? lessons.includes(lesson)
        ? lessons[lessons.indexOf(lesson) + 1]
        : nextLesson
      : null;
  const wordSupport = isTyping && run?.help.includes("words");
  const historyIdentity = Object.entries(snapshot.courses)
    .filter(([key]) => key !== course.key)
    .map(
      ([key, value]) =>
        `${key}:${value.events.length}:${value.events.at(-1)?.id}`,
    )
    .join("|");
  const evidence = useMemo(
    () => runtime.learningEvidence(state),
    [runtime, state.events, historyIdentity],
  );

  const reviewCount = useMemo(
    () => runtime.reviewQueue(state).length,
    [runtime, state.events, historyIdentity],
  );
  return {
    reviewCount,
    state,
    setState,
    open,
    setOpen,
    storageError,
    run,
    lesson,
    step,
    nextLesson,
    focusLesson,
    active,
    sessionRef,
    input,
    title,
    nextButton,
    runtime,
    start,
    submit,
    choose,
    help,
    updateRun,
    letter,
    pickWord,
    isBank,
    isTyping,
    canCheck,
    after,
    wordSupport,
    evidence,
    reference,
    messages,
    lessons,
    advance,
  };
}
