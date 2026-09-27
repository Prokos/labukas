# Chapter 3 teaching review — 26 September 2026

Status: substantive revision implemented and checked in the review build. This is not whole-curriculum completion or teacher approval. The generated chapter is a draft; inventory coverage and successful execution do not establish teaching quality. This is an internal content review, not an independent Lithuanian teacher evaluation.

## Findings from the actual questions

1. The first destination lesson changes the subject, verb and noun ending together. Meaning choices can be solved by the subject alone. It does not isolate the destination rule it claims to teach.
2. Basic full-hour times, transport and weekday dictionary forms appear around lessons 53, 71 and 74, behind wide landmark and ordinal lists. This delays the chapter's practical purpose.
3. The early conversation is inserted by array position. Its declining reply and meeting-point pattern have not been prepared in the teaching sequence.
4. Two literal copies of a question are useful retrieval opportunities, but not evidence of applying grammar in new combinations. The final four changed-context gaps do not adequately sample the chapter.
5. Lesson cards and introductions print the answers to scheduled returns. The runtime does not account for that priming. Some reference rows are attached only to the first target in a multi-target model.
6. The previous-chapter bridge selects arbitrary inventory positions, including “men’s”, without a communicative purpose.
7. Reading and the writing sample introduce future and imperative forms without preparation. Reading support must identify these as chunks; writing must be possible using taught language.

## Revision contract

Build a functional route before the wider inventory: name useful places; distinguish a destination from a meeting point; choose a day and full-hour time; accept or decline and arrange the meeting; distinguish walking from transport; understand short directions; then combine them. Wider words and numbers extend those functions rather than delaying them.

Each authored lesson declares prerequisites and introduced concepts. A concept is a narrow contrast (for example `į + accusative` versus `prie + genitive` with the same noun), not an entire grammar chapter. Examples keep the surrounding language stable while the focus changes. Choices distinguish meanings of that focus, not unrelated people or destinations. Typed tasks ask for one prepared word/form. New-context checks cite the specific earlier target they test and appear after intervening lessons, without a model of their answer on the same screen.

Conversation options, including plausible wrong replies, must have been taught. The instruction establishes an actual intention; the next turn reacts to it. Reading tests comprehension with the text visible, and writing remains self-reviewed with no automatic grammar/mastery claim.

Keep the original source inventory traceable. Do not call the retained wider scaffold fully reviewed merely because the functional route improves. Preserve existing event identities and unfinished queues. New teaching uses new IDs, so old completion is not silently treated as completion of redesigned lessons.

Shared corrections: remove answer lists from the course overview and intro; use target-complete reference mappings; record recent answer exposure so an immediately repeated, newly shown answer does not count as independent retrieval. Later unassisted attempts remain necessary.

## Evidence and limits

Implemented so far:

- A functional sequence reaches a prepared four-turn meeting exchange before lesson 10. Place, day, time, person and means-of-travel contrasts receive separate teaching.
- Further authored lessons cover visiting a person, polite/third-person travel forms, three-way café location, rescheduling, next-hour half-times, route-number agreement and negative frequency.
- Twenty-eight reserved recombinations supplement the four original final checks. They reference the earlier production task and retain its target identity. Copied scheduled returns are counted separately and do not masquerade as changed contexts.
- A map requires following directions to a destination. Reading stays visibly supported and does not award productive recall.
- Five redundant draft lessons are retired from the normal path. Their source expressions are taught in the new route, with actual replacement models named in the ledger. Saved queues and events remain resumable, and the course count excludes retired completion.
- Reading/writing now use prepared present travel forms and polite direction chunks. Applications involving the river and work follow the corresponding vocabulary.
- All authored course overviews/intros omit raw answer lists. References now include every target in a multi-target model.
- Recent visible answers are recorded as support, separately from correctness and requested help. Two intervening responses are required before a fresh attempt can count as independent. With too few practice targets to create separation, the session ends with the need outstanding; a later visit does not automatically reveal the answer again. Historical events are preserved, not retroactively regraded.
- Long live conversations show the current turn with expandable earlier messages. Opening the history is recorded as support. Read-only dialogues retain the full exchange.

Final verification for this revision: **101 unit tests passed**, production build passed, and **816 rendered screens** passed the desktop/phone walkthrough (408 at each width), including every newly authored lesson, the retained conversation, a reading, final writing, and all five retired lesson queues. Conversation checks verify that the current message is inside the viewport and history use is saved. The shared keyboard/input/spelling browser checks also passed, including a genuinely later-day exact recovery rather than an immediate repeat of the correction. Browser results are in [the walkthrough record](evidence/chapter-three/browser-checks.json). Phone viewport checks do not establish physical keyboard behavior on every device.

The [source-function review record](evidence/chapter-three/teaching-review.json) names 13 functions and includes exact models, changed-context checks and supported applications. It separates those evidence types and marks functions with narrower transfer coverage. Regenerate it with `node scripts/content/chapter-three-review.mjs`. The current chapter has 128 lessons / 1,467 screens, including 34 authored or reviewed foundation/check lessons, 32 distinct changed-context checks and 541 copied return tasks. These counts describe scope; they are not a quality or retention score.

Remaining content risks: the wider vocabulary scaffold still contains repetitive dictionary questions, and some old grammar applications rely on a full example rather than independently testing the pattern. The new source review found locative, numbered-transport and negative-frequency gaps that an inventory-only check missed. Thus “all original IDs covered” must not be called “all chapter learning goals taught.” The new source-function ledger closes the inventory-only audit gap, but qualified language review and learner observation remain outstanding. In particular, do not infer spontaneous conversation from reply choices or long-term retention from a same-day completion. The whole curriculum remains unfinished: the wider chapter 1 and chapters 5–10 still require substantive review. Chapter 4 now has its own teaching revision and audit. Chapter 2 is more developed but is not evidence of measured retention or oral proficiency. No numerical learning-effectiveness claim is justified.
