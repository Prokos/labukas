# Stage A — revised after product review

The first preview was rejected: it mixed interaction demonstrations into a first lesson, demanded unaided writing too early, introduced a different shell and offered ambiguous completion actions. This revision remains Stage A, not curriculum expansion. Qualified Lithuanian review is pending.

## Revised first lesson contract

No free typing in Lesson 1. Models, choices and a three-word bank provide support. No success here establishes independent production. Every distractor is previously introduced; name questions have a supplied English gloss.

| Order | ID | Exact content and action | Preparation / feedback / return |
| --- | --- | --- | --- |
| 1 | hello-model | Labas! — Hello! / Ačiū! — Thank you! | Two chunks. Ordinary exposure, not help. |
| 2 | hello-choice | Hello! / Choose the Lithuanian: Labas! or Ačiū! | Model 1; wrong: Ačiū means Thank you. |
| 3 | thanks-meaning | Ačiū! / Choose the meaning: Hello! or Thank you! | Model 1; recognition only. |
| 4 | reply-model | Ačiū! — Thank you! / Prašom! — You’re welcome! | Model the reply explicitly. |
| 5 | thanks-reply | Ačiū! / Choose a reply: Prašom! or Labas! | Model 4; supported choice, never recall credit. |
| 6 | name-model | Mano vardas Rasa. — My name is Rasa. / Koks tavo vardas? — What is your name? | Two chunks; show replacing Rasa with Tomas. |
| 7 | name-bank | My name is Tomas. / Build with vardas, Tomas, Mano | Keep a visible Mano vardas Rasa model; changing the name is the only new demand. Accept Mano vardas Tomas / Tomas mano vardas. |
| 8 | name-chat | Rasa: Labas! Koks tavo vardas? (Hello! What is your name?) / Reply as Tomas, choosing Mano vardas Tomas or Ačiū! | Submitted message appears in exchange, Rasa supplies authored next turn. English gloss is built-in support. |
| 9 | meeting-reading | Rasa: Labas! Mano vardas Rasa. / Tomas: Labas, Rasa! Mano vardas Tomas. / What are these people doing? | Render the exchange with the same Conversation component as chat. Choose greeting and sharing names / thanking each other. This remains comprehension, not a new turn-taking family. |

Then: “Lesson complete.” and “Back to home”. No next lesson exists in this Stage A preview, so no dead or misleading Next lesson action. No Practice switch or retake loop in the learner flow. Retrying for review is an explicit link on the home entry after completion.

## Separate interaction review

`?preview=opening&example=reply-type` is a **supported typing example, not Lesson 1**. A visible model reads Prašom! — You’re welcome! and instruction says to copy the reply. This checks text input, Lithuanian letters, help and grading without representing first-lesson recall difficulty. Other existing typing samples are likewise reviewer-only, always supplied with a model. Direct review URLs replace the misleading “Try in Practice” control.

“Praš” / “Pras” are known incomplete words: “Not quite.” followed by “Prašom! — You’re welcome.” Unrecognized longer wording retains neutral treatment and short model comparison; a fair alternative must not be marked wrong simply because absent from a string list. Nėra už ką is accepted for thanks. Punctuation, case and NFC variants are accepted.

Correctness and recall are separate. A correct copied/revealed answer stays positive, with a small “Answer shown” note after reveal. Events retain correctness, supplied model/bank/choices/gloss, requested hint/reference/reveal and response mode, and explicitly record `independentRecall: false` for supported responses. Preview events are not imported as course mastery. Contract v2 uses a new storage key and preserves v1 untouched.

## Shell and history

Extract the existing session header, scroll/focus handling and visual-viewport/keyboard behavior into a shared LessonShell used by both old course sessions and this preview. Use the same exercise and bottom action layout. Preserve the original navigation and home page; remove the preview’s alternate branded page shell. Where a brand is shown, use the established brand container and Wordmark without ad hoc sizing.

Original course history and writing remain untouched. Stage B still owns full curriculum integration, real later returns, scheduling and the known pilot annotation failure. Earlier review evidence is preserved in `evidence/stage-a`; revised evidence goes in `evidence/stage-a-revision`.

## Verification of the revision

- Production build passes. Four opening-contract tests pass; the full suite is 47 pass / 1 known pilot-annotation failure, unchanged in cause.
- Existing `npm run test:browser` passes after extracting LessonShell: course continuation, multi-session progression, checkpoints, legacy history, mobile, reading, saved writing drafts and offline behavior. The shared session CSS is unchanged.
- `npm run test:opening:browser` covers the complete nine-screen lesson on desktop and phone, no text input in Lesson 1, conversation bubbles in comprehension, bottom action bounds, completion → home, correctly styled home wordmark, explicit review/restart and reload, v1 history preservation, and production offline answer persistence.
- Reviewer-only typing checks reproduce “Praš”, verify the concise error/correction and error-heading color, insert a Lithuanian letter at the cursor, restore input/help on reload, and use Enter. A reduced 390×430 viewport checks input and action visibility together. This approximates keyboard space; a native iOS/Android keyboard still needs physical-device review.
- Course/Practice internal contexts retain the 24 help/resume checks, but there is no Practice switch in the learner flow. Every supported response explicitly records `independentRecall: false`, including positive answers after reveal.
- Visually inspected revised reading, chat, fragment correction, phone keyboard-height view, completion and original home logo. Removed an unintended focus ring on programmatically focused headings; controls retain visible keyboard focus.

[Revised browser evidence](evidence/stage-a-revision/browser-results.json) · [phone reading](evidence/stage-a-revision/phone-meeting-reading.png) · [fragment correction](evidence/stage-a-revision/phone-partial-correction.png) · [completion](evidence/stage-a-revision/phone-complete.png) · [home/logo](evidence/stage-a-revision/phone-home-logo.png).

Review links while the local server runs:

- First lesson: `http://localhost:5174/?preview=opening&restart=1`
- Separate supported typing sample: `http://localhost:5174/?preview=opening&example=reply-type&restart=1`

Stage A is still awaiting product acceptance. No curriculum expansion or historical progress migration has been performed.
