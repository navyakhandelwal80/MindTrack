import React, { useState, useEffect } from 'react';
import { Calendar, Flame, Activity, ChevronRight, RefreshCw, BookOpen, Heart, Zap, Moon } from 'lucide-react';
import type { CheckIn, UserProfile, DailyQuote, TabName } from '../types';
import { getRandomQuote } from '../utils/quotes';
import { calculateWellnessScore, classifyWellnessStatus } from '../utils/wellnessEngine';

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

  // Calculate countdown days remaining
  const calculateDaysRemaining = () => {
    if (!profile.examDate) return 0;
    const examDate = new Date(profile.examDate);
    const today = new Date();
    examDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    const diffTime = examDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  // Calculate check-in streak based on consecutive days
  const calculateCheckInStreak = () => {
    if (checkins.length === 0) return 0;
    
    const sortedCheckIns = [...checkins].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    let streak = 0;
    const todayStr = new Date().toISOString().split('T')[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    const latestDate = sortedCheckIns[0].date;
    if (latestDate !== todayStr && latestDate !== yesterdayStr) {
      return 0;
    }

    let currentDate = new Date(latestDate);
    streak = 1;

    for (let i = 1; i < sortedCheckIns.length; i++) {
      const nextDate = new Date(sortedCheckIns[i].date);
      const diffTime = currentDate.getTime() - nextDate.getTime();
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        streak++;
        currentDate = nextDate;
      } else if (diffDays > 1) {
        break;
      }
    }

    return streak;
  };

  // Calculate averages over past 7 logs
  const getRecentMetrics = () => {
    const recent = checkins.slice(-7);
    if (recent.length === 0) return { avgMood: 0, avgStress: 0, avgEnergy: 0, avgSleep: 0, checkInDoneToday: false };

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

  const daysLeft = calculateDaysRemaining();
  const streak = calculateCheckInStreak();
  const metrics = getRecentMetrics();

  // Engine Averages calculation
  const wellnessScore = calculateWellnessScore(checkins.slice(-7));
  const wellnessStatus = classifyWellnessStatus(wellnessScore);

  const getMoodEmoji = (score: number) => {
    if (score >= 8.5) return '😇';
    if (score >= 6.5) return '😊';
    if (score >= 4.5) return '😐';
    if (score >= 2.5) return '😔';
    return '😫';
  };

  const getStressColor = (score: number) => {
    if (score >= 7.5) return 'var(--danger)';
    if (score >= 4.5) return 'var(--warning)';
    return 'var(--success)';
  };

  const getRatingColor = (score: number) => {
    if (score >= 7.5) return 'var(--success)';
    if (score >= 4.5) return 'var(--warning)';
    return 'var(--danger)';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Healthy': return 'var(--success)';
      case 'Moderate Concern': return 'var(--warning)';
      case 'High Stress': return '#f97316'; // Orange
      default: return 'var(--danger)';
    }
  };

  return (
    <div className="animated-fade-in">
      {/* Welcome Greeting Card */}
      <div className="dashboard-hero">
        <h2 style={{ fontSize: '1.6rem', marginBottom: '0.25rem' }}>Stay strong, {profile.name}!</h2>
        <p style={{ opacity: 0.9, fontSize: '0.9rem' }}>
          Preparing for {profile.exam} is a marathon. Take regular focus breaks.
        </p>

        {profile.examDate && (
          <div className="countdown-widget">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Calendar size={18} aria-hidden="true" />
              <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>{profile.exam} Countdown</span>
            </div>
            <div className="countdown-digits">
              {daysLeft > 0 ? `${daysLeft} Days Left` : 'Exam Day is Here!'}
            </div>
          </div>
        )}
      </div>

      {/* NEW: AI Wellness Status Summary Card (Keyboard Accessible) */}
      <div 
        className="glass-card glow animated-slide-up" 
        style={{ borderLeft: `5px solid ${getStatusColor(wellnessStatus)}` }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>AI Wellness Diagnostic</span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginTop: '0.2rem' }}>
              <span style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'Outfit, sans-serif' }}>Score: {wellnessScore}/100</span>
              <span 
                className="badge" 
                style={{ 
                  background: getStatusColor(wellnessStatus) + '20', 
                  color: getStatusColor(wellnessStatus),
                  fontWeight: 700 
                }}
              >
                {wellnessStatus}
              </span>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
              {wellnessStatus === 'Healthy' 
                ? "Your preparation wellness indices are positive! Keep up your resting schedule."
                : "Wellness metrics indicate stress blocks. Review your dynamic recommendations."
              }
            </p>
          </div>
          <button 
            className="btn btn-primary" 
            onClick={() => onNavigate('insights')}
            style={{ 
              padding: '0.5rem 1rem', 
              fontSize: '0.8rem',
              background: getStatusColor(wellnessStatus),
              borderColor: getStatusColor(wellnessStatus),
              boxShadow: 'none'
            }}
            aria-label="View personalized wellness advisor playbooks"
          >
            Review Advisor
          </button>
        </div>
      </div>

      {/* Log Pending Alert */}
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

      {/* Metrics Grid */}
      <div className="quick-stats-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
        {/* Streak */}
        <div className="glass-card stat-card" tabIndex={0} aria-label={`Check in streak: ${streak} days`}>
          <div className="stat-val" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}>
            <Flame size={24} fill="currentColor" style={{ color: streak > 0 ? 'var(--secondary)' : 'var(--text-muted)' }} aria-hidden="true" />
            <span>{streak}</span>
          </div>
          <div className="stat-lbl">Check-in Streak</div>
        </div>

        {/* Avg Mood */}
        <div className="glass-card stat-card" tabIndex={0} aria-label={`7 day average mood: ${metrics.avgMood} out of 10`}>
          <div className="stat-val">
            {metrics.avgMood > 0 ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}>
                <span style={{ fontSize: '1.5rem' }} aria-hidden="true">{getMoodEmoji(metrics.avgMood)}</span>
                <span style={{ fontSize: '1.25rem', fontWeight: 700 }}>{metrics.avgMood}</span>
              </span>
            ) : (
              '--'
            )}
          </div>
          <div className="stat-lbl">Avg Mood (7 days)</div>
        </div>

        {/* Avg Stress */}
        <div className="glass-card stat-card" tabIndex={0} aria-label={`7 day average stress: ${metrics.avgStress} out of 10`}>
          <div className="stat-val" style={{ color: getStressColor(metrics.avgStress) }}>
            {metrics.avgStress > 0 ? `${metrics.avgStress}/10` : '--'}
          </div>
          <div className="stat-lbl">Avg Stress Level</div>
        </div>

        {/* Avg Energy */}
        <div className="glass-card stat-card" tabIndex={0} aria-label={`7 day average energy: ${metrics.avgEnergy} out of 10`}>
          <div className="stat-val" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem', color: getRatingColor(metrics.avgEnergy) }}>
            <Zap size={18} fill="currentColor" aria-hidden="true" />
            <span>{metrics.avgEnergy > 0 ? `${metrics.avgEnergy}/10` : '--'}</span>
          </div>
          <div className="stat-lbl">Avg Energy Level</div>
        </div>

        {/* Avg Sleep */}
        <div className="glass-card stat-card" tabIndex={0} aria-label={`7 day average sleep quality: ${metrics.avgSleep} out of 10`}>
          <div className="stat-val" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem', color: getRatingColor(metrics.avgSleep) }}>
            <Moon size={18} fill="currentColor" aria-hidden="true" />
            <span>{metrics.avgSleep > 0 ? `${metrics.avgSleep}/10` : '--'}</span>
          </div>
          <div className="stat-lbl">Avg Sleep Quality</div>
        </div>

        {/* Analytics Shortcut */}
        <button 
          className="glass-card stat-card btn" 
          style={{ width: '100%', border: '1px solid var(--border-color)', margin: 0 }}
          onClick={() => onNavigate('analytics')}
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

      {/* Motivational Quote */}
      <div className="glass-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <h3 style={{ fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ color: 'var(--warning)' }} aria-hidden="true">★</span> Daily Motivation
          </h3>
          <button 
            onClick={refreshQuote}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
            aria-label="Refresh motivational quote"
          >
            <RefreshCw size={14} aria-hidden="true" />
          </button>
        </div>
        <div className="quote-box" tabIndex={0}>
          "{quote.text}"
        </div>
        <div className="quote-author">— {quote.author}</div>
      </div>

      {/* Shortcuts */}
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
          onClick={() => {
            onNavigate('insights');
          }} 
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
