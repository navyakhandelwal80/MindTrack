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

interface CheckInFormProps {
  existingCheckIns: CheckIn[];
  onSave: (checkin: CheckIn) => void;
}

export const CheckInForm: React.FC<CheckInFormProps> = ({ existingCheckIns, onSave }) => {
  const [date, setDate] = useState<string>(formatDateString(new Date()));
  const [mood, setMood] = useState<number>(6); // Default to Neutral/Good
  const [stress, setStress] = useState<number>(5); // Default to Medium
  const [energy, setEnergy] = useState<number>(6); // Default to Moderate
  const [sleepQuality, setSleepQuality] = useState<number>(7); // Default to Good
  const [studyHours, setStudyHours] = useState<number>(8);
  const [examType, setExamType] = useState<ExamType>('JEE');
  const [selectedTriggers, setSelectedTriggers] = useState<string[]>([]);
  const [exerciseMinutes, setExerciseMinutes] = useState<number>(30);
  const [waterCups, setWaterCups] = useState<number>(6);
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
      setMood(6);
      setStress(5);
      setEnergy(6);
      setSleepQuality(7);
      setStudyHours(8);
      setExamType('JEE');
      setSelectedTriggers([]);
      setExerciseMinutes(30);
      setWaterCups(6);
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

            {/* Mood Slider */}
            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="form-label" htmlFor="checkin-mood" style={{ marginBottom: 0 }}>Mood Rating</label>
                <span className="badge" style={{ background: getRatingColor(mood, 'mood') + '20', color: getRatingColor(mood, 'mood') }}>
                  {getMoodEmojiWithLabel(mood)}
                </span>
              </div>
              <input
                type="range"
                id="checkin-mood"
                min="1"
                max="10"
                value={mood}
                aria-valuemin={1}
                aria-valuemax={10}
                aria-valuenow={mood}
                aria-valuetext={getMoodEmojiWithLabel(mood)}
                onChange={(e) => setMood(parseInt(e.target.value))}
                className="custom-range"
                style={{ accentColor: getRatingColor(mood, 'mood') }}
              />
            </div>

            {/* Stress Slider */}
            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="form-label" htmlFor="checkin-stress" style={{ marginBottom: 0 }}>Stress Level</label>
                <span className="badge" style={{ background: getRatingColor(stress, 'stress') + '20', color: getRatingColor(stress, 'stress') }}>
                  {getStressLabel(stress)} ({stress}/10)
                </span>
              </div>
              <input
                type="range"
                id="checkin-stress"
                min="1"
                max="10"
                value={stress}
                aria-valuemin={1}
                aria-valuemax={10}
                aria-valuenow={stress}
                aria-valuetext={getStressLabel(stress)}
                onChange={(e) => setStress(parseInt(e.target.value))}
                className="custom-range"
                style={{ accentColor: getRatingColor(stress, 'stress') }}
              />
            </div>

            {/* Energy Slider */}
            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="form-label" htmlFor="checkin-energy" style={{ marginBottom: 0 }}>Energy Level</label>
                <span className="badge" style={{ background: getRatingColor(energy, 'energy') + '20', color: getRatingColor(energy, 'energy') }}>
                  {getEnergyLabel(energy)} ({energy}/10)
                </span>
              </div>
              <input
                type="range"
                id="checkin-energy"
                min="1"
                max="10"
                value={energy}
                aria-valuemin={1}
                aria-valuemax={10}
                aria-valuenow={energy}
                aria-valuetext={getEnergyLabel(energy)}
                onChange={(e) => setEnergy(parseInt(e.target.value))}
                className="custom-range"
                style={{ accentColor: getRatingColor(energy, 'energy') }}
              />
            </div>

            {/* Sleep Quality Slider */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="form-label" htmlFor="checkin-sleep" style={{ marginBottom: 0 }}>Sleep Quality</label>
                <span className="badge" style={{ background: getRatingColor(sleepQuality, 'sleep') + '20', color: getRatingColor(sleepQuality, 'sleep') }}>
                  {getSleepLabel(sleepQuality)} ({sleepQuality}/10)
                </span>
              </div>
              <input
                type="range"
                id="checkin-sleep"
                min="1"
                max="10"
                value={sleepQuality}
                aria-valuemin={1}
                aria-valuemax={10}
                aria-valuenow={sleepQuality}
                aria-valuetext={getSleepLabel(sleepQuality)}
                onChange={(e) => setSleepQuality(parseInt(e.target.value))}
                className="custom-range"
                style={{ accentColor: getRatingColor(sleepQuality, 'sleep') }}
              />
            </div>
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
