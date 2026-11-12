
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
    Performs static URL risk analysis.
    Does not open the URL or contact the destination server.
    """

    if not url or not isinstance(url, str):
        return {
            "success": False,
            "risk_score": 0,
            "risk_level": "LOW",
            "url": url,
            "domain": None,
            "detected_threats": [],
            "recommendations": ["Provide a valid URL."]
        }

    url = url.strip()

    if not re.match(r"^https?://", url, re.IGNORECASE):
        url = "https://" + url

    try:
        parsed = urlparse(url)
        domain = (parsed.hostname or "").lower().rstrip(".")
    except Exception:
        return {
            "success": False,
            "risk_score": 0,
            "risk_level": "LOW",
            "url": url,
            "domain": None,
            "detected_threats": ["Invalid URL structure"],
            "recommendations": ["Do not open malformed links."]
        }

    if not domain:
        return {
            "success": False,
            "risk_score": 0,
            "risk_level": "LOW",
            "url": url,
            "domain": None,
            "detected_threats": ["Missing domain"],
            "recommendations": ["Verify the URL before opening it."]
        }

    score = 0
    threats = []
    checks = []

    def add_threat(name: str, points: int):
        nonlocal score
        score += points
        threats.append(name)
        checks.append({
            "name": name,
            "score": points,
            "status": "suspicious"
        })

    # 1. Suspicious domain extension
    tld = domain.split(".")[-1]

    if tld in SUSPICIOUS_TLDS:
        add_threat(
            f"Domain uses a commonly abused extension: .{tld}",
            20
        )

    # 2. IP address instead of domain
    try:
        ipaddress.ip_address(domain)
        add_threat("URL uses an IP address instead of a domain", 30)
    except ValueError:
        pass

    # 3. Punycode / internationalized domain
    if "xn--" in domain:
        add_threat("Punycode domain detected", 25)

    # 4. URL username/password trick
    if parsed.username or parsed.password:
        add_threat("URL contains embedded credentials", 35)

    # 5. Non-HTTPS connection
    if parsed.scheme.lower() == "http":
        add_threat("URL does not use HTTPS", 10)

    # 6. URL shortener
    if domain in SHORTENERS:
        add_threat("URL uses a link-shortening service", 15)

    # 7. Suspicious domain structure
    labels = domain.split(".")

    if len(labels) >= 4:
        add_threat("Unusually deep subdomain structure", 15)

    # 8. Random-looking domain detection
    main_domain = labels[-2] if len(labels) >= 2 else labels[0]

    if len(main_domain) >= 10:
        vowels = sum(char in "aeiou" for char in main_domain)
        vowel_ratio = vowels / max(len(main_domain), 1)

        if vowel_ratio < 0.20:
            add_threat("Domain has an unusual random-looking pattern", 20)

    if re.search(r"\d{5,}", main_domain):
        add_threat("Domain contains an unusually long numeric sequence", 15)

    # 9. Suspicious URL path and query
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

    # 10. Very long URL
    if len(url) > 200:
        add_threat("Unusually long URL with complex parameters", 10)

    # 11. Encoded or obfuscated URL
    if re.search(r"%[0-9a-fA-F]{2}", url):
        add_threat("URL contains encoded characters", 10)

    # 12. Multiple redirect-like parameters
    redirect_params = (
        "redirect=", "redirect_url=", "return_url=",
        "next=", "continue=", "url="
    )

    if any(param in parsed.query.lower() for param in redirect_params):
        add_threat("Possible external redirect parameter", 20)

    # Final risk calculation
    score = min(score, 100)

    if score >= 60:
        risk_level = "HIGH"
    elif score >= 25:
        risk_level = "MEDIUM"
    else:
        risk_level = "LOW"

    recommendations = []

    if risk_level == "HIGH":
        recommendations.extend([
            "Do not open this link.",
            "Do not enter passwords, OTPs or banking details.",
            "Verify the domain through the organisation's official website."
        ])
    elif risk_level == "MEDIUM":
        recommendations.extend([
            "Treat this link with caution.",
            "Verify the domain before opening it.",
            "Avoid entering personal or financial information."
        ])
    else:
        recommendations.extend([
            "No strong suspicious URL indicators were detected.",
            "A low score does not guarantee that the URL is safe."
        ])

    return {
        "success": True,
        "url": url,
        "domain": domain,
        "risk_score": score,
        "risk_level": risk_level,
        "detected_threats": threats,
        "checks": checks,
        "recommendations": recommendations,
        "analysis_type": "Static URL Analysis",
        "disclaimer": (
            "This analysis checks URL structure and patterns. "
            "It does not verify live domain reputation or guarantee safety."
        )
    }
