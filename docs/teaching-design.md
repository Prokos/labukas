# Teaching design for Labukas

## What was wrong

The first implementation confused a **topic introduction** with a **completed class**. Its 40 lessons visited each target once, so a learner who answered the recognition questions correctly moved to another subject. Harder exercise types existed but depended on a later optional practice encounter. The subsequent fix changed the difficulty ladder but did not schedule enough encounters. That was a course-design failure, not something the learner should compensate for by choosing a practice mode.

Several other problems followed: unrelated concepts were introduced together; every kind of material began the same way; same-session successes inflated review intervals; and a correct answer after a correction loop could look like independent retention.

## What the evidence supports—and what it does not

Duolingo describes its path as successive difficulty levels of a skill, interspersed with other skills, practice, and contextual activities. That is the useful comparison: **the main path contains the repetition**. It is not necessary to copy its exact number of screens, gamification, or exercise counts. See [Duolingo's path explanation](https://blog.duolingo.com/new-duolingo-home-screen-design/).

The [Learning Scientists' overview](https://www.learningscientists.org/blog/2016/8/18-1) identifies retrieval practice and spacing as especially well-supported learning strategies. It also describes concrete examples and interleaving. For this app, the design inference is to start with a manageable model, require retrieval, revisit the material later, and mix related distinctions once there is something to retrieve.

[Duolingo's spaced-repetition research](https://research.duolingo.com/papers/settles.acl16.pdf) models forgetting and learner performance, rather than treating all correct answers as equivalent. Labukas uses a transparent heuristic, not Duolingo's trained model. Its thresholds and intervals must be evaluated through actual use.

None of these sources establishes that every Lithuanian chapter needs exactly six classes, that every word needs five repetitions, or that 80% guarantees mastery. Counts below are an authored starting structure, based on the supplied curriculum and the small amount of material appropriate to one personal study session.

## Course structure

A **chapter** follows one LANGAS chapter. A **class** has a focused communicative or grammatical objective. A **lesson/session** is one short visit to that objective. Class completion and long-term retention are separate.

| Chapter                 | Main classes | Main sessions | Targets (including optional) | Reading situations | Writing |
| ----------------------- | -----------: | ------------: | ---------------------------: | -----------------: | ------: |
| 1. Hello, Lithuania!    |           27 |           193 |                          334 |                  2 |       1 |
| 2. At the café          |           34 |           227 |                          302 |                  3 |       1 |
| 3. Around the city      |           25 |           188 |                          248 |                  3 |       1 |
| 4. A place to call home |           21 |           145 |                          189 |                  3 |       1 |
| 5. Your free time       |           21 |           147 |                          188 |                  3 |       1 |
| 6. Work & study         |           22 |           201 |                          273 |                  3 |       1 |
| 7. The people you love  |           21 |           159 |                          205 |                  2 |       1 |
| 8. Whatever the weather |           18 |           143 |                          191 |                  2 |       1 |
| 9. Feeling well         |           18 |           130 |                          163 |                  3 |       1 |
| 10. Let’s celebrate     |           19 |           130 |                          171 |                  3 |       1 |

The bank contains **2,264 target entries**, across **226 main-path classes and 1,663 sessions**, plus **10 optional appendix classes and 67 sessions**. Entries include words, forms, sentences, reading questions and writing prompts, not distinct vocabulary lemmas. Sessions are scheduled visits generated from authored content, not individually authored lesson plans. See the [source coverage ledger](langas-coverage.md) for the chapter objectives and class-by-class source mapping. These counts establish breadth, not validated learning outcomes.

Most vocabulary and grammar classes have four kinds of visit. The number of sessions varies with its target count:

1. **Meet & use:** at most three new core targets in a session. Each is encountered in three rounds, with other targets between repetitions. Progress from meaning/model to supported use and a first short retrieval. Two discovery sessions are common; the ten-number class needs four.
2. **Build with support:** up to six targets, used in two rounds. Practice making the response, choosing forms, and resisting extra-word distractors. This visit happens before moving to a different class.
3. **Recall & contrast:** come back after a neighboring class. Retrieve the targets with less support, including full typing. Do not display the target answer list in the introduction. A hint or easier correction is useful teaching, but does not replace the required harder response.
4. **Use it in context:** return again after further intervening material. Vocabulary and grammar classes include dedicated sentence contexts. New contexts for previously completed classes have separate session IDs so old passes cannot skip them. New contexts are modeled before independent recall is required. This is controlled practice, not a claim that repeating a modeled sentence proves spontaneous conversation.

Finally, short **chapter checks** each sample two targets from up to four assessed classes, for at most eight targets. Retakes favor targets not previously tested and weaker targets. Writing workshops are self-reviewed separately. Earlier sessions must be completed first. It requires at least 80% first-attempt accuracy; correction-loop success cannot turn a failed check into a pass. Long-term review continues after the check.

The path orders visits approximately as:

`A meet/use → A guided → B meet/use → B guided → A recall → C meet/use → C guided → B recall → A application … → chapter check`

Intervening lessons provide a gap within a sitting; they are not a substitute for elapsed-time spacing. Due reviews are offered separately on the home page; Continue course always opens the next scheduled curriculum session. Up to two already-encountered targets are mixed into ordinary sessions even when the learner is studying continuously.

## Concrete example: the first café class

“Something delicious” now focuses on foods, not foods plus an unexplained dative construction. Preferences moved to “Say what you like.”

- Lesson 1: three food targets, nine planned responses. Meet their meanings, recognize them, then write the short words. Successfully clicking three meanings does not finish the lesson.
- Lesson 2: the remaining food target, with its own rounds and familiar review.
- Lesson 3: guided use of the set, including productive responses. Only then does the path introduce the drinks class.
- Lesson 4: return later for recall without an answer list.
- Lesson 5: simple food sentences plus retrieval of the core words.

The class is complete only after all five visits. It can still have items due for review.

## Different material needs different introductions

| Material                | Starting point                                         | Early action                                                        | Later evidence                                                        |
| ----------------------- | ------------------------------------------------------ | ------------------------------------------------------------------- | --------------------------------------------------------------------- |
| Concrete vocabulary     | Meaning plus a very small set of words                 | Lithuanian → English recognition, reverse recognition, short recall | Write the word and use it in later sentences                          |
| Grammatical patterns    | English explanation and a worked Lithuanian example    | Choose the missing form, build the sentence, retrieve the ending    | Distinguish related forms and produce the construction                |
| Conversational language | A situation and model phrase                           | Choose a suitable modeled reply, assemble it                        | Recall the phrase and combine it with earlier language                |
| Numbers and spelling    | Small explicit sets with separate practice             | Recognize and produce manageable chunks                             | Mixed recall after intervening work                                   |
| Reading situations      | An original dialogue, menu, notice or other short text | Answer comprehension questions with authored options                | Type short answers while retaining access to the text                 |
| Open writing            | A communicative brief and checklist                    | Write a personal response before seeing the model                   | Compare the submitted draft with the model and explicitly self-review |

Introductions should be concise. Do not show the whole chapter's grammar on every screen. Current model explanations are class-specific; the app still uses controlled prompts rather than a full branching-dialogue engine.

## Difficulty, correction, and stopping

Each task has a required support level. The learner's actual current level caps how difficult the next attempt is. If the planned task is harder than the learner is ready for, give support and return to the required level later in the session. Passing the easier repair does **not** complete the harder task.

Misses and hints lower the item's level. A session ends after at most the larger of 24 responses or its starting queue length plus six, if it would otherwise keep looping. An unfinished session does not earn a pass. Its answer history is preserved; returning rebuilds the session with support based on that history.

If more than a quarter of the targets were missed on their first meaningful attempt, the home page offers a short optional consolidation visit. This does not override the curriculum continuation button. The missed targets need two subsequent correct answers without hints. These are corrective practice, not evidence of long-term retention.

Typing tolerates punctuation, case, and omitted first-/second-person subject pronouns in supported sentence patterns. Lithuanian diacritics still matter. The answer checker is not a full syntax parser: model word order is used for sentence builders, and unrestricted valid paraphrases may need additional authored alternatives.

## Retention is not screen completion

Immediate correct responses advance the support ladder, but memory intervals only advance after at least four hours between qualifying correct encounters. An error resets the interval to one minute. The schedule then uses 4 hours, 1 day, 3 days, 7 days, 14 days, and 30 days. “Learned” additionally requires productive responses and spaced success; several recognition clicks in one sitting cannot earn it.

These intervals are initial heuristics. They should be tuned against observed delayed recall, rather than XP or the percentage of screens completed. No same-day course structure can demonstrate next-day retention by itself.

## Existing progress

Original item and class IDs remain stable, including words reassigned to a more coherent class. Historical chapter checks remain readable, but do not credit the expanded assessments. Submitted writing drafts sync as events without increasing vocabulary mastery. Answer history, XP, goals, and Drive merging remain intact. An old class completion gives credit for its first introduction session; it does not award the newly added guided, recall, application, or chapter-check work. The course follows the last studied chapter so returning users can deepen their current material.

## What remains to evaluate

The larger bank and scheduled returns fix identifiable structural defects. They do not by themselves prove teaching quality. In real use, look for:

- Can a learner produce the core words after completing the class, then again the next day?
- Do examples make case endings understandable, or does the learner memorize whole strings?
- Are first attempts on application examples successful without immediately revealing the answer?
- Are sessions tiring, or too short to establish the target skill?
- Does an accepted-answer gap unfairly penalize a valid Lithuanian response?

Expansion should add missing words and genuine situations, contrasting examples, and authored acceptable answers. Avoid increasing counts by mechanically cloning the same sentence. The expansion adds 27 reading situations and ten writing workshops alongside vocabulary and grammar families. Remaining evaluation includes native-speaker review of glosses and answer variants, testing transfer to unfamiliar examples, and measuring fatigue and delayed recall. Memory is still tracked per target; success with one construction does not establish mastery of an entire case. Open writing is self-assessed, not automatically grammar-graded.
