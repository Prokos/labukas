# Practice design

Practice helps learners retrieve introduced Lithuanian and remember it later. The main course takes priority; use its shared teaching, exercise, grading and feedback contracts from the [product plan](product-learning-plan.md).

## Required behavior

- Maintain one Practice page with a clear next-session action and a useful explanation of each target’s needs. Fresh learners go to the course; unintroduced material does not fill the review queue.
- Prioritize recent unresolved difficulty, incomplete preparation and due recall. Reteach weak prerequisites. Ordinary teaching and built-in scaffolding must not create difficulty; requested hints and actual errors need separate records and responses.
- Let recent successful recall clear difficulty. Lifetime mistakes must not create permanent penalties.
- Mix a bounded set of targets. Selecting a word anchors a mixed batch, rather than launching an isolated repetition loop.
- Introduce or reteach meaning/forms before retrieval where needed. Draw meaningful distractors from taught language, not merely from the current batch.
- Separate repeated attempts with other material where possible. Use authored form/context variants; same-form sentence completion alone does not establish transfer.
- Stop after useful practice or bounded repair. Summaries use natural language such as “Done for now” and offer a useful next step. Do not replay an old queue when a new session should reflect current history.
- A one-target session cannot establish spaced mixed practice. Keep it short and direct the learner toward more course material.

Apply the same [feedback and interaction review cases](exercise-review-cases.md) as Course. A correct answer after help remains positive; schedule later unassisted retrieval internally.

Use the [shared assessment contract](answer-assessment.md) when integrating the first unit. A recognized word with a spelling slip preserves meaning recall and leaves spelling for later retrieval; it must not trigger meaning reteaching. Wrong forms need form repair. The authorized chapter 2 review build uses these dimensions in its shared Course/Practice runtime. The legacy boolean scheduler has not adopted them; migration remains required before replacing the original course in production.

## Existing mechanics to reconcile

The current implementation provides useful bounds:

| Mechanic | Current value |
| --- | --- |
| Batch | At most five encountered targets. |
| Session recall goal | Two unaided productive recalls per target. |
| Separation | Two other target turns between repeats where possible. |
| Difficulty recovery | Two independent successful recalls. |
| Retry limits | Three unsuccessful attempts or seven turns per target; 35 turns total. |
| Recall across days | At least two independent successes on different local dates, at least four hours apart. |

These are starting heuristics, not validated optimal thresholds. Preserve bounded sessions and meaningful spacing while adapting them to authored activities.

Older events combine hint use and wrong answers as unsuccessful unaided attempts. Do not infer a specific mistake from that history. The current session rule also resets recall goals after either event; split these cases when adopting the new evidence contract. A hint may require later independent retrieval without indicating confusion or needing full reteaching.

Practice evidence and course due dates currently serve different purposes. Reconcile their scheduling from actual later recall; avoid repeatedly selecting recently successful words just because the collection is small. Repeating Practice does not award a course pass.

## Content and evidence needed

- Explicit links among dictionary forms, contextual forms, grammatical roles and examples. String matching is insufficient for Lithuanian inflections.
- Separate evidence for meaning, spelling, form choice and use. Test and credit only the ability an exercise demonstrates.
- Vetted new-example prompts and targeted reteaching for recurring errors.
- Shared scheduling of later returns, preserving original IDs, events and course completion.

## Validation

Test selection, spacing, recovery, retry bounds, stopping, persistence and navigation alongside the shared UI cases. Evaluate next-day/later recall, new-example use, hint dependence and whether the learner understands what to do next. Session completion and immediate accuracy alone do not establish learning.

Research supports retrieval and spacing generally: [Karpicke and Roediger (2008)](https://doi.org/10.1126/science.1152408) and [Karpicke and Bauernschmidt (2011)](https://pubmed.ncbi.nlm.nih.gov/21574747/). It does not validate this app or its exact thresholds.
