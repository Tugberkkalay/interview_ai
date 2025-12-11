export enum InterviewStatus {
  IDLE = 'IDLE',
  CONNECTING = 'CONNECTING',
  ACTIVE = 'ACTIVE',
  ENDED = 'ENDED',
  ERROR = 'ERROR'
}

export type AvatarId = 'female' | 'male';

export interface AudioVisualizerData {
  volume: number; // 0 to 1
}

export type Role = 'user' | 'model';

export interface TranscriptItem {
  role: Role;
  text: string;
  timestamp: Date;
}

export interface InterviewReport {
  candidateName: string;
  overallScore: number;
  duration: string;
  categoryScores: {
    technical: number;
    communication: number;
    problemSolving: number;
    culturalFit: number;
    confidence: number;
  };
  visualAnalysis: {
    attire: string;
    environment: string;
    bodyLanguage: string;
    eyeContact: string;
  };
  behavioralAnalysis: {
    reactionSpeed: string;
    stressManagement: string;
    toneOfVoice: string;
  };
  keyStrengths: string[];
  areasForImprovement: string[];
  summary: string;
  hiringRecommendation: "Strong Hire" | "Hire" | "Maybe" | "No Hire";
  transcript?: { role: string; text: string }[];
}