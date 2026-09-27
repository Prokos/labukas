# Answer assessment and vocabulary support

This is the shared product contract for Course and Practice, prompted by two Stage A review failures: `Ačiu` was treated differently from `Aciu`, and a distractor translation appeared as unexplained task text. It supplements the [product plan](product-learning-plan.md), not the curriculum scope. The user has since authorized the remaining chapter drafts.

## Assessment contract

Assessment must preserve what the response demonstrates. A single correct/incorrect flag cannot determine feedback, mastery and repair independently.

| Outcome | Learner feedback | Evidence and response |
| --- | --- | --- |
| Correct wording and spelling | Correct! | Credit only the targeted ability and actual response mode. Help/reveal prevents independent recall. |
| Recognized wording, spelling slip | Right word. Check the spelling: **Ačiū!** | Preserve unaided word recall if demonstrated; spelling remains unresolved. Continue without repeating a meaning lesson. |
| Known wrong word/form | Short correction for that contrast | Record the diagnosed target; bounded repair on meaning or form as appropriate. `esu`/`esi` is a form error even though only one letter differs. |
| Wording outside the authored contract | Neutral model comparison | No inferred mistake or mastery. Requires content review if recurring. |

Case, ordinary punctuation and Unicode composition are ignored. The exclamation mark in `Ačiū!` is optional. Lithuanian letters are retained for exact comparison. Authored courses share a diacritic policy backed by canonical word forms; an explicit strict task can override it. An authored wrong form takes precedence over tolerance. Choice/bank answers never receive typing tolerance.

The current shared evaluator supports exact accepted alternatives, explicit wrong answers, optional diacritic-only spelling detection, bounded incomplete-answer detection and a task-specific unknown-answer outcome. These cover the reviewed examples without guessing intent. It returns a versioned result with outcome, reason, matched canonical answer, wording correctness and spelling correctness. Alternative answers receive their own correction (`Dekui` → `Dėkui`, not `Ačiū`).

Authored courses now use the same default policy for every typed word or phrase. `src/assessment-lexicon.js` indexes canonical Lithuanian forms from models, accepted target-language answers, passages, explicit form alternatives and reference paradigms. It deliberately excludes English prompts/translations and arbitrary wrong spellings. A full diacritic-only match receives spelling feedback unless a changed entered token is itself a known canonical word/form. Thus `juodos kavos prasom` and `sumustinio su suriu` work without an allowlist, while known `kava/kavą`, `bulvės/bulves`, `jūs/jus` and `sūnus/sūnūs` contrasts remain form errors. Explicit wrong answers take priority. Version 2 identifies these newly assessed responses; existing events retain their original assessment.

This is a bounded orthographic policy, not a complete morphological analyser. A valid Lithuanian form absent from both the reference and course index may still be classified as a spelling slip. That response earns no exact independent form recall, so it cannot by itself establish grammar mastery. Missing words and arbitrary letter edits are not forgiven. A genuinely shorter prefix can be incomplete; a full accent-folded match cannot be diagnosed as incomplete.

Do not implement universal edit-distance forgiveness. Short words, case endings and verb forms can differ by a letter while expressing different things. Broader typo detection requires authored near-miss rules or reviewed linguistic analysis, with fixtures for real-word/form collisions. A spelling-focused task also needs an explicit spelling objective: recognized wording alone cannot satisfy it. These are extension requirements, not claims about current coverage.

## Evidence and review

Store the assessment at submission time, including its version and matched answer, alongside the original response, target, response mode and requested support. Never regrade historical events against a new answer bank. Missing old dimensions mean unknown, not false or perfect.

In Stage A, `correctness` means accepted wording; `outcome` distinguishes spelling from exact success. `spellingCorrect` is null when spelling was not assessed. `independentWordRecall` can be true for a spelling slip; the conservative existing `independentRecall` remains false until the whole response is exact. Neither flag establishes delayed retention. An assisted response earns neither independent flag. Consumers must read these dimensions rather than infer full mastery from `correctness`.

Stage A shows the spelling correction and keeps its existing later returns; it does not insert meaning reteaching for a spelling slip. When integrated scheduling is implemented, unresolved spelling should request a later spelling retrieval, while meaning/form confusion requests its corresponding repair. A subsequent exact unaided spelling response can resolve the spelling need without erasing the earlier event. Keep existing spacing and retry bounds; do not add copy drills or permanent mistake penalties.

## Vocabulary support placement

Every required word and distractor needs prior teaching or deliberate support. A previously taught distractor does not need a floating translation above the answer control. Put optional reminders in Hint/Reference; attach any necessary new-word gloss visibly to the specific word it explains. Record requested help separately from built-in support. Do not use a gloss to excuse an unprepared grammar demand.

`tavo` is taught in lesson 2 and returns in lesson 4. Its reminder belongs in the requested hint contrasting `mano`/`tavo`. The shared preview renderer no longer renders standalone word glosses above banks, including in saved older runs. Actual conversation translations remain attached to their messages.

## Implementation and remaining integration

### Chapter 2 review build

The opening and replacement chapter now share `src/authored-course.js` for Course and chapter Practice. Both consume rich outcomes, record support separately, and schedule spelling, meaning/form and unaided-recall needs separately. `src/recall-policy.js` shares the original course's mastery thresholds and bounded practice constants. Recognition cannot establish independent recall; visible corrections and repairs cannot establish it either. A corrected answer after help must return unaided, and later-day evidence remains a separate requirement.

The replacement is explicitly authorized for review. It does not mean the legacy migration below is complete. New chapter records are stored separately; original records remain untouched. Local backup/import now includes authored records and unfinished sessions. Original cloud sync still does not include authored records. See [chapter 2 integration boundaries](chapter-two-replacement.md). Do not silently promote an old boolean success to spelling or independent recall evidence.

Implemented now:

- `src/answer-assessment.js` is the shared deterministic comparison layer. The opening preview uses its rich outcome; the original engine uses its strict compatibility path. There is one normalization/comparison implementation.
- All authored courses default to shared spelling detection; explicit strict tasks retain their stricter objective. Feedback, persisted evidence, reload, continuation and repair selection handle the new outcome.
- Previously saved preview queues with ASCII accepted aliases use canonical spellings for new submissions; earlier events are untouched.
- Independent unit cases cover Unicode/punctuation, partial diacritics, alternatives, incorrect forms, tolerance boundaries, help and immutable evidence. Browser cases cover the actual correction and word-bank screens on desktop and phone.

The original Course/Practice UI still uses its legacy boolean result. This is an explicit compatibility boundary, not a course-wide rollout of spelling feedback. Stage B must migrate these connected consumers before enabling richer outcomes there:

| Area | Required change and acceptance check |
| --- | --- |
| Content/exercise generation (`curriculum`, `engine`) | Carry reviewed task-level policies, accepted variants, wrong-form contrasts and target dimensions; no blanket tolerance for all existing items. |
| Session feedback/attempts (`main`) | Consume rich outcomes and record requested help separately; verify spelling, wrong-form, helped and unassessed paths in Course and Practice. |
| Progress (`engine`) | Replace full-mastery inference from a boolean with dimension-specific evidence; preserve historical completion and treat old conflated help/error records as unknown cause. |
| Review scheduling (`practice`) | Select spelling vs meaning/form repair, clear only the demonstrated difficulty and retain spacing/retry bounds. |
| Validation/backup/sync (`engine`, `cloud`) | Accept and round-trip the additive assessment dimensions; preserve unknown historical preview records and original events. |

That migration is required before replacing the production course. Passing the Stage A preview does not establish that it has happened. Verification must include the same answer in Course and Practice, reload and backup/merge round trips, old-profile compatibility, and no full-mastery credit for spelling-only or helped success.


## Recent exposure (authored runtime, evidence policy 2)

Correctness and independence remain separate. Models, requested reference/history, visible choices and correction feedback can prime a later response. The run stores the actual visible text and response spacing across reloads and lesson switches. A bounded typed answer that was just shown is marked `answerPrimed`, records `recent-answer-exposure` in supplied support, and earns no independent retrieval credit. Hidden accepted alternatives and unused word-bank data are not exposure. Two intervening responses remove this short-term support flag; later-day mastery still requires the existing separate date/time criteria.

Course overviews and introductions no longer print answer lists. With too few Practice targets to separate an attempt from its correction, the session ends with the need outstanding instead of repeatedly asking the same answer until it looks mastered. A later session does not automatically reveal the answer again after a successful supported response. Historical events retain their original interpretation and are not retroactively certified under this stricter policy.
