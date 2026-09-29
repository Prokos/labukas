import {
  nounForms,
  pluralForms,
  pronounForms,
  verbForms,
  numeralForms,
} from "../curriculum/reference.js";

// Shared course policy, grounded in the language reference. The runtime
// adds canonical forms taught by each course; there is no word-level opt-in list.
export const lithuanianAssessmentPolicy = Object.freeze({
  spelling: "diacritics",
  referenceForms: Object.freeze([
    ...nounForms.flat(),
    ...pluralForms.flat(),
    ...pronounForms.flat(),
    ...verbForms.flatMap((row) => row.slice(1)),
    ...numeralForms.flatMap((row) => row.slice(1)),
  ]),
});
