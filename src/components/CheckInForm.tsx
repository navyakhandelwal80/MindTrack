import React, { useState, useEffect } from 'react';
import { CheckCircle } from 'lucide-react';
import type { CheckIn, ExamType } from '../types';
import { VALID_EXAM_TYPES } from '../types';
import { formatDateString } from '../utils/date';
import {
  getRatingColor,
  getMoodEmojiWithLabel,
  getStressLabel,
  getEnergyLabel,
  getSleepLabel,
} from '../utils/presentation';

// Sub-components
import HabitMetricsSection from './HabitMetricsSection';
import TriggerPillGroup from './TriggerPillGroup';
import RatingSlider from './RatingSlider';

/** Default check-in field values, used for both initial state and form reset. */
const CHECKIN_DEFAULTS = {
  mood: 6,
  stress: 5,
  energy: 6,
  sleepQuality: 7,
  studyHours: 8,
  examType: 'JEE' as ExamType,
  exerciseMinutes: 30,
  waterCups: 6,
} as const;

interface CheckInFormProps {
  existingCheckIns: CheckIn[];
  onSave: (checkin: CheckIn) => void;
}

export const CheckInForm: React.FC<CheckInFormProps> = ({ existingCheckIns, onSave }) => {
  const [date, setDate] = useState<string>(formatDateString(new Date()));
  const [mood, setMood] = useState<number>(CHECKIN_DEFAULTS.mood);
  const [stress, setStress] = useState<number>(CHECKIN_DEFAULTS.stress);
  const [energy, setEnergy] = useState<number>(CHECKIN_DEFAULTS.energy);
  const [sleepQuality, setSleepQuality] = useState<number>(CHECKIN_DEFAULTS.sleepQuality);
  const [studyHours, setStudyHours] = useState<number>(CHECKIN_DEFAULTS.studyHours);
  const [examType, setExamType] = useState<ExamType>(CHECKIN_DEFAULTS.examType);
  const [selectedTriggers, setSelectedTriggers] = useState<string[]>([]);
  const [exerciseMinutes, setExerciseMinutes] = useState<number>(CHECKIN_DEFAULTS.exerciseMinutes);
  const [waterCups, setWaterCups] = useState<number>(CHECKIN_DEFAULTS.waterCups);
  const [notes, setNotes] = useState<string>('');
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  // Load existing log if date changes
  useEffect(() => {
    const existing = existingCheckIns.find((c) => c.date === date);
    if (existing) {
      setMood(existing.mood);
      setStress(existing.stress);
      setEnergy(existing.energy || 6);
      setSleepQuality(existing.sleepQuality || 7);
      setStudyHours(existing.studyHours);
      setExamType((existing.examType || 'JEE') as ExamType);
      setSelectedTriggers(existing.triggers);
      setExerciseMinutes(existing.exerciseMinutes || 30);
      setWaterCups(existing.waterCups || 6);
      setNotes(existing.notes || '');
    } else {
      setMood(CHECKIN_DEFAULTS.mood);
      setStress(CHECKIN_DEFAULTS.stress);
      setEnergy(CHECKIN_DEFAULTS.energy);
      setSleepQuality(CHECKIN_DEFAULTS.sleepQuality);
      setStudyHours(CHECKIN_DEFAULTS.studyHours);
      setExamType(CHECKIN_DEFAULTS.examType);
      setSelectedTriggers([]);
      setExerciseMinutes(CHECKIN_DEFAULTS.exerciseMinutes);
      setWaterCups(CHECKIN_DEFAULTS.waterCups);
      setNotes('');
    }
  }, [date, existingCheckIns]);

  const toggleTrigger = (trigger: string) => {
    if (selectedTriggers.includes(trigger)) {
      setSelectedTriggers(selectedTriggers.filter((t) => t !== trigger));
    } else {
      setSelectedTriggers([...selectedTriggers, trigger]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const checkinData: CheckIn = {
      id: existingCheckIns.find((c) => c.date === date)?.id || `checkin-${Date.now()}`,
      date,
      mood,
      stress,
      energy,
      sleepQuality,
      studyHours,
      examType,
      triggers: selectedTriggers,
      exerciseMinutes,
      waterCups,
      notes: notes.trim(),
    };

    onSave(checkinData);
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
    }, 1200);
  };

  return (
    <div className="animated-fade-in">
      {isSubmitted ? (
        <div 
          className="glass-card text-center animated-slide-up" 
          role="status" 
          aria-live="polite"
          style={{ padding: '3rem 1.5rem', textAlign: 'center' }}
        >
          <CheckCircle size={56} style={{ color: 'var(--success)', marginBottom: '1rem' }} aria-hidden="true" />
          <h2 style={{ marginBottom: '0.5rem' }}>Check-In Logged!</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '1rem' }}>
            Your daily wellness logs have been saved securely.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="animated-slide-up">
          <div className="glass-card">
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Daily Wellness Log</h2>

            {/* Date and Exam Picker */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="checkin-date">Log Date</label>
                <input
                  type="date"
                  id="checkin-date"
                  className="form-input"
                  value={date}
                  max={formatDateString(new Date())}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="checkin-exam">Preparing For</label>
                <select
                  id="checkin-exam"
                  className="form-select"
                  value={examType}
                  onChange={(e) => setExamType(e.target.value as ExamType)}
                >
                  {VALID_EXAM_TYPES.map((eType) => (
                    <option key={eType} value={eType}>{eType}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* 1-10 Ratings */}
          <div className="glass-card">
            <h3 style={{ fontSize: '1.05rem', marginBottom: '1.25rem' }}>How are you feeling today? (Scale 1-10)</h3>

            <RatingSlider
              id="checkin-mood" label="Mood Rating" value={mood} onChange={setMood}
              colorType="mood" badgeLabel={getMoodEmojiWithLabel(mood)} getRatingColor={getRatingColor}
            />
            <RatingSlider
              id="checkin-stress" label="Stress Level" value={stress} onChange={setStress}
              colorType="stress" badgeLabel={`${getStressLabel(stress)} (${stress}/10)`} getRatingColor={getRatingColor}
            />
            <RatingSlider
              id="checkin-energy" label="Energy Level" value={energy} onChange={setEnergy}
              colorType="energy" badgeLabel={`${getEnergyLabel(energy)} (${energy}/10)`} getRatingColor={getRatingColor}
            />
            <RatingSlider
              id="checkin-sleep" label="Sleep Quality" value={sleepQuality} onChange={setSleepQuality}
              colorType="sleep" badgeLabel={`${getSleepLabel(sleepQuality)} (${sleepQuality}/10)`} getRatingColor={getRatingColor}
              isLast
            />
          </div>

          {/* Triggers Section */}
          <TriggerPillGroup
            selectedTriggers={selectedTriggers}
            onToggleTrigger={toggleTrigger}
          />

          {/* Habits Section */}
          <HabitMetricsSection
            studyHours={studyHours}
            setStudyHours={setStudyHours}
            exerciseMinutes={exerciseMinutes}
            setExerciseMinutes={setExerciseMinutes}
            waterCups={waterCups}
            setWaterCups={setWaterCups}
          />

          {/* Notes Section */}
          <div className="glass-card">
            <label className="form-label" htmlFor="checkin-notes">Daily Reflections</label>
            <textarea
              id="checkin-notes"
              className="form-textarea"
              rows={3}
              placeholder="Note down any triggers or general remarks for this day..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {/* Submit */}
          <div style={{ display: 'flex', gap: '1rem', margin: '1rem 0 2rem 0' }}>
            <button type="submit" className="btn btn-primary" style={{ flex: 1, padding: '1rem' }}>
              Save Check-In Logs
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default CheckInForm;
