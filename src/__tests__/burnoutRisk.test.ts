import { describe, it, expect } from 'vitest';
import { classifyWellnessStatus } from '../utils/wellnessEngine';

describe('Burnout Risk & Stress Classifications', () => {
  it('should classify score >= 75 as Healthy', () => {
    expect(classifyWellnessStatus(75)).toBe('Healthy');
    expect(classifyWellnessStatus(90)).toBe('Healthy');
    expect(classifyWellnessStatus(100)).toBe('Healthy');
  });

  it('should classify score between 50 and 74 as Moderate Concern', () => {
    expect(classifyWellnessStatus(50)).toBe('Moderate Concern');
    expect(classifyWellnessStatus(62)).toBe('Moderate Concern');
    expect(classifyWellnessStatus(74)).toBe('Moderate Concern');
  });

  it('should classify score between 30 and 49 as High Stress', () => {
    expect(classifyWellnessStatus(30)).toBe('High Stress');
    expect(classifyWellnessStatus(40)).toBe('High Stress');
    expect(classifyWellnessStatus(49)).toBe('High Stress');
  });

  it('should classify score < 30 as Burnout Risk', () => {
    expect(classifyWellnessStatus(0)).toBe('Burnout Risk');
    expect(classifyWellnessStatus(15)).toBe('Burnout Risk');
    expect(classifyWellnessStatus(29)).toBe('Burnout Risk');
  });
});
