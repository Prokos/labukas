import {
  nounForms,
  pluralForms,
  pronounForms,
  verbForms,
} from "./content/reference.js";

// Canonical contrasts from the reference and source chapter paradigms. These
// choose meaningful alternatives; they never synthesize an unreviewed ending.
export const courseFormFamilies = [
  ...nounForms,
  ...pluralForms,
  ...pronounForms,
  ...verbForms.map((row) => row.slice(1)),
  ["esu", "buvau", "būsiu"],
  ["esame", "buvome", "būsime"],
  ["parkas", "parko", "parką", "parke"],
  ["muziejus", "muziejaus", "muziejų", "muziejuje"],
  ["bankas", "banko", "banką", "banke"],
  ["kavinė", "kavinės", "kavinę", "kavinėje"],
  ["autobusas", "autobuso", "autobusą", "autobusu"],
  ["darbas", "darbo", "darbą", "darbe"],
  ["sesuo", "sesers", "seserį", "seseriai", "seserimi"],
  ["jaučiuosi", "jautiesi", "jaučiasi", "jaučiamės", "jaučiatės"],
  ["jaučiausi", "jauteisi", "jautėsi", "jautėmės", "jautėtės"],
  ["galva", "galvą", "galvos"],
  ["gerklė", "gerklę", "gerklės"],
  ["batai", "batus", "batų"],
  ["kelnės", "kelnes", "kelnių"],
  ["šitas", "šita", "šitie", "šitos"],
  ["du", "dvi", "dveji"],
  ["trys", "tris", "treji"],
];
