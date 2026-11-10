
import { useState } from "react";
import "./App.css";

import { analyzeMessage as runDetection } from "./services/detector/ruleEngine";
import { analyzeWithBackend } from "./services/backendClient";
import ImageUpload from "./components/ImageUpload";
import VoiceInputButton from "./components/VoiceInputButton";
import ResultCard from "./components/ResultCard";
import {
  speakText,
  stopSpeaking,
} from "./services/output/textToSpeech";

type Language = "en" | "hi";

function Icon({
  name,
  size = 20,
}: {
  name: string;
  size?: number;
}) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.7,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true as const,
  };

  switch (name) {
    case "shield":
      return (
        <svg {...common}>
          <path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z" />
          <path d="m9 12 2 2 4-4" />
        </svg>
      );

    case "scan":
      return (
        <svg {...common}>
          <path d="M4 8V5a1 1 0 0 1 1-1h3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3" />
          <path d="M4 12h16M12 4v16" />
        </svg>
      );

    case "arrow":
      return (
        <svg {...common}>
          <path d="M5 12h14m-7-7 7 7-7 7" />
        </svg>
      );

    case "link":
      return (
        <svg {...common}>
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
        </svg>
      );

    case "file":
      return (
        <svg {...common}>
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
          <path d="M14 2v6h6M8 13h8M8 17h8" />
        </svg>
      );

    case "audio":
      return (
        <svg {...common}>
          <path d="M12 2a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
          <path d="M19 10v1a7 7 0 0 1-14 0v-1m7 8v4m-4 0h8" />
        </svg>
      );

    case "spark":
      return (
        <svg {...common}>
          <path d="m12 3 1.9 5.8L20 11l-6.1 2.2L12 19l-1.9-5.8L4 11l6.1-2.2L12 3Z" />
          <path d="m19 14 1.2 2.8L23 18l-2.8 1.2L19 22l-1.2-2.8L15 18l2.8-1.2L19 14Z" />
        </svg>
      );

    default:
      return null;
  }
}

function getRecommendedActions(
  level: string,
  score: number,
  hasSuspiciousUrl: boolean,
  isHindi: boolean,
): string[] {
  const normalizedLevel = level.toLowerCase();
  const isHigh = normalizedLevel.includes("high") || score >= 70;
  const isMedium =
    normalizedLevel.includes("medium") || score >= 35;

  const actions: string[] = [];

  if (isHigh) {
    actions.push(
      isHindi
        ? "इस मैसेज पर भरोसा न करें और भेजने वाले की स्वतंत्र रूप से पुष्टि करें।"
        : "Do not trust this message immediately. Independently verify the sender.",
      isHindi
        ? "लिंक पर क्लिक न करें और भुगतान करने से पहले जाँच करें।"
        : "Avoid clicking suspicious links or making unverified payments.",
    );
  } else if (isMedium) {
    actions.push(
      isHindi
        ? "भेजने वाले की पहचान और मैसेज के दावों की पुष्टि करें।"
        : "Verify the sender's identity and the claims in the message.",
      isHindi
        ? "निजी जानकारी साझा करने से पहले रुकें।"
        : "Pause before sharing personal or financial information.",
    );
  } else {
    actions.push(
      isHindi
        ? "कम स्कोर सुरक्षा की गारंटी नहीं है।"
        : "A low score does not guarantee that a message is safe.",
      isHindi
        ? "अनजान मैसेज के लिंक सावधानी से जाँचें।"
        : "Carefully review links in unfamiliar messages.",
    );
  }

  if (hasSuspiciousUrl) {
    actions.push(
      isHindi
        ? "संदिग्ध लिंक न खोलें। आधिकारिक वेबसाइट से पता जाँचें।"
        : "Do not open suspicious links. Verify the address through an official source.",
    );
  }

  actions.push(
    isHindi
      ? "OTP, UPI PIN, पासवर्ड या बैंक की गोपनीय जानकारी साझा न करें।"
      : "Never share your OTP, UPI PIN, password, or confidential banking details.",
  );

  if (isHigh || isMedium) {
    actions.push(
      isHindi
        ? "भारत में वित्तीय साइबर धोखाधड़ी होने पर 1930 पर संपर्क करें।"
        : "If financial cyber fraud has occurred in India, contact 1930 and report it at cybercrime.gov.in.",
    );
  }

  return actions;
}

function App() {
  const [language, setLanguage] = useState<Language>("en");
  const [message, setMessage] = useState("");
  const [ocrText, setOcrText] = useState("");
  const [result, setResult] = useState<
    ReturnType<typeof runDetection> | null
  >(null);
  const [error, setError] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState("");

  const isHindi = language === "hi";

  const recommendations = result
    ? getRecommendedActions(
        result.level,
        result.score,
        result.suspiciousUrls.length > 0,
        isHindi,
      )
    : [];

  const safeScore = result
    ? Math.min(100, Math.max(0, result.score))
    : 0;

  async function handleAnalyze() {
    const input = message.trim();

    if (!input) {
      setError(
        isHindi
          ? "पहले मैसेज पेस्ट करें या स्क्रीनशॉट अपलोड करें।"
          : "Please enter a message or upload a screenshot first.",
      );
      return;
    }

    stopSpeaking();
    setError("");
    setAiAnalysis("");
    setResult(null);
    setIsAnalyzing(true);

    const localResult = runDetection(input);
    setResult(localResult);

    try {
      const analysis = await analyzeWithBackend(input);
      setAiAnalysis(analysis);
    } catch (err) {
      console.error("Backend analysis failed:", err);

      setError(
        isHindi
          ? "स्थानीय जाँच पूरी हुई, लेकिन AI सर्वर से जवाब नहीं मिला।"
          : "Local analysis completed, but the AI service is unavailable. Check your backend configuration.",
      );
    } finally {
      setIsAnalyzing(false);
    }
  }

  function clearMessage() {
    stopSpeaking();
    setMessage("");
    setOcrText("");
    setResult(null);
    setAiAnalysis("");
    setError("");
  }

  function handleExtractedText(text: string) {
    if (!text) {
      setMessage((previous) =>
        ocrText ? previous.replace(ocrText, "").trim() : previous,
      );
      setOcrText("");
    } else {
      setMessage((previous) =>
        previous.trim() ? `${previous}\n${text}` : text,
      );
      setOcrText(text);
    }

    setResult(null);
    setAiAnalysis("");
    setError("");
  }

  function handleVoiceTranscript(transcript: string) {
    setMessage((previous) =>
      previous.trim()
        ? `${previous}\n${transcript}`
        : transcript,
    );

    setResult(null);
    setAiAnalysis("");
    setError("");
  }

  function handleSpeakResult() {
    if (!result) return;

    const reasons = (
      isHindi ? result.reasonsHi : result.reasonsEn
    ).join(". ");

    const actions = recommendations.join(". ");

    const resultText = isHindi
      ? `जाँच का परिणाम: ${result.level}। रिस्क स्कोर 100 में से ${result.score}। चेतावनी संकेत: ${reasons}। AI विश्लेषण: ${aiAnalysis}। सुझाव: ${actions}`
      : `Analysis result: ${result.level}. Risk score ${result.score} out of 100. Warning signs: ${reasons}. AI analysis: ${aiAnalysis}. Recommended actions: ${actions}`;

    const started = speakText(resultText, language);

    if (!started) {
      setError(
        isHindi
          ? "इस ब्राउज़र में आवाज़ की सुविधा उपलब्ध नहीं है।"
          : "Text-to-speech is not supported in this browser.",
      );
    } else {
      setError("");
    }
  }

  return (
    <div className="app-shell" id="home">
      <div className="ambient-background" aria-hidden="true">
        <div className="ambient-orb ambient-orb-one" />
        <div className="ambient-orb ambient-orb-two" />
        <div className="ambient-orb ambient-orb-three" />
        <div className="ambient-grid" />
        <div className="ambient-noise" />
      </div>

      <header className="topbar">
        <a className="brand" href="#home" aria-label="SAFETRACE home">
          <span className="brand-icon">
            <Icon name="shield" size={22} />
          </span>

          <span className="brand-copy">
            <strong>SAFE<span>TRACE</span></strong>
            <small>Digital Threat Intelligence</small>
          </span>
        </a>

        <nav className="desktop-nav" aria-label="Main navigation">
          <a href="#analyzer">Analyzer</a>
          <a href="#intelligence">Intelligence</a>
          <a href="#safety">Safety Guide</a>
        </nav>

        <div className="topbar-actions">
          <span className="system-status">
            <span className="status-dot" />
            SYSTEM READY
          </span>

          <button
            className="language-toggle"
            type="button"
            onClick={() => {
              stopSpeaking();
              setLanguage(isHindi ? "en" : "hi");
              setError("");
            }}
          >
            {isHindi ? "English" : "हिन्दी"}
          </button>
        </div>
      </header>

      <main className="main-content">
        <section className="hero-section">
          <div className="hero-copy">
            <div className="hero-eyebrow">
              <span className="eyebrow-line" />
              DIGITAL TRUST & SAFETY PLATFORM
            </div>

            <h1>
              {isHindi ? (
                <>
                  भरोसा करने से पहले
                  <span>जाँच करना सीखें।</span>
                </>
              ) : (
                <>
                  Trust less.
                  <span>Verify more.</span>
                </>
              )}
            </h1>

            <p className="hero-description">
              {isHindi
                ? "संदिग्ध मैसेज, लिंक और डिजिटल कंटेंट का विश्लेषण करें। समझें कि कौन से संकेत आपको जोखिम में डाल सकते हैं।"
                : "Investigate suspicious messages, links and digital content. Understand the signals behind potential online threats."}
            </p>

            <div className="hero-actions">
              <a href="#analyzer" className="primary-link">
                <span>
                  {isHindi ? "जाँच शुरू करें" : "Start analysis"}
                </span>
                <Icon name="arrow" size={18} />
              </a>

              <a href="#intelligence" className="secondary-link">
                Explore platform
              </a>
            </div>

            <div className="hero-trust-line">
              <Icon name="shield" size={16} />
              <span>Local detection + AI-assisted analysis</span>
            </div>
          </div>

          <div className="hero-visual" aria-label="Threat intelligence visualization">
            <div className="visual-orbit orbit-one" />
            <div className="visual-orbit orbit-two" />
            <div className="visual-orbit orbit-three" />

            <div className="visual-center">
              <div className="visual-center-inner">
                <Icon name="shield" size={42} />
                <span>SAFETRACE</span>
                <small>THREAT INTELLIGENCE</small>
              </div>
            </div>

            <div className="visual-node node-one">
              <Icon name="link" size={18} />
              <span>URL SIGNALS</span>
            </div>

            <div className="visual-node node-two">
              <Icon name="file" size={18} />
              <span>DOCUMENTS</span>
            </div>

            <div className="visual-node node-three">
              <Icon name="spark" size={18} />
              <span>AI ANALYSIS</span>
            </div>

            <div className="visual-caption">
              <span className="status-dot" />
              MULTI-SIGNAL ANALYSIS
            </div>
          </div>
        </section>

        <section className="capability-strip" id="intelligence">
          <div className="capability-item">
            <span className="capability-icon">
              <Icon name="scan" />
            </span>
            <div>
              <strong>Message Intelligence</strong>
              <small>Detect suspicious patterns</small>
            </div>
          </div>

          <div className="capability-item">
            <span className="capability-icon">
              <Icon name="link" />
            </span>
            <div>
              <strong>URL Analysis</strong>
              <small>Identify suspicious links</small>
            </div>
          </div>

          <div className="capability-item">
            <span className="capability-icon">
              <Icon name="file" />
            </span>
            <div>
              <strong>Document OCR</strong>
              <small>Extract text from images</small>
            </div>
          </div>

          <div className="capability-item">
            <span className="capability-icon">
              <Icon name="audio" />
            </span>
            <div>
              <strong>Voice Input</strong>
              <small>Speak to analyze</small>
            </div>
          </div>
        </section>

        {/* 01 — THREAT ANALYZER */}

        <section className="analyzer-section" id="analyzer">
          <div className="section-heading">
            <div>
              <span className="section-kicker">01 / THREAT ANALYZER</span>
              <h2>
                {isHindi
                  ? "क्या जाँचना चाहते हैं?"
                  : "Investigate a suspicious message."}
              </h2>
              <p>
                Paste a message, add a link or upload a screenshot.
              </p>
            </div>

            <div className="analysis-mode">
              <span className="status-dot" />
              LOCAL + AI ANALYSIS
            </div>
          </div>

          <div className="analyzer-workspace">
            <div className="workspace-topline">
              <span>INPUT CONSOLE</span>
              <span>SECURE ANALYSIS INTERFACE</span>
            </div>

            <label htmlFor="message-input">
              {isHindi ? "संदिग्ध मैसेज या लिंक" : "Message / URL / Email"}
            </label>

            <div className="message-composer">
              <textarea
                id="message-input"
                value={message}
                maxLength={5000}
                onChange={(event) => {
                  setMessage(event.target.value);
                  setError("");
                  setResult(null);
                  setAiAnalysis("");
                }}
                placeholder={
                  isHindi
                    ? "यहाँ SMS, WhatsApp मैसेज या संदिग्ध लिंक पेस्ट करें..."
                    : "Paste a suspicious SMS, WhatsApp message, email or URL here..."
                }
                rows={7}
              />

              <div className="composer-toolbar">
                <div className="composer-tools">
                  <div className="composer-tool">
                    <ImageUpload
                      language={language}
                      onTextExtracted={handleExtractedText}
                    />
                  </div>

                  <div className="composer-tool">
                    <VoiceInputButton
                      language={language}
                      onTranscript={handleVoiceTranscript}
                    />
                  </div>
                </div>

                <span className="character-count">
                  {message.length} / 5000
                </span>
              </div>
            </div>

            <div className="input-meta">
              <span>Type, speak or upload an image to begin.</span>

              {message.length > 0 && (
                <button
                  className="clear-button"
                  type="button"
                  onClick={clearMessage}
                >
                  Clear input
                </button>
              )}
            </div>

            {error && (
              <p className="error-message" role="alert">
                {error}
              </p>
            )}

            <button
              className={`analyze-button ${isAnalyzing ? "is-analyzing" : ""}`}
              type="button"
              onClick={handleAnalyze}
              disabled={isAnalyzing}
            >
              <Icon name="scan" size={20} />

              <span>
                {isAnalyzing
                  ? "Analyzing threat signals..."
                  : isHindi
                    ? "मैसेज की जाँच करें"
                    : "Analyze threat"}
              </span>

              <Icon name="arrow" size={18} />
            </button>

            <div className="privacy-note">
              <Icon name="shield" size={15} />
              <span>
                Your message is sent to the configured backend for AI analysis.
                Avoid submitting sensitive personal or banking information.
              </span>
            </div>
          </div>
        </section>

        {/* ANALYSIS PROGRESS */}

        {isAnalyzing && (
          <section className="scanning-section" aria-live="polite">
            <div className="scanning-header">
              <span className="section-kicker">ANALYSIS IN PROGRESS</span>
              <span className="scanning-indicator">PROCESSING</span>
            </div>

            <div className="scanning-line">
              <span />
            </div>

            <div className="scanning-stages">
              <span>Input processing</span>
              <span>Pattern detection</span>
              <span>AI analysis</span>
            </div>
          </section>
        )}

        {/* 02 — REDESIGNED ANALYSIS REPORT */}

        {result && (
          <ResultCard
            result={result}
            language={language}
            safeScore={safeScore}
            recommendations={recommendations}
            aiAnalysis={aiAnalysis}
            onSpeak={handleSpeakResult}
            onStop={stopSpeaking}
          />
        )}

        {/* 04 — DIGITAL SAFETY */}

        <section className="safety-section" id="safety">
          <div className="section-heading">
            <div>
              <span className="section-kicker">04 / DIGITAL SAFETY</span>
              <h2>Stay aware. Stay protected.</h2>
              <p>
                Three essential habits for safer digital interactions.
              </p>
            </div>
          </div>

          <div className="safety-grid">
            <article className="safety-card">
              <span className="safety-number">01</span>
              <h3>Protect your credentials.</h3>
              <p>
                Never share OTPs, passwords, UPI PINs or confidential banking
                information.
              </p>
            </article>

            <article className="safety-card">
              <span className="safety-number">02</span>
              <h3>Verify before clicking.</h3>
              <p>
                Check the sender and website address before opening unfamiliar
                links.
              </p>
            </article>

            <article className="safety-card">
              <span className="safety-number">03</span>
              <h3>Do not rush.</h3>
              <p>
                Urgent threats, unexpected rewards and payment pressure deserve
                independent verification.
              </p>
            </article>
          </div>
        </section>

        {/* FOOTER */}

        <footer className="app-footer">
          <a className="footer-brand" href="#home">
            SAFETRACE
          </a>

          <p>Intelligence for a safer digital world.</p>

          <small>
            SAFETRACE is an awareness tool, not a guarantee of security.
          </small>
        </footer>
      </main>
    </div>
  );
}

export default App;
