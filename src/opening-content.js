// Authored Stage A sequence. The contract lives in docs/stage-a-experience.md.
// New versions never rewrite historical course or earlier preview records.
import { createCourseRuntime } from "./authored-course.js";
import { lithuanianAssessmentPolicy } from "./lithuanian-assessment-policy.js";
import { normalizeAnswer } from "./answer-assessment.js";
export const OPENING_VERSION = 3;
export const OPENING_KEY = "sakyk.opening-sequence.v3";
const model = (id, title, pairs, note, targets) => ({
  id,
  kind: "model",
  title,
  pairs,
  note,
  targets,
});
const choice = (
  id,
  target,
  source,
  options,
  answer,
  correction,
  extra = {},
) => ({
  id,
  kind: "choice",
  target,
  ability: "meaning",
  source,
  instruction: "Choose the meaning.",
  options,
  answers: [answer],
  hint:
    {
      greeting: "Look for the greeting you learned.",
      thanks: "Think about giving thanks, rather than replying to it.",
      "thanks-reply": "This is a response to someone’s thanks.",
      "name-frame": "Mano refers to the speaker. Whose name is given?",
      "name-question": "Is the speaker asking for a name or giving one?",
      "person-reference": "Follow who aš and tu refer to in each message.",
      esu: "Your reply needs to be about yourself.",
      esi: "Who does tu refer to?",
    }[target] || "Look back at the pattern you learned.",
  correction,
  ...extra,
});
const type = (id, target, source, answers, words, correction, extra = {}) => ({
  id,
  kind: "type",
  target,
  ability: "word-recall",
  source,
  instruction: "Write in Lithuanian.",
  answers,
  words,
  hint: correction,
  correction,
  ...extra,
});
const bank = (id, source, words, answers, extra = {}) => ({
  id,
  kind: "bank",
  target: "name-frame",
  ability: "construction",
  source,
  instruction: "Build the Lithuanian.",
  words,
  answers,
  hint: "Mano means “my”; vardas means “name”.",
  correction: "Mano vardas means “My name”.",
  ...extra,
});
const gap = (id, person, name, typed = false) => ({
  id,
  kind: typed ? "gap-type" : "gap",
  target: person === "Aš" ? "esu" : "esi",
  ability: typed ? "form-recall" : "form-choice",
  source: `${person} ___ ${name}.`,
  translation: `${person === "Aš" ? "I am" : "You are"} ${name}.`,
  instruction: "Complete the sentence.",
  ...(typed ? {} : { options: ["esu", "esi"] }),
  words: ["esu", "esi"],
  formAlternatives: ["esu", "esi"],
  answers: [person === "Aš" ? "esu" : "esi"],
  hint:
    person === "Aš"
      ? "Aš means “I”. Which form goes with I?"
      : "Tu means “you”. Which form goes with you?",
  correction:
    person === "Aš"
      ? "Aš goes with esu: Aš esu " + name + "."
      : "Tu goes with esi: Tu esi " + name + ".",
});
const thanksRecall = (id) =>
  type(
    id,
    "thanks",
    "Thank you!",
    ["Ačiū!", "Dėkui!"],
    ["Labas!", "Ačiū!", "Prašom!"],
    "Ačiū! — Thank you.",
    {
      hint: "Think of the word beginning with A.",
      assessmentPolicy: { spelling: "diacritics" },
      wrong: ["labas", "prašom", "prasom"],
    },
  );
const replyChoice = (id) =>
  choice(
    id,
    "thanks-reply",
    "Ačiū!",
    ["Prašom!", "Labas!"],
    "Prašom!",
    "Prašom replies to thanks. Labas says hello.",
    { instruction: "Choose a reply.", ability: "reply-selection" },
  );
export const openingLessons = [
  {
    id: "first-words",
    title: "Hello and thank you",
    goal: "Greet someone, thank them, and reply to thanks.",
    newLanguage: [
      "Labas · Hello",
      "Ačiū · Thank you",
      "Prašom · You’re welcome",
    ],
    returns: [],
    steps: [
      model(
        "hello-model",
        "Two useful words.",
        [
          ["Labas!", "Hello!"],
          ["Ačiū!", "Thank you!"],
        ],
        "Use Labas to greet someone. Use Ačiū to thank them.",
        ["greeting", "thanks"],
      ),
      choice(
        "hello-choice",
        "greeting",
        "Hello!",
        ["Labas!", "Ačiū!"],
        "Labas!",
        "Labas means “Hello”. Ačiū means “Thank you”.",
        { instruction: "Choose the Lithuanian." },
      ),
      choice(
        "thanks-meaning",
        "thanks",
        "Ačiū!",
        ["Thank you!", "Hello!"],
        "Thank you!",
        "Ačiū means “Thank you”.",
      ),
      choice(
        "hello-meaning",
        "greeting",
        "Labas!",
        ["Thank you!", "Hello!"],
        "Hello!",
        "Labas means “Hello”.",
      ),
      choice(
        "thanks-choice",
        "thanks",
        "Thank you!",
        ["Ačiū!", "Labas!"],
        "Ačiū!",
        "Ačiū means “Thank you”.",
        { instruction: "Choose the Lithuanian." },
      ),
      model(
        "reply-model",
        "When someone says thank you.",
        [
          ["Ačiū!", "Thank you!"],
          ["Prašom!", "You’re welcome!"],
        ],
        "Reply to Ačiū with Prašom.",
        ["thanks-reply"],
      ),
      choice(
        "reply-meaning",
        "thanks-reply",
        "Prašom!",
        ["You’re welcome!", "Thank you!"],
        "You’re welcome!",
        "Here, Prašom means “You’re welcome”.",
      ),
      replyChoice("thanks-reply"),
      {
        id: "first-match",
        kind: "match",
        target: "first-words",
        ability: "meaning",
        source: "Bring the words together.",
        instruction: "Choose a Lithuanian word, then its English meaning.",
        pairs: [
          ["Labas!", "Hello!"],
          ["Ačiū!", "Thank you!"],
          ["Prašom!", "You’re welcome!"],
        ],
        hint: "First match the greeting. Then separate giving thanks from replying to it.",
      },
      choice(
        "first-reading",
        "thanks-reply",
        "What does the second message do?",
        ["Acknowledge thanks.", "Say hello."],
        "Acknowledge thanks.",
        "Prašom acknowledges Ačiū — “Thank you”.",
        {
          kind: "reading",
          ability: "reading",
          instruction: "Read the exchange and choose.",
          messages: [
            { speaker: "Rasa", text: "Ačiū!" },
            { speaker: "Tomas", text: "Prašom!", outgoing: true },
          ],
        },
      ),
      choice(
        "greeting-return",
        "greeting",
        "Labas!",
        ["Labas!", "Prašom!"],
        "Labas!",
        "Reply to a greeting with Labas.",
        { ability: "reply-selection", instruction: "Choose a reply." },
      ),
      choice(
        "thanks-return",
        "thanks-reply",
        "You’re welcome!",
        ["Prašom!", "Ačiū!"],
        "Prašom!",
        "Prašom replies to thanks; Ačiū gives thanks.",
        { instruction: "Choose the Lithuanian." },
      ),
    ],
  },
  {
    id: "your-name",
    title: "Give your name",
    goal: "Introduce yourself and understand a name question.",
    newLanguage: [
      "Mano vardas… · My name is…",
      "Koks tavo vardas? · What is your name?",
    ],
    returns: ["Greetings and thanks"],
    steps: [
      model(
        "name-model",
        "A name changes. The pattern stays.",
        [
          ["Mano vardas Rasa.", "My name is Rasa."],
          ["Mano vardas Tomas.", "My name is Tomas."],
        ],
        "Mano means “my”; vardas means “name”. Keep Mano vardas and add a name.",
        ["name-frame"],
      ),
      choice(
        "name-meaning",
        "name-frame",
        "Mano vardas Rasa.",
        ["My name is Rasa.", "Your name is Rasa."],
        "My name is Rasa.",
        "Mano means “my”: the speaker gives their own name.",
      ),
      bank(
        "name-bank",
        "My name is Tomas.",
        ["Tomas", "vardas", "Mano"],
        ["Mano vardas Tomas.", "Tomas mano vardas."],
      ),
      choice(
        "name-gap",
        "name-frame",
        "Mano ___ Lina.",
        ["vardas", "labas"],
        "vardas",
        "Mano vardas means “My name”.",
        {
          kind: "gap",
          ability: "form-choice",
          translation: "My name is Lina.",
          instruction: "Complete the sentence.",
        },
      ),
      thanksRecall("thanks-recall"),
      model(
        "name-question-model",
        "Ask a name. Give yours.",
        [
          ["Koks tavo vardas?", "What is your name?"],
          ["Mano vardas Lina.", "My name is Lina."],
        ],
        "Use Koks tavo vardas? with one person informally. Tavo means “your”.",
        ["name-question"],
      ),
      choice(
        "question-meaning",
        "name-question",
        "Koks tavo vardas?",
        ["What is your name?", "My name is Rasa."],
        "What is your name?",
        "Koks tavo vardas? asks for the other person’s name.",
      ),
      choice(
        "meet-greeting",
        "greeting",
        "Labas!",
        ["Labas!", "Prašom!"],
        "Labas!",
        "Labas answers a greeting.",
        {
          kind: "chat",
          ability: "reply-selection",
          instruction: "Reply to Rasa.",
          speaker: "Rasa",
          thread: "meet",
          next: "Koks tavo vardas?",
          wrongNext: "Koks tavo vardas?",
          followGloss: "What is your name?",
        },
      ),
      bank(
        "meet-name",
        "Koks tavo vardas?",
        ["Mano", "Tomas", "vardas"],
        ["Mano vardas Tomas.", "Tomas mano vardas."],
        {
          kind: "chat-bank",
          instruction: "Introduce yourself as Tomas.",
          speaker: "Rasa",
          thread: "meet",
          continuation: true,
          next: "Mano vardas Rasa.",
          wrongNext: "Koks tavo vardas?",
          gloss: "What is your name?",
        },
      ),
      choice(
        "name-reading",
        "name-question",
        "What does Lina ask for?",
        ["Your name.", "A thank you."],
        "Your name.",
        "Koks tavo vardas? means “What is your name?”",
        {
          kind: "reading",
          ability: "reading",
          instruction: "Read Lina’s message and choose.",
          messages: [
            {
              speaker: "Lina",
              text: "Labas! Mano vardas Lina. Koks tavo vardas?",
            },
          ],
        },
      ),
      replyChoice("reply-return"),
    ],
  },
  {
    id: "i-and-you",
    title: "I am, you are",
    goal: "Change the verb when you talk about yourself or someone else.",
    newLanguage: ["Aš esu… · I am…", "Tu esi… · You are…"],
    returns: ["Names, greetings and thanks"],
    steps: [
      {
        ...model(
          "person-model",
          "The person changes the verb.",
          [
            ["Aš esu Rasa.", "I am Rasa."],
            ["Tu esi Tomas.", "You are Tomas."],
          ],
          "Aš (I) goes with esu. Tu (you, one familiar person) goes with esi. The name does not change the verb.",
          ["esu", "esi"],
        ),
        focus: ["esu", "esi"],
      },
      gap("i-form", "Aš", "Tomas"),
      choice(
        "you-meaning",
        "esi",
        "Tu esi Rasa.",
        ["You are Rasa.", "I am Rasa."],
        "You are Rasa.",
        "Tu means “you”. Aš means “I”.",
      ),
      gap("you-form", "Tu", "Lina"),
      bank(
        "i-bank",
        "I am Tomas.",
        ["esi", "Tomas", "Aš", "esu"],
        ["Aš esu Tomas.", "Esu Tomas.", "Tomas aš esu."],
        {
          target: "esu",
          hint: "Aš means “I”. Choose its verb form.",
          correction: "Use esu with aš: Aš esu Tomas.",
        },
      ),
      choice(
        "thanks-spaced",
        "thanks",
        "Thank you!",
        ["Ačiū!", "Prašom!"],
        "Ačiū!",
        "Ačiū gives thanks; Prašom replies to thanks.",
        { instruction: "Choose the Lithuanian." },
      ),
      {
        id: "fix-person",
        kind: "edit",
        target: "esu",
        ability: "error-repair",
        source: "I am Lina.",
        instruction: "Tap the wrong word, then replace it.",
        tokens: ["Aš", "esi", "Lina."],
        replacements: [
          ["Aš", "Tu"],
          ["esu", "esi"],
          ["Lina.", "Tomas."],
        ],
        editIndex: 1,
        answers: ["esu"],
        hint: "The person is aš (I). Check its verb.",
        correction: "Change esi to esu: Aš esu Lina.",
      },
      gap("i-form-recall", "Aš", "Lina", true),
      choice(
        "person-contrast",
        "esu",
        "I am Rasa.",
        ["Aš esu Rasa.", "Tu esi Rasa."],
        "Aš esu Rasa.",
        "Aš esu means “I am”. Tu esi means “You are”.",
        { instruction: "Choose the Lithuanian.", ability: "person-meaning" },
      ),
      gap("you-form-recall", "Tu", "Tomas", true),
      type(
        "reply-recall",
        "thanks-reply",
        "Ačiū!",
        ["Prašom!", "Nėra už ką!"],
        ["Labas!", "Prašom!", "Ačiū!"],
        "Prašom! — You’re welcome.",
        {
          assessmentPolicy: { spelling: "diacritics" },
          ability: "reply-recall",
          instruction: "Write a reply.",
          hint: "Reply “You’re welcome”. The word begins with P.",
          wrong: ["labas", "ačiū", "aciu"],
        },
      ),
    ],
  },
  {
    id: "meet-someone",
    title: "Meet someone",
    goal: "Put your greetings, names and person forms together.",
    newLanguage: [],
    returns: ["All three earlier lessons"],
    steps: [],
  },
];
export function finalSteps(variant) {
  const [partner, you] = variant === 1 ? ["Rasa", "Mantas"] : ["Lina", "Tomas"];
  return [
    choice(
      "final-greeting",
      "greeting",
      "Labas!",
      ["Labas!", "Ačiū!"],
      "Labas!",
      "Use Labas to return a greeting.",
      {
        kind: "chat",
        ability: "reply-selection",
        instruction: `Reply to ${partner}.`,
        speaker: partner,
        thread: "final",
        next: "Koks tavo vardas?",
        wrongNext: "Koks tavo vardas?",
      },
    ),
    choice(
      "final-name",
      "esu",
      "Koks tavo vardas?",
      [`Aš esu ${you}.`, `Tu esi ${you}.`],
      `Aš esu ${you}.`,
      "Aš esu introduces yourself. Tu esi talks about the other person.",
      {
        kind: "chat",
        ability: "reply-selection",
        instruction: `Introduce yourself as ${you}.`,
        speaker: partner,
        thread: "final",
        continuation: true,
        next: `Mano vardas ${partner}.`,
        wrongNext: "Koks tavo vardas?",
      },
    ),
    choice(
      "final-reading",
      "name-frame",
      "Which description matches these messages?",
      [
        `Lina gives her name; Tomas gives his.`,
        `Lina asks a name; Tomas gives his.`,
      ],
      `Lina gives her name; Tomas gives his.`,
      "Both use Mano vardas — “My name”. Neither asks Koks tavo vardas?",
      {
        kind: "reading",
        ability: "reading",
        instruction: "Read the exchange and choose.",
        messages: [
          { speaker: "Lina", text: "Mano vardas Lina." },
          { speaker: "Tomas", text: "Mano vardas Tomas.", outgoing: true },
        ],
      },
    ),
    gap("final-form", "Tu", "Rasa", true),
    thanksRecall("final-thanks"),
    bank(
      "final-name-bank",
      "My name is Mantas.",
      ["Mano", "vardas", "Mantas", "tavo"],
      ["Mano vardas Mantas.", "Mantas mano vardas."],
      {
        hint: "Mano means “my”; tavo means “your”. Whose name are you giving?",
        correction: "Mano means “my”. Use Mano vardas Mantas.",
      },
    ),
    replyChoice("final-reply"),
  ];
}
export const openingSteps = openingLessons.flatMap((l) =>
  l.steps.length ? l.steps : finalSteps(0),
);
export const openingReference = [
  { after: 0, lt: "Labas!", en: "Hello!", target: "greeting" },
  { after: 0, lt: "Ačiū!", en: "Thank you!", target: "thanks" },
  {
    after: 0,
    lt: "Prašom!",
    en: "You’re welcome! (reply to thanks)",
    target: "thanks-reply",
  },
  { after: 1, lt: "Mano vardas…", en: "My name is…", target: "name-frame" },
  {
    after: 1,
    lt: "Koks tavo vardas?",
    en: "What is your name?",
    target: "name-question",
  },
  { after: 2, lt: "Aš esu…", en: "I am…", target: "esu" },
  { after: 2, lt: "Tu esi…", en: "You are…", target: "esi" },
];
export const normalizeOpening = normalizeAnswer;
export function repairFor(step) {
  const shared = {
    id: `${step.id}-repair`,
    target: step.target,
    repair: true,
    ability: "supported-repair",
    instruction: "Choose the answer.",
  };
  if (["esu", "esi"].includes(step.target)) {
    const q = gap(shared.id, step.target === "esu" ? "Aš" : "Tu", "Rasa");
    return {
      ...q,
      ...shared,
      teaching:
        step.target === "esu"
          ? "Aš → esu. Use esu when you mean “I am”."
          : "Tu → esi. Use esi when you mean “You are”.",
    };
  }
  if (
    step.target === "thanks" ||
    step.target === "thanks-reply" ||
    step.target === "greeting"
  ) {
    const words =
      step.target === "thanks"
        ? ["Thank you!", "Ačiū!", "Labas!"]
        : step.target === "greeting"
          ? ["Hello!", "Labas!", "Prašom!"]
          : ["You’re welcome!", "Prašom!", "Ačiū!"];
    return {
      ...choice(
        shared.id,
        step.target,
        words[0],
        [words[2], words[1]],
        words[1],
        `${words[1]} — ${words[0]}`,
      ),
      ...shared,
      teaching: step.correction,
    };
  }
  return {
    ...choice(
      shared.id,
      "name-frame",
      "My name is Rasa.",
      ["Mano vardas Rasa.", "Koks tavo vardas?"],
      "Mano vardas Rasa.",
      "Mano vardas gives a name. Koks tavo vardas? asks for one.",
    ),
    ...shared,
    teaching: "Mano vardas… means “My name is…”.",
  };
}
export const openingCourse = {
  assessmentPolicy: lithuanianAssessmentPolicy,
  key: OPENING_KEY,
  version: OPENING_VERSION,
  lessons: openingLessons,
  reference: openingReference,
  eyebrow: "FIRST CONVERSATIONS",
  title: "A little Lithuanian. A real conversation.",
  description:
    "Greet someone, exchange names, and learn how “I am” changes to “you are”.",
  completeTitle: "You’ve finished the opening sequence.",
  stepsFor: (lesson, variant) =>
    lesson.steps.length ? lesson.steps : finalSteps(variant),
  repairFor,
};
export const openingRuntime = createCourseRuntime(openingCourse);
export const {
  freshOpening,
  startOpening,
  answerOpening,
  advanceOpening,
  helpOpening,
  matchOpening,
  gradeOpening,
} = openingRuntime;
