export const REPORT_VERSION = "career-report-v1";

const talentOrder = ["spark", "insight", "connect", "care", "order", "venture"];
const questionTalents = [
  ["insight", "venture"], ["spark", "order"], ["insight", "connect"],
  ["insight", "care"], ["order", "venture"], ["spark", "connect"],
  ["spark", "care"], ["care", "venture"], ["spark", "order"],
  ["insight", "venture"], ["care", "connect"], ["spark", "order"],
  ["connect", "venture"], ["order", "connect"], ["insight", "venture"],
  ["spark", "care"], ["insight", "connect"], ["order", "care"],
];

export function calculateAssessmentReport(answers) {
  const scores = Object.fromEntries(talentOrder.map((key) => [key, 0]));
  answers.forEach((position, index) => {
    const pair = questionTalents[index];
    if (!pair || !Number.isInteger(position) || position < 0 || position > 6) return;
    scores[pair[0]] += 6 - position;
    scores[pair[1]] += position;
  });
  const ranked = talentOrder
    .map((key, order) => ({ key, score: scores[key], order }))
    .sort((a, b) => b.score - a.score || a.order - b.order);
  return {
    scores,
    primaryTalent: ranked[0]?.key ?? "spark",
    secondaryTalent: ranked[1]?.key ?? "insight",
    reportVersion: REPORT_VERSION,
  };
}

