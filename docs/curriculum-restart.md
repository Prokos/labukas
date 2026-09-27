# Curriculum implementation handoff

Read these before coding:

1. [Product learning plan](product-learning-plan.md) — scope, requirements and delivery order.
2. [Exercise review cases](exercise-review-cases.md) — concrete UI and feedback checks.
3. [Duolingo comparison](duolingo-curriculum-comparison.md) — evidence from the supplied course.
4. [Speech and proficiency boundaries](speech-and-proficiency-plan.md) — deferred work and claim limits.
5. [Practice design](practice-design.md) — supporting review behavior.

**Current authorized scope (26 September 2026):** the user said “continue and work on rest of curriculum.” This supersedes the earlier chapter-2-only review gate. Continue in this checkout and preserve local changes. Chapters 1 and 3–10 now have a playable internal review draft alongside chapter 2. See [remaining curriculum](remaining-curriculum.md) for coverage, verification and limits. Expansion is authorized; production migration and learning efficacy are not established by that authorization.

The original Stage A instruction was to build the playable opening sequence before expansion. It remains available at `/?preview=opening`; chapter 2 is at `/?preview=chapter2`.

## Development constraints

- The original `tests/teaching-pilots.test.js` annotation failure is now reconciled: generated pilot targets carry their authored `.teaching` metadata and the exercise engine uses it. Tests remain unchanged and pass. This fixes the incomplete pipeline; old pilot screenshots alone still do not establish teaching quality.
- Test on an isolated browser profile or a fresh preview origin, such as `npm run dev -- --port 5174 --strictPort`, without cloud sign-in. The existing validator cannot read `learningRun`, `learningExposure`, `learningAnswer` and `learningComplete` records from earlier previews and may load empty progress. Preserve a raw export before migrating real learner history.
