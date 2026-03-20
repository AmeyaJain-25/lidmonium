import { useRef, useEffect, useImperativeHandle, forwardRef, useCallback } from 'react';
import * as Tone from 'tone';
import { DRONE_SA, DRONE_PA, DRONE_MA } from '../constants/keyMap';

export type AudioEngineHandle = {
  triggerAttack: (note: string) => void;
  triggerRelease: (note: string) => void;
  /** Call after user gesture so AudioContext can start. */
  resume: () => Promise<void>;
};

export type DroneState = {
  sa: boolean;
  pa: boolean;
  ma: boolean;
};

type Props = {
  pressure: number;
  drone: DroneState;
  couplerOn: boolean;
};

// Bellows pressure → volume (like airflow through reeds). No pressure = silent.
function pressureToGain(pressure: number): number {
  if (pressure <= 0) return 0;
  return Math.pow(pressure, 1.2);
}

// Min gain for drone path so drones are audible when pressure is 0; melody still needs pressure.
const DRONE_PATH_GAIN_FLOOR = 0.5;

const NOTE_REGEX = /^([A-G]#?)(\d+)$/;

function noteUpOctave(note: string): string {
  const m = note.match(NOTE_REGEX);
  if (!m) return note;
  const [, pitch, octaveStr] = m;
  const octave = parseInt(octaveStr, 10) + 1;
  return `${pitch}${Math.min(6, octave)}`;
}

export const AudioEngine = forwardRef<AudioEngineHandle, Props>(function AudioEngine(
  { pressure, drone, couplerOn },
  ref
) {
  const gainRef = useRef<Tone.Gain | null>(null);
  const droneGainRef = useRef<Tone.Gain | null>(null);
  const dronePathGainRef = useRef<Tone.Gain | null>(null);
  const synthRef = useRef<Tone.PolySynth | null>(null);
  const droneSynthsRef = useRef<Map<string, Tone.Synth>>(new Map());
  const isStartedRef = useRef(false);
  const pressureRef = useRef(pressure);
  const couplerOnRef = useRef(couplerOn);
  pressureRef.current = pressure;
  couplerOnRef.current = couplerOn;

  const startAudio = useCallback(async () => {
    if (isStartedRef.current) return;
    await Tone.start();
    isStartedRef.current = true;

    const initialGain = pressureToGain(pressureRef.current);
    const gain = new Tone.Gain(initialGain).toDestination();
    gainRef.current = gain;

    const synth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'sine' },
      envelope: { attack: 0.005, decay: 0.08, sustain: 0.85, release: 0.25 },
    }).connect(gain);
    synthRef.current = synth;

    const dronePathGain = new Tone.Gain(
      Math.max(pressureToGain(pressureRef.current), DRONE_PATH_GAIN_FLOOR)
    ).toDestination();
    dronePathGainRef.current = dronePathGain;
    const droneGain = new Tone.Gain(0.28).connect(dronePathGain);
    droneGainRef.current = droneGain;
    [DRONE_SA, DRONE_PA, DRONE_MA].forEach((note) => {
      const s = new Tone.Synth({
        oscillator: { type: 'sine' },
        envelope: { attack: 0.01, decay: 0.1, sustain: 1, release: 0.4 },
      }).connect(droneGain);
      droneSynthsRef.current.set(note, s);
    });
  }, []);

  useImperativeHandle(
    ref,
    () => ({
      async triggerAttack(note: string) {
        await startAudio();
        synthRef.current?.triggerAttack(note);
        if (couplerOnRef.current) {
          const upper = noteUpOctave(note);
          if (upper !== note) synthRef.current?.triggerAttack(upper);
        }
      },
      triggerRelease(note: string) {
        synthRef.current?.triggerRelease(note);
        if (couplerOnRef.current) {
          const upper = noteUpOctave(note);
          if (upper !== note) synthRef.current?.triggerRelease(upper);
        }
      },
      resume: () => Tone.start(),
    }),
    [startAudio]
  );

  useEffect(() => {
    const gain = gainRef.current;
    if (!gain) return;
    const gainValue = pressureToGain(pressure);
    gain.gain.rampTo(gainValue, 0.03);
  }, [pressure]);

  useEffect(() => {
    const dronePathGain = dronePathGainRef.current;
    if (!dronePathGain) return;
    const gainValue = Math.max(pressureToGain(pressure), DRONE_PATH_GAIN_FLOOR);
    dronePathGain.gain.rampTo(gainValue, 0.03);
  }, [pressure]);

  useEffect(() => {
    const drones = droneSynthsRef.current;
    [DRONE_SA, DRONE_PA, DRONE_MA].forEach((note) => {
      drones.get(note)?.triggerRelease();
    });
    if (drone.sa || drone.pa || drone.ma) {
      startAudio().then(() => {
        if (drone.sa) drones.get(DRONE_SA)?.triggerAttack(DRONE_SA);
        if (drone.pa) drones.get(DRONE_PA)?.triggerAttack(DRONE_PA);
        if (drone.ma) drones.get(DRONE_MA)?.triggerAttack(DRONE_MA);
      });
    }
    return () => {
      [DRONE_SA, DRONE_PA, DRONE_MA].forEach((note) => {
        drones.get(note)?.triggerRelease();
      });
    };
  }, [drone.sa, drone.pa, drone.ma, startAudio]);

  return null;
});
