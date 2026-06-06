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
export function validateCheckIn(data: unknown): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data || typeof data !== 'object') {
    return { valid: false, errors: ['Check-in data is invalid or null.'] };
  }

  const payload = data as Record<string, unknown>;

  // Range validation [1, 10]
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

  // Study hours [0, 24]
  const study = Number(payload.studyHours);
  if (isNaN(study) || study < 0 || study > 24) {
    errors.push('Study duration must be between 0 and 24 hours.');
  }

  // Exam type check
  const validExams = ['JEE', 'NEET', 'UPSC', 'CAT', 'GATE', 'CUET', 'Boards', 'Other'];
  if (!payload.examType || typeof payload.examType !== 'string' || !validExams.includes(payload.examType)) {
    errors.push(`Exam type must be one of: ${validExams.join(', ')}.`);
  }

  // Date check
  if (!payload.date || typeof payload.date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(payload.date)) {
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
export function validateJournalEntry(data: unknown): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data || typeof data !== 'object') {
    return { valid: false, errors: ['Journal entry is invalid or null.'] };
  }

  const payload = data as Record<string, unknown>;

  if (!payload.title || typeof payload.title !== 'string' || !payload.title.trim()) {
    errors.push('Reflection title cannot be empty.');
  }

  if (!payload.content || typeof payload.content !== 'string' || !payload.content.trim()) {
    errors.push('Reflection body content cannot be empty.');
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
