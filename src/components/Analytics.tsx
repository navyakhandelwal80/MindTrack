import React, { useState } from 'react';
import { Calendar, Info, TrendingUp, AlertCircle, Sparkles } from 'lucide-react';
import type { CheckIn } from '../types';

interface AnalyticsProps {
  checkins: CheckIn[];
}

export const Analytics: React.FC<AnalyticsProps> = ({ checkins }) => {
  const [showMood, setShowMood] = useState<boolean>(true);
  const [showStress, setShowStress] = useState<boolean>(true);
  const [showEnergy, setShowEnergy] = useState<boolean>(true);
  const [showSleep, setShowSleep] = useState<boolean>(true);

  if (checkins.length === 0) {
    return (
      <div className="glass-card text-center animated-fade-in" style={{ padding: '3rem 1.5rem' }}>
        <Calendar size={48} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} aria-hidden="true" />
        <h3>No Check-In Logs Yet</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.5rem' }}>
          Please complete today's check-in to unlock expanded wellness reports.
        </p>
      </div>
    );
  }

  const recentLogs = [...checkins]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(-7);

  const svgWidth = 500;
  const svgHeight = 220;
  const padding = { top: 25, right: 25, bottom: 35, left: 35 };
  const graphWidth = svgWidth - padding.left - padding.right;
  const graphHeight = svgHeight - padding.top - padding.bottom;

  const getPoints = (key: 'mood' | 'stress' | 'energy' | 'sleepQuality') => {
    if (recentLogs.length < 2) return '';
    return recentLogs
      .map((log, index) => {
        const x = padding.left + (index / (recentLogs.length - 1)) * graphWidth;
        const val = log[key] || 1;
        const y = padding.top + (1 - (val - 1) / 9) * graphHeight;
        return `${x},${y}`;
      })
      .join(' ');
  };

  const moodPoints = getPoints('mood');
  const stressPoints = getPoints('stress');
  const energyPoints = getPoints('energy');
  const sleepPoints = getPoints('sleepQuality');

  const getTriggerCounts = () => {
    const counts: { [key: string]: number } = {};
    checkins.forEach((c) => {
      if (c.triggers) {
        c.triggers.forEach((t) => {
          counts[t] = (counts[t] || 0) + 1;
        });
      }
    });
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  };

  const topTriggers = getTriggerCounts();

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

  const formatDateLabel = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="animated-fade-in">
      <div className="glass-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <TrendingUp size={20} style={{ color: 'var(--primary)' }} aria-hidden="true" /> Weekly Trends
          </h2>
        </div>

        {/* Accessible SVG graph */}
        <div className="chart-container" role="img" aria-label="Line graph displaying student mood, stress, energy, and sleep quality trend lines over the last 7 logged days. Checkbox toggles underneath show or hide each trend line.">
          <svg className="chart-svg" viewBox={`0 0 ${svgWidth} ${svgHeight}`}>
            <title>Weekly Student Wellness Trends</title>
            <desc>A multi-line chart visualizing weekly scores out of 10 for mood, stress, energy levels, and sleep quality.</desc>

            {/* Grid Lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
              const y = padding.top + ratio * graphHeight;
              return (
                <line
                  key={i}
                  x1={padding.left}
                  y1={y}
                  x2={svgWidth - padding.right}
                  y2={y}
                  className="chart-grid-line"
                />
              );
            })}

            {/* X Axis Date Labels */}
            {recentLogs.map((log, index) => {
              const x = padding.left + (index / (recentLogs.length - 1)) * graphWidth;
              return (
                <text
                  key={log.id}
                  x={x}
                  y={svgHeight - padding.bottom + 18}
                  textAnchor="middle"
                  className="chart-axis-text"
                >
                  {formatDateLabel(log.date)}
                </text>
              );
            })}

            {/* Y Axis Labels */}
            <text x={10} y={padding.top + 4} className="chart-axis-text" style={{ fontWeight: 700 }}>10</text>
            <text x={10} y={padding.top + graphHeight / 2 + 4} className="chart-axis-text">5</text>
            <text x={10} y={padding.top + graphHeight + 4} className="chart-axis-text">1</text>

            {/* 1. Mood Line */}
            {showMood && moodPoints && (
              <>
                <polyline points={moodPoints} className="chart-line" />
                {recentLogs.map((log, index) => {
                  const x = padding.left + (index / (recentLogs.length - 1)) * graphWidth;
                  const y = padding.top + (1 - (log.mood - 1) / 9) * graphHeight;
                  return (
                    <circle key={`mood-${log.id}`} cx={x} cy={y} r="4" className="chart-dot">
                      <title>{`Mood on ${log.date}: ${log.mood}/10`}</title>
                    </circle>
                  );
                })}
              </>
            )}

            {/* 2. Stress Line */}
            {showStress && stressPoints && (
              <>
                <polyline points={stressPoints} className="chart-line-secondary" style={{ stroke: 'var(--danger)' }} />
                {recentLogs.map((log, index) => {
                  const x = padding.left + (index / (recentLogs.length - 1)) * graphWidth;
                  const y = padding.top + (1 - (log.stress - 1) / 9) * graphHeight;
                  return (
                    <circle key={`stress-${log.id}`} cx={x} cy={y} r="4" className="chart-dot-secondary" style={{ stroke: 'var(--danger)' }}>
                      <title>{`Stress on ${log.date}: ${log.stress}/10`}</title>
                    </circle>
                  );
                })}
              </>
            )}

            {/* 3. Energy Line */}
            {showEnergy && energyPoints && (
              <>
                <polyline points={energyPoints} className="chart-line-secondary" style={{ stroke: 'var(--warning)', strokeDasharray: 'none', strokeWidth: 3 }} />
                {recentLogs.map((log, index) => {
                  const x = padding.left + (index / (recentLogs.length - 1)) * graphWidth;
                  const y = padding.top + (1 - ((log.energy || 1) - 1) / 9) * graphHeight;
                  return (
                    <circle key={`energy-${log.id}`} cx={x} cy={y} r="4" className="chart-dot-secondary" style={{ stroke: 'var(--warning)' }}>
                      <title>{`Energy on ${log.date}: ${log.energy || 1}/10`}</title>
                    </circle>
                  );
                })}
              </>
            )}

            {/* 4. Sleep Quality Line */}
            {showSleep && sleepPoints && (
              <>
                <polyline points={sleepPoints} className="chart-line-secondary" style={{ stroke: 'var(--success)', strokeDasharray: '3' }} />
                {recentLogs.map((log, index) => {
                  const x = padding.left + (index / (recentLogs.length - 1)) * graphWidth;
                  const y = padding.top + (1 - ((log.sleepQuality || 1) - 1) / 9) * graphHeight;
                  return (
                    <circle key={`sleep-${log.id}`} cx={x} cy={y} r="4" className="chart-dot-secondary" style={{ stroke: 'var(--success)' }}>
                      <title>{`Sleep Quality on ${log.date}: ${log.sleepQuality || 1}/10`}</title>
                    </circle>
                  );
                })}
              </>
            )}
          </svg>
        </div>

        {/* Visually Hidden Text Table for Screen Readers (WCAG Compliance) */}
        <div className="sr-only">
          <h3>Screen-Reader Data Table for Wellness Trends</h3>
          <table>
            <thead>
              <tr>
                <th scope="col">Date</th>
                <th scope="col">Mood (1-10)</th>
                <th scope="col">Stress (1-10)</th>
                <th scope="col">Energy (1-10)</th>
                <th scope="col">Sleep Quality (1-10)</th>
                <th scope="col">Study Hours</th>
              </tr>
            </thead>
            <tbody>
              {recentLogs.map((log) => (
                <tr key={log.id}>
                  <td>{log.date}</td>
                  <td>{log.mood}</td>
                  <td>{log.stress}</td>
                  <td>{log.energy || '--'}</td>
                  <td>{log.sleepQuality || '--'}</td>
                  <td>{log.studyHours} hrs</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Legend checkboxes */}
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0.75rem', marginTop: '1rem' }} role="group" aria-label="Toggle trend lines visibility">
          <button
            type="button"
            className="trigger-pill"
            aria-pressed={showMood}
            style={{
              background: showMood ? 'var(--primary-light)' : 'none',
              borderColor: 'var(--primary)',
              color: 'var(--text-primary)',
              fontSize: '0.75rem',
              fontWeight: 600
            }}
            onClick={() => setShowMood(!showMood)}
          >
            <span style={{ width: '8px', height: '8px', background: 'var(--primary)', borderRadius: '50%', display: 'inline-block', marginRight: '4px' }} aria-hidden="true"></span>
            Mood {showMood ? '✓' : ''}
          </button>

          <button
            type="button"
            className="trigger-pill"
            aria-pressed={showStress}
            style={{
              background: showStress ? 'rgba(239, 68, 68, 0.15)' : 'none',
              borderColor: 'var(--danger)',
              color: 'var(--text-primary)',
              fontSize: '0.75rem',
              fontWeight: 600
            }}
            onClick={() => setShowStress(!showStress)}
          >
            <span style={{ width: '8px', height: '8px', background: 'var(--danger)', borderRadius: '50%', display: 'inline-block', marginRight: '4px' }} aria-hidden="true"></span>
            Stress {showStress ? '✓' : ''}
          </button>

          <button
            type="button"
            className="trigger-pill"
            aria-pressed={showEnergy}
            style={{
              background: showEnergy ? 'rgba(245, 158, 11, 0.15)' : 'none',
              borderColor: 'var(--warning)',
              color: 'var(--text-primary)',
              fontSize: '0.75rem',
              fontWeight: 600
            }}
            onClick={() => setShowEnergy(!showEnergy)}
          >
            <span style={{ width: '8px', height: '8px', background: 'var(--warning)', borderRadius: '50%', display: 'inline-block', marginRight: '4px' }} aria-hidden="true"></span>
            Energy {showEnergy ? '✓' : ''}
          </button>

          <button
            type="button"
            className="trigger-pill"
            aria-pressed={showSleep}
            style={{
              background: showSleep ? 'rgba(16, 185, 129, 0.15)' : 'none',
              borderColor: 'var(--success)',
              color: 'var(--text-primary)',
              fontSize: '0.75rem',
              fontWeight: 600
            }}
            onClick={() => setShowSleep(!showSleep)}
          >
            <span style={{ width: '8px', height: '8px', background: 'var(--success)', borderRadius: '50%', display: 'inline-block', marginRight: '4px' }} aria-hidden="true"></span>
            Sleep {showSleep ? '✓' : ''}
          </button>
        </div>
      </div>

      {/* Triggers breakdown */}
      <div className="glass-card">
        <h3 style={{ fontSize: '1.05rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertCircle size={18} style={{ color: 'var(--secondary)' }} aria-hidden="true" /> Stress Triggers Breakdown
        </h3>
        
        {topTriggers.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '1rem 0' }}>
            No triggers logged yet. Stress triggers will show here.
          </p>
        ) : (
          <div aria-label="Bar chart showing stress triggers count">
            {topTriggers.map(({ name, count }) => {
              const maxCount = Math.max(...topTriggers.map((t) => t.count));
              const pct = maxCount > 0 ? (count / maxCount) * 100 : 0;
              return (
                <div key={name} className="bar-chart-row" aria-label={`${name}: logged ${count} times`}>
                  <div className="bar-label" title={name}>{name}</div>
                  <div className="bar-track">
                    <div className="bar-fill" style={{ width: `${pct}%` }} aria-hidden="true"></div>
                  </div>
                  <div className="bar-value">{count}</div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Correlation Insights */}
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
    </div>
  );
};

export default Analytics;
