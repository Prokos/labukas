// Source functions and the specific evidence sampled in the revised course.
// This is a teaching contract, not a proficiency scale or a mastery aggregate.
export const chapterThreeOutcomes = [
  {
    key: "destinations",
    pages: "67, 75",
    goal: "Give a destination with į and an appropriate noun form.",
    models: ["destination-model", "more-destinations-model"],
    checks: [
      "a-c3-route-destination-mix",
      "a-c3-transfer-cafe-destination",
      "a-c3-transfer-station-destination",
      "a-c3-mixed-0",
    ],
  },
  {
    key: "people",
    pages: "67, 75–76",
    goal: "Use pas for visiting a person, including a named person.",
    models: ["visit-person-model", "visit-names-model"],
    checks: ["a-c3-transfer-places-1", "a-c3-transfer-rasa-visit"],
  },
  {
    key: "meeting-locations",
    pages: "67, 74",
    goal: "Distinguish inside a building from beside it.",
    models: ["meeting-model", "cafe-location-model", "inside-places-model"],
    checks: [
      "a-c3-route-meeting-mix",
      "a-c3-transfer-places-0",
      "a-c3-transfer-places-3",
      "a-c3-transfer-station-location",
    ],
  },
  {
    key: "directions",
    pages: "66–67, 70, 80–81",
    goal: "Follow a turn, locate it at a landmark, and give an endpoint.",
    models: ["directions-model", "route-model"],
    checks: [
      "a-c3-transfer-frequency-2",
      "a-c3-transfer-station-turn",
      "a-c3-transfer-endpoint-station",
    ],
    applications: ["a-c3-map-right", "a-c3-map-straight", "a-c3-map-left"],
  },
  {
    key: "person",
    pages: "66, 70, 81",
    goal: "Use the person form of eiti and važiuoti, including polite you.",
    models: [
      "who-model",
      "more-people-model",
      "polite-walk-model",
      "ride-person-model",
      "ride-you-model",
    ],
    checks: [
      "a-c3-route-person-mix",
      "a-c3-transfer-places-2",
      "a-c3-transfer-travel-3",
      "a-c3-transfer-we-train",
      "a-c3-transfer-polite-bus",
    ],
  },
  {
    key: "days",
    pages: "68, 76–78",
    goal: "Give the day of a meeting using the when form.",
    models: ["days-model"],
    checks: ["a-c3-route-day-mix", "a-c3-transfer-times-2", "a-c3-mixed-1"],
  },
  {
    key: "clock",
    pages: "69, 77–78",
    goal: "Interpret full and half hours, including the next-hour convention.",
    models: ["hours-model", "half-hour-model"],
    checks: [
      "a-c3-route-time-mix",
      "a-c3-transfer-times-0",
      "a-c3-transfer-times-1",
      "a-c3-mixed-3",
    ],
  },
  {
    key: "transport",
    pages: "69–70, 79",
    goal: "Distinguish walking from vehicle travel and use the means-of-travel form.",
    models: ["travel-model", "walking-model", "bus-route-number-model"],
    checks: [
      "a-c3-route-bus-mix",
      "a-c3-transfer-travel-0",
      "a-c3-transfer-travel-1",
      "a-c3-transfer-travel-2",
      "a-c3-mixed-2",
    ],
  },
  {
    key: "frequency",
    pages: "73",
    goal: "Distinguish often, rarely and never, and pair never with a negative verb.",
    models: ["never-walk-model", "never-ride-model"],
    checks: ["a-c3-transfer-frequency-0", "a-c3-transfer-frequency-1"],
  },
  {
    key: "inviting",
    pages: "70, 78–79",
    goal: "Accept, decline, arrange and reschedule a meeting.",
    models: ["invitation-model", "meeting-questions", "reschedule-model"],
    applications: [
      "a-c3-route-arrange-accept",
      "a-c3-route-arrange-place",
      "a-c3-route-arrange-day",
      "a-c3-route-arrange-time",
      "a-c3-route-reschedule-decline",
      "a-c3-route-reschedule-accept",
      "a-c3-route-reschedule-time",
    ],
    limit:
      "Choice-based social responses; not evidence of spontaneous conversation.",
  },
  {
    key: "questions",
    pages: "80–81",
    goal: "Ask for a bus number, means of travel or walking route.",
    models: ["travel-questions-model"],
    applications: [
      "a-c3-route-which-bus-answer",
      "a-c3-route-walking-route-answer",
      "a-c3-route-by-what-recall",
      "a-c3-route-walking-route-recall",
      "a-c3-route-which-bus-recall",
    ],
    limit:
      "Later course returns currently repeat these prompts; new-context question production is not yet sampled.",
  },
  {
    key: "tickets",
    pages: "65, 70",
    goal: "Understand an inspector and ask to top up a ticket.",
    models: ["ticket-exchange-model"],
    applications: [
      "a-c3-route-show-ticket-turn",
      "a-c3-route-top-up-build",
      "a-c3-situation-transport-signs-q3",
    ],
    limit:
      "Practical chunks and supported comprehension; no claim of handling every ticket-purchase interaction.",
  },
  {
    key: "writing",
    pages: "79, 81",
    goal: "Write a meeting message with a day, time, place and journey information.",
    models: [],
    applications: ["a-c3-writing-draft"],
    limit:
      "Saved and self-reviewed; grammar and communicative success are not automatically assessed.",
  },
];
