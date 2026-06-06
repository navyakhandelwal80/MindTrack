import React from 'react';
import { RefreshCw } from 'lucide-react';
import type { DailyQuote } from '../types';

interface QuoteCardProps {
  quote: DailyQuote;
  onRefresh: () => void;
}

export const QuoteCard: React.FC<QuoteCardProps> = ({ quote, onRefresh }) => {
  return (
    <div className="glass-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
        <h3 style={{ fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ color: 'var(--warning)' }} aria-hidden="true">★</span> Daily Motivation
        </h3>
        <button 
          onClick={onRefresh}
          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
          aria-label="Refresh motivational quote"
        >
          <RefreshCw size={14} aria-hidden="true" />
        </button>
      </div>
      <div className="quote-box" tabIndex={0}>
        "{quote.text}"
      </div>
      <div className="quote-author">— {quote.author}</div>
    </div>
  );
};

export default QuoteCard;
