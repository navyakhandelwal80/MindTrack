import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import {
  sanitizeString,
  sanitizeId,
  clampNumber,
  validateCheckIn,
  validateJournalEntry,
  safeParseJSON,
  isValidProfile,
  isValidCheckIn,
  isValidJournalEntry,
  INPUT_LIMITS,
  safeStorage
} from '../utils/securityUtils';

describe('Data Validation & Security Hardening', () => {
  describe('Input Sanitization (XSS Defense & Truncation)', () => {
    it('should escape HTML brackets and characters', () => {
      const dirtyHtml = '<script>alert("XSS")</script>';
      const cleanHtml = sanitizeString(dirtyHtml);
      
      expect(cleanHtml).not.toContain('<');
      expect(cleanHtml).not.toContain('>');
      expect(cleanHtml).toBe('&lt;script&gt;alert(&quot;XSS&quot;)&lt;&#x2F;script&gt;');
    });

    it('should truncate RAW input BEFORE escaping to prevent broken entity codes', () => {
      // The '&' at position 5 would expand to '&amp;' (5 chars) during escaping.
      // If truncation happened AFTER escaping, it could cut '&amp;' mid-entity.
      // Correct behavior: truncate raw input first, then escape.
      const input = 'Hello&World';
      const truncated = sanitizeString(input, 6);
      // Raw truncation: 'Hello&' → escaped: 'Hello&amp;'
      expect(truncated).toBe('Hello&amp;');
      // Confirm entity is complete and not split
      expect(truncated).not.toMatch(/&[a-z]*$/); // no broken entities at end
    });

    it('should truncate string if maxLength is defined', () => {
      const input = 'Hello World';
      const truncated = sanitizeString(input, 5);
      expect(truncated).toBe('Hello');
    });

    it('should return empty string for null or empty values', () => {
      expect(sanitizeString('')).toBe('');
      expect(sanitizeString(null as unknown as string)).toBe('');
    });
  });

  describe('ID Sanitization', () => {
    it('should strip non-alphanumeric characters except hyphens and underscores', () => {
      expect(sanitizeId('journal-123')).toBe('journal-123');
      expect(sanitizeId('checkin_456')).toBe('checkin_456');
      expect(sanitizeId('id<script>alert(1)</script>')).toBe('idscriptalert1script');
    });

    it('should return empty string for empty or overlength IDs', () => {
      expect(sanitizeId('')).toBe('');
      expect(sanitizeId('a'.repeat(INPUT_LIMITS.ID_MAX_LENGTH + 1))).toBe('');
    });

    it('should reject non-string inputs', () => {
      expect(sanitizeId(123 as unknown as string)).toBe('');
      expect(sanitizeId(null as unknown as string)).toBe('');
    });
  });

  describe('clampNumber Utility', () => {
    it('should clamp values within range', () => {
      expect(clampNumber(5, 0, 10, 0)).toBe(5);
      expect(clampNumber(-1, 0, 10, 0)).toBe(0);
      expect(clampNumber(15, 0, 10, 0)).toBe(10);
    });

    it('should return fallback for non-numeric values', () => {
      expect(clampNumber('abc', 0, 10, 5)).toBe(5);
      expect(clampNumber(NaN, 0, 10, 5)).toBe(5);
      expect(clampNumber(Infinity, 0, 10, 5)).toBe(5);
      expect(clampNumber(undefined, 0, 10, 5)).toBe(5);
    });
  });

  describe('INPUT_LIMITS Immutability', () => {
    it('should be frozen and not allow mutation', () => {
      expect(Object.isFrozen(INPUT_LIMITS)).toBe(true);
      // Attempting to modify should silently fail (or throw in strict mode)
      expect(() => {
        (INPUT_LIMITS as Record<string, number>)['PROFILE_NAME'] = 99999;
      }).toThrow();
    });
  });

  describe('Form Fields Range & Limits Validation', () => {
    it('should pass valid check-in data', () => {
      const valid = {
        mood: 7,
        stress: 4,
        energy: 8,
        sleepQuality: 8,
        studyHours: 8.5,
        examType: 'JEE',
        date: '2026-06-06'
      };

      const result = validateCheckIn(valid);
      expect(result.valid).toBe(true);
      expect(result.errors.length).toBe(0);
    });

    it('should reject out of bound check-in data values', () => {
      const invalid = {
        mood: 11, // invalid [1, 10]
        stress: 0, // invalid [1, 10]
        energy: 5.5, // not an integer
        sleepQuality: -1, // invalid
        studyHours: 25, // invalid [0, 24]
        examType: 'SAT', // invalid exam
        date: '06-06-2026' // invalid format
      };

      const result = validateCheckIn(invalid);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThanOrEqual(6);
    });

    it('should reject check-in notes exceeding character limits', () => {
      const longNotes = 'a'.repeat(INPUT_LIMITS.CHECKIN_NOTES + 1);
      const invalid = {
        mood: 6,
        stress: 5,
        energy: 6,
        sleepQuality: 7,
        studyHours: 8,
        examType: 'JEE',
        date: '2026-06-06',
        notes: longNotes
      };

      const result = validateCheckIn(invalid);
      expect(result.valid).toBe(false);
      expect(result.errors.join(' ')).toContain('Notes content cannot exceed');
    });

    it('should reject too many triggers', () => {
      const tooManyTriggers = {
        mood: 6,
        stress: 5,
        energy: 6,
        sleepQuality: 7,
        studyHours: 8,
        examType: 'JEE',
        date: '2026-06-06',
        triggers: Array.from({ length: INPUT_LIMITS.MAX_TRIGGERS + 1 }, (_, i) => `trigger-${i}`)
      };

      const result = validateCheckIn(tooManyTriggers);
      expect(result.valid).toBe(false);
      expect(result.errors.join(' ')).toContain('stress triggers');
    });

    it('should reject out of bounds exerciseMinutes and waterCups', () => {
      const invalid = {
        mood: 6, stress: 5, energy: 6, sleepQuality: 7,
        studyHours: 8, examType: 'JEE', date: '2026-06-06',
        exerciseMinutes: 500, waterCups: 50
      };

      const result = validateCheckIn(invalid);
      expect(result.valid).toBe(false);
      expect(result.errors.join(' ')).toContain('Exercise duration');
      expect(result.errors.join(' ')).toContain('Water cups');
    });

    it('should pass valid journal entry data', () => {
      const valid = {
        title: 'Mock test review',
        content: 'I did okay today.',
        mood: 6,
        stress: 5,
        date: '2026-06-06'
      };

      const result = validateJournalEntry(valid);
      expect(result.valid).toBe(true);
    });

    it('should reject empty title or content', () => {
      const invalid = {
        title: '   ',
        content: '',
        mood: 6,
        stress: 5
      };

      const result = validateJournalEntry(invalid);
      expect(result.valid).toBe(false);
      expect(result.errors.join(' ')).toContain('title');
      expect(result.errors.join(' ')).toContain('content');
    });

    it('should reject journal title/content/gratitude/achievement exceeding length limits', () => {
      const invalid = {
        title: 'a'.repeat(INPUT_LIMITS.JOURNAL_TITLE + 1),
        content: 'a'.repeat(INPUT_LIMITS.JOURNAL_CONTENT + 1),
        gratitude: 'a'.repeat(INPUT_LIMITS.JOURNAL_GRATITUDE + 1),
        achievement: 'a'.repeat(INPUT_LIMITS.JOURNAL_ACHIEVEMENT + 1),
        mood: 6,
        stress: 5
      };

      const result = validateJournalEntry(invalid);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBe(5); // title + content + gratitude + achievement + date
    });

    it('should reject journal entry with invalid date format', () => {
      const invalid = {
        title: 'Test', content: 'Body',
        mood: 6, stress: 5, date: '06-06-2026'
      };
      const result = validateJournalEntry(invalid);
      expect(result.valid).toBe(false);
      expect(result.errors.join(' ')).toContain('date');
    });

    it('should reject journal entry with too many tags', () => {
      const invalid = {
        title: 'Test', content: 'Body',
        mood: 6, stress: 5,
        tags: Array.from({ length: INPUT_LIMITS.MAX_TAGS + 1 }, (_, i) => `tag-${i}`)
      };
      const result = validateJournalEntry(invalid);
      expect(result.valid).toBe(false);
      expect(result.errors.join(' ')).toContain('tags');
    });
  });

  describe('Runtime Schema Validators', () => {
    it('should validate and assert user profile structure', () => {
      const validProfile = {
        name: 'Aspirant',
        exam: 'JEE',
        examDate: '2026-08-30',
        dailyStudyGoal: 8,
        dailySleepGoal: 7
      };
      expect(isValidProfile(validProfile)).toBe(true);

      const invalidProfileName = { ...validProfile, name: 'a'.repeat(INPUT_LIMITS.PROFILE_NAME + 1) };
      expect(isValidProfile(invalidProfileName)).toBe(false);

      const invalidProfileGoals = { ...validProfile, dailySleepGoal: -1 };
      expect(isValidProfile(invalidProfileGoals)).toBe(false);
    });

    it('should reject profile with invalid exam type', () => {
      const invalid = {
        name: 'Student', exam: 'SAT',
        examDate: '2026-08-30', dailyStudyGoal: 8, dailySleepGoal: 7
      };
      expect(isValidProfile(invalid)).toBe(false);
    });

    it('should reject profile with Infinity/NaN goal values', () => {
      const invalid = {
        name: 'Student', exam: 'JEE',
        examDate: '2026-08-30', dailyStudyGoal: Infinity, dailySleepGoal: NaN
      };
      expect(isValidProfile(invalid)).toBe(false);
    });

    it('should validate and assert check-in logs structure', () => {
      const validCheckIn = {
        id: 'c-1',
        date: '2026-06-06',
        mood: 7,
        stress: 4,
        energy: 6,
        sleepQuality: 8,
        studyHours: 7,
        examType: 'JEE',
        triggers: ['Burnout'],
        exerciseMinutes: 20,
        waterCups: 6
      };
      expect(isValidCheckIn(validCheckIn)).toBe(true);

      const invalidCheckInType = { ...validCheckIn, mood: '7' }; // wrong type
      expect(isValidCheckIn(invalidCheckInType)).toBe(false);

      const invalidCheckInBounds = { ...validCheckIn, waterCups: 40 }; // out of bounds
      expect(isValidCheckIn(invalidCheckInBounds)).toBe(false);
    });

    it('should reject check-in with overlength ID', () => {
      const invalid = {
        id: 'a'.repeat(INPUT_LIMITS.ID_MAX_LENGTH + 1),
        date: '2026-06-06', mood: 7, stress: 4, energy: 6,
        sleepQuality: 8, studyHours: 7, examType: 'JEE',
        triggers: [], exerciseMinutes: 20, waterCups: 6
      };
      expect(isValidCheckIn(invalid)).toBe(false);
    });

    it('should reject check-in with too many triggers', () => {
      const invalid = {
        id: 'c-1', date: '2026-06-06', mood: 7, stress: 4, energy: 6,
        sleepQuality: 8, studyHours: 7, examType: 'JEE',
        triggers: Array.from({ length: INPUT_LIMITS.MAX_TRIGGERS + 1 }, () => 'x'),
        exerciseMinutes: 20, waterCups: 6
      };
      expect(isValidCheckIn(invalid)).toBe(false);
    });

    it('should validate and assert journal entry structure', () => {
      const validJournal = {
        id: 'j-1',
        date: '2026-06-06',
        title: 'Weekly check',
        content: 'Everything is fine.',
        gratitude: 'Grateful for good health',
        achievement: 'Kept to schedule',
        mood: 7,
        stress: 3,
        tags: ['health']
      };
      expect(isValidJournalEntry(validJournal)).toBe(true);

      const invalidJournalTitle = { ...validJournal, title: '' };
      expect(isValidJournalEntry(invalidJournalTitle)).toBe(false);
    });

    it('should reject journal entry with too many tags', () => {
      const invalid = {
        id: 'j-1', date: '2026-06-06', title: 'Test', content: 'Body',
        gratitude: '', achievement: '', mood: 7, stress: 3,
        tags: Array.from({ length: INPUT_LIMITS.MAX_TAGS + 1 }, () => 'x')
      };
      expect(isValidJournalEntry(invalid)).toBe(false);
    });
  });

  describe('Safe JSON parsing', () => {
    it('should safely parse valid json', () => {
      const parsed = safeParseJSON('{"a":1}', { a: 0 });
      expect(parsed.a).toBe(1);
    });

    it('should return fallback on parse error', () => {
      const parsed = safeParseJSON('invalid-json', { error: true });
      expect(parsed.error).toBe(true);
    });

    it('should return fallback for null/undefined parsed values', () => {
      const parsed = safeParseJSON('null', { fallback: true });
      expect(parsed.fallback).toBe(true);
    });
  });

  describe('Safe localStorage Wrapper', () => {
    let mockStorage: Record<string, string> = {};

    beforeAll(() => {
      const fakeLocalStorage = {
        getItem: (key: string) => mockStorage[key] || null,
        setItem: (key: string, value: string) => { mockStorage[key] = value; },
        removeItem: (key: string) => { delete mockStorage[key]; },
        clear: () => { mockStorage = {}; }
      };
      
      Object.defineProperty(globalThis, 'localStorage', {
        value: fakeLocalStorage,
        writable: true,
        configurable: true
      });
    });

    afterAll(() => {
      Object.defineProperty(globalThis, 'localStorage', {
        value: undefined,
        writable: true,
        configurable: true
      });
    });

    beforeEach(() => {
      mockStorage = {};
    });

    it('should set and get values from safeStorage', () => {
      const result = safeStorage.setItem('test-key', 'test-val');
      expect(result).toBe(true);
      const val = safeStorage.getItem('test-key');
      expect(val).toBe('test-val');
      
      const removed = safeStorage.removeItem('test-key');
      expect(removed).toBe(true);
      const valAfterRemove = safeStorage.getItem('test-key');
      expect(valAfterRemove).toBeNull();
    });

    it('should handle get/set exceptions gracefully', () => {
      localStorage.getItem = () => { throw new Error('Quota exceeded'); };
      localStorage.setItem = () => { throw new Error('Write failed'); };
      localStorage.removeItem = () => { throw new Error('Remove failed'); };
      
      const val = safeStorage.getItem('test-key');
      expect(val).toBeNull();

      const setRes = safeStorage.setItem('test-key', 'val');
      expect(setRes).toBe(false);

      const remRes = safeStorage.removeItem('test-key');
      expect(remRes).toBe(false);
    });
  });
});
