import React from 'react';

interface RatingSliderProps {
  id: string;
  label: string;
  value: number;
  onChange: (value: number) => void;
  colorType: 'mood' | 'stress' | 'energy' | 'sleep';
  badgeLabel: string;
  getRatingColor: (level: number, type: 'mood' | 'stress' | 'energy' | 'sleep' | 'general') => string;
  /** Whether this is the last slider in the group (no bottom margin). */
  isLast?: boolean;
}

/**
 * Reusable 1–10 range slider with dynamic color badge.
 * Eliminates the 4× duplicated slider block in CheckInForm.
 */
export const RatingSlider: React.FC<RatingSliderProps> = ({
  id,
  label,
  value,
  onChange,
  colorType,
  badgeLabel,
  getRatingColor,
  isLast = false,
}) => {
  const color = getRatingColor(value, colorType);

  return (
    <div className="form-group" style={{ marginBottom: isLast ? 0 : '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <label className="form-label" htmlFor={id} style={{ marginBottom: 0 }}>{label}</label>
        <span className="badge" style={{ background: color + '20', color }}>
          {badgeLabel}
        </span>
      </div>
      <input
        type="range"
        id={id}
        min="1"
        max="10"
        value={value}
        aria-valuemin={1}
        aria-valuemax={10}
        aria-valuenow={value}
        aria-valuetext={badgeLabel}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="custom-range"
        style={{ accentColor: color }}
      />
    </div>
  );
};

export default RatingSlider;
