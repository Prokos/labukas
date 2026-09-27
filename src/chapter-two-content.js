import { createCourseRuntime } from "./authored-course.js";
import { lithuanianAssessmentPolicy } from "./lithuanian-assessment-policy.js";
import { chapterTwoLexicon } from "./chapter-two-lexicon.js";
import {
  adjectiveContexts,
  preferenceWords,
  preferenceMeanings,
} from "./chapter-two-returns.js";

// Chapter 2, source pages 31–62. Original app exercises.
// Stable authored IDs are independent of instructional copy and word order.
const lessons = [];
const reference = [];
const targets = new Map();
const vocabularyGoals = {
  drinks: "Recognize drinks and snacks, then recall their Lithuanian names.",
  food: "Name bread, cheese and everyday meals.",
  produce: "Name familiar fruit and vegetables.",
  ingredients: "Recognize milk, meat and fish in a food description.",
  "more-menu": "Name more foods and drinks from a café menu.",
  sides: "Name ingredients and side dishes before using them in an order.",
  "menu-extras": "Distinguish meat and dairy choices on a menu.",
  "plural-words": "Recognize and recall the words for apples and buns.",
  "fruit-basket": "Name fruit you might buy or find on a menu.",
  "action-words":
    "Recognize the verbs for liking, wanting, eating, drinking, costing and paying.",
  cupboard: "Name sweets and everyday cupboard foods.",
  "describing-words": "Recognize colours, sizes and signs used at a café.",
  "fish-counter": "Distinguish fish and meat choices.",
  "menu-categories": "Recognize menu categories and daily specials.",
  "flavour-words": "Describe the taste and type of food.",
  "preparation-words": "Describe how food is prepared and served.",
  "vegetable-basket": "Name vegetables and eggs used in familiar dishes.",
  "cafe-words": "Recognize café places, people, signs and payment words.",
  "dairy-labels": "Recognize the category for dairy products.",
  "dish-words": "Recognize local dishes and common menu labels.",
  "food-traditions":
    "Name foods and activities in a short text about food traditions.",
};
const M = (id, title, pairs, note, focus = []) => {
  targets.set(id, pairs);
  reference.push(...pairs.map(([lt, en]) => ({ target: id, lt, en })));
  return {
    id,
    kind: "model",
    title,
    pairs,
    note,
    focus: focus.length ? focus : undefined,
    targets: [id],
  };
};
const C = (id, target, source, options, answer, correction, extra = {}) => ({
  id,
  kind: "choice",
  target,
  ability: "meaning",
  source,
  instruction: "Choose the meaning.",
  options,
  answers: [answer],
  hint: "Think about the contrast you learned.",
  correction,
  ...extra,
});
const G = (
  id,
  target,
  source,
  translation,
  options,
  answer,
  correction,
  typed = false,
) => ({
  ...C(id, target, source, typed ? undefined : options, answer, correction),
  kind: typed ? "gap-type" : "gap",
  ability: typed ? "form-recall" : "form-choice",
  translation,
  instruction: "Complete the sentence.",
  words: options,
  hint: "Look at the person and the word before the gap. Which pattern do they require?",
  formAlternatives: options,
  wrong: options.filter((x) => x !== answer),
});
const B = (id, target, source, words, answers, correction, extra = {}) => ({
  id,
  kind: "bank",
  target,
  ability: "construction",
  source,
  words,
  answers,
  instruction: "Build the Lithuanian.",
  hint: "Build the message around its verb, then check the noun endings.",
  correction,
  ...extra,
});
const T = (id, target, source, answers, words, correction, extra = {}) => ({
  id,
  kind: "type",
  target,
  ability: "word-recall",
  source,
  answers,
  words,
  instruction: "Write in Lithuanian.",
  hint: "Recall the word from the earlier examples.",
  correction,
  ...extra,
});
const E = (
  id,
  target,
  translation,
  tokens,
  editIndex,
  replacement,
  options,
  correction,
) => ({
  id,
  kind: "edit",
  target,
  ability: "form-repair",
  source: translation,
  instruction: "Choose the wrong word, then replace it.",
  tokens,
  editIndex,
  replacements: tokens.map((t, i) => (i === editIndex ? options : [t])),
  answers: [replacement],
  hint: "Check the ending required by the surrounding words.",
  correction,
});
const R = (
  id,
  target,
  text,
  source,
  options,
  answer,
  correction,
  extra = {},
) => ({
  ...C(id, target, source, options, answer, correction),
  kind: "reading",
  ability: "reading",
  instruction: "Read and choose.",
  passage: text,
  ...extra,
});
const CHAT = (
  id,
  target,
  thread,
  source,
  instruction,
  options,
  answers,
  next,
  extra = {},
) => ({
  ...C(
    id,
    target,
    source,
    options,
    answers[0],
    `One suitable reply: ${answers[0]}`,
  ),
  kind: "chat-choice",
  ability: "social-reply",
  speaker: "Padavėja",
  thread,
  instruction,
  answers,
  next,
  wrongNext: next,
  ...extra,
});
const L = (id, title, goal, pages, newLanguage, returns, steps) => {
  lessons.push({
    id: `c2-${id}`,
    title,
    goal,
    sourcePages: pages,
    newLanguage,
    returns,
    steps,
  });
};
function V(id, title, pages, groups, returns = []) {
  const steps = [];
  const lexicalTarget = (lt) => `c2-word:${lt}`;
  for (let g = 0; g < groups.length; g++) {
    const pairs = groups[g],
      target = `c2-${id}-${g}`;
    steps.push(
      M(
        target,
        title,
        pairs,
        "Learn this small group, then use it in the exercises that follow.",
      ),
    );
    steps.at(-1).targets.push(...pairs.map((p) => lexicalTarget(p[0])));
    steps.at(-1).lexemes = pairs.map((p) => p[0]);
    for (let i = 0; i < pairs.length; i++)
      steps.push(
        C(
          `${target}-meaning-${i}`,
          lexicalTarget(pairs[i][0]),
          pairs[i][0],
          pairs.map((p) => p[1]),
          pairs[i][1],
          `${pairs[i][0]} — ${pairs[i][1]}`,
        ),
      );
    steps.push({
      id: `${target}-match`,
      kind: "match",
      target,
      ability: "word-meaning",
      source: "Match the words and meanings.",
      instruction: "Choose a matching pair in either order.",
      pairs,
      hint: "Pair each Lithuanian word with its English meaning.",
      correction: "Compare the words with their meanings.",
    });
    for (let i = 0; i < pairs.length; i++)
      steps.push(
        C(
          `${target}-return-${i}`,
          lexicalTarget(pairs[i][0]),
          pairs[i][1],
          pairs.map((p) => p[0]),
          pairs[i][0],
          `${pairs[i][0]} — ${pairs[i][1]}`,
          { instruction: "Choose the Lithuanian." },
        ),
      );
  }
  // Retrieval only after intervening items, with a word-bank fallback.
  groups.flat().forEach(([lt, en], index) => {
    steps.push(
      T(
        index === 0 ? `c2-${id}-recall` : `c2-${id}-recall-${index}`,
        lexicalTarget(lt),
        en,
        [lt],
        groups.flat().map((p) => p[0]),
        `${lt} — ${en}`,
        {
          // These are real case forms, not spelling slips in a dictionary-word task.
          wrong:
            {
              kava: ["kavą", "kavos"],
              duona: ["duoną", "duonos"],
              obuolys: ["obuolį", "obuolio"],
              pienas: ["pieną", "pieno"],
              pyragas: ["pyragą", "pyrago"],
              grybai: ["grybus", "grybų"],
              kiauliena: ["kiaulieną", "kiaulienos"],
            }[lt] || [],
        },
      ),
    );
  });
  L(
    id,
    title,
    vocabularyGoals[id] ||
      "Recognize these café words and recall them without choices.",
    pages,
    groups.flat().map((p) => `${p[0]} · ${p[1]}`),
    returns,
    steps,
  );
}

V("drinks", "Drinks and a snack", "32, 35", [
  [
    ["kava", "coffee"],
    ["arbata", "tea"],
    ["vanduo", "water"],
  ],
  [
    ["sultys", "juice"],
    ["bandelė", "bun"],
    ["sumuštinis", "sandwich"],
  ],
]);
L(
  "first-order",
  "Order a drink",
  "Ask for a drink and respond to a follow-up.",
  "34, 37, 40",
  [
    "Norėčiau… · I would like…",
    "kava → kavos",
    "arbata → arbatos",
    "vanduo → vandens",
  ],
  ["drinks"],
  [
    M(
      "c2-order",
      "From the menu to your order",
      [
        ["Norėčiau kavos.", "I would like coffee."],
        ["Norėčiau arbatos.", "I would like tea."],
        ["Norėčiau vandens.", "I would like water."],
      ],
      "Norėčiau is a polite request. The drink changes to the genitive: kava → kavos, arbata → arbatos, vanduo → vandens.",
      ["kavos", "arbatos", "vandens"],
    ),
    C(
      "c2-order-meaning",
      "c2-order",
      "Norėčiau arbatos.",
      ["I would like tea.", "I would like water."],
      "I would like tea.",
      "Arbatos is the request form of arbata.",
    ),
    G(
      "c2-order-coffee",
      "c2-order",
      "Norėčiau ___.",
      "I would like coffee.",
      ["kava", "kavos"],
      "kavos",
      "After norėčiau use the genitive: kavos.",
    ),
    B(
      "c2-order-bank",
      "c2-order",
      "I would like water.",
      ["Norėčiau", "vandens", "vanduo"],
      ["Norėčiau vandens."],
      "After norėčiau, vanduo becomes vandens.",
    ),
    G(
      "c2-order-tea",
      "c2-order",
      "Norėčiau ___.",
      "I would like tea.",
      ["arbata", "arbatos"],
      "arbatos",
      "After norėčiau use the genitive: arbatos.",
      true,
    ),
    M(
      "c2-offer",
      "Accept or decline",
      [
        ["Ko norėtumėte?", "What would you like?"],
        ["Dar ko nors?", "Anything else?"],
        ["Taip, ačiū.", "Yes, thank you."],
        ["Ačiū, ne.", "No, thank you."],
      ],
      "These are useful whole phrases. Norėtumėte addresses a customer politely; norėčiau gives your own request.",
    ),
    CHAT(
      "c2-order-chat1",
      "c2-order",
      "first-order",
      "Ko norėtumėte?",
      "Order coffee.",
      ["Norėčiau kavos.", "Norėčiau vandens."],
      ["Norėčiau kavos."],
      "Dar ko nors?",
    ),
    CHAT(
      "c2-order-chat2",
      "c2-offer",
      "first-order",
      "Dar ko nors?",
      "Decline anything else.",
      ["Ačiū, ne.", "Taip, ačiū."],
      ["Ačiū, ne."],
      "Prašom.",
      { continuation: true },
    ),
    G(
      "c2-order-water-return",
      "c2-order",
      "Norėčiau ___.",
      "I would like water.",
      ["vanduo", "vandens"],
      "vandens",
      "After norėčiau use the genitive: vandens.",
      true,
    ),
  ],
);
V(
  "food",
  "Bread, cheese and meals",
  "32",
  [
    [
      ["duona", "bread"],
      ["sūris", "cheese"],
      ["sriuba", "soup"],
    ],
    [
      ["salotos", "salad"],
      ["pica", "pizza"],
      ["makaronai", "pasta"],
    ],
  ],
  ["ordering a drink"],
);
L(
  "preferences",
  "Say what you like",
  "Distinguish who likes something, then answer for yourself.",
  "35, 42–45",
  ["man / tau", "jam / jai", "patinka / nepatinka"],
  ["drinks", "food"],
  [
    M(
      "c2-like",
      "The person changes; patinka stays",
      [
        ["Man patinka kava.", "I like coffee."],
        ["Tau patinka kava.", "You like coffee."],
        ["Man nepatinka arbata.", "I do not like tea."],
      ],
      "Use man for I and tau for informal you with patinka. Add ne- to express dislike. The food or drink stays in its menu form.",
      ["Man", "Tau", "nepatinka"],
    ),
    C(
      "c2-like-who",
      "c2-like",
      "Tau patinka sūris.",
      ["I like cheese.", "You like cheese."],
      "You like cheese.",
      "Tau identifies the listener, not the speaker.",
    ),
    G(
      "c2-like-me",
      "c2-like",
      "___ patinka sriuba.",
      "I like soup.",
      ["Man", "Tau"],
      "Man",
      "The person who likes it is I: man.",
    ),
    B(
      "c2-like-negative",
      "c2-like",
      "I do not like coffee.",
      ["Man", "nepatinka", "kava", "patinka"],
      ["Man nepatinka kava."],
      "Use man for yourself and nepatinka for dislike.",
    ),
    M(
      "c2-like-others",
      "Talk about him or her",
      [
        ["Jam patinka sūris.", "He likes cheese."],
        ["Jai patinka duona.", "She likes bread."],
      ],
      "Jis changes to jam; ji changes to jai. These dative forms identify the person who likes something.",
      ["Jam", "Jai"],
    ),
    R(
      "c2-like-profile",
      "c2-like-others",
      "Rasa: Man patinka arbata. Tomas: Man patinka kava.",
      "Who likes tea?",
      ["Rasa", "Tomas"],
      "Rasa",
      "Rasa says man patinka arbata.",
    ),
    G(
      "c2-like-her",
      "c2-like-others",
      "___ patinka arbata.",
      "She likes tea.",
      ["Jam", "Jai"],
      "Jai",
      "For she with patinka: jai.",
      true,
    ),
    G(
      "c2-like-him",
      "c2-like-others",
      "___ nepatinka kava.",
      "He does not like coffee.",
      ["Jam", "Jai"],
      "Jam",
      "For he with patinka: jam.",
      true,
    ),
    CHAT(
      "c2-like-reply",
      "c2-like",
      "likes",
      "Ar tau patinka arbata?",
      "Say you like tea.",
      ["Taip, man patinka.", "Taip, tau patinka."],
      ["Taip, man patinka."],
      "Man patinka kava.",
      { speaker: "Rasa" },
    ),
    G(
      "c2-like-noun",
      "c2-like",
      "Man nepatinka ___.",
      "I do not like tea.",
      ["arbata", "arbatos"],
      "arbata",
      "Even after nepatinka the thing stays nominative: arbata.",
    ),
  ],
);
V(
  "produce",
  "Fruit and vegetables",
  "32, 35",
  [
    [
      ["obuolys", "apple"],
      ["bananas", "banana"],
      ["morka", "carrot"],
    ],
    [
      ["bulvė", "potato"],
      ["pomidoras", "tomato"],
      ["agurkas", "cucumber"],
    ],
  ],
  ["preferences"],
);
L(
  "plurals",
  "One or several",
  "Recognize plural endings and use plural foods with patinka.",
  "35",
  ["-as → -ai", "-is / -ys → -iai", "-a → -os", "-ė → -ės"],
  ["fruit", "preferences"],
  [
    M(
      "c2-plural",
      "From one to several",
      [
        ["bananas → bananai", "banana → bananas"],
        ["sumuštinis → sumuštiniai", "sandwich → sandwiches"],
        ["obuolys → obuoliai", "apple → apples"],
      ],
      "These masculine patterns change the ending. Do not add an English -s.",
    ),
    G(
      "c2-plural-apples",
      "c2-plural",
      "Man patinka ___.",
      "I like apples.",
      ["obuolys", "obuoliai"],
      "obuoliai",
      "More than one apple: obuoliai.",
    ),
    C(
      "c2-plural-sandwich",
      "c2-plural",
      "sumuštiniai",
      ["a sandwich", "sandwiches"],
      "sandwiches",
      "-iai marks this plural.",
    ),
    M(
      "c2-plural-f",
      "Two feminine plural patterns",
      [
        ["morka → morkos", "carrot → carrots"],
        ["bulvė → bulvės", "potato → potatoes"],
        ["bandelė → bandelės", "bun → buns"],
      ],
      "For these nouns, -a becomes -os and -ė becomes -ės.",
    ),
    G(
      "c2-plural-carrot",
      "c2-plural-f",
      "Man patinka ___.",
      "I like carrots.",
      ["morka", "morkos"],
      "morkos",
      "Use the plural: morkos.",
      true,
    ),
    G(
      "c2-plural-potato",
      "c2-plural-f",
      "Jai patinka ___.",
      "She likes potatoes.",
      ["bulvė", "bulvės"],
      "bulvės",
      "The plural is bulvės.",
      true,
    ),
    M(
      "c2-plural-only",
      "A plural word can name a food",
      [
        ["ryžiai", "rice"],
        ["makaronai", "pasta"],
        ["sultys", "juice"],
      ],
      "These Lithuanian food words are plural even when English treats the food as a mass. Patinka stays the same.",
    ),
    C(
      "c2-plural-rice",
      "c2-plural-only",
      "ryžiai",
      ["rice", "juice", "pasta"],
      "rice",
      "Ryžiai means rice.",
    ),
    G(
      "c2-plural-banana-return",
      "c2-plural",
      "Man patinka ___.",
      "I like bananas.",
      ["bananas", "bananai"],
      "bananai",
      "The plural of bananas is bananai.",
      true,
    ),
    B(
      "c2-plural-apply",
      "c2-plural-only",
      "She likes rice.",
      ["Jai", "patinka", "ryžiai", "Jam"],
      ["Jai patinka ryžiai."],
      "Jai refers to her; ryžiai is the food.",
    ),
  ],
);
L(
  "group-preferences",
  "Our tastes, their tastes",
  "Track the person across statements and replies.",
  "35, 43–45",
  ["mums / jums", "jiems / joms"],
  ["man, tau, jam, jai", "plural foods"],
  [
    M(
      "c2-like-groups",
      "We and you",
      [
        ["Mums patinka pica.", "We like pizza."],
        ["Jums patinka salotos.", "You like salad (polite or plural)."],
      ],
      "Mes → mums; jūs → jums. In a reply, choose the person you mean, not the pronoun used in the question.",
      ["Mums", "Jums"],
    ),
    G(
      "c2-like-us",
      "c2-like-groups",
      "___ patinka makaronai.",
      "We like pasta.",
      ["Mums", "Jums"],
      "Mums",
      "For we with patinka: mums.",
    ),
    CHAT(
      "c2-like-group-chat",
      "c2-like-groups",
      "group-likes",
      "Ar jums patinka salotos?",
      "Answer for your group: you like salad.",
      ["Taip, mums patinka.", "Taip, jums patinka."],
      ["Taip, mums patinka."],
      "Man irgi patinka.",
      { speaker: "Rasa", followGloss: "I like it too." },
    ),
    M(
      "c2-like-they",
      "Two forms for they",
      [
        ["Jiems patinka ryžiai.", "They like rice (men or a mixed group)."],
        ["Joms patinka salotos.", "They like salad (women)."],
      ],
      "Jie → jiems; jos → joms. Patinka does not change.",
      ["Jiems", "Joms"],
    ),
    G(
      "c2-like-women",
      "c2-like-they",
      "___ patinka kava.",
      "The women like coffee.",
      ["Jiems", "Joms"],
      "Joms",
      "The group is female: joms.",
      true,
    ),
    G(
      "c2-like-mixed",
      "c2-like-they",
      "___ nepatinka sultys.",
      "They (a mixed group) do not like juice.",
      ["Jiems", "Joms"],
      "Jiems",
      "Use jiems for a male or mixed group.",
      true,
    ),
    R(
      "c2-like-group-read",
      "c2-like-groups",
      "Rasa ir Lina: Mums patinka arbata. Tomas: Man patinka kava.",
      "Which statement agrees with the message?",
      ["Joms patinka arbata.", "Jiems patinka kava."],
      "Joms patinka arbata.",
      "Rasa and Lina are the women who like tea.",
    ),
    G(
      "c2-like-you-return",
      "c2-like-groups",
      "Ar ___ patinka duona?",
      "Do you like bread? (polite)",
      ["tau", "jums", "mums"],
      "jums",
      "Polite you is jums with patinka.",
      true,
    ),
  ],
);
V(
  "ingredients",
  "Milk, meat and fish",
  "32",
  [
    [
      ["pienas", "milk"],
      ["cukrus", "sugar"],
      ["citrina", "lemon"],
    ],
    [
      ["mėsa", "meat"],
      ["žuvis", "fish"],
      ["vištiena", "chicken"],
    ],
  ],
  ["requests", "preferences"],
);
L(
  "want",
  "Say who wants something",
  "Use norėti for a person, and distinguish wanting food from wanting to eat.",
  "36, 45–46",
  ["noriu / nori", "norime / norite", "valgyti / gerti"],
  ["request endings"],
  [
    M(
      "c2-want",
      "Wanting something",
      [
        ["Aš noriu kavos.", "I want coffee."],
        ["Tu nori arbatos.", "You want tea."],
        ["Ji nori vandens.", "She wants water."],
      ],
      "Norėti uses noriu for I, nori for you (informal), and nori for he/she/they. The thing wanted is genitive.",
      ["noriu", "nori", "nori"],
    ),
    G(
      "c2-want-i",
      "c2-want",
      "Aš ___ arbatos.",
      "I want tea.",
      ["noriu", "nori"],
      "noriu",
      "Aš takes noriu.",
    ),
    E(
      "c2-want-edit",
      "c2-want",
      "She wants coffee.",
      ["Ji", "noriu", "kavos."],
      1,
      "nori",
      ["noriu", "nori"],
      "Ji takes nori: Ji nori kavos.",
    ),
    M(
      "c2-want-group",
      "Wanting to do something",
      [
        ["Mes norime valgyti.", "We want to eat."],
        ["Jūs norite gerti.", "You want to drink."],
        ["Jie nori valgyti.", "They want to eat."],
      ],
      "Valgyti means to eat; gerti means to drink. Keep the infinitive after the wanting verb. Mes → norime, jūs → norite.",
      ["norime", "norite", "nori"],
    ),
    C(
      "c2-want-inf",
      "c2-want-group",
      "Jūs norite gerti.",
      ["You want to drink.", "You want to eat."],
      "You want to drink.",
      "Gerti means to drink.",
    ),
    G(
      "c2-want-we",
      "c2-want-group",
      "Mes ___ gerti.",
      "We want to drink.",
      ["norime", "norite", "nori"],
      "norime",
      "Mes takes norime.",
      true,
    ),
    G(
      "c2-want-you",
      "c2-want-group",
      "Ar jūs ___ valgyti?",
      "Do you want to eat? (polite)",
      ["norime", "norite", "nori"],
      "norite",
      "Jūs takes norite.",
      true,
    ),
    B(
      "c2-want-bank",
      "c2-want-group",
      "They want tea.",
      ["Jie", "nori", "arbatos", "norime"],
      ["Jie nori arbatos.", "Nori arbatos."],
      "Jie uses nori; the request uses arbatos.",
    ),
    CHAT(
      "c2-want-decline",
      "c2-offer",
      "want",
      "Ar nori gerti?",
      "Decline the offer.",
      ["Ačiū, ne.", "Taip, ačiū."],
      ["Ačiū, ne."],
      "Gerai.",
      { speaker: "Rasa", followGloss: "All right." },
    ),
  ],
);
L(
  "eat-drink",
  "Who eats? Who drinks?",
  "Choose a verb for the speaker, listener or group.",
  "36, 45–46",
  [
    "geriu, geri, geria, geriame, geriate",
    "valgau, valgai, valgo, valgome, valgote",
  ],
  ["person pronouns"],
  [
    M(
      "c2-drink",
      "Three people, three forms",
      [
        ["Aš geriu.", "I drink."],
        ["Tu geri.", "You drink."],
        ["Ji geria.", "She drinks."],
      ],
      "Notice the endings: -iu, -i, -ia. He, she and they share geria.",
      ["geriu", "geri", "geria"],
    ),
    G(
      "c2-drink-you",
      "c2-drink",
      "Tu ___.",
      "You drink.",
      ["geriu", "geri", "geria"],
      "geri",
      "Tu takes geri.",
    ),
    G(
      "c2-drink-she",
      "c2-drink",
      "Ji ___.",
      "She drinks.",
      ["geriu", "geri", "geria"],
      "geria",
      "Ji takes geria.",
      true,
    ),
    M(
      "c2-eat",
      "Eating uses a different pattern",
      [
        ["Aš valgau.", "I eat."],
        ["Tu valgai.", "You eat."],
        ["Jis valgo.", "He eats."],
      ],
      "Valgyti changes to valgau, valgai, valgo. Do not use the gerti endings.",
      ["valgau", "valgai", "valgo"],
    ),
    E(
      "c2-eat-edit",
      "c2-eat",
      "You eat.",
      ["Tu", "valgau."],
      1,
      "valgai",
      ["valgau", "valgai", "valgo"],
      "Tu takes valgai.",
    ),
    G(
      "c2-eat-i",
      "c2-eat",
      "Aš ___.",
      "I eat.",
      ["valgau", "valgai", "valgo"],
      "valgau",
      "Aš takes valgau.",
      true,
    ),
    M(
      "c2-verbs-group",
      "We and you as a group",
      [
        ["Mes geriame.", "We drink."],
        ["Jūs geriate.", "You drink."],
        ["Mes valgome.", "We eat."],
        ["Jūs valgote.", "You eat."],
      ],
      "Mes forms end in -me; jūs forms end in -te. Keep the verb’s own stem: geria- versus valgo-.",
      ["geriame", "geriate", "valgome", "valgote"],
    ),
    G(
      "c2-drink-we",
      "c2-verbs-group",
      "Mes ___.",
      "We drink.",
      ["geriame", "geriate", "geria"],
      "geriame",
      "Mes takes geriame.",
      true,
    ),
    G(
      "c2-eat-you",
      "c2-verbs-group",
      "Jūs ___.",
      "You eat. (polite/plural)",
      ["valgome", "valgote", "valgo"],
      "valgote",
      "Jūs takes valgote.",
      true,
    ),
    G(
      "c2-eat-we",
      "c2-verbs-group",
      "Mes ___.",
      "We eat.",
      ["valgome", "valgote", "valgo"],
      "valgome",
      "Mes takes valgome.",
      true,
    ),
    G(
      "c2-drink-you-group",
      "c2-verbs-group",
      "Jūs ___.",
      "You drink. (polite/plural)",
      ["geriame", "geriate", "geria"],
      "geriate",
      "Jūs takes geriate.",
      true,
    ),
    G(
      "c2-drink-they",
      "c2-drink",
      "Jos ___.",
      "They (women) drink.",
      ["geriu", "geri", "geria"],
      "geria",
      "All third persons use geria.",
      true,
    ),
  ],
);
V(
  "more-menu",
  "More on the menu",
  "32",
  [
    [
      ["pyragas", "cake / pie"],
      ["ledai", "ice cream"],
      ["šokoladas", "chocolate"],
    ],
    [
      ["alus", "beer"],
      ["vynas", "wine"],
      ["gira", "kvass"],
    ],
  ],
  ["drinks", "food"],
);
L(
  "describe",
  "Describe your food",
  "Match an adjective to the food and distinguish taste, colour and preparation.",
  "32, 36, 47",
  ["skanus / skani", "juodas / juoda", "karštas / karšta", "keptas / kepta"],
  ["menu words"],
  [
    M(
      "c2-adj",
      "The adjective agrees with the noun",
      [
        ["Skanus sūris.", "Tasty cheese."],
        ["Skani sriuba.", "Tasty soup."],
        ["Juodas šokoladas.", "Dark chocolate."],
        ["Juoda kava.", "Black coffee."],
      ],
      "Sūris is masculine; sriuba is feminine. For these patterns, -us → -i and -as → -a.",
      ["Skanus", "Skani", "Juodas", "Juoda"],
    ),
    G(
      "c2-adj-soup",
      "c2-adj",
      "___ sriuba.",
      "Tasty soup.",
      ["Skanus", "Skani"],
      "Skani",
      "Sriuba is feminine: skani.",
    ),
    E(
      "c2-adj-edit",
      "c2-adj",
      "Black coffee.",
      ["Juodas", "kava."],
      0,
      "Juoda",
      ["Juodas", "Juoda"],
      "Kava is feminine: juoda kava.",
    ),
    M(
      "c2-food-qualities",
      "Hot, cold, or freshly prepared",
      [
        ["Karšta sriuba.", "Hot soup."],
        ["Šalta arbata.", "Cold tea."],
        ["Kepta žuvis.", "Fried fish."],
        ["Šviežia duona.", "Fresh bread."],
      ],
      "These foods are feminine, including žuvis. Karštas/karšta = hot, šaltas/šalta = cold, keptas/kepta = fried or baked, šviežias/šviežia = fresh.",
    ),
    C(
      "c2-hot-cold",
      "c2-food-qualities",
      "Šalta arbata.",
      ["Hot tea.", "Cold tea."],
      "Cold tea.",
      "Šalta means cold.",
    ),
    G(
      "c2-fish-adj",
      "c2-food-qualities",
      "___ žuvis.",
      "Fried fish.",
      ["Keptas", "Kepta"],
      "Kepta",
      "Žuvis is feminine: kepta.",
      true,
    ),
    M(
      "c2-more-qualities",
      "Ask for the kind you like",
      [
        ["Baltas vynas.", "White wine."],
        ["Raudonas vynas.", "Red wine."],
        ["Žalia arbata.", "Green tea."],
        ["Šokoladinis pyragas.", "Chocolate cake."],
      ],
      "Colours agree with their noun. The adjective šokoladinis means chocolate-flavoured; its feminine form is šokoladinė.",
    ),
    C(
      "c2-wine-colour",
      "c2-more-qualities",
      "Raudonas vynas.",
      ["White wine.", "Red wine."],
      "Red wine.",
      "Raudonas means red.",
    ),
    G(
      "c2-adj-recall",
      "c2-adj",
      "___ duona.",
      "Tasty bread.",
      ["Skanus", "Skani"],
      "Skani",
      "Duona is feminine: skani.",
      true,
    ),
    B(
      "c2-adj-bank",
      "c2-food-qualities",
      "I like hot soup.",
      ["Man", "patinka", "karšta", "sriuba", "karštas"],
      ["Man patinka karšta sriuba."],
      "Sriuba takes feminine karšta.",
    ),
  ],
);
L(
  "requests",
  "More request endings",
  "Change known menu words into singular and plural requests.",
  "37, 47–48",
  [
    "-as → -o; -is/-ys → -io",
    "-us → -aus; -ė → -ės; žuvis → žuvies",
    "plural -ų / -ių",
  ],
  ["Norėčiau", "food"],
  [
    M(
      "c2-request-m",
      "Requests for masculine nouns",
      [
        ["pyragas → pyrago", "cake → some cake"],
        ["sumuštinis → sumuštinio", "sandwich → a sandwich"],
        ["obuolys → obuolio", "apple → an apple"],
        ["alus → alaus", "beer → some beer"],
      ],
      "After norėčiau these nouns take the genitive: -as → -o; -is/-ys → -io; -us → -aus.",
    ),
    G(
      "c2-request-cake",
      "c2-request-m",
      "Norėčiau ___.",
      "I would like cake.",
      ["pyragas", "pyrago"],
      "pyrago",
      "After norėčiau: pyrago.",
    ),
    G(
      "c2-request-sandwich",
      "c2-request-m",
      "Norėčiau ___.",
      "I would like a sandwich.",
      ["sumuštinis", "sumuštinio"],
      "sumuštinio",
      "After norėčiau: sumuštinio.",
      true,
    ),
    G(
      "c2-request-beer",
      "c2-request-m",
      "Norėčiau ___.",
      "I would like beer.",
      ["alus", "alaus"],
      "alaus",
      "Alus changes to alaus.",
      true,
    ),
    M(
      "c2-request-f",
      "Feminine requests",
      [
        ["bandelė → bandelės", "bun → a bun"],
        ["žuvis → žuvies", "fish → some fish"],
        ["vištiena → vištienos", "chicken → some chicken"],
      ],
      "Bandelė takes -ės; feminine žuvis takes -ies. Vištiena follows the kava pattern: -a → -os.",
    ),
    G(
      "c2-request-fish",
      "c2-request-f",
      "Norėčiau ___.",
      "I would like fish.",
      ["žuvis", "žuvies"],
      "žuvies",
      "Feminine žuvis takes žuvies.",
      true,
    ),
    G(
      "c2-request-bun",
      "c2-request-f",
      "Norėčiau ___.",
      "I would like a bun.",
      ["bandelė", "bandelės"],
      "bandelės",
      "After norėčiau: bandelės.",
      true,
    ),
    M(
      "c2-request-pl",
      "Requests for plural foods",
      [
        ["salotos → salotų", "salad → some salad"],
        ["ryžiai → ryžių", "rice → some rice"],
        ["bulvės → bulvių", "potatoes → some potatoes"],
        ["sultys → sulčių", "juice → some juice"],
      ],
      "Plural requests use genitive -ų/-ių. Learn sulčių as a changing stem; it is not sultys plus an ending.",
    ),
    G(
      "c2-request-juice",
      "c2-request-pl",
      "Norėčiau ___.",
      "I would like juice.",
      ["sultys", "sulčių"],
      "sulčių",
      "Sultys changes to sulčių.",
      true,
    ),
    G(
      "c2-request-rice",
      "c2-request-pl",
      "Norėčiau ___.",
      "I would like rice.",
      ["ryžiai", "ryžių"],
      "ryžių",
      "Plural request: ryžių.",
      true,
    ),
    G(
      "c2-request-potatoes",
      "c2-request-pl",
      "Norėčiau ___.",
      "I would like potatoes.",
      ["bulvės", "bulvių"],
      "bulvių",
      "Plural request: bulvių.",
      true,
    ),
    G(
      "c2-request-apple-return",
      "c2-request-m",
      "Norėčiau ___.",
      "I would like an apple.",
      ["obuolys", "obuolio"],
      "obuolio",
      "Obuolys changes to obuolio.",
      true,
    ),
  ],
);
L(
  "whole-order",
  "Order the whole phrase",
  "Change the describing word as well as the noun.",
  "37, 48",
  [
    "juoda kava → juodos kavos",
    "baltas vynas → balto vyno",
    "mineralinis vanduo → mineralinio vandens",
  ],
  ["adjective agreement", "request endings"],
  [
    M(
      "c2-phrase-gen",
      "Both words change",
      [
        [
          "juoda kava → juodos kavos",
          "black coffee → a request for black coffee",
        ],
        ["baltas vynas → balto vyno", "white wine → a request for white wine"],
        [
          "mineralinis vanduo → mineralinio vandens",
          "mineral water → a request for mineral water",
        ],
      ],
      "The adjective and noun both take genitive in this request. Changing only the noun leaves the phrase unfinished.",
    ),
    G(
      "c2-phrase-coffee",
      "c2-phrase-gen",
      "Norėčiau ___ kavos.",
      "I would like black coffee.",
      ["juoda", "juodos"],
      "juodos",
      "Both words take genitive: juodos kavos.",
    ),
    E(
      "c2-phrase-edit",
      "c2-phrase-gen",
      "I would like white wine.",
      ["Norėčiau", "baltas", "vyno."],
      1,
      "balto",
      ["baltas", "balto"],
      "Vyno needs the genitive adjective balto.",
    ),
    B(
      "c2-phrase-bank",
      "c2-phrase-gen",
      "I would like mineral water.",
      ["Norėčiau", "mineralinio", "vandens", "mineralinis", "vanduo"],
      ["Norėčiau mineralinio vandens."],
      "Both words change: mineralinio vandens.",
    ),
    M(
      "c2-phrase-other",
      "Two more adjective patterns",
      [
        [
          "šviesus alus → šviesaus alaus",
          "light beer → a request for light beer",
        ],
        [
          "vaisinė arbata → vaisinės arbatos",
          "fruit tea → a request for fruit tea",
        ],
        [
          "kepta žuvis → keptos žuvies",
          "fried fish → a request for fried fish",
        ],
      ],
      "Šviesus takes -aus; vaisinė takes -ės; kepta takes -os. The endings follow the adjective type, not just one universal rule.",
    ),
    G(
      "c2-phrase-light",
      "c2-phrase-other",
      "Norėčiau ___ alaus.",
      "I would like light beer.",
      ["šviesus", "šviesaus"],
      "šviesaus",
      "The genitive of šviesus is šviesaus.",
      true,
    ),
    G(
      "c2-phrase-fruit",
      "c2-phrase-other",
      "Norėčiau ___ arbatos.",
      "I would like fruit tea.",
      ["vaisinė", "vaisinės"],
      "vaisinės",
      "The genitive of vaisinė is vaisinės.",
      true,
    ),
    G(
      "c2-phrase-fish",
      "c2-phrase-other",
      "Norėčiau ___ žuvies.",
      "I would like fried fish.",
      ["kepta", "keptos"],
      "keptos",
      "The adjective also takes genitive: keptos.",
      true,
    ),
    T(
      "c2-phrase-short",
      "c2-phrase-gen",
      "Black coffee, please.",
      [
        "Juodos kavos, prašom.",
        "Prašom juodos kavos.",
        "Juodos kavos, prašau.",
        "Norėčiau juodos kavos.",
      ],
      ["Juodos", "kavos", "prašom", "juoda"],
      "Juodos kavos, prašom.",
      {
        ability: "phrase-recall",
        hint: "Change both the adjective and the noun for the request.",
      },
    ),
    M(
      "c2-phrase-plural",
      "Plural describing words change too",
      [
        [
          "šviežios daržovės → šviežių daržovių",
          "fresh vegetables → a request for fresh vegetables",
        ],
        [
          "lietuviškos salotos → lietuviškų salotų",
          "Lithuanian salad → a request for Lithuanian salad",
        ],
      ],
      "In a plural request, both words take genitive. The describing word ends in -ų or -ių: lietuviškų, šviežių. Lietuviškos means Lithuanian here.",
    ),
    G(
      "c2-phrase-plural-choice",
      "c2-phrase-plural",
      "Norėčiau ___ salotų.",
      "I would like Lithuanian salad.",
      ["lietuviškos", "lietuviškų"],
      "lietuviškų",
      "Both words are genitive plural: lietuviškų salotų.",
    ),
    B(
      "c2-phrase-plural-bank",
      "c2-phrase-plural",
      "I would like fresh vegetables.",
      ["Norėčiau", "šviežių", "daržovių", "šviežios", "daržovės"],
      ["Norėčiau šviežių daržovių."],
      "Both words change: šviežios daržovės → šviežių daržovių.",
    ),
    G(
      "c2-phrase-plural-recall",
      "c2-phrase-plural",
      "Prašom ___ daržovių.",
      "Fresh vegetables, please.",
      ["šviežios", "šviežių"],
      "šviežių",
      "The request takes genitive plural: šviežių daržovių.",
      true,
    ),
  ],
);
L(
  "with-without",
  "With or without?",
  "Choose an ingredient and the ending required by su or be.",
  "38, 50–52",
  ["su + instrumental", "be + genitive", "pienu / pieno; cukrumi / cukraus"],
  ["milk, sugar, lemon", "ordering"],
  [
    M(
      "c2-with",
      "Milk or no milk?",
      [
        ["Kava su pienu.", "Coffee with milk."],
        ["Kava be pieno.", "Coffee without milk."],
      ],
      "Su means with and takes instrumental. Be means without and takes genitive. The ingredient stays the same; the relationship and ending change.",
      ["su pienu", "be pieno"],
    ),
    C(
      "c2-with-meaning",
      "c2-with",
      "Kava be pieno.",
      ["Coffee with milk.", "Coffee without milk."],
      "Coffee without milk.",
      "Be means without.",
    ),
    G(
      "c2-with-milk",
      "c2-with",
      "Kava su ___.",
      "Coffee with milk.",
      ["pienu", "pieno"],
      "pienu",
      "Su takes instrumental: pienu.",
    ),
    G(
      "c2-without-milk",
      "c2-with",
      "Norėčiau kavos be ___.",
      "I would like coffee without milk.",
      ["pienu", "pieno"],
      "pieno",
      "Be takes genitive: pieno.",
      true,
    ),
    M(
      "c2-with-more",
      "Sugar and lemon",
      [
        ["Arbata su cukrumi.", "Tea with sugar."],
        ["Arbata be cukraus.", "Tea without sugar."],
        ["Arbata su citrina.", "Tea with lemon."],
      ],
      "Cukrus has cukrumi after su and cukraus after be. Citrina keeps the spelling citrina after su.",
    ),
    E(
      "c2-with-edit",
      "c2-with-more",
      "Tea without sugar.",
      ["Arbata", "be", "cukrumi."],
      2,
      "cukraus",
      ["cukrumi", "cukraus"],
      "Be requires cukraus, not cukrumi.",
    ),
    B(
      "c2-with-bank",
      "c2-with",
      "I would like coffee with milk.",
      ["Norėčiau", "kavos", "su", "pienu", "pieno", "be"],
      ["Norėčiau kavos su pienu."],
      "Norėčiau changes kava to kavos; su changes pienas to pienu.",
    ),
    G(
      "c2-with-sugar",
      "c2-with-more",
      "Arbata su ___.",
      "Tea with sugar.",
      ["cukrumi", "cukraus"],
      "cukrumi",
      "Su takes instrumental: cukrumi.",
      true,
    ),
    CHAT(
      "c2-with-chat",
      "c2-with",
      "milk-order",
      "Su pienu ar be pieno?",
      "Choose coffee without milk.",
      ["Be pieno, prašom.", "Su pienu, prašom."],
      ["Be pieno, prašom."],
      "Prašom.",
    ),
  ],
);
V(
  "sides",
  "Ingredients and side dishes",
  "32, 38",
  [
    [
      ["grybai", "mushrooms"],
      ["svogūnai", "onions"],
      ["daržovės", "vegetables"],
    ],
    [
      ["majonezas", "mayonnaise"],
      ["grietinė", "sour cream"],
      ["varškė", "curd cheese"],
    ],
  ],
  ["with / without"],
);
L(
  "dish-ingredients",
  "Read the ingredients",
  "Interpret menu phrases and change singular or plural ingredients.",
  "38, 49–52",
  [
    "grybų sriuba",
    "su sūriu / be sūrio",
    "su ryžiais / be ryžių",
    "su bulvėmis / be bulvių",
  ],
  ["side dishes", "su / be"],
  [
    M(
      "c2-ingredient-name",
      "The first word names the ingredient",
      [
        ["Grybų sriuba.", "Mushroom soup."],
        ["Daržovių salotos.", "Vegetable salad."],
        ["Obuolių pyragas.", "Apple cake."],
      ],
      "A genitive ingredient comes before the dish: grybai → grybų, daržovės → daržovių, obuoliai → obuolių. The whole dish keeps its own ending.",
    ),
    C(
      "c2-ingredient-read",
      "c2-ingredient-name",
      "Daržovių salotos.",
      ["Vegetable salad.", "Mushroom soup.", "Apple cake."],
      "Vegetable salad.",
      "Daržovių names the ingredient; salotos names the dish.",
    ),
    B(
      "c2-ingredient-order",
      "c2-ingredient-name",
      "I would like mushroom soup.",
      ["Norėčiau", "grybų", "sriubos", "sriuba"],
      ["Norėčiau grybų sriubos."],
      "Grybų already names the ingredient. Change sriuba to sriubos for the request.",
    ),
    M(
      "c2-ingredient-singular",
      "Singular ingredients also take genitive",
      [
        ["Tuno salotos.", "Tuna salad."],
        ["Varškės pyragas.", "Curd cheese cake."],
        ["Medaus pyragas.", "Honey cake."],
      ],
      "The ingredient keeps its own noun pattern: tunas → tuno, varškė → varškės, medus → medaus. These are singular genitives, unlike grybų or obuolių.",
    ),
    C(
      "c2-ingredient-honey-meaning",
      "c2-ingredient-singular",
      "Medaus pyragas.",
      ["Honey cake.", "Curd cheese cake.", "Apple cake."],
      "Honey cake.",
      "Medaus is the ingredient form of medus, honey.",
    ),
    G(
      "c2-ingredient-tuna",
      "c2-ingredient-singular",
      "___ salotos.",
      "Tuna salad.",
      ["Tunas", "Tuno"],
      "Tuno",
      "The ingredient takes genitive: tuno salotos.",
      true,
    ),
    G(
      "c2-ingredient-honey",
      "c2-ingredient-singular",
      "___ pyragas.",
      "Honey cake.",
      ["Medus", "Medaus"],
      "Medaus",
      "The ingredient takes genitive: medaus pyragas.",
      true,
    ),
    M(
      "c2-sides",
      "With and without side dishes",
      [
        ["su ryžiais / be ryžių", "with rice / without rice"],
        ["su bulvėmis / be bulvių", "with potatoes / without potatoes"],
        ["su daržovėmis / be daržovių", "with vegetables / without vegetables"],
      ],
      "Plural instrumental has different endings: -ais/-iais and -omis/-ėmis. Be still takes genitive -ų/-ių.",
    ),
    G(
      "c2-side-potato",
      "c2-sides",
      "Vištiena su ___.",
      "Chicken with potatoes.",
      ["bulvėmis", "bulvių"],
      "bulvėmis",
      "Su takes the instrumental plural: bulvėmis.",
      true,
    ),
    G(
      "c2-side-rice",
      "c2-sides",
      "Žuvis be ___.",
      "Fish without rice.",
      ["ryžiais", "ryžių"],
      "ryžių",
      "Be takes the genitive plural: ryžių.",
      true,
    ),
    M(
      "c2-ingredient-forms",
      "Other instrumental endings",
      [
        ["su sūriu / be sūrio", "with cheese / without cheese"],
        ["su žuvimi / be žuvies", "with fish / without fish"],
        ["su varške / be varškės", "with curd cheese / without curd cheese"],
        ["su morkomis / be morkų", "with carrots / without carrots"],
      ],
      "Choose the ending for the noun type. Do not apply pienu to every ingredient.",
    ),
    G(
      "c2-ingredient-cheese",
      "c2-ingredient-forms",
      "Salotos su ___.",
      "Salad with cheese.",
      ["sūriu", "sūrio"],
      "sūriu",
      "Su takes instrumental: sūriu.",
      true,
    ),
    G(
      "c2-ingredient-fish",
      "c2-ingredient-forms",
      "Salotos su ___.",
      "Salad with fish.",
      ["žuvimi", "žuvies"],
      "žuvimi",
      "Su takes instrumental: žuvimi.",
      true,
    ),
    G(
      "c2-ingredient-curd",
      "c2-ingredient-forms",
      "Pyragas su ___.",
      "Cake with curd cheese.",
      ["varške", "varškės"],
      "varške",
      "Su takes instrumental: varške.",
      true,
    ),
    G(
      "c2-ingredient-carrot",
      "c2-ingredient-forms",
      "Salotos su ___.",
      "Salad with carrots.",
      ["morkomis", "morkų"],
      "morkomis",
      "Su takes instrumental plural: morkomis.",
      true,
    ),
    R(
      "c2-ingredient-menu",
      "c2-ingredient-name",
      "",
      "Which menu item is a vegetable dish without meat?",
      ["Daržovių salotos", "Vištiena su ryžiais", "Žuvis su bulvėmis"],
      "Daržovių salotos",
      "Daržovių salotos is vegetable salad.",
      {
        menu: [
          ["Daržovių salotos", "5,20 €"],
          ["Vištiena su ryžiais", "8,40 €"],
          ["Žuvis su bulvėmis", "9,10 €"],
        ],
        menuTitle: "Pietūs",
      },
    ),
  ],
);
L(
  "objects",
  "Like it, eat it, or refuse it",
  "Choose the noun form from the verb, not from the English translation alone.",
  "39, 51–52",
  [
    "patinka + nominative",
    "valgau / geriu + accusative",
    "nevalgau / negeriu + genitive",
  ],
  ["food forms", "verb persons"],
  [
    M(
      "c2-object",
      "One drink, three jobs",
      [
        ["Man patinka kava.", "I like coffee."],
        ["Aš geriu kavą.", "I drink coffee."],
        ["Aš negeriu kavos.", "I do not drink coffee."],
      ],
      "Patinka keeps the nominative. Gerti takes an accusative object. Negating the drinking verb changes the object to genitive. The letter ą here is a grammatical ending.",
      ["kava", "kavą", "kavos"],
    ),
    G(
      "c2-object-coffee",
      "c2-object",
      "Aš geriu ___.",
      "I drink coffee.",
      ["kava", "kavą", "kavos"],
      "kavą",
      "Geriu takes an accusative object: kavą.",
    ),
    E(
      "c2-object-edit",
      "c2-object",
      "I do not drink coffee.",
      ["Aš", "negeriu", "kavą."],
      2,
      "kavos",
      ["kava", "kavą", "kavos"],
      "Negeriu takes genitive: kavos.",
    ),
    G(
      "c2-object-dislike",
      "c2-object",
      "Man nepatinka ___.",
      "I do not like coffee.",
      ["kava", "kavą", "kavos"],
      "kava",
      "Negating patinka does not change its noun: kava.",
      true,
    ),
    M(
      "c2-object-other",
      "Other accusative patterns",
      [
        ["sūris → sūrį; žuvis → žuvį", "cheese / fish as an object"],
        [
          "pyragas → pyragą; varškė → varškę",
          "cake / curd cheese as an object",
        ],
        ["vanduo → vandenį; alus → alų", "water / beer as an object"],
      ],
      "Use these forms after positive valgau or geriu. After nevalgau/negeriu return to genitive: sūrio, žuvies, pyrago, varškės, vandens, alaus.",
    ),
    G(
      "c2-object-water",
      "c2-object-other",
      "Mes geriame ___.",
      "We drink water.",
      ["vanduo", "vandenį", "vandens"],
      "vandenį",
      "Positive geriame takes accusative: vandenį.",
      true,
    ),
    G(
      "c2-object-fish",
      "c2-object-other",
      "Ji nevalgo ___.",
      "She does not eat fish.",
      ["žuvis", "žuvį", "žuvies"],
      "žuvies",
      "Negative nevalgo takes genitive: žuvies.",
      true,
    ),
    G(
      "c2-object-cheese",
      "c2-object-other",
      "Tu valgai ___.",
      "You eat cheese.",
      ["sūris", "sūrį", "sūrio"],
      "sūrį",
      "Positive valgai takes accusative: sūrį.",
      true,
    ),
    M(
      "c2-object-plural",
      "Plural objects change too",
      [
        ["ryžiai → ryžius / ryžių", "rice: eat / do not eat"],
        ["morkos → morkas / morkų", "carrots: eat / do not eat"],
        ["bulvės → bulves / bulvių", "potatoes: eat / do not eat"],
        ["sultys → sultis / sulčių", "juice: drink / do not drink"],
      ],
      "The first form is accusative for a positive eating/drinking verb. The second is genitive for a negative verb.",
    ),
    G(
      "c2-object-juice",
      "c2-object-plural",
      "Jūs geriate ___.",
      "You drink juice.",
      ["sultys", "sultis", "sulčių"],
      "sultis",
      "Positive geriate takes accusative plural: sultis.",
      true,
    ),
    G(
      "c2-object-carrots",
      "c2-object-plural",
      "Mes nevalgome ___.",
      "We do not eat carrots.",
      ["morkos", "morkas", "morkų"],
      "morkų",
      "Negative nevalgome takes genitive plural: morkų.",
      true,
    ),
    G(
      "c2-object-potatoes",
      "c2-object-plural",
      "Ji valgo ___.",
      "She eats potatoes.",
      ["bulvės", "bulves", "bulvių"],
      "bulves",
      "Positive valgo takes accusative plural: bulves.",
      true,
    ),
    R(
      "c2-object-profile",
      "c2-object",
      "Rasa geria arbatą, bet negeria kavos. Tomas geria kavą su pienu.",
      "Who would accept coffee with milk?",
      ["Rasa", "Tomas"],
      "Tomas",
      "Rasa does not drink coffee; Tomas drinks it with milk.",
    ),
  ],
);
L(
  "quantities",
  "A lot, a little, or none",
  "Keep genitive after quantity words, including in a positive sentence.",
  "39",
  ["daug / mažai", "nedaug / nemažai", "quantity + genitive"],
  ["positive and negative objects"],
  [
    M(
      "c2-quantity",
      "Quantity changes the noun’s job",
      [
        ["Aš geriu kavą.", "I drink coffee."],
        ["Aš geriu daug kavos.", "I drink a lot of coffee."],
        ["Aš geriu mažai kavos.", "I drink little coffee."],
      ],
      "Daug and mažai take genitive even with a positive verb. Choose the noun ending from the quantity phrase.",
      ["kavą", "daug kavos", "mažai kavos"],
    ),
    C(
      "c2-quantity-meaning",
      "c2-quantity",
      "Mes valgome mažai mėsos.",
      ["We eat a lot of meat.", "We eat little meat."],
      "We eat little meat.",
      "Mažai means little.",
    ),
    G(
      "c2-quantity-water",
      "c2-quantity",
      "Mes geriame daug ___.",
      "We drink a lot of water.",
      ["vanduo", "vandenį", "vandens"],
      "vandens",
      "Daug takes genitive: vandens.",
    ),
    E(
      "c2-quantity-edit",
      "c2-quantity",
      "I drink little tea.",
      ["Aš", "geriu", "mažai", "arbatą."],
      3,
      "arbatos",
      ["arbata", "arbatą", "arbatos"],
      "Mažai requires genitive arbatos.",
    ),
    M(
      "c2-quantity-neg",
      "Not much and quite a lot",
      [
        ["nedaug pieno", "not much milk"],
        ["nemažai daržovių", "quite a lot of vegetables"],
      ],
      "Nedaug negates a lot; nemažai means not a little, or quite a lot. Both still take genitive.",
    ),
    G(
      "c2-quantity-milk",
      "c2-quantity-neg",
      "Jis geria nedaug ___.",
      "He drinks little milk.",
      ["pienas", "pieną", "pieno"],
      "pieno",
      "Nedaug takes genitive: pieno.",
      true,
    ),
    G(
      "c2-quantity-veg",
      "c2-quantity-neg",
      "Mes valgome nemažai ___.",
      "We eat quite a lot of vegetables.",
      ["daržovės", "daržoves", "daržovių"],
      "daržovių",
      "Nemažai takes genitive plural: daržovių.",
      true,
    ),
    B(
      "c2-quantity-bank",
      "c2-quantity",
      "We eat a lot of potatoes.",
      ["Mes", "valgome", "daug", "bulvių", "bulves"],
      ["Mes valgome daug bulvių.", "Valgome daug bulvių."],
      "Daug requires bulvių.",
    ),
    G(
      "c2-quantity-contrast",
      "c2-object",
      "Aš geriu ___.",
      "I drink tea. (No quantity word.)",
      ["arbata", "arbatą", "arbatos"],
      "arbatą",
      "Without a quantity or negation, geriu takes accusative: arbatą.",
      true,
    ),
  ],
);
L(
  "which-kind",
  "Ask which kind",
  "Ask about a preference or a request, and give a short natural answer.",
  "39, 49",
  [
    "koks / kokia / kokie / kokios",
    "kokio / kokios / kokių",
    "gazuotas / negazuotas",
  ],
  ["agreement", "genitive requests"],
  [
    M(
      "c2-which-nom",
      "Which kind do you like?",
      [
        ["Koks vanduo tau patinka?", "What kind of water do you like?"],
        ["Kokia arbata tau patinka?", "What kind of tea do you like?"],
        ["Kokie vaisiai tau patinka?", "What fruit do you like?"],
        ["Kokios daržovės tau patinka?", "What vegetables do you like?"],
      ],
      "Koks/kokia are masculine/feminine singular; kokie/kokios are plural. Vaisiai means fruit. The noun stays nominative with patinka.",
      ["Koks", "Kokia", "Kokie", "Kokios"],
    ),
    G(
      "c2-which-tea",
      "c2-which-nom",
      "___ arbata tau patinka?",
      "What kind of tea do you like?",
      ["Koks", "Kokia"],
      "Kokia",
      "Arbata is feminine singular: kokia.",
    ),
    G(
      "c2-which-fruit",
      "c2-which-nom",
      "___ vaisiai tau patinka?",
      "What fruit do you like?",
      ["Kokie", "Kokios"],
      "Kokie",
      "Vaisiai is masculine plural: kokie.",
      true,
    ),
    M(
      "c2-which-gen",
      "Which kind would you like?",
      [
        ["Kokio vandens norėtumėte?", "What kind of water would you like?"],
        ["Kokios kavos norėtumėte?", "What kind of coffee would you like?"],
        ["Kokių sulčių norėtumėte?", "What juice would you like?"],
      ],
      "The request uses genitive, including the question word: kokio (masculine), kokios (feminine), kokių (plural).",
      ["Kokio", "Kokios", "Kokių"],
    ),
    E(
      "c2-which-edit",
      "c2-which-gen",
      "What kind of water would you like?",
      ["Koks", "vandens", "norėtumėte?"],
      0,
      "Kokio",
      ["Koks", "Kokio"],
      "Vandens is genitive: use kokio.",
    ),
    G(
      "c2-which-juice",
      "c2-which-gen",
      "___ sulčių norėtumėte?",
      "What juice would you like?",
      ["Kokio", "Kokios", "Kokių"],
      "Kokių",
      "Sulčių is plural genitive: kokių.",
      true,
    ),
    M(
      "c2-water-kind",
      "Short answers are enough",
      [
        ["Gazuotas vanduo.", "Sparkling water."],
        ["Negazuotas vanduo.", "Still water."],
        ["Negazuoto, prašom.", "Still, please."],
      ],
      "A short answer can omit vandens when the question already supplies it. Keep the genitive ending: negazuoto.",
    ),
    CHAT(
      "c2-which-chat1",
      "c2-order",
      "water-kind",
      "Ko norėtumėte?",
      "Order water.",
      ["Norėčiau vandens.", "Norėčiau kavos."],
      ["Norėčiau vandens."],
      "Gazuoto ar negazuoto?",
    ),
    CHAT(
      "c2-which-chat2",
      "c2-water-kind",
      "water-kind",
      "Gazuoto ar negazuoto?",
      "Choose still water.",
      ["Negazuoto, prašom.", "Gazuoto, prašom."],
      ["Negazuoto, prašom."],
      "Prašom.",
      { continuation: true },
    ),
    G(
      "c2-which-veg-return",
      "c2-which-nom",
      "___ daržovės tau patinka?",
      "What vegetables do you like?",
      ["Kokie", "Kokios"],
      "Kokios",
      "Daržovės is feminine plural: kokios.",
      true,
    ),
  ],
);
const teens = [
  ["vienuolika", "11"],
  ["dvylika", "12"],
  ["trylika", "13"],
  ["keturiolika", "14"],
  ["penkiolika", "15"],
  ["šešiolika", "16"],
  ["septyniolika", "17"],
  ["aštuoniolika", "18"],
  ["devyniolika", "19"],
];
const tens = [
  ["dešimt", "10"],
  ["dvidešimt", "20"],
  ["trisdešimt", "30"],
  ["keturiasdešimt", "40"],
  ["penkiasdešimt", "50"],
  ["šešiasdešimt", "60"],
  ["septyniasdešimt", "70"],
  ["aštuoniasdešimt", "80"],
  ["devyniasdešimt", "90"],
  ["šimtas", "100"],
];
function numberSteps(id, rows) {
  const steps = [];
  for (let n = 0; n < rows.length; n += 3) {
    const group = rows.slice(n, n + 3),
      target = `${id}-${n}`;
    steps.push(
      M(
        target,
        "Read the number",
        group,
        "Learn these numbers as a group. Then distinguish them in prices.",
      ),
    );
    for (const [lt, digit] of group)
      steps.push(
        C(
          `${target}-${digit}`,
          target,
          `${lt} eurų`,
          rows
            .map((p) => `${p[1]} €`)
            .filter(
              (_, i) =>
                i === rows.findIndex((p) => p[1] === digit) ||
                i === 0 ||
                i === rows.length - 1,
            ),
          `${digit} €`,
          `${lt} = ${digit}`,
          { instruction: "Choose the price." },
        ),
      );
  }
  return steps;
}
L(
  "teens",
  "Prices from eleven to nineteen",
  "Read the teen numbers without confusing their similar endings.",
  "33, 56",
  ["11–19", "eurų · euros"],
  ["numbers 1–10 from chapter 1"],
  [
    ...numberSteps("c2-teens", teens),
    C(
      "c2-teens-contrast",
      "c2-teens-3",
      "penkiolika eurų",
      ["15 €", "50 €"],
      "15 €",
      "Penkiolika is fifteen. The tens have a different ending.",
      { instruction: "Choose the price." },
    ),
    T(
      "c2-teens-recall",
      "c2-teens-0",
      "12",
      ["dvylika"],
      ["vienuolika", "dvylika", "trylika"],
      "Dvylika means twelve.",
    ),
    R(
      "c2-teens-menu",
      "c2-teens-6",
      "",
      "Which dish costs seventeen euros?",
      ["Žuvis su bulvėmis", "Vištiena su ryžiais", "Daržovių salotos"],
      "Žuvis su bulvėmis",
      "Septyniolika is 17.",
      {
        menu: [
          ["Žuvis su bulvėmis", "17 €"],
          ["Vištiena su ryžiais", "15 €"],
          ["Daržovių salotos", "13 €"],
        ],
        menuTitle: "Valgiaraštis",
      },
    ),
  ],
);
L(
  "tens",
  "Tens and compound prices",
  "Combine tens and units to read prices up to one hundred.",
  "33, 56–58",
  ["10–100", "dvidešimt vienas · 21"],
  ["teen prices", "numbers 1–10"],
  [
    ...numberSteps("c2-tens", tens),
    M(
      "c2-compound",
      "Put tens before units",
      [
        ["dvidešimt vienas", "21"],
        ["trisdešimt du", "32"],
        ["keturiasdešimt šeši", "46"],
      ],
      "Say the tens, then the units. Lithuanian does not insert an “and” between them.",
    ),
    C(
      "c2-compound-interpret",
      "c2-compound",
      "trisdešimt du eurai",
      ["23 €", "32 €", "30 €"],
      "32 €",
      "Trisdešimt is 30 and du is 2.",
      { instruction: "Choose the price." },
    ),
    B(
      "c2-compound-build",
      "c2-compound",
      "54",
      ["penkiasdešimt", "keturi", "keturiasdešimt", "penki"],
      ["penkiasdešimt keturi"],
      "Put the tens first: penkiasdešimt, then keturi.",
    ),
    T(
      "c2-compound-recall",
      "c2-compound",
      "Twenty-one",
      ["dvidešimt vienas"],
      ["dvidešimt", "vienas", "dešimt"],
      "Dvidešimt vienas.",
      { ability: "phrase-recall" },
    ),
  ],
);
L(
  "pay",
  "Read a bill and pay",
  "Understand euros and cents, ask for the bill, and choose a payment method.",
  "33–34, 40–41, 56–58",
  ["euras / eurai / eurų", "centas / centai / centų", "kortele / grynaisiais"],
  ["compound numbers", "café exchanges"],
  [
    M(
      "c2-money",
      "The currency ending follows the number",
      [
        ["vienas euras / dvidešimt vienas euras", "1 euro / 21 euros"],
        ["du eurai / dvidešimt du eurai", "2 euros / 22 euros"],
        ["dešimt eurų / vienuolika eurų", "10 euros / 11 euros"],
      ],
      "Use euras after numbers ending in 1, except 11. Use eurai after 2–9, except 12–19. Tens and 11–19 use eurų. Centas/centai/centų follows the same pattern.",
    ),
    G(
      "c2-money-21",
      "c2-money",
      "Dvidešimt vienas ___.",
      "21 euros.",
      ["euras", "eurai", "eurų"],
      "euras",
      "21 ends in one and is not eleven: euras.",
    ),
    G(
      "c2-money-12",
      "c2-money",
      "Dvylika ___.",
      "12 euros.",
      ["euras", "eurai", "eurų"],
      "eurų",
      "Teen numbers take eurų.",
      true,
    ),
    M(
      "c2-cents",
      "Read both parts of the price",
      [
        ["Du eurai penkiasdešimt centų.", "2,50 €"],
        ["Vienas euras dvidešimt vienas centas.", "1,21 €"],
        ["Trys eurai keturiasdešimt du centai.", "3,42 €"],
      ],
      "Name the euros, then the cents. Lithuanian price labels commonly use a comma as the decimal separator.",
    ),
    C(
      "c2-cents-listen-text",
      "c2-cents",
      "Keturi eurai dvidešimt centų.",
      ["4,20 €", "4,02 €", "20,04 €"],
      "4,20 €",
      "Keturi eurai is €4; dvidešimt centų is 20 cents.",
      { instruction: "Choose the amount." },
    ),
    G(
      "c2-cents-ending",
      "c2-cents",
      "Trisdešimt du ___.",
      "32 cents.",
      ["centas", "centai", "centų"],
      "centai",
      "32 ends in two and is not twelve: centai.",
      true,
    ),
    M(
      "c2-payment",
      "Finish your visit",
      [
        ["Kiek kainuoja?", "How much does it cost?"],
        ["Sąskaitą, prašom.", "The bill, please."],
        ["Kaip mokėsite?", "How will you pay?"],
        ["Kortele. / Grynaisiais.", "By card. / In cash."],
      ],
      "Learn sąskaitą, prašom as a complete request. Mokėsite is the polite payment question; you can reply with one word.",
    ),
    CHAT(
      "c2-payment-chat1",
      "c2-payment",
      "payment",
      "Dar ko nors?",
      "Decline and ask for the bill.",
      ["Ačiū, ne. Sąskaitą, prašom.", "Norėčiau kavos."],
      ["Ačiū, ne. Sąskaitą, prašom."],
      "Kaip mokėsite?",
    ),
    {
      ...CHAT(
        "c2-payment-chat2",
        "c2-payment",
        "payment",
        "Kaip mokėsite?",
        "Pay by card.",
        undefined,
        ["Kortele."],
        "Ačiū. Viso gero.",
        { continuation: true },
      ),
      kind: "type",
      ability: "word-recall",
      words: ["Kortele", "Grynaisiais"],
    },
    C(
      "c2-payment-return",
      "c2-payment",
      "Grynaisiais.",
      ["By card.", "In cash."],
      "In cash.",
      "Grynaisiais means in cash.",
    ),
    R(
      "c2-price-compare",
      "c2-cents",
      "",
      "Where does coffee cost less?",
      ["Kavinė Rytas", "Kavinė Parkas"],
      "Kavinė Parkas",
      "Compare 2,40 € with 2,14 €; 2,14 € is less.",
      {
        menuTitle: "Kava",
        menu: [
          ["Kavinė Rytas", "du eurai keturiasdešimt centų"],
          ["Kavinė Parkas", "du eurai keturiolika centų"],
        ],
      },
    ),
  ],
);
V(
  "menu-extras",
  "Meat and dairy choices",
  "32",
  [
    [
      ["kiauliena", "pork"],
      ["jautiena", "beef"],
      ["kumpis", "ham"],
    ],
    [
      ["sviestas", "butter"],
      ["jogurtas", "yogurt"],
      ["dešra", "sausage"],
    ],
  ],
  ["ingredients", "requests"],
);
L(
  "signs-host",
  "At the café or at a friend’s",
  "Read café signs, offer food and respond naturally.",
  "32–34, 40–41",
  ["rezervuota", "išsinešti", "dienos sriuba", "Gero apetito!"],
  ["offers", "preferences"],
  [
    M(
      "c2-signs",
      "Useful signs",
      [
        ["REZERVUOTA", "Reserved"],
        ["KAVA IŠSINEŠTI", "Coffee to take away"],
        ["DIENOS SRIUBA", "Soup of the day"],
        ["DIENOS PIETŪS", "Lunch special"],
      ],
      "A sign gives practical information. Read the whole phrase; dienos identifies the daily offering.",
    ),
    C(
      "c2-sign-reserved",
      "c2-signs",
      "REZERVUOTA",
      ["This table is reserved.", "Order takeaway coffee here."],
      "This table is reserved.",
      "Rezervuota marks a reservation.",
    ),
    C(
      "c2-sign-takeaway",
      "c2-signs",
      "Which sign helps you buy coffee to go?",
      ["KAVA IŠSINEŠTI", "DIENOS PIETŪS"],
      "KAVA IŠSINEŠTI",
      "Išsinešti means to take away.",
      { instruction: "Choose the sign." },
    ),
    M(
      "c2-host",
      "Offer, enjoy, and thank",
      [
        ["Ar nori valgyti?", "Do you want to eat?"],
        ["Gero apetito!", "Enjoy your meal!"],
        ["Ačiū, labai skanu.", "Thank you, it is very tasty."],
        ["Ar buvo skanu?", "Was it tasty?"],
      ],
      "Labai skanu describes how the food tastes without naming a noun. Compare skani sriuba, where the adjective agrees with sriuba.",
    ),
    CHAT(
      "c2-host-turn1",
      "c2-host",
      "host",
      "Ar nori valgyti?",
      "Accept the offer.",
      ["Taip, ačiū.", "Ačiū, ne."],
      ["Taip, ačiū."],
      "Prašom. Gero apetito!",
      { speaker: "Rasa" },
    ),
    CHAT(
      "c2-host-turn2",
      "c2-host",
      "host",
      "Gero apetito!",
      "Thank your host.",
      ["Ačiū!", "Viso gero!"],
      ["Ačiū!"],
      "Prašom.",
      { speaker: "Rasa", continuation: true },
    ),
    B(
      "c2-host-compliment",
      "c2-host",
      "Thank you, it is very tasty.",
      ["Ačiū", "labai", "skanu", "skani"],
      ["Ačiū labai skanu."],
      "Without a named noun use skanu.",
    ),
    G(
      "c2-host-agreement-return",
      "c2-adj",
      "___ sriuba.",
      "Tasty soup.",
      ["Skanus", "Skani", "Skanu"],
      "Skani",
      "With feminine sriuba use skani, not the impersonal skanu.",
      true,
    ),
  ],
);
L(
  "menu-reading",
  "Choose from the menu",
  "Use dish names, ingredients and prices to choose an order.",
  "53–59",
  ["valgiaraštis · menu"],
  ["ingredients", "prices", "requests"],
  [
    R(
      "c2-menu-no-meat",
      "c2-ingredient-name",
      "",
      "Choose a main dish with vegetables and no meat.",
      ["Makaronai su daržovėmis", "Vištiena su bulvėmis", "Makaronai su mėsa"],
      "Makaronai su daržovėmis",
      "Daržovėmis means vegetables; mėsa and vištiena are meat.",
      {
        menuTitle: "Valgiaraštis",
        menu: [
          ["Makaronai su daržovėmis", "7,20 €"],
          ["Vištiena su bulvėmis", "9,40 €"],
          ["Makaronai su mėsa", "8,10 €"],
        ],
      },
    ),
    R(
      "c2-menu-budget",
      "c2-cents",
      "",
      "Choose a drink and cake costing at most 6 euros.",
      ["Juoda kava + obuolių pyragas", "Kava su pienu + šokoladinis pyragas"],
      "Juoda kava + obuolių pyragas",
      "2,20 + 3,50 = 5,70; 2,80 + 4,20 = 7,00.",
      {
        menuTitle: "Gėrimai ir desertai",
        menu: [
          ["Juoda kava", "2,20 €"],
          ["Kava su pienu", "2,80 €"],
          ["Obuolių pyragas", "3,50 €"],
          ["Šokoladinis pyragas", "4,20 €"],
        ],
      },
    ),
    R(
      "c2-menu-read-request",
      "c2-with",
      "Padavėja: Kokios kavos?\nRasa: Su pienu. Be cukraus.",
      "What should arrive?",
      ["Coffee with milk, without sugar.", "Coffee with sugar, without milk."],
      "Coffee with milk, without sugar.",
      "Su includes milk; be excludes sugar.",
    ),
    B(
      "c2-menu-place-order",
      "c2-ingredient-name",
      "I would like vegetable salad.",
      ["Norėčiau", "daržovių", "salotų", "salotos"],
      ["Norėčiau daržovių salotų."],
      "Keep the ingredient daržovių and change salotos to salotų.",
    ),
    G(
      "c2-menu-case-return",
      "c2-with",
      "Norėčiau kavos su ___.",
      "I would like coffee with milk.",
      ["pienas", "pienu", "pieno"],
      "pienu",
      "Su takes instrumental: pienu.",
      true,
    ),
    R(
      "c2-menu-message",
      "c2-object",
      "Lina: Man patinka žuvis. Nevalgau mėsos. Norėčiau žuvies su ryžiais.\nTomas: Norėčiau vištienos be bulvių.",
      "Which order belongs to Tomas?",
      ["Chicken without potatoes.", "Fish with rice."],
      "Chicken without potatoes.",
      "Tomas requests vištienos be bulvių.",
    ),
  ],
);
L(
  "food-reading",
  "Read about Lithuanian food",
  "Understand a short food description, then write about your own habits.",
  "60–61",
  ["šaltibarščiai", "cepelinai", "koldūnai"],
  ["food descriptions", "quantities", "likes and dislikes"],
  [
    M(
      "c2-local-food",
      "Three dishes",
      [
        ["šaltibarščiai", "cold beetroot soup"],
        ["cepelinai", "filled potato dumplings"],
        ["koldūnai", "small filled dumplings"],
      ],
      "Learn the dish names as vocabulary. A description tells you their ingredients; a name alone does not.",
    ),
    R(
      "c2-culture-cold",
      "c2-local-food",
      "Šaltibarščiai yra šalta sriuba. Sriuboje yra burokėlių, agurkų ir kiaušinių. Sriubą valgome su karštomis bulvėmis.",
      "What is served hot?",
      ["The soup.", "The potatoes."],
      "The potatoes.",
      "Šalta describes the soup; karštomis describes the potatoes.",
      {
        glossary: [
          ["burokėlių", "beetroot"],
          ["kiaušinių", "eggs"],
          ["sriuboje", "in the soup"],
        ],
      },
    ),
    R(
      "c2-culture-ingredient",
      "c2-local-food",
      "Cepelinai yra bulvių patiekalas. Galima valgyti cepelinus su mėsa, su grybais arba su varške.",
      "Which two fillings are alternatives to meat?",
      ["Mushrooms and curd cheese.", "Fish and rice."],
      "Mushrooms and curd cheese.",
      "The text gives su grybais and su varške.",
      {
        glossary: [
          ["patiekalas", "dish"],
          ["galima", "it is possible"],
          ["arba", "or"],
        ],
      },
    ),
    R(
      "c2-culture-bread",
      "c2-quantity",
      "Mūsų šeima valgo daug juodos duonos. Man patinka duona su sūriu. Rasa nevalgo sūrio. Ji valgo duoną su medumi.",
      "What does Rasa eat with bread?",
      ["Cheese.", "Honey."],
      "Honey.",
      "Ji valgo duoną su medumi says she eats bread with honey.",
      {
        glossary: [
          ["mūsų šeima", "our family"],
          ["medumi", "honey (after su)"],
        ],
      },
    ),
    {
      id: "c2-habits-writing",
      kind: "writing",
      target: "c2-habits",
      ability: "self-reviewed-writing",
      source: "What do you eat and drink?",
      instruction:
        "Write two or three sentences about yourself. Use the checklist to review your message.",
      checklist: [
        "Say something you like or dislike.",
        "Say what you eat or drink.",
        "Check the endings after your verbs or quantity words.",
      ],
      sample:
        "Man patinka arbata. Geriu arbatą be cukraus. Valgau daug daržovių.",
      hint: "Use man patinka, geriu or valgau to start.",
      answers: [],
      correction: "Compare your message with the example and checklist.",
    },
  ],
);
function finalConversation(variant = 0) {
  const water = variant === 1;
  return [
    CHAT(
      "c2-final-start",
      "c2-order",
      "final",
      "Ko norėtumėte?",
      water ? "Order still water." : "Order black coffee.",
      water
        ? ["Norėčiau negazuoto vandens.", "Norėčiau gazuoto vandens."]
        : ["Norėčiau juodos kavos.", "Norėčiau juodos arbatos."],
      water ? ["Norėčiau negazuoto vandens."] : ["Norėčiau juodos kavos."],
      "Dar ko nors?",
    ),
    {
      ...CHAT(
        "c2-final-food",
        "c2-ingredient-name",
        "final",
        "Dar ko nors?",
        "Order mushroom soup.",
        undefined,
        ["Norėčiau grybų sriubos.", "Prašom grybų sriubos."],
        "Prašom. Gero apetito!",
        { continuation: true },
      ),
      kind: "chat-bank",
      ability: "construction",
      words: ["Norėčiau", "grybų", "sriubos", "sriuba"],
    },
    CHAT(
      "c2-final-thanks",
      "c2-host",
      "final",
      "Gero apetito!",
      "Thank the server.",
      ["Ačiū!", "Ačiū, ne."],
      ["Ačiū!"],
      "Ar buvo skanu?",
      { continuation: true },
    ),
    CHAT(
      "c2-final-compliment",
      "c2-host",
      "final",
      "Ar buvo skanu?",
      "Say it was tasty and ask for the bill.",
      ["Ačiū, labai skanu. Sąskaitą, prašom.", "Ačiū, ne. Norėčiau kavos."],
      ["Ačiū, labai skanu. Sąskaitą, prašom."],
      water
        ? "Septyni eurai keturiasdešimt centų. Kaip mokėsite?"
        : "Aštuoni eurai dvidešimt centų. Kaip mokėsite?",
      { continuation: true },
    ),
    {
      ...CHAT(
        "c2-final-pay",
        "c2-payment",
        "final",
        "Kaip mokėsite?",
        water ? "Pay in cash." : "Pay by card.",
        undefined,
        water ? ["Grynaisiais."] : ["Kortele."],
        "Ačiū. Viso gero.",
        { continuation: true },
      ),
      kind: "type",
      ability: "word-recall",
      words: ["Kortele", "Grynaisiais"],
    },
    C(
      "c2-final-amount",
      "c2-cents",
      water
        ? "Septyni eurai keturiasdešimt centų."
        : "Aštuoni eurai dvidešimt centų.",
      water ? ["7,40 €", "7,14 €", "14,07 €"] : ["8,20 €", "8,02 €", "20,08 €"],
      water ? "7,40 €" : "8,20 €",
      "Read the euros first, then the cents.",
      { instruction: "Choose the amount." },
    ),
    G(
      "c2-final-person",
      "c2-like-they",
      "___ patinka žuvis.",
      "They (women) like fish.",
      ["Jiems", "Joms", "Jums"],
      "Joms",
      "Jos changes to joms with patinka.",
      true,
    ),
    G(
      "c2-final-verb",
      "c2-verbs-group",
      "Mes ___ arbatą.",
      "We drink tea.",
      ["geriame", "geriate", "geria"],
      "geriame",
      "Mes takes geriame.",
      true,
    ),
    G(
      "c2-final-negative",
      "c2-object",
      "Ji negeria ___.",
      "She does not drink tea.",
      ["arbata", "arbatą", "arbatos"],
      "arbatos",
      "Negeria takes genitive: arbatos.",
      true,
    ),
    G(
      "c2-final-quantity",
      "c2-quantity",
      "Valgau daug ___.",
      "I eat a lot of potatoes.",
      ["bulvės", "bulves", "bulvių"],
      "bulvių",
      "Daug takes genitive plural: bulvių.",
      true,
    ),
    G(
      "c2-final-without",
      "c2-with-more",
      "Arbata be ___.",
      "Tea without sugar.",
      ["cukrus", "cukrumi", "cukraus"],
      "cukraus",
      "Be takes genitive: cukraus.",
      true,
    ),
    {
      id: "c2-final-note",
      kind: "writing",
      target: "c2-order-note",
      ability: "self-reviewed-writing",
      source: "Leave a café order for a friend.",
      instruction:
        "Ask for a drink and something to eat. Include one “with” or “without” preference.",
      checklist: [
        "Name a drink and something to eat.",
        "Include su or be with the ingredient.",
        "Check the request and ingredient endings.",
      ],
      sample: "Norėčiau kavos be cukraus ir sumuštinio su sūriu.",
      hint: "Use norėčiau for the request. The ingredient after su or be has its own ending.",
      answers: [],
      correction: "Compare your order with the example and checklist.",
    },
  ].map((q) =>
    variant === 1 &&
    ["c2-final-start", "c2-final-pay", "c2-final-amount"].includes(q.id)
      ? { ...q, id: `${q.id}-cash`, reviewKey: `${q.target}:${q.id}:cash` }
      : q,
  );
}
L(
  "chapter-check",
  "Your café visit",
  "Handle a full exchange and bring the chapter’s grammar back together.",
  "34–61",
  [],
  ["orders", "ingredients", "payment", "preferences", "verb and noun forms"],
  finalConversation(),
);

// Close lexical coverage by explicit teaching and retrieval, never by merely
// appearing in a distractor, explanation, or reference list.
const taughtLexemes = new Set(
  lessons.flatMap((l) => l.steps).flatMap((q) => q.lexemes || []),
);
const placements = [
  ["c2l1", "plural-words", "Apples and buns", "c2-plurals"],
  [
    "c2-lex-meat-and-fish",
    "fish-counter",
    "Fish and meat choices",
    "c2-requests",
  ],
  ["c2-lex-bread-and-dairy", "dairy-labels", "Dairy labels", "c2-menu-extras"],
  [
    "c2-lex-vegetable-basket",
    "vegetable-basket",
    "Vegetables and eggs",
    "c2-sides",
  ],
  ["c2-lex-fruit-basket", "fruit-basket", "Fruit choices", "c2-plurals"],
  [
    "c2-lex-dessert-and-the-cupboard",
    "cupboard",
    "Sweets and cupboard foods",
    "c2-describe",
  ],
  [
    "c2-lex-on-the-menu",
    "menu-categories",
    "Find your way around a menu",
    "c2-requests",
  ],
  [
    "c2-lex-describe-a-flavour",
    "flavour-words",
    "Describe a flavour",
    "c2-whole-order",
  ],
  [
    "c2-lex-how-food-is-prepared",
    "preparation-words",
    "How food is prepared",
    "c2-whole-order",
  ],
  [
    "c2-lex-paying-and-caf-signs",
    "cafe-words",
    "People and signs at the café",
    "c2-pay",
  ],
  [
    "c2-lex-food-and-drink-actions",
    "action-words",
    "Eating, drinking and paying",
    "c2-want",
  ],
  [
    "c2-lex-lithuanian-dishes",
    "dish-words",
    "Local dishes and menu labels",
    "c2-menu-reading",
  ],
  [
    "c2-lex-food-and-traditions",
    "food-traditions",
    "Food and traditions",
    "c2-food-reading",
  ],
  [
    "c2-source-additions",
    "describing-words",
    "Colours, sizes and signs",
    "c2-describe",
  ],
];
for (const [section, id, title, before] of placements) {
  const missing = chapterTwoLexicon.filter(
    (w) => w.section === section && !taughtLexemes.has(w.lt),
  );
  // At most six new words per lesson, introduced in groups of two or three.
  for (let n = 0; n < missing.length; n += 6) {
    const batch = missing.slice(n, n + 6);
    if (!batch.length) continue;
    const pairs = batch.map((w) => [w.lt, w.en]);
    // A singleton is contrasted with two already taught words, rather than a
    // one-option recognition task.
    if (pairs.length === 1) pairs.push(["kava", "coffee"], ["arbata", "tea"]);
    const groups =
      pairs.length === 4
        ? [pairs.slice(0, 2), pairs.slice(2)]
        : pairs.length <= 3
          ? [pairs]
          : [pairs.slice(0, 3), pairs.slice(3)];
    V(
      `${id}-${n / 6 + 1}`,
      missing.length > 6 ? `${title} · ${n / 6 + 1}` : title,
      String(batch[0].sourcePages),
      groups,
      ["earlier café words"],
    );
    const added = lessons.pop();
    added.goal = vocabularyGoals[id];
    added.legacyLexemes = batch.flatMap((w) => w.legacyIds);
    lessons.splice(
      lessons.findIndex((l) => l.id === before),
      0,
      added,
    );
    batch.forEach((w) => taughtLexemes.add(w.lt));
  }
}
// Planned later retrieval is part of the path, not merely an optional button.
// Capture the teaching path before adding returns so returns never generate returns.
const teachingPath = [...lessons];
const lexicalRecalls = teachingPath.flatMap((l, index) =>
  l.steps
    .filter((q) => q.kind === "type" && q.target.startsWith("c2-word:"))
    .map((q) => ({ q, index })),
);
const returnLessons = [];
// Leave room after late chapter words as well. These cumulative lessons use
// previously taught material; no new vocabulary is introduced.
for (const [id, title, goal] of [
  [
    "review-menu",
    "Bring the menu together",
    "Recall earlier words in familiar menu and preference patterns.",
  ],
  [
    "review-forms",
    "Bring the forms together",
    "Retrieve words and grammatical forms after intervening lessons.",
  ],
  [
    "review-use",
    "One more café visit",
    "Use the chapter’s language again before the final conversation.",
  ],
]) {
  L(id, title, goal, "32–61", [], ["earlier words and patterns"], []);
  returnLessons.push(lessons.pop());
}
lessons.splice(lessons.length - 1, 0, ...returnLessons);
for (const { q, index } of lexicalRecalls) {
  const word = q.answers[0],
    context = adjectiveContexts[word];
  const earliest = Math.max(
    index + 3,
    teachingPath.findIndex((l) => l.id === "c2-preferences") + 1,
    context ? teachingPath.findIndex((l) => l.id === "c2-describe") + 1 : 0,
  );
  const anchor = teachingPath[Math.min(earliest, teachingPath.length - 1)];
  const start = lessons.indexOf(anchor);
  const candidates = lessons.slice(start, -1);
  // Spread six-word batches across several lessons; avoid a block of immediate repeats.
  const destination =
    candidates.filter(
      (l) => l.steps.filter((t) => t.plannedReturn).length < 4,
    )[0] ||
    returnLessons.reduce((a, b) => (a.steps.length <= b.steps.length ? a : b));
  const contextual = !!context || preferenceWords.has(word);
  const source = context?.[0] || (contextual ? "Man patinka ___." : q.source);
  const translation =
    context?.[1] ||
    (contextual ? `I like ${preferenceMeanings[word]}.` : undefined);
  destination.steps.push({
    ...q,
    id: `${q.id}-later`,
    source,
    translation,
    kind: contextual ? "gap-type" : "type",
    instruction: contextual ? "Complete the sentence." : "Write in Lithuanian.",
    plannedReturn: true,
    returnOf: q.id,
    ability: "word-recall",
    hint: context
      ? "The describing word must agree with the named food."
      : "Recall the word from the earlier lessons.",
  });
}
// Grammar returns preserve the tested form. These are retrieval checks, not
// evidence of transfer to an unseen grammatical pattern.
// Retain the explicit target form; a blank in a sentence is not mastery of every word.
const formRecalls = teachingPath.flatMap((l, index) =>
  l.steps
    .filter(
      (q) =>
        q.ability === "form-recall" &&
        !q.plannedReturn &&
        l.id !== "c2-chapter-check",
    )
    .map((q) => ({ q, index })),
);
for (const { q, index } of formRecalls) {
  const anchor = teachingPath[Math.min(index + 3, teachingPath.length - 1)];
  const candidates = lessons.slice(lessons.indexOf(anchor), -1);
  const destination =
    candidates.find((l) => l.steps.filter((t) => t.plannedReturn).length < 6) ||
    returnLessons.reduce((a, b) => (a.steps.length <= b.steps.length ? a : b));
  destination.steps.push({
    ...q,
    id: `${q.id}-later`,
    plannedReturn: true,
    returnOf: q.id,
  });
}
// A cumulative return combines early and recent language. These explicitly
// authored contexts keep a known form while changing the surrounding message.
const cumulativeReturns = [
  [0, "c2-like-her", "___ patinka vanduo.", "She likes water."],
  [0, "c2-want-we", "Mes ___ valgyti.", "We want to eat."],
  [1, "c2-request-fish", "Prašom ___.", "Fish, please."],
  [1, "c2-without-milk", "Arbata be ___.", "Tea without milk."],
  [2, "c2-object-juice", "Mes geriame ___.", "We drink juice."],
  [2, "c2-quantity-milk", "Ji geria nedaug ___.", "She drinks little milk."],
];
for (const [index, id, source, translation] of cumulativeReturns) {
  const original = teachingPath
    .flatMap((l) => l.steps)
    .find((q) => q.id === id);
  returnLessons[index].steps.push({
    ...original,
    id: `${id}-cumulative`,
    source,
    translation,
    plannedReturn: true,
    returnOf: id,
  });
}
for (const [index, word, source, translation] of [
  [0, "kava", "___ ir arbata.", "Coffee and tea."],
  [0, "bandelė", "___ su sūriu.", "A bun with cheese."],
  [1, "žuvis", "___ su ryžiais.", "Fish with rice."],
  [1, "duona", "___ su medumi.", "Bread with honey."],
  [2, "sriuba", "Daržovių ___.", "Vegetable soup."],
  [2, "pyragas", "Obuolių ___.", "Apple cake."],
]) {
  const original = lexicalRecalls.find(({ q }) => q.answers[0] === word).q;
  returnLessons[index].steps.push({
    ...original,
    id: `${original.id}-cumulative`,
    source,
    translation,
    kind: "gap-type",
    instruction: "Complete the sentence.",
    plannedReturn: true,
    returnOf: original.id,
  });
}
const reviewKeyFor = (q) =>
  q.reviewKey ||
  (q.target?.startsWith("c2-word:")
    ? q.target
    : ["form-choice", "form-recall"].includes(q.ability)
      ? `${q.target}:form:${q.answers[0]}`
      : `${q.target}:${q.returnOf || q.id}`);
const withReviewKey = (q) => ({ ...q, reviewKey: reviewKeyFor(q) });
for (const lesson of lessons)
  for (const q of lesson.steps) {
    if (q.target) q.reviewKey = reviewKeyFor(q);
  }
export const chapterTwoReturnPlan = lessons.flatMap((l) =>
  l.steps
    .filter((q) => q.plannedReturn)
    .map((q) => ({
      lesson: l.id,
      step: q.id,
      target: q.target,
      from: q.returnOf,
      kind: q.kind,
      ability: q.ability,
    })),
);
export const chapterTwoWordbook = chapterTwoLexicon.map((w) => [w.lt, w.en]);

function repairFor(step, answer) {
  // A local corrective choice targets the same linguistic decision. Never fall
  // back to an unrelated greeting/naming repair for a new curriculum target.
  const answers = step.answers;
  if (!answers?.length) return null;
  const options = [
    ...new Set([answers[0], ...(step.options || step.words || [])]),
  ];
  if (["gap", "gap-type"].includes(step.kind))
    return {
      ...step,
      id: `${step.id}-repair`,
      kind: "gap",
      ability: "supported-repair",
      repair: true,
      options,
      teaching: step.correction,
    };
  return {
    ...step,
    id: `${step.id}-repair`,
    kind: "choice",
    thread: undefined,
    continuation: undefined,
    ability: "supported-repair",
    repair: true,
    options: [
      ...new Set([
        answers[0],
        answer,
        ...(step.options || []).filter((x) => !answers.includes(x)),
      ]),
    ],
    teaching: step.correction,
    instruction: "Use the correction, then choose.",
  };
}
export const chapterTwoCourse = {
  assessmentPolicy: lithuanianAssessmentPolicy,
  key: "sakyk.authored.chapter-2.v1",
  version: 1,
  lessons,
  reference,
  title: "Gero apetito!",
  eyebrow: "CHAPTER 2 · AT THE CAFÉ",
  description: "Choose food, talk about tastes, order a meal and pay.",
  completeTitle: "Chapter 2 complete.",
  allowDirectEntry: true,
  wordbook: chapterTwoWordbook,
  stepsFor: (lesson, variant) =>
    lesson.id === "c2-chapter-check"
      ? finalConversation(variant).map(withReviewKey)
      : lesson.steps,
  assessmentSteps: finalConversation(1).map(withReviewKey),
  repairFor,
};
export const chapterTwoRuntime = createCourseRuntime(chapterTwoCourse);
export const chapterTwoLessons = lessons;
