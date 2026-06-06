/**
 * Sanitizes input strings by escaping standard HTML character marks to defend against XSS.
 */
export function sanitizeString(val: string): string {
  if (!val) return '';
  return val
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Validates check-in fields against bounds and formatting rules.
 */
export function validateCheckIn(data: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data || typeof data !== 'object') {
    return { valid: false, errors: ['Check-in data is invalid or null.'] };
  }

  // Range validation [1, 10]
  const validateRange = (val: any, label: string) => {
    const num = Number(val);
    if (isNaN(num) || num < 1 || num > 10 || !Number.isInteger(num)) {
      errors.push(`${label} rating must be an integer between 1 and 10.`);
    }
  };

  validateRange(data.mood, 'Mood');
  validateRange(data.stress, 'Stress');
  validateRange(data.energy, 'Energy');
  validateRange(data.sleepQuality, 'Sleep quality');

  // Study hours [0, 24]
  const study = Number(data.studyHours);
  if (isNaN(study) || study < 0 || study > 24) {
    errors.push('Study duration must be between 0 and 24 hours.');
  }

  // Exam type check
  const validExams = ['JEE', 'NEET', 'UPSC', 'CAT', 'GATE', 'CUET', 'Boards', 'Other'];
  if (!data.examType || !validExams.includes(data.examType)) {
    errors.push(`Exam type must be one of: ${validExams.join(', ')}.`);
  }

  // Date check
  if (!data.date || !/^\d{4}-\d{2}-\d{2}$/.test(data.date)) {
    errors.push('Log date must be formatted in YYYY-MM-DD.');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Validates journal entry files before committing writes.
 */
export function validateJournalEntry(data: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data || typeof data !== 'object') {
    return { valid: false, errors: ['Journal entry is invalid or null.'] };
  }

  if (!data.title || typeof data.title !== 'string' || !data.title.trim()) {
    errors.push('Reflection title cannot be empty.');
  }

  if (!data.content || typeof data.content !== 'string' || !data.content.trim()) {
    errors.push('Reflection body content cannot be empty.');
  }

  const moodNum = Number(data.mood);
  if (isNaN(moodNum) || moodNum < 1 || moodNum > 10) {
    errors.push('Mood associated with the entry must be between 1 and 10.');
  }

  const stressNum = Number(data.stress);
  if (isNaN(stressNum) || stressNum < 1 || stressNum > 10) {
    errors.push('Stress associated with the entry must be between 1 and 10.');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Safely parses storage JSON strings with default fallbacks.
 */
export function safeParseJSON<T>(jsonStr: string | null, fallback: T): T {
  if (!jsonStr) return fallback;
  try {
    return JSON.parse(jsonStr) as T;
  } catch (err) {
    console.error('Failed to parse local storage json:', err);
    return fallback;
  }
}
