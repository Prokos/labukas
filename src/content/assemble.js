import { legacyContexts } from "./legacy-contexts.js";
import { writing } from "./writing.js";
import { vocabulary } from "./vocabulary.js";
import { applications } from "./applications.js";
import { patterns } from "./patterns.js";
import { countries, numberClasses } from "./systems.js";
import { situations } from "./situations.js";

const slug = (text) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
const hash = (text) => {
  let h = 2166136261;
  for (const c of text) h = Math.imul(h ^ c.codePointAt(0), 16777619);
  return (h >>> 0).toString(36);
};
const rows = (text, key, role = "core") =>
  text
    .trim()
    .split("\n")
    .filter(Boolean)
    .map((row) => {
      const [lt, en, skill = "vocabulary", cloze = "", alts = ""] = row
        .split("|")
        .map((x) => x.trim());
      return {
        key: `${key}-${role}-${hash(lt + "|" + en)}`,
        lt,
        en,
        skill,
        cloze,
        alternatives: alts ? alts.split("~") : [],
        role,
      };
    });
const lexicalAnchor = [
  "c1l2",
  "c2l2",
  "c3l1",
  "c4l1",
  "c5l1",
  "c6l1",
  "c7l1",
  "c8l2",
  "c9l2",
  "c10l1",
];
const patternAnchors = {
  "negative-being": "c1l3",
  possession: "c1l3",
  "origin-endings": "c1l4",
  "present-people": "c1l7",
  "dative-people": "c2l2",
  "plural-food": "c2l2",
  "verb-types": "c2l3",
  "ordering-forms": "c2l3",
  "with-without-forms": "c2l8",
  "eat-not-eat": "c2l8",
  "which-food": "c2l4",
  "destination-contrast": "c3l2",
  "days-parts": "c3l3",
  "transport-endings": "c3l7",
  "home-absence": "c4l4",
  "home-locations": "c4l4",
  "modal-requests": "c4l6",
  "objects-hobbies": "c5l6",
  "past-people": "c5l4",
  "future-people": "c5l7",
  companions: "c5l7",
  "time-contrast": "c6l3",
  "study-questions": "c6l6",
  "family-objects": "c7l2",
  "family-dative": "c7l3",
  "comparison-contrast": "c7l6",
  "weather-neuter": "c8l5",
  "clothing-cases": "c8l6",
  "reflexive-people": "c9l3",
  "imperative-people": "c9l4",
  "adverbs-conjunctions": "c9l6",
  "gift-objects": "c10l4",
  "object-pronouns": "c10l3",
  "address-wishes": "c10l6",
  inviting: "c3l7",
  "family-questions": "c7l6",
  "tradition-questions": "c10l6",
  teens: "c2l4",
  tens: "c2l4",
  "compound-prices": "c2l4",
  "ordinals-early": "c3l3",
  "ordinals-later": "c3l3",
  "clock-hours": "c3l3",
  "half-hours": "c3l7",
  "count-gender": "c4l3",
  floors: "c4l6",
  "date-ordinals": "c6l4",
  "month-forms": "c6l4",
  "plural-age": "c7l2",
  "plural-only": "c7l6",
  "larger-numbers": "c7l6",
};

export const coverage = [];
export function expandCurriculum(chapters) {
  const pending = chapters.map(() => []);
  for (const ch of chapters)
    for (const l of ch.lessons)
      if (legacyContexts[l.key])
        l.items.push(
          ...rows(legacyContexts[l.key], l.key + "-extended", "context").map(
            (i) => ({ ...i, extension: true }),
          ),
        );
  chapters[0].lessons.find((l) => l.key === "c1l5").rule =
    "Keep Lithuanian spelling marks: š is like sh, č like ch, ž like the s in measure. I and u are short; į/y and ų/ū are long. Use the alphabet reference in Your course to look up letter names. Practise these spellings in words and short sentences.";

  function add(
    ch,
    key,
    title,
    kind,
    sourcePages,
    rule,
    core,
    context = "",
    before,
  ) {
    const id = `c${ch}-${key}`;
    const entry = {
      key: id,
      title,
      kind,
      rule,
      sourcePages,
      items: [
        ...rows(core, id),
        ...(context ? rows(context, id, "context") : []),
      ],
    };
    pending[ch - 1].push({ entry, before });
    coverage.push({
      chapter: ch,
      id,
      title,
      kind,
      sourcePages,
      targets: entry.items
        .filter((i) => i.role === "core")
        .map((i) => ({ id: i.key, lt: i.lt, en: i.en })),
    });
    return entry;
  }
  const known = new Set(
    chapters.flatMap((c) =>
      c.lessons.flatMap((l) =>
        l.items.map((i) => i.lt.toLocaleLowerCase("lt") + "|" + i.en),
      ),
    ),
  );
  for (const [ch, page, title, raw] of vocabulary) {
    const all = raw.split(";").map((s) => s.trim().split("|"));
    // Preserve homonyms as distinct senses; avoid repeating identical dictionary entries.
    const unique = all.filter(
      ([lt, en]) => !known.has(lt.toLocaleLowerCase("lt") + "|" + en),
    );
    for (const [lt, en] of unique)
      known.add(lt.toLocaleLowerCase("lt") + "|" + en);
    const core = unique.map(([lt, en]) => `${lt}|${en}`).join("\n");
    if (!core) continue;
    add(
      ch,
      "lex-" + slug(title),
      title,
      "vocabulary",
      String(page),
      `Learn this set in small groups. These are dictionary forms; sentence examples show how the words change in use. Keep Lithuanian spelling marks. ${title.includes("Professions") ? "Many profession nouns have gender pairs: -as → -a, -is → -ė, and -ius → -ė." : ""}`,
      core,
      applications[title],
      {
        "People and personal details": "c1l7",
        "Your first places": "c1l3",
        "Ask and understand": "c1l4",
        "Useful first replies": "c1l7",
        "The extended family": "c7l6",
        "Family events and actions": "c7l6",
        "Describe appearance": "c7l3",
        "Describe character": "c7l3",
        "Study tasks and equipment": "c6l3",
        "Managing your studies": "c6l3",
        "A working day": "c6l2",
        "Weather forecast": "c8l5",
        "Colour and fit": "c8l3",
        "Shopping actions": "c8l4",
        "People at the clinic": "c9l6",
        "At the pharmacy counter": "c9l3",
        "Spring celebrations": "c10l4",
        "Summer and autumn celebrations": "c10l4",
        "Christmas traditions": "c10l4",
        "Wishes and feelings": "c10l5",
      }[title] || lexicalAnchor[ch - 1],
    );
  }
  // Appendix geography is available without blocking a beginner's main journey.
  for (const [segment, optional] of [
    [countries.slice(0, 17), false],
    [countries.slice(17), true],
  ]) {
    for (let start = 0; start < segment.length; start += 4) {
      const group = segment.slice(start, start + 4),
        n = start / 4 + 1;
      const entry = add(
        1,
        `${optional ? "extra-" : " "}places-${n}`.trim(),
        `${optional ? "More countries" : "Countries and cities"} · ${n}`,
        "vocabulary",
        optional ? "249" : "15",
        "Learn country and city names. These language examples do not imply that everybody in a country speaks the same language.",
        group
          .flatMap(([lt, en, city, cityEn]) => [
            `${lt}|${en}`,
            `${city}|${cityEn} (city)`,
          ])
          .join("\n"),
        group
          .slice(0, 2)
          .map(
            ([, , , , lang, en]) =>
              `Aš kalbu ${lang}|I speak ${en}|present|Aš kalbu ___`,
          )
          .join("\n"),
      );
      entry.optional = optional;
    }
    const coreLanguages = new Set(countries.slice(0, 17).map((c) => c[4]));
    const languages = [
      ...new Map(segment.map((c) => [c[4], c[5]])).entries(),
    ].filter(([lt]) => !optional || !coreLanguages.has(lt));
    for (let start = 0; start < languages.length; start += 6) {
      const entry = add(
        1,
        `${optional ? "extra-" : ""}languages-${start / 6 + 1}`,
        `${optional ? "More languages" : "Languages"} · ${start / 6 + 1}`,
        "vocabulary",
        optional ? "249" : "15",
        "After kalbu or suprantu, name the language with an adverb in -iškai.",
        languages
          .slice(start, start + 6)
          .map(([lt, en]) => `${lt}|In ${en} (language)`)
          .join("\n"),
        languages
          .slice(start, start + 2)
          .map(
            ([lt, en]) =>
              `Ar kalbate ${lt}?|Do you speak ${en} (formal)?|present|Ar kalbate ___?`,
          )
          .join("\n"),
      );
      entry.optional = optional;
    }
  }
  for (const [ch, key, title, page, rule, core, context] of [
    ...patterns,
    ...numberClasses,
  ])
    add(
      ch,
      key,
      title,
      "pattern",
      page,
      rule,
      core,
      context,
      patternAnchors[key],
    );
  for (const [ch, key, title, page, passage, questions] of situations) {
    const id = `c${ch}-situation-${key}`;
    const entry = {
      key: id,
      title,
      kind: "reading",
      sourcePages: page,
      rule: "Read the text for a purpose. Use its information to answer; the text stays available. Early questions offer choices, later visits ask you to write a short answer. These are original practice situations.",
      items: questions.map(([question, lt, en, distractors], n) => ({
        key: `${id}-q${n + 1}`,
        lt,
        en,
        skill: "reading",
        cloze: "",
        alternatives: [],
        role: "core",
        activity: "reading",
        passage,
        question,
        distractors,
      })),
    };
    pending[ch - 1].push({ entry });
    coverage.push({
      chapter: ch,
      id,
      title,
      kind: "reading",
      sourcePages: page,
      targets: entry.items.map((i) => ({ id: i.key, lt: i.lt, en: i.en })),
    });
  }
  for (const [ch, title, page, question, rubric, model] of writing) {
    const key = `c${ch}-writing`;
    const entry = {
      key,
      title,
      kind: "writing",
      sourcePages: page,
      rule: "Use what you know to write your own message. Afterwards compare it with an example and a checklist. This is self-review: your draft is saved, but it is not automatically marked for grammar.",
      items: [
        {
          key: `${key}-draft`,
          lt: model,
          en: question,
          question,
          rubric,
          activity: "writing",
          skill: "writing",
          role: "core",
          cloze: "",
          alternatives: [],
        },
      ],
    };
    pending[ch - 1].push({ entry });
    coverage.push({
      chapter: ch,
      id: key,
      title,
      kind: "writing",
      sourcePages: page,
      targets: entry.items.map((i) => ({ id: i.key, lt: i.lt, en: i.en })),
    });
  }
  chapters.forEach((ch, n) => {
    const additions = pending[n],
      out = [];
    for (const l of ch.lessons) {
      out.push(
        ...additions.filter((x) => x.before === l.key).map((x) => x.entry),
      );
      out.push(l);
    }
    out.push(...additions.filter((x) => !x.before).map((x) => x.entry));
    ch.lessons = out;
  });
}
