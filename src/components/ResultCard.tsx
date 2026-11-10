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

  return (
    <section
      className={`result-section result-redesign risk-${riskTone}`}
      aria-live="polite"
    >
      <header className="result-header result-redesign-header">
        <div>
          <span className="section-kicker">02 / ANALYSIS REPORT</span>

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

      <section
        className={`result-verdict verdict-${riskTone}`}
        aria-label="Overall risk result"
      >
        <div className="verdict-copy">
          <span className="result-label">
            {isHindi ? "कुल जोखिम स्तर" : "OVERALL RESULT"}
          </span>

          <h3>{statusTitle}</h3>

          <p>{statusDescription}</p>
        </div>

        <div
          className="verdict-score"
          role="img"
          aria-label={`Risk score ${safeScore} out of 100`}
        >
          <strong>{safeScore}</strong>
          <span>/ 100</span>
          <small>{isHindi ? "जोखिम स्कोर" : "RISK SCORE"}</small>
        </div>

        <div
          className="verdict-meter"
          role="progressbar"
          aria-label="Risk score"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={safeScore}
        >
          <span style={{ width: `${safeScore}%` }} />
        </div>
      </section>

      {/* DETECTION EVIDENCE */}

      <section className="result-section-block">
        <div className="result-block-heading">
          <span className="result-step">01</span>

          <div>
            <span className="section-kicker">DETECTION EVIDENCE</span>
            <h3>
              {isHindi
                ? "यह परिणाम क्यों मिला?"
                : "Why this result?"}
            </h3>
          </div>
        </div>

        {reasons.length > 0 ? (
          <ul className="result-evidence-list">
            {reasons.map((reason, index) => (
              <li key={`${index}-${reason}`}>
                <span className="evidence-check">!</span>
                <span>{reason}</span>
              </li>
            ))}
          </ul>
        ) : (
          <div className="result-empty-state">
            <span className="empty-state-icon">✓</span>

            <div>
              <strong>
                {isHindi
                  ? "कोई कॉन्फ़िगर किया गया संदिग्ध पैटर्न नहीं मिला"
                  : "No configured suspicious patterns found"}
              </strong>

              <p>
                {isHindi
                  ? "इसका अर्थ यह नहीं कि मैसेज पूरी तरह सुरक्षित है।"
                  : "This does not prove the message is completely safe."}
              </p>
            </div>
          </div>
        )}
      </section>

      {/* URL INTELLIGENCE */}

      {result.detectedUrls.length > 0 && (
        <section className="result-section-block result-url-block">
          <div className="result-block-heading">
            <span className="result-step">02</span>

            <div>
              <span className="section-kicker">URL INTELLIGENCE</span>
              <h3>
                {isHindi
                  ? "मैसेज में मिले लिंक"
                  : "Links found in this message"}
              </h3>
            </div>
          </div>

          <ul className="result-url-list">
            {result.detectedUrls.map((url) => {
              const flagged = result.suspiciousUrls.includes(url);

              return (
                <li key={url}>
                  <code>{url}</code>

                  <span
                    className={
                      flagged
                        ? "url-pill url-pill-warning"
                        : "url-pill url-pill-neutral"
                    }
                  >
                    {flagged
                      ? isHindi
                        ? "संदिग्ध"
                        : "FLAGGED"
                      : isHindi
                        ? "जाँचा गया"
                        : "DETECTED"}
                  </span>
                </li>
              );
            })}
          </ul>

          {suspiciousCount > 0 && (
            <p className="result-inline-warning">
              {isHindi
                ? `${suspiciousCount} लिंक पर चेतावनी संकेत मिले। इन्हें न खोलें।`
                : `${suspiciousCount} link(s) have warning signals. Avoid opening them.`}
            </p>
          )}
        </section>
      )}

      {/* AI EXPLANATION */}

      {aiAnalysis.trim() && (
        <section className="result-ai-block">
          <div className="result-block-heading">
            <span className="result-step">AI</span>

            <div>
              <span className="section-kicker">ADDITIONAL ANALYSIS</span>
              <h3>
                {isHindi ? "AI की व्याख्या" : "AI explanation"}
              </h3>
            </div>
          </div>

          <p>{aiAnalysis}</p>
        </section>
      )}

      {/* RECOMMENDED ACTIONS */}

      <section className="result-section-block result-actions-block">
        <div className="result-block-heading">
          <span className="result-step">
            {result.detectedUrls.length > 0 ? "03" : "02"}
          </span>

          <div>
            <span className="section-kicker">RECOMMENDED ACTIONS</span>
            <h3>
              {isHindi
                ? "अब आपको क्या करना चाहिए?"
                : "What should you do next?"}
            </h3>
          </div>
        </div>

        <ol className="result-recommendations">
          {recommendations.map((action, index) => (
            <li key={`${index}-${action}`}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <p>{action}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* OPTIONAL TECHNICAL DETAILS */}

      <details className="result-technical-details">
        <summary>
          {isHindi
            ? "तकनीकी विवरण देखें"
            : "View analysis details"}
        </summary>

        <div className="technical-detail-grid">
          <div>
            <span>Detection engine</span>
            <strong>Local rule-based checks</strong>
          </div>

          <div>
            <span>URLs detected</span>
            <strong>{result.detectedUrls.length}</strong>
          </div>

          <div>
            <span>Suspicious URLs</span>
            <strong>{suspiciousCount}</strong>
          </div>

          <div>
            <span>AI assistance</span>
            <strong>
              {aiAnalysis.trim() ? "Available" : "Unavailable"}
            </strong>
          </div>
        </div>
      </details>

      {/* DISCLAIMER */}

      <p className="result-disclaimer">
        {isHindi
          ? "यह स्कोर स्थानीय नियम-आधारित जाँच से बनाया गया है। AI विश्लेषण अतिरिक्त मार्गदर्शन देता है। कम स्कोर सुरक्षा की गारंटी नहीं है।"
          : "This score is based on local rule-based checks. AI analysis provides additional guidance. A low score does not guarantee safety."}
      </p>

      {/* AUDIO ACTIONS */}

      <div className="result-actions result-redesign-actions">
        <button
          className="secondary-action"
          type="button"
          onClick={onSpeak}
        >
          <span aria-hidden="true">♫</span>
          {isHindi ? "रिपोर्ट सुनें" : "Listen to report"}
        </button>

        <button
          className="secondary-action"
          type="button"
          onClick={onStop}
        >
          {isHindi ? "ऑडियो रोकें" : "Stop audio"}
        </button>
      </div>
    </section>
  );
}

export default ResultCard;