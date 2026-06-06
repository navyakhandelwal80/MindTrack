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
import { sanitizeString, validateCheckIn, validateJournalEntry } from '../utils/validation';

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
  const [streak, setStreak] = useState<number>(0);
  const [daysRemaining, setDaysRemaining] = useState<number>(0);

  // Initialize and load
  const loadData = () => {
    initStorage();
    const loadedProfile = getProfile();
    const loadedCheckins = getCheckIns();
    const loadedJournal = getJournalEntries();

    setProfile(loadedProfile);
    setCheckins(loadedCheckins);
    setJournalEntries(loadedJournal);

    // Calculate countdown
    if (loadedProfile.examDate) {
      const examDateObj = new Date(loadedProfile.examDate);
      const today = new Date();
      examDateObj.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);
      const diffTime = examDateObj.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      setDaysRemaining(diffDays > 0 ? diffDays : 0);
    } else {
      setDaysRemaining(0);
    }

    // Calculate streak
    setStreak(calculateStreak(loadedCheckins));
  };

  useEffect(() => {
    loadData();
  }, []);

  // Streak calculation helper
  const calculateStreak = (logs: CheckIn[]) => {
    if (logs.length === 0) return 0;
    
    const sorted = [...logs].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    const todayStr = new Date().toISOString().split('T')[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    const latestDate = sorted[0].date;
    if (latestDate !== todayStr && latestDate !== yesterdayStr) {
      return 0;
    }

    let currentDate = new Date(latestDate);
    let count = 1;

    for (let i = 1; i < sorted.length; i++) {
      const nextDate = new Date(sorted[i].date);
      const diffTime = currentDate.getTime() - nextDate.getTime();
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        count++;
        currentDate = nextDate;
      } else if (diffDays > 1) {
        break;
      }
    }
    return count;
  };

  // Save Profile with input sanitization
  const saveProfileData = (updatedProfile: UserProfile) => {
    const sanitized: UserProfile = {
      name: sanitizeString(updatedProfile.name.trim()),
      exam: sanitizeString(updatedProfile.exam.trim()),
      examDate: updatedProfile.examDate,
      dailyStudyGoal: Math.max(0, Math.min(24, Number(updatedProfile.dailyStudyGoal))),
      dailySleepGoal: Math.max(0, Math.min(24, Number(updatedProfile.dailySleepGoal)))
    };
    storageSaveProfile(sanitized);
    loadData(); // reload
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
    loadData(); // reload
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
    loadData(); // reload
    return { success: true };
  };

  // Delete Journal Entry
  const deleteJournalEntryData = (id: string) => {
    storageDeleteJournalEntry(id);
    loadData(); // reload
  };

  return {
    profile,
    checkins,
    journalEntries,
    streak,
    daysRemaining,
    saveProfile: saveProfileData,
    saveCheckIn: saveCheckInData,
    saveJournalEntry: saveJournalEntryData,
    deleteJournalEntry: deleteJournalEntryData
  };
}

export default useWellnessData;
