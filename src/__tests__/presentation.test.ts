import { describe, it, expect } from 'vitest';
import {
  getRatingColor,
  getMoodEmojiOnly,
  getMoodEmojiWithLabel,
  getStressLabel,
  getEnergyLabel,
  getSleepLabel,
  getStatusColor,
} from '../utils/presentation';

describe('Presentation Utility Functions', () => {

  describe('getRatingColor', () => {
    it('should return success color for low stress (≤ 3.5)', () => {
      expect(getRatingColor(2, 'stress')).toBe('var(--success)');
      expect(getRatingColor(3.5, 'stress')).toBe('var(--success)');
    });

    it('should return warning color for moderate stress (3.5–7.4)', () => {
      expect(getRatingColor(5, 'stress')).toBe('var(--warning)');
      expect(getRatingColor(7, 'stress')).toBe('var(--warning)');
    });

    it('should return danger color for high stress (> 7.4)', () => {
      expect(getRatingColor(8, 'stress')).toBe('var(--danger)');
    });

    it('should return danger color for low mood (≤ 4.4)', () => {
      expect(getRatingColor(3, 'mood')).toBe('var(--danger)');
    });

    it('should return warning for moderate mood (4.5–7.4)', () => {
      expect(getRatingColor(6, 'mood')).toBe('var(--warning)');
    });

    it('should return success for high mood (> 7.4)', () => {
      expect(getRatingColor(8, 'mood')).toBe('var(--success)');
    });

    it('should handle energy and sleep like mood (higher is better)', () => {
      expect(getRatingColor(3, 'energy')).toBe('var(--danger)');
      expect(getRatingColor(6, 'sleep')).toBe('var(--warning)');
      expect(getRatingColor(9, 'general')).toBe('var(--success)');
    });
  });

  describe('getMoodEmojiOnly', () => {
    it('should return correct emoji per mood range', () => {
      expect(getMoodEmojiOnly(1)).toBe('😫');
      expect(getMoodEmojiOnly(3)).toBe('😔');
      expect(getMoodEmojiOnly(5)).toBe('😐');
      expect(getMoodEmojiOnly(7)).toBe('😊');
      expect(getMoodEmojiOnly(9)).toBe('😇');
    });
  });

  describe('getMoodEmojiWithLabel', () => {
    it('should return emoji with label string per range', () => {
      expect(getMoodEmojiWithLabel(1)).toContain('Very Low');
      expect(getMoodEmojiWithLabel(4)).toContain('Low');
      expect(getMoodEmojiWithLabel(5)).toContain('Neutral');
      expect(getMoodEmojiWithLabel(8)).toContain('Good');
      expect(getMoodEmojiWithLabel(10)).toContain('Excellent');
    });
  });

  describe('getStressLabel', () => {
    it('should return correct label per range', () => {
      expect(getStressLabel(2)).toBe('Relaxed');
      expect(getStressLabel(5)).toBe('Moderate');
      expect(getStressLabel(9)).toBe('Burned Out');
    });
  });

  describe('getEnergyLabel', () => {
    it('should return correct label per range', () => {
      expect(getEnergyLabel(2)).toBe('Exhausted');
      expect(getEnergyLabel(5)).toBe('Moderate');
      expect(getEnergyLabel(9)).toBe('Energetic');
    });
  });

  describe('getSleepLabel', () => {
    it('should return correct label per range', () => {
      expect(getSleepLabel(2)).toBe('Poor');
      expect(getSleepLabel(5)).toBe('Restless');
      expect(getSleepLabel(9)).toBe('Refreshed');
    });
  });

  describe('getStatusColor', () => {
    it('should map each WellnessStatus to a color', () => {
      expect(getStatusColor('Healthy')).toBe('var(--success)');
      expect(getStatusColor('Moderate Concern')).toBe('var(--warning)');
      expect(getStatusColor('High Stress')).toBe('#f97316');
      expect(getStatusColor('Burnout Risk')).toBe('var(--danger)');
    });
  });
});
