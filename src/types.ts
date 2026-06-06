/**
 * Canonical list of supported competitive exam types.
 * Used across check-in forms, validation, and wellness recommendations.
 */
export const VALID_EXAM_TYPES = [
  'JEE', 'NEET', 'UPSC', 'CAT', 'GATE', 'CUET', 'Boards', 'Other'
] as const;

/** Union type derived from VALID_EXAM_TYPES for strict type-checking. */
export type ExamType = typeof VALID_EXAM_TYPES[number];

/** Classified wellness status based on the 0–100 wellness score. */
export type WellnessStatus = 'Healthy' | 'Moderate Concern' | 'High Stress' | 'Burnout Risk';

export interface CheckIn {
  id: string;
  date: string; // YYYY-MM-DD
  mood: number; // 1 to 10
  stress: number; // 1 to 10
  energy: number; // 1 to 10
  sleepQuality: number; // 1 to 10
  studyHours: number;
  examType: ExamType;
  triggers: string[]; // Exam pressure, Lack of preparation, Time management, Family expectations, Peer comparison, Result anxiety, Burnout, Financial concerns
  exerciseMinutes: number;
  waterCups: number;
  notes?: string;
}

export interface JournalEntry {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  content: string; // Daily journal entry
  gratitude: string; // Gratitude note
  achievement: string; // Achievement of the day
  mood: number; // 1 to 10
  stress: number; // 1 to 10
  tags: string[];
}

export interface UserProfile {
  name: string;
  exam: ExamType;
  examDate: string; // YYYY-MM-DD
  dailyStudyGoal: number; // in hours
  dailySleepGoal: number; // in hours
}

export interface DailyQuote {
  text: string;
  author: string;
}

export type TabName = 'dashboard' | 'checkin' | 'analytics' | 'journal' | 'insights' | 'exercises';
