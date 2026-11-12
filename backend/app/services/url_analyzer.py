
import re
import ipaddress
from urllib.parse import urlparse, unquote


SUSPICIOUS_TLDS = {
    "buzz", "top", "xyz", "click", "shop", "work",
    "monster", "country", "gq", "tk", "ml", "cf"
}

SHORTENERS = {
    "bit.ly", "tinyurl.com", "t.co", "is.gd",
    "cutt.ly", "rb.gy", "shorturl.at"
}

SUSPICIOUS_WORDS = {
    "login", "verify", "verification", "claim",
    "reward", "prize", "bonus", "free",
    "payment", "wallet", "kyc", "bank",
    "gift", "winner", "cash", "offer",
    "referral", "invite"
}


def analyze_url(url: str) -> dict:
    """
    Static URL analysis.
    Does not visit the destination or verify live reputation.
    """

    if not url or not isinstance(url, str):
        return {
            "success": False,
            "risk_score": 0,
            "risk_level": "LOW",
            "url": url,
            "domain": None,
            "detected_threats": [],
            "checks": [],
            "recommendations": ["Provide a valid URL."]
        }

    url = url.strip()

    if not re.match(r"^https?://", url, re.IGNORECASE):
        url = "https://" + url

    try:
        parsed = urlparse(url)
        domain = (parsed.hostname or "").lower().rstrip(".")
    except Exception:
        domain = ""

    if not domain:
        return {
            "success": False,
            "risk_score": 0,
            "risk_level": "LOW",
            "url": url,
            "domain": None,
            "detected_threats": ["Invalid URL structure"],
            "checks": [],
            "recommendations": ["Do not open malformed links."]
        }

    indicators = []

    def add_threat(name: str, points: int):
        indicators.append({
            "name": name,
            "score": points,
            "status": "suspicious"
        })

    # 1. Suspicious TLD
    tld = domain.split(".")[-1]

    if tld in SUSPICIOUS_TLDS:
        add_threat(f"Suspicious domain extension: .{tld}", 20)

    # 2. IP address
    try:
        ipaddress.ip_address(domain)
        add_threat("URL uses an IP address instead of a domain", 30)
    except ValueError:
        pass

    # 3. Punycode
    if "xn--" in domain:
        add_threat("Punycode domain detected", 25)

    # 4. Embedded credentials
    if parsed.username or parsed.password:
        add_threat("URL contains embedded credentials", 35)

    # 5. HTTP
    if parsed.scheme.lower() == "http":
        add_threat("URL does not use HTTPS", 10)

    # 6. Shortener
    if domain in SHORTENERS:
        add_threat("URL uses a link-shortening service", 15)

    # 7. Deep subdomains
    labels = domain.split(".")

    if len(labels) >= 4:
        add_threat("Unusually deep subdomain structure", 15)

    # 8. Random-looking domain
    main_domain = labels[-2] if len(labels) >= 2 else labels[0]

    if len(main_domain) >= 12:
        vowels = sum(c in "aeiou" for c in main_domain)

        if vowels / len(main_domain) < 0.20:
            add_threat("Unusual random-looking domain pattern", 20)

    if re.search(r"\d{5,}", main_domain):
        add_threat("Unusually long numeric sequence in domain", 15)

    # 9. Suspicious path and query
    full_path = unquote(
        (parsed.path or "") + " " + (parsed.query or "")
    ).lower()

    matched_words = sorted(
        word for word in SUSPICIOUS_WORDS
        if re.search(rf"\b{re.escape(word)}\b", full_path)
    )

    if matched_words:
        add_threat(
            "Suspicious URL terms: " + ", ".join(matched_words),
            min(25, len(matched_words) * 10)
        )

    # 10. Long URL
    if len(url) > 200:
        add_threat("Unusually long URL", 10)

    # 11. Encoded characters
    if re.search(r"%[0-9a-fA-F]{2}", url):
        add_threat("Encoded URL characters detected", 10)

    # 12. Redirect parameters
    redirect_params = {
        "redirect", "redirect_url", "return_url",
        "next", "continue", "url"
    }

    query_keys = {
        key.lower()
        for key in re.findall(r"(?:^|&) ([^=&]+)=", parsed.query)
    }

    if not query_keys:
        query_keys = {
            key.lower()
            for key in re.findall(r"(?:^|&)([^=&]+)=", parsed.query)
        }

    if redirect_params.intersection(query_keys):
        add_threat("Possible external redirect parameter", 20)

    # Unified URL risk calculation
    indicator_count = len(indicators)

    if indicator_count == 0:
        url_risk = 0
    else:
        url_risk = min(
            100,
            45 + max(0, indicator_count - 1) * 15
        )

    # URL receives 80% weight in URL-only assessment
    score = round(url_risk * 0.80)

    # Classification
    if score >= 70:
        risk_level = "HIGH"
    elif score >= 30:
        risk_level = "MEDIUM"
    else:
        risk_level = "LOW"

    if risk_level == "HIGH":
        recommendations = [
            "Avoid opening this link.",
            "Never enter passwords, OTPs or banking details.",
            "Verify the domain through an official channel."
        ]
    elif risk_level == "MEDIUM":
        recommendations = [
            "Treat this link with caution.",
            "Verify the domain independently.",
            "Avoid entering sensitive information."
        ]
    else:
        recommendations = [
            "No strong suspicious URL indicators were detected.",
            "A low score does not guarantee that the URL is safe."
        ]

    return {
        "success": True,
        "url": url,
        "domain": domain,
        "risk_score": score,
        "risk_level": risk_level,
        "detected_threats": [
            item["name"] for item in indicators
        ],
        "checks": indicators,
        "recommendations": recommendations,
        "analysis_type": "Static URL Analysis",
        "disclaimer": (
            "This analysis checks URL structure and patterns. "
            "It does not verify live domain reputation or guarantee safety."
        )
    }
