// Teaching metadata sits alongside existing targets; it does not change their IDs.
const pilots = {
  "c1-present-people": {
    kind: "verb",
    guide: {
      lead: "The subject changes the verb. Look at the ending, then choose the form that fits the person.",
      examples: [
        ["mes · we", "gyvename"],
        ["jūs · polite/plural you", "gyvenate"],
        ["jie · they", "gyvena"],
      ],
      recap: "Read the person first, then change the verb.",
    },
    targets: {
      "Mes gyvename centre": {
        focus: "gyvename",
        forms: ["gyvenu", "gyvena", "gyvename", "gyvenate"],
        person: "we",
      },
      "Jūs gyvenate bendrabutyje": {
        focus: "gyvenate",
        forms: ["gyveni", "gyvena", "gyvename", "gyvenate"],
        person: "you (polite or plural)",
      },
      "Jie gyvena bute": {
        focus: "gyvena",
        forms: ["gyvenu", "gyveni", "gyvena", "gyvename"],
        person: "he, she, or they",
      },
      "Mes kalbame lietuviškai": {
        focus: "kalbame",
        forms: ["kalbu", "kalba", "kalbame", "kalbate"],
        person: "we",
      },
      "Jūs suprantate angliškai": {
        focus: "suprantate",
        forms: ["suprantu", "supranta", "suprantame", "suprantate"],
        person: "you (polite or plural)",
      },
      "Jos nestudijuoja": {
        focus: "nestudijuoja",
        forms: [
          "nestudijuoju",
          "nestudijuoji",
          "nestudijuoja",
          "nestudijuojame",
        ],
        person: "he, she, or they",
      },
    },
  },
  "c1-possession": {
    kind: "owner",
    guide: {
      lead: "Choose the form for the owner, regardless of what is owned.",
      examples: [
        ["Tomas · his", "jo vardas"],
        ["Rasa · her", "jos vardas"],
        ["Tomas + Rasa · their", "jų butas"],
      ],
      recap:
        "Find the owner first; the owned thing does not change the pronoun.",
    },
    targets: {
      "Jo vardas Tomas": {
        focus: "Jo",
        forms: ["Jo", "Jos", "Mano", "Jų"],
        situation: "Lina introduces Tomas: “___ vardas Tomas.”",
        switchPrompt: "Tomas says “mano vardas.” Lina says “___ vardas.”",
      },
      "Jos vardas Rasa": {
        focus: "Jos",
        forms: ["Jo", "Jos", "Mano", "Jų"],
        situation: "Tomas introduces Rasa: “___ vardas Rasa.”",
        switchPrompt: "Rasa says “mano vardas.” Tomas says “___ vardas.”",
      },
      "Mūsų universitetas": {
        focus: "Mūsų",
        forms: ["Mano", "Tavo", "Mūsų", "Jų"],
        situation:
          "Two students talk about their shared university: “___ universitetas.”",
        switchPrompt:
          "One student says “mano universitetas.” Together they say “___ universitetas.”",
      },
      "Jūsų adresas": {
        focus: "Jūsų",
        forms: ["Tavo", "Jo", "Mūsų", "Jūsų"],
        situation: "You politely ask someone for their address: “___ adresas?”",
        switchPrompt: "To a friend: “tavo adresas.” To a guest: “___ adresas.”",
      },
      "Jų butas": {
        focus: "Jų",
        forms: ["Jo", "Jos", "Mūsų", "Jų"],
        situation:
          "Lina talks about Tomas and Rasa’s shared flat: “___ butas.”",
        switchPrompt:
          "About Tomas: “jo butas.” About Tomas and Rasa: “___ butas.”",
      },
      "Kokia tavo pavardė?": {
        focus: "tavo",
        forms: ["mano", "tavo", "jo", "jūsų"],
        situation: "You ask one friend for their surname: “Kokia ___ pavardė?”",
        switchPrompt:
          "To a guest: “Kokia jūsų pavardė?” To a friend: “Kokia ___ pavardė?”",
      },
    },
  },
  "c2-with-without-forms": {
    kind: "ingredients",
    guide: {
      lead: "With and without need different noun forms. The preposition tells you which form to use.",
      examples: [
        ["su · with", "su sūriu"],
        ["be · without", "be sūrio"],
      ],
      recap: "Check su or be before choosing the ingredient form.",
    },
    targets: {
      "Salotos su sūriu": {
        focus: "sūriu",
        forms: ["sūris", "sūrio", "sūrį", "sūriu"],
      },
      "Salotos be sūrio": {
        focus: "sūrio",
        forms: ["sūris", "sūrio", "sūrį", "sūriu"],
      },
      "Sriuba su žuvimi": {
        focus: "žuvimi",
        forms: ["žuvis", "žuvies", "žuvį", "žuvimi"],
      },
      "Sriuba su morkomis": {
        focus: "morkomis",
        forms: ["morkos", "morkų", "morkas", "morkomis"],
      },
      "Vištiena su bulvėmis": {
        focus: "bulvėmis",
        forms: ["bulvės", "bulvių", "bulves", "bulvėmis"],
      },
      "Vištiena be bulvių": {
        focus: "bulvių",
        forms: ["bulvės", "bulvių", "bulves", "bulvėmis"],
      },
    },
  },
};

const ownerMeanings = {
  mano: "my",
  tavo: "your (one familiar person)",
  jo: "his",
  jos: "her",
  mūsų: "our",
  jūsų: "your (polite or plural)",
  jų: "their",
};
const verbPeople = ["I", "we", "you (polite or plural)", "he, she, or they"];

export function teachingGuideFor(lessonId) {
  return pilots[lessonId]?.guide || null;
}

export function teachingPilotFor(lessonId, item) {
  if (item.role !== "core") return null;
  const lesson = pilots[lessonId];
  const target = lesson?.targets[item.lt];
  return target ? { kind: lesson.kind, ...target } : null;
}

export function teachingRecognition(item) {
  const teaching = item.teaching;
  if (teaching.kind === "verb")
    return {
      prompt: `Who does “${teaching.focus}” describe?`,
      answer: teaching.person,
      options: verbPeople,
      answerLanguage: "en",
    };
  if (teaching.kind === "owner")
    return {
      prompt: teaching.situation,
      answer: teaching.focus,
      options: teaching.forms,
      answerLanguage: "lt",
    };
  const preposition = item.lt.includes(" su ") ? "su" : "be";
  return {
    prompt: `Which word goes with “${teaching.focus}”?`,
    answer: preposition === "su" ? "su · with" : "be · without",
    options: ["su · with", "be · without"],
    answerLanguage: "en",
  };
}

export function teachingExplanation(item) {
  const { kind, focus, person } = item.teaching;
  if (kind === "verb") {
    const subject = item.lt.split(" ")[0].toLowerCase();
    return `The subject is ${subject} (${person}). Here the verb takes ${focus}.`;
  }
  if (kind === "owner")
    return `${focus} means ${ownerMeanings[focus.toLowerCase()]}. Choose the form for the owner.`;
  const preposition = item.lt.includes(" su ") ? "Su" : "Be";
  const grammaticalCase = preposition === "Su" ? "instrumental" : "genitive";
  return `${preposition} takes ${grammaticalCase}. Here the ingredient form is ${focus}.`;
}
