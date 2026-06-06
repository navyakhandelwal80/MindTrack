import React from 'react';
import { getStatusColor } from '../utils/presentation';

interface WellnessScoreCardProps {
  wellnessScore: number;
  wellnessStatus: 'Healthy' | 'Moderate Concern' | 'High Stress' | 'Burnout Risk';
  onReviewAdvisor: () => void;
}

export const WellnessScoreCard: React.FC<WellnessScoreCardProps> = ({
  wellnessScore,
  wellnessStatus,
  onReviewAdvisor,
}) => {
  const statusColor = getStatusColor(wellnessStatus);

  return (
    <div 
      className="glass-card glow animated-slide-up" 
      style={{ borderLeft: `5px solid ${statusColor}` }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            AI Wellness Diagnostic
          </span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginTop: '0.2rem' }}>
            <span style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'Outfit, sans-serif' }}>
              Score: {wellnessScore}/100
            </span>
            <span 
              className="badge" 
              style={{ 
                background: statusColor + '20', 
                color: statusColor,
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
          onClick={onReviewAdvisor}
          style={{ 
            padding: '0.5rem 1rem', 
            fontSize: '0.8rem',
            background: statusColor,
            borderColor: statusColor,
            boxShadow: 'none'
          }}
          aria-label="View personalized wellness advisor playbooks"
        >
          Review Advisor
        </button>
      </div>
    </div>
  );
};

export default WellnessScoreCard;
