import React, { useState } from 'react';
import { BookOpen } from 'lucide-react';
import type { JournalEntry } from '../types';

// Sub-components
import JournalWriteForm from './JournalWriteForm';
import JournalHistory from './JournalHistory';

interface JournalProps {
  entries: JournalEntry[];
  onSaveEntry: (entry: JournalEntry) => void;
  onDeleteEntry: (id: string) => void;
}

export const Journal: React.FC<JournalProps> = ({ entries, onSaveEntry, onDeleteEntry }) => {
  const [isWriting, setIsWriting] = useState<boolean>(false);

  const handleSave = (newEntry: JournalEntry) => {
    onSaveEntry(newEntry);
    setIsWriting(false);
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
        <JournalWriteForm
          onSave={handleSave}
          onCancel={() => setIsWriting(false)}
        />
      ) : (
        <JournalHistory
          entries={entries}
          onDeleteEntry={onDeleteEntry}
        />
      )}
    </div>
  );
};

export default Journal;
