import React, { useState, useEffect } from 'react';
import { BookOpen, Heart, ChevronRight } from 'lucide-react';
import type { CheckIn, UserProfile, DailyQuote, TabName } from '../types';
import { getRandomQuote } from '../utils/quotes';
import { calculateWellnessScore, classifyWellnessStatus } from '../utils/wellnessEngine';
import { calculateCheckInStreak } from '../utils/date';

// Sub-components
import DashboardHero from './DashboardHero';
import WellnessScoreCard from './WellnessScoreCard';
import MetricsAveragesCard from './MetricsAveragesCard';
import QuoteCard from './QuoteCard';

interface DashboardProps {
  profile: UserProfile;
  checkins: CheckIn[];
  onNavigate: (tab: TabName) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ profile, checkins, onNavigate }) => {
  const [quote, setQuote] = useState<DailyQuote>({ text: '', author: '' });

  useEffect(() => {
    setQuote(getRandomQuote());
  }, []);

  const refreshQuote = () => {
    setQuote(getRandomQuote());
  };

  // Calculate averages over past 7 logs
  const getRecentMetrics = () => {
    const recent = checkins.slice(-7);
    if (recent.length === 0) {
      return { avgMood: 0, avgStress: 0, avgEnergy: 0, avgSleep: 0, checkInDoneToday: false };
    }

    const totalMood = recent.reduce((sum, c) => sum + c.mood, 0);
    const totalStress = recent.reduce((sum, c) => sum + c.stress, 0);
    const totalEnergy = recent.reduce((sum, c) => sum + (c.energy || 6), 0);
    const totalSleep = recent.reduce((sum, c) => sum + (c.sleepQuality || 6), 0);
    
    const todayStr = new Date().toISOString().split('T')[0];
    const checkInDoneToday = checkins.some((c) => c.date === todayStr);

    return {
      avgMood: parseFloat((totalMood / recent.length).toFixed(1)),
      avgStress: parseFloat((totalStress / recent.length).toFixed(1)),
      avgEnergy: parseFloat((totalEnergy / recent.length).toFixed(1)),
      avgSleep: parseFloat((totalSleep / recent.length).toFixed(1)),
      checkInDoneToday,
    };
  };

  const streak = calculateCheckInStreak(checkins);
  const metrics = getRecentMetrics();

  // Engine calculations
  const recentLogs = checkins.slice(-7);
  const wellnessScore = calculateWellnessScore(recentLogs);
  const wellnessStatus = classifyWellnessStatus(wellnessScore);

  return (
    <div className="animated-fade-in">
      {/* 1. Header Banner & Countdown */}
      <DashboardHero profile={profile} />

      {/* 2. AI Wellness Score Card */}
      <WellnessScoreCard
        wellnessScore={wellnessScore}
        wellnessStatus={wellnessStatus}
        onReviewAdvisor={() => onNavigate('insights')}
      />

      {/* 3. Log Pending Alert / Completed Status */}
      {!metrics.checkInDoneToday ? (
        <div className="glass-card animated-slide-up" style={{ border: '1px dashed var(--primary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: '0.95rem', color: 'var(--primary)', marginBottom: '0.25rem' }}>Log Today's Check-In</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Log mood, stress, energy, and sleep quality.</p>
            </div>
            <button className="btn btn-secondary" onClick={() => onNavigate('checkin')} style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
              Check In
            </button>
          </div>
        </div>
      ) : (
        <div className="glass-card animated-slide-up" style={{ borderLeft: '4px solid var(--success)', padding: '0.8rem 1.25rem' }}>
          <p style={{ color: 'var(--success)', fontSize: '0.85rem', fontWeight: 600 }}>
            ✓ Checked in for today. Excellent habit consistency!
          </p>
        </div>
      )}

      {/* 4. Metrics & Averages Grid */}
      <MetricsAveragesCard
        streak={streak}
        avgMood={metrics.avgMood}
        avgStress={metrics.avgStress}
        avgEnergy={metrics.avgEnergy}
        avgSleep={metrics.avgSleep}
        onSeeTrends={() => onNavigate('analytics')}
      />

      {/* 5. Daily Motivation Quote */}
      <QuoteCard quote={quote} onRefresh={refreshQuote} />

      {/* 6. Navigation Shortcuts */}
      <h3 style={{ fontSize: '1.1rem', marginBottom: '0.75rem', marginTop: '1.5rem' }}>Quick Focus & Relax</h3>
      
      <div className="glass-card" style={{ display: 'flex', gap: '1rem', flexDirection: 'column' }}>
        <button 
          onClick={() => onNavigate('exercises')} 
          style={{ display: 'flex', width: '100%', background: 'none', border: 'none', textAlign: 'left', alignItems: 'center', gap: '1rem', cursor: 'pointer', padding: '0.25rem' }}
          aria-label="Open guided box breathing bubble tool"
        >
          <div style={{ background: 'var(--primary-light)', padding: '0.75rem', borderRadius: '12px', color: 'var(--primary)' }}>
            <Heart size={20} fill="currentColor" aria-hidden="true" />
          </div>
          <div style={{ flex: 1 }}>
            <h4 style={{ fontSize: '0.95rem', marginBottom: '0.15rem', color: 'var(--text-primary)' }}>Box Breathing Bubble</h4>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Relieve mock exam pressure and lower heart rate.</p>
          </div>
          <ChevronRight size={18} style={{ color: 'var(--text-muted)' }} aria-hidden="true" />
        </button>

        <hr style={{ border: 'none', borderBottom: '1px solid var(--border-color)' }} />

        <button 
          onClick={() => onNavigate('insights')} 
          style={{ display: 'flex', width: '100%', background: 'none', border: 'none', textAlign: 'left', alignItems: 'center', gap: '1rem', cursor: 'pointer', padding: '0.25rem' }}
          aria-label="Open AI wellness diagnostics recommendations playbooks"
        >
          <div style={{ background: 'rgba(236, 72, 153, 0.15)', padding: '0.75rem', borderRadius: '12px', color: 'var(--secondary)' }}>
            <BookOpen size={20} aria-hidden="true" />
          </div>
          <div style={{ flex: 1 }}>
            <h4 style={{ fontSize: '0.95rem', marginBottom: '0.15rem', color: 'var(--text-primary)' }}>Wellness Advisor Playbook</h4>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Examine custom diagnostics and study anxiety playbooks.</p>
          </div>
          <ChevronRight size={18} style={{ color: 'var(--text-muted)' }} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
