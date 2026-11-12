
import re
from typing import Any


# SAFETRACE - Rule-Based Fraud Detection Engine

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
            r"\b(pay|transfer|send)\b.{0,40}\b(money|amount|rupees|rs\.?|inr)\b",
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
        "category": "Suspicious Link",
        "patterns": [
            r"https?://[^\s]+",
            r"\b(bit\.ly|tinyurl\.com|t\.co|cutt\.ly|rb\.gy)/\S+",
        ],
        "weight": 20,
        "description": "Message contains a link that should be verified before opening.",
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


def analyze_message(message: str) -> dict[str, Any]:
    """
    Analyze text for common fraud and scam indicators.
    Returns a risk score, detected threats, and recommendations.
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
    total_weight = 0

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
            total_weight += rule["weight"]

    # Multiple independent indicators increase the risk score.
    risk_score = min(total_weight, 100)

    if risk_score >= 60:
        risk_level = "HIGH"
    elif risk_score >= 25:
        risk_level = "MEDIUM"
    else:
        risk_level = "LOW"

    recommendations = []

    if risk_level == "HIGH":
        recommendations.extend([
            "Do not click suspicious links.",
            "Never share OTP, PIN, passwords, or banking details.",
            "Do not transfer money without independent verification.",
            "Verify the sender through an official communication channel.",
        ])
    elif risk_level == "MEDIUM":
        recommendations.extend([
            "Verify the sender's identity before taking action.",
            "Avoid sharing personal or financial information.",
            "Check links independently before opening them.",
        ])
    else:
        recommendations.extend([
            "No strong fraud indicators were detected by these rules.",
            "Still verify unexpected requests before taking action.",
        ])

    return {
        "success": True,
        "risk_score": risk_score,
        "risk_level": risk_level,
        "detected_threats": detected_threats,
        "recommendations": recommendations,
        "message": (
            "Potential fraud indicators detected."
            if detected_threats
            else "No known fraud indicators detected."
        ),
    }


# Backward-compatible function alias.
def analyze_text(message: str) -> dict[str, Any]:
    return analyze_message(message)
