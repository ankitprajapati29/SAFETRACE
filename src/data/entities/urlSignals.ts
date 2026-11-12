
import type { UrlSignal } from "../../types";

export const URL_SIGNALS: Record<string, UrlSignal> = {
  SHORTENER: {
    id: "url_shortener",
    category: "suspicious_link",
    severity: "medium",
    descriptionEn: "This URL uses a link-shortening service that hides its final destination.",
    descriptionHi: "Yeh shortened link apni actual destination chhupa sakta hai.",
    weight: 20,
  },

  SUSPICIOUS_TLD: {
    id: "suspicious_tld",
    category: "suspicious_link",
    severity: "medium",
    descriptionEn: "The domain uses an extension that deserves additional scrutiny.",
    descriptionHi: "Is domain ka extension additional checking ki zarurat dikhata hai.",
    weight: 20,
  },

  BRAND_IMPERSONATION: {
    id: "brand_impersonation",
    category: "impersonation",
    severity: "high",
    descriptionEn: "The domain may be impersonating a known company or financial brand.",
    descriptionHi: "Yeh domain kisi known company ya financial brand ki nakal kar sakta hai.",
    weight: 40,
  },

  IP_ADDRESS_HOST: {
    id: "ip_address_host",
    category: "suspicious_link",
    severity: "high",
    descriptionEn: "The URL uses a raw IP address instead of a normal domain.",
    descriptionHi: "URL normal domain ki jagah direct IP address use karta hai.",
    weight: 35,
  },

  EMBEDDED_CREDENTIALS: {
    id: "embedded_credentials",
    category: "suspicious_link",
    severity: "high",
    descriptionEn: "The URL contains embedded username or password information.",
    descriptionHi: "URL mein embedded username ya password information hai.",
    weight: 45,
  },

  HOMOGRAPH_RISK: {
    id: "homograph_risk",
    category: "impersonation",
    severity: "high",
    descriptionEn: "The domain may contain look-alike Unicode or Punycode characters.",
    descriptionHi: "Domain mein milte-julte Unicode ya Punycode characters ho sakte hain.",
    weight: 40,
  },

  HTTP_PROTOCOL: {
    id: "http_protocol",
    category: "suspicious_link",
    severity: "low",
    descriptionEn: "The URL does not use HTTPS encryption.",
    descriptionHi: "URL HTTPS encryption use nahi karta.",
    weight: 10,
  },

  RANDOM_DOMAIN: {
    id: "random_domain",
    category: "suspicious_link",
    severity: "medium",
    descriptionEn: "The domain has an unusual random-looking structure.",
    descriptionHi: "Domain ka structure unusual ya random-looking hai.",
    weight: 20,
  },

  SUSPICIOUS_PATH: {
    id: "suspicious_path",
    category: "suspicious_link",
    severity: "medium",
    descriptionEn: "The URL path contains potentially deceptive terms.",
    descriptionHi: "URL path mein potentially deceptive words mile hain.",
    weight: 20,
  },

  REDIRECT_PARAMETER: {
    id: "redirect_parameter",
    category: "suspicious_link",
    severity: "medium",
    descriptionEn: "The URL contains parameters that may redirect users elsewhere.",
    descriptionHi: "URL mein aise parameters hain jo user ko doosri website par redirect kar sakte hain.",
    weight: 20,
  },
};

export const SHORTENER_DOMAINS = new Set([
  "bit.ly",
  "tinyurl.com",
  "t.co",
  "is.gd",
  "cutt.ly",
  "rb.gy",
  "shorturl.at",
  "rebrand.ly",
  "ow.ly",
]);

export const SUSPICIOUS_TLDS = new Set([
  "xyz",
  "top",
  "click",
  "work",
  "buzz",
  "rest",
  "gq",
  "tk",
  "ml",
  "cf",
  "monster",
  "country",
]);

export const PROTECTED_BRANDS = [
  "google",
  "microsoft",
  "amazon",
  "paypal",
  "sbi",
  "hdfc",
  "icici",
  "paytm",
  "phonepe",
];

export const TRUSTED_HOSTS = new Set([
  "google.com",
  "microsoft.com",
  "amazon.com",
  "paypal.com",
  "sbi.co.in",
  "hdfcbank.com",
  "icicibank.com",
  "paytm.com",
  "phonepe.com",
]);

export const SUSPICIOUS_URL_TERMS = [
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

export const REDIRECT_PARAMETERS = [
  "redirect",
  "redirect_url",
  "return_url",
  "next",
  "continue",
  "url",
];
