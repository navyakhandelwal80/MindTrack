import type { CheckIn, JournalEntry, UserProfile } from '../types';

/**
 * Character length limits for user inputs to prevent buffer bloat or DB storage exhaustion.
 */
export const INPUT_LIMITS = {
  PROFILE_NAME: 50,
  PROFILE_EXAM: 50,
  JOURNAL_TITLE: 150,
  JOURNAL_CONTENT: 5000,
  JOURNAL_GRATITUDE: 1000,
  JOURNAL_ACHIEVEMENT: 1000,
  JOURNAL_TAG: 50,
  CHECKIN_NOTES: 500,
};

/**
 * Sanitizes input strings by escaping standard HTML character marks to defend against XSS.
 * Dynamically truncates the output if it exceeds a specified maximum length.
 * 
 * @param val - The raw input string
 * @param maxLength - Optional maximum length constraint
 * @returns Escaped and possibly truncated string
 */
export function sanitizeString(val: string, maxLength?: number): string {
  if (!val) return '';
  
  let sanitized = val
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');

  if (maxLength !== undefined && sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }

  return sanitized;
}

/**
 * Safe local storage operations wrapping native calls in defensive try-catch statements.
 * Safeguards against Private Mode blocked writes and storage quota exceptions.
 */
export const safeStorage = {
  /**
   * Retrieves a value from localStorage.
   */
  getItem(key: string): string | null {
    try {
      return localStorage.getItem(key);
    } catch (err) {
      console.error(`[SafeStorage] Error reading key "${key}" from localStorage:`, err);
      return null;
    }
  },

  /**
   * Sets a value in localStorage.
   */
  setItem(key: string, value: string): boolean {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (err) {
      console.error(`[SafeStorage] Error writing key "${key}" to localStorage:`, err);
      return false;
    }
  },

  /**
   * Removes a key from localStorage.
   */
  removeItem(key: string): boolean {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (err) {
      console.error(`[SafeStorage] Error removing key "${key}" from localStorage:`, err);
      return false;
    }
  }
};

/**
 * Safely parses storage JSON strings with default fallbacks, handling syntax errors defensively.
 * 
 * @param jsonStr - The stringified JSON source
 * @param fallback - The fallback value if parsing fails
 * @returns Parsed object or fallback
 */
export function safeParseJSON<T>(jsonStr: string | null, fallback: T): T {
  if (!jsonStr) return fallback;
  try {
    return JSON.parse(jsonStr) as T;
  } catch (err) {
    console.error('[SecurityUtils] Failed to parse JSON safely:', err);
    return fallback;
  }
}

/**
 * Asserts that a parsed object is a valid UserProfile structure.
 * 
 * @param data - The unknown object to validate
 * @returns boolean type-guard check
 */
export function isValidProfile(data: unknown): data is UserProfile {
  if (!data || typeof data !== 'object') return false;
  const p = data as Record<string, unknown>;
  return (
    typeof p.name === 'string' &&
    p.name.length <= INPUT_LIMITS.PROFILE_NAME &&
    typeof p.exam === 'string' &&
    p.exam.length <= INPUT_LIMITS.PROFILE_EXAM &&
    typeof p.examDate === 'string' &&
    (p.examDate === '' || /^\d{4}-\d{2}-\d{2}$/.test(p.examDate)) &&
    typeof p.dailyStudyGoal === 'number' &&
    !isNaN(p.dailyStudyGoal) &&
    p.dailyStudyGoal >= 0 &&
    p.dailyStudyGoal <= 24 &&
    typeof p.dailySleepGoal === 'number' &&
    !isNaN(p.dailySleepGoal) &&
    p.dailySleepGoal >= 0 &&
    p.dailySleepGoal <= 24
  );
}

/**
 * Asserts that a parsed object is a valid CheckIn log structure.
 * 
 * @param data - The unknown object to validate
 * @returns boolean type-guard check
 */
export function isValidCheckIn(data: unknown): data is CheckIn {
  if (!data || typeof data !== 'object') return false;
  const c = data as Record<string, unknown>;
  const validExams = ['JEE', 'NEET', 'UPSC', 'CAT', 'GATE', 'CUET', 'Boards', 'Other'];
  return (
    typeof c.id === 'string' &&
    typeof c.date === 'string' &&
    /^\d{4}-\d{2}-\d{2}$/.test(c.date) &&
    typeof c.mood === 'number' && !isNaN(c.mood) && c.mood >= 1 && c.mood <= 10 &&
    typeof c.stress === 'number' && !isNaN(c.stress) && c.stress >= 1 && c.stress <= 10 &&
    typeof c.energy === 'number' && !isNaN(c.energy) && c.energy >= 1 && c.energy <= 10 &&
    typeof c.sleepQuality === 'number' && !isNaN(c.sleepQuality) && c.sleepQuality >= 1 && c.sleepQuality <= 10 &&
    typeof c.studyHours === 'number' && !isNaN(c.studyHours) && c.studyHours >= 0 && c.studyHours <= 24 &&
    typeof c.examType === 'string' && validExams.includes(c.examType) &&
    Array.isArray(c.triggers) && c.triggers.every(t => typeof t === 'string' && t.length <= 50) &&
    typeof c.exerciseMinutes === 'number' && !isNaN(c.exerciseMinutes) && c.exerciseMinutes >= 0 && c.exerciseMinutes <= 300 &&
    typeof c.waterCups === 'number' && !isNaN(c.waterCups) && c.waterCups >= 0 && c.waterCups <= 30 &&
    (c.notes === undefined || (typeof c.notes === 'string' && c.notes.length <= INPUT_LIMITS.CHECKIN_NOTES))
  );
}

/**
 * Asserts that a parsed object is a valid JournalEntry structure.
 * 
 * @param data - The unknown object to validate
 * @returns boolean type-guard check
 */
export function isValidJournalEntry(data: unknown): data is JournalEntry {
  if (!data || typeof data !== 'object') return false;
  const j = data as Record<string, unknown>;
  return (
    typeof j.id === 'string' &&
    typeof j.date === 'string' &&
    /^\d{4}-\d{2}-\d{2}$/.test(j.date) &&
    typeof j.title === 'string' && j.title.length <= INPUT_LIMITS.JOURNAL_TITLE && j.title.trim() !== '' &&
    typeof j.content === 'string' && j.content.length <= INPUT_LIMITS.JOURNAL_CONTENT && j.content.trim() !== '' &&
    typeof j.gratitude === 'string' && j.gratitude.length <= INPUT_LIMITS.JOURNAL_GRATITUDE &&
    typeof j.achievement === 'string' && j.achievement.length <= INPUT_LIMITS.JOURNAL_ACHIEVEMENT &&
    typeof j.mood === 'number' && !isNaN(j.mood) && j.mood >= 1 && j.mood <= 10 &&
    typeof j.stress === 'number' && !isNaN(j.stress) && j.stress >= 1 && j.stress <= 10 &&
    Array.isArray(j.tags) && j.tags.every(t => typeof t === 'string' && t.length <= INPUT_LIMITS.JOURNAL_TAG)
  );
}

/**
 * Validates check-in fields against bounds, typings, and length limits.
 * 
 * @param data - The untrusted check-in input data
 * @returns Validation state and array of errors
 */
export function validateCheckIn(data: unknown): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data || typeof data !== 'object') {
    return { valid: false, errors: ['Check-in data is invalid or null.'] };
  }

  const payload = data as Record<string, unknown>;

  const validateRange = (val: unknown, label: string) => {
    const num = Number(val);
    if (isNaN(num) || num < 1 || num > 10 || !Number.isInteger(num)) {
      errors.push(`${label} rating must be an integer between 1 and 10.`);
    }
  };

  validateRange(payload.mood, 'Mood');
  validateRange(payload.stress, 'Stress');
  validateRange(payload.energy, 'Energy');
  validateRange(payload.sleepQuality, 'Sleep quality');

  const study = Number(payload.studyHours);
  if (isNaN(study) || study < 0 || study > 24) {
    errors.push('Study duration must be between 0 and 24 hours.');
  }

  const validExams = ['JEE', 'NEET', 'UPSC', 'CAT', 'GATE', 'CUET', 'Boards', 'Other'];
  if (!payload.examType || typeof payload.examType !== 'string' || !validExams.includes(payload.examType)) {
    errors.push(`Exam type must be one of: ${validExams.join(', ')}.`);
  }

  if (!payload.date || typeof payload.date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(payload.date)) {
    errors.push('Log date must be formatted in YYYY-MM-DD.');
  }

  if (payload.notes !== undefined && typeof payload.notes === 'string' && payload.notes.length > INPUT_LIMITS.CHECKIN_NOTES) {
    errors.push(`Notes content cannot exceed ${INPUT_LIMITS.CHECKIN_NOTES} characters.`);
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Validates journal entry fields against bounds, typings, and length limits.
 * 
 * @param data - The untrusted journal input data
 * @returns Validation state and array of errors
 */
export function validateJournalEntry(data: unknown): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data || typeof data !== 'object') {
    return { valid: false, errors: ['Journal entry is invalid or null.'] };
  }

  const payload = data as Record<string, unknown>;

  if (!payload.title || typeof payload.title !== 'string' || !payload.title.trim()) {
    errors.push('Reflection title cannot be empty.');
  } else if (payload.title.length > INPUT_LIMITS.JOURNAL_TITLE) {
    errors.push(`Reflection title cannot exceed ${INPUT_LIMITS.JOURNAL_TITLE} characters.`);
  }

  if (!payload.content || typeof payload.content !== 'string' || !payload.content.trim()) {
    errors.push('Reflection body content cannot be empty.');
  } else if (payload.content.length > INPUT_LIMITS.JOURNAL_CONTENT) {
    errors.push(`Reflection body content cannot exceed ${INPUT_LIMITS.JOURNAL_CONTENT} characters.`);
  }

  if (payload.gratitude !== undefined && typeof payload.gratitude === 'string' && payload.gratitude.length > INPUT_LIMITS.JOURNAL_GRATITUDE) {
    errors.push(`Gratitude note cannot exceed ${INPUT_LIMITS.JOURNAL_GRATITUDE} characters.`);
  }

  if (payload.achievement !== undefined && typeof payload.achievement === 'string' && payload.achievement.length > INPUT_LIMITS.JOURNAL_ACHIEVEMENT) {
    errors.push(`Achievement note cannot exceed ${INPUT_LIMITS.JOURNAL_ACHIEVEMENT} characters.`);
  }

  const moodNum = Number(payload.mood);
  if (isNaN(moodNum) || moodNum < 1 || moodNum > 10) {
    errors.push('Mood associated with the entry must be between 1 and 10.');
  }

  const stressNum = Number(payload.stress);
  if (isNaN(stressNum) || stressNum < 1 || stressNum > 10) {
    errors.push('Stress associated with the entry must be between 1 and 10.');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
