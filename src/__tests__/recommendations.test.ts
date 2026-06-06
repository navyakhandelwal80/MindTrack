import { describe, it, expect } from 'vitest';
import { generateWellnessRecommendations, calculateWellnessScore } from '../utils/wellnessEngine';
import type { CheckIn, JournalEntry, UserProfile } from '../types';

/**
 * Helper to build a valid CheckIn with overrides.
 */
function makeCheckIn(overrides: Partial<CheckIn> = {}): CheckIn {
  return {
    id: 'test-1', date: '2026-06-01', mood: 6, stress: 5,
    energy: 6, sleepQuality: 6, studyHours: 8, examType: 'JEE',
    triggers: [], exerciseMinutes: 30, waterCups: 6, ...overrides,
  };
}

function makeProfile(overrides: Partial<UserProfile> = {}): UserProfile {
  return {
    name: 'Ravi', exam: 'JEE', examDate: '2026-12-01',
    dailyStudyGoal: 8, dailySleepGoal: 7, ...overrides,
  };
}

function makeJournal(overrides: Partial<JournalEntry> = {}): JournalEntry {
  return {
    id: 'j-1', date: '2026-06-01', title: 'Test', content: 'Body',
    gratitude: '', achievement: '', mood: 6, stress: 5, tags: [], ...overrides,
  };
}

describe('Wellness Engine — Uncovered Edge Cases', () => {

  describe('Wellness Score — Under-Study Penalty', () => {
    it('should penalise under-studying (avgStudy < 3)', () => {
      const underStudyLogs = [makeCheckIn({ studyHours: 1 }), makeCheckIn({ studyHours: 2 })];
      const normalLogs = [makeCheckIn({ studyHours: 7 }), makeCheckIn({ studyHours: 8 })];

      const underScore = calculateWellnessScore(underStudyLogs);
      const normalScore = calculateWellnessScore(normalLogs);

      expect(underScore).toBeLessThan(normalScore);
    });
  });

  describe('Wellness Score — Lack of Preparation Trigger Penalty', () => {
    it('should reduce score when "Lack of preparation" trigger is present', () => {
      const withTrigger = [makeCheckIn({ triggers: ['Lack of preparation'] })];
      const withoutTrigger = [makeCheckIn({ triggers: [] })];

      expect(calculateWellnessScore(withTrigger)).toBeLessThan(calculateWellnessScore(withoutTrigger));
    });
  });

  describe('Burnout Risk Assessment Text', () => {
    it('should return CRITICAL LIMIT text when burnout triggers >= 2', () => {
      const logs = [
        makeCheckIn({ triggers: ['Burnout', 'Lack of preparation'], mood: 6, stress: 5 }),
        makeCheckIn({ id: 'test-2', triggers: ['Burnout', 'Lack of preparation'], mood: 6, stress: 5 }),
      ];
      const recs = generateWellnessRecommendations(logs, [], makeProfile());

      expect(recs.burnoutRiskAssessment).toContain('CRITICAL LIMIT');
    });

    it('should return ELEVATED RISK text when avgStress >= 7', () => {
      const logs = [makeCheckIn({ stress: 8, mood: 7, energy: 7, sleepQuality: 7 })];
      const recs = generateWellnessRecommendations(logs, [], makeProfile());

      expect(recs.burnoutRiskAssessment).toContain('ELEVATED RISK');
    });

    it('should return LOW RISK text for healthy profiles', () => {
      const logs = [makeCheckIn({ mood: 9, stress: 2, energy: 9, sleepQuality: 9 })];
      const recs = generateWellnessRecommendations(logs, [], makeProfile());

      expect(recs.burnoutRiskAssessment).toContain('LOW RISK');
    });
  });

  describe('Trigger-Specific Stress Recommendations', () => {
    it('should add Family expectations advice when trigger is present', () => {
      const logs = [makeCheckIn({ triggers: ['Family expectations'] })];
      const recs = generateWellnessRecommendations(logs, [], makeProfile());

      expect(recs.stressRecommendations.join(' ')).toContain('family');
    });

    it('should add Exam pressure advice when trigger is present', () => {
      const logs = [makeCheckIn({ triggers: ['Exam pressure'] })];
      const recs = generateWellnessRecommendations(logs, [], makeProfile());

      expect(recs.stressRecommendations.join(' ').toLowerCase()).toContain('mock');
    });
  });

  describe('Journal Sentiment Analysis', () => {
    it('should detect "doubt" keyword and add motivational reminder', () => {
      const journal = [makeJournal({ content: 'I am full of self-doubt about my abilities.' })];
      const recs = generateWellnessRecommendations([], journal, makeProfile());

      expect(recs.motivationReminders.join(' ')).toContain('Self-doubt');
    });

    it('should detect "fear" keyword and add motivational reminder', () => {
      const journal = [makeJournal({ content: 'I fear I will not make it.' })];
      const recs = generateWellnessRecommendations([], journal, makeProfile());

      expect(recs.motivationReminders.join(' ')).toContain('Self-doubt');
    });

    it('should detect "fail"/"failure"/"failed" keywords and add comeback reminder', () => {
      const journal = [makeJournal({ content: 'I failed my mock test today.' })];
      const recs = generateWellnessRecommendations([], journal, makeProfile());

      expect(recs.motivationReminders.join(' ')).toContain('comeback');
    });

    it('should not add sentiment reminders when no keywords are present', () => {
      const journal = [makeJournal({ content: 'Today was a productive day studying.' })];
      const recs = generateWellnessRecommendations([], journal, makeProfile());

      // Only the 2 default motivational reminders
      expect(recs.motivationReminders.length).toBe(2);
    });
  });

  describe('Study-Life Balance — Under-Study Branch', () => {
    it('should suggest micro-checklist when avgStudy < 4', () => {
      const logs = [makeCheckIn({ studyHours: 2 })];
      const recs = generateWellnessRecommendations(logs, [], makeProfile());

      expect(recs.studyLifeBalance.join(' ')).toContain('micro-checklist');
    });

    it('should suggest balanced message when study hours are normal', () => {
      const logs = [makeCheckIn({ studyHours: 7 })];
      const recs = generateWellnessRecommendations(logs, [], makeProfile());

      expect(recs.studyLifeBalance.join(' ')).toContain('balanced');
    });
  });

  describe('Exam-Specific Advice Coverage', () => {
    const examTypes = ['NEET', 'UPSC', 'CAT', 'GATE', 'CUET', 'Boards', 'Other'] as const;

    for (const exam of examTypes) {
      it(`should include exam-specific advice for ${exam}`, () => {
        const profile = makeProfile({ exam });
        const recs = generateWellnessRecommendations([], [], profile);

        // Every exam type should inject at least one exam-specific line
        const allText = recs.studyLifeBalance.join(' ').toLowerCase();
        if (exam === 'Other') {
          expect(allText).toContain('daily study goals');
        } else if (exam === 'Boards') {
          expect(allText).toContain('board exams');
        } else {
          expect(allText).toContain(`for ${exam.toLowerCase()}`);
        }
      });
    }
  });

  describe('Encouragement Messages Per Status', () => {
    it('should return Healthy encouragement for score >= 75', () => {
      const logs = [makeCheckIn({ mood: 10, stress: 1, energy: 10, sleepQuality: 10 })];
      const recs = generateWellnessRecommendations(logs, [], makeProfile());

      expect(recs.status).toBe('Healthy');
      expect(recs.encouragement).toContain('Excellent progress');
    });

    it('should return High Stress encouragement for appropriate score', () => {
      // Metrics that produce a score in the 30-49 range (High Stress)
      const logs = [makeCheckIn({ mood: 4, stress: 8, energy: 4, sleepQuality: 4, studyHours: 8 })];
      const recs = generateWellnessRecommendations(logs, [], makeProfile());

      expect(recs.status).toBe('High Stress');
      expect(recs.encouragement).toContain('take a breath');
    });

    it('should return Burnout Risk encouragement for very low score', () => {
      const logs = [makeCheckIn({ mood: 1, stress: 10, energy: 1, sleepQuality: 1, studyHours: 18, triggers: ['Burnout', 'Lack of preparation'] })];
      const recs = generateWellnessRecommendations(logs, [], makeProfile());

      expect(recs.status).toBe('Burnout Risk');
      expect(recs.encouragement).toContain('burnout risk zone');
    });
  });

  describe('Sleep Improvement — Good Sleep Branch', () => {
    it('should return positive sleep message when avgSleep >= 6', () => {
      const logs = [makeCheckIn({ sleepQuality: 8 })];
      const recs = generateWellnessRecommendations(logs, [], makeProfile());

      expect(recs.sleepImprovement.join(' ')).toContain('positive');
    });
  });
});
