
import re
from typing import Any

from app.services.url_analyzer import analyze_url


SCAM_RULES = [
    {
        "category": "Urgency or Threat",
        "patterns": [
            r"\b(account|bank account|card)\b.{0,50}\b(blocked|suspended|deactivated)\b",
            r"\b(immediately|urgent|urgently|right now|within \d+ minutes)\b",
            r"\b(legal action|arrest warrant|police case)\b",
            r"\b(last warning|final warning|act now)\b",
        ],
        "weight": 20,
        "description": "Message uses urgency, threats, or pressure tactics.",
    },
    {
        "category": "OTP or Credential Theft",
        "patterns": [
            r"\b(share|send|tell|provide|enter)\b.{0,30}\b(otp|one.time password|pin|password)\b",
            r"\b(otp|verification code)\b.{0,40}\b(share|send|forward)\b",
            r"\b(login credentials|internet banking password)\b",
        ],
        "weight": 35,
        "description": "Message may be attempting to steal confidential credentials.",
    },
    {
        "category": "Suspicious Payment Request",
        "patterns": [
            r"\b(pay|transfer|send)\b.{0,40}\b(money|amount|rupees|inr)\b",
            r"\b(scan|send)\b.{0,30}\b(qr code|qr)\b",
            r"\b(upi id|payment link|bank transfer)\b",
            r"\b(refund fee|processing fee|advance payment)\b",
        ],
        "weight": 25,
        "description": "Message contains potentially suspicious payment instructions.",
    },
    {
        "category": "Prize or Reward Scam",
        "patterns": [
            r"\b(you have won|you are winner|congratulations)\b",
            r"\b(lottery|jackpot|lucky draw|cash prize)\b",
            r"\b(claim your prize|free reward|gift voucher)\b",
        ],
        "weight": 25,
        "description": "Message may be using fake prizes or rewards to attract victims.",
    },
    {
        "category": "Identity Impersonation",
        "patterns": [
            r"\b(pretending to be|on behalf of|i am from)\b.{0,40}\b(bank|police|government|support|customer care)\b",
            r"\b(kyc update|verify your aadhaar|pan card update)\b",
            r"\b(bank official|government officer|customer support)\b",
        ],
        "weight": 20,
        "description": "Message may be impersonating an organization or authority.",
    },
    {
        "category": "Job or Investment Scam",
        "patterns": [
            r"\b(guaranteed returns|double your money|risk.free investment)\b",
            r"\b(earn \d+.*per day|work from home.*easy money)\b",
            r"\b(registration fee|joining fee|training fee)\b",
            r"\b(no experience required.*high salary)\b",
        ],
        "weight": 25,
        "description": "Message contains suspicious job or investment claims.",
    },
    {
        "category": "Personal Information Request",
        "patterns": [
            r"\b(send|share|provide)\b.{0,40}\b(aadhaar|pan card|date of birth|bank details)\b",
            r"\b(card number|cvv|account number)\b",
            r"\b(personal details|sensitive information)\b",
        ],
        "weight": 30,
        "description": "Message requests potentially sensitive personal information.",
    },
]


URL_PATTERN = re.compile(
    r"https?://[^\s<>'\"]+|www\.[^\s<>'\"]+|"
    r"(?:[a-zA-Z0-9-]+\.)+"
    r"(?:com|in|net|org|buzz|xyz|top|click|work|shop|online|info)"
    r"(?:/[^\s<>'\"]*)?",
    re.IGNORECASE,
)


def extract_urls(message: str) -> list[str]:
    matches = URL_PATTERN.findall(message)

    return list(dict.fromkeys(
        url.rstrip("),.!?;:")
        for url in matches
    ))


def analyze_message(message: str) -> dict[str, Any]:
    """
    Unified rule-based message and URL analysis.
    URL analysis is static; live reputation is not verified.
    """

    if not isinstance(message, str) or not message.strip():
        return {
            "success": False,
            "risk_score": 0,
            "risk_level": "LOW",
            "detected_threats": [],
            "recommendations": ["Enter a message to analyze."],
            "message": "No message provided.",
        }

    text = message.lower().strip()

    detected_threats = []
    total_text_weight = 0

    # 1. Message text analysis
    for rule in SCAM_RULES:
        matched = any(
            re.search(pattern, text, re.IGNORECASE)
            for pattern in rule["patterns"]
        )

        if matched:
            detected_threats.append({
                "category": rule["category"],
                "description": rule["description"],
                "weight": rule["weight"],
            })

            total_text_weight += rule["weight"]

    text_score = min(total_text_weight, 100)

    # 2. URL extraction and investigation
    urls = extract_urls(message)
    url_results = []

    for url in urls:
        result = analyze_url(url)

        if result.get("success"):
            url_results.append(result)

            for threat in result.get("detected_threats", []):
                detected_threats.append({
                    "category": "URL Threat Intelligence",
                    "description": threat,
                    "weight": 0,
                })

    # 3. Calculate URL risk using the same indicator logic
    url_indicator_count = sum(
        len(result.get("checks", []))
        for result in url_results
    )

    if url_indicator_count > 0:
        url_risk = min(
            100,
            45 + max(0, url_indicator_count - 1) * 15
        )
    elif urls:
        url_risk = 10
    else:
        url_risk = 0

    # 4. Unified risk score
    risk_score = round(
        text_score * 0.20 + url_risk * 0.80
    )

    # Strong URL or message evidence
    if url_risk >= 75:
        risk_score = max(risk_score, 70)

    if url_risk >= 60 and text_score >= 60:
        risk_score = max(risk_score, 70)

    if text_score >= 85:
        risk_score = max(risk_score, 70)

    risk_score = min(100, risk_score)

    # 5. Risk classification
    if risk_score >= 70:
        risk_level = "HIGH"
    elif risk_score >= 30:
        risk_level = "MEDIUM"
    else:
        risk_level = "LOW"

    # 6. Recommendations
    recommendations = []

    if risk_level == "HIGH":
        recommendations.extend([
            "Avoid opening suspicious links.",
            "Never share OTPs, PINs, passwords, or banking details.",
            "Do not transfer money without independent verification.",
            "Verify the sender through an official communication channel.",
        ])
    elif risk_level == "MEDIUM":
        recommendations.extend([
            "Verify the sender's identity before taking action.",
            "Avoid sharing personal or financial information.",
            "Check suspicious links independently.",
        ])
    else:
        recommendations.extend([
            "No strong configured fraud indicators were detected.",
            "A low risk score does not guarantee that a message or URL is safe.",
        ])

    # Include URL-specific recommendations
    for result in url_results:
        recommendations.extend(result.get("recommendations", []))

    recommendations = list(dict.fromkeys(recommendations))

    return {
        "success": True,
        "risk_score": risk_score,
        "risk_level": risk_level,
        "detected_threats": detected_threats,
        "recommendations": recommendations,
        "detected_urls": urls,
        "suspicious_urls": [
            result["url"]
            for result in url_results
            if result.get("detected_threats")
        ],
        "url_analysis": url_results,
        "analysis_type": "Unified Static Message and URL Analysis",
        "message": (
            "Potential fraud indicators detected."
            if detected_threats
            else "No known fraud indicators detected."
        ),
    }


# Backward-compatible function alias
def analyze_text(message: str) -> dict[str, Any]:
    return analyze_message(message)
