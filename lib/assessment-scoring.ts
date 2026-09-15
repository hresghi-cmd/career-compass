export type TalentKey = "spark" | "insight" | "connect" | "care" | "order" | "venture";

export const REPORT_VERSION = "career-report-v1";

const talentOrder: TalentKey[] = ["spark", "insight", "connect", "care", "order", "venture"];

const questionTalents: Array<readonly [TalentKey, TalentKey]> = [
  ["insight", "venture"],
  ["spark", "order"],
  ["insight", "connect"],
  ["insight", "care"],
  ["order", "venture"],
  ["spark", "connect"],
  ["spark", "care"],
  ["care", "venture"],
  ["spark", "order"],
  ["insight", "venture"],
  ["care", "connect"],
  ["spark", "order"],
  ["connect", "venture"],
  ["order", "connect"],
  ["insight", "venture"],
  ["spark", "care"],
  ["insight", "connect"],
  ["order", "care"],
];

export type AssessmentReport = {
  scores: Record<TalentKey, number>;
  primaryTalent: TalentKey;
  secondaryTalent: TalentKey;
  reportVersion: string;
};

export function isTalentKey(value: unknown): value is TalentKey {
  return typeof value === "string" && talentOrder.includes(value as TalentKey);
}

export function calculateAssessmentReport(answers: number[]): AssessmentReport {
  const scores = Object.fromEntries(talentOrder.map((key) => [key, 0])) as Record<TalentKey, number>;

  answers.forEach((position, questionIndex) => {
    const pair = questionTalents[questionIndex];
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

export function rankAssessmentScores(scores: Record<TalentKey, number>) {
  const max = Math.max(...Object.values(scores), 1);
  return talentOrder
    .map((key, order) => ({ key, raw: scores[key], percent: Math.round((scores[key] / max) * 100), order }))
    .sort((a, b) => b.raw - a.raw || a.order - b.order)
    .map(({ key, raw, percent }) => ({ key, raw, percent }));
}
