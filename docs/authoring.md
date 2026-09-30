# Authoring

Edit `src/curriculum/chapters/NN.json`. This is the content source of truth. Do not introduce per-chapter builders, lesson generators or a second exercise runtime.

A chapter declares `schemaVersion`, `number`, `version`, title, description, lessons, vocabulary and optional objectives and dependencies. The chapter files define the catalog; the app discovers them directly, and lesson totals come from each chapter's lesson list. `version` describes the progress state schema, not the editorial revision date. Help references are compiled from model examples in the chapter and its dependencies, so author each example once in its teaching step.

A lesson declares a stable `id`, title, goal and ordered `steps`. It may declare `requires` and `provides` concept identities. Introduce each required concept before using it. Optional `variants` contain explicit alternative sequences; every variant needs equivalent preparation and evidence expectations.

Each exercise has a stable `id` and a `kind`. Response tasks declare an instruction, target and accepted answers (matching uses pairs; writing uses a sample and checklist). Models declare a title, pairs of Lithuanian/English examples and introduced targets. Use `reviewKey` to distinguish different skills or forms under a target.

Supported kinds: `model`, `choice`, `type`, `gap`, `gap-type`, `bank`, `chat`, `chat-choice`, `chat-bank`, `reading`, `match`, `edit`, `writing`, `map`.

```json
{
  "id": "coffee-recall",
  "kind": "type",
  "target": "word:coffee",
  "reviewKey": "word:coffee",
  "ability": "word-recall",
  "answerScope": "closed",
  "source": "coffee",
  "instruction": "Write in Lithuanian.",
  "answers": ["kava"],
  "correction": "kava"
}
```

Schedule a return explicitly:

```json
{ "id": "coffee-later", "repeat": "coffee-recall", "plannedReturn": true }
```

A return can override fields; `null` removes a base field. Referencing an exercise in another chapter requires declaring that chapter in `dependencies`. A repeated question is retrieval practice; it is not a changed-context check. For transfer, write a genuinely new combination, identify the earlier target in `returnOf`, and keep its skill identity stable.

Teach small groups before retrieval. Isolate the grammar contrast while keeping the sentence frame stable. Prepare conversation alternatives as well as intended replies. Use natural English. Options should diagnose a plausible misunderstanding; the runtime displays at most four and never invents distractors. Supply meaningful cues or omit them. Avoid answer-bearing lesson titles and hints that merely tell the learner to remember.

The `vocabulary` inventory records required expressions; an optional `model` points to their contextual teaching. `objectives` identify models, checks, supported applications and limits. A coverage claim must resolve to actual teaching and an appropriate task, not just an exercise count.

Run `npm run content:check`, `npm test` and the relevant browser checks. Review the rendered sequence, including incorrect answers, spelling, help and later returns. Automated checks do not replace an editorial review.
