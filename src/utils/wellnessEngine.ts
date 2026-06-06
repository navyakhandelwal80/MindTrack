import type { CheckIn, JournalEntry, UserProfile, WellnessStatus, ExamType } from '../types';

export interface WellnessRecommendations {
  score: number;
  status: WellnessStatus;
  encouragement: string;
  stressRecommendations: string[];
  studyLifeBalance: string[];
  sleepImprovement: string[];
  burnoutRiskAssessment: string;
  motivationReminders: string[];
}

/**
 * Calculates the average of any check-in numeric parameter over the logs array.
 * @param logs - Array of check-in logs
 * @param key - The metric key to average
 * @returns Rounded average value (1 decimal place), or 0 if no logs
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
 * Components: mood (25pts), inverse stress (25pts), energy (25pts), sleep quality (25pts).
 * Adjusted for study-life balance and active burnout triggers.
 * @param recentLogs - Last 7 check-in entries
 * @returns Clamped integer score between 0–100
 */
export function calculateWellnessScore(recentLogs: CheckIn[]): number {
  if (!recentLogs || recentLogs.length === 0) return 70; // baseline neutral score if empty

  const avgMood = calculateAverageMetric(recentLogs, 'mood');
  const avgStress = calculateAverageMetric(recentLogs, 'stress');
  const avgEnergy = calculateAverageMetric(recentLogs, 'energy');
  const avgSleep = calculateAverageMetric(recentLogs, 'sleepQuality');
  const avgStudy = recentLogs.reduce((s, c) => s + c.studyHours, 0) / recentLogs.length;

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
 * Classifies the Wellness Score into a named status tier.
 * @param score - Wellness score (0–100)
 * @returns One of the four WellnessStatus values
 */
export function classifyWellnessStatus(score: number): WellnessStatus {
  if (score >= 75) return 'Healthy';
  if (score >= 50) return 'Moderate Concern';
  if (score >= 30) return 'High Stress';
  return 'Burnout Risk';
}

/**
 * Returns exam-specific study advice tailored to the student's target examination.
 * @param exam - The student's target exam type
 * @returns Array of exam-specific recommendation strings
 */
function getExamSpecificAdvice(exam: ExamType): string[] {
  switch (exam) {
    case 'JEE':
      return [
        "For JEE: alternate Physics problem sets with Chemistry theory to avoid single-subject fatigue.",
        "Practice timed mini-tests (30 min/subject) to build speed for the 3-hour JEE paper format.",
      ];
    case 'NEET':
      return [
        "For NEET: balance Biology memorization sessions with Physics problem-solving to keep both hemispheres active.",
        "Use spaced repetition for NEET Biology diagrams — review them at 1-day, 3-day, and 7-day intervals.",
      ];
    case 'UPSC':
      return [
        "For UPSC: schedule answer-writing practice 3 times per week to build exam endurance for the Mains.",
        "Rotate between current affairs, optional subject, and GS to prevent monotony-induced burnout.",
      ];
    case 'CAT':
      return [
        "For CAT: dedicate at least 30 minutes daily to reading comprehension passages to build stamina.",
        "Practice Data Interpretation sets under timed conditions to improve accuracy under pressure.",
      ];
    case 'GATE':
      return [
        "For GATE: focus on one subject per week for deep mastery rather than shallow multi-topic coverage.",
        "Solve previous year GATE papers under timed conditions to identify weak conceptual areas.",
      ];
    case 'CUET':
      return [
        "For CUET: practice domain-specific MCQs daily to build speed across your chosen subjects.",
        "Review NCERT thoroughly — CUET questions align heavily with textbook fundamentals.",
      ];
    case 'Boards':
      return [
        "For Board Exams: create concise revision notes for each chapter and revise them weekly.",
        "Practice sample papers with strict time limits to improve time management during the exam.",
      ];
    default:
      return [
        "Set 2–3 focused daily study goals and track completion to build steady momentum.",
      ];
  }
}

/**
 * Generates personalized, supportive, non-medical wellness recommendations based on student logs.
 * Incorporates exam-specific advice, journal sentiment analysis, and habit correlation patterns.
 * @param recentLogs - Last 7 check-in entries
 * @param journalEntries - All journal entries for sentiment analysis
 * @param profile - Student's profile including exam type
 * @returns Full WellnessRecommendations payload
 */
export function generateWellnessRecommendations(
  recentLogs: CheckIn[],
  journalEntries: JournalEntry[],
  profile: UserProfile
): WellnessRecommendations {
  const score = calculateWellnessScore(recentLogs);
  const status = classifyWellnessStatus(score);

  const name = profile.name || 'Aspirant';
  const exam = profile.exam || 'JEE';

  // Reuse calculateAverageMetric to eliminate duplicate averaging
  const avgSleep = recentLogs.length > 0 ? calculateAverageMetric(recentLogs, 'sleepQuality') : 7;
  const avgStress = recentLogs.length > 0 ? calculateAverageMetric(recentLogs, 'stress') : 5;
  const avgStudy = recentLogs.length > 0
    ? recentLogs.reduce((s, c) => s + c.studyHours, 0) / recentLogs.length
    : 8;

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
  if (activeTriggers.includes('Family expectations')) {
    stressRecommendations.push("Have an honest conversation with your family about realistic expectations. Their support matters more than added pressure.");
  }

  // 3. Study-Life Balance Suggestions (with exam-specific advice)
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

  // Add exam-specific advice
  const examAdvice = getExamSpecificAdvice(exam as ExamType);
  studyLifeBalance.push(...examAdvice);

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
  if (journalText.includes('fail') || journalText.includes('failure') || journalText.includes('failed')) {
    motivationReminders.push("Every setback is a setup for a comeback. Analyse your errors, learn from them, and move forward stronger.");
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
