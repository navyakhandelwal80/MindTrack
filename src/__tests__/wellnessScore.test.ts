import { describe, it, expect } from 'vitest';
import { calculateWellnessScore } from '../utils/wellnessEngine';
import type { CheckIn } from '../types';

describe('Wellness Score Calculations', () => {
  it('should return a baseline score of 70 when recent logs list is empty', () => {
    const score = calculateWellnessScore([]);
    expect(score).toBe(70);
  });

  it('should calculate a high score for balanced healthy inputs', () => {
    const healthyLogs: CheckIn[] = [
      {
        id: '1',
        date: '2026-06-01',
        mood: 9,
        stress: 2,
        energy: 9,
        sleepQuality: 9,
        studyHours: 7.5,
        examType: 'JEE',
        triggers: [],
        exerciseMinutes: 30,
        waterCups: 8
      },
      {
        id: '2',
        date: '2026-06-02',
        mood: 8,
        stress: 3,
        energy: 8,
        sleepQuality: 8,
        studyHours: 8,
        examType: 'JEE',
        triggers: [],
        exerciseMinutes: 45,
        waterCups: 9
      }
    ];

    const score = calculateWellnessScore(healthyLogs);
    expect(score).toBeGreaterThanOrEqual(75);
    expect(score).toBeLessThanOrEqual(100);
  });

  it('should calculate a low score for highly stressed and fatigued logs', () => {
    const stressedLogs: CheckIn[] = [
      {
        id: '1',
        date: '2026-06-01',
        mood: 3,
        stress: 9,
        energy: 2,
        sleepQuality: 3,
        studyHours: 12.5, // over-study penalty
        examType: 'JEE',
        triggers: ['Burnout', 'Exam pressure'],
        exerciseMinutes: 0,
        waterCups: 3
      }
    ];

    const score = calculateWellnessScore(stressedLogs);
    expect(score).toBeLessThan(35);
  });

  it('should enforce boundaries of [0, 100]', () => {
    // Extreme low metrics
    const extremeLowLogs: CheckIn[] = [
      {
        id: '1',
        date: '2026-06-01',
        mood: 1,
        stress: 10,
        energy: 1,
        sleepQuality: 1,
        studyHours: 18,
        examType: 'JEE',
        triggers: ['Burnout', 'Result anxiety', 'Lack of preparation'],
        exerciseMinutes: 0,
        waterCups: 0
      }
    ];
    const lowScore = calculateWellnessScore(extremeLowLogs);
    expect(lowScore).toBe(0);

    // Extreme high metrics
    const extremeHighLogs: CheckIn[] = [
      {
        id: '1',
        date: '2026-06-01',
        mood: 10,
        stress: 1,
        energy: 10,
        sleepQuality: 10,
        studyHours: 8,
        examType: 'JEE',
        triggers: [],
        exerciseMinutes: 60,
        waterCups: 12
      }
    ];
    const highScore = calculateWellnessScore(extremeHighLogs);
    expect(highScore).toBe(100);
  });
});
