// Shared limits for retrieval practice and evidence of later recall.
export const RECALL_POLICY = Object.freeze({
  batchSize: 5,
  goal: 2,
  maxFailures: 3,
  maxTurns: 7,
  maxSessionTurns: 35,
  spacing: 2,
});
const day = (time) => {
  const d = new Date(time);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
};
export function isLaterRecallVisit(previous, at) {
  return (
    previous == null ||
    (day(previous) !== day(at) && at - previous >= 4 * 3600000)
  );
}
export function familiarity(record) {
  if (!record || record.level === 0 || record.recentErrors >= 2) return 0;
  if (record.recallVisits >= 2 && record.independentRun >= 2) return 4;
  if (record.independentRun >= 1) return 3;
  if (record.level < 3) return 1;
  return 2;
}
export const familiarityLabels = [
  "Needs support",
  "Recognizing",
  "Building recall",
  "Recalled unaided",
  "Remembered later",
];
