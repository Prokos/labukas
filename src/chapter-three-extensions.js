import { M, C, G, B, L, chat } from "./chapter-three-route.js";

// Contrasts that the inventory conversion did not teach adequately. These are
// placed by prerequisites, not by an arbitrary lesson offset.
export function extendChapterThree(lessons) {
  const insert = (anchor, lesson, before = false) => {
    const index = lessons.findIndex((l) => l.id === anchor);
    if (index < 0) throw new Error(`Missing chapter 3 anchor: ${anchor}`);
    lessons.splice(index + (before ? 0 : 1), 0, lesson);
  };
  const provides = (id, concept) => {
    const l = lessons.find((l) => l.id === id);
    if (!l) throw new Error(`Missing chapter 3 prerequisite: ${id}`);
    l.provides = [...(l.provides || []), concept];
  };
  const defer = (id, until) => {
    const index = lessons.findIndex((l) => l.id === id);
    const [lesson] = lessons.splice(index, 1);
    insert(until, lesson);
  };
  provides("a-c3l6-3", "weekdays-full");
  provides("a-c3-days-parts-3", "day-parts");
  provides("a-c3-clock-hours-4", "hours-full");
  provides("a-c3-half-hours-4", "half-hours-full");
  provides("a-c3-ordinals-early-use", "bus-numbers");
  provides("a-c3-lex-landmarks-4", "landmark-nouns");
  provides("a-c3-lex-errands-in-town-5", "errand-nouns");
  provides("a-c3-lex-when-and-how-often-6", "frequency-words");

  insert(
    "a-c3l1-1",
    L(
      "more-people",
      "She, he or you?",
      "Extend the going-on-foot pattern to another person and a polite question.",
      ["eiti-person"],
      ["eiti-third-polite"],
      [
        M(
          "more-people-model",
          "One form for she and he",
          [
            ["Ji eina į parką.", "She is going to the park."],
            ["Jis eina į parką.", "He is going to the park."],
          ],
          "Ji and jis both take eina. The verb changes with person, not with gender.",
          ["eina"],
          ["eina", "eina"],
        ),
        C(
          "more-people-meaning",
          "eina",
          "Jis eina į parką.",
          [
            "He is going to the park.",
            "She is going to the park.",
            "We are going to the park.",
          ],
          "He is going to the park.",
          "Jis means he. Both jis and ji use eina.",
        ),
        G(
          "she-guided",
          "eina",
          "Ji ___ į parką.",
          "She is going to the park.",
          "eina",
          ["einu", "eini"],
          "Ji takes eina.",
        ),
        M(
          "polite-walk-model",
          "Asking politely",
          [
            ["Kur tu eini?", "Where are you going? (informal)"],
            ["Kur jūs einate?", "Where are you going? (polite or plural)"],
          ],
          "Tu takes eini. Jūs takes einate, whether you address one person politely or more than one person.",
          ["eini", "einate"],
          ["eini", "einate"],
        ),
        G(
          "polite-walk-guided",
          "einate",
          "Kur jūs ___?",
          "Where are you going? (polite)",
          "einate",
          ["eini"],
          "With jūs, use einate.",
        ),
        G(
          "he-recall",
          "eina",
          "Jis ___ į parką.",
          "He is going to the park.",
          "eina",
          ["einu", "einame"],
          "Jis takes eina.",
          true,
        ),
        G(
          "polite-walk-recall",
          "einate",
          "Kur jūs ___?",
          "Where are you going? (polite)",
          "einate",
          ["eini"],
          "Jūs einate — you are going.",
          true,
        ),
      ],
    ),
    true,
  );

  insert(
    "a-c3l1-2",
    L(
      "visit-person",
      "Go to a place or visit a person",
      "Choose į for a place and pas for a person.",
      ["destination-as"],
      ["pas-person"],
      [
        M(
          "visit-person-model",
          "The destination decides the preposition",
          [
            ["Einu į banką.", "I am going to the bank."],
            ["Einu pas draugą.", "I am going to a male friend’s place."],
            ["Einu pas draugę.", "I am going to a female friend’s place."],
          ],
          "Use į for a place and pas for a person. Both need the destination form: draugas → draugą, draugė → draugę. The choice of į or pas depends on who or what you are going to.",
          ["bank-destination", "pas-male", "pas-female", "visit-preposition"],
          ["į banką", "pas draugą", "pas draugę"],
        ),
        G(
          "pas-place-guided",
          "visit-preposition",
          "Einu ___ banką.",
          "I am going to the bank.",
          "į",
          ["pas"],
          "The bank is a place: į banką.",
        ),
        G(
          "pas-person-guided",
          "visit-preposition",
          "Einu ___ draugą.",
          "I am going to a male friend’s place.",
          "pas",
          ["į"],
          "A friend is a person: pas draugą.",
        ),
        G(
          "pas-female-guided",
          "pas-female",
          "Einu pas ___.",
          "I am going to a female friend’s place.",
          "draugę",
          ["draugė"],
          "After pas, draugė becomes draugę.",
        ),
        B(
          "pas-build",
          "pas-male",
          "I am going to a male friend’s place.",
          "Einu pas draugą.",
        ),
        G(
          "pas-male-recall",
          "pas-male",
          "Einu pas ___.",
          "I am going to a male friend’s place.",
          "draugą",
          ["draugas"],
          "After pas, draugas becomes draugą.",
          true,
        ),
        G(
          "pas-female-recall",
          "pas-female",
          "Einu pas ___.",
          "I am going to a female friend’s place.",
          "draugę",
          ["draugė"],
          "After pas, draugė becomes draugę.",
          true,
        ),
      ],
    ),
    true,
  );

  insert(
    "a-c3-destination-contrast-2",
    L(
      "cafe-location",
      "Inside, beside or going to the café",
      "Choose the form that describes the actual location or movement.",
      ["destination-e-us", "meeting-prie"],
      ["cafe-three-cases"],
      [
        M(
          "cafe-location-model",
          "One place, three meanings",
          [
            ["Einu į kavinę.", "I am going to the café."],
            ["Susitinkame prie kavinės.", "We are meeting by the café."],
            ["Susitinkame kavinėje.", "We are meeting in the café."],
          ],
          "Į kavinę is a destination. Prie kavinės is beside the café. Kavinėje means in the café and needs no preposition. The endings carry a difference in meaning.",
          ["cafe-destination", "cafe-beside", "cafe-inside"],
          ["į kavinę", "prie kavinės", "kavinėje"],
        ),
        C(
          "cafe-inside-meaning",
          "cafe-inside",
          "Susitinkame kavinėje.",
          [
            "We are meeting in the café.",
            "We are meeting by the café.",
            "We are going to the café.",
          ],
          "We are meeting in the café.",
          "Kavinėje locates the meeting inside the café.",
        ),
        G(
          "cafe-beside-guided",
          "cafe-beside",
          "Susitinkame prie ___.",
          "We are meeting by the café.",
          "kavinės",
          ["kavinę", "kavinėje"],
          "After prie, use kavinės.",
        ),
        G(
          "cafe-inside-guided",
          "cafe-inside",
          "Susitinkame ___.",
          "We are meeting in the café.",
          "kavinėje",
          ["kavinę", "kavinės"],
          "In the café: kavinėje, without a preposition.",
        ),
        B(
          "cafe-location-build",
          "cafe-beside",
          "We are meeting by the café.",
          "Susitinkame prie kavinės.",
        ),
        G(
          "cafe-inside-recall",
          "cafe-inside",
          "Susitinkame ___.",
          "We are meeting in the café.",
          "kavinėje",
          ["kavinę", "kavinės"],
          "In the café: kavinėje.",
          true,
        ),
        G(
          "cafe-beside-recall",
          "cafe-beside",
          "Susitinkame prie ___.",
          "We are meeting by the café.",
          "kavinės",
          ["kavinę", "kavinėje"],
          "By the café: prie kavinės.",
          true,
        ),
      ],
    ),
  );

  insert(
    "a-c3-days-parts-3",
    L(
      "reschedule",
      "Suggest a different day",
      "Decline one plan and offer another day and time.",
      ["weekdays-full", "day-parts", "meeting-hours", "invitation-replies"],
      ["reschedule-meeting"],
      [
        M(
          "reschedule-model",
          "Keep the conversation going",
          [
            ["Šiandien negaliu.", "I can’t today."],
            ["Gal rytoj?", "Perhaps tomorrow?"],
            ["Susitinkame rytoj vakare.", "We are meeting tomorrow evening."],
          ],
          "A short alternative keeps the invitation open. Šiandien and rytoj do not change their endings. Evening is vakare.",
          ["today-decline", "tomorrow-suggest", "tomorrow-evening"],
        ),
        C(
          "reschedule-meaning",
          "tomorrow-suggest",
          "Gal rytoj?",
          ["Perhaps today?", "Perhaps tomorrow?"],
          "Perhaps tomorrow?",
          "Rytoj means tomorrow.",
        ),
        B(
          "reschedule-build",
          "tomorrow-evening",
          "We are meeting tomorrow evening.",
          "Susitinkame rytoj vakare.",
        ),
        chat(
          "reschedule-decline",
          "today-decline",
          "Susitinkame šiandien?",
          "Shall we meet today?",
          "You cannot meet today. Say so.",
          "Šiandien negaliu.",
          "Taip, mielai.",
          "Gal rytoj?",
          "Perhaps tomorrow?",
          { thread: "c3-reschedule" },
        ),
        chat(
          "reschedule-accept",
          "accept",
          "Gal rytoj?",
          "Perhaps tomorrow?",
          "Tomorrow works. Accept.",
          "Taip, mielai.",
          "Ačiū, bet negaliu.",
          "Kelintą valandą?",
          "At what time?",
          { thread: "c3-reschedule", continuation: true },
        ),
        chat(
          "reschedule-time",
          "two",
          "Kelintą valandą?",
          "At what time?",
          "Suggest two o’clock.",
          "Antrą valandą.",
          "Trečią valandą.",
          "Gerai. Iki!",
          "All right. See you!",
          { thread: "c3-reschedule", continuation: true },
        ),
      ],
    ),
  );

  insert(
    "a-c3-ordinals-early-use",
    L(
      "bus-route-number",
      "Ask which bus to take",
      "Use a route number when naming the bus and when saying how you travel.",
      ["bus-numbers", "transport-instrumental"],
      ["route-number-instrumental"],
      [
        M(
          "bus-route-number-model",
          "Bus number two",
          [
            ["Antras autobusas.", "Bus number two."],
            ["Važiuoju antru autobusu.", "I take bus number two."],
            ["Važiuoju penktu autobusu.", "I take bus number five."],
          ],
          "When naming the bus, use antras autobusas. After važiuoju, both words describe the means of travel: antru autobusu, penktu autobusu.",
          ["route-two-name", "route-two-travel", "route-five-travel"],
          ["Antras autobusas", "antru autobusu", "penktu autobusu"],
        ),
        G(
          "route-two-guided",
          "route-two-travel",
          "Važiuoju ___ autobusu.",
          "I take bus number two.",
          "antru",
          ["antras"],
          "By bus number two: antru autobusu.",
        ),
        C(
          "route-five-meaning",
          "route-five-travel",
          "Važiuoju penktu autobusu.",
          ["I take bus number two.", "I take bus number five."],
          "I take bus number five.",
          "Penktu autobusu means by bus number five.",
        ),
        G(
          "route-five-guided",
          "route-five-travel",
          "Važiuoju ___ autobusu.",
          "I take bus number five.",
          "penktu",
          ["penktas"],
          "By bus number five: penktu autobusu.",
        ),
        B(
          "route-number-build",
          "route-two-travel",
          "I take bus number two.",
          "Važiuoju antru autobusu.",
        ),
        G(
          "route-five-recall",
          "route-five-travel",
          "Važiuoju ___ autobusu.",
          "I take bus number five.",
          "penktu",
          ["penktas"],
          "Penktu autobusu — by bus number five.",
          true,
        ),
        G(
          "route-two-recall",
          "route-two-travel",
          "Važiuoju ___ autobusu.",
          "I take bus number two.",
          "antru",
          ["antras"],
          "Antru autobusu — by bus number two.",
          true,
        ),
      ],
    ),
  );

  insert(
    "a-c3-lex-when-and-how-often-6",
    L(
      "never-travel",
      "Often, rarely or never",
      "Pair never with a negative verb when describing a journey.",
      ["frequency-words", "travel-mode"],
      ["negative-frequency"],
      [
        M(
          "never-walk-model",
          "Never needs a negative verb",
          [
            ["Dažnai einu į parką.", "I often go to the park."],
            ["Retai einu į parką.", "I rarely go to the park."],
            ["Niekada neinu į parką.", "I never go to the park."],
          ],
          "Often and rarely keep the positive verb einu. With niekada (never), use neinu. Lithuanian uses both never and the negative verb.",
          ["often-walk", "rarely-walk", "never-walk"],
          ["Dažnai", "Retai", "Niekada neinu"],
        ),
        C(
          "never-meaning",
          "never-walk",
          "Niekada neinu į parką.",
          ["I rarely go to the park.", "I never go to the park."],
          "I never go to the park.",
          "Niekada means never; retai means rarely.",
        ),
        G(
          "never-guided",
          "never-walk",
          "Niekada ___ į parką.",
          "I never go to the park.",
          "neinu",
          ["einu"],
          "Niekada requires the negative verb neinu.",
        ),
        M(
          "never-ride-model",
          "The same pattern with transport",
          [
            ["Dažnai važiuoju autobusu.", "I often travel by bus."],
            ["Niekada nevažiuoju autobusu.", "I never travel by bus."],
          ],
          "Add ne- to važiuoju after niekada: nevažiuoju.",
          ["often-ride", "never-ride"],
          ["Dažnai važiuoju", "Niekada nevažiuoju"],
        ),
        G(
          "never-ride-guided",
          "never-ride",
          "Niekada ___ autobusu.",
          "I never travel by bus.",
          "nevažiuoju",
          ["važiuoju"],
          "Niekada nevažiuoju — I never travel by vehicle.",
        ),
        G(
          "never-walk-recall",
          "never-walk",
          "Niekada ___ į parką.",
          "I never go to the park.",
          "neinu",
          ["einu"],
          "Never: niekada neinu.",
          true,
        ),
        G(
          "never-ride-recall",
          "never-ride",
          "Niekada ___ autobusu.",
          "I never travel by bus.",
          "nevažiuoju",
          ["važiuoju"],
          "Never: niekada nevažiuoju.",
          true,
        ),
      ],
    ),
  );

  // Applications involving river/work follow those nouns instead of testing
  // incidental unknown vocabulary alongside a new grammatical form.
  defer("a-c3-destination-contrast-use", "a-c3-lex-landmarks-use");
  defer("a-c3-transport-endings-use", "a-c3-lex-errands-in-town-use");

  const models = (id, note) =>
    lessons
      .find((l) => l.id === id)
      .steps.filter((q) => q.kind === "model")
      .forEach((q) => {
        q.note = note;
      });
  models(
    "a-c3l1-1",
    "Combine the person forms with destinations. After į, -as becomes -ą and -ė becomes -ę. Universitetas follows the same -as pattern as parkas.",
  );
  models(
    "a-c3l1-2",
    "Pas introduces a person: pas draugą. A question with tu uses eini: Kur tu eini? The destination can be answered with a short phrase.",
  );
  models(
    "a-c3l1-use",
    "Both į banką and pas mokytoją use a destination form. Į introduces the building; pas introduces the person. Mokytoją can refer to a male or female teacher.",
  );
  models(
    "a-c3-lex-landmarks-use",
    "For a location, aikštė follows the same pattern as kavinė: aikštėje. After prie, bažnyčia becomes bažnyčios. Compare in the square with beside the church.",
  );
  models(
    "a-c3-transport-endings-use",
    "By bicycle is dviračiu. To work is į darbą. The destination and means of travel use different endings. Kaip nuvažiuoti…? asks how to get somewhere by transport.",
  );
  models(
    "a-c3-clock-hours-use",
    "Ryto specifies morning and vakaro specifies evening. The clock phrase stays šeštą valandą; the final word distinguishes 06:00 from 18:00.",
  );

  // Mixed checkpoints sample the chapter's major contrasts after preparation.
  // Every row explicitly names a previous production task, not just a topic label.
  const addCheck = (anchor, key, title, rows) => {
    const all = lessons.flatMap((l) => l.steps);
    const steps = rows.map(
      (
        [originalId, source, translation, answer, alternatives, correction],
        i,
      ) => {
        const original = all.find((q) => q.id === originalId);
        if (!original)
          throw new Error(`Missing changed-context original ${originalId}`);
        return {
          ...original,
          id: `a-c3-transfer-${key}-${i}`,
          source,
          translation,
          answers: [answer],
          words: [answer, ...alternatives],
          wrong: alternatives,
          formAlternatives: [answer, ...alternatives],
          correction,
          changedContext: true,
          returnOf: originalId,
        };
      },
    );
    insert(anchor, {
      ...L(
        `check-${key}`,
        title,
        "Combine familiar words and choose the forms that fit this message.",
        [],
        [],
        steps,
      ),
      reviewStatus: "authored-context-check",
      sourcePages: "74–81",
    });
  };
  addCheck(
    "a-c3-days-parts-use",
    "places",
    "Different places, different meanings",
    [
      [
        "a-c3-route-cafe-inside-recall",
        "Susitinkame pirmadienį ___.",
        "We are meeting in the café on Monday.",
        "kavinėje",
        ["kavinę", "kavinės"],
        "Inside the café: kavinėje, without a preposition.",
      ],
      [
        "a-c3-route-pas-female-recall",
        "Penktadienį einu pas ___.",
        "On Friday I am going to a female friend’s place.",
        "draugę",
        ["draugė"],
        "After pas, use draugę.",
      ],
      [
        "a-c3-route-he-recall",
        "Ji ___ į muziejų.",
        "She is going to the museum.",
        "eina",
        ["einu", "einame"],
        "Ji takes eina. A new destination does not change the person form.",
      ],
      [
        "a-c3-route-cafe-beside-recall",
        "Prie ___ susitinkame penktadienį.",
        "We are meeting by the café on Friday.",
        "kavinės",
        ["kavinę", "kavinėje"],
        "Prie takes kavinės.",
      ],
    ],
  );
  addCheck("a-c3-lex-public-transport-2", "times", "Read the time carefully", [
    [
      "a-c3-route-half-recall",
      "Į kavinę einu pusę ___.",
      "I am going to the café at 14:30.",
      "trečios",
      ["antros"],
      "14:30 is halfway to three: pusę trečios.",
    ],
    [
      "a-c3-route-time-two-recall",
      "___ valandą einu į muziejų.",
      "At 14:00 I am going to the museum.",
      "Antrą",
      ["Trečią"],
      "14:00 is two o’clock: antrą valandą.",
    ],
    [
      "a-c3-route-friday-recall",
      "___ važiuoju traukiniu.",
      "On Friday I travel by train.",
      "Penktadienį",
      ["Penktadienis"],
      "The day tells when, so use penktadienį.",
    ],
  ]);
  addCheck(
    "a-c3-ordinals-later-use",
    "travel",
    "Choose the journey, not just the noun",
    [
      [
        "a-c3-route-route-two-recall",
        "Į muziejų važiuoju ___ autobusu.",
        "I take bus number two to the museum.",
        "antru",
        ["antras"],
        "The means of travel uses antru autobusu.",
      ],
      [
        "a-c3-route-route-five-recall",
        "Į stotį važiuoju ___ autobusu.",
        "I take bus number five to the station.",
        "penktu",
        ["penktas"],
        "The means of travel uses penktu autobusu.",
      ],
      [
        "a-c3-route-train-recall",
        "Į Vilnių važiuoju ___.",
        "I travel to Vilnius by train.",
        "traukiniu",
        ["traukinys"],
        "By train: traukiniu.",
      ],
      [
        "a-c3-route-polite-walk-recall",
        "Ar jūs ___ į kavinę?",
        "Are you going to the café? (polite)",
        "einate",
        ["eini", "eina"],
        "Jūs takes einate, including when addressing one person politely.",
      ],
    ],
  );
  addCheck(
    "a-c3-situation-transport-signs",
    "frequency",
    "Describe another journey",
    [
      [
        "a-c3-route-never-walk-recall",
        "Niekada ___ į muziejų.",
        "I never go to the museum.",
        "neinu",
        ["einu"],
        "Niekada needs a negative verb: neinu.",
      ],
      [
        "a-c3-route-never-ride-recall",
        "Niekada ___ traukiniu.",
        "I never travel by train.",
        "nevažiuoju",
        ["važiuoju"],
        "Use nevažiuoju after niekada, whichever vehicle follows.",
      ],
      [
        "a-c3-route-left-recall",
        "Prie stoties pasukite į ___.",
        "Turn left at the station.",
        "kairę",
        ["dešinę"],
        "Turn left: pasukite į kairę.",
      ],
    ],
  );
  insert("a-c3-situation-directions", {
    ...L(
      "map",
      "Follow the directions on a map",
      "Use a landmark and a turn to find the destination.",
      ["route-endpoint", "destination-e-us"],
      [],
      [],
    ),
    sourcePages: "66, 70, 74–75",
    steps: [
      [
        "right",
        "Eikite tiesiai. Prie banko pasukite į dešinę.",
        "Į kavinę",
        "The right turn at the bank leads to the café.",
      ],
      [
        "straight",
        "Eikite tiesiai iki stoties.",
        "Į stotį",
        "Continue straight past the bank to the station.",
      ],
      [
        "left",
        "Prie banko pasukite į kairę.",
        "Į parką",
        "The left turn at the bank leads to the park.",
      ],
    ].map(([key, passage, answer, correction]) => ({
      id: `a-c3-map-${key}`,
      kind: "reading",
      ability: "reading",
      target: `c3-map:${key}`,
      reviewKey: `c3-map:${key}`,
      source: "Where do these directions lead?",
      passage,
      instruction: "Follow the directions from the arrow.",
      map: {
        description:
          "Start south of the bank, facing north. The station is north of the bank, the park is west of it, and the café is east of it. The roads meet at the bank.",
        locations: [
          { id: "bank", label: "bankas", x: 180, y: 130 },
          { id: "station", label: "stotis", x: 180, y: 35 },
          { id: "park", label: "parkas", x: 60, y: 130 },
          { id: "cafe", label: "kavinė", x: 300, y: 130 },
        ],
      },
      options: ["Į kavinę", "Į stotį", "Į parką"],
      answers: [answer],
      answerVisible: true,
      hint: "Face the bank from the starting arrow. Work out which road the direction names.",
      correction,
    })),
  });
  return lessons;
}
