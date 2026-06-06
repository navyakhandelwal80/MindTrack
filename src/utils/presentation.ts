/**
 * Returns a CSS color variable name or hex string based on the metric level.
 * @param level - The metric value (1-10 or calculated average)
 * @param type - The metric dimension type
 * @returns CSS color variable name or hex code
 */
export function getRatingColor(
  level: number,
  type: 'mood' | 'stress' | 'energy' | 'sleep' | 'general'
): string {
  if (type === 'stress') {
    if (level <= 3.5 || (level < 4.5 && Number.isInteger(level))) {
      return 'var(--success)';
    }
    if (level <= 7.4) {
      return 'var(--warning)';
    }
    return 'var(--danger)';
  } else {
    // mood, energy, sleep, general (higher is better)
    if (level <= 4.4) {
      return 'var(--danger)';
    }
    if (level <= 7.4) {
      return 'var(--warning)';
    }
    return 'var(--success)';
  }
}

/**
 * Returns a mood emoji matching the score range.
 * @param score - Mood score (1-10)
 * @returns Emoji string
 */
export function getMoodEmojiOnly(score: number): string {
  if (score <= 2.4) return '😫';
  if (score <= 4.4) return '😔';
  if (score <= 6.4) return '😐';
  if (score <= 8.4) return '😊';
  return '😇';
}

/**
 * Returns a mood emoji coupled with a descriptive text label.
 * @param score - Mood score (1-10)
 * @returns Emoji and label string
 */
export function getMoodEmojiWithLabel(score: number): string {
  if (score <= 2.4) return '😫 Very Low';
  if (score <= 4.4) return '😔 Low';
  if (score <= 6.4) return '😐 Neutral';
  if (score <= 8.4) return '😊 Good';
  return '😇 Excellent';
}

/**
 * Returns a text label descriptive of the stress level.
 * @param level - Stress score (1-10)
 * @returns Stress descriptor label
 */
export function getStressLabel(level: number): string {
  if (level <= 3.4) return 'Relaxed';
  if (level <= 7.4) return 'Moderate';
  return 'Burned Out';
}

/**
 * Returns a text label descriptive of the energy level.
 * @param level - Energy score (1-10)
 * @returns Energy descriptor label
 */
export function getEnergyLabel(level: number): string {
  if (level <= 3.4) return 'Exhausted';
  if (level <= 7.4) return 'Moderate';
  return 'Energetic';
}

/**
 * Returns a text label descriptive of the sleep quality.
 * @param level - Sleep score (1-10)
 * @returns Sleep quality descriptor label
 */
export function getSleepLabel(level: number): string {
  if (level <= 3.4) return 'Poor';
  if (level <= 7.4) return 'Restless';
  return 'Refreshed';
}

import type { WellnessStatus } from '../types';

/**
 * Returns the theme color mapped to a wellness status class.
 * @param status - The classified wellness state
 * @returns Theme color variable or hex code
 */
export function getStatusColor(status: WellnessStatus): string {
  switch (status) {
    case 'Healthy':
      return 'var(--success)';
    case 'Moderate Concern':
      return 'var(--warning)';
    case 'High Stress':
      return '#f97316'; // Orange
    case 'Burnout Risk':
      return 'var(--danger)';
  }
}
