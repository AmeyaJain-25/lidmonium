import { useState, useEffect, useRef } from 'react';

const TICK_MS = 16;
const AUTO_PRESSURE = 0.7;
const SMOOTHING_FACTOR = 0.1;

/**
 * Smoothed pressure for Auto Bellows mode.
 * When hasActiveKeys: target = AUTO_PRESSURE, else target = 0.
 * Pressure approaches target: pressure += (target - pressure) * SMOOTHING_FACTOR
 */
export function useAutoPressure(hasActiveKeys: boolean): number {
  const [pressure, setPressure] = useState(0);
  const pressureRef = useRef(0);

  useEffect(() => {
    const id = setInterval(() => {
      const target = hasActiveKeys ? AUTO_PRESSURE : 0;
      const p = pressureRef.current + (target - pressureRef.current) * SMOOTHING_FACTOR;
      pressureRef.current = Math.max(0, Math.min(1, p));
      setPressure(pressureRef.current);
    }, TICK_MS);

    return () => clearInterval(id);
  }, [hasActiveKeys]);

  return pressure;
}
