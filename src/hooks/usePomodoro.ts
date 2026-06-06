import { useState, useEffect, useRef } from 'react';

/**
 * Synthesizes a gentle crystal chime sound using native browser Web Audio API.
 * @param isMuted - Audio mute status flag
 */
export const playChimeSound = (isMuted: boolean): void => {
  if (isMuted) return;
  try {
    const AudioCtx = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
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

export function usePomodoro() {
  const [pomoActive, setPomoActive] = useState<boolean>(false);
  const [pomoMode, setPomoMode] = useState<'study' | 'break'>('study');
  const [pomoDuration, setPomoDuration] = useState<number>(25 * 60); // 25 mins study default
  const [pomoSecondsLeft, setPomoSecondsLeft] = useState<number>(25 * 60);
  const [pomoMute, setPomoMute] = useState<boolean>(false);
  const pomoInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (pomoActive) {
      pomoInterval.current = setInterval(() => {
        setPomoSecondsLeft((prev) => {
          if (prev <= 1) {
            playChimeSound(pomoMute);
            const nextMode = pomoMode === 'study' ? 'break' : 'study';
            const nextDuration = nextMode === 'study' ? 25 * 60 : 5 * 60;
            setPomoMode(nextMode);
            setPomoDuration(nextDuration);
            setPomoActive(false); // Pause on switch so user can prepare
            return nextDuration;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (pomoInterval.current) {
        clearInterval(pomoInterval.current);
        pomoInterval.current = null;
      }
    }

    return () => {
      if (pomoInterval.current) {
        clearInterval(pomoInterval.current);
        pomoInterval.current = null;
      }
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

  const formatPomoTime = (totalSeconds: number): string => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const progressRatio = pomoSecondsLeft / pomoDuration;
  const strokeDashoffset = 502.65 * (1 - progressRatio);

  return {
    pomoActive,
    pomoMode,
    pomoDuration,
    pomoSecondsLeft,
    pomoMute,
    progressRatio,
    strokeDashoffset,
    setPomoActive,
    setPomoMute,
    handlePomoReset,
    togglePomoMode,
    formatPomoTime,
  };
}

export default usePomodoro;
