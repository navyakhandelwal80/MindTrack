import React from 'react';
import { Calendar } from 'lucide-react';
import type { CheckIn } from '../types';

// Sub-components
import WeeklyTrendsChart from './WeeklyTrendsChart';
import TriggersBreakdown from './TriggersBreakdown';
import CorrelationInsights from './CorrelationInsights';

interface AnalyticsProps {
  checkins: CheckIn[];
}

export const Analytics: React.FC<AnalyticsProps> = ({ checkins }) => {
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

  return (
    <div className="animated-fade-in">
      {/* 1. SVG Weekly Trend Line Chart */}
      <WeeklyTrendsChart recentLogs={recentLogs} />

      {/* 2. Top Triggers Breakdown */}
      <TriggersBreakdown checkins={checkins} />

      {/* 3. Correlations Insight Lists */}
      <CorrelationInsights checkins={checkins} />
    </div>
  );
};

export default Analytics;
