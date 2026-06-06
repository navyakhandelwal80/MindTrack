import React, { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';

const POSITIVE_AFFIRMATIONS = [
  "My worth is not determined by a single test score. I am learning and growing every day.",
  "I can handle this backlog. I will focus on the present topic and master it step-by-step.",
  "I am preparing with integrity. My efforts will yield results in their own time.",
  "Taking a break is an investment in my concentration. My brain needs rest to remember.",
  "Self-doubt is just a thought, not a fact. I have solved hard questions before, and I will again.",
  "I choose progress over perfection. 1% better every day is enough.",
  "Anxiety passes. I am returning to my breath. I am centered, focused, and calm.",
  "Mock exams are just practice diagnostics, not final judgements. I learn from every mistake.",
  "I am doing my best. That is all I can demand of myself."
];

export const AffirmationBanner: React.FC = () => {
  const [affirmation, setAffirmation] = useState<string>('');

  useEffect(() => {
    setAffirmation(POSITIVE_AFFIRMATIONS[Math.floor(Math.random() * POSITIVE_AFFIRMATIONS.length)] ?? '');
  }, []);

  const rotateAffirmation = () => {
    let nextIdx;
    do {
      nextIdx = Math.floor(Math.random() * POSITIVE_AFFIRMATIONS.length);
    } while (POSITIVE_AFFIRMATIONS[nextIdx] === affirmation);
    setAffirmation(POSITIVE_AFFIRMATIONS[nextIdx] ?? '');
  };

  return (
    <div className="glass-card glow" style={{ marginTop: '1.5rem', borderLeft: '4px solid var(--secondary)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
        <h4 style={{ fontSize: '0.9rem', color: 'var(--secondary)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <Sparkles size={14} /> Positive Affirmation
        </h4>
        <button
          onClick={rotateAffirmation}
          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.75rem' }}
        >
          Show Next
        </button>
      </div>
      <p style={{ fontStyle: 'italic', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
        "{affirmation}"
      </p>
    </div>
  );
};

export default AffirmationBanner;
