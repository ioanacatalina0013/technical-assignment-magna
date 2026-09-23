export interface User {
  id: string;
  name: string;
  email: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Candidate {
  id: string;
  name: string;
  email?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt?: string;
  _count?: { sessions: number };
  sessions?: InterviewSession[];
}

export type SessionStatus = 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';

export interface InterviewSession {
  id: string;
  title: string;
  role?: string | null;
  level?: string | null;
  scheduledAt: string;
  status: SessionStatus;
  durationMins?: number | null;
  candidateId: string;
  candidate?: Candidate;
  feedback?: Feedback | null;
  createdAt: string;
  updatedAt?: string;
}

export type Recommendation = 'STRONG_HIRE' | 'HIRE' | 'NO_HIRE' | 'STRONG_NO_HIRE';

export interface Feedback {
  id: string;
  sessionId: string;
  strengths: string;
  improvements: string;
  recommendation: Recommendation;
  notes?: string | null;
  createdAt: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ReportSummary {
  totalSessions: number;
  completedSessions: number;
  completionRate: number;
  totalCandidates: number;
  recommendationBreakdown: { recommendation: Recommendation; count: number }[];
}

export interface TrendPoint {
  weekStart: string;
  count: number;
}