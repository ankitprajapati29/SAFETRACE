import type { UrlSignal } from "../../types";

export const URL_SIGNALS: Record<string, UrlSignal> = {
  SHORTENER: {
    id: "url_shortener",
    category: "suspicious_link",
    severity: "medium",
    descriptionEn: "This URL uses a link-shortening service that hides its destination.",
    descriptionHi: "Yeh shortened link apni asli destination chhupa sakta hai.",
    weight: 15,
  },

  SUSPICIOUS_TLD: {
    id: "suspicious_tld",
    category: "suspicious_link",
    severity: "medium",
    descriptionEn: "The domain uses a TLD frequently associated with suspicious links.",
    descriptionHi: "Is domain ka extension suspicious links mein dekha ja sakta hai.",
    weight: 15,
  },

  BRAND_IMPERSONATION: {
    id: "brand_impersonation",
    category: "impersonation",
    severity: "high",
    descriptionEn: "The URL may be impersonating a known company or financial brand.",
    descriptionHi: "Yeh URL kisi known company ya financial brand ki nakal kar sakta hai.",
    weight: 30,
  },

  IP_ADDRESS_HOST: {
    id: "ip_address_host",
    category: "suspicious_link",
    severity: "high",
    descriptionEn: "The URL uses a raw IP address instead of a normal domain.",
    descriptionHi: "URL normal domain ki jagah direct IP address use karta hai.",
    weight: 25,
  },

  EMBEDDED_CREDENTIALS: {
    id: "embedded_credentials",
    category: "suspicious_link",
    severity: "high",
    descriptionEn: "The URL contains embedded username or password information.",
    descriptionHi: "URL mein username ya password jaisi embedded information hai.",
    weight: 35,
  },

  HOMOGRAPH_RISK: {
    id: "homograph_risk",
    category: "impersonation",
    severity: "high",
    descriptionEn: "The domain may contain look-alike Unicode characters.",
    descriptionHi: "Domain mein milte-julte Unicode characters ka use ho sakta hai.",
    weight: 30,
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