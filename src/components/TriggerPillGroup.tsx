import React from 'react';

interface TriggerPillGroupProps {
  selectedTriggers: string[];
  onToggleTrigger: (trigger: string) => void;
}

const AVAILABLE_TRIGGERS = [
  'Exam pressure',
  'Lack of preparation',
  'Time management',
  'Family expectations',
  'Peer comparison',
  'Result anxiety',
  'Burnout',
  'Financial concerns'
];

export const TriggerPillGroup: React.FC<TriggerPillGroupProps> = ({
  selectedTriggers,
  onToggleTrigger,
}) => {
  return (
    <div className="glass-card">
      <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
        Identify Stress Triggers
      </h3>
      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
        What is contributing to your stress today? (Select all that apply)
      </p>
      <div className="triggers-container" role="group" aria-label="Stress triggers selection">
        {AVAILABLE_TRIGGERS.map((trigger) => {
          const isSelected = selectedTriggers.includes(trigger);
          return (
            <button
              key={trigger}
              type="button"
              className={`trigger-pill ${isSelected ? 'selected' : ''}`}
              aria-pressed={isSelected}
              onClick={() => onToggleTrigger(trigger)}
            >
              {trigger} {isSelected && '✓'}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default TriggerPillGroup;
