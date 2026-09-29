import { ArrowRight, Check } from "lucide-react";

export default function LessonComplete({
  run,
  title,
  nextButton,
  lesson,
  after,
  start,
  setOpen,
  onCourse,
  course,
  evidence,
}) {
  return (
    <div className="session-content summary lesson-complete">
      <div className="lesson-success-mark">
        <Check size={34} />
      </div>
      <h1 ref={title} tabIndex={-1}>
        {run.review ? "Done for now." : "Lesson complete."}
      </h1>
      <p>{lesson.title}</p>
      {evidence.some((row) => row.needsTarget || row.needsVerification) && (
        <p>Words you missed will return in upcoming lessons and Practice.</p>
      )}
      {after && (
        <div className="lesson-up-next">
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
            <button className="text-link" onClick={() => setOpen(false)}>
              Back to course
            </button>
          </>
        ) : course.number && course.number < 10 && !run.review ? (
          <>
            <a
              className="button"
              ref={nextButton}
              href={`?chapter=${course.number + 1}`}
            >
              Next chapter <ArrowRight size={18} />
            </a>
            <button className="text-link" onClick={() => setOpen(false)}>
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
  );
}
