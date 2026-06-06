import { describe, it, expect } from 'vitest';
import { generateWellnessRecommendations } from '../utils/wellnessEngine';
import type { CheckIn, JournalEntry, UserProfile } from '../types';

describe('Wellness Recommendations Generator', () => {
  const mockProfile: UserProfile = {
    name: 'Ananya',
    exam: 'NEET',
    examDate: '2026-08-01',
    dailyStudyGoal: 8,
    dailySleepGoal: 7
  };

  it('should generate personalized encouragement referencing name and exam', () => {
    const emptyLogs: CheckIn[] = [];
    const emptyJournal: JournalEntry[] = [];
    
    const recs = generateWellnessRecommendations(emptyLogs, emptyJournal, mockProfile);
    
    expect(recs.encouragement).toContain('Ananya');
    expect(recs.encouragement).toContain('NEET');
    expect(recs.status).toBe('Moderate Concern'); // baseline defaults to 70 score -> Moderate Concern
  });

  it('should generate sleep warning when sleep quality is low', () => {
    const poorSleepLogs: CheckIn[] = [
      {
        id: '1',
        date: '2026-06-01',
        mood: 5,
        stress: 5,
        energy: 4,
        sleepQuality: 3, // poor sleep
        studyHours: 8,
        examType: 'NEET',
        triggers: [],
        exerciseMinutes: 30,
        waterCups: 6
      }
    ];

    const recs = generateWellnessRecommendations(poorSleepLogs, [], mockProfile);
    
    expect(recs.sleepImprovement.join(' ')).toContain('sleep quality is low');
    expect(recs.sleepImprovement.join(' ')).toContain('bedtime');
  });

  it('should generate study balance suggestions when study hours are excessive', () => {
    const overstudyLogs: CheckIn[] = [
      {
        id: '1',
        date: '2026-06-01',
        mood: 4,
        stress: 8,
        energy: 4,
        sleepQuality: 5,
        studyHours: 13, // excessive study
        examType: 'NEET',
        triggers: ['Burnout'],
        exerciseMinutes: 0,
        waterCups: 4
      }
    ];

    const recs = generateWellnessRecommendations(overstudyLogs, [], mockProfile);
    
    expect(recs.studyLifeBalance.join(' ')).toContain('hours');
    expect(recs.studyLifeBalance.join(' ')).toContain('Pomodoro');
  });

  it('should append specific triggers recommendations', () => {
    const logs: CheckIn[] = [
      {
        id: '1',
        date: '2026-06-01',
        mood: 6,
        stress: 6,
        energy: 6,
        sleepQuality: 6,
        studyHours: 8,
        examType: 'NEET',
        triggers: ['Peer comparison', 'Result anxiety'],
        exerciseMinutes: 20,
        waterCups: 7
      }
    ];

    const recs = generateWellnessRecommendations(logs, [], mockProfile);
    
    expect(recs.stressRecommendations.join(' ').toLowerCase()).toContain('peer');
    expect(recs.stressRecommendations.join(' ').toLowerCase()).toContain('mock');
  });
});
