import React, { useState } from 'react';
import { TrendingUp } from 'lucide-react';
import type { CheckIn } from '../types';
import { formatDateLabel } from '../utils/date';

/** Configuration for each trend line in the chart. */
const TREND_LINES = [
  { key: 'mood' as const, label: 'Mood', color: 'var(--primary)', className: 'chart-line', dotClass: 'chart-dot', strokeStyle: {} },
  { key: 'stress' as const, label: 'Stress', color: 'var(--danger)', className: 'chart-line-secondary', dotClass: 'chart-dot-secondary', strokeStyle: { stroke: 'var(--danger)' } },
  { key: 'energy' as const, label: 'Energy', color: 'var(--warning)', className: 'chart-line-secondary', dotClass: 'chart-dot-secondary', strokeStyle: { stroke: 'var(--warning)', strokeDasharray: 'none', strokeWidth: 3 } },
  { key: 'sleepQuality' as const, label: 'Sleep', color: 'var(--success)', className: 'chart-line-secondary', dotClass: 'chart-dot-secondary', strokeStyle: { stroke: 'var(--success)', strokeDasharray: '3' } },
] as const;

interface WeeklyTrendsChartProps {
  recentLogs: CheckIn[];
}

export const WeeklyTrendsChart: React.FC<WeeklyTrendsChartProps> = ({ recentLogs }) => {
  const [visible, setVisible] = useState<Record<string, boolean>>(
    Object.fromEntries(TREND_LINES.map((t) => [t.key, true]))
  );

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

  const toggleLine = (key: string) => setVisible((prev) => ({ ...prev, [key]: !prev[key] }));

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
              <line key={i} x1={padding.left} y1={y} x2={svgWidth - padding.right} y2={y} className="chart-grid-line" />
            );
          })}

          {/* X Axis Date Labels */}
          {recentLogs.map((log, index) => {
            const x = padding.left + (index / (recentLogs.length - 1)) * graphWidth;
            return (
              <text key={log.id} x={x} y={svgHeight - padding.bottom + 18} textAnchor="middle" className="chart-axis-text">
                {formatDateLabel(log.date)}
              </text>
            );
          })}

          {/* Y Axis Labels */}
          <text x={10} y={padding.top + 4} className="chart-axis-text" style={{ fontWeight: 700 }}>10</text>
          <text x={10} y={padding.top + graphHeight / 2 + 4} className="chart-axis-text">5</text>
          <text x={10} y={padding.top + graphHeight + 4} className="chart-axis-text">1</text>

          {/* Trend Lines — data-driven */}
          {TREND_LINES.map((line) => {
            const points = getPoints(line.key);
            if (!visible[line.key] || !points) return null;
            return (
              <React.Fragment key={line.key}>
                <polyline points={points} className={line.className} style={line.strokeStyle} />
                {recentLogs.map((log, index) => {
                  const x = padding.left + (index / (recentLogs.length - 1)) * graphWidth;
                  const val = log[line.key] || 1;
                  const y = padding.top + (1 - (val - 1) / 9) * graphHeight;
                  return (
                    <circle key={`${line.key}-${log.id}`} cx={x} cy={y} r="4" className={line.dotClass} style={{ stroke: line.color }}>
                      <title>{`${line.label} on ${log.date}: ${val}/10`}</title>
                    </circle>
                  );
                })}
              </React.Fragment>
            );
          })}
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

      {/* Legend checkboxes — data-driven */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0.75rem', marginTop: '1rem' }} role="group" aria-label="Toggle trend lines visibility">
        {TREND_LINES.map((line) => (
          <button
            key={line.key}
            type="button"
            className="trigger-pill"
            aria-pressed={visible[line.key]}
            style={{
              background: visible[line.key] ? line.color + '20' : 'none',
              borderColor: line.color,
              color: 'var(--text-primary)',
              fontSize: '0.75rem',
              fontWeight: 600
            }}
            onClick={() => toggleLine(line.key)}
          >
            <span style={{ width: '8px', height: '8px', background: line.color, borderRadius: '50%', display: 'inline-block', marginRight: '4px' }} aria-hidden="true"></span>
            {line.label} {visible[line.key] ? '✓' : ''}
          </button>
        ))}
      </div>
    </div>
  );
};

export default WeeklyTrendsChart;
