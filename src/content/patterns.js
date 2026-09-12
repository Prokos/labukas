// Explicit, source-aligned constructions. Each class has new application contexts.
// chapter, stable key, title, printed pages, rule, core rows, application rows.
// Rows: Lithuanian | English | skill | cloze | accepted alternatives.
export const patterns = [
  [
    1,
    "negative-being",
    "Being and not being",
    "17–18",
    "Compare esu / nesu, esi / nesi, esame / nesame, esate / nesate. Third-person negative būti is nėra. Ar turns a statement into a yes/no question.",
    `
Aš nesu studentas|I am not a student (male)|present|Aš ___ studentas
Tu nesi dėstytoja|You are not a lecturer (female, informal)|present|Tu ___ dėstytoja
Jis nėra studentas|He is not a student|present|Jis ___ studentas
Mes nesame studentai|We are not students|present|Mes ___ studentai
Jūs nesate dėstytojai|You are not lecturers (male or mixed group)|present|Jūs ___ dėstytojai
Ar jos yra studentės?|Are they students (female group)?|present|Ar jos ___ studentės?`,
    `
Ne, aš esu dėstytojas|No, I am a lecturer (male)|present|Ne, aš ___ dėstytojas
Ar tu esi mano draugė?|Are you my friend (female, informal)?|pronouns|Ar tu esi ___ draugė?`,
  ],
  [
    1,
    "possession",
    "Whose name and address?",
    "17",
    "Mano/tavo mean my/your; jo/jos mean his/her; mūsų/jūsų/jų mean our/your/their. These possessive forms do not change to match the object.",
    `
Jo vardas Tomas|His name is Tomas|pronouns|___ vardas Tomas
Jos vardas Rasa|Her name is Rasa|pronouns|___ vardas Rasa
Mūsų universitetas|Our university|pronouns|___ universitetas
Jūsų adresas|Your address (formal)|pronouns|___ adresas
Jų butas|Their flat|pronouns|___ butas
Kokia tavo pavardė?|What is your surname (informal)?|pronouns|Kokia ___ pavardė?`,
    `
Mūsų draugė yra studentė|Our friend is a student (female)|pronouns|___ draugė yra studentė
Jų adresas yra Vilniaus gatvė|Their address is Vilniaus Street|pronouns|___ adresas yra Vilniaus gatvė`,
  ],
  [
    1,
    "origin-endings",
    "From a country, in a city",
    "17–18",
    "After iš, -as becomes -o, -is becomes -io, -us becomes -aus, -ius becomes -iaus, -a becomes -os, and -ė becomes -ės. Location uses different endings: -e, -yje, -uje, -iuje, -oje, -ėje. Learn the pair, not just one place name.",
    `
Iš Londono|From London|genitive|Iš ___
Londone|In London|locative
Iš Helsinkio|From Helsinki|genitive|Iš ___
Helsinkyje|In Helsinki|locative
Iš Alytaus|From Alytus|genitive|Iš ___
Alytuje|In Alytus|locative
Iš Rygos|From Riga|genitive|Iš ___
Rygoje|In Riga|locative
Iš Čilės|From Chile|genitive|Iš ___
Čilėje|In Chile|locative`,
    `
Aš esu iš Vokietijos, bet gyvenu Lietuvoje|I am from Germany, but I live in Lithuania|locative|Aš esu iš Vokietijos, bet gyvenu ___
Ji yra iš Prancūzijos ir gyvena Paryžiuje|She is from France and lives in Paris|genitive|Ji yra iš ___ ir gyvena Paryžiuje`,
  ],
  [
    1,
    "present-people",
    "Present tense across people",
    "18",
    "For -a verbs, compare I -u, you -i, he/she/they -a, we -ame, you plural -ate. Studijuoti has studijuoju, studijuoji, studijuoja. Add ne- to negate the verb.",
    `
Mes gyvename centre|We live in the centre|present|Mes ___ centre
Jūs gyvenate bendrabutyje|You live in a dormitory (formal)|present|Jūs ___ bendrabutyje
Jie gyvena bute|They live in a flat (male or mixed group)|present|Jie ___ bute
Mes kalbame lietuviškai|We speak Lithuanian|present|Mes ___ lietuviškai
Jūs suprantate angliškai|You understand English (formal)|present|Jūs ___ angliškai
Jos nestudijuoja|They do not study (female group)|present|Jos ___`,
    `
Ar jūs dirbate universitete?|Do you work at a university (formal)?|present|Ar jūs ___ universitete?
Ne, mes nesuprantame prancūziškai|No, we do not understand French|present|Ne, mes ___ prancūziškai`,
  ],
  [
    2,
    "dative-people",
    "Preferences for every person",
    "35",
    "The thing liked stays nominative. The person uses dative: man, tau, jam, jai, mums, jums, jiems, joms. Patinka has the same form for one thing or several.",
    `
Mums patinka ryžiai|We like rice|dative|___ patinka ryžiai
Jums patinka salotos|You like salad (formal)|dative|___ patinka salotos
Jiems patinka žuvis|They like fish (male or mixed group)|dative|___ patinka žuvis
Joms nepatinka mėsa|They do not like meat (female group)|dative|___ nepatinka mėsa
Ar tau patinka sultys?|Do you like juice (informal)?|dative|Ar ___ patinka sultys?`,
    `
Man patinka žuvis, o jums?|I like fish, and you (formal)?|dative|Man patinka žuvis, o ___?
Ne, mums nepatinka pienas|No, we do not like milk|dative|Ne, ___ nepatinka pienas`,
  ],
  [
    2,
    "plural-food",
    "One food, several foods",
    "35",
    "Nominative plural: -as → -ai, -is/-ys → -iai, -a → -os, -ė → -ės. Rice, pasta and juice are normally plural words: ryžiai, makaronai, sultys.",
    `
bananai|bananas|plural
sumuštiniai|sandwiches|plural
morkos|carrots|plural
bulvės|potatoes|plural
grybai|mushrooms|plural
kiaušiniai|eggs|plural`,
    `
Man patinka sumuštiniai|I like sandwiches|plural|Man patinka ___
Čia yra morkos ir bulvės|Here are carrots and potatoes|plural|Čia yra morkos ir ___`,
  ],
  [
    2,
    "verb-types",
    "Want, eat, and drink together",
    "36",
    "Norėti uses -i forms: norime, norite. Valgyti uses -o forms: valgome, valgote. Gerti uses -ia forms: geriame, geriate. The third person is shared by he, she and they.",
    `
Mes norime valgyti|We want to eat|present|Mes ___ valgyti
Jūs norite gerti|You want to drink (formal)|present|Jūs ___ gerti
Jie nori arbatos|They want tea (male or mixed group)|present|Jie ___ arbatos
Mes valgome sriubą|We eat soup|present|Mes ___ sriubą
Jūs valgote salotas|You eat salad (formal)|present|Jūs ___ salotas
Mes geriame vandenį|We drink water|present|Mes ___ vandenį`,
    `
Ar jūs geriate kavą?|Do you drink coffee (formal)?|present|Ar jūs ___ kavą?
Ne, mes nevalgome mėsos|No, we do not eat meat|present|Ne, mes ___ mėsos`,
  ],
  [
    2,
    "ordering-forms",
    "Order a whole dish",
    "37–39",
    "Prašom and norėčiau can be followed by a genitive request. Both the adjective and noun change: juoda kava → juodos kavos. Compare -o/-io/-aus, -os/-ės/-ies and plural -ų/-ių. Vanduo has vandens; sultys has sulčių.",
    `
Norėčiau juodos kavos|I would like black coffee|genitive|Norėčiau ___ kavos
Prašom šviežio pyrago|Some fresh pie, please|genitive|Prašom ___ pyrago
Norėčiau šviesaus alaus|I would like light beer|genitive|Norėčiau šviesaus ___
Prašom keptos žuvies|Some fried fish, please|genitive|Prašom keptos ___
Norėčiau bulvių|I would like potatoes|genitive|Norėčiau ___
Prašom ryžių|Some rice, please|genitive|Prašom ___`,
    `
Norėčiau mineralinio vandens|I would like mineral water|genitive|Norėčiau mineralinio ___
Prašom obuolių sulčių|Some apple juice, please|genitive|Prašom obuolių ___`,
  ],
  [
    2,
    "with-without-forms",
    "With and without ingredients",
    "38",
    "Su uses instrumental; be uses genitive. Compare sūriu / sūrio, žuvimi / žuvies, morkomis / morkų, bulvėmis / bulvių. Genitive also names ingredients: grybų sriuba is mushroom soup.",
    `
Salotos su sūriu|Salad with cheese|instrumental|Salotos su ___
Salotos be sūrio|Salad without cheese|genitive|Salotos be ___
Sriuba su žuvimi|Soup with fish|instrumental|Sriuba su ___
Sriuba su morkomis|Soup with carrots|instrumental|Sriuba su ___
Vištiena su bulvėmis|Chicken with potatoes|instrumental|Vištiena su ___
Vištiena be bulvių|Chicken without potatoes|genitive|Vištiena be ___`,
    `
Norėčiau grybų sriubos|I would like mushroom soup|genitive|Norėčiau grybų ___
Prašom arbatos su citrina|Tea with lemon, please|instrumental|Prašom arbatos su ___`,
  ],
  [
    2,
    "eat-not-eat",
    "Eat it, want some, or do not eat it",
    "39",
    "Valgau/geriu use accusative for an object; nevalgau/negeriu use genitive. Patinka keeps nominative even when negated. Norėti and quantity words use genitive. Compare vanduo → vandenį → vandens.",
    `
Aš geriu vandenį|I drink water|accusative|Aš geriu ___
Aš negeriu vandens|I do not drink water|genitive|Aš negeriu ___
Aš valgau žuvį|I eat fish|accusative|Aš valgau ___
Aš nevalgau žuvies|I do not eat fish|genitive|Aš nevalgau ___
Mes valgome braškes|We eat strawberries|accusative|Mes valgome ___
Mes nevalgome braškių|We do not eat strawberries|genitive|Mes nevalgome ___`,
    `
Man nepatinka žuvis|I do not like fish|nominative|Man nepatinka ___
Aš geriu mažai kavos|I drink little coffee|genitive|Aš geriu mažai ___`,
  ],
  [
    2,
    "which-food",
    "Ask which kind",
    "39",
    "Koks/kokia/kokie/kokios agree with a nominative noun. When requesting something in genitive, ask kokio/kokios/kokių. A short answer can omit the noun.",
    `
Koks vanduo tau patinka?|What kind of water do you like (informal)?|pronouns|___ vanduo tau patinka?
Kokia arbata jums patinka?|What kind of tea do you like (formal)?|pronouns|___ arbata jums patinka?
Kokie vaisiai tau patinka?|What fruit do you like (informal)?|pronouns|___ vaisiai tau patinka?
Kokios daržovės tau patinka?|What vegetables do you like (informal)?|pronouns|___ daržovės tau patinka?
Kokio vandens norėtumėte?|What kind of water would you like (formal)?|genitive|___ vandens norėtumėte?
Kokių sulčių norėtumėte?|What juice would you like (formal)?|genitive|___ sulčių norėtumėte?`,
    `
Kokios kavos norėtumėte?|What kind of coffee would you like (formal)?|genitive|___ kavos norėtumėte?
Negazuoto vandens, prašom|Still water, please|genitive|___ vandens, prašom`,
  ],
  [
    3,
    "destination-contrast",
    "A destination or a meeting point?",
    "67–68",
    "Į and pas take accusative: į muziejų, pas draugę. Prie and iki take genitive: prie muziejaus, iki stoties. Namo is a complete direction word and needs no į.",
    `
Einu į muziejų|I am going to the museum|accusative|Einu į ___
Einu į stotį|I am going to the station|accusative|Einu į ___
Einu pas draugę|I am going to a friend (female)|accusative|Einu pas ___
Prie muziejaus|Near the museum|genitive|Prie ___
Iki stoties|As far as the station|genitive|Iki ___
Einu namo|I am going home|phrases`,
    `
Važiuojame į Vilnių|We are travelling to Vilnius|accusative|Važiuojame į ___
Susitinkame prie upės|We are meeting by the river|genitive|Susitinkame prie ___`,
  ],
  [
    3,
    "days-parts",
    "On a day, in the evening",
    "68–69",
    "Weekdays use -į for when. Rytas → rytą, diena → dieną, naktis → naktį. Evening is vakare. For a precise time, the ordinal is accusative.",
    `
Antradienį|On Tuesday|accusative
Trečiadienį|On Wednesday|accusative
Penktadienį|On Friday|accusative
Šeštadienį|On Saturday|accusative
Sekmadienį|On Sunday|accusative
Rytą|In the morning|accusative
Dieną|During the day|accusative
Naktį|At night|accusative
Vakare|In the evening|locative`,
    `
Susitinkame penktadienį vakare|We are meeting on Friday evening|accusative|Susitinkame ___ vakare
Bankas šeštadienį nedirba|The bank is closed on Saturday|present|Bankas šeštadienį ___`,
  ],
  [
    3,
    "transport-endings",
    "Choose how to travel",
    "69",
    "Transport uses instrumental: autobusu, traukiniu, dviračiu, tramvajumi, mašina. Taksi and metro do not change. On foot is pėsčiomis.",
    `
Važiuoju troleibusu|I travel by trolleybus|instrumental|Važiuoju ___
Važiuoju tramvajumi|I travel by tram|instrumental|Važiuoju ___
Važiuoju mašina|I travel by car|instrumental|Važiuoju ___
Važiuoju metro|I travel by metro|instrumental|Važiuoju ___
Einu pėsčiomis|I go on foot|phrases`,
    `
Į darbą važiuoju dviračiu|I cycle to work|instrumental|Į darbą važiuoju ___
Kaip nuvažiuoti į oro uostą?|How can I get to the airport by transport?|phrases`,
  ],
  [
    4,
    "home-absence",
    "There is, there is not, and need",
    "90–91",
    "Yra takes nominative. Nėra and reikia take genitive. Some stems change: veidrodis → veidrodžio, bendrabutis → bendrabučio. Ask kiek + genitive plural for a count.",
    `
Yra internetas|There is internet|nominative|Yra ___
Nėra interneto|There is no internet|genitive|Nėra ___
Reikia kompiuterio|A computer is needed|genitive|Reikia ___
Nėra elektros|There is no electricity|genitive|Nėra ___
Nėra veidrodžio|There is no mirror|genitive|Nėra ___
Kiek kambarių?|How many rooms?|genitive|Kiek ___?`,
    `
Vonioje nėra karšto vandens|There is no hot water in the bathroom|genitive|Vonioje nėra karšto ___
Kieme yra du medžiai|There are two trees in the yard|plural|Kieme yra du ___`,
  ],
  [
    4,
    "home-locations",
    "Describe a room precisely",
    "92",
    "Ant, prie, tarp and vidury take genitive. With tarp, name both sides. Descriptive adjectives agree with the noun: jaukus butas, jauki virtuvė.",
    `
Ant lentynos|On the shelf|genitive|Ant ___
Tarp fotelio ir sofos|Between the armchair and the sofa|genitive|Tarp fotelio ir ___
Vidury kambario|In the middle of the room|genitive|Vidury ___
Jauki virtuvė|A cosy kitchen|adjectives|___ virtuvė
Šviesi auditorija|A bright classroom|adjectives|___ auditorija
Nauja spinta|A new wardrobe|adjectives|___ spinta`,
    `
Raktas yra ant šaldytuvo|The key is on the fridge|genitive|Raktas yra ant ___
Lova yra tarp lango ir spintos|The bed is between the window and the wardrobe|genitive|Lova yra tarp lango ir ___`,
  ],
  [
    4,
    "modal-requests",
    "Ask permission and explain a problem",
    "91–94",
    "Galiu/gali/galite express ability or permission. Reikia is impersonal: reikia kviesti. Turiu + infinitive expresses an obligation. The infinitive does not change with the person.",
    `
Ar galiu uždaryti duris?|May I close the door?|phrases
Ar galite išjungti televizorių?|Can you switch off the television (formal)?|accusative|Ar galite išjungti ___?
Reikia kviesti santechniką|We need to call a plumber|accusative|Reikia kviesti ___
Turiu valyti kambarį|I have to clean the room|accusative|Turiu valyti ___
Neveikia liftas|The lift is not working|present|___ liftas`,
    `
Ar gali rytoj ateiti?|Can you come tomorrow (informal)?|present|Ar ___ rytoj ateiti?
Ačiū, ateisiu|Thank you, I will come|phrases`,
  ],
  [
    5,
    "objects-hobbies",
    "What you do and do not do",
    "112",
    "A negated object changes accusative to genitive: knygą → knygos, laišką → laiško, filmą → filmo. Klausyti already takes genitive even when positive: klausau muzikos.",
    `
Aš rašau laišką|I write a letter|accusative|Aš rašau ___
Aš nerašau laiško|I do not write a letter|genitive|Aš nerašau ___
Aš žiūriu filmą|I watch a film|accusative|Aš žiūriu ___
Aš nežiūriu filmo|I do not watch a film|genitive|Aš nežiūriu ___
Aš klausau muzikos|I listen to music|genitive|Aš klausau ___
Aš neklausau muzikos|I do not listen to music|genitive|Aš neklausau ___`,
    `
Ji nežaidžia krepšinio|She does not play basketball|genitive|Ji nežaidžia ___
Mums patinka klausyti muzikos|We like listening to music|dative|___ patinka klausyti muzikos`,
  ],
  [
    5,
    "past-people",
    "Past tense across people",
    "113",
    "Past -o verbs use -au, -ai, -o, -ome, -ote. Past -ė verbs use -iau, -ei, -ė, -ėme, -ėte. Learn stem changes from the model: skaitė → skaičiau, žaidė → žaidžiau.",
    `
Tu keliavai|You travelled (informal)|past|Tu ___
Jūs keliavote|You travelled (formal)|past|Jūs ___
Aš valgiau|I ate|past|Aš ___
Tu valgei|You ate (informal)|past|Tu ___
Mes valgėme|We ate|past|Mes ___
Jūs valgėte|You ate (formal)|past|Jūs ___
Aš žaidžiau krepšinį|I played basketball|past|Aš ___ krepšinį
Aš neturėjau laiko|I did not have time|past|Aš ___ laiko`,
    `
Vakar mes skaitėme laišką|Yesterday we read a letter|past|Vakar mes ___ laišką
Ar jūs buvote prie jūros?|Were you at the seaside (formal)?|past|Ar jūs ___ prie jūros?`,
  ],
  [
    5,
    "future-people",
    "Make plans for another day",
    "113–114",
    "Future forms use -siu, -si, -s, -sime, -site. Būti and eiti have bus/būsiu and eis/eisiu. Link the time word to the tense: vakar, šiandien, rytoj, kitą savaitę.",
    `
Tu būsi namie|You will be at home (informal)|future|Tu ___ namie
Jūs būsite Vilniuje|You will be in Vilnius (formal)|future|Jūs ___ Vilniuje
Mes eisime į koncertą|We will go to a concert|future|Mes ___ į koncertą
Jūs eisite į teatrą|You will go to the theatre (formal)|future|Jūs ___ į teatrą
Kitą savaitę skrisiu|I will fly next week|future|Kitą savaitę ___
Poryt atvyksiu|I will arrive the day after tomorrow|future|Poryt ___`,
    `
Su drauge važiuosime prie ežero|We will go to the lake with a friend (female)|instrumental|Su ___ važiuosime prie ežero
Kitą mėnesį atostogausime|We will be on holiday next month|future|Kitą mėnesį ___`,
  ],
  [
    5,
    "companions",
    "With whom?",
    "114",
    "Su uses instrumental for people too: draugas → draugu, draugė → drauge, Jurgis → Jurgiu, Andrius → Andriumi. Plurals include draugais and draugėmis.",
    `
Su draugu|With a friend (male)|instrumental|Su ___
Su drauge|With a friend (female)|instrumental|Su ___
Su Jurgiu|With Jurgis|instrumental|Su ___
Su Andriumi|With Andrius|instrumental|Su ___
Su draugėmis|With friends (female group)|instrumental|Su ___`,
    `
Su kuo keliausi?|Who will you travel with (informal)?|phrases
Šoksiu su drauge|I will dance with a friend (female)|instrumental|Šoksiu su ___`,
  ],
  [
    6,
    "time-contrast",
    "Before, after, during, from and until",
    "137–138",
    "Po, nuo and iki take genitive in these time expressions. Prieš and per take accusative. Po savaitės can mean in a week; prieš savaitę can mean a week ago. Context separates a sequence from elapsed time.",
    `
Po egzamino|After the exam|genitive|Po ___
Prieš egzaminą|Before the exam|accusative|Prieš ___
Per paskaitą|During the lecture|accusative|Per ___
Nuo rugsėjo iki sausio|From September until January|genitive|Nuo rugsėjo iki ___
Po savaitės|In a week|genitive|Po ___
Prieš savaitę|A week ago|accusative|Prieš ___`,
    `
Dirbu nuo devintos iki penktos|I work from nine until five|genitive|Dirbu nuo devintos iki ___
Susitinkame prieš koncertą|We are meeting before the concert|accusative|Susitinkame prieš ___`,
  ],
  [
    6,
    "study-questions",
    "Ask about studies and work",
    "136–138",
    "Ką asks for an accusative subject of study; kur/kokiame asks for a location; kelintame asks which year. To say when a month contains an event, use accusative: liepą, gegužę. Liepa and gegužė are feminine month names.",
    `
Ką tu studijuoji?|What do you study (informal)?|phrases
Kokiame fakultete studijuoji?|Which faculty do you study in (informal)?|phrases
Kelintame kurse studijuoji?|Which year are you in (informal)?|phrases
Studijuoju antrame kurse|I am in my second year|locative|Studijuoju ___ kurse
Egzaminas bus žodžiu|The exam will be oral|phrases
Ar galite kalbėti lėčiau?|Can you speak more slowly (formal)?|phrases`,
    `
Aš studijuoju teisę|I study law|accusative|Aš studijuoju ___
Atostogos prasideda gegužę|Holidays begin in May|accusative|Atostogos prasideda ___`,
  ],
  [
    7,
    "family-objects",
    "Family: having and not having",
    "156–157",
    "Accusative plurals include brolius, vaikus, dukteris. Negation uses genitive: brolių, vaikų, dukterų. Learn irregular stems: sesuo → seserį/sesers, duktė → dukterį/dukters, šuo → šunį/šuns.",
    `
Turiu du brolius|I have two brothers|accusative|Turiu du ___
Neturiu brolių|I have no brothers|genitive|Neturiu ___
Turiu vaikų|I have children|genitive|Turiu ___
Neturiu vaikų|I do not have children|genitive|Neturiu ___
Turiu dukterį|I have a daughter|accusative|Turiu ___
Neturiu dukters|I do not have a daughter|genitive|Neturiu ___
Turiu šunį|I have a dog|accusative|Turiu ___
Neturiu šuns|I do not have a dog|genitive|Neturiu ___`,
    `
Mano sesers vardas Rasa|My sister’s name is Rasa|genitive|Mano ___ vardas Rasa
Jis turi tris dukteris|He has three daughters|accusative|Jis turi tris ___`,
  ],
  [
    7,
    "family-dative",
    "For someone in the family",
    "158",
    "Dative tells who receives, needs or likes something. Common forms: mamai, tėčiui, broliui, seseriai, dukteriai, sūnui. Compare nominative tėtis with dative tėčiui.",
    `
Perku dovaną mamai|I am buying a gift for Mum|dative|Perku dovaną ___
Perku dovaną tėčiui|I am buying a gift for Dad|dative|Perku dovaną ___
Dukteriai patinka muzika|My daughter likes music|dative|___ patinka muzika
Sūnui reikia knygos|My son needs a book|dative|___ reikia knygos
Kam perki dovaną?|Who are you buying a gift for (informal)?|dative|___ perki dovaną?`,
    `
Močiutė skambina anūkei|Grandma calls her granddaughter|dative|Močiutė skambina ___
Dėdei reikia naujo telefono|My uncle needs a new phone|dative|___ reikia naujo telefono`,
  ],
  [
    7,
    "comparison-contrast",
    "Compare and identify people",
    "159–160",
    "Comparatives use -esnis/-esnė. Superlatives use -iausias/-iausia; older/oldest have vyresnis/vyriausias. Už takes accusative; nei takes nominative. Compare tall/taller/tallest across genders.",
    `
Sesuo aukštesnė už brolį|The sister is taller than the brother|accusative|Sesuo aukštesnė už ___
Brolis aukštesnis nei sesuo|The brother is taller than the sister|adjectives|Brolis ___ nei sesuo
Ji yra jauniausia|She is the youngest|adjectives|Ji yra ___
Jis yra vyriausias|He is the oldest|adjectives|Jis yra ___
Mano mama jaunesnė už tėtį|My mother is younger than my father|accusative|Mano mama jaunesnė už ___`,
    `
Kas vyriausias tavo šeimoje?|Who is the oldest in your family (informal)?|phrases
Mano sesuo panaši į mamą|My sister looks like my mother|accusative|Mano sesuo panaši į ___`,
  ],
  [
    8,
    "weather-neuter",
    "Describe the day and your feelings",
    "180",
    "Weather descriptions use neuter forms: šalta, šilta, saulėta, debesuota. Contrast šaltas kambarys (a cold room) with kambaryje šalta (it is cold in the room). Dative adds the person feeling it.",
    `
Šiandien saulėta|It is sunny today|adjectives|Šiandien ___
Rytoj bus debesuota|It will be cloudy tomorrow|adjectives|Rytoj bus ___
Kambaryje šalta|It is cold in the room|adjectives|Kambaryje ___
Ar jums nešalta?|Are you not cold (formal)?|dative|Ar ___ nešalta?
Du laipsniai šalčio|Two degrees below zero|numbers|Du laipsniai ___
Trys laipsniai šilumos|Three degrees above zero|numbers|Trys laipsniai ___`,
    `
Vakar buvo šilta, o šiandien šalta|Yesterday it was warm, but today it is cold|past|Vakar ___ šilta, o šiandien šalta
Man per karšta|I feel too hot|dative|___ per karšta`,
  ],
  [
    8,
    "clothing-cases",
    "Buy, need, and describe clothes",
    "180–182",
    "Accusative plural: batai → batus, marškiniai → marškinius, suknelės → sukneles, kelnės → kelnes. Genitive: batų, marškinių, suknelių, kelnių. Both adjective and noun change.",
    `
Perku juodas kelnes|I am buying black trousers|accusative|Perku juodas ___
Reikia juodų kelnių|Black trousers are needed|genitive|Reikia juodų ___
Perku baltus marškinius|I am buying a white shirt|accusative|Perku baltus ___
Reikia baltų marškinių|A white shirt is needed|genitive|Reikia baltų ___
Šitie batai nauji|These shoes are new|adjectives|Šitie batai ___
Šitos suknelės naujos|These dresses are new|adjectives|Šitos suknelės ___`,
    `
Ar turite didesnį megztinį?|Do you have a larger sweater (formal)?|accusative|Ar turite didesnį ___?
Norėčiau mėlynų džinsų|I would like blue jeans|genitive|Norėčiau mėlynų ___`,
  ],
  [
    9,
    "reflexive-people",
    "Feeling now and before",
    "198",
    "Jaustis keeps reflexive endings: jaučiuosi, jautiesi, jaučiasi, jaučiamės, jaučiatės. Past: jaučiausi, jauteisi, jautėsi, jautėmės, jautėtės. Third-person singular and plural share the same form.",
    `
Jūs jaučiatės gerai|You feel well (formal)|present|Jūs ___ gerai
Jie jaučiasi blogai|They feel unwell (male or mixed group)|present|Jie ___ blogai
Tu vakar jauteisi gerai|You felt well yesterday (informal)|past|Tu vakar ___ gerai
Mes jautėmės blogai|We felt unwell|past|Mes ___ blogai
Jūs jautėtės gerai|You felt well (formal)|past|Jūs ___ gerai`,
    `
Kaip jūs jautėtės vakar?|How did you feel yesterday (formal)?|past|Kaip jūs ___ vakar?
Šiandien jaučiamės geriau|Today we feel better|present|Šiandien ___ geriau`,
  ],
  [
    9,
    "imperative-people",
    "Understand requests and instructions",
    "199",
    "Informal gerk, formal/plural gerkite, and inclusive gerkime use different endings. Reflexive ilsėkis becomes ilsėkitės. A negative request adds ne-. These examples teach language, not treatment decisions.",
    `
Gerk!|Drink! (informal)|imperative
Gerkite!|Drink! (formal)|imperative
Eikime!|Let us go!|imperative
Neik!|Do not go! (informal)|imperative
Ilsėkis!|Rest! (informal)|imperative
Paskambinkite vėliau|Call later (formal)|imperative|___ vėliau
Prašom parodyti receptą|Please show the prescription|accusative|Prašom parodyti ___`,
    `
Uždarykite duris|Close the door (formal)|imperative|___ duris
Neatidarykite lango|Do not open the window (formal)|genitive|Neatidarykite ___`,
  ],
  [
    9,
    "adverbs-conjunctions",
    "Explain, contrast, and compare",
    "199",
    "Comparative adverbs include greičiau, lėčiau, anksčiau, vėliau, daugiau and mažiau. Nes gives a reason; todėl gives a result. Jeigu means if, kai means when. Nei ... nei means neither ... nor.",
    `
Kalbėkite lėčiau|Speak more slowly (formal)|imperative|Kalbėkite ___
Ateikite anksčiau|Come earlier (formal)|imperative|Ateikite ___
Sveik greičiau|Get well sooner (informal)|phrases
Noriu daugiau vandens|I want more water|genitive|Noriu daugiau ___
Nei galvos, nei gerklės neskauda|Neither my head nor my throat hurts|genitive|Nei galvos, nei ___ neskauda
Jeigu sirgsiu, neisiu|If I am ill, I will not go|phrases|___ sirgsiu, neisiu
Kai pasveiksiu, ateisiu|When I recover, I will come|phrases|___ pasveiksiu, ateisiu`,
    `
Negaliu ateiti, nes sergu|I cannot come because I am ill|phrases|Negaliu ateiti, ___ sergu
Galime susitikti rytoj arba poryt|We can meet tomorrow or the day after tomorrow|phrases|Galime susitikti rytoj ___ poryt`,
  ],
  [
    10,
    "gift-objects",
    "Give something or give some",
    "214–216",
    "A definite whole gift uses accusative; an unspecified quantity uses genitive. Compare knygą with kavos, gėles with gėlių. The recipient uses dative. Ragauti takes genitive for what is tasted.",
    `
Padovanojau mamai knygą|I gave Mum a book|accusative|Padovanojau mamai ___
Padovanojau mamai kavos|I gave Mum some coffee|genitive|Padovanojau mamai ___
Padovanojau seseriai gėles|I gave my sister the flowers|accusative|Padovanojau seseriai ___
Padovanojau seseriai gėlių|I gave my sister some flowers|genitive|Padovanojau seseriai ___
Paragaukite pyrago|Taste some pie (formal)|genitive|Paragaukite ___
Ragavau kūčiukų|I tasted Christmas Eve biscuits|genitive|Ragavau ___`,
    `
Seneliai anūkui padovanojo pinigų|The grandparents gave their grandson some money|genitive|Seneliai anūkui padovanojo ___
Prašom paragauti silkės|Please taste some herring|genitive|Prašom paragauti ___`,
  ],
  [
    10,
    "object-pronouns",
    "Invite me, her, or them",
    "216",
    "Accusative pronouns: mane, tave, jį, ją, mus, jus, juos, jas. These follow inviting and congratulating verbs. Use a named noun or pronoun for the same role.",
    `
Pakvietė mane|Someone invited me|pronouns|Pakvietė ___
Pakvietė jį|Someone invited him|pronouns|Pakvietė ___
Pakvietė ją|Someone invited her|pronouns|Pakvietė ___
Pakvietė mus|Someone invited us|pronouns|Pakvietė ___
Pakvietė juos|Someone invited them (male or mixed group)|pronouns|Pakvietė ___
Pakvietė jas|Someone invited them (female group)|pronouns|Pakvietė ___`,
    `
Draugė pakvietė mus į vestuves|A friend (female) invited us to a wedding|pronouns|Draugė pakvietė ___ į vestuves
Sveikiname jus su švente|We congratulate you on the holiday (formal)|pronouns|Sveikiname ___ su švente`,
  ],
  [
    10,
    "address-wishes",
    "Address people and wish them well",
    "215–217",
    "Vocative addresses a person: Tomas → Tomai, brolis → broli, sesuo → seserie. A wish takes genitive; an occasion after su takes instrumental. Both adjective and noun agree.",
    `
Labas, Tomai!|Hello, Tomas!|vocative|Labas, ___!
Ačiū, broli!|Thank you, brother!|vocative|Ačiū, ___!
Labas, seserie!|Hello, sister!|vocative|Labas, ___!
Gerbiamas mokytojau!|Dear respected teacher (male)!|vocative|Gerbiamas ___!
Linkime geros nuotaikos|We wish you a good mood|genitive|Linkime geros ___
Su vardadieniu!|Happy name day!|instrumental|Su ___!`,
    `
Linkiu tau meilės ir džiaugsmo|I wish you love and joy (informal)|genitive|Linkiu tau meilės ir ___
Per Jonines šokome prie laužo|At Midsummer we danced by the bonfire|accusative|Per ___ šokome prie laužo`,
  ],
];
patterns.push(
  [
    3,
    "inviting",
    "Invite, accept, or suggest another time",
    "66, 70–71",
    "An invitation can be a question with einame? Use mielai to accept or negaliu to decline. Offer a different day so the exchange can continue.",
    `Einame į muziejų?|Shall we go to the museum?|phrases\nTaip, mielai|Yes, gladly|phrases\nAčiū, bet negaliu|Thank you, but I cannot|phrases\nGal rytoj?|Perhaps tomorrow?|phrases\nKur susitinkame?|Where shall we meet?|phrases\nAr tau tinka penktadienis?|Does Friday suit you (informal)?|dative|Ar ___ tinka penktadienis?`,
    `Šiandien negaliu, gal šeštadienį?|I cannot today, perhaps on Saturday?|phrases\nGerai, susitinkame prie stoties|All right, let us meet by the station|genitive|Gerai, susitinkame prie ___`,
  ],
  [
    7,
    "family-questions",
    "Ask about a family",
    "155",
    "Use ar for yes/no questions, kiek for quantities, and koks/kokia for a description or name. A short reply can be enough; full sentences help you practise the case endings.",
    `Ar tavo brolis vedęs?|Is your brother married (informal)?|phrases\nAr tavo sesuo turi vaikų?|Does your sister have children (informal)?|genitive|Ar tavo sesuo turi ___?\nKiek metų tavo dukteriai?|How old is your daughter (informal)?|dative|Kiek metų tavo ___?\nKoks tavo brolio vardas?|What is your brother’s name (informal)?|genitive|Koks tavo ___ vardas?\nKokia tavo sesuo?|What is your sister like (informal)?|phrases`,
    `Mano sesuo draugiška ir linksma|My sister is friendly and cheerful|adjectives|Mano sesuo draugiška ir ___\nMano brolis neturi vaikų|My brother does not have children|genitive|Mano brolis neturi ___`,
  ],
  [
    10,
    "tradition-questions",
    "Ask about a celebration",
    "213",
    "Ask kada for a date, kur for a place and kaip for a way of celebrating. Ką dovanosi asks what somebody will give. Reuse per + accusative and future forms.",
    `Kaip švęsi gimtadienį?|How will you celebrate your birthday (informal)?|phrases\nKur švęsi Kalėdas?|Where will you celebrate Christmas (informal)?|phrases\nKada jūsų Nepriklausomybės diena?|When is your Independence Day?|phrases\nKokios Velykų tradicijos Lietuvoje?|What are the Easter traditions in Lithuania?|phrases\nKą dovanosi draugei?|What will you give a friend (female, informal you)?|dative|Ką dovanosi ___?`,
    `Per Kūčias vakarieniaujame kartu|On Christmas Eve we have supper together|accusative|Per ___ vakarieniaujame kartu\nPer gimtadienį gausiu dovanų|I will receive gifts on my birthday|genitive|Per gimtadienį gausiu ___`,
  ],
);
