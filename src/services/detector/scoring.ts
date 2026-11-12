
export interface RiskResult {
  score: number;
  level: "LOW RISK" | "CAUTION" | "HIGH RISK";
}

export function calculateRiskScore(
  textScore: number,
  urlRisk: number,
): RiskResult {
  const safeTextScore = Number.isFinite(textScore)
    ? Math.min(100, Math.max(0, textScore))
    : 0;

  const safeUrlRisk = Number.isFinite(urlRisk)
    ? Math.min(100, Math.max(0, urlRisk))
    : 0;

  // Combined risk score: URL receives higher weight
  const combinedScore = Math.round(
    safeTextScore * 0.2 + safeUrlRisk * 0.8,
  );

  let score = combinedScore;

  // Strong URL evidence
  if (safeUrlRisk >= 75) {
    score = Math.max(score, 70);
  }

  // Strong message + URL evidence
  if (safeUrlRisk >= 60 && safeTextScore >= 60) {
    score = Math.max(score, 70);
  }

  // Very high message risk
  if (safeTextScore >= 85) {
    score = Math.max(score, 70);
  }

  score = Math.min(100, Math.max(0, score));

  const level =
    score >= 70
      ? "HIGH RISK"
      : score >= 30
        ? "CAUTION"
        : "LOW RISK";

  return {
    score,
    level,
  };
}
