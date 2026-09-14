export const countries = `Belgija|Belgium|Briuselis|Brussels|prancūziškai|French
Čekija|Czechia|Praha|Prague|čekiškai|Czech
Danija|Denmark|Kopenhaga|Copenhagen|daniškai|Danish
Estija|Estonia|Talinas|Tallinn|estiškai|Estonian
Ispanija|Spain|Madridas|Madrid|ispaniškai|Spanish
Italija|Italy|Roma|Rome|itališkai|Italian
Jungtinė Karalystė|United Kingdom|Londonas|London|angliškai|English
Latvija|Latvia|Ryga|Riga|latviškai|Latvian
Lenkija|Poland|Varšuva|Warsaw|lenkiškai|Polish
Lietuva|Lithuania|Vilnius|Vilnius|lietuviškai|Lithuanian
Portugalija|Portugal|Lisabona|Lisbon|portugališkai|Portuguese
Prancūzija|France|Paryžius|Paris|prancūziškai|French
Rusija|Russia|Maskva|Moscow|rusiškai|Russian
Suomija|Finland|Helsinkis|Helsinki|suomiškai|Finnish
Švedija|Sweden|Stokholmas|Stockholm|švediškai|Swedish
Vengrija|Hungary|Budapeštas|Budapest|vengriškai|Hungarian
Vokietija|Germany|Berlynas|Berlin|vokiškai|German
Airija|Ireland|Dublinas|Dublin|airiškai|Irish
Austrija|Austria|Viena|Vienna|vokiškai|German
Baltarusija|Belarus|Minskas|Minsk|baltarusiškai|Belarusian
Brazilija|Brazil|Brazilija|Brasília|portugališkai|Portuguese
Bulgarija|Bulgaria|Sofija|Sofia|bulgariškai|Bulgarian
Graikija|Greece|Atėnai|Athens|graikiškai|Greek
Sakartvelas|Georgia (country)|Tbilisis|Tbilisi|kartveliškai|Georgian
Islandija|Iceland|Reikjavikas|Reykjavík|islandiškai|Icelandic
Japonija|Japan|Tokijas|Tokyo|japoniškai|Japanese
Jungtinės Amerikos Valstijos|United States|Vašingtonas|Washington|angliškai|English
Kanada|Canada|Otava|Ottawa|angliškai|English
Kipras|Cyprus|Nikosija|Nicosia|turkiškai|Turkish
Kinija|China|Pekinas|Beijing|kiniškai|Chinese
Korėja|Korea|Seulas|Seoul|korėjietiškai|Korean
Kroatija|Croatia|Zagrebas|Zagreb|kroatiškai|Croatian
Liuksemburgas|Luxembourg|Liuksemburgas|Luxembourg City|liuksemburgietiškai|Luxembourgish
Malta|Malta|Valeta|Valletta|maltietiškai|Maltese
Nyderlandai|Netherlands|Amsterdamas|Amsterdam|olandiškai|Dutch
Norvegija|Norway|Oslas|Oslo|norvegiškai|Norwegian
Rumunija|Romania|Bukareštas|Bucharest|rumuniškai|Romanian
Slovakija|Slovakia|Bratislava|Bratislava|slovakiškai|Slovak
Slovėnija|Slovenia|Liubliana|Ljubljana|slovėniškai|Slovenian
Turkija|Turkey|Ankara|Ankara|turkiškai|Turkish
Ukraina|Ukraine|Kijevas|Kyiv|ukrainietiškai|Ukrainian`
  .split("\n")
  .map((x) => x.split("|"));
export const cardinal = [
  "nulis",
  "vienas",
  "du",
  "trys",
  "keturi",
  "penki",
  "šeši",
  "septyni",
  "aštuoni",
  "devyni",
  "dešimt",
  "vienuolika",
  "dvylika",
  "trylika",
  "keturiolika",
  "penkiolika",
  "šešiolika",
  "septyniolika",
  "aštuoniolika",
  "devyniolika",
];
export const tens = [
  "",
  "",
  "dvidešimt",
  "trisdešimt",
  "keturiasdešimt",
  "penkiasdešimt",
  "šešiasdešimt",
  "septyniasdešimt",
  "aštuoniasdešimt",
  "devyniasdešimt",
];
export const ordinal = [
  "",
  "pirmas",
  "antras",
  "trečias",
  "ketvirtas",
  "penktas",
  "šeštas",
  "septintas",
  "aštuntas",
  "devintas",
  "dešimtas",
  "vienuoliktas",
  "dvyliktas",
  "tryliktas",
  "keturioliktas",
  "penkioliktas",
  "šešioliktas",
  "septynioliktas",
  "aštuonioliktas",
  "devynioliktas",
  "dvidešimtas",
];
const card = (n) =>
  n < 20
    ? cardinal[n]
    : tens[Math.floor(n / 10)] + (n % 10 ? " " + cardinal[n % 10] : "");
const ord = (n) =>
  n <= 20
    ? ordinal[n]
    : n === 30
      ? "trisdešimtas"
      : tens[Math.floor(n / 10)] + " " + ordinal[n % 10];
const row = (lt, en, skill = "numbers", cloze = "") =>
  [lt, en, skill, cloze].join("|");
const list = (rows) => rows.join("\n");
const range = (a, b) => Array.from({ length: b - a + 1 }, (_, n) => n + a);
export const numberClasses = [
  [
    2,
    "teens",
    "Eleven to nineteen",
    "33",
    "Teens end in -lika. Nouns after 11–19 use genitive plural: vienuolika eurų. Learn these before combining prices.",
    list(range(11, 19).map((n) => row(card(n), String(n)))),
    list([
      row("Vienuolika eurų", "Eleven euros"),
      row("Devyniolika centų", "Nineteen cents"),
    ]),
  ],
  [
    2,
    "tens",
    "Tens and a hundred",
    "33",
    "Tens end in -dešimt. After a round ten, use eurų or centų. Compound numbers combine the ten and the unit.",
    list(
      range(2, 9)
        .map((n) => row(tens[n], String(n * 10)))
        .concat([row("šimtas", "100")]),
    ),
    list([
      row("Keturiasdešimt eurų", "Forty euros"),
      row("Penkiasdešimt centų", "Fifty cents"),
    ]),
  ],
  [
    2,
    "compound-prices",
    "Read a price in euros and cents",
    "33, 57–58",
    "The last number controls euras/eurai/eurų: 21 euras, 22 eurai, 20 eurų, 11 eurų. Cents follow the same pattern. These amounts are exercise examples.",
    list(
      [21, 22, 32, 46, 54, 63, 75, 89, 98].map((n) => row(card(n), String(n))),
    ),
    list([
      row("Du eurai penkiasdešimt centų", "Two euros and fifty cents"),
      row(
        "Vienas euras dvidešimt vienas centas",
        "One euro and twenty-one cents",
      ),
      row("Dvylika eurų", "Twelve euros"),
    ]),
  ],
  [
    3,
    "ordinals-early",
    "First to tenth",
    "65",
    "An ordinal identifies order or a route number. Masculine -as becomes feminine -a: pirmas autobusas, pirma valanda. Trečias becomes trečia.",
    list(range(1, 10).map((n) => row(ord(n), `Ordinal ${n} (masculine)`))),
    list([
      row("Penktas autobusas", "The fifth bus"),
      row("Aštuntas troleibusas", "The eighth trolleybus"),
    ]),
  ],
  [
    3,
    "ordinals-later",
    "Later numbers in an order",
    "65",
    "For compound ordinals, only the final word changes: dvidešimt antras. Use these for route numbers and, later, dates.",
    list(
      range(11, 20)
        .concat([22, 31])
        .map((n) => row(ord(n), `Ordinal ${n} (masculine)`)),
    ),
    list([
      row("Dvyliktas autobusas", "The twelfth bus"),
      row("Dvidešimt antras troleibusas", "The twenty-second trolleybus"),
    ]),
  ],
  [
    3,
    "clock-hours",
    "At an hour",
    "69",
    "For at a time, use the feminine ordinal in accusative: pirmą, antrą, trečią. A twelve-hour expression can describe morning or evening; add ryto/dienos/vakaro/nakties when needed.",
    list(
      range(1, 12).map((n) =>
        row(ord(n).slice(0, -2) + "ą valandą", `At ${n} o’clock`),
      ),
    ),
    list([
      row("Šeštą valandą ryto", "At six in the morning"),
      row("Šeštą valandą vakaro", "At six in the evening"),
    ]),
  ],
  [
    3,
    "half-hours",
    "Halfway to the next hour",
    "69",
    "Pusę uses the NEXT hour in genitive: pusę trečios is half past two. Compare 2:00 antrą valandą and 2:30 pusę trečios.",
    list(
      range(1, 12).map((n) =>
        row(
          "Pusę " + ord(n).slice(0, -2) + "os",
          `At ${n === 1 ? 12 : n - 1}:30`,
        ),
      ),
    ),
    list([
      row("Susitinkame pusę septintos", "We are meeting at 6:30"),
      row("Pusę trečios dienos", "At 2:30 in the afternoon"),
    ]),
  ],
  [
    4,
    "count-gender",
    "Count masculine and feminine objects",
    "91",
    "One and 2–9 agree in gender; trys is shared. Ten and teens use genitive plural. Contrast penki stalai and penkios kėdės.",
    list(
      [
        "viena",
        "dvi",
        "trys",
        "keturios",
        "penkios",
        "šešios",
        "septynios",
        "aštuonios",
        "devynios",
      ].map((x, n) => row(x, `${n + 1} (feminine)`)),
    ),
    list([
      row("Penkios kėdės", "Five chairs"),
      row("Penki stalai", "Five tables"),
      row("Dešimt kėdžių", "Ten chairs"),
    ]),
  ],
  [
    4,
    "floors",
    "Floors beyond the third",
    "92",
    "For a floor location, both words are locative: penktame aukšte. Trečias has trečiame. These forms also help with university years.",
    list(
      range(4, 12).map((n) =>
        row(ord(n).slice(0, -2) + "ame aukšte", `On floor ${n}`, "locative"),
      ),
    ),
    list([
      row(
        "Liftas yra dešimtame aukšte",
        "The lift is on the tenth floor",
        "locative",
        "Liftas yra ___ aukšte",
      ),
      row(
        "Gyvenu septintame aukšte",
        "I live on the seventh floor",
        "locative",
        "Gyvenu ___ aukšte",
      ),
    ]),
  ],
  [
    6,
    "date-ordinals",
    "Dates beyond the third",
    "135–138",
    "Diena is feminine. To state a date, use the feminine nominative ordinal. To say on a date, use its accusative form. In compounds, change only the last word.",
    list(
      range(4, 20)
        .concat([21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31])
        .map((n) =>
          row(ord(n).slice(0, -2) + "a diena", `Day ${n} (naming a date)`),
        ),
    ),
    list([
      row(
        "Kovo vienuoliktą dieną",
        "On March eleventh",
        "accusative",
        "Kovo ___ dieną",
      ),
      row(
        "Gruodžio trisdešimt pirmą dieną",
        "On December thirty-first",
        "accusative",
        "Gruodžio ___ dieną",
      ),
    ]),
  ],
  [
    6,
    "month-forms",
    "Months in dates and plans",
    "135–138",
    "A month in a date is genitive. In a month uses accusative. Most names are masculine, but liepa and gegužė are feminine. Learn sausio/sausį and gegužės/gegužę as separate uses.",
    list(
      [
        ["sausio", "sausį", "January"],
        ["vasario", "vasarį", "February"],
        ["kovo", "kovą", "March"],
        ["balandžio", "balandį", "April"],
        ["gegužės", "gegužę", "May"],
        ["birželio", "birželį", "June"],
        ["liepos", "liepą", "July"],
        ["rugpjūčio", "rugpjūtį", "August"],
        ["rugsėjo", "rugsėjį", "September"],
        ["spalio", "spalį", "October"],
        ["lapkričio", "lapkritį", "November"],
        ["gruodžio", "gruodį", "December"],
      ].flatMap(([g, a, en]) => [
        row(g, `${en} (genitive, in a date)`, "genitive"),
        row(a, `In ${en}`, "accusative"),
      ]),
    ),
    list([
      row(
        "Gimtadienis gegužę",
        "A birthday in May",
        "accusative",
        "Gimtadienis ___",
      ),
      row(
        "Rugpjūčio dvidešimt antrą dieną",
        "On August twenty-second",
        "accusative",
        "Rugpjūčio ___ dieną",
      ),
    ]),
  ],
  [
    7,
    "plural-age",
    "Age with plural numerals",
    "157, 253",
    "Metai is plural-only. Use special plural numerals for units: vieneri, dveji, treji, ketveri ... devyneri. Teens and round tens take metų; compounds follow their final unit.",
    list(
      [
        "vieneri",
        "dveji",
        "treji",
        "ketveri",
        "penkeri",
        "šešeri",
        "septyneri",
        "aštuoneri",
        "devyneri",
      ].map((x, n) =>
        row(x + " metai", `${n + 1} year${n ? "s" : ""} (with metai)`),
      ),
    ),
    list([
      row("Man dvidešimt treji metai", "I am twenty-three years old"),
      row("Jam vienuolika metų", "He is eleven years old"),
      row("Jai keturiasdešimt metų", "She is forty years old"),
    ]),
  ],
  [
    7,
    "larger-numbers",
    "Hundreds and thousands",
    "253",
    "Šimtas and tūkstantis are nouns: du šimtai, trys tūkstančiai. They take a genitive complement when naming a quantity.",
    list([
      row("du šimtai", "200"),
      row("trys šimtai", "300"),
      row("tūkstantis", "1000"),
      row("du tūkstančiai", "2000"),
      row("trys tūkstančiai", "3000"),
    ]),
    list([
      row("Du šimtai eurų", "Two hundred euros"),
      row("Tūkstantis žmonių", "A thousand people"),
    ]),
  ],
];
numberClasses.push([
  7,
  "plural-only",
  "Count plural-only nouns",
  "157, 253",
  "Kelnės and durys are plural-only, like metai. Their numerals also agree in gender: dveji metai, dvejos kelnės. Vieni and vieneri can both be used with metai.",
  `vienos|one (feminine plural numeral)|numbers
dvejos|two (feminine plural numeral)|numbers
trejos|three (feminine plural numeral)|numbers
ketverios|four (feminine plural numeral)|numbers
penkerios|five (feminine plural numeral)|numbers
šešerios|six (feminine plural numeral)|numbers
septynerios|seven (feminine plural numeral)|numbers
aštuonerios|eight (feminine plural numeral)|numbers
devynerios|nine (feminine plural numeral)|numbers`,
  `Dvejos kelnės|Two pairs of trousers|numbers|___ kelnės
Ketverios durys|Four doors|numbers|___ durys
Vieni metai|One year|numbers||Vieneri metai`,
]);
