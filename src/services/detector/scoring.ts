
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

  // Combine message and URL risk independently.
  const combinedScore = Math.round(
    safeTextScore * 0.5 + safeUrlRisk * 0.5,
  );

  // Strong URL evidence must not be hidden by a low message score.
  const score =
    safeUrlRisk >= 60
      ? Math.max(60, combinedScore)
      : combinedScore;

  const level =
    score >= 60
      ? "HIGH RISK"
      : score >= 30
        ? "CAUTION"
        : "LOW RISK";

  return {
    score: Math.min(100, score),
    level,
  };
}
