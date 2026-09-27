// Display copy is separate from legacy item identity. Do not change source IDs
// merely to replace technical labels in the learner-facing prompts.
const ordinals = [
  "",
  "first",
  "second",
  "third",
  "fourth",
  "fifth",
  "sixth",
  "seventh",
  "eighth",
  "ninth",
  "tenth",
  "eleventh",
  "twelfth",
  "thirteenth",
  "fourteenth",
  "fifteenth",
  "sixteenth",
  "seventeenth",
  "eighteenth",
  "nineteenth",
  "twentieth",
];
const ordinal = (n) =>
  ordinals[n] ||
  (n === 30
    ? "thirtieth"
    : `${n < 30 ? "twenty" : "thirty"}-${ordinals[n % 10]}`);
const contextualEnglish = new Map([
  ["Penktas autobusas", "Bus number five"],
  ["Aštuntas troleibusas", "Trolleybus number eight"],
  ["Dvyliktas autobusas", "Bus number twelve"],
  ["Dvidešimt antras troleibusas", "Trolleybus number twenty-two"],
  ["Aš einu pas draugą", "I am going to see a friend (male)"],
  ["Einu pas draugę", "I am going to see a friend (female)"],
  ["Mes einame pas mokytoją", "We are going to see a teacher"],
  ["Kaip nuvažiuoti į oro uostą?", "How do I get to the airport?"],
]);
export function courseItem(item) {
  let en = contextualEnglish.get(item.lt) || item.en;
  const order = en.match(/^Ordinal (\d+) \(masculine\)$/);
  const date = en.match(/^Day (\d+) \(naming a date\)$/);
  if (order) en = `${ordinal(Number(order[1]))} (masculine)`;
  if (date) en = `The ${ordinal(Number(date[1]))} day`;
  en = en.replace(/ \(with metai\)$/, "");
  return {
    ...item,
    en,
    ...(item.lt === "vieneri metai"
      ? {
          alternatives: [
            ...new Set([...(item.alternatives || []), "vieni metai"]),
          ],
        }
      : {}),
  };
}
