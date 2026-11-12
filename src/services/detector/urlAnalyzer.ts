
import {
  SHORTENER_DOMAINS,
  SUSPICIOUS_TLDS,
  PROTECTED_BRANDS,
  TRUSTED_HOSTS,
} from "../../data/entities/urlSignals";

export interface UrlAnalysis {
  urls: string[];
  suspiciousUrls: string[];
  reasonsEn: string[];
  reasonsHi: string[];
}

const SUSPICIOUS_TERMS = [
  "login",
  "verify",
  "verification",
  "claim",
  "reward",
  "prize",
  "bonus",
  "free",
  "payment",
  "wallet",
  "kyc",
  "bank",
  "gift",
  "winner",
  "cash",
  "offer",
  "referral",
  "invite",
];

const REDIRECT_PARAMETERS = [
  "redirect",
  "redirect_url",
  "return_url",
  "next",
  "continue",
  "url",
];

function isIpAddress(hostname: string): boolean {
  const parts = hostname.split(".");

  return (
    parts.length === 4 &&
    parts.every(
      (part) =>
        /^\d{1,3}$/.test(part) &&
        Number(part) >= 0 &&
        Number(part) <= 255,
    )
  );
}

function isTrustedHost(hostname: string): boolean {
  return [...TRUSTED_HOSTS].some(
    (host) =>
      hostname === host || hostname.endsWith(`.${host}`),
  );
}

function extractUrls(text: string): string[] {
  const matches =
    text.match(
      /(?:https?:\/\/|www\.)[^\s<>"']+|(?:[a-zA-Z0-9-]+\.)+(?:com|in|net|org|buzz|xyz|top|click|work|rest|fit|gq|tk|ml|cf|shop|site|online|info)(?:\/[^\s<>"']*)?/gi,
    ) ?? [];

  return Array.from(
    new Set(
      matches.map((url) =>
        url.replace(/[),.!?;:]+$/, ""),
      ),
    ),
  );
}

export function analyzeUrls(text: string): UrlAnalysis {
  const urls = extractUrls(text);

  const suspiciousUrls: string[] = [];
  const reasonsEn: string[] = [];
  const reasonsHi: string[] = [];

  for (const rawUrl of urls) {
    let parsedUrl: URL;

    try {
      const normalized = /^https?:\/\//i.test(rawUrl)
        ? rawUrl
        : `https://${rawUrl}`;

      parsedUrl = new URL(normalized);
    } catch {
      suspiciousUrls.push(rawUrl);
      reasonsEn.push("A URL could not be parsed reliably.");
      reasonsHi.push(
        "Ek URL ko reliably verify nahi kiya ja saka.",
      );
      continue;
    }

    const hostname = parsedUrl.hostname.toLowerCase();
    const labels = hostname.split(".");
    const tld = labels[labels.length - 1];

    const flagsEn: string[] = [];
    const flagsHi: string[] = [];

    const addFlag = (en: string, hi: string) => {
      flagsEn.push(en);
      flagsHi.push(hi);
    };

    // 1. Shortener detection
    if (SHORTENER_DOMAINS.has(hostname)) {
      addFlag(
        "The URL uses a link-shortening service that hides its destination.",
        "Link shortener use hua hai, jo asli destination chhupa sakta hai.",
      );
    }

    // 2. Suspicious TLD detection
    if (SUSPICIOUS_TLDS.has(tld)) {
      addFlag(
        `The domain uses the .${tld} extension and requires additional scrutiny.`,
        `Domain ka .${tld} extension additional verification ki zarurat dikhata hai.`,
      );
    }

    // 3. Brand impersonation detection
    const containsBrand = PROTECTED_BRANDS.some((brand) =>
      labels.some((label) => label.includes(brand)),
    );

    if (containsBrand && !isTrustedHost(hostname)) {
      addFlag(
        "A known brand name appears on a potentially unofficial domain.",
        "Known brand ka naam potentially unofficial domain mein mila hai.",
      );
    }

    // 4. IP address detection
    if (isIpAddress(hostname)) {
      addFlag(
        "The URL uses an IP address instead of a normal domain.",
        "URL normal domain ki jagah direct IP address use karta hai.",
      );
    }

    // 5. Embedded credentials
    if (parsedUrl.username || parsedUrl.password) {
      addFlag(
        "The URL contains embedded username or password information.",
        "URL mein embedded username ya password information hai.",
      );
    }

    // 6. Punycode detection
    if (hostname.includes("xn--")) {
      addFlag(
        "The domain contains Punycode characters that may disguise its identity.",
        "Domain mein Punycode characters hain jo asli identity chhupa sakte hain.",
      );
    }

    // 7. HTTP protocol check
    if (parsedUrl.protocol === "http:") {
      addFlag(
        "The URL does not use HTTPS encryption.",
        "URL HTTPS encryption use nahi karta.",
      );
    }

    // 8. Deep subdomain detection
    if (labels.length >= 4) {
      addFlag(
        "The URL contains an unusually deep subdomain structure.",
        "URL mein unusually deep subdomain structure mila hai.",
      );
    }

    // 9. Random-looking domain detection
    const mainDomain =
      labels.length >= 2 ? labels[labels.length - 2] : hostname;

    if (mainDomain.length >= 12) {
      const vowelCount =
        (mainDomain.match(/[aeiou]/g) ?? []).length;

      const vowelRatio = vowelCount / mainDomain.length;

      if (vowelRatio < 0.2) {
        addFlag(
          "The domain has an unusual random-looking character pattern.",
          "Domain mein unusual random-looking character pattern mila hai.",
        );
      }
    }

    // 10. Suspicious path and query terms
    const pathAndQuery =
      `${parsedUrl.pathname} ${parsedUrl.search}`.toLowerCase();

    const matchedTerms = SUSPICIOUS_TERMS.filter((term) =>
      new RegExp(
        `(^|[^a-z0-9])${term}([^a-z0-9]|$)`,
        "i",
      ).test(pathAndQuery),
    );

    if (matchedTerms.length > 0) {
      addFlag(
        `Potentially deceptive URL terms detected: ${matchedTerms.join(", ")}.`,
        `URL mein suspicious words mile: ${matchedTerms.join(", ")}.`,
      );
    }

    // 11. Redirect parameter detection
    const queryKeys = [
      ...parsedUrl.searchParams.keys(),
    ].map((key) => key.toLowerCase());

    if (
      REDIRECT_PARAMETERS.some((key) =>
        queryKeys.includes(key),
      )
    ) {
      addFlag(
        "The URL contains parameters that may redirect users elsewhere.",
        "URL mein redirect parameters mile hain jo user ko doosri website par bhej sakte hain.",
      );
    }

    // 12. Encoded character detection
    if (/%[0-9a-f]{2}/i.test(rawUrl)) {
      addFlag(
        "The URL contains encoded characters that require inspection.",
        "URL mein encoded characters mile hain jinhe inspect karna chahiye.",
      );
    }

    // 13. Unusually long URL
    if (rawUrl.length > 200) {
      addFlag(
        "The URL is unusually long and contains complex parameters.",
        "URL unusually long hai aur complex parameters contain karta hai.",
      );
    }

    if (flagsEn.length > 0) {
      suspiciousUrls.push(rawUrl);
      reasonsEn.push(...flagsEn);
      reasonsHi.push(...flagsHi);
    }
  }

  return {
    urls: [...new Set(urls)],
    suspiciousUrls: [...new Set(suspiciousUrls)],
    reasonsEn: [...new Set(reasonsEn)],
    reasonsHi: [...new Set(reasonsHi)],
  };
}
