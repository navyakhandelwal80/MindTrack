import React from 'react';
import { Sparkles, Activity, Clock, ShieldAlert, Award, ChevronDown, Moon } from 'lucide-react';
import type { CheckIn } from '../types';
import { getProfile, getJournalEntries } from '../utils/storage';
import { generateWellnessRecommendations } from '../utils/wellnessEngine';
import { getStatusColor } from '../utils/presentation';

interface InsightsProps {
  checkins: CheckIn[];
}

export const Insights: React.FC<InsightsProps> = ({ checkins }) => {
  const profile = getProfile();
  const journalEntries = getJournalEntries();

  // Generate wellness recommendations using the expert engine
  const recentLogs = checkins.slice(-7);
  const wellness = generateWellnessRecommendations(recentLogs, journalEntries, profile);

  const statusColor = getStatusColor(wellness.status);

  // SVG Circular Gauge calculation
  // Radius R = 60, Circumference = 2 * PI * 60 ≈ 376.99
  const progressRatio = wellness.score / 100;
  const strokeDashoffset = 376.99 * (1 - progressRatio);

  return (
    <div className="animated-fade-in" role="region" aria-label="AI Wellness Support Advisor">
      {/* 1. Score circular Speedometer meter */}
      <div className="glass-card text-center" style={{ padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Sparkles size={20} style={{ color: 'var(--primary)' }} aria-hidden="true" /> AI Wellness support
        </h2>

        <div style={{ position: 'relative', width: '150px', height: '150px', marginBottom: '1rem' }} aria-label={`Wellness Score: ${wellness.score} out of 100`}>
          <svg width="150" height="150" viewBox="0 0 150 150">
            <circle
              cx="75"
              cy="75"
              r="60"
              fill="none"
              stroke="var(--border-color)"
              strokeWidth="10"
            />
            <circle
              cx="75"
              cy="75"
              r="60"
              fill="none"
              stroke={statusColor}
              strokeWidth="10"
              strokeDasharray="376.99"
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              transform="rotate(-90 75 75)"
              style={{ transition: 'stroke-dashoffset 0.8s ease-out' }}
            />
          </svg>
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <span style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'Outfit, sans-serif', color: 'var(--text-primary)' }}>
              {wellness.score}
            </span>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>
              Wellness Index
            </span>
          </div>
        </div>

        {/* Status Indicator Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0.5rem 0' }}>
          <span 
            style={{ 
              width: '12px', 
              height: '12px', 
              borderRadius: '50%', 
              background: statusColor, 
              display: 'inline-block',
              boxShadow: `0 0 10px ${statusColor}`
            }} 
            aria-hidden="true"
          />
          <span style={{ fontWeight: 800, fontSize: '1.05rem', color: statusColor }}>
            {wellness.status}
          </span>
        </div>

        <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', maxWidth: '340px', lineHeight: 1.4, marginTop: '0.5rem' }}>
          This index evaluates your study hours, sleep schedules, active triggers, and journals over the last 7 logged days.
        </p>
      </div>

      {/* 2. Encapsulated Encouragement Greeting Box */}
      <div 
        className="glass-card animated-slide-up" 
        style={{ borderLeft: `5px solid ${statusColor}`, background: 'rgba(99, 102, 241, 0.03)' }}
        tabIndex={0}
        aria-label="Personalized wellness message"
      >
        <p style={{ fontSize: '0.9rem', lineHeight: 1.5, color: 'var(--text-primary)' }}>
          {wellness.encouragement}
        </p>
      </div>

      {/* 3. Collage of Collapsible Accordions (WCAG compliant keyboard Details/Summary tags) */}
      <h3 style={{ fontSize: '1.1rem', marginBottom: '0.75rem', marginTop: '1.5rem' }}>Actionable Wellness Guidelines</h3>

      {/* Accordion 1: Stress management */}
      <details className="animated-slide-up">
        <summary id="summary-stress">
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Activity size={16} style={{ color: 'var(--primary)' }} aria-hidden="true" />
            <span>Stress Management Recommendations</span>
          </span>
          <ChevronDown size={16} aria-hidden="true" />
        </summary>
        <div className="details-content" role="region" aria-labelledby="summary-stress">
          <p>We recommend incorporating the following focus practices to manage exam pressure:</p>
          <ul>
            {wellness.stressRecommendations.map((rec, idx) => (
              <li key={idx}>{rec}</li>
            ))}
          </ul>
        </div>
      </details>

      {/* Accordion 2: Study life balance */}
      <details className="animated-slide-up">
        <summary id="summary-balance">
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Clock size={16} style={{ color: 'var(--secondary)' }} aria-hidden="true" />
            <span>Study-Life Balance Suggestions</span>
          </span>
          <ChevronDown size={16} aria-hidden="true" />
        </summary>
        <div className="details-content" role="region" aria-labelledby="summary-balance">
          <p>To keep study durations healthy and prevent chronic burnout:</p>
          <ul>
            {wellness.studyLifeBalance.map((rec, idx) => (
              <li key={idx}>{rec}</li>
            ))}
          </ul>
        </div>
      </details>

      {/* Accordion 3: Sleep quality */}
      <details className="animated-slide-up">
        <summary id="summary-sleep">
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Moon size={16} style={{ color: 'var(--success)' }} aria-hidden="true" />
            <span>Sleep Improvement Suggestions</span>
          </span>
          <ChevronDown size={16} aria-hidden="true" />
        </summary>
        <div className="details-content" role="region" aria-labelledby="summary-sleep">
          <p>Proper sleep enhances memory storage and logical derivation. Try these rituals:</p>
          <ul>
            {wellness.sleepImprovement.map((rec, idx) => (
              <li key={idx}>{rec}</li>
            ))}
          </ul>
        </div>
      </details>

      {/* Accordion 4: Burnout Risk Assessment */}
      <details className="animated-slide-up">
        <summary id="summary-burnout">
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldAlert size={16} style={{ color: 'var(--danger)' }} aria-hidden="true" />
            <span>Burnout Risk Assessment</span>
          </span>
          <ChevronDown size={16} aria-hidden="true" />
        </summary>
        <div className="details-content" role="region" aria-labelledby="summary-burnout">
          <p style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Burnout Risk Diagnostic:</p>
          <p>{wellness.burnoutRiskAssessment}</p>
        </div>
      </details>

      {/* Accordion 5: Motivation & affirmations */}
      <details className="animated-slide-up">
        <summary id="summary-motivation">
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Award size={16} style={{ color: 'var(--warning)' }} aria-hidden="true" />
            <span>Daily Motivation Reminders</span>
          </span>
          <ChevronDown size={16} aria-hidden="true" />
        </summary>
        <div className="details-content" role="region" aria-labelledby="summary-motivation">
          <p>Affirmations to repeat when experiencing self-doubt:</p>
          <ul>
            {wellness.motivationReminders.map((rec, idx) => (
              <li key={idx}>{rec}</li>
            ))}
          </ul>
        </div>
      </details>

      {/* Non-Medical Disclaimer disclaimer */}
      <div 
        className="glass-card animated-slide-up" 
        style={{ marginTop: '2rem', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', opacity: 0.8 }}
        tabIndex={0}
      >
        <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', lineHeight: '1.4', textAlign: 'center' }}>
          <strong>Non-Medical Disclaimer:</strong> MindTrack provides student support tools and wellness guidance based on self-reported inputs. It does not provide medical diagnoses or psychological treatments. If you are experiencing severe emotional distress or depression, please contact certified student counselors or mental health professionals.
        </p>
      </div>
    </div>
  );
};

export default Insights;
