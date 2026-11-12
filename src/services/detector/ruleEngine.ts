
import { analyzeText } from "./textAnalyzer";
import { analyzeUrls } from "./urlAnalyzer";
import { calculateRiskScore } from "./scoring";

export interface DetectionResult {
  score: number;
  level: "LOW RISK" | "CAUTION" | "HIGH RISK";
  reasonsEn: string[];
  reasonsHi: string[];
  detectedUrls: string[];
  suspiciousUrls: string[];
}

export function analyzeMessage(text: string): DetectionResult {
  const textResult = analyzeText(text);
  const urlResult = analyzeUrls(text);

  const matchedRules = new Set(textResult.matchedRuleIds);

  const hasUrl = urlResult.urls.length > 0;
  const hasAccountThreat =
    matchedRules.has("account_threat") ||
    matchedRules.has("account_threat_hi");

  const hasUrgency =
    matchedRules.has("urgency") ||
    matchedRules.has("urgency_hi");

  const hasPrizeClaim = matchedRules.has("prize_scam");
  const hasPaymentPressure = matchedRules.has("payment_pressure");

  const credentialDetected =
    matchedRules.has("credential_request") ||
    matchedRules.has("credential_request_hi");

  let contextBonus = 0;

  const reasonsEn = [
    ...textResult.reasonsEn,
    ...urlResult.reasonsEn,
  ];

  const reasonsHi = [
    ...textResult.reasonsHi,
    ...urlResult.reasonsHi,
  ];

  // Message context analysis

  if (hasAccountThreat && hasUrgency && credentialDetected) {
    contextBonus += 30;

    reasonsEn.push(
      "An account threat, urgency, and a request for sensitive credentials appear together. Never share OTPs or passwords.",
    );

    reasonsHi.push(
      "Account block ki warning, jaldi action ka pressure aur OTP/password ki demand ek saath hain. OTP ya password share na karein.",
    );
  }

  if (hasAccountThreat && hasUrgency && hasUrl) {
    contextBonus += 25;

    reasonsEn.push(
      "An account threat, urgency, and a link appear together. Verify through the official channel.",
    );

    reasonsHi.push(
      "Account warning, jaldi action ka pressure aur link ek saath hain. Official channel se verify karein.",
    );
  } else if (hasAccountThreat && hasUrl) {
    contextBonus += 15;

    reasonsEn.push(
      "An account-related warning includes a link. Verify it independently.",
    );

    reasonsHi.push(
      "Account warning ke saath link hai. Ise independently verify karein.",
    );
  }

  if (hasPrizeClaim && hasPaymentPressure) {
    contextBonus += 20;

    reasonsEn.push(
      "A prize or reward claim is combined with a payment request.",
    );

    reasonsHi.push(
      "Prize ya reward ke claim ke saath payment maangi ja rahi hai.",
    );
  }

  if (
    hasPrizeClaim &&
    hasPaymentPressure &&
    hasUrgency &&
    hasUrl
  ) {
    contextBonus += 15;

    reasonsEn.push(
      "Prize, payment pressure, urgency, and a link appear together.",
    );

    reasonsHi.push(
      "Prize, payment pressure, urgency aur link ek saath hain.",
    );
  }

  if (credentialDetected && hasUrl) {
    contextBonus += 15;

    reasonsEn.push(
      "A message requesting sensitive credentials also contains a link.",
    );

    reasonsHi.push(
      "Sensitive details maangne wali message mein link bhi hai.",
    );
  }

  // Independent URL risk calculation

  const urlIndicatorCount = urlResult.reasonsEn.length;

  let urlRisk = 0;

  if (urlResult.suspiciousUrls.length > 0) {
    // One indicator: moderate concern.
    // Multiple independent indicators: high concern.
    urlRisk = Math.min(
      100,
      45 + Math.max(0, urlIndicatorCount - 1) * 15,
    );
  } else if (hasUrl) {
    urlRisk = 10;
  }

  // Final risk calculation

  const adjustedTextScore = Math.min(
    100,
    textResult.score + contextBonus,
  );

  const risk = calculateRiskScore(
    adjustedTextScore,
    urlRisk,
  );

  if (urlResult.suspiciousUrls.length > 0) {
    reasonsEn.push(
      `URL investigation detected ${urlIndicatorCount} suspicious indicator(s).`,
    );

    reasonsHi.push(
      `URL investigation mein ${urlIndicatorCount} suspicious indicator(s) mile.`,
    );
  }

  if (reasonsEn.length === 0) {
    reasonsEn.push(
      "No configured suspicious pattern was found. This does not guarantee the message is safe.",
    );

    reasonsHi.push(
      "Koi configured suspicious pattern nahi mila. Iska matlab message guaranteed safe nahi hai.",
    );
  }

  return {
    score: risk.score,
    level: risk.level,
    reasonsEn: [...new Set(reasonsEn)],
    reasonsHi: [...new Set(reasonsHi)],
    detectedUrls: urlResult.urls,
    suspiciousUrls: urlResult.suspiciousUrls,
  };
}
