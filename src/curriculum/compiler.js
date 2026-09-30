const kinds = new Set([
  "model",
  "choice",
  "type",
  "gap",
  "gap-type",
  "bank",
  "chat",
  "chat-choice",
  "chat-bank",
  "reading",
  "match",
  "edit",
  "writing",
  "map",
]);
const requireValue = (condition, message) => {
  if (!condition) throw new Error(message);
};

export function validateExercise(q) {
  const label = `Exercise ${q.id || "without id"}`;
  requireValue(
    typeof q.id === "string" && kinds.has(q.kind),
    `${label}: invalid id or kind`,
  );
  if (q.kind === "model") {
    requireValue(
      q.title && q.pairs?.length && Array.isArray(q.targets),
      `${label}: model needs title, pairs and targets`,
    );
    return q;
  }
  requireValue(
    q.target && q.instruction,
    `${label}: target and instruction required`,
  );
  if (q.kind === "match") {
    requireValue(
      q.pairs?.length >= 2,
      `${label}: matching needs at least two pairs`,
    );
    requireValue(
      !q.pairTargets || q.pairTargets.length === q.pairs.length,
      `${label}: pair target count`,
    );
  } else if (q.kind === "writing") {
    requireValue(
      q.sample && q.checklist?.length,
      `${label}: writing needs an example and checklist`,
    );
  } else {
    requireValue(
      q.answers?.length &&
        q.answers.every((a) => typeof a === "string" && a.trim()),
      `${label}: accepted answers required`,
    );
    if (q.options) {
      requireValue(
        q.options.length >= 2 &&
          new Set(q.options).size === q.options.length &&
          q.options.every((a) => typeof a === "string" && a.trim()),
        `${label}: invalid options`,
      );
      requireValue(
        q.answers.some((a) => q.options.includes(a)),
        `${label}: no accepted option`,
      );
    }
    if (["gap", "gap-type"].includes(q.kind))
      requireValue(
        q.source?.split("___").length === 2,
        `${label}: exactly one gap required`,
      );
    if (["bank", "chat-bank"].includes(q.kind))
      requireValue(q.words?.length, `${label}: sentence tiles required`);
    if (q.kind === "edit")
      requireValue(
        q.tokens?.length &&
          q.replacements?.length === q.tokens.length &&
          Number.isInteger(q.editIndex),
        `${label}: invalid edit task`,
      );
  }
  return q;
}

export function compileCourses(definitions) {
  const declarations = new Map(),
    chapterNumbers = new Set();
  for (const course of definitions) {
    requireValue(
      course.schemaVersion === 1 &&
        Number.isInteger(course.number) &&
        course.number >= 1 &&
        course.number <= 10 &&
        !chapterNumbers.has(course.number),
      "Invalid or duplicate chapter",
    );
    requireValue(
      Array.isArray(course.lessons) && course.lessons.length,
      "Chapter requires lessons",
    );
    chapterNumbers.add(course.number);
    const lessons = new Set();
    for (const lesson of course.lessons) {
      requireValue(
        lesson.id && lesson.title && !lessons.has(lesson.id),
        `Chapter ${course.number}: invalid or duplicate lesson ${lesson.id}`,
      );
      lessons.add(lesson.id);
      for (const q of lesson.steps) {
        requireValue(
          q.id && !declarations.has(q.id),
          `Duplicate exercise ${q.id}`,
        );
        declarations.set(q.id, q);
      }
    }
  }
  function resolve(q, visiting = new Set()) {
    if (!q.repeat) return validateExercise(structuredClone(q));
    requireValue(!visiting.has(q.id), `Cyclic return ${q.id}`);
    const base = declarations.get(q.repeat);
    requireValue(base, `Missing return target ${q.repeat} in ${q.id}`);
    const next = new Set([...visiting, q.id]);
    const result = { ...resolve(base, next) };
    for (const [key, value] of Object.entries(q)) {
      if (key === "repeat") continue;
      if (value === null) delete result[key];
      else result[key] = structuredClone(value);
    }
    return validateExercise(result);
  }
  for (const course of definitions)
    for (const dependency of course.dependencies || [])
      requireValue(
        chapterNumbers.has(dependency),
        `Missing chapter dependency ${dependency}`,
      );
  const compiled = definitions.map((definition) => {
    const { schemaVersion, dependencies, ...course } =
      structuredClone(definition);
    const compileLesson = (lesson) => ({
      ...lesson,
      steps: lesson.steps.map((q) => resolve(q)),
      ...(lesson.variants
        ? {
            variants: lesson.variants.map((steps) =>
              steps.map((q) => resolve(q)),
            ),
          }
        : {}),
    });
    course.lessons = course.lessons.map(compileLesson);
    course.key = `chapter-${course.number}`;
    course.stepsFor = (lesson, variant = 0) =>
      lesson.variants?.[variant % lesson.variants.length] || lesson.steps;
    course.assessmentSteps = course.lessons.flatMap(
      (l) => l.variants?.flat() || [],
    );
    return course;
  });
  const definitionByNumber = new Map(
    definitions.map((definition) => [definition.number, definition]),
  );
  for (const course of compiled) {
    const relevant = new Set();
    const visit = (number) => {
      if (relevant.has(number)) return;
      relevant.add(number);
      const definition = definitionByNumber.get(number);
      for (const dependency of definition?.dependencies || []) visit(dependency);
    };
    visit(course.number);
    course.reference = compiled
      .filter((item) => relevant.has(item.number))
      .flatMap((item) =>
        item.lessons.flatMap((lesson) =>
          lesson.steps
            .filter((q) => q.kind === "model")
            .flatMap((q) =>
              q.pairs.map(([lt, en]) => ({ target: q.id, lt, en })),
            ),
        ),
      );
  }
  return compiled;
}
