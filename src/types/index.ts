export type AppLanguage = "en" | "hi";

export type RiskLevel = "LOW RISK" | "CAUTION" | "HIGH RISK";

export type RiskCategory =
  | "credential_theft"
  | "account_threat"
  | "urgency_pressure"
  | "prize_scam"
  | "payment_fraud"
  | "impersonation"
  | "suspicious_link"
  | "job_scam"
  | "investment_scam"
  | "loan_scam"
  | "delivery_scam"
  | "unknown";

export interface ThreatEvidence {
  id: string;
  category: RiskCategory;
  title: string;
  description: string;
  matchedText?: string;
  severity: "low" | "medium" | "high" | "critical";
  confidence: number;
  source: "text" | "url" | "ocr" | "backend";
}

export interface DetectionResult {
  score: number;
  level: RiskLevel;
  reasonsEn: string[];
  reasonsHi: string[];
  detectedUrls: string[];
  suspiciousUrls: string[];
  evidence?: ThreatEvidence[];
  confidence?: number;
  categories?: RiskCategory[];
  recommendation?: string;
  scannedAt?: string;
}

export interface UrlSignal {
  id: string;
  category: RiskCategory;
  severity: "low" | "medium" | "high" | "critical";
  descriptionEn: string;
  descriptionHi: string;
  weight: number;
}

export interface UrlAnalysis {
  urls: string[];
  suspiciousUrls: string[];
  reasonsEn: string[];
  reasonsHi: string[];
  evidence?: ThreatEvidence[];
}

export interface OCRResult {
  text: string;
  confidence: number;
}

export interface VoiceRecognitionResult {
  text: string;
  isFinal: boolean;
}

export interface ScanHistoryRecord {
  id: string;
  text: string;
  result: DetectionResult;
  language: AppLanguage;
  createdAt: number;
}

export interface FormattedAnalysis {
  title: string;
  summary: string;
  riskLabel: string;
  scoreLabel: string;
  reasons: string[];
  recommendations: string[];
  detectedUrls: string[];
}

export interface BackendAnalysisResponse {
  analysis: string;
  riskScore?: number;
  riskLevel?: RiskLevel;
  reasons?: string[];
  recommendations?: string[];
}

export interface BackendError {
  message: string;
  status?: number;
  code?: string;
}