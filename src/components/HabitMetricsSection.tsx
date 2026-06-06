import React from 'react';
import { Plus, Minus } from 'lucide-react';

interface HabitMetricsSectionProps {
  studyHours: number;
  setStudyHours: (hours: number) => void;
  exerciseMinutes: number;
  setExerciseMinutes: (mins: number) => void;
  waterCups: number;
  setWaterCups: (cups: number) => void;
}

export const HabitMetricsSection: React.FC<HabitMetricsSectionProps> = ({
  studyHours,
  setStudyHours,
  exerciseMinutes,
  setExerciseMinutes,
  waterCups,
  setWaterCups,
}) => {
  const increment = (val: number, setter: (v: number) => void, max = 24, step = 1) => {
    setter(Math.min(max, val + step));
  };

  const decrement = (val: number, setter: (v: number) => void, min = 0, step = 1) => {
    setter(Math.max(min, val - step));
  };

  return (
    <div className="glass-card">
      <h3 style={{ fontSize: '1.05rem', marginBottom: '1rem' }}>Daily Activity Metrics</h3>
      
      {/* Study Hours */}
      <div className="habit-tracker-row">
        <div>
          <strong style={{ fontSize: '0.9rem', display: 'block' }}>Study Duration</strong>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Focused exam preparation</span>
        </div>
        <div className="habit-value-controller">
          <button 
            type="button" 
            className="controller-btn" 
            aria-label="Decrease study hours"
            onClick={() => decrement(studyHours, setStudyHours, 0, 0.5)}
          >
            <Minus size={14} aria-hidden="true" />
          </button>
          <span className="habit-val-display" aria-live="polite" aria-label={`${studyHours} study hours`}>
            {studyHours} hrs
          </span>
          <button 
            type="button" 
            className="controller-btn" 
            aria-label="Increase study hours"
            onClick={() => increment(studyHours, setStudyHours, 24, 0.5)}
          >
            <Plus size={14} aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Exercise Minutes */}
      <div className="habit-tracker-row">
        <div>
          <strong style={{ fontSize: '0.9rem', display: 'block' }}>Exercise & Movement</strong>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Walk, gym, yoga, stretching</span>
        </div>
        <div className="habit-value-controller">
          <button 
            type="button" 
            className="controller-btn" 
            aria-label="Decrease exercise minutes"
            onClick={() => decrement(exerciseMinutes, setExerciseMinutes, 0, 5)}
          >
            <Minus size={14} aria-hidden="true" />
          </button>
          <span className="habit-val-display" aria-live="polite" aria-label={`${exerciseMinutes} exercise minutes`}>
            {exerciseMinutes} min
          </span>
          <button 
            type="button" 
            className="controller-btn" 
            aria-label="Increase exercise minutes"
            onClick={() => increment(exerciseMinutes, setExerciseMinutes, 300, 5)}
          >
            <Plus size={14} aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Water Cups */}
      <div className="habit-tracker-row">
        <div>
          <strong style={{ fontSize: '0.9rem', display: 'block' }}>Hydration</strong>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Water cups logged</span>
        </div>
        <div className="habit-value-controller">
          <button 
            type="button" 
            className="controller-btn" 
            aria-label="Decrease water cups"
            onClick={() => decrement(waterCups, setWaterCups, 0, 1)}
          >
            <Minus size={14} aria-hidden="true" />
          </button>
          <span className="habit-val-display" aria-live="polite" aria-label={`${waterCups} water cups`}>
            {waterCups} cups
          </span>
          <button 
            type="button" 
            className="controller-btn" 
            aria-label="Increase water cups"
            onClick={() => increment(waterCups, setWaterCups, 30, 1)}
          >
            <Plus size={14} aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default HabitMetricsSection;
