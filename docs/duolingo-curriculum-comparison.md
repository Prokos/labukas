# Main-course comparison: Sakyk and the supplied Duolingo Spanish curriculum

Research snapshot: 23 September 2026. Use alongside the [product plan](product-learning-plan.md); audio/speech recommendations below are deferred. The archive exposes course structure and linked teaching content, not the complete exercise bank or grading rules; it cannot establish that Duolingo never uses situational prompts.

## Evidence and how to read the comparison

The reference is the exact supplied [esfen286.7z archive](https://duolingodata.com/json/esfen286.7z), whose extracted JSON hash is `a53dc611e6904584596e4f262eb440efd6871f6cab6fc676fedd787f3a50730a`. It is Spanish for English speakers. The archive entry has a June 2024 timestamp. A similarly named live web page is not necessarily the same version.

This audit:

- Decodes the ordered nodes, objectives, skill references, grammar insertions, story modes and session counts of **all 286 learning units**, plus the refresh unit.
- Retrieves and inventories **all 286 linked guidebooks, 151 skill explanations, eight section grammar resources and eight CEFR resources**. These are 453 successful resource references, some sharing content.
- Closely reads the first 16 guidebooks, all eight section grammar summaries, and guidebooks at units 26, 36, 51, 58, 65, 66, 72, 96, 113, 124, 152, 153, 168, 215, 233, 253 and 286. This supports comparisons of introductions, recurring topics and advanced demands. Schema inventory is exhaustive; close-reading of every sentence is not claimed.
- Traces all **226 main Sakyk classes and 1,663 scheduled sessions**, including the actual questions produced by the exercise generator. Optional classes are included in the class export but excluded from main-course counts.

Evidence labels below distinguish **archive** (exact path data), **linked content** (actual guidebook/explanation payloads), **published design** (Duolingo's documented exercise behavior), and **local execution** (our current code). The archive does not contain the normal-lesson challenge bank. Consequently, its exact question frequencies, accepted-answer sets and per-user exercise sequence cannot be reconstructed. This does not prevent inspecting its curriculum or comparing documented question families.

Inspectable exports:

- [Every Duolingo unit, objective and ordered node sequence](evidence/curriculum-comparison/duolingo-esfen286-units.csv).
- [Every Sakyk class and its position](evidence/curriculum-comparison/sakyk-course-classes.csv).
- [Every Sakyk session and generated question types](evidence/curriculum-comparison/sakyk-course-sessions.csv).
- [Computed comparison and representative exercises](evidence/curriculum-comparison/course-structure-comparison.json).
- [All retrieved resource URLs, hashes and structural features](evidence/curriculum-comparison/duolingo-resource-manifest.json).

## 1. The curriculum progression, rather than just its size

### Duolingo's full section progression

The section labels below are metadata, not an independent proficiency assessment. Grammar descriptions summarize the linked section resources; unit examples come from the exact path and guidebooks.

| Section | Global units | Label in archive | Progression visible in the content                                                                                                                                                                         |
| ------- | ------------ | ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1       | 1–8          | Intro            | Basic sentences, greetings, travel, food orders, family, clothes, school, origins. Present forms, gender/articles, address and adjective agreement support these interactions.                             |
| 2       | 9–34         | A1, part 1       | Expand those situations into schedules, work, emotions, routines, preferences and home. Demonstratives, possessives and the two Spanish “be” verbs become explicit contrasts.                              |
| 3       | 35–62        | A1, part 2       | Abilities, plans, groceries, requests, chores and past experiences. Object pronouns, reflexives and liking constructions receive attention; past-tense work appears toward the end.                        |
| 4       | 63–114       | A2, part 1       | Childhood, arranging meetings, health, stories, work and trips. Past-event/background contrasts, pronoun combinations, commands and purpose/cause/location prepositions expand what a learner can express. |
| 5       | 115–164      | B1, part 1       | Opinions, advice, warnings, business, news and intentions. Familiar settings now require explanations, wishes and uncertainty; subjunctive teaching becomes explicit.                                      |
| 6       | 165–214      | B1, part 3       | Returns, complaints, agreement, doubts, emergencies, gratitude, consolation and apologies. Conditional/hypothetical language, inference and impersonal statements support increasingly social purposes.    |
| 7       | 215–250      | B2, part 1       | Permission, workplace projects, politics, parenthood, paperwork, repairs and tact. Section notes include aspectual constructions, regional variation and question/relative-word spelling contrasts.        |
| 8       | 251–286      | B2, part 3       | Justification, negotiation, consensus, deductions, caveats and connected accounts. Section notes address clause relationships, emphasis, adjective placement/meaning and deductions about past events.     |

The archive has 572 regular skill nodes: each of 286 regular skill IDs occurs at crown indices 0 and 1. It also has **37 grammar nodes**, inserted within functional units. Examples: present tense in unit 6, agreement in 14, object pronouns in 51, past tense in 58, commands in 103 and subjunctive in 154. Those insertion points are not necessarily first exposure to a form: the guidebooks already use forms before a dedicated grammar node consolidates them.

This is a recurring curriculum with increasing demands. It is not simply a long list of topics covered once.

### The opening is a useful comparison in its own right

| Unit | Functional focus in the supplied path | What the actual guidebook adds                                                            |
| ---- | ------------------------------------- | ----------------------------------------------------------------------------------------- |
| 1    | Basic sentences                       | Eating/drinking examples; noun gender and a small set of “be” forms.                      |
| 2    | Greetings                             | Greeting/name exchanges and vowel-sound examples.                                         |
| 3    | Getting around                        | Taxi, ticket and hotel needs; location versus descriptive “is.”                           |
| 4    | Ordering food/drink                   | A table, drink and food request; with/without ingredients; noun relationships using `de`. |
| 5    | Family                                | Having relatives/pets, questions and the distinction between “you” and “your.”            |
| 6    | Clothes                               | Requests with colours; adjective placement; a focused present-tense table.                |
| 7    | School                                | Study/read/write needs, negation and infinitives after wanting/needing.                   |
| 8    | Origins                               | Asking where someone is from; nationality agreement and naming oneself.                   |
| 9    | Social greetings again                | Friendly/formal address and how someone feels.                                            |
| 10   | Travel again                          | Possessions and needs, with person contrasts in common verbs.                             |
| 11   | Schedules                             | Days and asking when an event happens.                                                    |
| 12   | Personal life                         | Where someone works/lives/studies; another sound contrast.                                |
| 13   | Other people's lives                  | Jobs and gendered forms.                                                                  |
| 14   | College                               | Facilities, small numbers and demonstrative agreement.                                    |
| 15   | Family again                          | Names, children and ages.                                                                 |
| 16   | Office work                           | Messages, people at work, plurals and contextual possessives.                             |

Not every ordering decision should transfer to Lithuanian. Spanish articles and `ser/estar` do not have direct Lithuanian counterparts. The transferable design decision is to revisit useful situations while adding language, rather than require exhaustive vocabulary and paradigms before using them.

### What the current Sakyk path actually does

| Chapter              | Main classes | Scheduled sessions | Core targets | First dedicated reading / writing: global session |
| -------------------- | -----------: | ------------------ | -----------: | ------------------------------------------------- |
| Hello, Lithuania!    |           27 | 1–193              |          201 | 175 / 183                                         |
| At the café          |           34 | 194–420            |          241 | 396 / 408                                         |
| Around the city      |           25 | 421–608            |          206 | 586 / 599                                         |
| A place to call home |           21 | 609–753            |          154 | 732 / 745                                         |
| Your free time       |           21 | 754–900            |          154 | 879 / 892                                         |
| Work & study         |           22 | 901–1101           |          237 | 1079 / 1092                                       |
| The people you love  |           21 | 1102–1260          |          167 | 1243 / 1252                                       |
| Whatever the weather |           18 | 1261–1403          |          161 | 1386 / 1395                                       |
| Feeling well         |           18 | 1404–1533          |          135 | 1512 / 1525                                       |
| Let's celebrate      |           19 | 1534–1663          |          141 | 1642 / 1655                                       |

Core targets include phrases, forms and questions; they are not counts of unique dictionary words. These session positions are the default full route, not elapsed time or a claim that a learner cannot jump ahead.

There is useful scaffolding already: new sets contain at most three targets, the next class interrupts recall, later application is scheduled, and earlier material can be injected into sessions. The problem is the **macro sequence**. Expansion adds substantial lexical inventories before important functions, and situations generally wait until the end of the chapter. Small batches do not correct that delay.

Examples from local execution:

- Sessions 8–15 introduce and guide 15 people/possession targets. “A little about you” starts at 18.
- Five mandatory country/city classes and three language classes begin at sessions 123–170, before the first dedicated reading at 175. Ten additional geography/language classes are already optional; the mandatory core is still extensive.
- The café chapter starts at 194. It passes through meat/fish, dairy, vegetable/fruit inventories, flavours, preparation, signs and traditions before “I would like…” at **326**. The ordering-form class begins at 336, the menu at 396, and the café exchange at **400**.
- Directions/movement contains 23 core entries; professions contains 29. Date ordinals contain 28 and month forms 24. These are split into small sessions, but impose long topic blocks.
- Chapter checks start at 187, 412, 603, and so on—near chapter ends. They sample known targets, not held-out demonstrations of each communicative goal.

Isolated request sentences can appear earlier as context examples. These positions locate the dedicated classes and situations; they do not claim that the learner has never encountered any wording for an order before session 326.

## 2. How an actual Duolingo unit is assembled

In **unit 4**, the archive's exact order is:

1. Restaurant skill, crown 0 — 5 sessions.
2. Story reading: _Good Morning_ — 1.
3. Restaurant skill, crown 1 — 5.
4. Earlier-skill practice, referencing greetings and travel — 2.
5. Story reading: _A Date_ — 1.
6. Reward chest.
7. Current-unit practice, referencing Restaurant — 2.
8. Story reading: _One Thing_ — 1.
9. Unit review, referencing Restaurant — 1.

Those are **18 declared instructional sessions**, not 18 questions. The stories are separate comprehension activities; their presence does not mean each story tests the restaurant objective.

Unit 6 adds a grammar node and the first radio node among its regular learning, previous-skill practice, current-unit practice, stories and unit review. Unit 8 includes the listening-mode return of the first story originally read in unit 4. Across the learning path, 333 listening story appearances have an earlier reading appearance; their unit gaps range from 4 to 32. That is observable reuse with a changed mode, not proof of an optimal delay.

The first reading story occurs at declared instructional session **41**, the first radio at **90**, excluding chests. Our first dedicated reading is at 175. Both positions count declared sessions, but session duration and exercise density differ, so they are not a learning-speed ratio.

The earlier-skill practice nodes contain candidate skill lists. In later units these can cover a broad span; we cannot infer that every referenced skill is tested in every visit. Current-unit practice and the final unit review have separately declared scopes. Our course has recall/application visits and dynamically added earlier questions, but lacks a similarly explicit unit plan combining new learning, comprehension, cumulative review and a goal assessment.

## 3. Question types: what they test and what we currently support

The exact archive identifies lesson modes, not the full normal-lesson question payloads. The following matrix uses the linked content for teaching blocks and primary Duolingo documentation for normal exercise families. It does **not** assume every family appears in every unit or in this snapshot at a known frequency.

| Learning task                          | Duolingo evidence                                                                                         | Current Sakyk behavior                                                                          | Required change                                                                                                               |
| -------------------------------------- | --------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Recognize a word's meaning             | Published matching and translation exercises [D1, D2]                                                     | Text choice and bilingual matching.                                                             | Keep, but pair unfamiliar words with a useful model and meaningful distractors.                                               |
| Retrieve a word/sentence in writing    | Published translation/typing progression [D3]                                                             | Substantial support: canonical-answer typing, limited alternatives.                             | Expand reviewed valid responses; vary examples while retaining the target concept.                                            |
| Build a sentence                       | Documented Spanish word bank with distractors [D1]                                                        | Word ordering, sometimes with two extra tokens.                                                 | Keep as support; canonical order is not evidence that other Lithuanian orders are ungrammatical.                              |
| Choose or supply a grammatical form    | Documented targeted blank/suffix contrasts [D1]; actual repair questions in previously sampled smart tips | Gaps exist, but selected by a fixed item cloze and numeric stage; distractors can be unrelated. | Annotate the contrast and provide plausible reviewed alternatives.                                                            |
| Distinguish similar sounds             | Documented Spanish audio-choice contrast [D1]                                                             | No audio exercise. “Letters that change a word” is text-based.                                  | Add reviewed recordings and sound-to-form discrimination; preserve a text-accessible route without claiming listening credit. |
| Recover words from speech              | Published audio word-bank example [D3]                                                                    | No dictation or audio word selection.                                                           | Add short audio-to-word/phrase tasks using already introduced language.                                                       |
| Understand a passage                   | Published passage comprehension [D1, D2]                                                                  | 27 authored passages with three questions each; choice then typing.                             | Bring short passages forward, vary questions, and test meaning without requiring incidental exact wording.                    |
| Follow spoken meaning                  | Radio nodes in archive; documented audio matching, comprehension and word selection [D4]                  | No listening comprehension.                                                                     | Add short spoken exchanges and gist/detail questions to the main units.                                                       |
| Choose a suitable conversational reply | Published response-selection example [D3]                                                                 | Classes labelled “conversation” primarily use translation/order/typing of stored phrases.       | Add turn context, speaker intent and plausible but inappropriate replies.                                                     |
| Follow a short story over turns        | Story reading/listening nodes in archive; published narrated dialogue description [D3]                    | A passage stays visible; no staged dialogue/story interaction.                                  | Support speaker turns and comprehension decisions; modest everyday scenes are sufficient.                                     |
| Speak a phrase or response             | Published speech tasks [D1, D3]                                                                           | No recording, rehearsal or speech assessment.                                                   | Start with optional listen/repeat/record-and-compare; keep automated pronunciation scoring a separate project.                |
| Compose a personal message             | Exact free-writing frequency is not established by the archive                                            | Ten saved, self-reviewed writing tasks, one per chapter.                                        | Preserve this strength; add smaller earlier responses and explicit criteria before the long workshop.                         |

**Our actual generated mix:** 12,633 planned exercise slots: 5,700 typing, 3,218 choice, 2,059 ordering, 1,372 cloze, 274 matching, and 10 open writing. These use empty history with intended stages unlocked, excluding dynamic review, mistakes and retries; one matching board counts as one slot. Of those slots, 12,002 (95.0%) are translation/form tasks, 621 are reading questions and 10 are writing. They are not observed learner analytics, nor comparable to unknown Duolingo question frequencies.

The typical pattern with a cloze runs through choice → ordering → cloze → ordering → cloze → full typing of the **same target**. A reading target changes from choice to typing but keeps the same passage, question and expected answer. A conversation label does not create a conversational decision. The activity's purpose needs to be authored explicitly; changing the input control alone is insufficient.

Primary exercise sources:

- **D1:** [Duolingo's explanation of curriculum, content, exercise creation and personalization](https://blog.duolingo.com/how-duolingo-experts-work-with-ai/). The Spanish examples document targeted blanks, word banks, sound contrasts and form selection. This is published design evidence, not a dump of our reference course's questions.
- **D2:** [Reading exercise examples](https://blog.duolingo.com/covering-all-the-bases-duolingos-approach-to-reading-skills/), including matching, missing words and passage response.
- **D3:** [Official product walkthrough](https://blog.duolingo.com/duolingo-101-how-to-learn-a-language-on-duolingo/), including recognition-to-production progression, audio word banks, spoken response selection and stories. This live documentation can include behavior newer than the archive.
- **D4:** [Radio exercise examples](https://blog.duolingo.com/duoradio-listening-practice/), including audio matching, comprehension checks and selecting heard words. The page also describes reducing native-language support as difficulty increases.

## 4. Topic revisits add capabilities, not just repetitions

The following comparison uses the **actual linked guidebook content**, not only topic titles.

| Reference sequence                                         | Added demand across visits                                                                                                                                               | Our matching material and gap                                                                                                                                                                              |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Restaurants: units 4 → 26 → 66 → 153                       | Simple requests and ingredients → polite/group orders → ordering/serving verbs and requesting the bill → recounting a meal, choices and dissatisfaction in past contexts | Most café content sits in chapter 2. Break it into an early usable exchange and later returns with new grammar and intentions.                                                                             |
| Family: units 5 → 15 → 27 → 97                             | The first guide introduces relatives/pets; the next adds names/ages. Further family units recur later in the path.                                                       | Core family content largely waits for chapter 7, starting at session 1102. A small family introduction can appear much earlier; comparisons and extended-family vocabulary can remain later.               |
| Travel: units 3 → 10 → 20 → 40 → 51                        | Immediate needs → possession and person contrasts → directions → plans → more developed directions with formal/informal commands                                         | Our city material is substantial but grouped in chapter 3. Revisit places while adding destination, travel mode, timing and past events.                                                                   |
| Shopping: units 6 → 28 → 56 → 90 → 168 → 253               | Early colours/requests; later purchases; the inspected later guides add fault/receipt explanations, then negotiation and alternatives                                    | Our clothes chapter starts at 1261 and includes a return task at 1390. Separate an early purchase from a later explanation/return rather than delay both.                                                  |
| School/work: units 7 → 14 → 16 → 45 → 81 → 120 → 139 → 218 | Basic study needs, facilities and messages, then recurring study/work goals; later objectives include office interaction and project management                          | Our chapter 6 starts at 901 and combines lexical inventories, schedules, dates and an email. Stage these across the course; do not make all professions or date forms prerequisites for basic interaction. |
| Health: units 72 → 91 → 121 → 145 → 180 → 219              | A doctor appointment and pain statement precede progressively broader health/advice situations                                                                           | Chapter 9 contains valuable original situations. An essential help request can arrive earlier; detailed symptom vocabulary and explanations can follow.                                                    |

This supports a **spiral syllabus**: revisit a familiar situation with an additional ability. It does not justify copying Spanish grammatical order or assuming Spanish unit numbers imply Lithuanian proficiency levels.

## 5. Teaching resources and curriculum architecture

All **286 guidebooks** have dialogue elements, audio references and word/phrase hint tables. Of these, 128 include a `TIP` marker, 79 have captioned-image examples, and 49 contain tables. Two have dedicated audio-sample elements. “Dialogue” is the schema element name: some entries contain only one phrase, so 1,269 dialogue elements must not be reported as 1,269 conversations.

This structure separates functional example language, explanations, sound, lexical help and focused grammar. It is not evidence that every explanation is shown automatically during a lesson. The 151 legacy skill explanations are a supplementary bank; their presence does not prove the current path displays them all.

Our material has valuable content but a much flatter executable representation: Lithuanian string, English string, one broad skill, optional cloze and a few alternatives. A lesson carries a rule paragraph, and a numeric stage largely determines the task. The 46 objective mappings are not used to select or assess course tasks. Curriculum expansion inserts classes relative to anchors and applies the same visit templates broadly.

Consequences in the **main course**:

- Introductions can repeat the whole rule paragraph when only one contrast is needed. Hints mostly reveal letters, remove an option, complete a pair or place the next word; they do not provide conceptual guidance.
- A correct reading-comprehension decision and an exact remembered translation have different evidential value, but both feed target-level records. Open writing correctly remains self-reviewed.
- Changing a subject in a sentence labelled `locative` cannot be attributed to a pronoun contrast. The recently added Practice fallback additionally turns the lesson rule into unrelated correction text. That fallback is a symptom of the missing shared assessment/content contract.
- Completion checks sample previously authored targets. There is no explicit bank of unseen examples reserved to assess the intended ability.
- The main course already schedules recall and can add earlier material. The missing piece is a purpose-built unit plan and shared evidence, not the existence of a review function.

The appropriate architectural change is **goal → prerequisites and language content → varied activities → supported assessment → next teaching action**. It should serve the main course first and Practice through the same model. The [product plan](product-learning-plan.md) turns that into a whole-course syllabus, an opening sequence and implementation gates.

## Reproducing the audit

Extract the user-supplied archive to a temporary directory. Keep downloaded reference content outside the app:

```sh
python3 scripts/content/fetch-course-reference.py /tmp/labukas-course-audit/esfen286.json /tmp/labukas-course-audit/full
node scripts/content/compare-course-structure.mjs /tmp/labukas-course-audit/esfen286.json /tmp/labukas-course-audit/full docs/evidence/curriculum-comparison
```

The downloader only reads public JSON URLs declared in the archive. It caches valid responses and records failures rather than inventing missing content. The comparison script verifies resource hashes and exports metadata and our generated task structure. Raw Duolingo teaching text and audio are not imported into Sakyk.
