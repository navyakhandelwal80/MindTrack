import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Sparkles, Wind, Clock } from 'lucide-react';

// Web Audio API Synthesizer Chime
const playChimeSound = (isMuted: boolean) => {
  if (isMuted) return;
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    
    // Create oscillator and gain node
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    // Gentle crystal chime chime settings
    osc.type = 'sine';
    osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5
    
    gain.gain.setValueAtTime(0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.8);
  } catch (err) {
    console.warn("Audio chime failed to synthesize:", err);
  }
};

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

export const Exercises: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'breathing' | 'pomodoro'>('breathing');
  
  // 1. Box Breathing State (4s Inhale, 4s Hold, 4s Exhale, 4s Hold)
  const [breathActive, setBreathActive] = useState<boolean>(false);
  const [breathTick, setBreathTick] = useState<number>(0); // 0 to 159 (160 ticks = 16 seconds cycle)
  const breathInterval = useRef<any>(null);

  // 2. Pomodoro State
  const [pomoActive, setPomoActive] = useState<boolean>(false);
  const [pomoMode, setPomoMode] = useState<'study' | 'break'>('study');
  const [pomoDuration, setPomoDuration] = useState<number>(25 * 60); // 25 mins study default
  const [pomoSecondsLeft, setPomoSecondsLeft] = useState<number>(25 * 60);
  const [pomoMute, setPomoMute] = useState<boolean>(false);
  const pomoInterval = useRef<any>(null);

  // 3. Affirmation State
  const [affirmation, setAffirmation] = useState<string>('');

  useEffect(() => {
    // Pick initial affirmation
    setAffirmation(POSITIVE_AFFIRMATIONS[Math.floor(Math.random() * POSITIVE_AFFIRMATIONS.length)]);
  }, []);

  const rotateAffirmation = () => {
    let nextIdx;
    do {
      nextIdx = Math.floor(Math.random() * POSITIVE_AFFIRMATIONS.length);
    } while (POSITIVE_AFFIRMATIONS[nextIdx] === affirmation);
    setAffirmation(POSITIVE_AFFIRMATIONS[nextIdx]);
  };

  // --- Box Breathing Cycle Logic ---
  useEffect(() => {
    if (breathActive) {
      breathInterval.current = setInterval(() => {
        setBreathTick((prev) => (prev + 1) % 160);
      }, 100); // 10 ticks per second
    } else {
      if (breathInterval.current) clearInterval(breathInterval.current);
      setBreathTick(0);
    }

    return () => {
      if (breathInterval.current) clearInterval(breathInterval.current);
    };
  }, [breathActive]);

  // Translate breath ticks to phases & dimensions
  // Period = 160 ticks
  // 0 - 39 (40 ticks): Inhale. Scale 0.8 -> 1.35
  // 40 - 79 (40 ticks): Hold. Scale 1.35
  // 80 - 119 (40 ticks): Exhale. Scale 1.35 -> 0.8
  // 120 - 159 (40 ticks): Hold. Scale 0.8
  const getBreathData = () => {
    const tick = breathTick;
    let phaseText = 'Inhale';
    let scale = 0.8;
    let countdown = 4;

    if (tick < 40) {
      phaseText = 'Breathe In';
      scale = 0.8 + (tick / 40) * 0.55;
      countdown = 4 - Math.floor(tick / 10);
    } else if (tick < 80) {
      phaseText = 'Hold Breath';
      scale = 1.35;
      countdown = 4 - Math.floor((tick - 40) / 10);
    } else if (tick < 120) {
      phaseText = 'Breathe Out';
      scale = 1.35 - ((tick - 80) / 40) * 0.55;
      countdown = 4 - Math.floor((tick - 80) / 10);
    } else {
      phaseText = 'Hold Empty';
      scale = 0.8;
      countdown = 4 - Math.floor((tick - 120) / 10);
    }

    return { phaseText, scale, countdown };
  };

  const { phaseText, scale, countdown } = getBreathData();

  // --- Pomodoro Logic ---
  useEffect(() => {
    if (pomoActive) {
      pomoInterval.current = setInterval(() => {
        setPomoSecondsLeft((prev) => {
          if (prev <= 1) {
            // Timer finished
            playChimeSound(pomoMute);
            const nextMode = pomoMode === 'study' ? 'break' : 'study';
            const nextDuration = nextMode === 'study' ? 25 * 60 : 5 * 60;
            setPomoMode(nextMode);
            setPomoDuration(nextDuration);
            setPomoActive(false); // Pause on switch so they can prepare
            return nextDuration;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (pomoInterval.current) clearInterval(pomoInterval.current);
    }

    return () => {
      if (pomoInterval.current) clearInterval(pomoInterval.current);
    };
  }, [pomoActive, pomoMode, pomoMute]);

  const handlePomoReset = () => {
    setPomoActive(false);
    const duration = pomoMode === 'study' ? 25 * 60 : 5 * 60;
    setPomoDuration(duration);
    setPomoSecondsLeft(duration);
  };

  const togglePomoMode = (mode: 'study' | 'break') => {
    setPomoActive(false);
    setPomoMode(mode);
    const duration = mode === 'study' ? 25 * 60 : 5 * 60;
    setPomoDuration(duration);
    setPomoSecondsLeft(duration);
  };

  const formatPomoTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // SVGs for circular progress
  // Radius R = 80, Circumference = 2 * PI * 80 ≈ 502.65
  const progressRatio = pomoSecondsLeft / pomoDuration;
  const strokeDashoffset = 502.65 * (1 - progressRatio);

  return (
    <div className="animated-fade-in">
      {/* Top Toggle Switcher between Breathing and Pomodoro */}
      <div className="tab-headers">
        <button
          className={`sub-tab-btn ${activeTab === 'breathing' ? 'active' : ''}`}
          onClick={() => setActiveTab('breathing')}
        >
          <Wind size={16} style={{ verticalAlign: 'middle', marginRight: '0.35rem' }} />
          Box Breathing
        </button>
        <button
          className={`sub-tab-btn ${activeTab === 'pomodoro' ? 'active' : ''}`}
          onClick={() => setActiveTab('pomodoro')}
        >
          <Clock size={16} style={{ verticalAlign: 'middle', marginRight: '0.35rem' }} />
          Study Pomodoro
        </button>
      </div>

      {activeTab === 'breathing' ? (
        /* Box Breathing View */
        <div className="animated-slide-up">
          <div className="glass-card text-center breathing-exercise-container">
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Anxiety Release Breathing</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', maxWidth: '300px', margin: '0 auto 2rem auto', lineHeight: '1.4' }}>
              Used by professional athletes and high-stress performers. Equal times inhaling, holding, exhaling, and holding empty.
            </p>

            {/* Pulsing Breathing Ring */}
            <div className="breathing-ring-outer">
              <div 
                className="breathing-bubble"
                style={{
                  transform: `scale(${scale})`,
                  transition: 'transform 0.1s linear',
                  background: breathActive ? undefined : 'rgba(99, 102, 241, 0.2)'
                }}
              >
                <span style={{ fontSize: '1rem', fontWeight: 800 }}>
                  {breathActive ? phaseText : 'Ready'}
                </span>
                {breathActive && (
                  <span style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '0.25rem' }}>
                    {countdown}
                  </span>
                )}
              </div>
            </div>

            {/* Start/Stop Button */}
            <button
              className="btn btn-primary"
              style={{ padding: '0.8rem 2rem', minWidth: '150px' }}
              onClick={() => setBreathActive(!breathActive)}
            >
              {breathActive ? 'Pause Exercise' : 'Start Exercise'}
            </button>
          </div>
        </div>
      ) : (
        /* Pomodoro Timer View */
        <div className="animated-slide-up">
          <div className="glass-card text-center pomodoro-container">
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Pomodoro Wellness Timer</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', maxWidth: '300px', margin: '0 auto 1.5rem auto', lineHeight: '1.4' }}>
              Study intensely for 25 minutes, then take a guilt-free 5-minute wellness break to stretch and drink water.
            </p>

            {/* Mode Toggle Buttons */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <button
                className={`btn ${pomoMode === 'study' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '0.4rem 1rem', fontSize: '0.8rem' }}
                onClick={() => togglePomoMode('study')}
              >
                Study Session (25m)
              </button>
              <button
                className={`btn ${pomoMode === 'break' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '0.4rem 1rem', fontSize: '0.8rem' }}
                onClick={() => togglePomoMode('break')}
              >
                Wellness Break (5m)
              </button>
            </div>

            {/* Circular Timer Display */}
            <div className="pomodoro-timer-circle">
              {/* SVG circular progress ring */}
              <svg className="timer-progress-svg" width="192" height="192">
                <circle
                  cx="96"
                  cy="96"
                  r="80"
                  fill="none"
                  stroke={pomoMode === 'study' ? 'var(--primary-light)' : 'rgba(16, 185, 129, 0.15)'}
                  strokeWidth="8"
                />
                <circle
                  cx="96"
                  cy="96"
                  r="80"
                  fill="none"
                  stroke={pomoMode === 'study' ? 'var(--primary)' : 'var(--success)'}
                  strokeWidth="8"
                  strokeDasharray="502.65"
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  style={{ transition: 'stroke-dashoffset 1s linear' }}
                />
              </svg>

              <div className="pomodoro-countdown">
                {formatPomoTime(pomoSecondsLeft)}
              </div>
              <div className="pomodoro-lbl">
                {pomoMode === 'study' ? 'Study' : 'Break'}
              </div>
            </div>

            {/* Timer Controls */}
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', justifyContent: 'center' }}>
              {/* Mute toggle */}
              <button
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                onClick={() => setPomoMute(!pomoMute)}
                title={pomoMute ? 'Unmute alarms' : 'Mute alarms'}
              >
                {pomoMute ? <VolumeX size={20} /> : <Volume2 size={20} />}
              </button>

              <button
                className="btn btn-primary"
                style={{ width: '48px', height: '48px', borderRadius: '50%', padding: 0 }}
                onClick={() => setPomoActive(!pomoActive)}
                title={pomoActive ? 'Pause' : 'Start'}
              >
                {pomoActive ? <Pause size={20} /> : <Play size={20} style={{ marginLeft: '3px' }} />}
              </button>

              <button
                className="btn btn-secondary"
                style={{ width: '48px', height: '48px', borderRadius: '50%', padding: 0 }}
                onClick={handlePomoReset}
                title="Reset timer"
              >
                <RotateCcw size={18} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Positive Affirmations Banner Card */}
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
    </div>
  );
};

export default Exercises;
