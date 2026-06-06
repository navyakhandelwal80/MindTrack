import React, { useState } from 'react';
import { X, Save } from 'lucide-react';
import type { UserProfile } from '../types';

interface ProfileModalProps {
  profile: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onSave: (profile: UserProfile) => void;
}

const AVAILABLE_EXAMS = [
  'JEE (IIT Joint Entrance Exam)',
  'NEET (National Eligibility cum Entrance Test)',
  'UPSC (Union Public Service Commission)',
  'GATE (Graduate Aptitude Test in Engineering)',
  'CAT (Common Admission Test)',
  'CUET (Common University Entrance Test)',
  'Board Exams (Class 10/12)',
  'Other Competitive Exams'
];

export const ProfileModal: React.FC<ProfileModalProps> = ({
  profile,
  isOpen,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState<string>(profile.name);
  const [exam, setExam] = useState<string>(profile.exam);
  const [examDate, setExamDate] = useState<string>(profile.examDate || '');
  const [dailyStudyGoal, setDailyStudyGoal] = useState<number>(profile.dailyStudyGoal);
  const [dailySleepGoal, setDailySleepGoal] = useState<number>(profile.dailySleepGoal);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSave({
      name: name.trim(),
      exam,
      examDate,
      dailyStudyGoal,
      dailySleepGoal,
    });
    onClose();
  };

  return (
    <div className="profile-overlay animated-fade-in" onClick={onClose}>
      <div className="profile-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 style={{ fontSize: '1.2rem', fontFamily: 'Outfit, sans-serif' }}>Aspirant Profile</h3>
          <button 
            onClick={onClose} 
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
            title="Close"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Name Field */}
          <div className="form-group">
            <label className="form-label" htmlFor="profile-name">Student Name</label>
            <input
              type="text"
              id="profile-name"
              className="form-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Enter your name..."
            />
          </div>

          {/* Exam Type Field */}
          <div className="form-group">
            <label className="form-label" htmlFor="profile-exam">Target Exam</label>
            <select
              id="profile-exam"
              className="form-select"
              value={exam}
              onChange={(e) => setExam(e.target.value)}
            >
              {AVAILABLE_EXAMS.map((examOpt) => (
                <option key={examOpt} value={examOpt.split(' ')[0]}>
                  {examOpt}
                </option>
              ))}
            </select>
          </div>

          {/* Target Exam Date Field */}
          <div className="form-group">
            <label className="form-label" htmlFor="profile-exam-date">Target Exam Date</label>
            <input
              type="date"
              id="profile-exam-date"
              className="form-input"
              value={examDate}
              min={new Date().toISOString().split('T')[0]} // Prevents setting past date
              onChange={(e) => setExamDate(e.target.value)}
            />
          </div>

          {/* Daily Study Target */}
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <label className="form-label">Daily Study Target</label>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--primary)' }}>{dailyStudyGoal} hrs</span>
            </div>
            <input
              type="range"
              min="2"
              max="16"
              step="0.5"
              value={dailyStudyGoal}
              onChange={(e) => setDailyStudyGoal(parseFloat(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--primary)' }}
            />
          </div>

          {/* Daily Sleep Target */}
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <label className="form-label">Daily Sleep Target</label>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--secondary)' }}>{dailySleepGoal} hrs</span>
            </div>
            <input
              type="range"
              min="4"
              max="10"
              step="0.5"
              value={dailySleepGoal}
              onChange={(e) => setDailySleepGoal(parseFloat(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--secondary)' }}
            />
          </div>

          {/* Form Actions */}
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button 
              type="button" 
              className="btn btn-secondary" 
              style={{ flex: 1 }} 
              onClick={onClose}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ flex: 1.5 }}
            >
              <Save size={16} /> Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileModal;
