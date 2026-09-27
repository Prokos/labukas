# Teaching experience audit — 17 September 2026

Reference findings about the chapter/class system. Use the [product plan](product-learning-plan.md) for implementation requirements and delivery order.

This audit inspected the executable curriculum, generated exercises, introduction and feedback rendering, progress storage, and selected sections of the source textbook. Counts below describe the curriculum at audit time. It is a teaching-design audit, not a complete linguistic review or an assessment of the learner's proficiency. The learner's actual saved progress was not accessed.

## What explains the sameness

The main path contains 226 classes and 1,663 scheduled sessions. Classes comprise 87 vocabulary, 90 pattern, 12 conversation, 27 reading, and 10 writing classes. There are 2,264 targets including optional material.

1. **The exercise selector recognizes broad content categories, but not the grammatical operation being learned.** `exerciseFor` in `src/engine.js` distinguishes vocabulary, pattern, conversation, reading, and writing. Within patterns, conjugation, possession, prepositions, and agreement largely receive the same treatment. A target such as `Mes gyvename centre` passes through gap choice, sentence ordering, gap typing, sentence ordering, gap typing, and whole-sentence typing as stages rise. `Jo vardas Tomas` and `Salotos su sūriu` follow that same sequence. Actual sessions select stages and adjust support; this is the available stage sequence, not six consecutive prompts in every session.

2. **Format changes often leave the mental task unchanged.** `sessionItems` repeats discovery targets across three rounds and guided targets across two. The learner repeatedly reconstructs the same authored answer. There are separately authored application contexts, so the course does introduce new sentences, but repeated success on a fixed sentence does not establish that the learner can apply its rule to a different example.

3. **Wrong options are often weak grammatical contrasts.** The generator draws from peer sentences and noun/pronoun reference forms. For example, a deterministic generation of `Mes ___ centre` offered `gyvename`, `bendrabutyje`, `gyvenate`, and `Jūs`; `Salotos su ___` offered `sūriu`, `be`, `sūrio`, and `Salotos`. These are possible generated sets, not fixed options every learner sees. Some options can be rejected without knowing the target inflection. A conjugation question should usually contrast plausible verb forms; an ingredient case question should contrast relevant noun forms.

4. **The explanations seldom demonstrate the specific operation.** The “worked example” screen displays the class rule plus an answer and translation. It does not explicitly show what changed, why, or which part stayed constant. The class rule may be repeated for several new targets. Hints remove an option, reveal letters, or supply the next word. The feedback UI supports `item.explanation`, but none of the 2,264 current items supplies it.

5. **Distinct experiences appear late.** The first 100 scheduled sessions are classified as vocabulary (60) or pattern (40). The first dedicated reading session is number 175. Earlier classes do contain phrases and application sentences; the point is that their interaction remains similar. Most reading situations then reuse the same passage and questions across the generic phase schedule.

6. **Broad class labels hide mixed learning needs.** “Describe a room precisely” combines spatial phrases with adjective agreement. Treating every item in that class as a spatial task would repeat the current architectural mistake. Activity choice needs explicit metadata for the target or a small target group, with a class default.

## What the source contributes beyond its inventory

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

## Compatibility hazards

- `src/content/assemble.js` derives many item IDs from Lithuanian/English strings and class IDs from title slugs. Copy edits can therefore change identity. Keep instructional copy separate and preserve stable references when changing content.
- Stage numbers affect support, retries and memory records. Replacing whole-sentence typing with a supported choice must not silently award the same independent-recall evidence.
- Historical `lessonPass` and answer events refer to scheduled steps and items. Replay representative old and partial histories, writing drafts and backup/sync data against versioned contracts when changing the course.

## Research basis

The [IES learning practice guide](https://ies.ed.gov/ncee/wwc/PracticeGuide/1) supports spacing, retrieval and combining worked examples with practice. A [beginning-German study](https://doi.org/10.1017/S014271642100014X) found an advantage for production training on grammatical gender, with comparable noun learning across groups. These findings motivate varied comprehension and production; they do not validate the proposed Lithuanian activities or a universal sequence.
