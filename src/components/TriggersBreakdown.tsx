import React from 'react';
import { AlertCircle } from 'lucide-react';
import type { CheckIn } from '../types';

interface TriggersBreakdownProps {
  checkins: CheckIn[];
}

export const TriggersBreakdown: React.FC<TriggersBreakdownProps> = ({ checkins }) => {
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

  return (
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
  );
};

export default TriggersBreakdown;
