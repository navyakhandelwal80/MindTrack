import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import {
  sanitizeString,
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

    it('should truncate string if maxLength is defined', () => {
      const input = 'Hello World';
      const truncated = sanitizeString(input, 5);
      // 'Hello' length is 5
      expect(truncated).toBe('Hello');
    });

    it('should return empty string for null or empty values', () => {
      expect(sanitizeString('')).toBe('');
      expect(sanitizeString(null as any)).toBe('');
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

    it('should pass valid journal entry data', () => {
      const valid = {
        title: 'Mock test review',
        content: 'I did okay today.',
        mood: 6,
        stress: 5
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
      expect(result.errors.length).toBe(4);
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
