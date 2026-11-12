
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
let isStarting = false;

/**
 * Check browser speech recognition support.
 * Does not request microphone permission.
 */
export function isVoiceInputSupported(): boolean {
  if (typeof window === "undefined") return false;

  const speechWindow = window as SpeechWindow;

  return Boolean(
    speechWindow.SpeechRecognition ||
    speechWindow.webkitSpeechRecognition
  );
}

/**
 * Start voice recognition.
 * Call this function only after an explicit user action,
 * such as clicking the Speak button.
 */
export function startVoiceInput(
  language: VoiceLanguage,
  callbacks: VoiceInputCallbacks
): boolean {
  if (typeof window === "undefined") {
    callbacks.onError?.("Voice input is unavailable.");
    return false;
  }

  if (recognition || isStarting) {
    return false;
  }

  const speechWindow = window as SpeechWindow;

  const Recognition =
    speechWindow.SpeechRecognition ||
    speechWindow.webkitSpeechRecognition;

  if (!Recognition) {
    callbacks.onError?.(
      "Speech recognition is not supported in this browser."
    );
    return false;
  }

  let currentRecognition: SpeechRecognitionLike;

  try {
    currentRecognition = new Recognition();
  } catch {
    callbacks.onError?.(
      "Unable to initialize speech recognition."
    );
    return false;
  }

  recognition = currentRecognition;
  isStarting = true;

  currentRecognition.lang =
    language === "hi" ? "hi-IN" : "en-IN";

  currentRecognition.continuous = true;
  currentRecognition.interimResults = true;

  currentRecognition.onresult = (event) => {
    let transcript = "";
    let isFinal = false;

    for (let i = 0; i < event.results.length; i++) {
      const result = event.results[i];

      transcript += result[0]?.transcript ?? "";
      isFinal = isFinal || result.isFinal;
    }

    callbacks.onResult(transcript.trim(), isFinal);
  };

  currentRecognition.onerror = (event) => {
    const errorMessages: Record<string, string> = {
      "not-allowed": "Microphone permission was denied.",
      "service-not-allowed": "Speech recognition service is not allowed.",
      "no-speech": "No speech detected. Please try again.",
      "audio-capture": "Microphone could not be accessed.",
      "network": "Network error during speech recognition.",
      "aborted": "Speech recognition was stopped.",
      "language-not-supported": "Selected language is not supported."
    };

    callbacks.onError?.(
      errorMessages[event.error] ||
      "Speech recognition failed. Please try again."
    );
  };

  currentRecognition.onend = () => {
    if (recognition === currentRecognition) {
      recognition = null;
    }

    isStarting = false;
    callbacks.onEnd?.();
  };

  try {
    // Browser permission is requested only when this function
    // is called following the user's explicit Speak button click.
    currentRecognition.start();
    return true;
  } catch {
    if (recognition === currentRecognition) {
      recognition = null;
    }

    isStarting = false;

    callbacks.onError?.(
      "Unable to start microphone recognition."
    );

    return false;
  }
}

/**
 * Stop voice recognition gracefully.
 */
export function stopVoiceInput(): void {
  const current = recognition;

  if (!current) return;

  try {
    current.stop();
  } catch {
    try {
      current.abort();
    } catch {
      // Recognition is already stopped.
    }

    if (recognition === current) {
      recognition = null;
    }

    isStarting = false;
  }
}

/**
 * Immediately abort voice recognition.
 */
export function abortVoiceInput(): void {
  const current = recognition;

  if (!current) return;

  recognition = null;
  isStarting = false;

  try {
    current.abort();
  } catch {
    // Recognition is already stopped.
  }
}
