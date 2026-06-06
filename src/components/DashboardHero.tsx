import React from 'react';
import { Calendar } from 'lucide-react';
import type { UserProfile } from '../types';
import { calculateDaysRemaining } from '../utils/date';

interface DashboardHeroProps {
  profile: UserProfile;
}

export const DashboardHero: React.FC<DashboardHeroProps> = ({ profile }) => {
  const daysLeft = calculateDaysRemaining(profile.examDate);

  return (
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
  );
};

export default DashboardHero;
