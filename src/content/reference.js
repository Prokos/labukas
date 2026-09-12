// Study references adapted from the supplied textbook, printed pp. 13, 250–253.
export const alphabet = [
  ["A", "a", "a"],
  ["Ą", "ą", "a nosinė"],
  ["B", "b", "bė"],
  ["C", "c", "cė"],
  ["Č", "č", "čė"],
  ["D", "d", "dė"],
  ["E", "e", "e"],
  ["Ę", "ę", "e nosinė"],
  ["Ė", "ė", "ė"],
  ["F", "f", "ef"],
  ["G", "g", "gė"],
  ["H", "h", "ha"],
  ["I", "i", "i"],
  ["Į", "į", "i nosinė"],
  ["Y", "y", "i ilgoji"],
  ["J", "j", "jot"],
  ["K", "k", "ka"],
  ["L", "l", "el"],
  ["M", "m", "em"],
  ["N", "n", "en"],
  ["O", "o", "o"],
  ["P", "p", "pė"],
  ["R", "r", "er"],
  ["S", "s", "es"],
  ["Š", "š", "eš"],
  ["T", "t", "tė"],
  ["U", "u", "u"],
  ["Ų", "ų", "u nosinė"],
  ["Ū", "ū", "u ilgoji"],
  ["V", "v", "vė"],
  ["Z", "z", "zė"],
  ["Ž", "ž", "žė"],
];
export const caseColumns = [
  "Nominative",
  "Genitive",
  "Dative",
  "Accusative",
  "Instrumental",
  "Locative",
  "Vocative",
];
export const nounForms = [
  ["namas", "namo", "namui", "namą", "namu", "name", "name"],
  ["brolis", "brolio", "broliui", "brolį", "broliu", "brolyje", "broli"],
  [
    "kambarys",
    "kambario",
    "kambariui",
    "kambarį",
    "kambariu",
    "kambaryje",
    "kambary",
  ],
  ["sūnus", "sūnaus", "sūnui", "sūnų", "sūnumi", "sūnuje", "sūnau"],
  [
    "televizorius",
    "televizoriaus",
    "televizoriui",
    "televizorių",
    "televizoriumi",
    "televizoriuje",
    "televizoriau",
  ],
  ["kava", "kavos", "kavai", "kavą", "kava", "kavoje", "kava"],
  ["kėdė", "kėdės", "kėdei", "kėdę", "kėde", "kėdėje", "kėde"],
  ["žuvis", "žuvies", "žuviai", "žuvį", "žuvimi", "žuvyje", "žuvie"],
  ["stotis", "stoties", "stočiai", "stotį", "stotimi", "stotyje", "stotie"],
  [
    "vanduo",
    "vandens",
    "vandeniui",
    "vandenį",
    "vandeniu",
    "vandenyje",
    "vandenie",
  ],
  [
    "duktė",
    "dukters",
    "dukteriai",
    "dukterį",
    "dukterimi",
    "dukteryje",
    "dukterie",
  ],
  ["sesuo", "sesers", "seseriai", "seserį", "seserimi", "seseryje", "seserie"],
];
export const pluralForms = [
  ["namai", "namų", "namams", "namus", "namais", "namuose", "namai"],
  [
    "broliai",
    "brolių",
    "broliams",
    "brolius",
    "broliais",
    "broliuose",
    "broliai",
  ],
  [
    "kambariai",
    "kambarių",
    "kambariams",
    "kambarius",
    "kambariais",
    "kambariuose",
    "kambariai",
  ],
  ["sūnūs", "sūnų", "sūnums", "sūnus", "sūnumis", "sūnuose", "sūnūs"],
  [
    "televizoriai",
    "televizorių",
    "televizoriams",
    "televizorius",
    "televizoriais",
    "televizoriuose",
    "televizoriai",
  ],
  ["kavos", "kavų", "kavoms", "kavas", "kavomis", "kavose", "kavos"],
  ["kėdės", "kėdžių", "kėdėms", "kėdes", "kėdėmis", "kėdėse", "kėdės"],
  ["žuvys", "žuvų", "žuvims", "žuvis", "žuvimis", "žuvyse", "žuvys"],
];
export const pronounForms = [
  ["aš", "manęs", "man", "mane", "manimi"],
  ["tu", "tavęs", "tau", "tave", "tavimi"],
  ["jis", "jo", "jam", "jį", "juo"],
  ["ji", "jos", "jai", "ją", "ja"],
  ["mes", "mūsų", "mums", "mus", "mumis"],
  ["jūs", "jūsų", "jums", "jus", "jumis"],
  ["jie", "jų", "jiems", "juos", "jais"],
  ["jos", "jų", "joms", "jas", "jomis"],
];
export const verbPeople = ["aš", "tu", "jis / ji / jie / jos", "mes", "jūs"];
export const verbForms = [
  ["būti · present", "esu", "esi", "yra", "esame", "esate"],
  ["nebūti · present", "nesu", "nesi", "nėra", "nesame", "nesate"],
  ["gyventi · present", "gyvenu", "gyveni", "gyvena", "gyvename", "gyvenate"],
  ["laukti · present", "laukiu", "lauki", "laukia", "laukiame", "laukiate"],
  ["turėti · present", "turiu", "turi", "turi", "turime", "turite"],
  ["valgyti · present", "valgau", "valgai", "valgo", "valgome", "valgote"],
  ["gyventi · past", "gyvenau", "gyvenai", "gyveno", "gyvenome", "gyvenote"],
  ["turėti · past", "turėjau", "turėjai", "turėjo", "turėjome", "turėjote"],
  ["laukti · past", "laukiau", "laukei", "laukė", "laukėme", "laukėte"],
  ["valgyti · past", "valgiau", "valgei", "valgė", "valgėme", "valgėte"],
  ["būti · future", "būsiu", "būsi", "bus", "būsime", "būsite"],
  ["eiti · future", "eisiu", "eisi", "eis", "eisime", "eisite"],
  [
    "gyventi · future",
    "gyvensiu",
    "gyvensi",
    "gyvens",
    "gyvensime",
    "gyvensite",
  ],
];
export const skillNotes = {
  genitive:
    "Genitive follows iš, be, prie, nuo, iki, and time po; it is also used after norėti, reikia, nėra, quantities and negated objects. The noun ending depends on its dictionary form.",
  accusative:
    "Accusative marks a direct object and follows į, pas, per and prieš. It also expresses when an event happens. Compare -as → -ą, -a → -ą, -ė → -ę, and -is/-ys → -į.",
  dative:
    "Dative identifies the person something is for or pleasing to. Examples: man, tau, jam, jai, mamai, broliui, seseriai. The thing after patinka stays nominative.",
  instrumental:
    "Instrumental follows su and expresses a means of transport. Examples: autobusu, traukiniu, su draugu, su drauge, su draugais.",
  locative:
    "Locative answers where something is, rather than where it is going: Vilniuje, Kaune, kambaryje, virtuvėje. For a floor, both words agree: antrame aukšte.",
  vocative:
    "Vocative addresses somebody directly: Jonas → Jonai, brolis → broli, sesuo → seserie. It is different from a subject or object.",
  adjectives:
    "Adjectives agree with the noun’s gender, number and case. Common pairs include -as/-a, -us/-i and -is/-ė. Weather can instead use a neuter form such as šalta.",
};

nounForms.push(
  ...`kelias|kelio|keliui|kelią|keliu|kelyje|kely
kompiuteris|kompiuterio|kompiuteriui|kompiuterį|kompiuteriu|kompiuteryje|kompiuteri
knyga|knygos|knygai|knygą|knyga|knygoje|knyga
bažnyčia|bažnyčios|bažnyčiai|bažnyčią|bažnyčia|bažnyčioje|bažnyčia
gatvė|gatvės|gatvei|gatvę|gatve|gatvėje|gatve
pilis|pilies|piliai|pilį|pilimi|pilyje|pilie
dantis|danties|dančiui|dantį|dantimi|dantyje|dantie
turgus|turgaus|turgui|turgų|turgumi|turguje|turgau
vaisius|vaisiaus|vaisiui|vaisių|vaisiumi|vaisiuje|vaisiau
šuo|šuns|šuniui|šunį|šuniu|šunyje|šunie
mėnuo|mėnesio|mėnesiui|mėnesį|mėnesiu|mėnesyje|mėnesi
žmogus|žmogaus|žmogui|žmogų|žmogumi|žmoguje|žmogau`
    .split("\n")
    .map((row) => row.split("|")),
);
pluralForms.push(
  ...`keliai|kelių|keliams|kelius|keliais|keliuose
kompiuteriai|kompiuterių|kompiuteriams|kompiuterius|kompiuteriais|kompiuteriuose
knygos|knygų|knygoms|knygas|knygomis|knygose
bažnyčios|bažnyčių|bažnyčioms|bažnyčias|bažnyčiomis|bažnyčiose
gatvės|gatvių|gatvėms|gatves|gatvėmis|gatvėse
pilys|pilių|pilims|pilis|pilimis|pilyse
dantys|dantų|dantims|dantis|dantimis|dantyse
turgūs|turgų|turgums|turgus|turgumis|turguose
vaisiai|vaisių|vaisiams|vaisius|vaisiais|vaisiuose
vandenys|vandenų|vandenims|vandenis|vandenimis|vandenyse
seserys|seserų|seserims|seseris|seserimis|seseryse
dukterys|dukterų|dukterims|dukteris|dukterimis|dukteryse
šunys|šunų|šunims|šunis|šunimis|šunyse
mėnesiai|mėnesių|mėnesiams|mėnesius|mėnesiais|mėnesiuose
žmonės|žmonių|žmonėms|žmones|žmonėmis|žmonėse`
    .split("\n")
    .map((row) => {
      const cells = row.split("|");
      return [...cells, cells[0]];
    }),
);
[
  "manyje",
  "tavyje",
  "jame",
  "joje",
  "mumyse",
  "jumyse",
  "juose",
  "jose",
].forEach((loc, n) => pronounForms[n].push(loc));
verbForms.push([
  "valgyti · future",
  "valgysiu",
  "valgysi",
  "valgys",
  "valgysime",
  "valgysite",
]);
export const numeralForms = `1|vienas / viena|pirmas / pirma|vieni / vienos
2|du / dvi|antras / antra|dveji / dvejos
3|trys|trečias / trečia|treji / trejos
4|keturi / keturios|ketvirtas / ketvirta|ketveri / ketverios
5|penki / penkios|penktas / penkta|penkeri / penkerios
6|šeši / šešios|šeštas / šešta|šešeri / šešerios
7|septyni / septynios|septintas / septinta|septyneri / septynerios
8|aštuoni / aštuonios|aštuntas / aštunta|aštuoneri / aštuonerios
9|devyni / devynios|devintas / devinta|devyneri / devynerios
10|dešimt|dešimtas / dešimta|—
11|vienuolika|vienuoliktas / vienuolikta|—
12|dvylika|dvyliktas / dvylikta|—
13|trylika|tryliktas / trylikta|—
14|keturiolika|keturioliktas / keturiolikta|—
15|penkiolika|penkioliktas / penkiolikta|—
16|šešiolika|šešioliktas / šešiolikta|—
17|septyniolika|septynioliktas / septyniolikta|—
18|aštuoniolika|aštuonioliktas / aštuoniolikta|—
19|devyniolika|devynioliktas / devyniolikta|—
20|dvidešimt|dvidešimtas / dvidešimta|—
30|trisdešimt|trisdešimtas / trisdešimta|—
40|keturiasdešimt|keturiasdešimtas / keturiasdešimta|—
50|penkiasdešimt|penkiasdešimtas / penkiasdešimta|—
60|šešiasdešimt|šešiasdešimtas / šešiasdešimta|—
70|septyniasdešimt|septyniasdešimtas / septyniasdešimta|—
80|aštuoniasdešimt|aštuoniasdešimtas / aštuoniasdešimta|—
90|devyniasdešimt|devyniasdešimtas / devyniasdešimta|—`
  .split("\n")
  .map((row) => row.split("|"));
