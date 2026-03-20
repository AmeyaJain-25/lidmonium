import { useState, useEffect, useRef } from 'react';

/**
 * Bellows pressure with inertia: pressure is a smoothed value that approaches
 * a target. Target comes from lid velocity (pumping); when idle, air leak decays target.
 *
 * - Target pressure = f(lid velocity) × pump strength (capped 0–1).
 * - Pressure does not jump to target; it approaches it with inertia (smoothing).
 * - When idle (no lid movement for a while), air leak decay drives target toward 0,
 *   so pressure slowly fades.
 *
 * Expected behavior (to check if it's "right"):
 * - Fast lid open/close → pressure rises toward high (e.g. 70–100%).
 * - Slow lid move → pressure stays mid (e.g. 20–50%).
 * - Tiny or no move → pressure drifts down (air leak).
 * - Stop moving for ~2s → pressure falls toward 0.
 * - Pressure never jumps; it eases up and down (inertia).
 */

const TICK_MS = 16;

/** Velocity (deg/s) at which raw target would be 1 before pump strength. */
const VELOCITY_FULL_DEG_PER_SEC = 45;
/** Multiplier on target from pumping – same lid speed gives higher target when > 1. */
const PUMP_STRENGTH = 1.0;
/** Bellows inertia: how much pressure retains previous value each tick (0–1). Higher = slower response. */
const INERTIA = 0.94;
/** After this many ms with no angle update, treat as idle and apply air leak. */
const IDLE_MS = 1800;
/** Air leak: when idle, target decays by this factor per tick (target *= this). */
const AIR_LEAK_DECAY = 0.92;

export function useBellowsPressure(lidAngle: number | null): number {
  const [pressure, setPressure] = useState(0);
  const pressureRef = useRef(0);
  const targetRef = useRef(0);
  const lastAngleRef = useRef<number | null>(null);
  const lastAngleTimeRef = useRef(0);

  // On lid angle update: compute velocity → target pressure (with pump strength).
  useEffect(() => {
    if (lidAngle === null) {
      lastAngleRef.current = null;
      pressureRef.current = 0;
      targetRef.current = 0;
      setPressure(0);
      return;
    }

    const now = performance.now();
    const prevAngle = lastAngleRef.current;
    const prevTime = lastAngleTimeRef.current;

    lastAngleRef.current = lidAngle;
    lastAngleTimeRef.current = now;

    if (prevAngle === null) {
      targetRef.current = 0;
      return;
    }

    const dtSec = (now - prevTime) / 1000;
    if (dtSec < 0.01) return;

    const deltaDeg = Math.abs(lidAngle - prevAngle);
    const velocityDegPerSec = deltaDeg / dtSec;
    const rawTarget = Math.min(1, velocityDegPerSec / VELOCITY_FULL_DEG_PER_SEC);
    const target = Math.min(1, rawTarget * PUMP_STRENGTH);
    targetRef.current = target;
  }, [lidAngle]);

  // Every tick: pressure approaches target (inertia); when idle, air leak decays target.
  const isLidConnected = lidAngle !== null;
  useEffect(() => {
    if (!isLidConnected) return;

    const id = setInterval(() => {
      const now = performance.now();
      const timeSinceUpdate = now - lastAngleTimeRef.current;
      const isIdle = timeSinceUpdate > IDLE_MS;

      if (isIdle) {
        targetRef.current *= AIR_LEAK_DECAY;
        targetRef.current = Math.max(0, targetRef.current);
      }

      const target = targetRef.current;
      const p = Math.max(0, Math.min(1, pressureRef.current * INERTIA + target * (1 - INERTIA)));
      pressureRef.current = p;
      setPressure(p);
    }, TICK_MS);

    return () => clearInterval(id);
  }, [isLidConnected]);

  return pressure;
}
