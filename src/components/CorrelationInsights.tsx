import React from 'react';
import { Sparkles, Info } from 'lucide-react';
import type { CheckIn } from '../types';

interface CorrelationInsightsProps {
  checkins: CheckIn[];
}

export const CorrelationInsights: React.FC<CorrelationInsightsProps> = ({ checkins }) => {
  const getCorrelations = () => {
    const list: string[] = [];
    if (checkins.length < 3) {
      return ["Keep checking in daily. With 3 or more entries, MindTrack will unlock advanced correlation reports."];
    }

    const highStressLogs = checkins.filter((c) => c.stress >= 7);
    const lowStressLogs = checkins.filter((c) => c.stress <= 3);
    const avgMoodHighStress = highStressLogs.length > 0 ? (highStressLogs.reduce((s, c) => s + c.mood, 0) / highStressLogs.length) : 0;
    const avgMoodLowStress = lowStressLogs.length > 0 ? (lowStressLogs.reduce((s, c) => s + c.mood, 0) / lowStressLogs.length) : 0;

    if (avgMoodHighStress > 0 && avgMoodLowStress > 0 && avgMoodLowStress - avgMoodHighStress >= 1.5) {
      list.push(
        `High stress (stress ≥ 7) drops your mood to ${avgMoodHighStress.toFixed(1)}/10, compared to ${avgMoodLowStress.toFixed(1)}/10 on low-stress days.`
      );
    }

    const goodSleepLogs = checkins.filter((c) => c.sleepQuality >= 7);
    const badSleepLogs = checkins.filter((c) => c.sleepQuality <= 4);
    const avgEnergyGoodSleep = goodSleepLogs.length > 0 ? (goodSleepLogs.reduce((s, c) => s + c.energy, 0) / goodSleepLogs.length) : 0;
    const avgEnergyBadSleep = badSleepLogs.length > 0 ? (badSleepLogs.reduce((s, c) => s + c.energy, 0) / badSleepLogs.length) : 0;

    if (avgEnergyGoodSleep > 0 && avgEnergyBadSleep > 0 && avgEnergyGoodSleep - avgEnergyBadSleep >= 1) {
      list.push(
        `Your energy averages ${avgEnergyGoodSleep.toFixed(1)}/10 after restful sleep (sleep quality ≥ 7) versus ${avgEnergyBadSleep.toFixed(1)}/10 on poor sleep days.`
      );
    }

    const burnoutLogs = checkins.filter((c) => c.triggers.includes('Burnout'));
    const nonBurnoutLogs = checkins.filter((c) => !c.triggers.includes('Burnout'));
    const avgStudyBurnout = burnoutLogs.length > 0 ? (burnoutLogs.reduce((s, c) => s + c.studyHours, 0) / burnoutLogs.length) : 0;
    const avgStudyNormal = nonBurnoutLogs.length > 0 ? (nonBurnoutLogs.reduce((s, c) => s + c.studyHours, 0) / nonBurnoutLogs.length) : 0;

    if (avgStudyBurnout > avgStudyNormal + 1) {
      list.push(
        `You study longer hours on days with 'Burnout' triggers (${avgStudyBurnout.toFixed(1)} hrs vs ${avgStudyNormal.toFixed(1)} hrs normal).`
      );
    }

    if (list.length === 0) {
      list.push("Metrics are balanced. Maintain a consistent check-in streak to map long-term wellness patterns!");
    }

    return list;
  };

  const correlations = getCorrelations();

  return (
    <div className="glass-card">
      <h3 style={{ fontSize: '1.05rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Sparkles size={18} style={{ color: 'var(--primary)' }} aria-hidden="true" /> Habit Correlation Insights
      </h3>
      <div className="insights-list" role="list">
        {correlations.map((insight, idx) => (
          <div key={idx} className="insight-item" role="listitem">
            <Info size={18} aria-hidden="true" />
            <div>{insight}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CorrelationInsights;
