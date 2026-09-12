# Curriculum audit — 12 September 2026

This is the **pre-expansion audit**, retained as the baseline. The subsequent implementation and current counts are documented in the [LANGAS coverage ledger](langas-coverage.md) and [teaching design](teaching-design.md).

## Verdict and scope

The app follows the ten LANGAS chapter themes, but does not yet cover the full textbook or provide equivalent practice. Its scheduled progression is a useful foundation; content breadth, transfer practice, and assessment remain insufficient for calling it a strong, complete adaptation.

This audit compared the textbook's foreword and curriculum overview (printed pp. 7–10), chapter vocabulary and communicative objectives, and representative chapter exercises against the complete authored app bank and scheduling code. It is not an exhaustive lemma-by-lemma reconciliation, native-speaker validation, or study of learner outcomes. No reliable percentage of full content coverage can be given yet.

Source: user-provided `LANGAS.pdf`. Page references below are printed pages; PDF page numbers are one greater. App evidence: `src/curriculum.js`, `src/teaching-content.js`, and `src/engine.js`.

## What the counts actually mean

- 10 chapters, 65 classes, 345 scheduled sessions.
- 435 target entries (words, phrases, and fixed example sentences), not 435 distinct vocabulary lemmas.
- Sessions are generated from those entries through discovery, guided practice, recall, and application phases. They are not 345 separately authored lesson plans.
- 23 classes have no dedicated context entries. Their application visit uses their existing core targets again.
- Chapter checks always use the first and last target of each class; they do not rotate coverage or test previously unseen combinations.
- Only two entries have explicit alternative answers, in addition to the engine's limited subject-pronoun omission rule.

## Chapter coverage

All chapters have partial coverage. The table names representative gaps, not every missing word or exercise.

| Chapter / printed pages | App targets | Present                                                                                           | Material still missing or too narrow                                                                                                                                                                                                                          |
| ----------------------- | ----------: | ------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1 / 11–30               |          53 | Greetings, basic identity, origin/location, common present verbs, numbers 1–10, contact questions | Breadth of countries, nationalities/languages and personal information; full spelling/alphabet practice; reciprocal questions and answers. The letters class asks learners to compare vowel lengths but supplies no actual contrast pairs.                    |
| 2 / 31–62               |          55 | Some foods/drinks, preferences, ordering, with/without, a few prices                              | Teens, most tens, compound numbers, euros/cents; broader menu vocabulary; offering, accepting/refusing, asking which kind, and completing a café exchange. Printed p. 33 explicitly teaches the missing number system; pp. 57–58 use real price combinations. |
| 3 / 63–86               |          46 | Some city places, movement, transport, weekdays, a few meeting times                              | Much of the place/public-transport vocabulary; multi-step directions, transport interactions, invitations/refusals, and varied time expressions. The vocabulary list on p. 64 is much broader than the app bank.                                              |
| 4 / 87–108              |          40 | Basic furniture, location, floors, quantity, absence, a few rental/help phrases                   | Many room/furniture/household nouns and descriptive adjectives; fuller rental exchanges, broken appliances/plumber requests, host/guest responses. Compare vocabulary p. 88 and room-description task p. 99.                                                  |
| 5 / 109–132             |          44 | Hobbies, liking/negation, a small past/future set, basic ticket phrases                           | Event tickets and seat/row information; holiday/travel accounts and exchanges; more verb/person contrasts and independent use of tense patterns.                                                                                                              |
| 6 / 133–152             |          40 | Months, a few professions/studies, time prepositions, elementary dates                            | Wider professions/study vocabulary, date/ordinal range, varied schedules, reading and composing messages. Printed pp. 144–145 require varied transformations; p. 146 includes reading an email and writing 70–80 words.                                       |
| 7 / 153–176             |          39 | Core relatives, possession, age, a few descriptions/comparisons                                   | Family status and wider relations; plural-numeral range, fuller descriptions, question/answer exchanges and varied comparison patterns.                                                                                                                       |
| 8 / 177–194             |          41 | Basic weather, five colour names, a small clothing set, fit/size and demonstratives               | Much of the clothing/colour/weather vocabulary, materials and shopping details; broader agreement contrasts and complete shopping interactions. Compare p. 178.                                                                                               |
| 9 / 195–210             |          39 | Feeling well/unwell, several body parts, a few imperatives, appointment request                   | Illnesses, specialists, tests, medicine vocabulary and language for asking about instructions; fuller appointment/pharmacy exchanges; broader adverb/conjunction work. Compare pp. 196, 199, 204.                                                             |
| 10 / 211–234            |          38 | Birthday/Christmas/Easter wishes, invitations, limited vocative and hosting                       | Wider family/public holidays, customs and cultural vocabulary; understanding event notices and exchanging information about celebrations. Compare pp. 212 and 231.                                                                                            |

The requested omission of audio/speaking is intentional. However, absent reading passages, menus, signs, short message tasks, and text-based dialogues are not explained by that constraint. Original equivalents could teach these objectives without audio or reproducing the textbook's passages.

## Progression: strengths

- Discovery is limited to three new core targets and provides multiple supported encounters.
- Productive responses are scheduled in the main course, rather than left entirely to optional practice.
- Material returns after intervening classes, with less support.
- Vocabulary, grammatical patterns, and conversation have different initial exercise selection.
- Errors lower support difficulty; successful easier repairs cannot substitute for completing a harder required task.
- A retry cap prevents endless sessions, and unfinished sessions receive no pass.
- Immediate repetitions do not by themselves advance long-term review intervals.

These are implemented structural strengths. They do not establish effectiveness or textbook equivalence.

## Progression: weaknesses

1. **Reproduction outweighs transfer.** Most tasks ask for the same stored word or sentence in another format. Application contexts are also modeled, fixed answers. This can check recall of those answers but provides little evidence of applying a rule to a new combination.
2. **Return lessons are mechanically scheduled.** Every class uses the same phase generator. The amount and type of practice are not authored around the difficulty or scope of each objective. More phases do not fix an underdeveloped grammar explanation or missing content.
3. **Grammar knowledge is not modeled separately.** Records belong to item IDs. Skill tags group practice, but the engine does not diagnose a particular ending, construction, verb person, or shared lemma across sentences. A genitive mistake can resurface the sentence without producing a focused contrast lesson about its cause.
4. **Checks are predictable and incomplete.** Two fixed targets per class omit much of the bank and permit uneven knowledge to go unnoticed. An 80% threshold applies across the check, not to every essential chapter objective.
5. **Ordinary completion is not a mastery gate.** Outside checkpoints, finishing the correction queue awards a pass, even with poor first-attempt accuracy. Weak spots are offered for optional review and known items can appear inside later lessons. That is helpful, but it is not guaranteed later independent success before increasing complexity.
6. **Contrast exercises need deliberate distractors.** Extra builder words exist, but are drawn from peer sentences rather than consistently selected to distinguish a meaningful grammatical alternative. Recognition can sometimes be solved through unrelated vocabulary or implausible forms.
7. **Production checking is narrow.** With almost no authored alternatives, a valid paraphrase or word order can be marked wrong. Broadening production requires corresponding answer coverage.
8. **Explanations need linguistic review.** For example, the months introduction says month names are masculine while its own bank includes `liepa` (feminine). This is a concrete counterexample to the rule, not merely a missing exercise. Other rules and glosses have not received a complete linguistic validation.

## Recommended acceptance criteria for the next content pass

Do not choose a new lesson-count target first. Build a coverage ledger from each chapter's vocabulary, grammar, and communicative objectives; record which are taught, practised, assessed, deliberately excluded, or still missing. Distinguish a mention in an explanation from an assessed skill.

For each essential objective, author a short sequence containing:

1. A clear model and explanation with the necessary vocabulary introduced.
2. Supported use with relevant alternatives and enough varied examples to expose the pattern.
3. Retrieval after intervening work.
4. A new but controlled combination using known vocabulary, with appropriate accepted answers.
5. A meaningful text-based task such as a menu choice, dialogue completion, timetable question, short message, or situation response.
6. A later assessment that rotates examples and revisits weak objectives through scheduled curriculum work.

Keep Continue course truthful: any required consolidation should be an explicit course step with a stated objective, not an invisible redirect to generic practice.

Prioritise chapter 2 as an end-to-end reference because the existing number/menu gaps and the user's café experience expose the problem clearly. Then apply the coverage ledger to all ten chapters, strengthen checkpoint sampling and concept-level tracking, and review Lithuanian forms, English glosses, and accepted answers. These are recommended next changes; this audit does not implement them.
