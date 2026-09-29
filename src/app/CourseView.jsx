import { useCourseSession } from "./useCourseSession.js";
import ExercisePanel from "./ExercisePanel.jsx";
import LessonComplete from "./LessonComplete.jsx";
import LessonIntro from "./LessonIntro.jsx";

import { createPortal } from "react-dom";
import {
  ArrowRight,
  Check,
  ChevronRight,
  LockKeyhole,
  RotateCcw,
} from "lucide-react";
import LessonShell from "../components/LessonShell.jsx";
export default function CourseView({
  onActiveChange = () => {},
  course,
  view = "course",
  onCourse = () => {},
}) {
  const session = useCourseSession({ course, onActiveChange });
  const {
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
  } = session;
  const letters = (
    <div className="lesson-letters" aria-label="Lithuanian letters">
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
      id="lesson-answer"
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
  const ui = { ...session, textInput, letters, onCourse, course };
  return (
    <>
      {view === "practice" ? (
        <>
          <section className="lesson-next">
            <div>
              <span className="eyebrow">CHAPTER PRACTICE</span>
              <h1>Bring it back</h1>
              <p>
                {session.reviewCount
                  ? "Return to earlier words and patterns. Recent difficulties come first."
                  : evidence.length
                    ? "You’re up to date. Missed words and due reviews will appear here."
                    : "Finish some chapter exercises, then return here to practise."}
              </p>
            </div>
            {session.reviewCount > 0 && (
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
              className="learning-progress"
              aria-label="Learning progress"
            >
              <h2>Words and patterns</h2>
              <p>
                {evidence.filter((r) => r.familiarity === 4).length} remembered
                later · {evidence.filter((r) => r.isDue).length} ready for
                another visit
              </p>
              <p className="learning-progress-note">
                Answers with help are practice. Remembered later requires
                unaided recall on separate days.
              </p>
              <div className="learning-progress-list">
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
          <div className="page-heading lesson-course-heading">
            <span className="eyebrow">{course.eyebrow}</span>
            <h1>{course.title}</h1>
            <p>{course.description}</p>
          </div>
          <div className="lesson-course-meta">
            <span className="pill">Chapter {course.number}</span>
            <span>
              {lessons.filter((l) => state.completed.includes(l.id)).length} of{" "}
              {lessons.length} lessons complete
            </span>
          </div>
          {course.allowDirectEntry && (
            <p className="lesson-course-note">
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
            <p role="alert" className="lesson-storage">
              {storageError}
            </p>
          )}
          <section className="lesson-next" aria-label="Continue the course">
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
          <div className="lesson-lesson-list">
            {lessons.map((l, i) => {
              const complete = state.completed.includes(l.id),
                unlocked =
                  course.allowDirectEntry ||
                  i === 0 ||
                  state.completed.includes(lessons[i - 1].id);
              return (
                <section
                  className={`lesson-lesson ${complete ? "completed" : ""}`}
                  key={l.id}
                >
                  <div className="lesson-lesson-number">
                    {complete ? <Check size={22} /> : i + 1}
                  </div>
                  <div className="lesson-lesson-info">
                    <h2>{l.title}</h2>
                    <p>{l.goal}</p>
                  </div>
                  <button
                    className="lesson-lesson-start"
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
            className="lesson-player"
            title={lesson.title}
            headerLabel={
              run.review
                ? "Chapter practice"
                : lessons.includes(lesson)
                  ? `Lesson ${lessons.indexOf(lesson) + 1} of ${lessons.length} · ${lesson.title}`
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
            data-session-mode="lesson-player"
            data-lesson={lesson.id}
          >
            {run.intro ? (
              <LessonIntro {...ui} />
            ) : run.done ? (
              <LessonComplete {...ui} />
            ) : (
              <ExercisePanel {...ui} />
            )}
          </LessonShell>,
          document.body,
        )}
    </>
  );
}
