import { useState, useEffect, useRef } from 'react';

export interface BreathState {
  phaseText: string;
  scale: number;
  countdown: number;
}

export function useBoxBreathing() {
  const [breathActive, setBreathActive] = useState<boolean>(false);
  const [breathTick, setBreathTick] = useState<number>(0);
  const breathInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (breathActive) {
      breathInterval.current = setInterval(() => {
        setBreathTick((prev) => (prev + 1) % 160);
      }, 100); // 10 ticks per second
    } else {
      if (breathInterval.current) {
        clearInterval(breathInterval.current);
        breathInterval.current = null;
      }
      setBreathTick(0);
    }

    return () => {
      if (breathInterval.current) {
        clearInterval(breathInterval.current);
        breathInterval.current = null;
      }
    };
  }, [breathActive]);

  const getBreathData = (): BreathState => {
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

  const breathData = getBreathData();

  return {
    breathActive,
    breathTick,
    setBreathActive,
    ...breathData,
  };
}

export default useBoxBreathing;
