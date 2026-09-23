# What practice is for

Help a learner retrieve and use Lithuanian they have encountered, with less support, and remember it later. The page answers two questions: what needs attention, and what useful learning activity happens next? Finishing questions or accumulating correct taps is not sufficient evidence of learning.

## Audit of the previous mechanics

The course already has meaning recognition, sentence building, typed recall, some sentence gaps, hints, correction feedback, answer history, and due dates. It also has a large inventory of words and whole phrases, grammar rules, and authored sentence examples.

However, any recorded attempt made an item “known” for practice selection and bypassed its first-look introduction. A word that had only been answered incorrectly could therefore be tested without renewed instruction. Restricting distractors to a selected single-word set could leave only the correct option. A fixed round at the current level could finish without productive retrieval. Two consecutive copies of the same prompt would mainly establish immediate accessibility. The existing retention streak includes recognition, while correct answers with hints are stored as unsuccessful unaided attempts, indistinguishable from errors in older history.

The collection is an inventory of learning targets, including forms and phrases. It is not a dictionary of underlying words. Knowing one form does not establish knowing all its inflections or uses.

## Current behavior

One Practice page contains the learner’s encountered targets and a clear next-session action. It keeps an explanation beside each word of why it needs attention.

1. Recent unresolved difficulty takes priority over incomplete introduction. Difficulty is capped and clears after two independent successful recalls. Historical mistakes are not a permanent penalty. Because old events do not distinguish wrong answers from hint use, the UI says “recent difficulty,” not a claimed diagnosis of confusion.
2. Otherwise, targets are ordered by recall evidence, support level, and oldest practice. Unencountered course material does not fill the review list. A fresh learner is directed to the course.
3. A batch contains at most five targets. Selecting a word anchors a mixed batch; it does not launch a two-question single-word drill.
4. A low-level or repeatedly difficult target first receives its meaning/model and a supported recognition task. Grammar uses the existing rule; an existing same-form sentence example is shown where available. Choice distractors come from authored lesson peers, regardless of batch membership.
5. The session seeks two unaided productive recalls of each target, with two other target turns between repeats when the collection permits it. An exact-form sentence example can supply the later gap prompt; otherwise it remains translation recall. This is a limited variation, not a transfer test.
6. An incorrect or hinted answer resets that target’s session recall goal and restores support. A completed target can reappear to separate repair attempts. Three unsuccessful attempts on a target, seven target turns, or 35 total turns stop further drilling. The result identifies unfinished targets and offers their course lesson.
7. The summary reports which words were recalled and which still need support. A new session is planned from the latest history. It does not replay an old queue.
8. With just one encountered target, there is only one recall check after any needed support. The summary explicitly says that this was not spaced mixed practice and encourages learning more words through the course.

Practice familiarity distinguishes recognition, developing recall, unaided recall, and recall across days. The strongest label requires two independent successes and independent recall on at least two different local dates, at least four hours apart. Repeated same-day success cannot manufacture this evidence. These derived practice fields preserve existing event IDs, course passes, and course scheduling. Existing progress is replayed without a migration.

The batch size, two-recall criterion, spacing of two intervening turns, difficulty cap, day boundary, and retry limits are practical starting choices. They are not scientifically established optimal values. Today links to the same practice collection. The existing due-date algorithm remains in course review selection; it has not become a calibrated estimate of forgetting probability.

## What is still missing for effective Lithuanian teaching

- **Authored links between a word, its forms, and examples.** Same-spelling examples cover only a subset: the conservative same-lesson lookup currently finds an example for 86 of 1,118 core vocabulary targets. This is not a count of all examples in the course. Inflected Lithuanian requires explicit links: the dictionary form, a contextual form, its grammatical role, and accepted alternatives. String matching cannot infer those reliably.
- **Separate evidence for meaning, spelling, grammar, and usage.** One numeric level is too coarse. A spelling error and a wrong case ending need different feedback. Future answer events should record the supplied response, hint use, exercise purpose, and the form tested, with appropriate handling of learner-written personal text.
- **Varied contextual production.** Retrieving the same translation or completing a familiar example does not establish choosing the right form in a new sentence or conversation. Add vetted alternative prompts and previously unseen transfer checks, tied to the skill being assessed.
- **Listening and pronunciation.** Current typed practice does not measure either. These need suitable Lithuanian audio and deliberately designed listening/speaking activities; a typing score should never imply speaking proficiency.
- **Better reteaching for recurring errors.** Existing lesson rules can help, but targeted contrasts and explanations are uneven. Repeated difficulty should guide the learner to an appropriate explanation, rather than just increase repetitions.
- **A unified delayed-review model.** Course levels, due scheduling, and practice recall evidence currently serve different purposes. A future scheduler should use independent delayed recall and expose when to return, rather than continually selecting recently successful words when the collection is small.

## How to evaluate this

Automated tests establish that selection, spacing, recovery, bounds, persistence, and navigation behave as designed. They do not establish improved learning.

Evaluate next-day and later unaided recall, ability to use the target in a new vetted sentence, hint dependence, repeated-error patterns, and whether learners understand the next action. Compare these against the earlier practice flow; do not use XP, session completion, or immediate accuracy as the main success criteria.

Research supports retrieval practice and spacing in general. [Karpicke and Roediger (2008)](https://doi.org/10.1126/science.1152408) studied repeated retrieval of foreign-language vocabulary. [Karpicke and Bauernschmidt (2011)](https://pubmed.ncbi.nlm.nih.gov/21574747/) found benefits of increasing spacing between retrieval attempts. These studies motivate the approach; they do not validate this Lithuanian app or its exact thresholds.
