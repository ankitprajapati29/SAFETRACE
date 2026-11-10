import type { AppLanguage } from "../../types";

export function speakText(
  text: string,
  language: AppLanguage,
): boolean {
  if (
    typeof window === "undefined" ||
    !("speechSynthesis" in window)
  ) {
    return false;
  }

  const cleanText = text.trim();

  if (!cleanText) return false;

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(cleanText);
  utterance.lang = language === "hi" ? "hi-IN" : "en-IN";
  utterance.rate = 0.92;
  utterance.pitch = 1;

  const voices = window.speechSynthesis.getVoices();

  const preferredVoice = voices.find(
    (voice) =>
      voice.lang.toLowerCase() === utterance.lang.toLowerCase(),
  );

  const fallbackVoice = voices.find((voice) =>
    voice.lang.toLowerCase().startsWith(language),
  );

  utterance.voice = preferredVoice ?? fallbackVoice ?? null;

  window.speechSynthesis.speak(utterance);

  return true;
}

export function pauseSpeaking(): void {
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.pause();
  }
}

export function resumeSpeaking(): void {
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.resume();
  }
}

export function stopSpeaking(): void {
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}