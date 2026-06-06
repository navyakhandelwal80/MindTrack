import { useState, useEffect } from 'react';
import type { CheckIn, JournalEntry, UserProfile } from '../types';
import {
  getProfile,
  saveProfile as storageSaveProfile,
  getCheckIns,
  saveCheckIn as storageSaveCheckIn,
  getJournalEntries,
  saveJournalEntry as storageSaveJournalEntry,
  deleteJournalEntry as storageDeleteJournalEntry,
  initStorage
} from '../utils/storage';
import { calculateCheckInStreak, calculateDaysRemaining } from '../utils/date';
import {
  sanitizeString,
  sanitizeId,
  clampNumber,
  validateCheckIn,
  validateJournalEntry,
  INPUT_LIMITS
} from '../utils/securityUtils';

/**
 * Central data management hook for the MindTrack application.
 * Handles loading, validating, sanitizing, and persisting all user data.
 * All inputs are sanitized with enforced length limits before storage.
 */
export function useWellnessData() {
  const [profile, setProfile] = useState<UserProfile>({
    name: 'Aspirant',
    exam: 'JEE',
    examDate: '',
    dailyStudyGoal: 8,
    dailySleepGoal: 7
  });
  const [checkins, setCheckins] = useState<CheckIn[]>([]);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);

  // Initialize and load all data from storage
  const loadData = () => {
    try {
      initStorage();
      const loadedProfile = getProfile();
      const loadedCheckins = getCheckIns();
      const loadedJournal = getJournalEntries();

      setProfile(loadedProfile);
      setCheckins(loadedCheckins);
      setJournalEntries(loadedJournal);
    } catch (err) {
      console.error('[useWellnessData] Failed to load data from storage:', err);
      // State remains at safe defaults
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Save Profile with input sanitization and bounds enforcement
  const saveProfileData = (updatedProfile: UserProfile) => {
    try {
      const sanitized: UserProfile = {
        name: sanitizeString(updatedProfile.name.trim(), INPUT_LIMITS.PROFILE_NAME),
        exam: updatedProfile.exam,
        examDate: updatedProfile.examDate,
        dailyStudyGoal: clampNumber(updatedProfile.dailyStudyGoal, 0, 24, 8),
        dailySleepGoal: clampNumber(updatedProfile.dailySleepGoal, 0, 24, 7)
      };
      storageSaveProfile(sanitized);
      loadData();
    } catch (err) {
      console.error('[useWellnessData] Failed to save profile:', err);
    }
  };

  // Save Check-in with validation, sanitization, and enforced limits
  const saveCheckInData = (checkin: CheckIn): { success: boolean; errors?: string[] } => {
    try {
      const validationResult = validateCheckIn(checkin);
      if (!validationResult.valid) {
        return { success: false, errors: validationResult.errors };
      }

      const sanitizedCheckin: CheckIn = {
        ...checkin,
        id: sanitizeId(checkin.id) || `checkin-${Date.now()}`,
        notes: checkin.notes
          ? sanitizeString(checkin.notes, INPUT_LIMITS.CHECKIN_NOTES)
          : undefined,
        triggers: checkin.triggers
          .slice(0, INPUT_LIMITS.MAX_TRIGGERS)
          .map((t) => sanitizeString(t, 50))
      };

      storageSaveCheckIn(sanitizedCheckin);
      loadData();
      return { success: true };
    } catch (err) {
      console.error('[useWellnessData] Failed to save check-in:', err);
      return { success: false, errors: ['An unexpected error occurred while saving.'] };
    }
  };

  // Save Journal Entry with validation, sanitization, and enforced limits
  const saveJournalEntryData = (entry: JournalEntry): { success: boolean; errors?: string[] } => {
    try {
      const validationResult = validateJournalEntry(entry);
      if (!validationResult.valid) {
        return { success: false, errors: validationResult.errors };
      }

      const sanitizedEntry: JournalEntry = {
        id: sanitizeId(entry.id) || `journal-${Date.now()}`,
        date: entry.date,
        title: sanitizeString(entry.title.trim(), INPUT_LIMITS.JOURNAL_TITLE),
        content: sanitizeString(entry.content.trim(), INPUT_LIMITS.JOURNAL_CONTENT),
        gratitude: sanitizeString(entry.gratitude.trim(), INPUT_LIMITS.JOURNAL_GRATITUDE),
        achievement: sanitizeString(entry.achievement.trim(), INPUT_LIMITS.JOURNAL_ACHIEVEMENT),
        mood: entry.mood,
        stress: entry.stress,
        tags: entry.tags
          .slice(0, INPUT_LIMITS.MAX_TAGS)
          .map((t) => sanitizeString(t.trim(), INPUT_LIMITS.JOURNAL_TAG))
      };

      storageSaveJournalEntry(sanitizedEntry);
      loadData();
      return { success: true };
    } catch (err) {
      console.error('[useWellnessData] Failed to save journal entry:', err);
      return { success: false, errors: ['An unexpected error occurred while saving.'] };
    }
  };

  // Delete Journal Entry with ID validation
  const deleteJournalEntryData = (id: string) => {
    try {
      storageDeleteJournalEntry(id);
      loadData();
    } catch (err) {
      console.error('[useWellnessData] Failed to delete journal entry:', err);
    }
  };

  return {
    profile,
    checkins,
    journalEntries,
    /** Current consecutive check-in day count (derived, not stored) */
    streak: calculateCheckInStreak(checkins),
    /** Days until target exam date (derived, not stored) */
    daysRemaining: calculateDaysRemaining(profile.examDate),
    saveProfile: saveProfileData,
    saveCheckIn: saveCheckInData,
    saveJournalEntry: saveJournalEntryData,
    deleteJournalEntry: deleteJournalEntryData
  };
}

export default useWellnessData;
