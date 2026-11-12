# 🛡️ SAFETRACE — Cyber Threat Intelligence Platform

### Detect Suspicious Signals. Understand Digital Threats. Stay Safe.

**SAFETRACE** is a cybersecurity-focused platform designed to help users identify potential online fraud, suspicious messages, malicious-looking URLs, and document-related warning signals through a unified analysis interface.

<p align="center">
  <a href="https://safetrace-frontend.onrender.com">
    <img src="https://img.shields.io/badge/🌐_LIVE_DEMO-Explore_SAFETRACE-2563EB?style=for-the-badge" alt="Live Demo" />
  </a>
  <a href="https://github.com/ankitprajapati29/SAFETRACE">
    <img src="https://img.shields.io/badge/GitHub-Source_Code-181717?style=for-the-badge&logo=github" alt="GitHub Repository" />
  </a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=python&logoColor=white" />
  <img src="https://img.shields.io/badge/FastAPI-009688?style=flat-square&logo=fastapi&logoColor=white" />
  <img src="https://img.shields.io/badge/Deployment-Render-46E3B7?style=flat-square&logo=render&logoColor=black" />
</p>

---

## 🎯 Problem Statement

Online fraud is becoming increasingly sophisticated. Users regularly encounter:

- Phishing messages and fake alerts.
- OTP and banking credential scams.
- Suspicious payment requests.
- Fraudulent or misleading URLs.
- Suspicious information inside identity documents.

Many users struggle to identify these warning signs before taking action.

## 💡 Our Solution

SAFETRACE provides a unified interface to examine suspicious digital content and highlight potential fraud indicators.

It combines local rule-based detection with backend-powered message analysis to present risk signals, detected threats, and actionable safety recommendations.

**Our Mission:** Make cybersecurity awareness more accessible and help users make safer digital decisions.

## 🚀 Key Features

### 1. Message Intelligence
- Detects suspicious message patterns.
- Identifies urgency and threat-based language.
- Flags OTP and credential requests.
- Highlights suspicious payment requests.
- Detects possible impersonation and reward scams.
- Generates a risk score and recommendations.

### 2. URL Analysis
- Examines URL patterns and suspicious indicators.
- Identifies potentially risky links.
- Highlights suspicious URL characteristics.

### 3. Document OCR
- Extracts text from uploaded document images.
- Uses OCR-based text recognition.
- Helps examine extracted content for suspicious signals.

### 4. Voice Input
- Supports voice-based message input.
- English and Hindi recognition options.
- Converts speech into text for analysis.

### 5. Risk Assessment
- Displays risk scores from 0–100.
- Categorizes results into risk levels.
- Presents detected evidence and recommended actions.

## 🧠 Risk Classification

| Risk Score | Risk Level |
|---|---|
| 0–29 | LOW |
| 30–69 | CAUTION |
| 70–100 | HIGH |

The score is based on configured detection rules and indicators.

## 🛠️ Technology Stack

| Frontend | Purpose |
|---|---|
| React 19 | User interface |
| TypeScript | Type-safe development |
| Vite | Build tooling |
| Tailwind CSS | Styling |
| Framer Motion | UI animations |
| Lucide React | Icons |
| Tesseract.js | Browser-side OCR |

| Backend | Purpose |
|---|---|
| Python | Backend development |
| FastAPI | REST API |
| Uvicorn | ASGI server |
| Tesseract OCR | Text extraction |
| PyMuPDF | PDF processing |
| OpenCV | Image processing |
| Pillow | Image handling |

**Deployment:** Render  
**Version Control:** Git & GitHub

## ⚙️ How SAFETRACE Works

1. **Input** — Enter a suspicious message, URL, or upload a screenshot/document.
2. **Extraction** — OCR extracts text from supported images.
3. **Detection** — Local detection rules examine suspicious patterns and indicators.
4. **Backend Analysis** — The message can also be processed through the FastAPI backend.
5. **Risk Assessment** — The platform displays risk scores, detected signals, and recommendations.
6. **Action** — Users receive practical safety guidance.

## 🏗️ System Architecture

```text
              USER INPUT
                  |
        +---------+---------+
        |         |         |
      MESSAGE    URL     DOCUMENT
        |         |         |
        |      URL RULES   OCR
        |         |         |
        +---------+---------+
                  |
          LOCAL DETECTION
                  |
          RISK ASSESSMENT
                  |
          FASTAPI BACKEND
                  |
          ANALYSIS RESPONSE
                  |
          RESULTS DASHBOARD
                  |
        RECOMMENDATIONS
```

## 🏆 Hackathon

**CodeQuest: National Tech Hackathon 2026**

Organized on Unstop | DotRepo

SAFETRACE is being developed in the context of practical cybersecurity challenges, focusing on making suspicious digital communication easier to examine and understand.

## 🌐 Live Deployment

- **Frontend:** https://safetrace-frontend.onrender.com
- **Backend:** https://safetrace-backend-ygfi.onrender.com
- **API Documentation:** https://safetrace-backend-ygfi.onrender.com/docs

## 🔮 Future Enhancements

- Advanced phishing and fraud detection.
- Real-time URL reputation checking through threat intelligence APIs.
- Improved document fraud indicators.
- Multilingual message analysis.
- Advanced AI-powered threat classification.
- Expanded cross-channel fraud intelligence.

## ⚠️ Disclaimer

SAFETRACE is an assistive fraud-awareness tool. Its rule-based indicators and analysis results are not a guarantee that content is safe or fraudulent. Users should independently verify suspicious communications and never share OTPs, passwords, or banking credentials.

## 👨‍💻 Developer

**Ankit Prajapati**

B.E. Computer Engineering | Cybersecurity & Software Development Enthusiast

- GitHub: [@ankitprajapati29](https://github.com/ankitprajapati29)
- Project: [SAFETRACE Repository](https://github.com/ankitprajapati29/SAFETRACE)

---

<p align="center">
  <b>🛡️ SAFETRACE</b>
  <br/>
  <i>Detect Early. Think Smart. Stay Secure.</i>
</p>
