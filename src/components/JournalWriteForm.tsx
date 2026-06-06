import React, { useState } from 'react';
import { Heart, Award } from 'lucide-react';
import type { JournalEntry } from '../types';
import { formatDateString } from '../utils/date';
import { getMoodEmojiOnly, getRatingColor } from '../utils/presentation';

interface JournalWriteFormProps {
  onSave: (entry: JournalEntry) => void;
  onCancel: () => void;
}

const REFLECTION_PROMPTS = [
  "Challenge a self-doubt: Write down a self-limiting belief you had today, and argue against it like a lawyer.",
  "What is one tough concept or problem you solved today? Explain it simply.",
  "List three things you are grateful for today that have absolutely nothing to do with exams.",
  "Describe a moment of pressure today. What parts can you control, and what parts are outside your control?",
  "If your friend was feeling this level of exam stress, what comforting advice would you give them?",
  "Describe how your body feels right now. Where are you holding tension, and can you release it?"
];

export const JournalWriteForm: React.FC<JournalWriteFormProps> = ({ onSave, onCancel }) => {
  const [title, setTitle] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const [gratitude, setGratitude] = useState<string>('');
  const [achievement, setAchievement] = useState<string>('');
  const [mood, setMood] = useState<number>(6); // Default to Neutral/Good
  const [stress, setStress] = useState<number>(5); // Default to Medium
  const [selectedPrompt, setSelectedPrompt] = useState<string>('');
  const [tagInput, setTagInput] = useState<string>('');

  const handleApplyPrompt = (prompt: string) => {
    setSelectedPrompt(prompt);
    if (!title) {
      setTitle(prompt.split(':')[0] || 'Daily Reflection');
    }
    setContent((prev) => {
      const promptHeader = `[Prompt: ${prompt}]\n\n`;
      if (prev.includes(prompt)) return prev;
      return promptHeader + prev;
    });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    const tags = tagInput
      .split(',')
      .map((t) => t.trim().toLowerCase())
      .filter((t) => t.length > 0);

    const newEntry: JournalEntry = {
      id: `journal-${Date.now()}`,
      date: formatDateString(new Date()),
      title: title.trim(),
      content: content.trim(),
      gratitude: gratitude.trim(),
      achievement: achievement.trim(),
      mood,
      stress,
      tags: tags.length > 0 ? tags : ['reflection'],
    };

    onSave(newEntry);
  };

  return (
    <form onSubmit={handleSave} className="animated-slide-up" aria-label="Write new journal entry">
      {/* Prompts list */}
      <div className="glass-card">
        <h3 style={{ fontSize: '0.95rem', marginBottom: '0.5rem' }}>💡 Stress Relief Prompts</h3>
        <div className="prompt-suggestions" role="group" aria-label="Reflection prompts suggestions">
          {REFLECTION_PROMPTS.map((p, idx) => (
            <button
              key={idx}
              type="button"
              className="prompt-pill"
              onClick={() => handleApplyPrompt(p)}
            >
              {p}
            </button>
          ))}
        </div>
        {selectedPrompt && (
          <div className="prompt-container-box" role="status" aria-live="polite">
            <span>Active: <em>{selectedPrompt.substring(0, 40)}...</em></span>
            <button 
              type="button" 
              style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', fontWeight: 600 }}
              onClick={() => setSelectedPrompt('')}
              aria-label="Remove active prompt"
            >
              Remove
            </button>
          </div>
        )}
      </div>

      <div className="glass-card">
        {/* Title */}
        <div className="form-group">
          <label className="form-label" htmlFor="journal-title">Title</label>
          <input
            type="text"
            id="journal-title"
            className="form-input"
            placeholder="Give this entry a title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        {/* Daily Journal Content */}
        <div className="form-group">
          <label className="form-label" htmlFor="journal-content">Daily Reflection Note</label>
          <textarea
            id="journal-content"
            className="form-textarea"
            rows={6}
            placeholder="Write freely. Express your thoughts, challenges or victory points..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          />
        </div>

        {/* Gratitude Note */}
        <div className="form-group">
          <label className="form-label" htmlFor="journal-gratitude">
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--secondary)' }}>
              <Heart size={14} fill="currentColor" aria-hidden="true" /> Gratitude Note
            </span>
          </label>
          <textarea
            id="journal-gratitude"
            className="form-textarea"
            rows={2}
            placeholder="What or who are you grateful for today?"
            value={gratitude}
            onChange={(e) => setGratitude(e.target.value)}
          />
        </div>

        {/* Achievement of the Day */}
        <div className="form-group">
          <label className="form-label" htmlFor="journal-achievement">
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--warning)' }}>
              <Award size={14} aria-hidden="true" /> Achievement of the Day
            </span>
          </label>
          <textarea
            id="journal-achievement"
            className="form-textarea"
            rows={2}
            placeholder="What did you master, complete, or overcome today?"
            value={achievement}
            onChange={(e) => setAchievement(e.target.value)}
          />
        </div>

        {/* Mood & Stress (1-10) sliders */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <label className="form-label" htmlFor="journal-mood">Mood ({mood}/10)</label>
              <span aria-hidden="true">{getMoodEmojiOnly(mood)}</span>
            </div>
            <input
              type="range"
              id="journal-mood"
              min="1"
              max="10"
              value={mood}
              aria-valuemin={1}
              aria-valuemax={10}
              aria-valuenow={mood}
              onChange={(e) => setMood(parseInt(e.target.value))}
              style={{ width: '100%', accentColor: getRatingColor(mood, 'mood') }}
            />
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <label className="form-label" htmlFor="journal-stress">Stress ({stress}/10)</label>
            </div>
            <input
              type="range"
              id="journal-stress"
              min="1"
              max="10"
              value={stress}
              aria-valuemin={1}
              aria-valuemax={10}
              aria-valuenow={stress}
              onChange={(e) => setStress(parseInt(e.target.value))}
              style={{ width: '100%', accentColor: getRatingColor(stress, 'stress') }}
            />
          </div>
        </div>

        {/* Tags */}
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label" htmlFor="journal-tags">Tags (comma separated)</label>
          <input
            type="text"
            id="journal-tags"
            className="form-input"
            placeholder="e.g. revision, mock test, anxiety"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
          />
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <button
          type="button"
          className="btn btn-secondary"
          style={{ flex: 1 }}
          onClick={onCancel}
        >
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" style={{ flex: 2 }}>
          Save Reflection
        </button>
      </div>
    </form>
  );
};

export default JournalWriteForm;
