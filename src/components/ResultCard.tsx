import { motion, AnimatePresence } from "framer-motion";
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  AudioLines,
  Check,
  CheckCircle2,
  ChevronDown,
  CircleStop,
  FileSearch,
  Fingerprint,
  Link2,
  ListChecks,
  LockKeyhole,
  ShieldAlert,
  ShieldCheck,
  ShieldQuestion,
} from "lucide-react";

import { analyzeMessage } from "../services/detector/ruleEngine";

type Language = "en" | "hi";
type DetectionResult = ReturnType<typeof analyzeMessage>;

type ResultCardProps = {
  result: DetectionResult;
  language: Language;
  safeScore: number;
  recommendations: string[];
  aiAnalysis: string;
  onSpeak: () => void;
  onStop: () => void;
};

const sectionVariants = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" as const },
  },
};

function ResultCard({
  result,
  language,
  safeScore,
  recommendations,
  aiAnalysis,
  onSpeak,
  onStop,
}: ResultCardProps) {
  const isHindi = language === "hi";
  const level = result.level.toLowerCase();

  const isHigh = level.includes("high");
  const isMedium =
    level.includes("medium") || level.includes("caution");

  const riskTone = isHigh ? "high" : isMedium ? "medium" : "low";

  const reasons = isHindi ? result.reasonsHi : result.reasonsEn;
  const suspiciousCount = result.suspiciousUrls.length;

  const score = Math.min(100, Math.max(0, safeScore));

  const statusTitle = isHindi
    ? isHigh
      ? "उच्च जोखिम"
      : isMedium
        ? "सावधानी ज़रूरी"
        : "कम जोखिम"
    : isHigh
      ? "High risk detected"
      : isMedium
        ? "Proceed with caution"
        : "Low risk detected";

  const statusDescription = isHindi
    ? isHigh
      ? "इस कंटेंट में कई जोखिम संकेत मिले हैं। आगे बढ़ने से पहले सत्यापन करें।"
      : isMedium
        ? "कुछ चेतावनी संकेत मिले हैं। भेजने वाले और दावों की पुष्टि करें।"
        : "इस जाँच में कोई प्रमुख कॉन्फ़िगर किया गया चेतावनी संकेत नहीं मिला।"
    : isHigh
      ? "Multiple warning signals were detected. Verify independently before taking action."
      : isMedium
        ? "Some warning signals were detected. Verify the sender and claims before proceeding."
        : "No major configured warning patterns were detected in this scan.";

  const verdictIcon = isHigh
    ? ShieldAlert
    : isMedium
      ? ShieldQuestion
      : ShieldCheck;

  const VerdictIcon = verdictIcon;

  return (
    <motion.section
      className={`result-section result-redesign risk-${riskTone}`}
      aria-live="polite"
      initial="hidden"
      animate="visible"
      variants={sectionVariants}
    >
      {/* HEADER */}

      <header className="result-header result-redesign-header">
        <div>
          <span className="section-kicker">
            02 / ANALYSIS REPORT
          </span>

          <h2>
            {isHindi
              ? "सुरक्षा जाँच का परिणाम"
              : "Your security assessment"}
          </h2>

          <p>
            {isHindi
              ? "जाँच के मुख्य निष्कर्ष और अगले कदम।"
              : "The key findings and what you should do next."}
          </p>
        </div>

        <span className="result-status">
          <span className="result-status-dot" />
          {isHindi ? "जाँच पूरी" : "SCAN COMPLETE"}
        </span>
      </header>

      {/* OVERALL RESULT */}

      <motion.section
        className={`result-verdict verdict-${riskTone}`}
        aria-label="Overall risk result"
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.45, delay: 0.1 }}
      >
        <div className="verdict-copy">
          <span className="result-label">
            {isHindi ? "कुल जोखिम स्तर" : "OVERALL RESULT"}
          </span>

          <h3>
            <VerdictIcon size={23} strokeWidth={1.8} />
            {statusTitle}
          </h3>

          <p>{statusDescription}</p>
        </div>

        <div
          className="verdict-score"
          role="img"
          aria-label={`Risk score ${score} out of 100`}
        >
          <motion.strong
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {score}
          </motion.strong>

          <span>/ 100</span>

          <small>
            {isHindi ? "जोखिम स्कोर" : "RISK SCORE"}
          </small>
        </div>

        <div
          className="verdict-meter"
          role="progressbar"
          aria-label="Risk score"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={score}
        >
          <motion.span
            initial={{ width: 0 }}
            animate={{ width: `${score}%` }}
            transition={{
              duration: 1,
              delay: 0.25,
              ease: "easeOut",
            }}
          />
        </div>
      </motion.section>

      {/* DETECTION EVIDENCE */}

      <motion.section
        className="result-section-block"
        variants={sectionVariants}
      >
        <div className="result-block-heading">
          <span className="result-step">01</span>

          <div>
            <span className="section-kicker">
              DETECTION EVIDENCE
            </span>

            <h3>
              <FileSearch size={19} />
              {isHindi
                ? "यह परिणाम क्यों मिला?"
                : "Why this result?"}
            </h3>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {reasons.length > 0 ? (
            <motion.ul
              key="evidence"
              className="result-evidence-list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {reasons.map((reason, index) => (
                <motion.li
                  key={`${index}-${reason}`}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.06 }}
                >
                  <span className="evidence-check">
                    <AlertTriangle size={15} />
                  </span>

                  <span>{reason}</span>
                </motion.li>
              ))}
            </motion.ul>
          ) : (
            <motion.div
              key="empty"
              className="result-empty-state"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <span className="empty-state-icon">
                <CheckCircle2 size={22} />
              </span>

              <div>
                <strong>
                  {isHindi
                    ? "कोई कॉन्फ़िगर किया गया संदिग्ध पैटर्न नहीं मिला"
                    : "No configured suspicious patterns found"}
                </strong>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.section>

      {/* URL INTELLIGENCE */}

      {result.detectedUrls.length > 0 && (
        <motion.section
          className="result-section-block result-url-block"
          variants={sectionVariants}
        >
          <div className="result-block-heading">
            <span className="result-step">02</span>

            <div>
              <span className="section-kicker">
                URL INTELLIGENCE
              </span>

              <h3>
                <Link2 size={19} />
                {isHindi
                  ? "मैसेज में मिले लिंक"
                  : "Links found in this message"}
              </h3>
            </div>
          </div>

          <ul className="result-url-list">
            {result.detectedUrls.map((url, index) => {
              const flagged = result.suspiciousUrls.includes(url);

              return (
                <motion.li
                  key={url}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.07 }}
                >
                  <code title={url}>{url}</code>

                  <span
                    className={
                      flagged
                        ? "url-pill url-pill-warning"
                        : "url-pill url-pill-neutral"
                    }
                  >
                    {flagged ? (
                      <>
                        <AlertCircle size={13} />
                        {isHindi ? "संदिग्ध" : "FLAGGED"}
                      </>
                    ) : (
                      <>
                        <Check size={13} />
                        {isHindi ? "जाँचा गया" : "DETECTED"}
                      </>
                    )}
                  </span>
                </motion.li>
              );
            })}
          </ul>

          {suspiciousCount > 0 && (
            <p className="result-inline-warning">
              <AlertTriangle size={16} />
              {isHindi
                ? `${suspiciousCount} लिंक पर चेतावनी संकेत मिले। इन्हें न खोलें।`
                : `${suspiciousCount} link(s) have warning signals. Avoid opening them.`}
            </p>
          )}
        </motion.section>
      )}

      {/* BACKEND ANALYSIS */}

      {aiAnalysis.trim() && (
        <motion.section
          className="result-ai-block"
          variants={sectionVariants}
        >
          <div className="result-block-heading">
            <span className="result-step">03</span>

            <div>
              <span className="section-kicker">
                BACKEND ANALYSIS
              </span>

              <h3>
                <Activity size={19} />
                {isHindi
                  ? "अतिरिक्त विश्लेषण"
                  : "Additional analysis"}
              </h3>
            </div>
          </div>

          <p>{aiAnalysis}</p>
        </motion.section>
      )}

      {/* RECOMMENDED ACTIONS */}

      <motion.section
        className="result-section-block result-actions-block"
        variants={sectionVariants}
      >
        <div className="result-block-heading">
          <span className="result-step">
            {aiAnalysis.trim()
              ? "04"
              : result.detectedUrls.length > 0
                ? "03"
                : "02"}
          </span>

          <div>
            <span className="section-kicker">
              RECOMMENDED ACTIONS
            </span>

            <h3>
              <ListChecks size={19} />
              {isHindi
                ? "अब आपको क्या करना चाहिए?"
                : "What should you do next?"}
            </h3>
          </div>
        </div>

        <ol className="result-recommendations">
          {recommendations.map((action, index) => (
            <motion.li
              key={`${index}-${action}`}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.06 }}
            >
              <span>{String(index + 1).padStart(2, "0")}</span>
              <p>{action}</p>
            </motion.li>
          ))}
        </ol>
      </motion.section>

      {/* TECHNICAL DETAILS */}

      <details className="result-technical-details">
        <summary>
          <Fingerprint size={17} />
          {isHindi
            ? "तकनीकी विवरण देखें"
            : "View analysis details"}
          <ChevronDown size={16} />
        </summary>

        <div className="technical-detail-grid">
          <div>
            <span>Detection engine</span>
            <strong>Local rule-based checks</strong>
          </div>

          <div>
            <span>Backend engine</span>
            <strong>SAFETRACE Rule Engine</strong>
          </div>

          <div>
            <span>URLs detected</span>
            <strong>{result.detectedUrls.length}</strong>
          </div>

          <div>
            <span>Suspicious URLs</span>
            <strong>{suspiciousCount}</strong>
          </div>
        </div>
      </details>

      {/* DISCLAIMER */}

      <p className="result-disclaimer">
        <LockKeyhole size={14} />
        {isHindi
          ? "यह स्कोर नियम-आधारित जाँच से बनाया गया है। यह सुरक्षा की गारंटी नहीं है। कम स्कोर का अर्थ यह नहीं कि मैसेज पूरी तरह सुरक्षित है।"
          : "This assessment uses rule-based detection. It is not a guarantee of security. A low score does not mean the message is completely safe."}
      </p>

      {/* AUDIO ACTIONS */}

      <div className="result-actions result-redesign-actions">
        <button
          className="secondary-action"
          type="button"
          onClick={onSpeak}
        >
          <AudioLines size={17} />
          {isHindi ? "रिपोर्ट सुनें" : "Listen to report"}
        </button>

        <button
          className="secondary-action"
          type="button"
          onClick={onStop}
        >
          <CircleStop size={17} />
          {isHindi ? "ऑडियो रोकें" : "Stop audio"}
        </button>
      </div>
    </motion.section>
  );
}

export default ResultCard;