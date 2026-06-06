import React, { useState } from 'react';
import { Search, Trash2, Tag, Calendar, BookOpen, Heart, Award } from 'lucide-react';
import type { JournalEntry } from '../types';
import { formatDateString } from '../utils/storage';

interface JournalProps {
  entries: JournalEntry[];
  onSaveEntry: (entry: JournalEntry) => void;
  onDeleteEntry: (id: string) => void;
}

const REFLECTION_PROMPTS = [
  "Challenge a self-doubt: Write down a self-limiting belief you had today, and argue against it like a lawyer.",
  "What is one tough concept or problem you solved today? Explain it simply.",
  "List three things you are grateful for today that have absolutely nothing to do with exams.",
  "Describe a moment of pressure today. What parts can you control, and what parts are outside your control?",
  "If your friend was feeling this level of exam stress, what comforting advice would you give them?",
  "Describe how your body feels right now. Where are you holding tension, and can you release it?"
];

export const Journal: React.FC<JournalProps> = ({ entries, onSaveEntry, onDeleteEntry }) => {
  const [isWriting, setIsWriting] = useState<boolean>(false);
  const [title, setTitle] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const [gratitude, setGratitude] = useState<string>('');
  const [achievement, setAchievement] = useState<string>('');
  const [mood, setMood] = useState<number>(6); // Default to Neutral/Good
  const [stress, setStress] = useState<number>(5); // Default to Medium
  const [selectedPrompt, setSelectedPrompt] = useState<string>('');
  const [tagInput, setTagInput] = useState<string>('');
  
  // Search & Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterMood, setFilterMood] = useState<string>('all');

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

    // Process tags
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

    onSaveEntry(newEntry);
    
    // Reset form
    setTitle('');
    setContent('');
    setGratitude('');
    setAchievement('');
    setMood(6);
    setStress(5);
    setSelectedPrompt('');
    setTagInput('');
    setIsWriting(false);
  };

  // Filter entries
  const filteredEntries = entries.filter((e) => {
    const matchesSearch =
      e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (e.gratitude && e.gratitude.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (e.achievement && e.achievement.toLowerCase().includes(searchQuery.toLowerCase())) ||
      e.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesMood = filterMood === 'all' || 
      (filterMood === 'high' && e.mood >= 8) ||
      (filterMood === 'mid' && e.mood >= 5 && e.mood <= 7) ||
      (filterMood === 'low' && e.mood <= 4);

    return matchesSearch && matchesMood;
  });

  const getMoodEmoji = (score: number) => {
    if (score <= 2) return '😫';
    if (score <= 4) return '😔';
    if (score <= 6) return '😐';
    if (score <= 8) return '😊';
    return '😇';
  };

  const getRatingColor = (level: number, type: 'mood' | 'stress') => {
    if (type === 'stress') {
      if (level <= 3) return 'var(--success)';
      if (level <= 7) return 'var(--warning)';
      return 'var(--danger)';
    } else {
      if (level <= 4) return 'var(--danger)';
      if (level <= 7) return 'var(--warning)';
      return 'var(--success)';
    }
  };

  return (
    <div className="animated-fade-in">
      {/* View/Write Toggle */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <h2 style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <BookOpen size={20} style={{ color: 'var(--primary)' }} aria-hidden="true" /> Reflection Journal
        </h2>
        <button
          className="btn btn-primary"
          style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
          onClick={() => setIsWriting(!isWriting)}
          aria-expanded={isWriting}
        >
          {isWriting ? 'View History' : 'Write Reflection'}
        </button>
      </div>

      {isWriting ? (
        /* Write Entry Panel */
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
                  <span aria-hidden="true">{getMoodEmoji(mood)}</span>
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
              onClick={() => setIsWriting(false)}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" style={{ flex: 2 }}>
              Save Reflection
            </button>
          </div>
        </form>
      ) : (
        /* Journal Timeline History */
        <div className="animated-slide-up">
          {/* Search bar */}
          <div className="glass-card" style={{ display: 'flex', gap: '0.75rem', flexDirection: 'column' }}>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Search size={18} style={{ position: 'absolute', left: '12px', color: 'var(--text-muted)' }} aria-hidden="true" />
              <label htmlFor="journal-search" className="sr-only">Search reflections or tags</label>
              <input
                type="text"
                id="journal-search"
                className="form-input"
                style={{ paddingLeft: '2.5rem' }}
                placeholder="Search reflections, gratitude, wins or tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <label htmlFor="journal-filter-mood" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Filter Mood:</label>
              <select
                id="journal-filter-mood"
                className="form-select"
                style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem', width: 'auto' }}
                value={filterMood}
                onChange={(e) => setFilterMood(e.target.value)}
              >
                <option value="all">All Moods</option>
                <option value="high">😇 High (8-10)</option>
                <option value="mid">😐 Moderate (5-7)</option>
                <option value="low">😫 Low (1-4)</option>
              </select>
            </div>
          </div>

          {/* Timeline list */}
          {filteredEntries.length === 0 ? (
            <div className="glass-card text-center" style={{ padding: '3rem 1.5rem', color: 'var(--text-muted)' }}>
              <BookOpen size={48} style={{ color: 'var(--border-color)', marginBottom: '1rem' }} aria-hidden="true" />
              <p>No matching journal reflections.</p>
              <p style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>
                {entries.length === 0 ? "Click 'Write Reflection' above to start journaling!" : "Try a different search query."}
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }} role="feed" aria-label="Journal entry list">
              {filteredEntries.map((entry) => (
                <article key={entry.id} className="glass-card animated-slide-up" style={{ marginBottom: 0 }} aria-labelledby={`entry-title-${entry.id}`}>
                  <div className="journal-item-header">
                    <div>
                      <h3 id={`entry-title-${entry.id}`} style={{ fontSize: '1.05rem', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                        {entry.title}
                      </h3>
                      <div className="journal-meta">
                        <Calendar size={12} aria-hidden="true" />
                        <span className="sr-only">Date logged:</span>
                        <span>{entry.date}</span>
                        <span style={{ margin: '0 0.25rem' }}>•</span>
                        <span style={{ color: getRatingColor(entry.mood, 'mood'), fontWeight: 600 }}>
                          Mood: {getMoodEmoji(entry.mood)} ({entry.mood}/10)
                        </span>
                        <span style={{ margin: '0 0.25rem' }}>•</span>
                        <span style={{ color: getRatingColor(entry.stress, 'stress'), fontWeight: 600 }}>
                          Stress: {entry.stress}/10
                        </span>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => {
                        if (confirm('Delete this reflection?')) {
                          onDeleteEntry(entry.id);
                        }
                      }}
                      style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                      aria-label={`Delete entry: ${entry.title}`}
                    >
                      <Trash2 size={16} aria-hidden="true" />
                    </button>
                  </div>

                  <div className="journal-content" style={{ marginTop: '0.5rem' }}>{entry.content}</div>

                  {/* Gratitude & wins layout */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.75rem', margin: '0.75rem 0' }}>
                    {entry.gratitude && (
                      <div style={{ background: 'rgba(236, 72, 153, 0.05)', borderLeft: '3px solid var(--secondary)', padding: '0.6rem 0.75rem', borderRadius: '4px', fontSize: '0.82rem' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: 700, color: 'var(--secondary)', marginBottom: '0.2rem' }}>
                          <Heart size={12} fill="currentColor" aria-hidden="true" /> Daily Gratitude
                        </span>
                        <div style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>"{entry.gratitude}"</div>
                      </div>
                    )}

                    {entry.achievement && (
                      <div style={{ background: 'rgba(245, 158, 11, 0.05)', borderLeft: '3px solid var(--warning)', padding: '0.6rem 0.75rem', borderRadius: '4px', fontSize: '0.82rem' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: 700, color: 'var(--warning)', marginBottom: '0.2rem' }}>
                          <Award size={12} aria-hidden="true" /> Today's Win
                        </span>
                        <div style={{ color: 'var(--text-secondary)' }}>{entry.achievement}</div>
                      </div>
                    )}
                  </div>

                  <div className="journal-tags">
                    {entry.tags.map((tag) => (
                      <span key={tag} className="badge badge-primary" style={{ fontSize: '0.7rem' }}>
                        <Tag size={10} aria-hidden="true" /> {tag}
                      </span>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Journal;
