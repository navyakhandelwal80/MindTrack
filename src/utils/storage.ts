import type { CheckIn, JournalEntry, UserProfile } from '../types';

const STORAGE_KEYS = {
  DB_VERSION: 'mindtrack_db_version',
  PROFILE: 'mindtrack_profile',
  CHECKINS: 'mindtrack_checkins',
  JOURNAL: 'mindtrack_journal',
  THEME: 'mindtrack_theme',
};

const DB_VERSION_VALUE = 'v2';

// Helper to get formatted date string (YYYY-MM-DD)
export function formatDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getDaysAgo(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
}

// Default profile seed
const DEFAULT_PROFILE: UserProfile = {
  name: 'Aspirant',
  exam: 'JEE',
  examDate: (() => {
    const d = new Date();
    d.setDate(d.getDate() + 60); // 60 days from now
    return formatDateString(d);
  })(),
  dailyStudyGoal: 8,
  dailySleepGoal: 7,
};

// Generate Mock Data relative to current date using new 1-10 scales and fields
function generateMockData() {
  const mockCheckIns: CheckIn[] = [
    {
      id: 'mock-1',
      date: formatDateString(getDaysAgo(6)),
      mood: 6,
      stress: 7,
      energy: 5,
      sleepQuality: 6,
      studyHours: 7,
      examType: 'JEE',
      triggers: ['Lack of preparation'],
      exerciseMinutes: 20,
      waterCups: 5,
      notes: 'Feeling a bit overwhelmed with backlog math topics.',
    },
    {
      id: 'mock-2',
      date: formatDateString(getDaysAgo(5)),
      mood: 8,
      stress: 4,
      energy: 8,
      sleepQuality: 8,
      studyHours: 8,
      examType: 'JEE',
      triggers: [],
      exerciseMinutes: 30,
      waterCups: 8,
      notes: 'Good study session. Good sleep really helped my concentration.',
    },
    {
      id: 'mock-3',
      date: formatDateString(getDaysAgo(4)),
      mood: 4,
      stress: 9,
      energy: 3,
      sleepQuality: 4,
      studyHours: 9,
      examType: 'JEE',
      triggers: ['Exam pressure', 'Result anxiety'],
      exerciseMinutes: 0,
      waterCups: 4,
      notes: 'Mock test scores were lower. Felt very anxious and stayed up late reviewing errors.',
    },
    {
      id: 'mock-4',
      date: formatDateString(getDaysAgo(3)),
      mood: 6,
      stress: 6,
      energy: 6,
      sleepQuality: 6,
      studyHours: 6.5,
      examType: 'JEE',
      triggers: ['Time management', 'Peer comparison'],
      exerciseMinutes: 15,
      waterCups: 6,
      notes: 'Talked with classmates. Realized everyone is stressed about ranks. Felt slightly better.',
    },
    {
      id: 'mock-5',
      date: formatDateString(getDaysAgo(2)),
      mood: 9,
      stress: 3,
      energy: 9,
      sleepQuality: 9,
      studyHours: 8.5,
      examType: 'JEE',
      triggers: [],
      exerciseMinutes: 45,
      waterCups: 9,
      notes: 'Excellent day! Mastered calculus integration.',
    },
    {
      id: 'mock-6',
      date: formatDateString(getDaysAgo(1)),
      mood: 5,
      stress: 6,
      energy: 5,
      sleepQuality: 5,
      studyHours: 9.5,
      examType: 'JEE',
      triggers: ['Burnout'],
      exerciseMinutes: 10,
      waterCups: 7,
      notes: 'Studied late. Feeling a bit fatigued today, need to sleep on time.',
    },
  ];

  const mockJournal: JournalEntry[] = [
    {
      id: 'j-mock-1',
      date: formatDateString(getDaysAgo(6)),
      title: 'Backlog stress',
      content: 'I have a major backlog in organic chemistry. Every time I open physics, I think about chemistry. I need to make a solid checklist and take it step-by-step.',
      gratitude: 'Grateful for mom making tea during my late-night study session.',
      achievement: 'Finished checking off electrochemistry notes.',
      mood: 6,
      stress: 7,
      tags: ['study', 'backlog'],
    },
    {
      id: 'j-mock-2',
      date: formatDateString(getDaysAgo(4)),
      title: 'Dealing with Mock Test Failure',
      content: 'Today I failed to meet my cutoff target in the full syllabus mock. My hands were shaking during the exam, and I made silly errors. I need to practice sitting in exam-like conditions.',
      gratitude: 'Grateful for a conversation with dad who reminded me a score is just feedback.',
      achievement: 'Analyzed all my chemistry errors from the mock test.',
      mood: 4,
      stress: 9,
      tags: ['mocktest', 'anxiety'],
    },
    {
      id: 'j-mock-3',
      date: formatDateString(getDaysAgo(2)),
      title: 'A Breakthrough in Calculus',
      content: 'Finally cracked the advanced integration questions. It took me three attempts and a lot of patience. The feeling of unlocking a tough problem after struggling is unmatched.',
      gratitude: 'Grateful for the math teacher who explained integration by parts so well.',
      achievement: 'Solved 20 advanced calculus practice problems.',
      mood: 9,
      stress: 3,
      tags: ['progress', 'success'],
    }
  ];

  return { mockCheckIns, mockJournal };
}

// Initialize and manage version migrations
export function initStorage(): void {
  const currentVersion = localStorage.getItem(STORAGE_KEYS.DB_VERSION);
  
  if (currentVersion !== DB_VERSION_VALUE) {
    // Database migration: clear old layout keys to avoid rendering crashes due to 1-5 mood scales
    localStorage.removeItem(STORAGE_KEYS.PROFILE);
    localStorage.removeItem(STORAGE_KEYS.CHECKINS);
    localStorage.removeItem(STORAGE_KEYS.JOURNAL);
    localStorage.setItem(STORAGE_KEYS.DB_VERSION, DB_VERSION_VALUE);
  }

  if (!localStorage.getItem(STORAGE_KEYS.PROFILE)) {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(DEFAULT_PROFILE));
  }
  
  const { mockCheckIns, mockJournal } = generateMockData();
  
  if (!localStorage.getItem(STORAGE_KEYS.CHECKINS)) {
    localStorage.setItem(STORAGE_KEYS.CHECKINS, JSON.stringify(mockCheckIns));
  }
  if (!localStorage.getItem(STORAGE_KEYS.JOURNAL)) {
    localStorage.setItem(STORAGE_KEYS.JOURNAL, JSON.stringify(mockJournal));
  }
}

// User Profile functions
export function getProfile(): UserProfile {
  initStorage();
  const profile = localStorage.getItem(STORAGE_KEYS.PROFILE);
  return profile ? JSON.parse(profile) : DEFAULT_PROFILE;
}

export function saveProfile(profile: UserProfile): void {
  localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
}

// Check-ins functions
export function getCheckIns(): CheckIn[] {
  initStorage();
  const checkins = localStorage.getItem(STORAGE_KEYS.CHECKINS);
  return checkins ? JSON.parse(checkins) : [];
}

export function saveCheckIn(checkin: CheckIn): void {
  const checkins = getCheckIns();
  // Check if checkin for this date already exists
  const existingIdx = checkins.findIndex((c) => c.date === checkin.date);
  if (existingIdx !== -1) {
    checkins[existingIdx] = checkin; // overwrite
  } else {
    checkins.push(checkin);
  }
  // Sort chronologically
  checkins.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  localStorage.setItem(STORAGE_KEYS.CHECKINS, JSON.stringify(checkins));
}

export function deleteCheckIn(id: string): void {
  const checkins = getCheckIns();
  const filtered = checkins.filter((c) => c.id !== id);
  localStorage.setItem(STORAGE_KEYS.CHECKINS, JSON.stringify(filtered));
}

// Journal Entries functions
export function getJournalEntries(): JournalEntry[] {
  initStorage();
  const entries = localStorage.getItem(STORAGE_KEYS.JOURNAL);
  return entries ? JSON.parse(entries) : [];
}

export function saveJournalEntry(entry: JournalEntry): void {
  const entries = getJournalEntries();
  const existingIdx = entries.findIndex((e) => e.id === entry.id);
  if (existingIdx !== -1) {
    entries[existingIdx] = entry; // overwrite
  } else {
    entries.push(entry);
  }
  // Sort reverse chronological (newest first)
  entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  localStorage.setItem(STORAGE_KEYS.JOURNAL, JSON.stringify(entries));
}

export function deleteJournalEntry(id: string): void {
  const entries = getJournalEntries();
  const filtered = entries.filter((e) => e.id !== id);
  localStorage.setItem(STORAGE_KEYS.JOURNAL, JSON.stringify(filtered));
}

// Theme settings
export function getThemePreference(): 'light' | 'dark' {
  const theme = localStorage.getItem(STORAGE_KEYS.THEME);
  if (theme === 'light' || theme === 'dark') return theme;
  // Fallback to system preference
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  return 'light';
}

export function saveThemePreference(theme: 'light' | 'dark'): void {
  localStorage.setItem(STORAGE_KEYS.THEME, theme);
}
