import React, { useState } from 'react';
import { Search, BookOpen } from 'lucide-react';
import type { JournalEntry } from '../types';
import JournalCard from './JournalCard';

interface JournalHistoryProps {
  entries: JournalEntry[];
  onDeleteEntry: (id: string) => void;
}

export const JournalHistory: React.FC<JournalHistoryProps> = ({ entries, onDeleteEntry }) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterMood, setFilterMood] = useState<string>('all');

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

  return (
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
            <JournalCard
              key={entry.id}
              entry={entry}
              onDelete={onDeleteEntry}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default JournalHistory;
