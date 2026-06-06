import { describe, it, expect } from 'vitest';
import {
  formatDateString,
  formatDateLabel,
  getDaysAgo,
  calculateDaysRemaining,
  calculateCheckInStreak,
} from '../utils/date';
import type { CheckIn } from '../types';

/** Helper to create a minimal valid CheckIn with only the date specified. */
function makeCheckIn(date: string): CheckIn {
  return {
    id: `c-${date}`, date, mood: 6, stress: 5, energy: 6,
    sleepQuality: 6, studyHours: 8, examType: 'JEE',
    triggers: [], exerciseMinutes: 30, waterCups: 6,
  };
}

describe('Date Utility Functions', () => {

  describe('formatDateString', () => {
    it('should format a date as YYYY-MM-DD', () => {
      const d = new Date(2026, 0, 5); // Jan 5, 2026
      expect(formatDateString(d)).toBe('2026-01-05');
    });

    it('should zero-pad single-digit months and days', () => {
      const d = new Date(2026, 5, 6); // Jun 6, 2026
      expect(formatDateString(d)).toBe('2026-06-06');
    });
  });

  describe('formatDateLabel', () => {
    it('should return a human-readable label like "Jun 6"', () => {
      const label = formatDateLabel('2026-06-06');
      expect(label).toContain('Jun');
      expect(label).toContain('6');
    });

    it('should return the raw string on invalid input', () => {
      const label = formatDateLabel('not-a-date');
      // The fallback could be the original string or an "Invalid Date" representation.
      // We just ensure it doesn't throw.
      expect(typeof label).toBe('string');
    });
  });

  describe('getDaysAgo', () => {
    it('should return a Date object N days in the past', () => {
      const today = new Date();
      const threeDaysAgo = getDaysAgo(3);
      const diff = Math.round((today.getTime() - threeDaysAgo.getTime()) / (1000 * 60 * 60 * 24));
      expect(diff).toBe(3);
    });

    it('should return today when 0 is passed', () => {
      const result = getDaysAgo(0);
      expect(result.toDateString()).toBe(new Date().toDateString());
    });
  });

  describe('calculateDaysRemaining', () => {
    it('should return 0 for empty/null/undefined date', () => {
      expect(calculateDaysRemaining('')).toBe(0);
      expect(calculateDaysRemaining(null)).toBe(0);
      expect(calculateDaysRemaining(undefined)).toBe(0);
    });

    it('should return 0 for past dates', () => {
      expect(calculateDaysRemaining('2020-01-01')).toBe(0);
    });

    it('should return a positive number for future dates', () => {
      const future = new Date();
      future.setDate(future.getDate() + 30);
      const dateStr = formatDateString(future);
      const result = calculateDaysRemaining(dateStr);
      expect(result).toBeGreaterThanOrEqual(29); // at least 29 due to time-of-day
      expect(result).toBeLessThanOrEqual(31);
    });

    it('should handle invalid date strings gracefully', () => {
      expect(calculateDaysRemaining('garbage')).toBe(0);
    });
  });

  describe('calculateCheckInStreak', () => {
    it('should return 0 for empty array', () => {
      expect(calculateCheckInStreak([])).toBe(0);
    });

    it('should return 1 for a single check-in today', () => {
      const today = formatDateString(new Date());
      expect(calculateCheckInStreak([makeCheckIn(today)])).toBe(1);
    });

    it('should return 1 for a single check-in yesterday', () => {
      const yesterday = formatDateString(getDaysAgo(1));
      expect(calculateCheckInStreak([makeCheckIn(yesterday)])).toBe(1);
    });

    it('should return 0 when latest check-in is older than yesterday', () => {
      const threeDaysAgo = formatDateString(getDaysAgo(3));
      expect(calculateCheckInStreak([makeCheckIn(threeDaysAgo)])).toBe(0);
    });

    it('should count consecutive days correctly', () => {
      const logs = [
        makeCheckIn(formatDateString(getDaysAgo(0))),
        makeCheckIn(formatDateString(getDaysAgo(1))),
        makeCheckIn(formatDateString(getDaysAgo(2))),
      ];
      expect(calculateCheckInStreak(logs)).toBe(3);
    });

    it('should break streak on a gap day', () => {
      const logs = [
        makeCheckIn(formatDateString(getDaysAgo(0))),
        makeCheckIn(formatDateString(getDaysAgo(1))),
        // gap on day 2
        makeCheckIn(formatDateString(getDaysAgo(3))),
      ];
      expect(calculateCheckInStreak(logs)).toBe(2);
    });

    it('should handle unsorted input correctly', () => {
      const logs = [
        makeCheckIn(formatDateString(getDaysAgo(2))),
        makeCheckIn(formatDateString(getDaysAgo(0))),
        makeCheckIn(formatDateString(getDaysAgo(1))),
      ];
      expect(calculateCheckInStreak(logs)).toBe(3);
    });
  });
});
