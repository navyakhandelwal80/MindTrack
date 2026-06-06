import React, { useState } from 'react';
import { TrendingUp } from 'lucide-react';
import type { CheckIn } from '../types';
import { formatDateLabel } from '../utils/date';

interface WeeklyTrendsChartProps {
  recentLogs: CheckIn[];
}

export const WeeklyTrendsChart: React.FC<WeeklyTrendsChartProps> = ({ recentLogs }) => {
  const [showMood, setShowMood] = useState<boolean>(true);
  const [showStress, setShowStress] = useState<boolean>(true);
  const [showEnergy, setShowEnergy] = useState<boolean>(true);
  const [showSleep, setShowSleep] = useState<boolean>(true);

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

  return (
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
  );
};

export default WeeklyTrendsChart;
