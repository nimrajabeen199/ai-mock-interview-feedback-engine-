export type SeniorityLevel =
  | 'Junior / Entry'
  | 'Mid-Level'
  | 'Senior'
  | 'Staff / Tech Lead'
  | 'Director / Executive';

export type TargetCompany =
  | 'Google'
  | 'Amazon'
  | 'Meta'
  | 'Apple'
  | 'Microsoft'
  | 'Netflix'
  | 'High-Growth Startup'
  | 'FinTech / Stripe';

export type InterviewType =
  | 'technical'
  | 'behavioral'
  | 'system_design'
  | 'case_study'
  | 'mixed';

export interface InterviewConfig {
  role: string;
  seniority: SeniorityLevel;
  targetCompany: TargetCompany;
  interviewType: InterviewType;
  questionCount: number;
  resumeSnippet?: string;
  jobDescription?: string;
  enableCamera: boolean;
  enableVoiceTTS: boolean;
}

export interface InterviewQuestion {
  id: string;
  category: string;
  question: string;
  contextTip: string;
  expectedPoints: string[];
  recommendedMinutes: number;
}

export interface SentimentData {
  primaryTone: string;
  confidenceScore: number;
  clarityScore: number;
  sentimentPolarity: string;
  emotionalKeywords: string[];
}

export interface StarAdherence {
  situationIdentified: boolean;
  taskIdentified: boolean;
  actionIdentified: boolean;
  resultIdentified: boolean;
  summary: string;
}

export interface InstantFeedback {
  strengthHighlight: string;
  constructiveTip: string;
  starAdherence: StarAdherence;
}

export interface TurnAnalysis {
  sentiment: SentimentData;
  instantFeedback: InstantFeedback;
  interviewerSpokenReaction: string;
  followUpQuestion?: string;
  isReadyForNextQuestion: boolean;
}

export interface QuestionHistoryItem {
  questionId: string;
  question: string;
  candidateAnswer: string;
  durationSeconds: number;
  fillerWordsCount: number;
  wpm: number;
  turnFeedback?: TurnAnalysis;
  followUpQuestion?: string;
  followUpAnswer?: string;
}

export interface DimensionScore {
  score: number;
  rationale: string;
}

export interface PerQuestionFeedback {
  questionId: string;
  question: string;
  score: number;
  strengths: string[];
  growthAreas: string[];
  goldenAnswer: string;
}

export interface FullEvaluation {
  overallScore: number;
  hiringDecision: 'Strong Hire' | 'Hire' | 'Lean Hire' | 'Lean No Hire' | 'No Hire';
  summaryVerdict: string;
  dimensionScores: {
    technicalAccuracy: DimensionScore;
    communicationClarity: DimensionScore;
    starStructure: DimensionScore;
    confidenceAndPresence: DimensionScore;
    leadershipAndImpact: DimensionScore;
  };
  speechAndPacingReview: {
    pacingVerdict: string;
    fillerWordImpact: string;
    sentimentTrajectory: string;
  };
  perQuestionFeedback: PerQuestionFeedback[];
  recommendedActionDrills: string[];
}

export interface SavedInterviewSession {
  id: string;
  timestamp: number;
  config: InterviewConfig;
  overallScore: number;
  hiringDecision: string;
  totalDurationSeconds: number;
  evaluation: FullEvaluation;
  qaHistory: QuestionHistoryItem[];
}
