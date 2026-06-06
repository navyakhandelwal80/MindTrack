import React from 'react';
import { Flame, Zap, Moon, Activity, ChevronRight } from 'lucide-react';
import { getRatingColor, getMoodEmojiOnly } from '../utils/presentation';

interface MetricsAveragesCardProps {
  streak: number;
  avgMood: number;
  avgStress: number;
  avgEnergy: number;
  avgSleep: number;
  onSeeTrends: () => void;
}

export const MetricsAveragesCard: React.FC<MetricsAveragesCardProps> = ({
  streak,
  avgMood,
  avgStress,
  avgEnergy,
  avgSleep,
  onSeeTrends,
}) => {
  return (
    <div className="quick-stats-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
      {/* Streak */}
      <div className="glass-card stat-card" tabIndex={0} aria-label={`Check in streak: ${streak} days`}>
        <div className="stat-val" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}>
          <Flame 
            size={24} 
            fill="currentColor" 
            style={{ color: streak > 0 ? 'var(--secondary)' : 'var(--text-muted)' }} 
            aria-hidden="true" 
          />
          <span>{streak}</span>
        </div>
        <div className="stat-lbl">Check-in Streak</div>
      </div>

      {/* Avg Mood */}
      <div className="glass-card stat-card" tabIndex={0} aria-label={`7 day average mood: ${avgMood} out of 10`}>
        <div className="stat-val">
          {avgMood > 0 ? (
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}>
              <span style={{ fontSize: '1.5rem' }} aria-hidden="true">
                {getMoodEmojiOnly(avgMood)}
              </span>
              <span style={{ fontSize: '1.25rem', fontWeight: 700 }}>{avgMood}</span>
            </span>
          ) : (
            '--'
          )}
        </div>
        <div className="stat-lbl">Avg Mood (7 days)</div>
      </div>

      {/* Avg Stress */}
      <div className="glass-card stat-card" tabIndex={0} aria-label={`7 day average stress: ${avgStress} out of 10`}>
        <div className="stat-val" style={{ color: getRatingColor(avgStress, 'stress') }}>
          {avgStress > 0 ? `${avgStress}/10` : '--'}
        </div>
        <div className="stat-lbl">Avg Stress Level</div>
      </div>

      {/* Avg Energy */}
      <div className="glass-card stat-card" tabIndex={0} aria-label={`7 day average energy: ${avgEnergy} out of 10`}>
        <div className="stat-val" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem', color: getRatingColor(avgEnergy, 'energy') }}>
          <Zap size={18} fill="currentColor" aria-hidden="true" />
          <span>{avgEnergy > 0 ? `${avgEnergy}/10` : '--'}</span>
        </div>
        <div className="stat-lbl">Avg Energy Level</div>
      </div>

      {/* Avg Sleep */}
      <div className="glass-card stat-card" tabIndex={0} aria-label={`7 day average sleep quality: ${avgSleep} out of 10`}>
        <div className="stat-val" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem', color: getRatingColor(avgSleep, 'sleep') }}>
          <Moon size={18} fill="currentColor" aria-hidden="true" />
          <span>{avgSleep > 0 ? `${avgSleep}/10` : '--'}</span>
        </div>
        <div className="stat-lbl">Avg Sleep Quality</div>
      </div>

      {/* Analytics Shortcut */}
      <button 
        className="glass-card stat-card btn" 
        style={{ width: '100%', border: '1px solid var(--border-color)', margin: 0 }}
        onClick={onSeeTrends}
        aria-label="Navigate to analytics trend charts"
      >
        <div className="stat-val" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Activity size={24} style={{ color: 'var(--primary)' }} aria-hidden="true" />
        </div>
        <div className="stat-lbl" style={{ color: 'var(--primary)', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          See Trends <ChevronRight size={12} aria-hidden="true" />
        </div>
      </button>
    </div>
  );
};

export default MetricsAveragesCard;
