export interface CheckIn {
  id: string;
  date: string; // YYYY-MM-DD
  mood: number; // 1 to 10
  stress: number; // 1 to 10
  energy: number; // 1 to 10
  sleepQuality: number; // 1 to 10
  studyHours: number;
  examType: 'JEE' | 'NEET' | 'UPSC' | 'CAT' | 'GATE' | 'CUET' | 'Boards' | 'Other';
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
  exam: string; // JEE, NEET, UPSC, CAT, GATE, CUET, Boards, Other
  examDate: string; // YYYY-MM-DD
  dailyStudyGoal: number; // in hours
  dailySleepGoal: number; // in hours
}

export interface DailyQuote {
  text: string;
  author: string;
}

export type TabName = 'dashboard' | 'checkin' | 'analytics' | 'journal' | 'insights' | 'exercises';
