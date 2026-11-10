import type {
  AppLanguage,
  DetectionResult,
  FormattedAnalysis,
} from "../../types";

export function formatDetectionResult(
  result: DetectionResult,
  language: AppLanguage,
): FormattedAnalysis {
  const isHindi = language === "hi";

  const title = isHindi
    ? result.level === "HIGH RISK"
      ? "Sambhavit Scam Detected"
      : result.level === "CAUTION"
        ? "Savdhaani Zaroori Hai"
        : "Koi Strong Scam Signal Nahi Mila"
    : result.level === "HIGH RISK"
      ? "Potential Scam Detected"
      : result.level === "CAUTION"
        ? "Proceed With Caution"
        : "No Strong Scam Signals Found";

  const recommendations = isHindi
    ? [
        "OTP, PIN, CVV ya password kisi ke saath share na karein.",
        "Unknown links par click karne se bachein.",
        "Payment karne se pehle official source se verify karein.",
        "Suspicious message ko report aur block karein.",
      ]
    : [
        "Never share OTP, PIN, CVV or passwords.",
        "Avoid clicking unknown or suspicious links.",
        "Verify payment requests through official channels.",
        "Report and block suspicious senders.",
      ];

  return {
    title,
    summary: isHindi
      ? `Is message ka risk score ${result.score}/100 hai.`
      : `This message has a risk score of ${result.score}/100.`,
    riskLabel: result.level,
    scoreLabel: `${result.score}/100`,
    reasons: isHindi ? result.reasonsHi : result.reasonsEn,
    recommendations,
    detectedUrls: result.detectedUrls,
  };
}