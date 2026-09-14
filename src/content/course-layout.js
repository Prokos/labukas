// Content organization is declared here, separately from scheduling algorithms.
export const targetTransfers = [
  { from: "c1l4", to: "c1l6", items: ["c1l4i4", "c1l4i5"] },
  { from: "c2l1", to: "c2l7", items: ["c2l1i4", "c2l1i5"] },
];
export const lessonOverrides = {
  c2l1: {
    kind: "vocabulary",
    rule: "Learn a small set of foods, then recognize them in a simple sentence. Duona is bread; sūris is cheese. Obuoliai and bandelės are plural: apples and buns. Preferences have their own class later.",
  },
  c1l5: {
    rule: "Keep Lithuanian spelling marks: š is like sh, č like ch, ž like the s in measure. I and u are short; į/y and ų/ū are long. Open Reference to look up letter names. Practise these spellings in words and short sentences.",
  },
};
