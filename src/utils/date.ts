import type { CheckIn } from '../types';

/**
 * Formats a Date object to YYYY-MM-DD.
 * @param date - The Date object to format
 * @returns ISO string format (YYYY-MM-DD)
 */
export function formatDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Formats an ISO date string to a shorter user-friendly label (e.g. "Jun 6").
 * @param dateStr - The input date string
 * @returns Human-readable date label
 */
export function formatDateLabel(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
  } catch {
    return dateStr;
  }
}

/**
 * Gets a Date object corresponding to a number of days ago.
 * @param days - Number of days offset
 * @returns Date offset object
 */
export function getDaysAgo(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
}

/**
 * Calculates the number of remaining days until the target exam date.
 * @param examDateStr - Target exam date (YYYY-MM-DD)
 * @returns Remaining days (or 0 if past or unset)
 */
export function calculateDaysRemaining(examDateStr: string | undefined | null): number {
  if (!examDateStr) return 0;
  try {
    const examDate = new Date(examDateStr);
    const today = new Date();
    examDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    const diffTime = examDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  } catch {
    return 0;
  }
}

/**
 * Calculates consecutive check-in streaks based on dates.
 * @param checkins - User check-in history logs
 * @returns Count of consecutive check-in days
 */
export function calculateCheckInStreak(checkins: CheckIn[]): number {
  if (!checkins || checkins.length === 0) return 0;
  
  const sorted = [...checkins].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const todayStr = new Date().toISOString().split('T')[0];
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  const latestEntry = sorted[0];
  if (!latestEntry) return 0;
  const latestDate = latestEntry.date;
  if (latestDate !== todayStr && latestDate !== yesterdayStr) {
    return 0;
  }

  let currentDate = new Date(latestDate);
  let count = 1;

  for (let i = 1; i < sorted.length; i++) {
    const entry = sorted[i];
    if (!entry) break;
    const nextDate = new Date(entry.date);
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
}
