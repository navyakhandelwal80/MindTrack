import type { CheckIn, JournalEntry, UserProfile } from '../types';

export interface WellnessRecommendations {
  score: number;
  status: 'Healthy' | 'Moderate Concern' | 'High Stress' | 'Burnout Risk';
  encouragement: string;
  stressRecommendations: string[];
  studyLifeBalance: string[];
  sleepImprovement: string[];
  burnoutRiskAssessment: string;
  motivationReminders: string[];
}

/**
 * Calculates the average of any check-in numeric parameter over the logs array.
 */
export function calculateAverageMetric(
  logs: CheckIn[],
  key: 'mood' | 'stress' | 'energy' | 'sleepQuality'
): number {
  if (!logs || logs.length === 0) return 0;
  const total = logs.reduce((sum, c) => sum + (c[key] || 0), 0);
  return parseFloat((total / logs.length).toFixed(1));
}

/**
 * Calculates the Wellness Score from 0 to 100 based on the last 7 check-in logs.
 */
export function calculateWellnessScore(recentLogs: CheckIn[]): number {
  if (!recentLogs || recentLogs.length === 0) return 70; // baseline neutral score if empty

  const count = recentLogs.length;
  const avgMood = recentLogs.reduce((sum, c) => sum + c.mood, 0) / count;
  const avgStress = recentLogs.reduce((sum, c) => sum + c.stress, 0) / count;
  const avgEnergy = recentLogs.reduce((sum, c) => sum + (c.energy || 6), 0) / count;
  const avgSleep = recentLogs.reduce((sum, c) => sum + (c.sleepQuality || 6), 0) / count;
  const avgStudy = recentLogs.reduce((sum, c) => sum + c.studyHours, 0) / count;

  // 1. Mood Component (0 to 25 pts)
  const moodScore = (avgMood / 10) * 25;

  // 2. Stress Component (0 to 25 pts) - lower stress is better
  const stressScore = (1 - (avgStress - 1) / 9) * 25;

  // 3. Energy Component (0 to 25 pts)
  const energyScore = (avgEnergy / 10) * 25;

  // 4. Sleep Quality Component (0 to 25 pts)
  const sleepScore = (avgSleep / 10) * 25;

  let totalScore = moodScore + stressScore + energyScore + sleepScore;

  // 5. Study-life balance adjustments (Deduct points for extreme study regimes or active Burnout triggers)
  if (avgStudy > 11) {
    totalScore -= 12; // Over-studying penalty
  } else if (avgStudy < 3) {
    totalScore -= 8; // Under-activity warning
  }

  // Active triggers penalty
  const activeTriggers = recentLogs.flatMap((c) => c.triggers || []);
  if (activeTriggers.includes('Burnout')) {
    totalScore -= 10;
  }
  if (activeTriggers.includes('Lack of preparation')) {
    totalScore -= 5;
  }

  // Constrain between 0 and 100
  return Math.max(0, Math.min(100, Math.round(totalScore)));
}

/**
 * Classifies the Wellness Score.
 */
export function classifyWellnessStatus(score: number): 'Healthy' | 'Moderate Concern' | 'High Stress' | 'Burnout Risk' {
  if (score >= 75) return 'Healthy';
  if (score >= 50) return 'Moderate Concern';
  if (score >= 30) return 'High Stress';
  return 'Burnout Risk';
}

/**
 * Generates personalized, supportive, non-medical wellness recommendations based on student logs.
 */
export function generateWellnessRecommendations(
  recentLogs: CheckIn[],
  journalEntries: JournalEntry[],
  profile: UserProfile
): WellnessRecommendations {
  const score = calculateWellnessScore(recentLogs);
  const status = classifyWellnessStatus(score);

  const name = profile.name || 'Aspirant';
  const exam = profile.exam || 'Competitive Exams';

  // Calculate averages for dynamic advice
  const logsCount = recentLogs.length;
  const avgSleep = logsCount > 0 ? recentLogs.reduce((s, c) => s + (c.sleepQuality || 6), 0) / logsCount : 7;
  const avgStudy = logsCount > 0 ? recentLogs.reduce((s, c) => s + c.studyHours, 0) / logsCount : 8;
  const avgStress = logsCount > 0 ? recentLogs.reduce((s, c) => s + c.stress, 0) / logsCount : 5;

  // 1. Personalized Encouragement
  let encouragement = '';
  if (status === 'Healthy') {
    encouragement = `Excellent progress, ${name}! You are maintaining a healthy mental prep state. This balanced mindset facilitates optimal memory retrieval and high analytical speed for your ${exam} preparation.`;
  } else if (status === 'Moderate Concern') {
    encouragement = `Keep going, ${name}. You are managing your ${exam} curriculum load, but minor focus indicators are dipping. Taking quick restorative breaks will help you master concepts more efficiently.`;
  } else if (status === 'High Stress') {
    encouragement = `Please take a breath, ${name}. Your logs indicate high exam pressure for your ${exam} preparation. MindTrack wants to remind you that your study metrics do not define your human worth. We support your effort.`;
  } else {
    encouragement = `Dear ${name}, you are in the high burnout risk zone for your ${exam} preparation. Pushing through exhaustion causes cognitive blocks. We strongly encourage you to step away from active studies for a brief period to recharge.`;
  }

  // 2. Stress Management Recommendations
  const stressRecommendations: string[] = [
    "Perform 3-5 cycles of Box Breathing (Inhale 4s, Hold 4s, Exhale 4s, Hold 4s) to reset your nervous system.",
    "Challenge negative self-talk: Write down one self-doubt and reframe it logically inside your journal."
  ];

  const activeTriggers = recentLogs.flatMap((c) => c.triggers || []);
  if (activeTriggers.includes('Exam pressure') || activeTriggers.includes('Result anxiety')) {
    stressRecommendations.push("Separate preparation diagnostics from predictions. Mock tests exist to guide concept corrections, not predict cutoffs.");
  }
  if (activeTriggers.includes('Peer comparison')) {
    stressRecommendations.push("Avoid Peer comparison: Focus on your individual baseline. A 1% improvement in your chemistry or logic masteries compared to yesterday is your true growth metric.");
  }

  // 3. Study-Life Balance Suggestions
  const studyLifeBalance: string[] = [];
  if (avgStudy > 10) {
    studyLifeBalance.push(`You are studying an average of ${avgStudy.toFixed(1)} hours. Trim daily active curriculum focus to 8-9 hours maximum.`);
    studyLifeBalance.push("Implement a strict 50-minute study / 10-minute walk Pomodoro interval.");
  } else if (avgStudy < 4) {
    studyLifeBalance.push("Build positive prep momentum: set a micro-checklist of just 2 topics to finish today.");
  } else {
    studyLifeBalance.push("Your study hours are balanced. Protect your screen-free break windows in the evenings.");
  }
  studyLifeBalance.push("Dedicate 20 minutes to light physical movement (e.g. stretching or walking) to oxygenate your brain.");

  // 4. Sleep Improvement Suggestions
  const sleepImprovement: string[] = [
    "Put away study devices and mobile phones 30 minutes before sleep to ease melatonin secretion."
  ];
  if (avgSleep < 6) {
    sleepImprovement.push(`Your sleep quality is low (${avgSleep.toFixed(1)}/10). Establish a fixed bedtime routine to support sleep consolidation.`);
    sleepImprovement.push("Avoid high-caffeine beverages (coffee, energy drinks) after 5:00 PM.");
  } else {
    sleepImprovement.push("Your sleep patterns are positive. Maintaining this consistency stabilizes logical retrieval.");
  }

  // 5. Burnout Risk Assessment
  let burnoutRiskAssessment = '';
  const burnoutTriggers = activeTriggers.filter((t) => t === 'Burnout' || t === 'Lack of preparation').length;

  if (status === 'Burnout Risk' || burnoutTriggers >= 2) {
    burnoutRiskAssessment = "CRITICAL LIMIT: Your logs reveal high cognitive fatigue and active burnout spikes. Continuing at this intensity yields diminishing returns. Take a guilt-free day off or a half-day screen detox.";
  } else if (status === 'High Stress' || avgStress >= 7) {
    burnoutRiskAssessment = "ELEVATED RISK: You are studying under high stress. Fatigue is accumulating. Proactively use the Box Breathing tool before mock exams to prevent chronic burnout.";
  } else {
    burnoutRiskAssessment = "LOW RISK: Your preparation habits and resting metrics indicate a stable burnout recovery rate. Keep maintaining your exercise and hydration logs.";
  }

  // 6. Motivation Reminders
  const motivationReminders: string[] = [
    "Focus on progress, not perfection. Master one concept at a time.",
    "Consistency beats cramming. Protecting your wellness is a critical part of your competitive preparation."
  ];

  // Try checking journal entry keywords for emotional focus
  const journalText = journalEntries.map((j) => (j.content || '') + ' ' + (j.title || '')).join(' ').toLowerCase();
  if (journalText.includes('doubt') || journalText.includes('fear') || journalText.includes('scared')) {
    motivationReminders.push("Self-doubt is a thought pattern, not an absolute truth. Your dedication to studying is valuable, regardless of exam ranks.");
  }

  return {
    score,
    status,
    encouragement,
    stressRecommendations,
    studyLifeBalance,
    sleepImprovement,
    burnoutRiskAssessment,
    motivationReminders
  };
}
