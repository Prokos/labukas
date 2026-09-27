import { courseItem } from "./course-copy.js";
import { courseFormFamilies } from "./course-form-families.js";
import { chapters, lessons as sourceLessons } from "./curriculum.js";
import { openingCourse } from "./opening-content.js";
import { chapterTwoCourse } from "./chapter-two-content.js";
import { lithuanianAssessmentPolicy } from "./lithuanian-assessment-policy.js";
import { chapterPlans } from "./course-chapter-plans.js";
import { sequenceChapterThree } from "./chapter-three-route.js";
import { sequenceChapterFour } from "./chapter-four-route.js";
import { completeChapterFourFunctions } from "./chapter-four-functions.js";
import { extendChapterThree } from "./chapter-three-extensions.js";
import { completeChapterThreeFunctions } from "./chapter-three-functions.js";
import { supplements } from "./course-supplements.js";
import {
  chunks,
  words,
  gapAnswer,
  model,
  teachGroup,
  scheduleReturns,
  repairFor,
} from "./course-authoring.js";

const dedupe = (xs, key) =>
  xs.filter((x, i) => xs.findIndex((y) => key(x) === key(y)) === i);
const targetId = (n, suffix) => `c${n}-${suffix}`;
function supplementSources(n) {
  return supplements
    .filter((x) => x[0] === n)
    .map(([chapter, key, title, sourcePages, rule, rows]) => ({
      id: targetId(chapter, key),
      title,
      sourcePages,
      rule,
      kind: "pattern",
      supplemental: true,
      items: rows.map(([lt, en, cloze], i) => ({
        id: `${targetId(chapter, key)}-${i}`,
        lt,
        en,
        cloze,
        role: "core",
      })),
    }));
}
function conversationLesson(n, spec) {
  const id = `a-c${n}-conversation`;
  const targets = spec.turns.map((_, i) => `${id}-${i}`);
  const steps = [];
  for (let i = 0; i < spec.turns.length; i++) {
    const [incoming, incomingEn, instruction, answer, en, wrong, next, nextEn] =
      spec.turns[i];
    steps.push(
      model(
        `${targets[i]}-model`,
        i ? "Continue the exchange" : spec.title,
        [
          [incoming, incomingEn],
          [answer, en],
        ],
        "Notice what the question asks and how the reply answers it.",
        [targets[i]],
      ),
    );
  }
  spec.turns.forEach(
    ([source, gloss, instruction, answer, en, wrong, next, followGloss], i) => {
      steps.push({
        id: targets[i],
        kind: "chat-choice",
        target: targets[i],
        reviewKey: targets[i],
        ability: "social-reply",
        speaker: spec.speaker,
        thread: id,
        continuation: i > 0,
        source,
        gloss,
        instruction,
        options: [answer, wrong],
        answers: [answer],
        next:
          i + 1 < spec.turns.length && next !== spec.turns[i + 1][0]
            ? `${next}\n${spec.turns[i + 1][0]}`
            : next,
        wrongNext: i + 1 < spec.turns.length ? spec.turns[i + 1][0] : "Gerai.",
        wrongFollowGloss:
          i + 1 < spec.turns.length ? spec.turns[i + 1][1] : "All right.",
        followGloss:
          i + 1 < spec.turns.length && next !== spec.turns[i + 1][0]
            ? `${followGloss} ${spec.turns[i + 1][1]}`
            : followGloss,
        hint: `Your reply should mean: ${en}`,
        correction: `${answer} — ${en}`,
      });
    },
  );
  return {
    id,
    title: spec.title,
    goal: "Read the other person’s message and take your turn.",
    sourcePages: spec.pages,
    newLanguage: spec.turns.map((t) => t[3]),
    returns: [],
    steps,
  };
}
function readingLesson(l) {
  const passage = l.items[0].passage;
  const isDialogue = passage.split("\n").every((line) => /^[^:]+: /.test(line));
  const messages = isDialogue
    ? passage.split("\n").map((line, i) => ({
        speaker: line.split(": ")[0],
        text: line.split(": ").slice(1).join(": "),
        outgoing: i % 2 === 1,
      }))
    : null;
  return {
    id: `a-${l.id}`,
    title: l.title,
    goal: "Use the information in the text to answer.",
    sourcePages: l.sourcePages,
    newLanguage: [],
    returns: [],
    steps: l.items.map((item) => ({
      id: `a-${item.id}`,
      kind: "reading",
      ability: "reading",
      target: item.id,
      reviewKey: `${item.id}:reading`,
      sourceIds: [item.id],
      source: item.question,
      instruction: isDialogue
        ? "Read the exchange and choose."
        : "Read and choose.",
      ...(messages ? { messages } : { passage }),
      ...(item.glossary ? { glossary: item.glossary } : {}),
      options: [item.lt, ...item.distractors],
      answers: [item.lt],
      hint: "Find the part of the text that answers the question.",
      correction: `${item.lt} — ${item.en}`,
      // The passage is evidence for comprehension, never unaided production.
      answerVisible: true,
    })),
  };
}
function buildChapter(n) {
  const plan = chapterPlans[n],
    chapter = chapters[n - 1];
  const sources = sourceLessons
    .filter((l) => l.chapter === n - 1 && !l.optional)
    .map((l) => ({ ...l, items: l.items.map(courseItem) }));
  if (n === 3) {
    // The route teaches present travel forms and polite direction chunks.
    // Do not make untaught future forms a prerequisite for comprehension/writing.
    const reading = sources.find(
      (l) => l.id === "c3-situation-meeting-message",
    );
    reading.items = reading.items.map((i) => ({
      ...i,
      passage: i.passage
        .replace("Važiuosiu", "Važiuoju")
        .replace("eisiu", "einu"),
    }));
    const writing = sources.find((l) => l.id === "c3-writing");
    writing.items = writing.items.map((i) => ({
      ...i,
      lt: "Susitinkame penktadienį, pusę šeštos prie muziejaus. Aš važiuoju autobusu. Prie stoties pasukite į kairę.",
      en: "Write a meeting message. Give a day, time and place, then add how you travel or a short direction.",
    }));
  }
  if (n === 4) {
    const advert = sources.find((l) => l.id === "c4-situation-rental-ad");
    advert.items = advert.items.map((i) => ({
      ...i,
      glossary: [
        ["nuomojamas butas", "flat for rent"],
        ["per mėnesį", "per month"],
      ],
    }));
  }
  const items = sources
    .filter((l) => !["reading", "writing"].includes(l.kind))
    .flatMap((l) => l.items);
  const ledger = [];
  const teaching = [];
  const lexical = [];
  const lexicalContexts = new Map();
  for (const original of [
    ...sources.filter((l) => !["reading", "writing"].includes(l.kind)),
    ...supplementSources(n),
  ]) {
    let l = original;
    // Keep the accepted opening sequence as the first teaching, not a regenerated
    // greetings test. The rest of chapter 1 follows it.
    if (n === 1 && l.id === "c1l1") {
      const normalized = (text) => words(text).join(" ").toLowerCase();
      const openingModels = openingCourse.lessons
        .flatMap((l) => openingCourse.stepsFor(l, 0))
        .filter((q) => q.kind === "model");
      const covered = l.items.filter((i) =>
        openingModels.some((q) =>
          q.pairs.some(([lt]) => normalized(lt) === normalized(i.lt)),
        ),
      );
      covered.forEach((i) =>
        ledger.push({ source: i.id, disposition: "opening-and-return" }),
      );
      l = { ...l, items: l.items.filter((i) => !covered.includes(i)) };
    }
    const groups = chunks(
      l.items.filter((i) => i.role === "core"),
      3,
    );
    groups.forEach((group, g) => {
      const id = `a-${l.id}-${g + 1}`;
      const lesson = teachGroup({
        id,
        title: groups.length > 1 ? `${l.title} · ${g + 1}` : l.title,
        goal:
          l.kind === "vocabulary"
            ? "Learn a small set of words, then recall their meanings and spelling."
            : l.rule.split(/(?<=[.!?])\s+/)[0],
        pages: l.sourcePages || chapter.pages,
        items: group,
        note: l.rule,
      });
      lesson.sourceLesson = l.id;
      for (const i of group)
        ledger.push({
          source: i.id,
          disposition: "teach-and-return",
          lesson: id,
        });
      (l.kind === "vocabulary" ? lexical : teaching).push(lesson);
    });
    // Additional contexts get their own teaching. They are not falsely called
    // unseen transfer tests, nor used to award recall of a whole paradigm.
    const contexts = l.items.filter(
      (i) => i.role === "context" && !i.extension,
    );
    if (contexts.length) {
      const id = `a-${l.id}-use`;
      const contextLesson = {
        ...teachGroup({
          id,
          title: `${l.title} in use`,
          goal: "Connect the words with their sentence forms.",
          pages: l.sourcePages || chapter.pages,
          items: contexts,
          note:
            l.kind === "vocabulary"
              ? "Words can change their endings in a sentence. Compare the complete messages."
              : l.rule,
        }),
        sourceLesson: l.id,
      };
      if (l.kind === "vocabulary") lexicalContexts.set(l.id, contextLesson);
      else teaching.push(contextLesson);
      contexts.forEach((i) =>
        ledger.push({
          source: i.id,
          disposition: "supported-context-and-return",
          lesson: id,
        }),
      );
    }
  }
  // A little vocabulary, then useful phrases/forms. Wide vocabulary no longer
  // blocks the entire communicative spine at the front of a chapter.
  const ordered = [];
  if (n === 1)
    ordered.push(
      ...openingCourse.lessons.map((l) => ({
        ...l,
        sourcePages: "14–18",
        steps: openingCourse.stepsFor(l, 0),
      })),
    );
  while (lexical.length || teaching.length) {
    const lexicalBatch = lexical.splice(0, 2);
    for (const [slot, lesson] of lexicalBatch.entries()) {
      ordered.push(lesson);
      if (
        ![...lexical, ...lexicalBatch.slice(slot + 1)].some(
          (l) => l.sourceLesson === lesson.sourceLesson,
        ) &&
        lexicalContexts.has(lesson.sourceLesson)
      ) {
        ordered.push(lexicalContexts.get(lesson.sourceLesson));
        lexicalContexts.delete(lesson.sourceLesson);
      }
    }
    ordered.push(...teaching.splice(0, 2));
  }
  // Focused choices use competing forms the learner has already seen, including
  // this model. Do not pull unfamiliar distractors from a global word bank.
  const seenForms = new Set();
  const sourceById = new Map(
    [...items, ...supplementSources(n).flatMap((l) => l.items)].map((i) => [
      i.id,
      i,
    ]),
  );
  for (const lesson of ordered)
    for (let i = 0; i < lesson.steps.length; i++) {
      const q = lesson.steps[i];
      if (q.kind === "model")
        q.pairs.forEach(([lt]) =>
          words(lt).forEach((w) => seenForms.add(w.toLowerCase())),
        );
      if (q.kind !== "bank" || !q.id.endsWith("-guided")) continue;
      const item = sourceById.get(q.target);
      const answer = item && gapAnswer(item);
      if (!answer) continue;
      const family = courseFormFamilies.find((f) =>
        f.includes(answer.toLowerCase()),
      );
      const alternatives = [...new Set(family || [])]
        .filter((w) => w !== answer.toLowerCase() && seenForms.has(w))
        .slice(0, 2);
      if (!alternatives.length) continue;
      lesson.steps[i] = {
        ...q,
        kind: "gap",
        ability: "form-choice",
        source: item.cloze,
        translation: item.en,
        answers: [answer],
        options: [answer, ...alternatives],
        words: [answer, ...alternatives],
        formAlternatives: [answer, ...alternatives],
        wrong: alternatives,
        instruction: "Complete the sentence.",
      };
    }
  const conversation = conversationLesson(n, plan.conversation);
  // Place the supported exchange before the last reading/writing tasks.
  ordered.splice(Math.min(8, ordered.length), 0, conversation);
  const readings = sources
    .filter((l) => l.kind === "reading")
    .map(readingLesson);
  ordered.push(...readings);
  for (const l of sources.filter((l) =>
    ["reading", "writing"].includes(l.kind),
  ))
    l.items.forEach((i) => ledger.push({ source: i.id, disposition: l.kind }));
  const revision =
    n === 3
      ? sequenceChapterThree(ordered)
      : n === 4
        ? sequenceChapterFour(ordered)
        : { lessons: ordered, retiredLessons: [] };
  if (n === 3)
    revision.lessons = completeChapterThreeFunctions(
      extendChapterThree(revision.lessons),
    );
  if (n === 4)
    revision.lessons = completeChapterFourFunctions(revision.lessons);
  let lessons = scheduleReturns(revision.lessons, n);
  const retiredLessons = revision.retiredLessons;
  // A replacement must show the old expression in an actual model, possibly
  // inside a useful sentence. Keep exact provenance for the inventory audit.
  for (const entry of ledger.filter((e) =>
    retiredLessons.some((l) => l.id === e.lesson),
  )) {
    const item = [
      ...items,
      ...supplementSources(n).flatMap((l) => l.items),
    ].find((i) => i.id === entry.source);
    if (!item) throw new Error(`Missing retired source item: ${entry.source}`);
    const normalize = (s) => words(s).join(" ").toLowerCase();
    const needle = ` ${normalize(item.lt)} `;
    const replacement = lessons
      .flatMap((l) => l.steps.map((q) => ({ l, q })))
      .find(
        ({ q }) =>
          q.kind === "model" &&
          q.pairs.some(([lt]) => ` ${normalize(lt)} `.includes(needle)),
      );
    if (!replacement)
      throw new Error(`Missing replacement teaching: ${item.id}`);
    entry.previousLesson = entry.lesson;
    entry.lesson = replacement.l.id;
    entry.model = replacement.q.id;
    entry.disposition = "taught-in-context";
  }
  const taught = lessons
    .flatMap((l) => l.steps)
    .filter((q) => q.kind === "model")
    .flatMap((q) => q.pairs.map(([lt]) => lt));
  const checks = plan.checks.map(
    ([source, translation, answer, wrong, correction, topic], i) => {
      if (
        !taught.some((lt) =>
          words(lt.toLowerCase()).includes(answer.toLowerCase()),
        )
      )
        throw new Error(`Untaught check: c${n} ${answer}`);
      const prior = lessons
        .flatMap((l) => l.steps)
        .find(
          (q) =>
            q.kind === "gap-type" &&
            q.answers[0].toLowerCase() === answer.toLowerCase(),
        );
      return {
        id: `a-c${n}-mixed-${i}`,
        kind: "gap-type",
        ability: "form-recall",
        target: prior?.target || `c${n}:mixed:${topic}`,
        reviewKey: prior?.reviewKey || `c${n}:mixed:${topic}`,
        source,
        translation,
        answers: [answer],
        words: [answer, wrong],
        wrong: [wrong],
        formAlternatives: [answer, wrong],
        instruction: "Complete the sentence.",
        hint: "Use the meaning and surrounding words to choose the form.",
        correction,
        changedContext: true,
        prerequisiteTopic: topic,
        ...(prior ? { returnOf: prior.id } : {}),
      };
    },
  );
  const editBase = checks[0];
  const wrongTokens = words(editBase.source.replace("___", editBase.wrong[0]));
  const editIndex = words(editBase.source.split("___")[0]).length;
  checks.push({
    ...editBase,
    id: `a-c${n}-repair-form`,
    kind: "edit",
    ability: "form-repair",
    source: editBase.translation,
    tokens: wrongTokens,
    editIndex,
    replacements: wrongTokens.map((w, i) =>
      i === editIndex ? [editBase.answers[0], editBase.wrong[0]] : [w],
    ),
    instruction: "Choose the wrong word, then replace it.",
    changedContext: false,
    returnOf: undefined,
  });
  lessons.push({
    id: `a-c${n}-mixed-check`,
    title: "Use it together",
    goal: plan.goal,
    sourcePages: chapter.pages,
    newLanguage: [],
    returns: [],
    steps: checks,
  });
  for (const l of sources.filter((l) => l.kind === "writing")) {
    const item = l.items[0];
    lessons.push({
      id: `a-${l.id}`,
      title: l.title,
      goal: item.en.replace(/, as in the book;.*$/, "."),
      sourcePages: l.sourcePages,
      newLanguage: [],
      returns: [],
      steps: [
        {
          id: `a-${item.id}`,
          kind: "writing",
          ability: "self-reviewed-writing",
          target: item.id,
          sourceIds: [item.id],
          source: l.title,
          instruction: item.en.replace(/, as in the book;.*$/, "."),
          sample: item.lt,
          checklist: item.rubric,
          hint: "Use short sentences and check each point in the list.",
          correction: "Compare your message with the example.",
        },
      ],
    });
  }
  const reference = [...lessons, ...retiredLessons].flatMap((l) =>
    l.steps
      .filter((q) => q.kind === "model")
      .flatMap((q) => q.pairs.map(([lt, en]) => ({ target: q.id, lt, en }))),
  );
  return {
    number: n,
    key: `sakyk.authored.chapter-${n}.v1`,
    version: 1,
    title: chapter.lt,
    eyebrow: `CHAPTER ${n} · ${chapter.title.toUpperCase()}`,
    description: plan.goal,
    prerequisites: plan.prerequisites,
    completeTitle: `Chapter ${n} complete.`,
    allowDirectEntry: true,
    assessmentPolicy: lithuanianAssessmentPolicy,
    lessons,
    retiredLessons,
    reference,
    repairFor,
    ledger,
    wordbook: dedupe(
      items.filter((i) => i.role === "core").map((i) => [i.lt, i.en]),
      (x) => x[0],
    ),
    // Wider country/language lists remain reachable in the original optional
    // reference; no old completion is converted into new recall evidence.
    optionalSourceIds: sourceLessons
      .filter((l) => l.chapter === n - 1 && l.optional)
      .flatMap((l) => l.items.map((i) => i.id)),
  };
}
export const authoredChapters = chapters.map((_, i) =>
  i === 1
    ? {
        ...chapterTwoCourse,
        number: 2,
        prerequisites:
          "Build on chapter 1 greetings, personal pronouns and numbers 1–10.",
      }
    : buildChapter(i + 1),
);
export const authoredChapter = (n) =>
  authoredChapters.find((c) => c.number === Number(n));

// Course continuation recalls earlier chapters too. Keep their target/review IDs,
// so this is evidence for the actual earlier word/form, not a new achievement.
for (let index = 2; index < authoredChapters.length; index++) {
  const course = authoredChapters[index],
    previous = authoredChapters[index - 1];
  const candidates = dedupe(
    previous.lessons
      .flatMap((l) => l.steps)
      .filter(
        (q) =>
          ["type", "gap-type"].includes(q.kind) &&
          !q.plannedReturn &&
          !q.repair &&
          !q.changedContext,
      ),
    (q) => q.reviewKey || q.target,
  );
  const selected =
    course.number === 3
      ? ["c2-drinks-recall", "c2-drinks-recall-1", "c2-order-tea"]
          .map((id) => candidates.find((q) => q.id === id))
          .filter(Boolean)
      : course.number === 4
        ? [
            "a-c3-route-meeting-bank-recall",
            "a-c3-route-friday-recall",
            "a-c3-route-time-two-recall",
          ]
            .map((id) => candidates.find((q) => q.id === id))
            .filter(Boolean)
        : [
            0,
            Math.floor(candidates.length / 3),
            Math.floor((candidates.length * 2) / 3),
            candidates.length - 1,
          ]
            .map((i) => candidates[i])
            .filter(Boolean);
  course.lessons.splice(3, 0, {
    id: `a-c${course.number}-earlier`,
    title:
      course.number === 3
        ? "A café stop"
        : course.number === 4
          ? "Arrange a viewing"
          : "Bring back earlier language",
    goal:
      course.number === 3
        ? "Recall two drinks and a polite order for a café stop."
        : course.number === 4
          ? "Recall a meeting point, day and time before asking about a flat."
          : "Retrieve familiar words and forms before adding more.",
    sourcePages: "review",
    newLanguage: [],
    returns: selected.map((q) => q.answers[0]),
    steps: selected.map((q) => ({
      ...q,
      id: `a-c${course.number}-bridge-${q.id}`,
      plannedReturn: true,
      returnOf: q.id,
      fromChapter: previous.number,
    })),
  });
  for (const q of selected) {
    const models = new Set(
      previous.lessons
        .flatMap((l) => l.steps)
        .filter((m) => m.kind === "model" && m.targets.includes(q.target))
        .map((m) => m.id),
    );
    course.reference.push(
      ...previous.reference
        .filter((row) => row.target === q.target || models.has(row.target))
        .map((row) => ({ ...row, target: q.target })),
    );
  }
}
