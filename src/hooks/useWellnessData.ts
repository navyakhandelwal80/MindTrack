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
import { sanitizeString, validateCheckIn, validateJournalEntry } from '../utils/securityUtils';

/**
 * Central data management hook for the MindTrack application.
 * Handles loading, validating, sanitizing, and persisting all user data.
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
    initStorage();
    const loadedProfile = getProfile();
    const loadedCheckins = getCheckIns();
    const loadedJournal = getJournalEntries();

    setProfile(loadedProfile);
    setCheckins(loadedCheckins);
    setJournalEntries(loadedJournal);
  };

  useEffect(() => {
    loadData();
  }, []);

  // Save Profile with input sanitization
  const saveProfileData = (updatedProfile: UserProfile) => {
    const sanitized: UserProfile = {
      name: sanitizeString(updatedProfile.name.trim()),
      exam: updatedProfile.exam,
      examDate: updatedProfile.examDate,
      dailyStudyGoal: Math.max(0, Math.min(24, Number(updatedProfile.dailyStudyGoal))),
      dailySleepGoal: Math.max(0, Math.min(24, Number(updatedProfile.dailySleepGoal)))
    };
    storageSaveProfile(sanitized);
    loadData();
  };

  // Save Check-in with validation and sanitization
  const saveCheckInData = (checkin: CheckIn): { success: boolean; errors?: string[] } => {
    const validationResult = validateCheckIn(checkin);
    if (!validationResult.valid) {
      return { success: false, errors: validationResult.errors };
    }

    const sanitizedCheckin: CheckIn = {
      ...checkin,
      notes: checkin.notes ? sanitizeString(checkin.notes) : undefined,
      triggers: checkin.triggers.map((t) => sanitizeString(t))
    };

    storageSaveCheckIn(sanitizedCheckin);
    loadData();
    return { success: true };
  };

  // Save Journal Entry with validation and sanitization
  const saveJournalEntryData = (entry: JournalEntry): { success: boolean; errors?: string[] } => {
    const validationResult = validateJournalEntry(entry);
    if (!validationResult.valid) {
      return { success: false, errors: validationResult.errors };
    }

    const sanitizedEntry: JournalEntry = {
      id: entry.id,
      date: entry.date,
      title: sanitizeString(entry.title.trim()),
      content: sanitizeString(entry.content.trim()),
      gratitude: sanitizeString(entry.gratitude.trim()),
      achievement: sanitizeString(entry.achievement.trim()),
      mood: entry.mood,
      stress: entry.stress,
      tags: entry.tags.map((t) => sanitizeString(t.trim()))
    };

    storageSaveJournalEntry(sanitizedEntry);
    loadData();
    return { success: true };
  };

  // Delete Journal Entry
  const deleteJournalEntryData = (id: string) => {
    storageDeleteJournalEntry(id);
    loadData();
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
