import React from 'react';
import useBoxBreathing from '../hooks/useBoxBreathing';

export const BreathingVisualizer: React.FC = () => {
  const { breathActive, setBreathActive, phaseText, scale, countdown } = useBoxBreathing();

  return (
    <div className="animated-slide-up">
      <div className="glass-card text-center breathing-exercise-container">
        <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Anxiety Release Breathing</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', maxWidth: '300px', margin: '0 auto 2rem auto', lineHeight: '1.4' }}>
          Used by professional athletes and high-stress performers. Equal times inhaling, holding, exhaling, and holding empty.
        </p>

        {/* Pulsing Breathing Ring */}
        <div className="breathing-ring-outer">
          <div 
            className="breathing-bubble"
            style={{
              transform: `scale(${scale})`,
              transition: 'transform 0.1s linear',
              background: breathActive ? undefined : 'rgba(99, 102, 241, 0.2)'
            }}
          >
            <span style={{ fontSize: '1rem', fontWeight: 800 }}>
              {breathActive ? phaseText : 'Ready'}
            </span>
            {breathActive && (
              <span style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '0.25rem' }}>
                {countdown}
              </span>
            )}
          </div>
        </div>

        {/* Start/Stop Button */}
        <button
          className="btn btn-primary"
          style={{ padding: '0.8rem 2rem', minWidth: '150px' }}
          onClick={() => setBreathActive(!breathActive)}
        >
          {breathActive ? 'Pause Exercise' : 'Start Exercise'}
        </button>
      </div>
    </div>
  );
};

export default BreathingVisualizer;
