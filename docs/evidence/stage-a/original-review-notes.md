# Stage A: opening lesson experience

Internal preview; qualified Lithuanian review is pending. Product acceptance is required before Stage B. Existing course content and learner history are not migrated by this preview.

## Proposed opening order (authored before implementation)

One short lesson: greet → thank and reply → give a name → follow a meeting. Models introduce two or three chunks at a time. This exact order is implemented, rather than generated from a universal target template.

| # / stable ID | Teaching and purpose | Exact learner view / control | Assessment and correction | Return |
| --- | --- | --- | --- | --- |
| 1 / hello-model | No prerequisites; introduce greeting and thanks. | “Labas! — Hello!” / “Ačiū! — Thank you!”; model, Continue. Explain č and ū are Lithuanian letters. | Exposure only; no hint or mistake. | Both return below. |
| 2 / hello-choice | Model 1; recognize greeting. | “Hello!” / “Choose the Lithuanian.”; Labas! / Ačiū! | Labas; Ačiū means thank you. | 9, 13. |
| 3 / thanks-meaning | Model 1; understand thanks. | “Ačiū!” / “Choose the meaning.”; Hello! / Thank you! | Thank you; contrast with Labas. | 5, 8, 12. |
| 4 / reply-model | Thanks known; introduce response. | “Ačiū! — Thank you!” / “Prašom! — You’re welcome!”; model. | Exposure only. Scope prašom to replying to thanks. | 5, 12. |
| 5 / thanks-reply | Model 4; choose appropriate response. | “Ačiū!” / “Choose a reply.”; Prašom! / Labas! | Prašom; Labas greets rather than replies to thanks. Hint points to thanking, reference repeats model, reveal gives answer. | 12 after naming work. |
| 6 / name-model | Greeting known; introduce two naming chunks. | “Mano vardas Rasa. — My name is Rasa.” / “Koks tavo vardas? — What is your name?”; model. Explain replace the name, use Tomas as example. | Exposure only; names are proper names, not vocabulary distractors. | 7, 10, 11, 13. |
| 7 / name-bank | Model 6; construct naming frame. | “My name is Tomas.” / “Build the Lithuanian sentence.”; vardas / Tomas / Mano. | Mano vardas Tomas, Tomas mano vardas accepted; reversed nonsense gets order correction. Bank is supplied support, not requested help. | 10, 13. |
| 8 / thanks-type | Models 1, 4 and intervening naming; retrieve thanks. | “Thank you!” / “Write in Lithuanian.”; input + Lithuanian letters. | Ačiū, dėkui accepted; aciu accepted with spelling note. Known greeting/reply is wrong; unfamiliar wording gets neutral model comparison. | Later days deferred to B. |
| 9 / hello-type | Earlier greeting; retrieve after other work. | “Hello!” / “Write the greeting you learned.”; input + letters. | Labas, sveiki, sveikas, sveika accepted. Ačiū / prašom are meaningful errors. Unknown gets neutral comparison. | 13. |
| 10 / name-chat | Naming model and construction; interpret incoming question and take a turn. | Rasa: “Labas! Koks tavo vardas?” / “Reply as Tomas.”; Mano vardas Tomas. / Ačiū! | Submitted answer becomes You message. Correct: Rasa continues “Mano vardas Rasa.” Wrong: “Koks tavo vardas?” plus local correction about the unanswered name question. | 11 changes to reading, 13 to writing. |
| 11 / meeting-reading | All words taught; extract meaning, not speaker-label trivia. | “Labas! Mano vardas Rasa.” / “Labas, Rasa! Mano vardas Tomas.”; “What are these people doing?”; Greeting and sharing their names / Thanking each other. | Interpret greeting/naming versus thanks. Reading content stays visible. | 13 combines greeting/name. |
| 12 / reply-type | Reply model and choice, separated by six tasks; retrieve response. | “Ačiū!” / “Write a reply in Lithuanian.”; input + letters. | Prašom accepted. Labas / ačiū are known wrong; unfamiliar alternatives neutral. | Across-day return deferred to B. |
| 13 / introduction-type | Greeting and frame learned; combine in bounded writing. | “Hello! My name is Rasa.” / “Write in Lithuanian.”; input + letters. | Labas + mano vardas (yra) Rasa, name-first frame, aš esu / esu Rasa accepted. Wrong name or missing greeting gets targeted correction. Unrecognized response neutral. | Completion, no independent proficiency claim. |

All checks ignore case, spacing and terminal punctuation. Reference, hint and reveal are distinct, scoped to the current question and restored on reload. Correct after any support is positive. Unknown typing is ungraded, with no mistake penalty. Each answer records the actual contract version, mode, target, correctness, supplied support, requested help, exposure IDs, context and time; immutable preview records never enter historical course scoring. Replaying retains earlier preview events.

## Interaction reuse and scope

Reuse the existing brand, typography, button language and text-input conventions. Improve source/instruction hierarchy, choice controls and removable bank tokens. Add actual turn-taking (incoming → submitted learner message → authored response). One shared preview renderer and grader serves Course and Practice review routes; the latter is a review harness, not a new review scheduler. Both are accessible from the preview start screen. Existing Practice/course remain intact.

Preview persistence is a separate versioned local key. The preview route does not mount the old progress reader or cloud sync. Stage B must reconcile unknown historical preview records, real later returns, course integration and the pre-existing pilot annotation failure. Do not manufacture working pilot evidence or weaken its tests in Stage A.

## Review

Open `http://localhost:5174/?preview=opening`. Start the lesson and complete its 13 screens. The entry also links to Practice review. Close and reopen or reload mid-question to check restoration. Hint, Reference and Reveal answer are available for every exercise; all are secondary to Check/Continue. Completion offers practice again or a return to the start.

Browser evidence and verification results will be recorded here after implementation.

## Verification (24 September 2026)

- `npm run build` passes.
- `node --test tests/opening-preview.test.js`: 3 tests pass. Independent fixtures cover legitimate alternatives, punctuation/NFC, meaningful errors, unknown wording, help reset, supplied support, immutable records and completion.
- `npm test`: 46 pass, 1 fails. The failure is the handoff’s pre-existing `tests/teaching-pilots.test.js` missing `.teaching` annotation (`c1-present-people-core-1cjotio`). Before these changes the suite was 43 pass / the same 1 failure. No pilot tests were weakened. Resolving the pilot integration remains a Stage B expansion gate.
- `npm run test:opening:browser` passes in a fresh Chrome context at desktop 1440×1000 and phone 390×844. This environment used `PLAYWRIGHT_CHROMIUM_EXECUTABLE='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'` because Playwright’s expected downloaded browser revision was absent.
- Full sequence completed on both viewports. Checked chat submission and authored response, reading, long prompt, typed Enter, Continue with Enter, Lithuanian-letter insertion, draft/feedback reload, close/resume, completion return and replay with history preserved.
- 24 help paths: Course/Practice × choice/bank/typing × ordinary/hint/reference/reveal. Each reloads before submission and checks positive visible feedback plus stored help/correctness. Wrong replies, wrong name and unknown wording are checked in both contexts.
- Production service worker verified offline reload, answer saving and reload after feedback. A seeded older `learningRun` record remains byte-for-byte unchanged in the original progress key. No real learner profile or cloud account was used.
- Inspected screenshots for source hierarchy, readable controls, multi-turn exchange, corrections and completion. Selected wrong choices now use an error cross and error styling; a selection alone never displays a correctness tick. Chat answer choices disappear after submission so the exchange remains primary.
- The 390×430 focused-input check approximates available space with a phone keyboard. It is **not** native iOS/Android keyboard verification; physical-device review remains necessary. Qualified Lithuanian review and learner efficacy are also not established by these checks.

[Browser results](evidence/stage-a/browser-results.json) · [desktop exercise](evidence/stage-a/desktop-hello-choice.png) · [phone conversation](evidence/stage-a/phone-conversation.png) · [phone correction](evidence/stage-a/phone-course-thanks-reply-incorrect.png) · [completion](evidence/stage-a/phone-complete.png).

Stage A is ready for product review. Stage B and curriculum expansion have not started.
