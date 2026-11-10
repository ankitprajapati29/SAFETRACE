const URL_REGEX =
  /(?:https?:\/\/|www\.)[^\s<>{}[\]"']+|(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(?:\/[^\s<>{}[\]"']*)?/gi;

const TRAILING_PUNCTUATION = /[.,!?;:)\]}]+$/;

export function normalizeExtractedUrl(value: string): string | null {
  let candidate = value.trim().replace(TRAILING_PUNCTUATION, "");

  if (!candidate) return null;

  if (candidate.startsWith("www.")) {
    candidate = `https://${candidate}`;
  } else if (!/^https?:\/\//i.test(candidate)) {
    candidate = `https://${candidate}`;
  }

  try {
    const parsed = new URL(candidate);

    if (!["http:", "https:"].includes(parsed.protocol)) {
      return null;
    }

    if (!parsed.hostname || !parsed.hostname.includes(".")) {
      return null;
    }

    return parsed.href;
  } catch {
    return null;
  }
}

export function extractUrls(text: string): string[] {
  if (!text?.trim()) return [];

  const matches = text.match(URL_REGEX) ?? [];

  const normalized = matches
    .map(normalizeExtractedUrl)
    .filter((url): url is string => Boolean(url));

  return [...new Set(normalized)];
}

export function containsUrl(text: string): boolean {
  return extractUrls(text).length > 0;
}