
import { useState } from "react";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  ScanLine,
  ArrowRight,
  Link2,
  FileText,
  AudioLines,
  Sparkles,
} from "lucide-react";

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

type IconName =
  | "shield"
  | "scan"
  | "arrow"
  | "link"
  | "file"
  | "audio"
  | "spark";

function Icon({
  name,
  size = 20,
}: {
  name: IconName;
  size?: number;
}) {
  const icons = {
    shield: ShieldCheck,
    scan: ScanLine,
    arrow: ArrowRight,
    link: Link2,
    file: FileText,
    audio: AudioLines,
    spark: Sparkles,
  };

  const IconComponent = icons[name];

  return (
    <IconComponent
      size={size}
      strokeWidth={1.7}
      aria-hidden="true"
    />
  );
}

function getRecommendedActions(
  level: string,
  score: number,
  hasSuspiciousUrl: boolean,
  isHindi: boolean,
): string[] {
  const normalizedLevel = level.toLowerCase();

  const isHigh =
    normalizedLevel.includes("high") || score >= 70;

  const isMedium =
    normalizedLevel.includes("medium") || score >= 30;

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

      setAiAnalysis(
        isHindi
          ? "बैकएंड विश्लेषण उपलब्ध नहीं है। स्थानीय विश्लेषण दिखाया जा रहा है।"
          : "Backend analysis is unavailable. Showing local analysis results.",
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
      ? `जाँच का परिणाम: ${result.level}। रिस्क स्कोर 100 में से ${result.score}। चेतावनी संकेत: ${reasons}। विश्लेषण: ${aiAnalysis}। सुझाव: ${actions}`
      : `Analysis result: ${result.level}. Risk score ${result.score} out of 100. Warning signs: ${reasons}. Backend analysis: ${aiAnalysis}. Recommended actions: ${actions}`;

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

      {/* HEADER */}

      <header className="topbar">
        <a className="brand" href="#home" aria-label="SAFETRACE home">
          <span className="brand-icon">
            <Icon name="shield" size={22} />
          </span>

          <span className="brand-copy">
            <strong>
              SAFE<span>TRACE</span>
            </strong>
            <small>Digital Threat Intelligence</small>
          </span>
        </a>

        <nav className="desktop-nav" aria-label="Main navigation">
          <a href="#analyzer">Analyzer</a>
          <a href="#intelligence">Intelligence</a>
          <a href="#how-to-use">How to Use</a>
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

        {/* HERO SECTION */}

        <motion.section
          className="hero-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
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
              <span>Local + Backend Rule-Based Detection</span>
            </div>
          </div>

          <div
            className="hero-visual"
            aria-label="Threat intelligence visualization"
          >
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
              <span>RISK SCORING</span>
            </div>

            <div className="visual-caption">
              <span className="status-dot" />
              MULTI-SIGNAL ANALYSIS
            </div>
          </div>
        </motion.section>

        {/* CAPABILITIES */}

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

        {/* HOW TO USE */}

        <motion.section
          className="how-to-use-section"
          id="how-to-use"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.6 }}
        >
          <div className="section-heading">
            <div>
              <span className="section-kicker">
                HOW IT WORKS / 4 SIMPLE STEPS
              </span>
              <h2>Security starts with a simple check.</h2>
              <p>
                Follow four simple steps to investigate suspicious
                messages, links and digital content.
              </p>
            </div>
          </div>

          <div className="how-to-use-grid">
            <motion.article
              className="how-to-use-card"
              whileHover={{ y: -7 }}
              transition={{ duration: 0.25 }}
            >
              <span className="how-step-number">01</span>
              <div className="how-step-icon">
                <Icon name="scan" size={23} />
              </div>
              <h3>Choose Your Input</h3>
              <p>
                Start with a suspicious SMS, WhatsApp message,
                email, URL or digital document.
              </p>
            </motion.article>

            <motion.article
              className="how-to-use-card"
              whileHover={{ y: -7 }}
              transition={{ duration: 0.25 }}
            >
              <span className="how-step-number">02</span>
              <div className="how-step-icon">
                <Icon name="file" size={23} />
              </div>
              <h3>Provide the Content</h3>
              <p>
                Paste your message, upload a screenshot for text
                extraction or use voice input.
              </p>
            </motion.article>

            <motion.article
              className="how-to-use-card"
              whileHover={{ y: -7 }}
              transition={{ duration: 0.25 }}
            >
              <span className="how-step-number">03</span>
              <div className="how-step-icon">
                <Icon name="spark" size={23} />
              </div>
              <h3>Analyze Threat Signals</h3>
              <p>
                Click Analyze Threat to run local detection rules
                and request backend analysis.
              </p>
            </motion.article>

            <motion.article
              className="how-to-use-card"
              whileHover={{ y: -7 }}
              transition={{ duration: 0.25 }}
            >
              <span className="how-step-number">04</span>
              <div className="how-step-icon">
                <Icon name="shield" size={23} />
              </div>
              <h3>Review the Results</h3>
              <p>
                Understand the risk score, detected warning signs
                and recommended safety actions.
              </p>
            </motion.article>
          </div>

          <div className="how-to-use-note">
            <Icon name="shield" size={17} />
            <p>
              <strong>Stay alert:</strong> A low risk score does not
              guarantee that a message or link is safe. Always verify
              important information independently.
            </p>
          </div>
        </motion.section>

        {/* THREAT ANALYZER */}

        <motion.section
          className="analyzer-section"
          id="analyzer"
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.5 }}
        >
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
              LOCAL + BACKEND ANALYSIS
            </div>
          </div>

          <div className="analyzer-workspace">
            <div className="workspace-topline">
              <span>INPUT CONSOLE</span>
              <span>SECURE ANALYSIS INTERFACE</span>
            </div>

            <label htmlFor="message-input">
              {isHindi
                ? "संदिग्ध मैसेज या लिंक"
                : "Message / URL / Email"}
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
                Your message is processed by local detection and the SAFETRACE
                backend. Avoid submitting sensitive personal or banking
                information.
              </span>
            </div>
          </div>
        </motion.section>

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
              <span>Risk scoring</span>
            </div>
          </section>
        )}

        {/* ANALYSIS REPORT */}

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

        {/* DIGITAL SAFETY */}

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
