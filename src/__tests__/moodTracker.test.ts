import { describe, it, expect } from 'vitest';
import { calculateAverageMetric } from '../utils/wellnessEngine';
import type { CheckIn } from '../types';

describe('Mood Tracker & Trends Calculations', () => {
  it('should return 0 average when there are no logs', () => {
    const avg = calculateAverageMetric([], 'mood');
    expect(avg).toBe(0);
  });

  it('should calculate correct average values for mood logs', () => {
    const logs: CheckIn[] = [
      {
        id: '1',
        date: '2026-06-01',
        mood: 8,
        stress: 5,
        energy: 6,
        sleepQuality: 7,
        studyHours: 8,
        examType: 'JEE',
        triggers: [],
        exerciseMinutes: 30,
        waterCups: 6
      },
      {
        id: '2',
        date: '2026-06-02',
        mood: 6,
        stress: 5,
        energy: 6,
        sleepQuality: 7,
        studyHours: 8,
        examType: 'JEE',
        triggers: [],
        exerciseMinutes: 30,
        waterCups: 6
      }
    ];

    const moodAvg = calculateAverageMetric(logs, 'mood');
    expect(moodAvg).toBe(7.0); // (8 + 6) / 2 = 7.0

    const stressAvg = calculateAverageMetric(logs, 'stress');
    expect(stressAvg).toBe(5.0);
  });

  it('should handle decimal float rounding correctly', () => {
    const logs: CheckIn[] = [
      {
        id: '1',
        date: '2026-06-01',
        mood: 8,
        stress: 3,
        energy: 5,
        sleepQuality: 6,
        studyHours: 8,
        examType: 'JEE',
        triggers: [],
        exerciseMinutes: 30,
        waterCups: 6
      },
      {
        id: '2',
        date: '2026-06-02',
        mood: 7,
        stress: 3,
        energy: 5,
        sleepQuality: 6,
        studyHours: 8,
        examType: 'JEE',
        triggers: [],
        exerciseMinutes: 30,
        waterCups: 6
      },
      {
        id: '3',
        date: '2026-06-03',
        mood: 7,
        stress: 3,
        energy: 5,
        sleepQuality: 6,
        studyHours: 8,
        examType: 'JEE',
        triggers: [],
        exerciseMinutes: 30,
        waterCups: 6
      }
    ];

    // (8 + 7 + 7) / 3 = 7.333333333333333... should round to 7.3
    const avg = calculateAverageMetric(logs, 'mood');
    expect(avg).toBe(7.3);
  });
});
