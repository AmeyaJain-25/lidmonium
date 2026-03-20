import React, { useEffect, useCallback } from 'react';
import {
  getNoteForKey,
  clampOctaveOffset,
  OCTAVE_DOWN_KEY,
  OCTAVE_UP_KEY,
} from '../constants/keyMap';

type Props = {
  onNoteOn: (note: string) => void;
  onNoteOff: (note: string) => void;
  setActiveKeys: (keys: Set<string>) => void;
  octaveOffset: number;
  setOctaveOffset: (fn: (prev: number) => number) => void;
  canChangeOctave?: boolean;
};

export function KeyboardController({
  onNoteOn,
  onNoteOff,
  setActiveKeys,
  octaveOffset,
  setOctaveOffset,
  canChangeOctave = true,
}: Props) {
  const activeKeysRef = React.useRef<Set<string>>(new Set());
  const keyToNoteRef = React.useRef<Map<string, string>>(new Map());

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key === OCTAVE_DOWN_KEY && !e.repeat) {
        e.preventDefault();
        if (canChangeOctave) setOctaveOffset((prev) => clampOctaveOffset(prev - 1));
        return;
      }
      if (key === OCTAVE_UP_KEY && !e.repeat) {
        e.preventDefault();
        if (canChangeOctave) setOctaveOffset((prev) => clampOctaveOffset(prev + 1));
        return;
      }
      const note = getNoteForKey(key, octaveOffset);
      if (note && !e.repeat) {
        e.preventDefault();
        activeKeysRef.current.add(key);
        keyToNoteRef.current.set(key, note);
        setActiveKeys(new Set(activeKeysRef.current));
        onNoteOn(note);
      }
    },
    [onNoteOn, setActiveKeys, octaveOffset, setOctaveOffset, canChangeOctave]
  );

  const handleKeyUp = useCallback(
    (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key === OCTAVE_DOWN_KEY || key === OCTAVE_UP_KEY) return;
      const note = keyToNoteRef.current.get(key) ?? getNoteForKey(key, octaveOffset);
      if (note) {
        e.preventDefault();
        activeKeysRef.current.delete(key);
        keyToNoteRef.current.delete(key);
        setActiveKeys(new Set(activeKeysRef.current));
        onNoteOff(note);
      }
    },
    [onNoteOff, setActiveKeys, octaveOffset]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  return null;
}
