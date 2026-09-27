# Remaining curriculum review — 26 September 2026

**The curriculum is not finished or quality-approved.** The earlier all-chapter expansion is a playable inventory conversion. Passing software checks did not establish its pacing, preparation, natural language or transfer. The previous “moderate” quality confidence for the whole expansion was too generous and is withdrawn.

Substantive revisions are recorded in [the chapter 3 teaching audit](chapter-three-quality-audit.md) and [the chapter 4 teaching audit](chapter-four-quality-audit.md). Their functional routes prepare meeting arrangements and rental enquiries before wider vocabulary lists, with explicit grammar contrasts and later combinations. The remaining scaffold is being reviewed rather than automatically accepted because it covers source IDs. [Chapter 5 source review](chapter-five-quality-audit.md) is next.

| Scope | Current status |
| --- | --- |
| Chapter 1 opening | Previously authored; wider chapter still a draft |
| Chapter 2 | More developed replacement; internal audit available, no measured learning-effectiveness claim |
| Chapter 3 | Substantive teaching revision verified; wider scaffold and learning efficacy remain unapproved |
| Chapter 4 | Functional teaching revision verified on desktop/phone; dedicated audit records remaining limits |
| Chapters 5–10 | Playable drafts; substantive review in progress, starting with chapter 5 |

Open `/?preview=chapter3`, or use the chapter selector. Retired draft lessons disappear from the normal path but existing unfinished queues and historical events remain available. Old completion does not complete the newly authored lessons.

The rest of this document describes the earlier conversion and its limitations, not a quality acceptance decision.

## What changed in the teaching

- Vocabulary models contain at most three new entries. Recognition and matching precede retrieval. Multiword forms can be built with tiles; generated free typing is limited to three words or a focused gap. There are no copying lessons.
- Grammar uses translated examples with the changing form highlighted, supported construction or focused choices, then gap retrieval. Competing forms for focused choices come from canonical paradigms and must already have appeared in teaching; no invented endings or unfamiliar word-bank distractors.
- Grammar begins after the first small vocabulary groups. A supported conversation appears early in each chapter. Wider vocabulary continues between grammar lessons, and its applications follow the relevant word groups.
- Bounded productive targets receive two required later course returns, each separated by at least one complete lesson. These are retrieval, not claims of novel transfer. Earlier-chapter targets return near the beginning of chapters 3–10. Chapter 3 uses an explicitly chosen café bridge and chapter 4 retrieves language for arranging a viewing; later chapters still use the draft selection pending review.
- Each new chapter has a separately authored mixed grammar check (three or four changed contexts), a form-repair exercise, practical reading and self-reviewed writing. Reading dialogues use the conversation layout. Open writing receives no automatic correctness or mastery score.
- Supplementary teaching covers day periods, counting with ten, plural companions, exam marks, shoe sizes, material agreement, negative symptoms, conditions/reasons, polite requests and holiday greetings.

The exact content is in `src/course-chapter-plans.js`, `src/course-supplements.js` and the source-linked item inventory. `src/course-authoring.js` contains shared scaffolding and return scheduling; it does not invent Lithuanian inflections or interpolate dictionary English into sentences. This is a systematic conversion plus authored functional tasks, not a claim that every lesson has been independently designed by an educator.

## Coverage and verification

[Coverage counts](evidence/remaining-curriculum/coverage.json) and the [source ledger](evidence/remaining-curriculum/source-ledger.json) are generated with `npm run content:remaining`. Optional country/language extensions remain in the original course/reference; they are not silently counted as completed replacement lessons. The required inventory check excludes those optional extensions and checks actual model text, not just ledger entries. Explicitly replaced items may be taught inside a complete sentence; those ledger rows name the replacement model, and tests verify both the expression and practice for that model.

Run `npm run content:remaining -- --contracts` to export every exact model, question, answer, hint, correction and return link as `docs/evidence/remaining-curriculum/lesson-contracts.json`. This large generated file is optional; it is not needed by the app.

Unit checks execute every new lesson to completion, verify source coverage, preparation order, two-return spacing, response contracts and bounded typing. They test rich assessment and cross-chapter later-day evidence, backup/merge preservation, and the negative case that completing a chapter on one day never establishes later-day mastery.

Browser checks cover the beginning, conversation, reading, mixed check, repair and writing of each new chapter at 1440px and 390px, including reload between conversation turns and next-chapter links. They are representative browser coverage, not a full traversal of every rendered screen. The separate interaction regression covers number keys, Enter/Space, matching from either side, long gap inputs and spelling in Course/Practice. Phone viewport testing does not establish physical soft-keyboard behavior on every device.

Verification completed on 26 September: **88 unit tests passed**, production build passed, and **1,180 screens** were exercised in the representative desktop/phone walkthrough with zero page errors. [Browser results](evidence/remaining-curriculum/browser-checks.json) record the exact sampled lessons. [Persistence results](evidence/remaining-curriculum/persistence-browser-checks.json) verify wrong-answer conversation translations and a real backup download/import round trip, including paused feedback and original evidence. The shared interaction regressions also passed at both widths. The build retains the existing large-bundle warning.

## Progress and assessment

New chapters use the same Course/Practice runtime as chapter 2. Help, reveal, a visible correction and assisted repairs do not earn independent recall. Recognition, construction, spelling and exact retrieval remain separate. Later-day mastery requires the shared date/time thresholds, not merely two scheduled repetitions.

Canonical forms from reference tables and content now inform the shared diacritic policy. New vocabulary inherits spelling support without word allowlists. Known competing forms remain errors. See [assessment contract](answer-assessment.md) for the bounded analyser’s limits.

Cross-chapter returns retain the earlier target/form IDs and read earlier authored evidence without duplicating or rewriting it. Local backups include the original profile, authored events, drafts and suspended lessons. Import validates all incoming course states, unions immutable events and completion, and preserves other unfinished lessons. Conflicting immutable events cause an error rather than silently replacing evidence.

**Still a review build:** cloud sync and the original dashboard’s aggregate statistics are not migrated to authored progress. Keep local backups. The original course continues to use its strict compatibility grading. Do not claim whole-app migration is complete or publish this as a finished replacement without resolving those boundaries.

## Critical quality audit

This is an internal audit conducted separately from the implementation checks, not an independent teacher review or learner study.

The review found and fixed vocabulary applications appearing before their groups were finished, polite greetings lost when substituting the opening, and source grammar gaps in later chapters. It also found that a coverage ledger alone could claim teaching that was absent; verification now compares original required expressions with actual model text. Equal-timestamp answer ordering was corrected so a later exact response clears the corresponding spelling need.

Confidence in the unreviewed chapters is **low for teaching quality**; their source inventory and software execution alone do not establish adequate learning. The new chapters preserve breadth and provide actual retrieval opportunities, but much of their vocabulary/form practice uses a shared scaffold. Repeated wording can encourage item-specific memory. Three or four changed-context checks per chapter sample only part of the grammar; they do not demonstrate command of every pattern. Optional wider vocabulary is still accessed through the original course. Source-based checking is not equivalent to qualified Lithuanian review.

No claim is made about speaking, listening, A2 proficiency or a measured retention rate. A useful learner review should include later-day unaided retrieval, reasonable alternative answers, new combinations, and whether the small lessons feel repetitive. Passing software checks establishes that the experience runs and records evidence conservatively; it does not establish that enough language has been retained.
