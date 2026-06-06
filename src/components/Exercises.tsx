import React, { useState } from 'react';
import { Wind, Clock } from 'lucide-react';

// Sub-components
import BreathingVisualizer from './BreathingVisualizer';
import PomodoroTimer from './PomodoroTimer';
import AffirmationBanner from './AffirmationBanner';

export const Exercises: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'breathing' | 'pomodoro'>('breathing');

  return (
    <div className="animated-fade-in">
      {/* Top Toggle Switcher between Breathing and Pomodoro */}
      <div className="tab-headers">
        <button
          className={`sub-tab-btn ${activeTab === 'breathing' ? 'active' : ''}`}
          onClick={() => setActiveTab('breathing')}
        >
          <Wind size={16} style={{ verticalAlign: 'middle', marginRight: '0.35rem' }} />
          Box Breathing
        </button>
        <button
          className={`sub-tab-btn ${activeTab === 'pomodoro' ? 'active' : ''}`}
          onClick={() => setActiveTab('pomodoro')}
        >
          <Clock size={16} style={{ verticalAlign: 'middle', marginRight: '0.35rem' }} />
          Study Pomodoro
        </button>
      </div>

      {activeTab === 'breathing' ? (
        /* Box Breathing View */
        <BreathingVisualizer />
      ) : (
        /* Pomodoro Timer View */
        <PomodoroTimer />
      )}

      {/* Positive Affirmations Banner Card */}
      <AffirmationBanner />
    </div>
  );
};

export default Exercises;
