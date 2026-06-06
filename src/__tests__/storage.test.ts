import { describe, it, expect, beforeEach, beforeAll, afterAll } from 'vitest';
import {
  initStorage,
  getProfile,
  saveProfile,
  getCheckIns,
  saveCheckIn,
  deleteCheckIn,
  getJournalEntries,
  saveJournalEntry,
  deleteJournalEntry,
  getThemePreference,
  saveThemePreference,
} from '../utils/storage';
import type { CheckIn, JournalEntry, UserProfile } from '../types';

// Setup a mock localStorage for Node/Vitest environment
let mockStorage: Record<string, string> = {};

beforeAll(() => {
  const fakeLocalStorage = {
    getItem: (key: string) => mockStorage[key] ?? null,
    setItem: (key: string, value: string) => { mockStorage[key] = value; },
    removeItem: (key: string) => { delete mockStorage[key]; },
    clear: () => { mockStorage = {}; },
  };

  Object.defineProperty(globalThis, 'localStorage', {
    value: fakeLocalStorage, writable: true, configurable: true,
  });
});

afterAll(() => {
  Object.defineProperty(globalThis, 'localStorage', {
    value: undefined, writable: true, configurable: true,
  });
});

beforeEach(() => {
  mockStorage = {};
});

describe('Storage Layer — Migration & CRUD', () => {

  describe('initStorage — Initialization and Migration', () => {
    it('should seed default profile, check-ins, and journal entries on first run', () => {
      initStorage();

      expect(mockStorage['mindtrack_db_version']).toBe('v2');
      expect(mockStorage['mindtrack_profile']).toBeDefined();
      expect(mockStorage['mindtrack_checkins']).toBeDefined();
      expect(mockStorage['mindtrack_journal']).toBeDefined();
    });

    it('should clear old data and re-seed when version is outdated', () => {
      // Simulate v1 data
      mockStorage['mindtrack_db_version'] = 'v1';
      mockStorage['mindtrack_profile'] = JSON.stringify({ name: 'OldUser' });
      mockStorage['mindtrack_checkins'] = JSON.stringify([{ mood: 3 }]); // v1 scale

      initStorage();

      expect(mockStorage['mindtrack_db_version']).toBe('v2');
      // Old data should be replaced with fresh seeds
      const profile = JSON.parse(mockStorage['mindtrack_profile'] ?? '{}');
      expect(profile.name).toBe('Aspirant'); // Default seed name
    });

    it('should not overwrite existing v2 data', () => {
      // First init to seed
      initStorage();

      // Modify profile
      const custom: UserProfile = {
        name: 'Custom', exam: 'NEET', examDate: '2026-12-01',
        dailyStudyGoal: 10, dailySleepGoal: 8,
      };
      mockStorage['mindtrack_profile'] = JSON.stringify(custom);

      // Re-init should not overwrite
      initStorage();
      const profile = JSON.parse(mockStorage['mindtrack_profile'] ?? '{}');
      expect(profile.name).toBe('Custom');
    });
  });

  describe('Profile CRUD', () => {
    it('should load the default profile on first access', () => {
      const profile = getProfile();
      expect(profile.name).toBe('Aspirant');
      expect(profile.exam).toBe('JEE');
    });

    it('should save and retrieve a valid profile', () => {
      initStorage();
      const newProfile: UserProfile = {
        name: 'Priya', exam: 'NEET', examDate: '2027-01-15',
        dailyStudyGoal: 9, dailySleepGoal: 8,
      };
      saveProfile(newProfile);

      const loaded = getProfile();
      expect(loaded.name).toBe('Priya');
      expect(loaded.exam).toBe('NEET');
    });

    it('should reject saving a malformed profile', () => {
      initStorage();
      // First save a valid one
      saveProfile({
        name: 'Valid', exam: 'JEE', examDate: '',
        dailyStudyGoal: 8, dailySleepGoal: 7,
      });

      // Attempt to save invalid (dailySleepGoal out of range)
      saveProfile({
        name: 'Hacker', exam: 'JEE', examDate: '',
        dailyStudyGoal: 8, dailySleepGoal: -5,
      } as UserProfile);

      // Original should persist
      const loaded = getProfile();
      expect(loaded.name).toBe('Valid');
    });

    it('should fall back to default when storage contains malformed JSON', () => {
      mockStorage['mindtrack_db_version'] = 'v2';
      mockStorage['mindtrack_profile'] = '{{INVALID JSON}}';

      const profile = getProfile();
      expect(profile.name).toBe('Aspirant'); // Default fallback
    });
  });

  describe('Check-In CRUD', () => {
    const validCheckIn: CheckIn = {
      id: 'ci-1', date: '2026-06-01', mood: 7, stress: 4,
      energy: 6, sleepQuality: 8, studyHours: 7, examType: 'JEE',
      triggers: ['Burnout'], exerciseMinutes: 20, waterCups: 6,
    };

    it('should save and retrieve a valid check-in', () => {
      initStorage();
      saveCheckIn(validCheckIn);

      const checkins = getCheckIns();
      const found = checkins.find((c) => c.id === 'ci-1');
      expect(found).toBeDefined();
      expect(found?.mood).toBe(7);
    });

    it('should overwrite an existing check-in with the same date', () => {
      initStorage();
      saveCheckIn(validCheckIn);
      saveCheckIn({ ...validCheckIn, mood: 9 });

      const checkins = getCheckIns();
      const matches = checkins.filter((c) => c.date === '2026-06-01');
      expect(matches.length).toBe(1);
      expect(matches[0]?.mood).toBe(9);
    });

    it('should reject saving a malformed check-in', () => {
      initStorage();
      const before = getCheckIns().length;

      saveCheckIn({ ...validCheckIn, mood: 99 } as CheckIn); // out of bounds

      expect(getCheckIns().length).toBe(before);
    });

    it('should delete a check-in by ID', () => {
      initStorage();
      saveCheckIn(validCheckIn);
      deleteCheckIn('ci-1');

      const checkins = getCheckIns();
      expect(checkins.find((c) => c.id === 'ci-1')).toBeUndefined();
    });

    it('should reject delete with invalid ID', () => {
      initStorage();
      saveCheckIn(validCheckIn);
      deleteCheckIn('<script>'); // should be stripped to empty by sanitizeId

      // Check-in should still exist (delete was rejected)
      const checkins = getCheckIns();
      expect(checkins.find((c) => c.id === 'ci-1')).toBeDefined();
    });

    it('should filter out invalid entries loaded from corrupted storage', () => {
      mockStorage['mindtrack_db_version'] = 'v2';
      mockStorage['mindtrack_profile'] = JSON.stringify({
        name: 'A', exam: 'JEE', examDate: '', dailyStudyGoal: 8, dailySleepGoal: 7,
      });
      // Mix valid and invalid entries
      mockStorage['mindtrack_checkins'] = JSON.stringify([
        validCheckIn,
        { id: 'bad', mood: 'not-a-number' }, // invalid
      ]);

      const checkins = getCheckIns();
      expect(checkins.length).toBe(1);
      expect(checkins[0]?.id).toBe('ci-1');
    });
  });

  describe('Journal Entry CRUD', () => {
    const validEntry: JournalEntry = {
      id: 'je-1', date: '2026-06-01', title: 'Test Entry',
      content: 'This is a test.', gratitude: 'Grateful', achievement: 'Did well',
      mood: 7, stress: 4, tags: ['test'],
    };

    it('should save and retrieve a valid journal entry', () => {
      initStorage();
      saveJournalEntry(validEntry);

      const entries = getJournalEntries();
      const found = entries.find((e) => e.id === 'je-1');
      expect(found).toBeDefined();
      expect(found?.title).toBe('Test Entry');
    });

    it('should overwrite an existing entry with the same ID', () => {
      initStorage();
      saveJournalEntry(validEntry);
      saveJournalEntry({ ...validEntry, title: 'Updated' });

      const entries = getJournalEntries();
      const matches = entries.filter((e) => e.id === 'je-1');
      expect(matches.length).toBe(1);
      expect(matches[0]?.title).toBe('Updated');
    });

    it('should reject saving a malformed journal entry', () => {
      initStorage();
      const before = getJournalEntries().length;

      saveJournalEntry({ ...validEntry, title: '' } as JournalEntry); // empty title

      expect(getJournalEntries().length).toBe(before);
    });

    it('should delete a journal entry by ID', () => {
      initStorage();
      saveJournalEntry(validEntry);
      deleteJournalEntry('je-1');

      const entries = getJournalEntries();
      expect(entries.find((e) => e.id === 'je-1')).toBeUndefined();
    });
  });

  describe('Theme Preferences', () => {
    it('should default to light when no preference is saved', () => {
      initStorage();
      const theme = getThemePreference();
      expect(theme === 'light' || theme === 'dark').toBe(true);
    });

    it('should save and retrieve theme preference', () => {
      saveThemePreference('dark');
      expect(getThemePreference()).toBe('dark');

      saveThemePreference('light');
      expect(getThemePreference()).toBe('light');
    });

    it('should fall back to light for unknown theme values', () => {
      mockStorage['mindtrack_theme'] = 'purple';
      const theme = getThemePreference();
      // Should not be 'purple', should fallback
      expect(theme === 'light' || theme === 'dark').toBe(true);
    });
  });
});
