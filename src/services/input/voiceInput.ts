export type VoiceLanguage = "en" | "hi";

export interface VoiceInputCallbacks {
  onResult: (text: string, isFinal: boolean) => void;
  onError?: (message: string) => void;
  onEnd?: () => void;
}

interface SpeechRecognitionAlternativeLike {
  transcript: string;
}

interface SpeechRecognitionResultLike {
  isFinal: boolean;
  [index: number]: SpeechRecognitionAlternativeLike;
}

interface SpeechRecognitionEventLike {
  results: ArrayLike<SpeechRecognitionResultLike>;
}

interface SpeechRecognitionErrorLike {
  error: string;
}

interface SpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: SpeechRecognitionErrorLike) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

interface SpeechWindow extends Window {
  SpeechRecognition?: new () => SpeechRecognitionLike;
  webkitSpeechRecognition?: new () => SpeechRecognitionLike;
}

let recognition: SpeechRecognitionLike | null = null;

export function isVoiceInputSupported(): boolean {
  if (typeof window === "undefined") return false;

  const speechWindow = window as SpeechWindow;

  return Boolean(
    speechWindow.SpeechRecognition ||
    speechWindow.webkitSpeechRecognition,
  );
}

export function startVoiceInput(
  language: VoiceLanguage,
  callbacks: VoiceInputCallbacks,
): boolean {
  if (typeof window === "undefined") return false;

  const speechWindow = window as SpeechWindow;
  const Recognition =
    speechWindow.SpeechRecognition ||
    speechWindow.webkitSpeechRecognition;

  if (!Recognition) {
    callbacks.onError?.("Speech recognition is not supported in this browser.");
    return false;
  }

  stopVoiceInput();

  recognition = new Recognition();
  recognition.lang = language === "hi" ? "hi-IN" : "en-IN";
  recognition.continuous = true;
  recognition.interimResults = true;

  recognition.onresult = (event) => {
    let transcript = "";
    let isFinal = false;

    for (let i = 0; i < event.results.length; i++) {
      const result = event.results[i];
      transcript += result[0]?.transcript ?? "";
      isFinal = isFinal || result.isFinal;
    }

    callbacks.onResult(transcript.trim(), isFinal);
  };

  recognition.onerror = (event) => {
    callbacks.onError?.(event.error);
  };

  recognition.onend = () => {
    recognition = null;
    callbacks.onEnd?.();
  };

  try {
    recognition.start();
    return true;
  } catch {
    recognition = null;
    callbacks.onError?.("Unable to start microphone recognition.");
    return false;
  }
}

export function stopVoiceInput(): void {
  if (!recognition) return;

  const current = recognition;
  recognition = null;

  try {
    current.stop();
  } catch {
    current.abort();
  }
}