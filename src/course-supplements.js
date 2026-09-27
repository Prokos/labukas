// Gaps found by checking the source grammar tables against the legacy inventory.
// These are original examples, not automatic inflection of vocabulary strings.
export const supplements = [
  [
    5,
    "plural-companions",
    "Travel with friends",
    "114",
    "Su takes instrumental for people too: draugai becomes draugais, and draugės becomes draugėmis.",
    [
      [
        "Važiuosiu su draugais",
        "I will travel with friends (male or mixed group)",
        "Važiuosiu su ___",
      ],
      [
        "Važiuosiu su draugėmis",
        "I will travel with friends (female group)",
        "Važiuosiu su ___",
      ],
    ],
  ],
  [
    3,
    "day-periods",
    "Say which part of the day",
    "69",
    "Add ryto, dienos, vakaro or nakties to distinguish morning, daytime, evening and night.",
    [
      [
        "Trečią valandą nakties",
        "At three in the morning",
        "Trečią valandą ___",
      ],
      ["Šeštą valandą ryto", "At six in the morning", "Šeštą valandą ___"],
      ["Šeštą valandą vakaro", "At six in the evening", "Šeštą valandą ___"],
    ],
  ],
  [
    4,
    "count-ten",
    "Two chairs or ten chairs?",
    "90–91",
    "Two to nine use plural nominative; ten and kiek use plural genitive. Kėdės changes to kėdžių, and medžiai to medžių.",
    [
      ["Dvi kėdės", "Two chairs", "Dvi ___"],
      ["Dešimt kėdžių", "Ten chairs", "Dešimt ___"],
      ["Kiek medžių?", "How many trees?", "Kiek ___?"],
    ],
  ],
  [
    6,
    "exam-marks",
    "Say an exam result",
    "136",
    "After gavau (I got), number marks use accusative: penkis, aštuonis, devynis. Dešimt does not change.",
    [
      ["Gavau penkis", "I got five", "Gavau ___"],
      ["Gavau aštuonis", "I got eight", "Gavau ___"],
      ["Gavau devynis", "I got nine", "Gavau ___"],
    ],
  ],
  [
    8,
    "shoe-sizes",
    "Ask for a shoe size",
    "181",
    "A shoe size uses an ordinal. After reikia, the ordinal and dydis take genitive: trisdešimt aštunto dydžio.",
    [
      [
        "Mano batų dydis trisdešimt aštuntas",
        "My shoe size is thirty-eight",
        "Mano batų dydis trisdešimt ___",
      ],
      [
        "Man reikia trisdešimt aštunto dydžio",
        "I need size thirty-eight",
        "Man reikia trisdešimt ___ dydžio",
      ],
      [
        "Ar turite trisdešimt devintą dydį?",
        "Do you have size thirty-nine?",
        "Ar turite trisdešimt ___ dydį?",
      ],
    ],
  ],
  [
    8,
    "material-agreement",
    "Materials and comfortable clothes",
    "180",
    "Material and comfort adjectives agree with gender and number: vilnonis/vilnonė, vilnoniai/vilnonės; patogūs/patogios.",
    [
      ["Vilnoniai megztiniai", "Woollen sweaters", "___ megztiniai"],
      ["Vilnonės pirštinės", "Woollen gloves", "___ pirštinės"],
      ["Patogios kelnės", "Comfortable trousers", "___ kelnės"],
    ],
  ],
  [
    9,
    "negative-symptoms",
    "Say what does not hurt",
    "198",
    "Skauda takes accusative; neskauda takes genitive. Compare gerklę/gerklės and akis/akių.",
    [
      ["Man neskauda gerklės", "My throat does not hurt", "Man neskauda ___"],
      ["Man skauda akis", "My eyes hurt", "Man skauda ___"],
      ["Man neskauda akių", "My eyes do not hurt", "Man neskauda ___"],
    ],
  ],
  [
    9,
    "linked-reasons",
    "Connect a reason or a condition",
    "199",
    "Nes gives a reason, jeigu gives a condition, and kai says when something happens. Nei…nei means neither…nor.",
    [
      [
        "Jeigu pasveiksiu, ateisiu",
        "If I recover, I will come",
        "___ pasveiksiu, ateisiu",
      ],
      [
        "Kai pasveiksiu, paskambinsiu",
        "When I recover, I will call",
        "___ pasveiksiu, paskambinsiu",
      ],
      [
        "Neskauda nei galvos, nei gerklės",
        "Neither my head nor my throat hurts",
        "Neskauda ___ galvos, nei gerklės",
      ],
    ],
  ],
  [
    9,
    "request-infinitive",
    "Two ways to make a polite request",
    "197, 199",
    "Prašom can be followed by an infinitive. A polite imperative ends in -kite. Compare prašom paskambinti and paskambinkite.",
    [
      [
        "Prašom paskambinti vėliau",
        "Please call later (use prašom)",
        "Prašom ___ vėliau",
      ],
      [
        "Paskambinkite vėliau",
        "Please call later (use an imperative)",
        "___ vėliau",
      ],
      ["Prašom palaukti", "Please wait (use prašom)", "Prašom ___"],
    ],
  ],
  [
    10,
    "holiday-greetings",
    "Greet people at different celebrations",
    "214–215",
    "Su takes instrumental in greetings; per takes accusative to say when something happens.",
    [
      ["Su Kalėdomis!", "Merry Christmas!", "Su ___!"],
      ["Su Velykomis!", "Happy Easter!", "Su ___!"],
      [
        "Per Velykas dažome kiaušinius",
        "At Easter we colour eggs",
        "Per ___ dažome kiaušinius",
      ],
    ],
  ],
];
