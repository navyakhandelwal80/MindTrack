import React from 'react';
import { Calendar, Trash2, Heart, Award, Tag } from 'lucide-react';
import type { JournalEntry } from '../types';
import { getMoodEmojiOnly, getRatingColor } from '../utils/presentation';

interface JournalCardProps {
  entry: JournalEntry;
  onDelete: (id: string) => void;
}

export const JournalCard: React.FC<JournalCardProps> = ({ entry, onDelete }) => {
  return (
    <article 
      className="glass-card animated-slide-up" 
      style={{ marginBottom: 0 }} 
      aria-labelledby={`entry-title-${entry.id}`}
    >
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
              Mood: {getMoodEmojiOnly(entry.mood)} ({entry.mood}/10)
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
              onDelete(entry.id);
            }
          }}
          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
          aria-label={`Delete entry: ${entry.title}`}
        >
          <Trash2 size={16} aria-hidden="true" />
        </button>
      </div>

      <div className="journal-content" style={{ marginTop: '0.5rem' }}>
        {entry.content}
      </div>

      {/* Gratitude & wins layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.75rem', margin: '0.75rem 0' }}>
        {entry.gratitude && (
          <div style={{ background: 'rgba(236, 72, 153, 0.05)', borderLeft: '3px solid var(--secondary)', padding: '0.6rem 0.75rem', borderRadius: '4px', fontSize: '0.82rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: 700, color: 'var(--secondary)', marginBottom: '0.2' }}>
              <Heart size={12} fill="currentColor" aria-hidden="true" /> Daily Gratitude
            </span>
            <div style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>
              "{entry.gratitude}"
            </div>
          </div>
        )}

        {entry.achievement && (
          <div style={{ background: 'rgba(245, 158, 11, 0.05)', borderLeft: '3px solid var(--warning)', padding: '0.6rem 0.75rem', borderRadius: '4px', fontSize: '0.82rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: 700, color: 'var(--warning)', marginBottom: '0.2' }}>
              <Award size={12} aria-hidden="true" /> Today's Win
            </span>
            <div style={{ color: 'var(--text-secondary)' }}>
              {entry.achievement}
            </div>
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
  );
};

export default JournalCard;
