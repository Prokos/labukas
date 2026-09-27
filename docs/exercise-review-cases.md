# Exercise review cases

Use these to verify the [product plan](product-learning-plan.md) against actual interactions, in both Course and Practice.

## Correct answers and help

Show the normal model `Ačiū! — Prašom!`, then ask for the reply to `Ačiū!`.

| Path | Expected result |
| --- | --- |
| Choose `Prašom!` without opening help | Normal positive feedback; no “try without help” message and no hint/difficulty recorded. |
| Request a hint, then answer correctly | Positive feedback. Any support note is secondary and amber/neutral; the hint is recorded. |
| Open reference or reveal, then answer correctly | Correct response confirmed; reference/reveal recorded separately, without independent-recall credit. |
| Submit a known incorrect reply | Error feedback with a correction about that reply. |
| Reload during each path | Preserve the task and its help state; show the same result after answering. |
| Continue to a new question after using help | Previous help does not carry over. |

Repeat with bounded typing and a supplied word bank. Built-in scaffolding must not count as requested help. Check both the rendered message/style and stored evidence.

## Spelling and vocabulary support

Apply the [shared assessment contract](answer-assessment.md) in both Course and Practice when integrated:

- `Ačiū`, `AČIŪ!` and equivalent Unicode receive exact success; `Ačiu`, `Aciu`, `Aciū` receive a spelling correction and retain only the supported word-recall evidence. Punctuation alone is not a mistake.
- `Dekui` shows `Dėkui`, preserving the chosen legitimate alternative. Wrong `esu`/`esi` remains a form error. A diacritic-only contrast explicitly authored as a wrong form also remains incorrect.
- Full phrases must inherit shared diacritic spelling support: `juodos kavos prasom`, `prasom juodos kavos`, `juodos kavos prasau` and `noreciau juodos kavos` receive their corresponding canonical phrase with spelling feedback in Course and Practice. Test saved queues, feedback reload and later exact recovery. Do not label a full diacritic-only match incomplete, insert meaning repair, or forgive a changed noun ending such as `kava/kavą`.
- Repeat spelling cases after hint/reveal, reload and Continue. Preserve the correction and help evidence, grant no independent recall after help, and do not insert meaning repair for a spelling slip.
- On “My name is Mantas”, the bank has no floating `tavo · your` text. A requested hint explains `mano`/`tavo`. For future banks, necessary vocabulary support must be visibly attached to its word or supplied through prior teaching; no unrelated gloss between instruction and response.

## Simple translation

The [seat/thanks](screenshots/rejected-learning-ui/seat-thanks.png) and [arrival/greeting](screenshots/rejected-learning-ui/arrival-greeting.png) screenshots show compositions to avoid: framed English setup, a separate command, a reading label and an unexplained icon for one simple task.

Replace that structure with a precise source such as “Thank you!” or “Hello!”, a brief secondary instruction and the response control. The source must be more prominent than “What does this mean?”. Remove setup text unless it changes the answer or the reasoning required.

## Conversation

Follow an incoming Lithuanian message through answer submission and the next authored turn. The learner’s reply must appear in the exchange, with clear speaker identity and position. The reply must respond meaningfully to the message. Compare this with a reading question: chat styling alone does not add turn-taking.

## Phone, keyboard and completion

Inspect a long source phrase, a multi-turn exchange, a correction and an open phone keyboard. Verify readable choices, reachable input/actions, visible focus, Enter behavior and Lithuanian-letter controls. Complete a lesson: show a short natural completion and useful next action, without explaining assessment accounting.
