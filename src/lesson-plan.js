// Content declares revisions; scheduling and compatibility never inspect lesson IDs.
export function discoveryPlan(lesson) {
  const core = lesson.items.filter((item) => item.role === "core");
  const make = (revision = {}) => {
    const order = revision.order ?? core.map((_, n) => n);
    if (
      order.length !== core.length ||
      new Set(order).size !== core.length ||
      order.some((n) => !Number.isInteger(n) || n < 0 || n >= core.length)
    ) {
      throw new Error(`Invalid discovery order for ${lesson.id}`);
    }
    const size = revision.size ?? 3;
    if (!Number.isInteger(size) || size < 1 || size > 3)
      throw new Error("Discovery sets must have one to three targets");
    return Array.from({ length: Math.ceil(core.length / size) }, (_, n) => ({
      id: `${lesson.id}-discover-${revision.version ? revision.version + "-" : ""}${n}`,
      classId: lesson.id,
      chapter: lesson.chapter,
      phase: "discover",
      title: "Meet & use",
      items: order.slice(n * size, (n + 1) * size).map((index) => core[index]),
    }));
  };
  const previous = (lesson.discovery?.previous || []).flatMap(make);
  const current = make(lesson.discovery);
  const allIds = [...previous, ...current].map((step) => step.id);
  if (new Set(allIds).size !== allIds.length)
    throw new Error(
      `Discovery revisions must have unique versions for ${lesson.id}`,
    );
  return {
    current: current.map((step) => ({
      ...step,
      creditFrom: previous.map((old) => old.id),
    })),
    previous,
  };
}
export function inheritedTargets(passedSteps, step, historicalSteps) {
  const sources = new Set(step.creditFrom || []);
  return new Set(
    historicalSteps
      .filter((old) => sources.has(old.id) && passedSteps.has(old.id))
      .flatMap((old) => old.items.map((item) => item.id)),
  );
}
export function applyTeachingOrder(chapters) {
  for (const chapter of chapters) {
    chapter.lessons.forEach((lesson, n) => {
      lesson.assessmentPosition = n;
    });
    const remaining = [...chapter.lessons];
    for (const lesson of remaining) {
      if (
        lesson.teachBefore &&
        !remaining.some(
          (other) => other.key === lesson.teachBefore && other !== lesson,
        )
      ) {
        throw new Error(`Invalid teaching anchor for ${lesson.key}`);
      }
    }
    const ordered = [];
    while (remaining.length) {
      const next = remaining.findIndex(
        (lesson) =>
          !remaining.some((other) => other.teachBefore === lesson.key),
      );
      if (next < 0) throw new Error("Conflicting teaching order constraints");
      ordered.push(...remaining.splice(next, 1));
    }
    chapter.lessons = ordered;
  }
}
