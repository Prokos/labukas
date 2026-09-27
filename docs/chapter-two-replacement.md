# Chapter 2 replacement — review build

The user authorized a full chapter 2 replacement after reviewing the opening sequence. This supersedes the original instruction to stop after Stage A, but does not authorize expanding other chapters before this review.

Open `/?preview=chapter2`. The existing course and its saved history remain available. This is a playable text course, with chapter Practice, rather than an interaction sampler. All lessons can be opened directly for review; the intended learning order is shown on the course page.

## Scope and coverage

The source remains the supplied textbook, chapter 2, printed pages 31–62. Its name is not learner-facing. Adaptations use original exercise wording and text interactions; listening and speaking are deferred.

The old chapter contained 34 classes, 227 scheduled sessions, 302 content items and 134 distinct core vocabulary entries. These are different units of measurement. The replacement has 53 lessons, 102 teaching screens and 893 answer/self-review screens (995 screens total), including 221 scheduled later returns. It actively teaches and retrieves 143 lexical targets: all 134 previous entries plus nine source-supported additions. None counts as covered solely because it appears in the wordbook.

The initial 28-lesson draft did not actively teach the full old vocabulary inventory. Its reference list did not close that gap. The current coverage check requires a model, a productive retrieval and a later return after at least one intervening complete lesson for every inventory word.

[Machine-readable coverage](evidence/chapter-two/coverage.json) maps the old inventory to the new path. Nonlexical mappings show the retained objective, not an assertion that every old sentence or every inflected form is independently tested.

The chapter introduces small groups, enables a drink order in lesson 2, and subsequently teaches preferences/person changes, plurals, eating/drinking/wanting, adjective agreement, requests, ingredients, with/without, objects and negation, quantities, questions, prices/payment, menu reading and short writing. Broader vocabulary is inserted near relevant tasks. Learners are assumed to know chapter 1 greetings, personal pronouns and numbers 1–10.

## Assessment and recall

Course and chapter Practice use the same authored runtime and rich answer assessment. Recognition, construction, independent word/form retrieval, spelling, requested support, visible corrections and self-reviewed writing remain distinguishable events.

- Case and punctuation do not create errors. Selected lexical tasks accept omitted diacritics as a spelling issue. Grammar tasks remain strict; explicit wrong-form contrasts override spelling tolerance.
- A visible answer, hint, reference, word-bank fallback or supported repair cannot earn independent recall. Correcting an error with the answer visible is followed by an unaided attempt in Practice.
- Recognition alone cannot reach “Recalled unaided.” “Remembered later” requires two independent successes across different local dates at least four hours apart, with two recent independent successes. These thresholds share the original course's mastery policy.
- Practice selects at most five encountered targets, prioritizes unresolved meaning/form errors, spelling, help dependence and due recall. It aims for two independent productive successes, with two other target turns between repeats when possible. Bounds remain three wrong attempts or seven turns per target, and 35 total turns. A single-target batch has a smaller goal and cannot establish mixed spacing.
- Later exact retrieval clears spelling/support needs; two independent successes resolve a meaning/form difficulty. Historical mistakes are not permanent penalties.
- Lesson completion means finishing the sequence. It is not a proficiency or retention certificate. Writing is saved and self-reviewed, never automatically graded as mastery.

These are explicit scheduling heuristics, not empirically validated optimal intervals. Required course returns are separated by learning tasks; Practice supplies calendar-based returns. A learner who rushes the whole path in one day has not demonstrated later retention.

## Storage and integration boundary

The chapter uses `sakyk.authored.chapter-2.v1` and preserves suspended lessons, drafts, help, answers, ordering and conversation state across reload. Opening-sequence records and original course records are not rewritten. Mastery rules are shared with the original engine; their histories are **not merged or automatically transferred**. Passing an old class is not silently converted into independent recall of a new task.

This review build's authored records remain local to the browser. As of 26 September, local backup/import includes authored records and suspended sessions. Cloud sync still does not include them. Production replacement requires additive validation/export/sync and a reviewed migration, with raw-history preservation. Do not represent this review build as a completed production migration.

## Verification

Commands:

- `npm test`
- `npm run build`
- `npm run content:chapter2`
- `npm run test:chapter2:browser`
- `npm run test:interactions:browser`
- `node scripts/chapter-two-audit-check.mjs`

Browser commands accept `APP_URL` and `PLAYWRIGHT_CHROMIUM_EXECUTABLE`. They use isolated local profiles and never sign in to a real cloud account. The full chapter walkthrough checks all lessons at desktop and phone dimensions, reload, writing, incorrect case forms, revealed answers, Practice, old-history preservation and horizontal overflow. Interaction checks reproduce number shortcuts, Enter/Space Check and Continue, right-first matching, and full inline answers. A reduced viewport checks action visibility; it is not a physical iOS/Android keyboard test.

See the separate [quality audit](chapter-two-quality-audit.md) for the distinction between implementation evidence, teaching coverage and likely learning outcomes.

Final verification on 25 September 2026: 65 unit tests passed; production build passed (Vite reports a large-bundle warning). Desktop and phone walkthroughs each traversed all 53 lessons and 984 screens before the final source-audit additions. A targeted follow-up exercised all 11 added screens, including their later returns, at both widths; the runtime sequence test traverses all 995 final screens. Both payment variants, chapter Practice, the corrected phone mastery layout, keyboard shortcuts, right-first matching and full inline answers passed. The opening sequence and its offline restoration also passed. This describes the actual checks rather than implying one full browser run of the final 995-screen revision.
