# Architecture

`main.jsx` mounts `App`. App owns navigation and selected chapter, and loads that chapter's definition plus declared dependencies. `CourseView` renders its overview and a `LessonShell`; `useCourseSession` connects exercise controls to the learning runtime and progress repository. Course and Practice use this same path.

## Content

Each chapter has one JSON definition. `compiler.js` validates exercises and resolves explicit `repeat` references. It does not generate teaching sequences. Lesson order, prerequisites, examples, accepted answers, alternatives and later returns are editorial content. `catalog.js` loads definitions for the browser; tests load the same JSON through the compiler.

## Learning

`session.js` owns pure transitions: start, answer, request help, match, advance and review. It records immutable events and carries draft input, exposure and the active exercise queue. `assessment.js` interprets task contracts through `answer-assessment.js`. `evidence.js` derives learning status from events. `review.js` selects and bounds practice. `support.js` owns shared help and repair policy. Language-specific canonical forms are in `lithuanian-policy.js` and the reference tables.

Exercise identity and target identity are different: many exercises can teach or test one target. Recognition, construction, form retrieval, word retrieval and writing are distinct evidence modes. UI code must not independently award mastery.

## Progress

`model.js` validates records, combines immutable events and serializes backups. `store.js` is the only application persistence interface. Components subscribe with `useSyncExternalStore`; they do not read browser storage directly. IndexedDB stores immutable events separately from session snapshots so typing does not rewrite the entire history.

Every course has events, completed lesson IDs, an active run and suspended runs. A run stores its complete exercise queue and lesson title. A saved draft can resume even when its lesson is absent from the loaded catalog. Content refresh only changes unengaged pending exercises with compatible answers; it preserves submitted responses, help, draft input and order.

Backup import and cloud sync combine events by ID, rejecting conflicting immutable records. Completion is recoverable from completion events. The most recently saved snapshot supplies the active run; other unfinished lessons remain suspended. Cross-tab notifications reload committed data. Device-record decoding is isolated in the progress model; it preserves recorded evidence without inferring new mastery.

Cloud uses owner-scoped `progress_events` and `course_states`. The snapshot RPC rejects stale writes by timestamp. Events upload before snapshots; retries are idempotent. Preferences stay local. Cloud failures are shown in Settings, and local writes continue.

## Verification boundaries

Unit tests verify contracts and evidence behavior. Browser checks exercise the actual controls at desktop and phone sizes. Neither establishes retention, natural spoken fluency, editorial quality or physical mobile keyboard behavior. Those require content review and learner observation.
