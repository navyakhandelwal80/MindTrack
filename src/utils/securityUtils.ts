import { VALID_EXAM_TYPES } from '../types';
import type { CheckIn, JournalEntry, UserProfile } from '../types';

/**
 * Character and array length limits for user inputs.
 * Frozen at runtime to prevent tampering via browser console.
 */
export const INPUT_LIMITS = Object.freeze({
  PROFILE_NAME: 50,
  PROFILE_EXAM: 50,
  JOURNAL_TITLE: 150,
  JOURNAL_CONTENT: 5000,
  JOURNAL_GRATITUDE: 1000,
  JOURNAL_ACHIEVEMENT: 1000,
  JOURNAL_TAG: 50,
  CHECKIN_NOTES: 500,
  /** Maximum number of stress triggers per check-in. */
  MAX_TRIGGERS: 10,
  /** Maximum number of tags per journal entry. */
  MAX_TAGS: 20,
  /** Maximum number of check-in records in storage. */
  MAX_CHECKINS: 1000,
  /** Maximum number of journal entries in storage. */
  MAX_JOURNAL_ENTRIES: 500,
  /** Maximum character length of any entity ID. */
  ID_MAX_LENGTH: 100,
});

/**
 * Sanitizes input strings by escaping standard HTML character marks to defend against XSS.
 * Truncates the RAW input BEFORE escaping to prevent splitting HTML entity codes
 * (e.g. `&amp;` cut to `&am`).
 *
 * @param val - The raw input string
 * @param maxLength - Optional maximum length applied to the raw input before escaping
 * @returns Escaped and possibly truncated string
 */
export function sanitizeString(val: string, maxLength?: number): string {
  if (!val) return '';

  // Truncate the raw input BEFORE escaping to avoid splitting entity codes
  let raw = val;
  if (maxLength !== undefined && raw.length > maxLength) {
    raw = raw.substring(0, maxLength);
  }

  return raw
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Validates and sanitizes an entity ID string.
 * IDs must be non-empty strings within the allowed length.
 *
 * @param id - The raw ID to validate
 * @returns Sanitized ID or empty string if invalid
 */
export function sanitizeId(id: string): string {
  if (typeof id !== 'string' || id.length === 0 || id.length > INPUT_LIMITS.ID_MAX_LENGTH) {
    return '';
  }
  // Strip any characters that are not alphanumeric, hyphens, or underscores
  return id.replace(/[^a-zA-Z0-9\-_]/g, '');
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
    const parsed: unknown = JSON.parse(jsonStr);
    // Ensure parsed value is not a primitive masquerading as T
    if (parsed === null || parsed === undefined) return fallback;
    return parsed as T;
  } catch (err) {
    console.error('[SecurityUtils] Failed to parse JSON safely:', err);
    return fallback;
  }
}

/**
 * Clamps a numeric value within a [min, max] range.
 * Returns the fallback if the value is not a finite number.
 *
 * @param val - The value to clamp
 * @param min - Minimum bound
 * @param max - Maximum bound
 * @param fallback - Value to return if input is not a valid number
 * @returns Clamped number
 */
export function clampNumber(val: unknown, min: number, max: number, fallback: number): number {
  const num = Number(val);
  if (!Number.isFinite(num)) return fallback;
  return Math.max(min, Math.min(max, num));
}

/**
 * Asserts that a parsed object is a valid UserProfile structure.
 * Checks all fields for type, range, format, and enum membership.
 *
 * @param data - The unknown object to validate
 * @returns boolean type-guard check
 */
export function isValidProfile(data: unknown): data is UserProfile {
  if (!data || typeof data !== 'object') return false;
  const p = data as Record<string, unknown>;
  const validExams: readonly string[] = VALID_EXAM_TYPES;
  return (
    typeof p.name === 'string' &&
    p.name.length > 0 &&
    p.name.length <= INPUT_LIMITS.PROFILE_NAME &&
    typeof p.exam === 'string' &&
    validExams.includes(p.exam) &&
    typeof p.examDate === 'string' &&
    (p.examDate === '' || /^\d{4}-\d{2}-\d{2}$/.test(p.examDate)) &&
    typeof p.dailyStudyGoal === 'number' &&
    Number.isFinite(p.dailyStudyGoal) &&
    p.dailyStudyGoal >= 0 &&
    p.dailyStudyGoal <= 24 &&
    typeof p.dailySleepGoal === 'number' &&
    Number.isFinite(p.dailySleepGoal) &&
    p.dailySleepGoal >= 0 &&
    p.dailySleepGoal <= 24
  );
}

/**
 * Asserts that a parsed object is a valid CheckIn log structure.
 * Validates all fields including id length, date format, numeric bounds,
 * exam enum, triggers array size, and optional notes length.
 *
 * @param data - The unknown object to validate
 * @returns boolean type-guard check
 */
export function isValidCheckIn(data: unknown): data is CheckIn {
  if (!data || typeof data !== 'object') return false;
  const c = data as Record<string, unknown>;
  const validExams: readonly string[] = VALID_EXAM_TYPES;
  return (
    typeof c.id === 'string' && c.id.length > 0 && c.id.length <= INPUT_LIMITS.ID_MAX_LENGTH &&
    typeof c.date === 'string' &&
    /^\d{4}-\d{2}-\d{2}$/.test(c.date) &&
    typeof c.mood === 'number' && Number.isFinite(c.mood) && c.mood >= 1 && c.mood <= 10 &&
    typeof c.stress === 'number' && Number.isFinite(c.stress) && c.stress >= 1 && c.stress <= 10 &&
    typeof c.energy === 'number' && Number.isFinite(c.energy) && c.energy >= 1 && c.energy <= 10 &&
    typeof c.sleepQuality === 'number' && Number.isFinite(c.sleepQuality) && c.sleepQuality >= 1 && c.sleepQuality <= 10 &&
    typeof c.studyHours === 'number' && Number.isFinite(c.studyHours) && c.studyHours >= 0 && c.studyHours <= 24 &&
    typeof c.examType === 'string' && validExams.includes(c.examType) &&
    Array.isArray(c.triggers) && c.triggers.length <= INPUT_LIMITS.MAX_TRIGGERS &&
      c.triggers.every((t: unknown) => typeof t === 'string' && t.length <= 50) &&
    typeof c.exerciseMinutes === 'number' && Number.isFinite(c.exerciseMinutes) && c.exerciseMinutes >= 0 && c.exerciseMinutes <= 300 &&
    typeof c.waterCups === 'number' && Number.isFinite(c.waterCups) && c.waterCups >= 0 && c.waterCups <= 30 &&
    (c.notes === undefined || (typeof c.notes === 'string' && c.notes.length <= INPUT_LIMITS.CHECKIN_NOTES))
  );
}

/**
 * Asserts that a parsed object is a valid JournalEntry structure.
 * Validates all fields including id length, date format, content lengths,
 * numeric bounds, and tags array size.
 *
 * @param data - The unknown object to validate
 * @returns boolean type-guard check
 */
export function isValidJournalEntry(data: unknown): data is JournalEntry {
  if (!data || typeof data !== 'object') return false;
  const j = data as Record<string, unknown>;
  return (
    typeof j.id === 'string' && j.id.length > 0 && j.id.length <= INPUT_LIMITS.ID_MAX_LENGTH &&
    typeof j.date === 'string' &&
    /^\d{4}-\d{2}-\d{2}$/.test(j.date) &&
    typeof j.title === 'string' && j.title.length <= INPUT_LIMITS.JOURNAL_TITLE && j.title.trim() !== '' &&
    typeof j.content === 'string' && j.content.length <= INPUT_LIMITS.JOURNAL_CONTENT && j.content.trim() !== '' &&
    typeof j.gratitude === 'string' && j.gratitude.length <= INPUT_LIMITS.JOURNAL_GRATITUDE &&
    typeof j.achievement === 'string' && j.achievement.length <= INPUT_LIMITS.JOURNAL_ACHIEVEMENT &&
    typeof j.mood === 'number' && Number.isFinite(j.mood) && j.mood >= 1 && j.mood <= 10 &&
    typeof j.stress === 'number' && Number.isFinite(j.stress) && j.stress >= 1 && j.stress <= 10 &&
    Array.isArray(j.tags) && j.tags.length <= INPUT_LIMITS.MAX_TAGS &&
      j.tags.every((t: unknown) => typeof t === 'string' && t.length <= INPUT_LIMITS.JOURNAL_TAG)
  );
}

/**
 * Validates check-in fields against bounds, typings, and length limits.
 * Returns granular error messages for each invalid field.
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

  const validExams: readonly string[] = VALID_EXAM_TYPES;
  if (!payload.examType || typeof payload.examType !== 'string' || !validExams.includes(payload.examType)) {
    errors.push(`Exam type must be one of: ${validExams.join(', ')}.`);
  }

  if (!payload.date || typeof payload.date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(payload.date)) {
    errors.push('Log date must be formatted in YYYY-MM-DD.');
  }

  if (payload.notes !== undefined && typeof payload.notes === 'string' && payload.notes.length > INPUT_LIMITS.CHECKIN_NOTES) {
    errors.push(`Notes content cannot exceed ${INPUT_LIMITS.CHECKIN_NOTES} characters.`);
  }

  // Validate triggers array
  if (Array.isArray(payload.triggers)) {
    if (payload.triggers.length > INPUT_LIMITS.MAX_TRIGGERS) {
      errors.push(`Cannot select more than ${INPUT_LIMITS.MAX_TRIGGERS} stress triggers.`);
    }
  }

  // Validate exerciseMinutes bounds
  if (payload.exerciseMinutes !== undefined) {
    const exercise = Number(payload.exerciseMinutes);
    if (isNaN(exercise) || exercise < 0 || exercise > 300) {
      errors.push('Exercise duration must be between 0 and 300 minutes.');
    }
  }

  // Validate waterCups bounds
  if (payload.waterCups !== undefined) {
    const water = Number(payload.waterCups);
    if (isNaN(water) || water < 0 || water > 30) {
      errors.push('Water cups must be between 0 and 30.');
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Validates journal entry fields against bounds, typings, and length limits.
 * Returns granular error messages for each invalid field.
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

  // Validate date format
  if (!payload.date || typeof payload.date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(payload.date)) {
    errors.push('Entry date must be formatted in YYYY-MM-DD.');
  }

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

  // Validate tags array
  if (Array.isArray(payload.tags)) {
    if (payload.tags.length > INPUT_LIMITS.MAX_TAGS) {
      errors.push(`Cannot have more than ${INPUT_LIMITS.MAX_TAGS} tags.`);
    }
    for (const tag of payload.tags) {
      if (typeof tag === 'string' && tag.length > INPUT_LIMITS.JOURNAL_TAG) {
        errors.push(`Each tag cannot exceed ${INPUT_LIMITS.JOURNAL_TAG} characters.`);
        break; // One error message is enough
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
