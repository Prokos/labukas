import { expandCurriculum } from "./content/assemble.js";
import { contexts, additions } from "./teaching-content.js";
// Original English-guided exercises aligned to LANGAS, printed pp. 8–10.
// Each row is Lithuanian | English | skill | optional cloze | optional answer alternatives.
const lesson = (title, rule, rows) => ({
  title,
  rule,
  items: rows
    .trim()
    .split("\n")
    .map((row) => {
      const [lt, en, skill = "vocabulary", cloze = "", alts = ""] =
        row.split("|");
      return {
        lt,
        en,
        skill,
        cloze,
        alternatives: alts ? alts.split("~") : [],
      };
    }),
});
export const chapters = [
  {
    title: "Hello, Lithuania!",
    lt: "Aš esu studentas, o tu?",
    subtitle: "Meet people. Introduce yourself. Find your first words.",
    pages: "11–30",
    icon: "Sun",
    lessons: [
      lesson(
        "Your first conversation",
        "Labas is an informal hello. Use laba diena for a polite “good afternoon”. Lithuanian has no words for “a” or “the”. Č, š and ž sound like ch, sh and the s in “measure”. Long vowels (ą, ę, į, ų, ū, y) matter: keep their letters when typing.",
        `
Labas|Hello|vocabulary
Laba diena|Good afternoon|vocabulary
Ačiū|Thank you|vocabulary
Prašom|You are welcome|vocabulary| |Prašau
Viso gero|Goodbye|vocabulary
Kaip sekasi?|How are you?|phrases
`,
      ),
      lesson(
        "A little about you",
        "Būti means “to be”: aš esu (I am), tu esi (you are, informal), jis / ji yra (he / she is), mes esame (we are), jūs esate (you are, plural or polite), jie / jos yra (they are). Masculine nouns often end in -as or -is; feminine nouns often end in -a or -ė. Ar introduces a yes/no question.",
        `
Aš esu studentas|I am a student (male)|present|Aš ___ studentas
Tu esi studentė|You are a student (female, informal)|present|Tu ___ studentė
Ji yra mokytoja|She is a teacher|present|Ji ___ mokytoja
Mes esame studentai|We are students|present|Mes ___ studentai
Ar jūs esate studentas?|Are you a student (male, formal)?|present|Ar jūs ___ studentas?
Mano vardas Jonas|My name is Jonas|pronouns|___ vardas Jonas
`,
      ),
      lesson(
        "Where are you from?",
        "Iš (from) takes the genitive: Lietuva → Lietuvos, Vilnius → Vilniaus, Kaunas → Kauno. For a location, use the locative: Vilniuje (in Vilnius), Kaune (in Kaunas). Mano means “my”; tavo means informal “your”.",
        `
Aš esu iš Lietuvos|I am from Lithuania|genitive|Aš esu iš ___
Ji yra iš Vilniaus|She is from Vilnius|genitive|Ji yra iš ___
Jis yra iš Kauno|He is from Kaunas|genitive|Jis yra iš ___
Aš gyvenu Vilniuje|I live in Vilnius|locative|Aš gyvenu ___
Ji gyvena Kaune|She lives in Kaunas|locative|Ji gyvena ___
Tavo vardas|Your name (informal)|pronouns|___ vardas
`,
      ),
      lesson(
        "Words for everyday life",
        "Present verbs of the -a type: gyventi → gyvenu, gyveni, gyvena; kalbėti → kalbu, kalbi, kalba. Lietuviškai means “in Lithuanian”. Numbers 1–10: vienas, du, trys, keturi, penki, šeši, septyni, aštuoni, devyni, dešimt.",
        `
Aš kalbu angliškai|I speak English|present|Aš ___ angliškai
Aš suprantu lietuviškai|I understand Lithuanian|present|Aš ___ lietuviškai
Ji dirba universitete|She works at a university|locative|Ji dirba ___
Aš studijuoju|I study|present
vienas, du, trys|one, two, three|numbers
aštuoni, devyni, dešimt|eight, nine, ten|numbers
`,
      ),
    ],
  },
  {
    title: "At the café",
    lt: "Gero apetito!",
    subtitle: "Order a coffee and find something delicious.",
    pages: "31–62",
    icon: "Coffee",
    lessons: [
      lesson(
        "Something delicious",
        "Food nouns have grammatical gender. Plurals include obuolys → obuoliai (apples) and bandelė → bandelės (buns). With patinka (is pleasing), use the dative person: man patinka (I like), tau patinka (you like).",
        `
duona|bread|vocabulary
sūris|cheese|vocabulary
obuoliai|apples|plural
bandelės|buns|plural
Man patinka kava|I like coffee|dative|___ patinka kava
Tau patinka arbata|You like tea (informal)|dative|___ patinka arbata
`,
      ),
      lesson(
        "I would like…",
        "Norėti (to want) uses genitive for what you want: kava → kavos, arbata → arbatos. Its present forms include noriu, nori, nori. Valgyti (to eat) is an -o type: valgau, valgai, valgo. Gerti (to drink): geriu, geri, geria.",
        `
Aš noriu kavos|I want coffee|genitive|Aš noriu ___
Aš noriu arbatos|I want tea|genitive|Aš noriu ___
Ji nori vandens|She wants water|genitive|Ji nori ___
Aš valgau|I eat|present|Aš ___
Tu geri|You drink (informal)|present|Tu ___
Ji valgo|She eats|present|Ji ___
`,
      ),
      lesson(
        "With or without?",
        "Be (without) takes genitive. Su (with) takes instrumental: pienas → pienu, cukrus → cukrumi, daržovės → daržovėmis. Genitive plural often ends in -ų: obuoliai → obuolių. Adjectives agree with nouns: skanus sūris, skani duona.",
        `
Kava be pieno|Coffee without milk|genitive|Kava be ___
Arbata su cukrumi|Tea with sugar|instrumental|Arbata su ___
Kava su pienu|Coffee with milk|instrumental|Kava su ___
Sriuba su daržovėmis|Soup with vegetables|instrumental|Sriuba su ___
Noriu obuolių|I want apples|genitive|Noriu ___
Skani duona|Delicious bread|adjectives|___ duona
`,
      ),
      lesson(
        "The bill, please",
        "Kiek kainuoja? asks “How much does it cost?” Prašom can mean “please”, “here you are”, or “you are welcome”, depending on context. Tens: dešimt (10), dvidešimt (20), trisdešimt (30), …, šimtas (100).",
        `
Kiek kainuoja?|How much does it cost?|phrases
Sąskaitą, prašom|The bill, please|phrases||Sąskaitą, prašau
Gero apetito!|Enjoy your meal!|phrases
Labai skanu|Very tasty|adjectives
Dvidešimt eurų|Twenty euros|numbers|___ eurų
šimtas|one hundred|numbers
`,
      ),
    ],
  },
  {
    title: "Around the city",
    lt: "Susitinkame senamiestyje!",
    subtitle: "Find your way and make plans to meet.",
    pages: "63–86",
    icon: "MapPin",
    lessons: [
      lesson(
        "Where are we going?",
        "Į (to, into) takes accusative: parkas → parką, kavinė → kavinę, universitetas → universitetą. Pas + accusative means going to a person. Eiti is going on foot: einu, eini, eina.",
        `
Aš einu į parką|I am going to the park|accusative|Aš einu į ___
Ji eina į kavinę|She is going to the café|accusative|Ji eina į ___
Mes einame į universitetą|We are going to the university|accusative|Mes einame į ___
Aš einu pas draugą|I am going to a friend (male)|accusative|Aš einu pas ___
Kur tu eini?|Where are you going (informal)?|present|Kur tu ___?
`,
      ),
      lesson(
        "Finding the way",
        "Prie (near, by) takes genitive: prie banko (by the bank). Tiesiai means straight ahead, į kairę means to the left, and į dešinę means to the right.",
        `
tiesiai|straight ahead|vocabulary
į kairę|to the left|phrases
į dešinę|to the right|phrases
Prie banko|By the bank|genitive|Prie ___
Prie stoties|By the station|genitive|Prie ___
`,
      ),
      lesson(
        "A time to meet",
        "For “on” a day, use accusative: pirmadienis → pirmadienį (on Monday). At a time: pirmą valandą (at one o’clock), antrą valandą (at two). Kada? means “when?”; kelintą valandą? asks “at what time?”",
        `
pirmadienį|on Monday|accusative
penktadienį|on Friday|accusative
Antrą valandą|At two o’clock|numbers
Kelintą valandą?|At what time?|phrases
Susitinkame rytoj|We are meeting tomorrow|present|Susitinkame ___
`,
      ),
      lesson(
        "Getting there",
        "Use instrumental for transport, without a preposition: autobusu (by bus), traukiniu (by train), taksi (by taxi; unchanged). Važiuoti means to go by vehicle.",
        `
Aš važiuoju autobusu|I travel by bus|instrumental|Aš važiuoju ___
Ji važiuoja traukiniu|She travels by train|instrumental|Ji važiuoja ___
Mes važiuojame taksi|We travel by taxi|present|Mes ___ taksi
stotelė|bus stop|vocabulary
bilietas|ticket|vocabulary
`,
      ),
    ],
  },
  {
    title: "A place to call home",
    lt: "Kelintame aukšte gyveni?",
    subtitle: "Talk about your home and settle in.",
    pages: "87–108",
    icon: "House",
    lessons: [
      lesson(
        "Make yourself at home",
        "Nouns for rooms use locative to say where: kambarys → kambaryje, virtuvė → virtuvėje. Ant (on), prie (near), tarp (between), and vidury (in the middle of) take genitive.",
        `
kambarys|room|vocabulary
virtuvė|kitchen|vocabulary
Ant stalo|On the table|genitive|Ant ___
Prie lango|By the window|genitive|Prie ___
Virtuvėje|In the kitchen|locative
Tarp namų|Between the houses|genitive|Tarp ___
`,
      ),
      lesson(
        "Which floor?",
        "Ordinal numbers agree with aukštas (floor). In a location, both become locative: pirmas aukštas → pirmame aukšte, antras → antrame, trečias → trečiame.",
        `
Pirmame aukšte|On the first floor|locative|___ aukšte
Antrame aukšte|On the second floor|locative|___ aukšte
Trečiame aukšte|On the third floor|locative|___ aukšte
Didelis butas|A large apartment|adjectives|___ butas
Maža virtuvė|A small kitchen|adjectives|___ virtuvė
`,
      ),
      lesson(
        "What is in the room?",
        "Nėra (there is no / are no) takes genitive, as do daug (a lot) and mažai (few / little). Numbers agree in gender: du kambariai, dvi kėdės.",
        `
Nėra stalo|There is no table|genitive|Nėra ___
Daug langų|Many windows|genitive|Daug ___
Mažai kėdžių|Few chairs|genitive|Mažai ___
Du kambariai|Two rooms|numbers|___ kambariai
Dvi kėdės|Two chairs|numbers|___ kėdės
`,
      ),
      lesson(
        "A little help at home",
        "Galiu (I can), reikia (it is necessary), and turiu (I must / have to) are followed by an infinitive. Galite is polite or plural “you can”.",
        `
Galite atidaryti langą?|Can you open the window (formal)?|phrases|Galite ___ langą?
Reikia pagalbos|Help is needed|genitive|Reikia ___
Aš noriu išsinuomoti butą|I want to rent an apartment|phrases
Galiu padėti|I can help|present|___ padėti
Turiu tvarkyti kambarį|I have to tidy the room|accusative|Turiu tvarkyti ___
`,
      ),
    ],
  },
  {
    title: "Your free time",
    lt: "Einame į koncertą!",
    subtitle: "Make plans, share hobbies, and take a trip.",
    pages: "109–132",
    icon: "Ticket",
    lessons: [
      lesson(
        "Things you love doing",
        "Mėgti (to like) and mokėti (to know how) can take an infinitive. Man patinka skaityti literally means “reading is pleasing to me”. Noun dative: draugas → draugui, sesuo → seseriai.",
        `
Man patinka skaityti|I like reading|dative|___ patinka skaityti
Aš mėgstu keliauti|I like travelling|present|Aš ___ keliauti
Aš moku plaukti|I know how to swim|present|Aš ___ plaukti
Draugui patinka muzika|A friend (male) likes music|dative|___ patinka muzika
Seseriai patinka teatras|My sister likes theatre|dative|___ patinka teatras
`,
      ),
      lesson(
        "Making plans",
        "A positive object uses accusative; a negated object uses genitive: mėgstu muziką → nemėgstu muzikos. Per + accusative can mean “during”: per atostogas (during the holidays).",
        `
Aš mėgstu muziką|I like music|accusative|Aš mėgstu ___
Aš nemėgstu muzikos|I do not like music|genitive|Aš nemėgstu ___
Per atostogas|During the holidays|accusative|Per ___
Einame į koncertą|We are going to a concert|accusative|Einame į ___
Geros kelionės!|Have a good trip!|phrases
`,
      ),
      lesson(
        "What did you do?",
        "The simple past has -o and -ė types. Būti → buvau (I was), buvai (you were), buvo (was / were). Skaityti → skaičiau (I read); keliauti → keliavau (I travelled).",
        `
Vakar buvau namie|Yesterday I was at home|past|Vakar ___ namie
Ji buvo kine|She was at the cinema|past|Ji ___ kine
Aš skaičiau knygą|I read a book (past)|past|Aš ___ knygą
Mes keliavome|We travelled|past|Mes ___
Tu buvai teatre|You were at the theatre (informal)|past|Tu ___ teatre
`,
      ),
      lesson(
        "Your next adventure",
        "The future usually builds on the infinitive stem with -s-: dirbti → dirbsiu, dirbsi, dirbs. Eiti → eisiu; būti → būsiu; keliauti → keliausiu.",
        `
Rytoj eisiu į kiną|Tomorrow I will go to the cinema|future|Rytoj ___ į kiną
Aš keliausiu|I will travel|future|Aš ___
Ji bus namie|She will be at home|future|Ji ___ namie
Mes važiuosime autobusu|We will travel by bus|future|Mes ___ autobusu
Tu dirbsi rytoj|You will work tomorrow (informal)|future|Tu ___ rytoj
`,
      ),
    ],
  },
  {
    title: "Work & study",
    lt: "Ar tu studijuoji, ar dirbi?",
    subtitle: "Your studies, working day, and important dates.",
    pages: "133–152",
    icon: "GraduationCap",
    lessons: [
      lesson(
        "What do you do?",
        "Studijuoti takes an accusative object: studijuoju mediciną. Professions are nouns with gender: gydytojas / gydytoja (doctor), mokytojas / mokytoja (teacher).",
        `
Aš studijuoju mediciną|I study medicine|accusative|Aš studijuoju ___
Ji studijuoja ekonomiką|She studies economics|accusative|Ji studijuoja ___
Jis yra gydytojas|He is a doctor|vocabulary
Ji yra mokytoja|She is a teacher|vocabulary
Aš dirbu biure|I work in an office|locative|Aš dirbu ___
`,
      ),
      lesson(
        "Your working day",
        "Nuo (from) and iki (until) take genitive. Po (after) takes genitive in time expressions. Prieš (before) and per (during) take accusative.",
        `
Nuo ryto|From the morning|genitive|Nuo ___
Iki vakaro|Until the evening|genitive|Iki ___
Po darbo|After work|genitive|Po ___
Prieš paskaitą|Before the lecture|accusative|Prieš ___
Per pertrauką|During the break|accusative|Per ___
`,
      ),
      lesson(
        "Months of the year",
        "Most month names are masculine; liepa and gegužė are feminine. For a date, the month is genitive: sausis → sausio. To say “in January”, use sausį (accusative).",
        `
sausis|January|vocabulary
vasaris|February|vocabulary
kovas|March|vocabulary
rugsėjis|September|vocabulary
liepa|July|vocabulary
gruodis|December|vocabulary
`,
      ),
      lesson(
        "Save the date",
        "Diena (day) is feminine, so dates use feminine ordinals: pirma diena. To say when an event occurs, use accusative: gegužės pirmą dieną (on May first). Šiandien yra gegužės pirma diena states today’s date.",
        `
Gegužės pirmą dieną|On May first|accusative|Gegužės ___ dieną
Kovo antrą dieną|On March second|accusative|Kovo ___ dieną
Birželio trečią dieną|On June third|accusative|Birželio ___ dieną
Kada tavo gimtadienis?|When is your birthday (informal)?|phrases
Šiandien yra rugsėjo pirma diena|Today is September first|numbers|Šiandien yra rugsėjo ___ diena
`,
      ),
    ],
  },
  {
    title: "The people you love",
    lt: "Ar tavo šeima didelė?",
    subtitle: "Get to know family, friends, and their stories.",
    pages: "153–176",
    icon: "Users",
    lessons: [
      lesson(
        "Meet the family",
        "Turėti (to have) takes accusative: turiu brolį. Neturėti (not to have) takes genitive: neturiu brolio. Possession also uses genitive: mamos vardas (mother’s name).",
        `
mama|mother|vocabulary
tėtis|father|vocabulary
Aš turiu brolį|I have a brother|accusative|Aš turiu ___
Aš neturiu sesers|I do not have a sister|genitive|Aš neturiu ___
Mamos vardas|Mother’s name|genitive|___ vardas
`,
      ),
      lesson(
        "How old are you?",
        "Age uses dative for the person: man (to me), jam (to him), jai (to her). Metai is plural-only, so use special plural numerals: dveji metai, treji metai. With tens: dvidešimt metų.",
        `
Man dvidešimt metų|I am twenty years old|dative|___ dvidešimt metų
Jam dveji metai|He is two years old|numbers|Jam ___ metai
Jai treji metai|She is three years old|numbers|Jai ___ metai
Kiek tau metų?|How old are you (informal)?|dative|Kiek ___ metų?
Broliui patinka sportas|My brother likes sport|dative|___ patinka sportas
`,
      ),
      lesson(
        "What are they like?",
        "Adjectives agree with gender: aukštas / aukšta (tall), jaunas / jauna (young). Plural forms include aukšti (masculine) and aukštos (feminine).",
        `
Mano brolis aukštas|My brother is tall|adjectives|Mano brolis ___
Mano sesuo aukšta|My sister is tall|adjectives|Mano sesuo ___
Ji yra jauna|She is young|adjectives|Ji yra ___
Jis yra linksmas|He is cheerful|adjectives|Jis yra ___
Aš myliu savo šeimą|I love my family|accusative|Aš myliu savo ___
`,
      ),
      lesson(
        "Making comparisons",
        "Comparatives often end in -esnis / -esnė: jaunesnis (younger), vyresnė (older). Use už + accusative or nei + nominative for “than”. Superlatives end in -iausias / -iausia.",
        `
Brolis jaunesnis už seserį|The brother is younger than the sister|accusative|Brolis jaunesnis už ___
Sesuo vyresnė nei brolis|The sister is older than the brother|adjectives|Sesuo ___ nei brolis
aukštesnis|taller (masculine)|adjectives
jauniausia|youngest (feminine)|adjectives
Mano šeima didelė|My family is large|adjectives|Mano šeima ___
`,
      ),
    ],
  },
  {
    title: "Whatever the weather",
    lt: "Ar jums nešalta?",
    subtitle: "Talk weather, colours, and your next favourite sweater.",
    pages: "177–194",
    icon: "CloudSun",
    lessons: [
      lesson(
        "Rain or shine",
        "Weather often uses a neuter adjective: šalta (cold), šilta (warm), gražu (beautiful). A feeling uses dative: man šalta (I feel cold). Lyja means “it is raining”; sninga means “it is snowing”.",
        `
Šiandien šalta|It is cold today|adjectives|Šiandien ___
Lauke šilta|It is warm outside|adjectives|Lauke ___
Lyja|It is raining|vocabulary
Sninga|It is snowing|vocabulary
Man šalta|I feel cold|dative|___ šalta
`,
      ),
      lesson(
        "In your wardrobe",
        "Some clothing words are plural: batai (shoes), kelnės (trousers). For a direct object use accusative plural: batus, kelnes. Reikia (need) takes genitive: batų, kelnių.",
        `
megztinis|sweater|vocabulary
suknelė|dress|vocabulary
Aš perku batus|I am buying shoes|accusative|Aš perku ___
Man reikia kelnių|I need trousers|genitive|Man reikia ___
Man reikia batų|I need shoes|genitive|Man reikia ___
`,
      ),
      lesson(
        "Find your colour",
        "Colours agree with the noun. Šitas / šita means “this” (masculine / feminine); šitie / šitos means “these”. Plural colour forms include mėlyni (masculine) and mėlynos (feminine).",
        `
Šitas megztinis|This sweater|pronouns|___ megztinis
Šita suknelė|This dress|pronouns|___ suknelė
Šitie batai|These shoes|pronouns|___ batai
Šitos kelnės|These trousers|pronouns|___ kelnės
Mėlyni batai|Blue shoes|adjectives|___ batai
Raudona suknelė|A red dress|adjectives|___ suknelė
`,
      ),
      lesson(
        "Trying things on",
        "Pasimatuoti means “to try on”. Tinka means “fits / suits” and uses a dative person. Dydis means size; kaina means price.",
        `
Ar galiu pasimatuoti?|Can I try it on?|phrases
Man tinka|It fits me|dative|___ tinka
Per mažas|Too small (masculine)|adjectives
Per didelė|Too big (feminine)|adjectives
Koks jūsų dydis?|What is your size (formal)?|phrases
`,
      ),
    ],
  },
  {
    title: "Feeling well",
    lt: "Kaip jautiesi?",
    subtitle: "Describe how you feel and ask for help.",
    pages: "195–210",
    icon: "HeartPulse",
    lessons: [
      lesson(
        "How do you feel?",
        "Jaustis is reflexive: jaučiuosi (I feel), jautiesi (you feel), jaučiasi (he / she feels). In the past: jaučiausi, jauteisi, jautėsi. Gerai means well; blogai means badly.",
        `
Aš jaučiuosi gerai|I feel well|present|Aš ___ gerai
Kaip jautiesi?|How do you feel (informal)?|present|Kaip ___?
Ji jaučiasi blogai|She feels unwell|present|Ji ___ blogai
Vakar jaučiausi blogai|Yesterday I felt unwell|past|Vakar ___ blogai
Aš sergu|I am ill|present|Aš ___
`,
      ),
      lesson(
        "What hurts?",
        "Skaudėti uses a dative person and an accusative body part: man skauda galvą (my head hurts). This is a language lesson; the phrases describe symptoms.",
        `
galva|head|vocabulary
gerklė|throat|vocabulary
Man skauda galvą|My head hurts|accusative|Man skauda ___
Man skauda gerklę|My throat hurts|accusative|Man skauda ___
Man skauda dantį|My tooth hurts|accusative|Man skauda ___
`,
      ),
      lesson(
        "At the pharmacy",
        "The imperative gives requests or instructions. Often replace -ti with -k for informal singular, and add -ite for polite / plural: gerti → gerk / gerkite. Ilsėtis → ilsėkitės (polite, reflexive).",
        `
vaistinė|pharmacy|vocabulary
vaistai|medicine|vocabulary
Gerkite vandenį|Drink water (formal)|imperative|___ vandenį
Ilsėkitės|Rest (formal)|imperative
Man reikia gydytojo|I need a doctor|genitive|Man reikia ___
`,
      ),
      lesson(
        "On the mend",
        "Geriau is the comparative of gerai (well): “better”. Blogiau means “worse”. Nes means because; bet means but. Sveik is an informal wish to get well.",
        `
Jaučiuosi geriau|I feel better|adjectives|Jaučiuosi ___
Jaučiuosi blogiau|I feel worse|adjectives|Jaučiuosi ___
Aš ilsiuosi, nes sergu|I am resting because I am ill|phrases|Aš ilsiuosi, ___ sergu
Greitai pasveik!|Get well soon (informal)!|phrases
Aš sergu, bet dirbu|I am ill, but I am working|phrases|Aš sergu, ___ dirbu
`,
      ),
    ],
  },
  {
    title: "Let’s celebrate",
    lt: "Linksmų švenčių!",
    subtitle: "Give wishes, welcome guests, and celebrate together.",
    pages: "211–234",
    icon: "PartyPopper",
    lessons: [
      lesson(
        "A reason to celebrate",
        "Holiday names are often plural: Kalėdos (Christmas), Velykos (Easter). With per (during), use accusative: per Kalėdas. Wish phrases often use genitive: linksmų švenčių.",
        `
Kalėdos|Christmas|vocabulary
Velykos|Easter|vocabulary
Per Kalėdas|At Christmas|accusative|Per ___
Linksmų švenčių!|Happy holidays!|genitive|Linksmų ___
Laimingų Naujųjų metų!|Happy New Year!|genitive
`,
      ),
      lesson(
        "Happy birthday!",
        "Sveikinti (to congratulate) takes an accusative person, then su + instrumental for the occasion. Linkėti (to wish) uses dative for the person and genitive for the wish.",
        `
Su gimtadieniu!|Happy birthday!|instrumental|Su ___
Sveikinu tave|I congratulate you (informal)|pronouns|Sveikinu ___
Linkiu tau laimės|I wish you happiness (informal)|genitive|Linkiu tau ___
Linkiu jums sveikatos|I wish you health (formal)|genitive|Linkiu jums ___
dovana|gift|vocabulary
`,
      ),
      lesson(
        "Come and join us",
        "Use vocative when addressing someone directly: Jonas → Jonai, draugas → drauge, mama → mama. Kviečiu (I invite) takes accusative; į + accusative says where.",
        `
Labas, Jonai!|Hello, Jonas!|vocative|Labas, ___!
Ačiū, drauge!|Thank you, friend (male)!|vocative|Ačiū, ___!
Kviečiu jus į svečius|I invite you over (formal)|pronouns|Kviečiu ___ į svečius
Prašom paragauti|Please have a taste|phrases
Skanus tortas|A delicious cake|adjectives|___ tortas
`,
      ),
      lesson(
        "Good times together",
        "Bring the course together: past and future, genitive wishes, and instrumental after su. Lithuanian word order is flexible; sentence-building exercises show one natural ordering.",
        `
Mes šventėme gimtadienį|We celebrated a birthday|past|Mes ___ gimtadienį
Švęsime su draugais|We will celebrate with friends|instrumental|Švęsime su ___
Ačiū už dovaną|Thank you for the gift|accusative|Ačiū už ___
Iki kitų metų!|See you next year!|genitive|Iki kitų ___!
Buvo labai smagu|It was great fun|past|___ labai smagu
`,
      ),
    ],
  },
];
// Preserve all original class/item IDs while expanding and reordering the course.
const classOrders = [
  [1, 5, 2, 3, 4, 6, 7],
  [1, 5, 6, 7, 2, 3, 8, 4],
  [5, 1, 2, 6, 3, 4, 7],
  [5, 1, 2, 3, 4, 6],
  [5, 1, 2, 6, 3, 4, 7],
  [1, 2, 3, 5, 4, 6],
  [5, 1, 2, 3, 4, 6],
  [1, 5, 2, 3, 4, 6],
  [1, 5, 2, 3, 4, 6],
  [1, 2, 5, 3, 4, 6],
];
chapters.forEach((chapter, ci) => {
  chapter.lessons.forEach((l, li) => {
    l.key = `c${ci + 1}l${li + 1}`;
    l.kind =
      l.items.filter((i) => i.skill === "vocabulary").length >= 3
        ? "vocabulary"
        : l.items.filter((i) => i.cloze?.includes("___")).length >= 2
          ? "pattern"
          : "conversation";
    l.items = l.items.map((i, n) => ({
      ...i,
      key: `${l.key}i${n}`,
      role: "core",
    }));
    l.items.push(
      ...contexts[ci * 4 + li].flatMap((row, n) =>
        lesson("", "", row).items.map((i) => ({
          ...i,
          key: `${l.key}x${n}`,
          role: "context",
        })),
      ),
    );
  });
  additions[ci].forEach(([title, kind, rule, rows], n) => {
    const l = lesson(title, rule, rows);
    l.key = `c${ci + 1}l${n + 5}`;
    l.kind = kind;
    l.items = l.items.map((i, j) => ({
      ...i,
      key: `${l.key}i${j}`,
      role: "core",
    }));
    chapter.lessons.push(l);
  });
  chapter.lessons.sort(
    (a, b) =>
      classOrders[ci].indexOf(Number(a.key.split("l")[1])) -
      classOrders[ci].indexOf(Number(b.key.split("l")[1])),
  );
});
// Separate unrelated loads in two of the original broad classes.
for (const [ci, from, to, ids] of [
  [0, "c1l4", "c1l6", ["c1l4i4", "c1l4i5"]],
  [1, "c2l1", "c2l7", ["c2l1i4", "c2l1i5"]],
]) {
  const source = chapters[ci].lessons.find((l) => l.key === from),
    target = chapters[ci].lessons.find((l) => l.key === to);
  const moved = source.items
    .filter((i) => ids.includes(i.key))
    .map((i) => ({ ...i, role: "context", sourceLesson: from }));
  source.items = source.items.filter((i) => !ids.includes(i.key));
  target.items.push(...moved);
}
const firstFood = chapters[1].lessons.find((l) => l.key === "c2l1");
firstFood.kind = "vocabulary";
firstFood.rule =
  "Learn a small set of foods, then recognize them in a simple sentence. Duona is bread; sūris is cheese. Obuoliai and bandelės are plural: apples and buns. Preferences have their own class later.";
expandCurriculum(chapters);
export const skills = {
  nominative: "Nominative",
  reading: "Reading & situations",
  writing: "Writing workshops",
  vocabulary: "Vocabulary",
  phrases: "Everyday phrases",
  genitive: "Genitive",
  locative: "Locative",
  accusative: "Accusative",
  dative: "Dative",
  instrumental: "Instrumental",
  vocative: "Vocative",
  present: "Present tense",
  past: "Past tense",
  future: "Future tense",
  imperative: "Imperative",
  adjectives: "Adjectives",
  pronouns: "Pronouns",
  numbers: "Numbers",
  plural: "Plurals",
};
export const lessons = chapters.flatMap((chapter, ci) =>
  chapter.lessons.map((l, li) => ({
    ...l,
    id: l.key,
    chapter: ci,
    position: li,
    items: l.items.map((x, i) => ({
      ...x,
      id: x.key,
      teachingKind: l.kind,
      chapter: ci,
      lesson: l.key,
    })),
  })),
);
export const items = lessons.flatMap((l) => l.items);

export const phaseNames = {
  writing: "Write and review",
  discover: "Meet & use",
  guided: "Build with support",
  recall: "Recall & contrast",
  apply: "Use it in context",
  checkpoint: "Chapter check",
};
function stepsFor(l) {
  const core = l.items.filter((i) => i.role === "core"),
    context = l.items.filter((i) => i.role === "context" && !i.extension),
    extended = l.items.filter((i) => i.extension);
  const chunk = (xs, n) =>
    Array.from({ length: Math.ceil(xs.length / n) }, (_, i) =>
      xs.slice(i * n, (i + 1) * n),
    );
  const make = (phase, group, n = 0) => ({
    id: `${l.id}-${phase}-${n}`,
    classId: l.id,
    chapter: l.chapter,
    phase,
    title: phaseNames[phase],
    items: group,
  });
  if (l.kind === "writing")
    return {
      discover: [make("writing", core)],
      guided: [],
      recall: [],
      apply: [],
    };
  return {
    discover: chunk(core, 3).map((g, n) => make("discover", g, n)),
    guided: chunk(core, 6).map((g, n) => make("guided", g, n)),
    recall: chunk(core, 6).map((g, n) => make("recall", g, n)),
    apply: [
      make("apply", context.length ? [...context, ...core.slice(-3)] : core),
      ...(extended.length ? [make("apply", extended, 1)] : []),
    ],
  };
}
export const courseSteps = chapters.flatMap((ch, ci) => {
  const cls = lessons.filter((l) => l.chapter === ci && !l.optional),
    groups = cls.map(stepsFor),
    path = [];
  groups.forEach((g, n) => {
    path.push(...g.discover, ...g.guided);
    if (n > 0) path.push(...groups[n - 1].recall);
    if (n > 1) path.push(...groups[n - 2].apply);
  });
  path.push(
    ...groups.at(-1).recall,
    ...groups.at(-2).apply,
    ...groups.at(-1).apply,
  );
  // Small checks cover every class without one enormous end-of-chapter session.
  const assessedClasses = cls.filter((l) => l.kind !== "writing");
  const checkGroups = Array.from(
    { length: Math.ceil(assessedClasses.length / 4) },
    (_, n) => assessedClasses.slice(n * 4, n * 4 + 4),
  );
  checkGroups.forEach((group, n) =>
    path.push({
      id: `chapter-${ci + 1}-checkpoint-v2-part-${n + 1}`,
      classId: `c${ci + 1}l${[7, 4, 7, 6, 7, 6, 6, 6, 6, 6][ci]}`,
      chapter: ci,
      phase: "checkpoint",
      title: `Chapter check ${n + 1} of ${checkGroups.length}`,
      items: group.flatMap((l) => l.items),
    }),
  );
  return path;
});
export const extraSteps = lessons
  .filter((l) => l.optional)
  .flatMap((l) => {
    const g = stepsFor(l);
    return [...g.discover, ...g.guided, ...g.recall, ...g.apply].map((s) => ({
      ...s,
      optional: true,
    }));
  });
const classStepMap = new Map(
  lessons.map((l) => [
    l.id,
    [...courseSteps, ...extraSteps].filter(
      (s) => s.classId === l.id && s.phase !== "checkpoint",
    ),
  ]),
);
export const classSteps = (id) => classStepMap.get(id) || [];

// Historical checkpoint events remain readable; they do not award the expanded checks.
export const legacyCheckpoints = chapters.map((_, ci) => ({
  id: `chapter-${ci + 1}-checkpoint`,
  chapter: ci,
  classId: `c${ci + 1}l${[7, 4, 7, 6, 7, 6, 6, 6, 6, 6][ci]}`,
  items: items.filter(
    (i) => i.chapter === ci && /^c\d+l\d+[ix]\d+$/.test(i.id),
  ),
}));
