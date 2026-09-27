import { authoredHistory, validateAuthoredState } from "./authored-storage.js";
import React, {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useMemo,
} from "react";
import { createPortal } from "react-dom";
import {
  ArrowRight,
  Check,
  X,
  Lightbulb,
  BookOpen,
  Eye,
  ChevronRight,
  LockKeyhole,
  RotateCcw,
} from "lucide-react";
import LessonShell from "./LessonShell";
import Conversation from "./Conversation";
import TownMap from "./TownMap";
import { openingCourse, openingRuntime } from "./opening-content";
import { createCourseRuntime, referenceForTarget } from "./authored-course";
import "./opening-preview.css";

export default function OpeningPreview({
  onActiveChange = () => {},
  course = openingCourse,
  view = "course",
  onCourse = () => {},
}) {
  const {
    key: OPENING_KEY,
    version: OPENING_VERSION,
    lessons: openingLessons,
    reference: openingReference,
  } = course;
  const historyRef = useRef(null);
  if (historyRef.current === null)
    historyRef.current = authoredHistory(localStorage, course.key);
  const runtime = useMemo(
    () =>
      course === openingCourse
        ? openingRuntime
        : createCourseRuntime({
            ...course,
            historyEvents: () => historyRef.current,
          }),
    [course],
  );
  const {
    freshOpening,
    startOpening,
    answerOpening,
    advanceOpening,
    helpOpening,
  } = runtime;
  const [state, setState] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(OPENING_KEY));
      if (
        saved?.version === OPENING_VERSION &&
        Array.isArray(saved.events) &&
        Array.isArray(saved.completed) &&
        (!saved.run || Array.isArray(saved.run.queue))
      )
        return saved;
    } catch {}
    return freshOpening();
  });
  const [open, setOpen] = useState(() =>
      Boolean(state.run && !state.run.done && !state.run.paused),
    ),
    [storageError, setStorageError] = useState("");
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
      : [...openingLessons, ...(course.retiredLessons || [])].find(
          (l) => l.id === run?.lessonId,
        ),
    step = run?.queue[run.index];
  const nextLesson = openingLessons.find(
    (l) => !state.completed.includes(l.id),
  );
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
  useEffect(() => {
    if (!state.events.length) return;
    try {
      localStorage.setItem(
        OPENING_KEY,
        JSON.stringify({ ...state, savedAt: Date.now() }),
      );
    } catch {
      setStorageError(
        "Your browser couldn’t save this lesson. Keep this tab open to continue.",
      );
    }
  }, [state]);
  useEffect(() => {
    const reload = () => {
      historyRef.current = authoredHistory(localStorage, course.key);
      try {
        const saved = validateAuthoredState(
          JSON.parse(localStorage.getItem(OPENING_KEY)),
        );
        setState(saved);
        setOpen(false);
      } catch {
        setStorageError(
          "The imported course could not be opened. Your existing records have been kept.",
        );
      }
    };
    window.addEventListener("sakyk:authored-import", reload);
    return () => window.removeEventListener("sakyk:authored-import", reload);
  }, [OPENING_KEY]);
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
      const next = startOpening(s, id);
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
      setState((s) => advanceOpening(s));
    else setState((s) => answerOpening(s));
  }
  function help(kind) {
    setState((s) => helpOpening(s, kind));
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
  const reference = referenceForTarget(
    [...openingLessons, ...(course.retiredLessons || [])].flatMap(
      (l) => l.steps,
    ),
    openingReference,
    step?.target,
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
          'textarea, select, [contenteditable="true"], input[type="checkbox"], summary, .opening-help, .opening-letters',
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
      ? openingLessons.includes(lesson)
        ? openingLessons[openingLessons.indexOf(lesson) + 1]
        : nextLesson
      : null;
  const wordSupport = isTyping && run?.help.includes("words");
  const evidence = useMemo(
    () => runtime.learningEvidence(state),
    [runtime, state],
  );
  const letters = (
    <div className="opening-letters" aria-label="Lithuanian letters">
      {Array.from("ąčęėįšųūž").map((c) => (
        <button
          type="button"
          key={c}
          disabled={!!run?.feedback || wordSupport}
          onPointerDown={(e) => e.preventDefault()}
          onClick={() => letter(c)}
        >
          {c}
        </button>
      ))}
    </div>
  );
  const textInput = (
    <input
      id="opening-answer"
      ref={input}
      aria-label={
        step?.kind === "gap-type"
          ? "Missing Lithuanian word"
          : "Your answer in Lithuanian"
      }
      autoComplete="off"
      autoCapitalize="none"
      spellCheck={false}
      readOnly={!!run?.feedback}
      value={run?.answer || ""}
      style={
        step?.kind === "gap-type"
          ? { "--answer-ch": Math.max(8, [...(run?.answer || "")].length + 2) }
          : undefined
      }
      onChange={(e) => updateRun({ answer: e.target.value })}
      placeholder={step?.kind === "gap-type" ? "…" : "Write here…"}
    />
  );
  return (
    <>
      {view === "practice" ? (
        <>
          <section className="opening-next">
            <div>
              <span className="eyebrow">CHAPTER PRACTICE</span>
              <h1>Bring it back</h1>
              <p>
                {runtime.reviewQueue(state).length
                  ? "Return to earlier words and patterns. Recent difficulties come first."
                  : "Finish some chapter exercises, then return here to practise."}
              </p>
            </div>
            {runtime.reviewQueue(state).length > 0 && (
              <button
                className="button"
                onClick={() => {
                  setState((s) => runtime.startReview(s));
                  setOpen(true);
                }}
              >
                Start practice <ArrowRight size={18} />
              </button>
            )}
          </section>
          {evidence.length > 0 && (
            <section
              className="authored-progress"
              aria-label="Learning progress"
            >
              <h2>Words and patterns</h2>
              <p>
                {evidence.filter((r) => r.familiarity === 4).length} remembered
                later · {evidence.filter((r) => r.isDue).length} ready for
                another visit
              </p>
              <p className="authored-progress-note">
                Answers with help are practice. Remembered later requires
                unaided recall on separate days.
              </p>
              <div className="authored-progress-list">
                {evidence.map((row) => (
                  <div key={row.key}>
                    <span>
                      <strong
                        lang={
                          row.lastProduction ||
                          row.target.startsWith("c2-word:")
                            ? "lt"
                            : undefined
                        }
                      >
                        {row.target.startsWith("c2-word:")
                          ? row.target.slice(8)
                          : row.lastProduction?.answers[0] ||
                            row.task.answers[0]}
                      </strong>
                      <small>
                        {row.lastProduction?.source?.includes("___")
                          ? row.lastProduction.source.replace(
                              "___",
                              row.lastProduction.answers[0],
                            )
                          : row.lastProduction?.source || row.task.source}
                      </small>
                    </span>
                    <span>
                      {row.needsSpelling
                        ? "Check spelling"
                        : row.needsSupport
                          ? "Try without help"
                          : row.label}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </>
      ) : (
        <>
          <div className="page-heading opening-course-heading">
            <span className="eyebrow">{course.eyebrow}</span>
            <h1>{course.title}</h1>
            <p>{course.description}</p>
          </div>
          <div className="opening-course-meta">
            <span className="pill">Course preview</span>
            <span>
              {
                openingLessons.filter((l) => state.completed.includes(l.id))
                  .length
              }{" "}
              of {openingLessons.length} lessons complete
            </span>
          </div>
          {course.allowDirectEntry && (
            <p className="opening-course-note">
              Continue in order, or choose a lesson to work on a particular
              topic.{" "}
              {course.prerequisites ||
                "Chapter 1 greetings, personal pronouns and numbers 1–10 are assumed."}
            </p>
          )}
          {course.wordbook && (
            <details className="chapter-wordbook">
              <summary>Chapter vocabulary</summary>
              <p>
                Look up words from the chapter. Looking them up does not mark
                them as learned.
              </p>
              <dl>
                {course.wordbook.map(([lt, en]) => (
                  <div key={lt}>
                    <dt lang="lt">{lt}</dt>
                    <dd>{en}</dd>
                  </div>
                ))}
              </dl>
            </details>
          )}
          {storageError && (
            <p role="alert" className="opening-storage">
              {storageError}
            </p>
          )}
          <section
            className="opening-next"
            aria-label="Continue the opening course"
          >
            <div>
              <span className="eyebrow">
                {focusLesson ? "YOUR NEXT STEP" : course.eyebrow}
              </span>
              <h2>{focusLesson?.title || course.completeTitle}</h2>
              <p>
                {focusLesson?.goal ||
                  "Revisit a lesson whenever you want to practise."}
              </p>
            </div>
            {focusLesson && (
              <button className="button" onClick={() => start(focusLesson.id)}>
                {run && !run.done
                  ? "Resume lesson"
                  : state.completed.length
                    ? "Continue course"
                    : "Start lesson"}
                <ArrowRight size={18} />
              </button>
            )}
          </section>
          <div className="opening-lesson-list">
            {openingLessons.map((l, i) => {
              const complete = state.completed.includes(l.id),
                unlocked =
                  course.allowDirectEntry ||
                  i === 0 ||
                  state.completed.includes(openingLessons[i - 1].id);
              return (
                <section
                  className={`opening-lesson ${complete ? "completed" : ""}`}
                  key={l.id}
                >
                  <div className="opening-lesson-number">
                    {complete ? <Check size={22} /> : i + 1}
                  </div>
                  <div className="opening-lesson-info">
                    <h2>{l.title}</h2>
                    <p>{l.goal}</p>
                  </div>
                  <button
                    className="opening-lesson-start"
                    disabled={!unlocked}
                    onClick={() => start(l.id)}
                    aria-label={`${complete ? "Review" : "Start"} ${l.title}`}
                  >
                    {!unlocked ? (
                      <LockKeyhole size={18} />
                    ) : complete ? (
                      <RotateCcw size={19} />
                    ) : (
                      <ChevronRight size={23} />
                    )}
                  </button>
                </section>
              );
            })}
          </div>
        </>
      )}
      {active &&
        createPortal(
          <LessonShell
            sessionRef={sessionRef}
            inputRef={input}
            className="opening-preview"
            title={lesson.title}
            headerLabel={
              run.review
                ? "Chapter practice"
                : openingLessons.includes(lesson)
                  ? `Lesson ${openingLessons.indexOf(lesson) + 1} of ${openingLessons.length} · ${lesson.title}`
                  : lesson.title
            }
            count={
              run.done
                ? "Complete"
                : run.intro
                  ? ""
                  : `${run.index + 1} / ${run.queue.length}`
            }
            percent={run.done ? 100 : (run.index / run.queue.length) * 100}
            onClose={() => {
              updateRun({ paused: true });
              setOpen(false);
            }}
            data-session-mode="opening-preview"
            data-lesson={lesson.id}
          >
            {run.intro ? (
              <div className="session-content lesson-intro opening-welcome">
                <div className="intro-body">
                  <span className="eyebrow">
                    {run.review
                      ? "PRACTICE"
                      : openingLessons.includes(lesson)
                        ? `LESSON ${openingLessons.indexOf(lesson) + 1}`
                        : "RESUME LESSON"}
                  </span>
                  <h1 ref={title} tabIndex={-1}>
                    {lesson.title}
                  </h1>
                  <p>{lesson.goal}</p>
                </div>
                <div className="intro-footer">
                  <button
                    className="button"
                    ref={nextButton}
                    onClick={() => setState((s) => advanceOpening(s))}
                  >
                    Let’s begin
                    <ArrowRight size={18} />
                  </button>
                </div>
              </div>
            ) : run.done ? (
              <div className="session-content summary opening-complete">
                <div className="opening-success-mark">
                  <Check size={34} />
                </div>
                <h1 ref={title} tabIndex={-1}>
                  {run.review ? "Done for now." : "Lesson complete."}
                </h1>
                <p>{lesson.title}</p>
                {after && (
                  <div className="opening-up-next">
                    <small>UP NEXT</small>
                    <h2>{after.title}</h2>
                    <p>{after.goal}</p>
                  </div>
                )}
                <div className="summary-actions">
                  {after ? (
                    <>
                      <button
                        className="button"
                        ref={nextButton}
                        onClick={() => start(after.id)}
                      >
                        Next lesson
                        <ArrowRight size={18} />
                      </button>
                      <button
                        className="text-link"
                        onClick={() => setOpen(false)}
                      >
                        Back to course
                      </button>
                    </>
                  ) : course.number && course.number < 10 && !run.review ? (
                    <>
                      <a
                        className="button"
                        ref={nextButton}
                        href={`?preview=chapter${course.number + 1}`}
                      >
                        Next chapter <ArrowRight size={18} />
                      </a>
                      <button
                        className="text-link"
                        onClick={() => setOpen(false)}
                      >
                        Back to course
                      </button>
                    </>
                  ) : (
                    <button
                      className="button"
                      ref={nextButton}
                      onClick={() => {
                        setOpen(false);
                        onCourse();
                      }}
                    >
                      Back to course
                      <ArrowRight size={18} />
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <form
                className="session-content exercise opening-exercise"
                data-step={step.id}
                data-kind={step.kind}
                onSubmit={submit}
              >
                <div className="exercise-body opening-task">
                  {step.kind === "model" ? (
                    <>
                      <h1
                        className="opening-model-title"
                        ref={title}
                        tabIndex={-1}
                      >
                        {step.title}
                      </h1>
                      <div className="opening-model-pairs">
                        {step.pairs.map(([lt, en], i) => (
                          <div key={lt}>
                            <p lang="lt">
                              {step.focus
                                ? lt.split(step.focus[i]).map((part, n) => (
                                    <React.Fragment key={n}>
                                      {n > 0 && <mark>{step.focus[i]}</mark>}
                                      {part}
                                    </React.Fragment>
                                  ))
                                : lt}
                            </p>
                            <span>{en}</span>
                          </div>
                        ))}
                      </div>
                      <p className="opening-model-note">{step.note}</p>
                    </>
                  ) : (
                    <>
                      {step.teaching && (
                        <div className="opening-repair-cue">
                          <Lightbulb size={18} />
                          <p>{step.teaching}</p>
                        </div>
                      )}
                      {step.menu && (
                        <section
                          className="chapter-menu"
                          aria-label={step.menuTitle || "Menu"}
                        >
                          <h2 lang="lt">{step.menuTitle || "Valgiaraštis"}</h2>
                          <table>
                            <tbody>
                              {step.menu.map(([dish, price]) => (
                                <tr key={dish}>
                                  <th scope="row" lang="lt">
                                    {dish}
                                  </th>
                                  <td lang="lt">{price}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </section>
                      )}
                      {step.passage && (
                        <div className="chapter-passage">
                          <p lang="lt">{step.passage}</p>
                          {step.glossary && (
                            <dl>
                              {step.glossary.map(([lt, en]) => (
                                <div key={lt}>
                                  <dt lang="lt">{lt}</dt>
                                  <dd>{en}</dd>
                                </div>
                              ))}
                            </dl>
                          )}
                        </div>
                      )}
                      {step.map && <TownMap map={step.map} />}
                      {step.thread ? (
                        <>
                          <h1
                            className="opening-chat-title"
                            ref={title}
                            tabIndex={-1}
                          >
                            {step.speaker}
                          </h1>
                          <Conversation
                            key={step.id}
                            messages={messages}
                            live
                            answered={!!run.feedback}
                            onHistoryOpen={() => help("conversation-history")}
                          />
                        </>
                      ) : step.messages ? (
                        <Conversation messages={messages} />
                      ) : null}
                      {!step.thread && (
                        <h1
                          className={`opening-source ${step.messages ? "opening-reading-question" : ""}`}
                          ref={title}
                          tabIndex={-1}
                        >
                          {["gap", "gap-type"].includes(step.kind) ? (
                            <span className="opening-gap" lang="lt">
                              {step.source.split("___")[0]}
                              {step.kind === "gap-type" && !wordSupport ? (
                                textInput
                              ) : (
                                <span
                                  className={`opening-gap-slot ${run.answer ? "filled" : ""}`}
                                >
                                  {run.answer || "…"}
                                </span>
                              )}
                              {step.source.split("___")[1]}
                            </span>
                          ) : (
                            step.source
                          )}
                        </h1>
                      )}
                      {step.translation && (
                        <p className="opening-translation">
                          {step.translation}
                        </p>
                      )}
                      {!(step.thread && run.feedback) && (
                        <p
                          className="opening-instruction"
                          id="opening-instruction"
                        >
                          {step.instruction}
                        </p>
                      )}
                      {step.kind === "writing" && (
                        <div className="chapter-writing">
                          <label htmlFor="opening-writing">Your message</label>
                          <textarea
                            id="opening-writing"
                            ref={input}
                            value={run.answer}
                            maxLength={3000}
                            lang="lt"
                            readOnly={!!run.feedback}
                            onChange={(e) =>
                              updateRun({ answer: e.target.value, checked: [] })
                            }
                          />
                          {run.reviewing && (
                            <div className="chapter-self-review">
                              <h2>Review your message</h2>
                              <p>
                                This is one example. Your own message can be
                                different.
                              </p>
                              <p lang="lt" className="chapter-writing-example">
                                {step.sample}
                              </p>
                              {step.checklist.map((text, i) => (
                                <label key={text}>
                                  <input
                                    type="checkbox"
                                    disabled={!!run.feedback}
                                    checked={run.checked?.includes(i) || false}
                                    onChange={() =>
                                      updateRun({
                                        checked: run.checked?.includes(i)
                                          ? run.checked.filter((n) => n !== i)
                                          : [...(run.checked || []), i],
                                      })
                                    }
                                  />
                                  {text}
                                </label>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                      {step.options && !(step.thread && run.feedback) && (
                        <div
                          className="opening-options"
                          role="group"
                          aria-labelledby="opening-instruction"
                        >
                          {step.options.map((option, i) => (
                            <button
                              type="button"
                              key={option}
                              disabled={!!run.feedback}
                              className={
                                run.answer === option
                                  ? `selected ${run.feedback?.status || ""}`
                                  : ""
                              }
                              aria-pressed={run.answer === option}
                              onClick={() => choose(option)}
                            >
                              <span
                                className="opening-option-index"
                                aria-hidden="true"
                              >
                                {i + 1}
                              </span>
                              <span>{option}</span>
                              {run.answer === option &&
                                run.feedback &&
                                (run.feedback.status === "correct" ? (
                                  <Check size={19} />
                                ) : (
                                  <X size={19} />
                                ))}
                            </button>
                          ))}
                        </div>
                      )}
                      {isBank && !(step.thread && run.feedback) && (
                        <div className="opening-bank">
                          <div
                            className="opening-built"
                            aria-label="Your sentence"
                            aria-live="polite"
                          >
                            {run.selected.length ? (
                              run.selected.map((i) => (
                                <button
                                  type="button"
                                  disabled={!!run.feedback}
                                  aria-label={`Remove ${step.words[i]}`}
                                  key={i}
                                  onClick={() => pickWord(i)}
                                >
                                  {step.words[i]}
                                  <X size={14} />
                                </button>
                              ))
                            ) : (
                              <span>Choose words below</span>
                            )}
                          </div>
                          <div className="opening-tiles">
                            {step.words.map((word, i) => (
                              <button
                                type="button"
                                key={i}
                                disabled={
                                  !!run.feedback || run.selected.includes(i)
                                }
                                onClick={() => pickWord(i)}
                              >
                                {word}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                      {isTyping && (
                        <div className="opening-write">
                          {!wordSupport && (
                            <>
                              {step.kind === "type" && textInput}
                              {letters}
                            </>
                          )}
                          {!run.feedback &&
                            (wordSupport ? (
                              <div className="opening-support-words">
                                {step.words.map((w) => (
                                  <button
                                    type="button"
                                    key={w}
                                    className={
                                      run.answer === w ? "selected" : ""
                                    }
                                    onClick={() => choose(w)}
                                  >
                                    {w}
                                  </button>
                                ))}
                              </div>
                            ) : (
                              <button
                                className="opening-use-words"
                                type="button"
                                onClick={() => help("words")}
                              >
                                Use words instead
                              </button>
                            ))}
                        </div>
                      )}
                      {step.kind === "match" && (
                        <>
                          <div className="opening-match">
                            <div aria-label="Lithuanian words">
                              {step.pairs.map(([lt], i) => (
                                <button
                                  key={lt}
                                  type="button"
                                  disabled={
                                    run.matched.includes(i) || !!run.feedback
                                  }
                                  className={
                                    run.matched.includes(i)
                                      ? "matched"
                                      : run.pending === i
                                        ? "selected"
                                        : ""
                                  }
                                  onClick={() =>
                                    setState((s) =>
                                      runtime.selectPair(s, "left", i),
                                    )
                                  }
                                >
                                  {lt}
                                  {run.matched.includes(i) && (
                                    <Check size={18} />
                                  )}
                                </button>
                              ))}
                            </div>
                            <div aria-label="English meanings">
                              {(
                                step.pairOrder ||
                                [...step.pairs.keys()]
                                  .slice(-1)
                                  .concat([...step.pairs.keys()].slice(0, -1))
                              ).map((i) => (
                                <button
                                  key={i}
                                  type="button"
                                  disabled={
                                    run.matched.includes(i) || !!run.feedback
                                  }
                                  className={
                                    run.matched.includes(i)
                                      ? "matched"
                                      : run.pendingRight === i
                                        ? "selected"
                                        : ""
                                  }
                                  onClick={() =>
                                    setState((s) =>
                                      runtime.selectPair(s, "right", i),
                                    )
                                  }
                                >
                                  {step.pairs[i][1]}
                                  {run.matched.includes(i) && (
                                    <Check size={18} />
                                  )}
                                </button>
                              ))}
                            </div>
                          </div>
                          {run.pairError && (
                            <p role="status" className="opening-pair-error">
                              {run.pairError}
                            </p>
                          )}
                        </>
                      )}
                      {step.kind === "edit" && (
                        <div className="opening-edit">
                          <div aria-label="Sentence to fix">
                            {step.tokens.map((token, i) => (
                              <button
                                type="button"
                                key={i}
                                disabled={!!run.feedback}
                                aria-pressed={run.editIndex === i}
                                className={
                                  run.editIndex === i ? "selected" : ""
                                }
                                onClick={() =>
                                  updateRun({ editIndex: i, answer: "" })
                                }
                              >
                                {run.editIndex === i && run.answer
                                  ? run.answer
                                  : token}
                              </button>
                            ))}
                          </div>
                          {run.editIndex !== null && (
                            <div
                              className="opening-replacements"
                              aria-label="Replacement words"
                            >
                              <span>Replace with</span>
                              {step.replacements[run.editIndex].map((w) => (
                                <button
                                  type="button"
                                  key={w}
                                  disabled={!!run.feedback}
                                  onClick={() => choose(w)}
                                >
                                  {w}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                      {!run.feedback && (
                        <div className="opening-help">
                          <div className="opening-help-actions">
                            <button
                              type="button"
                              aria-expanded={run.help.includes("hint")}
                              onClick={() => help("hint")}
                            >
                              <Lightbulb size={16} />
                              Hint
                            </button>
                            {reference.length > 0 && (
                              <button
                                type="button"
                                aria-expanded={run.help.includes("reference")}
                                onClick={() => help("reference")}
                              >
                                <BookOpen size={16} />
                                Reference
                              </button>
                            )}
                            <button
                              type="button"
                              aria-expanded={run.help.includes("reveal")}
                              onClick={() => help("reveal")}
                            >
                              <Eye size={16} />
                              Show answer
                            </button>
                          </div>
                          {run.help.includes("hint") && (
                            <p className="opening-hint">{step.hint}</p>
                          )}
                          {run.help.includes("reference") && (
                            <dl className="opening-reference">
                              {reference.map((row) => (
                                <div key={`${row.lt}:${row.en}`}>
                                  <dt lang="lt">{row.lt}</dt>
                                  <dd>{row.en}</dd>
                                </div>
                              ))}
                            </dl>
                          )}
                          {run.help.includes("reveal") && (
                            <p className="opening-hint">
                              {step.kind === "match" ? (
                                "The matching pairs are shown."
                              ) : (
                                <>
                                  {step.kind === "writing"
                                    ? "Example:"
                                    : "Answer:"}{" "}
                                  <strong>
                                    {step.sample || step.answers[0]}
                                  </strong>
                                </>
                              )}
                            </p>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>
                <div className="answer-footer opening-actions">
                  {run.feedback && (
                    <div
                      role="status"
                      className={`opening-feedback ${run.feedback.status}`}
                    >
                      <strong>
                        {run.feedback.status === "correct" ? (
                          <Check size={20} />
                        ) : run.feedback.status === "incorrect" ? (
                          <X size={20} />
                        ) : null}
                        {run.feedback.message}
                      </strong>
                      {run.feedback.detail && <p>{run.feedback.detail}</p>}
                    </div>
                  )}
                  <button
                    ref={nextButton}
                    className="button"
                    type="submit"
                    disabled={
                      step.kind !== "model" && !run.feedback && !canCheck
                    }
                  >
                    {run.feedback || step.kind === "model"
                      ? "Continue"
                      : step.kind === "writing"
                        ? run.reviewing
                          ? "Save my writing"
                          : "Review my writing"
                        : "Check answer"}
                    <ArrowRight size={18} />
                  </button>
                </div>
              </form>
            )}
          </LessonShell>,
          document.body,
        )}
    </>
  );
}
