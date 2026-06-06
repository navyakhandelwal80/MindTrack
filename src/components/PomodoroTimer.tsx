import React from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import usePomodoro from '../hooks/usePomodoro';

export const PomodoroTimer: React.FC = () => {
  const {
    pomoActive,
    pomoMode,
    pomoSecondsLeft,
    pomoMute,
    strokeDashoffset,
    setPomoActive,
    setPomoMute,
    handlePomoReset,
    togglePomoMode,
    formatPomoTime,
  } = usePomodoro();

  return (
    <div className="animated-slide-up">
      <div className="glass-card text-center pomodoro-container">
        <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Pomodoro Wellness Timer</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', maxWidth: '300px', margin: '0 auto 1.5rem auto', lineHeight: '1.4' }}>
          Study intensely for 25 minutes, then take a guilt-free 5-minute wellness break to stretch and drink water.
        </p>

        {/* Mode Toggle Buttons */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
          <button
            className={`btn ${pomoMode === 'study' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '0.4rem 1rem', fontSize: '0.8rem' }}
            onClick={() => togglePomoMode('study')}
          >
            Study Session (25m)
          </button>
          <button
            className={`btn ${pomoMode === 'break' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '0.4rem 1rem', fontSize: '0.8rem' }}
            onClick={() => togglePomoMode('break')}
          >
            Wellness Break (5m)
          </button>
        </div>

        {/* Circular Timer Display */}
        <div className="pomodoro-timer-circle">
          <svg className="timer-progress-svg" width="192" height="192">
            <circle
              cx="96"
              cy="96"
              r="80"
              fill="none"
              stroke={pomoMode === 'study' ? 'var(--primary-light)' : 'rgba(16, 185, 129, 0.15)'}
              strokeWidth="8"
            />
            <circle
              cx="96"
              cy="96"
              r="80"
              fill="none"
              stroke={pomoMode === 'study' ? 'var(--primary)' : 'var(--success)'}
              strokeWidth="8"
              strokeDasharray="502.65"
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 1s linear' }}
            />
          </svg>

          <div className="pomodoro-countdown">
            {formatPomoTime(pomoSecondsLeft)}
          </div>
          <div className="pomodoro-lbl">
            {pomoMode === 'study' ? 'Study' : 'Break'}
          </div>
        </div>

        {/* Timer Controls */}
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', justifyContent: 'center' }}>
          <button
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
            onClick={() => setPomoMute(!pomoMute)}
            title={pomoMute ? 'Unmute alarms' : 'Mute alarms'}
          >
            {pomoMute ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>

          <button
            className="btn btn-primary"
            style={{ width: '48px', height: '48px', borderRadius: '50%', padding: 0 }}
            onClick={() => setPomoActive(!pomoActive)}
            title={pomoActive ? 'Pause' : 'Start'}
          >
            {pomoActive ? <Pause size={20} /> : <Play size={20} style={{ marginLeft: '3px' }} />}
          </button>

          <button
            className="btn btn-secondary"
            style={{ width: '48px', height: '48px', borderRadius: '50%', padding: 0 }}
            onClick={handlePomoReset}
            title="Reset timer"
          >
            <RotateCcw size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PomodoroTimer;
