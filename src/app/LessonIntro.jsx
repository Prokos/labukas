import { ArrowRight } from "lucide-react";

export default function LessonIntro({
  run,
  title,
  setState,
  nextButton,
  lesson,
  lessons,
  advance,
}) {
  return (
    <div className="session-content lesson-intro lesson-welcome">
      <div className="intro-body">
        <span className="eyebrow">
          {run.review
            ? "PRACTICE"
            : lessons.includes(lesson)
              ? `LESSON ${lessons.indexOf(lesson) + 1}`
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
          onClick={() => setState((s) => advance(s))}
        >
          Let’s begin
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}
