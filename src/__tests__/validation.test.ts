import { describe, it, expect } from 'vitest';
import { sanitizeString, validateCheckIn, validateJournalEntry, safeParseJSON } from '../utils/validation';

describe('Data Validation & Input Sanitization', () => {
  describe('Input Sanitization (XSS Defense)', () => {
    it('should escape HTML brackets and characters', () => {
      const dirtyHtml = '<script>alert("XSS")</script>';
      const cleanHtml = sanitizeString(dirtyHtml);
      
      expect(cleanHtml).not.toContain('<');
      expect(cleanHtml).not.toContain('>');
      expect(cleanHtml).toBe('&lt;script&gt;alert(&quot;XSS&quot;)&lt;&#x2F;script&gt;');
    });

    it('should return empty string for null or empty values', () => {
      expect(sanitizeString('')).toBe('');
      expect(sanitizeString(null as any)).toBe('');
    });
  });

  describe('Check-In Validation', () => {
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
  });

  describe('Journal Entry Validation', () => {
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
});
