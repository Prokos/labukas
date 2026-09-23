# Teaching experience audit — 17 September 2026

The main opportunity is to give different learning problems different teaching activities inside the existing course. Keep the current progression and completed work intact. Start with a few representative lessons and evaluate their feel before expanding.

This audit inspected the executable curriculum, generated exercises, introduction and feedback rendering, progress storage, and selected sections of LANGAS.pdf. Counts below come from importing the current curriculum. It is a teaching-design audit, not a complete linguistic review or an assessment of the learner's proficiency. The learner's actual saved progress was not accessed.

## What explains the sameness

The main path contains 226 classes and 1,663 scheduled sessions. Classes comprise 87 vocabulary, 90 pattern, 12 conversation, 27 reading, and 10 writing classes. There are 2,264 targets including optional material.

1. **The exercise selector recognizes broad content categories, but not the grammatical operation being learned.** `exerciseFor` in `src/engine.js` distinguishes vocabulary, pattern, conversation, reading, and writing. Within patterns, conjugation, possession, prepositions, and agreement largely receive the same treatment. A target such as `Mes gyvename centre` passes through gap choice, sentence ordering, gap typing, sentence ordering, gap typing, and whole-sentence typing as stages rise. `Jo vardas Tomas` and `Salotos su sūriu` follow that same sequence. Actual sessions select stages and adjust support; this is the available stage sequence, not six consecutive prompts in every session.

2. **Format changes often leave the mental task unchanged.** `sessionItems` repeats discovery targets across three rounds and guided targets across two. The learner repeatedly reconstructs the same authored answer. There are separately authored application contexts, so the course does introduce new sentences, but repeated success on a fixed sentence does not establish that the learner can apply its rule to a different example.

3. **Wrong options are often weak grammatical contrasts.** The generator draws from peer sentences and noun/pronoun reference forms. For example, a deterministic generation of `Mes ___ centre` offered `gyvename`, `bendrabutyje`, `gyvenate`, and `Jūs`; `Salotos su ___` offered `sūriu`, `be`, `sūrio`, and `Salotos`. These are possible generated sets, not fixed options every learner sees. Some options can be rejected without knowing the target inflection. A conjugation question should usually contrast plausible verb forms; an ingredient case question should contrast relevant noun forms.

4. **The explanations seldom demonstrate the specific operation.** The “worked example” screen displays the class rule plus an answer and translation. It does not explicitly show what changed, why, or which part stayed constant. The class rule may be repeated for several new targets. Hints remove an option, reveal letters, or supply the next word. The feedback UI supports `item.explanation`, but none of the 2,264 current items supplies it.

5. **Distinct experiences appear late.** The first 100 scheduled sessions are classified as vocabulary (60) or pattern (40). The first dedicated reading session is number 175. Earlier classes do contain phrases and application sentences; the point is that their interaction remains similar. Most reading situations then reuse the same passage and questions across the generic phase schedule.

6. **Broad class labels hide mixed learning needs.** “Describe a room precisely” combines spatial phrases with adjective agreement. Treating every item in that class as a spatial task would repeat the current architectural mistake. Activity choice needs explicit metadata for the target or a small target group, with a class default.

## What LANGAS contributes beyond its inventory

The foreword describes a communicative course intended for use with a teacher (printed p. 7 / PDF page 8). The app needs to supply some of the explanation and interaction that a teacher would normally provide.

Selected examples show useful variety: printed pp. 35–36 pair pronoun and verb-form tables with short exchanges; pp. 42–43 use pictured preferences to elicit sentences; pp. 103–105 combine room differences, form completion, adjective choices, and describing a picture for another person to identify. These activity structures can inspire original app activities while retaining the current targets.

## Match the activity to the learning problem

| Material | What the learner needs to work out | Proposed activity |
| --- | --- | --- |
| Concrete vocabulary | Link meaning, spelling, and use | Identify something on a small menu or room scene, retrieve its name, then use it in a familiar phrase. Use text and situations for abstract words. |
| Conjugation | Select a verb form for person and tense | Compare a small set of forms with endings highlighted; change the subject; produce the changed verb; later produce the whole response without support. |
| Personal and possessive pronouns | Track speaker, listener, referent, owner, or grammatical role | Use people and speech bubbles; shift who is speaking; choose who a pronoun refers to; produce the appropriate form. Teach possession, subject, and object uses as distinct problems. |
| Spatial prepositions | Understand a relationship and express its required noun form | Use a room or map. First interpret the relationship, then complete the phrase with the correct case. Provide equivalent keyboard/tap controls and text descriptions. |
| Other preposition uses | Understand a relation such as accompaniment, absence, or time | Use ingredient requests for `su`/`be`, or a timetable for temporal relations. A room diagram is not appropriate for every preposition. |
| Case and adjective agreement | Identify the trigger and change the affected form | Compare two otherwise similar phrases, mark the changed word, produce the form, then use the complete phrase. |
| Numbers, dates, and time | Interpret a quantity and express it appropriately | Read a price, clock, calendar, or ticket and answer a practical question. |
| Conversation | Choose a response that achieves an intention | Take a role in a short exchange with a concrete goal. Responses should affect the next turn. Use authored branches and accepted answers. |
| Reading and writing | Extract information or convey a message | Complete a small form from a message; choose an option using a notice; write a reply and compare it with a checklist. |

These are reusable teaching approaches, not a requirement for a different game on every screen. Keep navigation familiar. Vary the reasoning, context, and response the learner supplies.

## Three concrete pilots

**Conjugation: `c1-present-people`, “Present tense across people.”** Introduce the relevant forms together and mark the endings. Show a worked subject change that leads to an existing target, such as `Mes gyvename centre`. During supported work, ask for the changing verb and give plausible alternatives from the same verb. Explain a specific person mismatch. Retain independent whole-response recall where the existing task requires it. A compact form table should support practice and disappear for independent recall.

**Pronouns: `c1-possession`, “Whose name and address?”** Introduce people with names and clearly identify the current speaker. Use the same existing targets, including `Jo vardas Tomas` and `Jos vardas Rasa`, to make ownership and reference visible. Feedback should identify whose name is being discussed. Later examples should vary the referent and context without turning this into memorizing one portrait's position. Approved new transfer examples can initially be optional practice.

**Prepositions: `c2-with-without-forms`, “With and without ingredients.”** Use a simple order card for salad with or without cheese. Make the meaning of the request explicit, then contrast `sūriu` and `sūrio`, and finally retrieve the existing full phrase. Explain which preposition requires which case. A later spatial pilot can use “Describe a room precisely,” assigning its adjective items a separate agreement activity.

Each pilot should give its existing sessions a specific purpose: notice a difference, practise the choice, retrieve it later, and use it to accomplish something. Introductions and support can show intermediate reasoning without adding mandatory course nodes. Existing application targets can become dialogue turns or meaningful requests at their current positions.

Use one brief explanation for an identifiable error, followed by an opportunity to retry. For example: “The subject is mes, so this verb needs gyvename.” Only claim a particular diagnosis when the supplied answer supports it. Otherwise show the model and explain the relevant rule without guessing the learner's reasoning.

## Preserve progress by construction

The appropriate implementation boundary is teaching metadata and exercise presentation. Existing `lessonPass` events identify scheduled steps, and answer events identify items. Keep the same course/session order, IDs, target membership, completion requirements, review rules, and checkpoint rules. A completed session remains completed; improvements are available in future sessions or voluntary replay.

Two implementation details need particular care:

- `src/content/assemble.js` generates many item IDs from the Lithuanian and English strings; vocabulary class IDs also depend on title slugs. Editing those source strings casually can change identity. Add instructional copy, visual context, and form metadata separately under existing IDs.
- Stage numbers affect support, retries, and memory records. A supported selection or one-word gap must not be logged as independent whole-sentence recall merely because it replaced a stage-5 screen. Keep current scored endpoints in the first pilot; add demonstrations or supporting interactions without falsely crediting additional mastery. A genuinely different learning target needs its own explicit treatment, not silent reuse of an old item ID.

Validation before any future teaching change ships should compare old and new course definitions and replay representative progress histories, including more than 100 passed sessions, historical completions, partial work, and writing drafts. Assert identical passed sets, completion totals, next session, item records, and export/import/sync behavior for the same existing events. Existing backups should load without a migration or reset. Test a real exported backup locally if it becomes available; do not infer that the learner's personal history has already been checked.

## Priorities and evaluation

First implement the three pilots with focused explanations, plausible distractors, and meaningful visual or conversational context. Then try them with the learner before applying the patterns across the course. Extend vocabulary, numbers, and existing application sessions after that feedback. Preserve scheduled sessions while changing their teaching content and presentation within the compatibility contract.

Judge the pilots on whether they feel meaningfully different, whether mistakes become understandable, and whether the learner can handle a reviewed but previously unpractised example after a delay. Session speed and familiar-item accuracy alone would not establish improvement. Transfer checks can be optional and must not reopen completed lessons or change progression.

The evidence supports retaining retrieval and spaced returns while improving instruction. The [IES learning practice guide](https://ies.ed.gov/ncee/wwc/PracticeGuide/1) recommends spacing, active retrieval, and combining worked examples with practice. A [study of beginning German learners](https://doi.org/10.1017/S014271642100014X) found an advantage for production training on grammatical gender tasks, while noun learning was comparable across training groups. These findings support combining meaningful comprehension with production; they do not validate these proposed Lithuanian activities or prove one universal teaching sequence.

Verification at audit time: all 36 existing automated tests passed. Exercise generation and curriculum counts were inspected directly. No delayed learning experiment was performed.

## Implementation update

The three pilots now have a different teaching sequence within their existing sessions. The per-question worked-example cue was removed. Each discovery session opens with one concise comparison at class level. In the questions, conjugation begins by interpreting a verb form's person, possession begins with a situation requiring an owner form, and the ingredient lesson begins by connecting a noun form to `su` or `be`. The next round selects the relevant form; guided work writes that form and then the complete phrase. Recall and application retain their scheduled targets.

Each pilot target supplies only its focus form, plausible alternatives, and, for ownership, a short situation and a speaker switch. Shared functions generate recognition tasks and rule feedback for the three teaching families. This reduces the writing burden compared with an explanation paragraph for every target. It does not automatically make the other 223 classes pedagogically distinct; extending the approach will require additional family designs and targeted content checks.

No course step, target ID, or completion criterion was changed. Synthetic history containing 125 passed sessions still resolves to the next existing session. The [pilot screenshot gallery](teaching-pilots-preview.md) shows the current intro, discovery, form choice, full phrase, and feedback screens. These checks do not establish how the lessons feel to the learner or how well the material transfers after a delay.
