import { useState, useRef, useCallback, useEffect } from 'react';
import { NOTE_TO_KEY, getKeyForNote } from '../constants/keyMap';
import type { PresetSong } from '../data/presetSongs';
import { resolvePresetEvents } from '../utils/sargam';

const NOTE_REGEX = /^([A-G]#?)(\d+)$/;

/** Get key for visual feedback. NOTE_TO_KEY for C4–C5; getKeyForNote for C3, C6. */
function getKeyForPresetNote(note: string): string | null {
  const fromMap = NOTE_TO_KEY[note];
  if (fromMap) return fromMap;
  const match = note.match(NOTE_REGEX);
  if (!match) return null;
  const octave = parseInt(match[2], 10);
  const offset = octave <= 4 ? octave - 4 : 1;
  return getKeyForNote(note, offset) ?? null;
}

/** Octave offset for display: -1=C3–C4, 0=C4–C5, 1=C5–C6. Picks offset so key labels match the lowest note. */
function getDisplayOffsetForNotes(notes: Set<string>): number {
  if (notes.size === 0) return 0;
  let minOctave = 6;
  for (const n of Array.from(notes)) {
    const m = n.match(NOTE_REGEX);
    if (m) minOctave = Math.min(minOctave, parseInt(m[2], 10));
  }
  if (minOctave <= 3) return -1;
  if (minOctave <= 5) return 0;
  return 1;
}

type Props = {
  song: PresetSong | null;
  onNoteOn: (note: string) => void;
  onNoteOff: (note: string) => void;
};

/** Returns progress 0..1, isPlaying, hasEnded, controls, and keys to show as pressed from preset. */
export function usePresetPlayer({ song, onNoteOn, onNoteOff }: Props) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [hasEnded, setHasEnded] = useState(false);
  const [presetActiveKeys, setPresetActiveKeys] = useState<Set<string>>(new Set());
  const [presetActiveNotes, setPresetActiveNotes] = useState<Set<string>>(new Set());
  const [displayOctaveOffset, setDisplayOctaveOffset] = useState<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const rafRef = useRef<number>(0);
  const prevNotesRef = useRef<Set<string>>(new Set());
  const songIdRef = useRef<string | null>(null);
  const progressRef = useRef(0);
  const songRef = useRef(song);
  const justChangedSongRef = useRef(false);
  const onNoteOnRef = useRef(onNoteOn);
  const onNoteOffRef = useRef(onNoteOff);
  const pauseRef = useRef(() => {});

  onNoteOnRef.current = onNoteOn;
  onNoteOffRef.current = onNoteOff;
  songRef.current = song;

  const pause = useCallback(() => {
    setIsPlaying(false);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = 0;
    // Snap progress to exact elapsed at pause moment
    const s = songRef.current;
    if (s) {
      const elapsed = performance.now() - startTimeRef.current;
      const clamped = Math.min(Math.max(0, elapsed), s.durationMs);
      const frac = clamped / s.durationMs;
      progressRef.current = frac;
      setProgress(frac);
    }
    prevNotesRef.current.forEach((note) => onNoteOffRef.current(note));
    prevNotesRef.current.clear();
    setPresetActiveKeys(new Set());
    setPresetActiveNotes(new Set());
    setDisplayOctaveOffset(null);
  }, []);

  pauseRef.current = pause;

  const play = useCallback(() => {
    if (!song) return;
    // Resume from current progress (or 0 if reset)
    const elapsed = progressRef.current * song.durationMs;
    startTimeRef.current = performance.now() - elapsed;
    setIsPlaying(true);
  }, [song]);

  const seek = useCallback(
    (frac: number) => {
      if (!song) return;
      const clamped = Math.max(0, Math.min(1, frac));
      const elapsed = clamped * song.durationMs;
      startTimeRef.current = performance.now() - elapsed;
      progressRef.current = clamped;
      setProgress(clamped);
      setHasEnded(clamped >= 1);
    },
    [song]
  );

  const reset = useCallback(() => {
    pause();
    progressRef.current = 0;
    setProgress(0);
    setHasEnded(false);
    startTimeRef.current = 0;
  }, [pause]);

  // When song changes: stop playback and reset progress
  useEffect(() => {
    const id = song?.id ?? null;
    if (songIdRef.current !== id) {
      songIdRef.current = id;
      justChangedSongRef.current = true;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
      setIsPlaying(false);
      setHasEnded(false);
      prevNotesRef.current.forEach((note) => onNoteOffRef.current(note));
      prevNotesRef.current.clear();
      setPresetActiveKeys(new Set());
      setPresetActiveNotes(new Set());
      setDisplayOctaveOffset(null);
      progressRef.current = 0;
      setProgress(0);
      startTimeRef.current = performance.now();
    }
  }, [song?.id]);

  // RAF loop: only depends on isPlaying and song so it doesn't restart when callbacks change
  useEffect(() => {
    if (justChangedSongRef.current) {
      justChangedSongRef.current = false;
      return;
    }
    if (!isPlaying || !song) return;

    const durationMs = song.durationMs;
    const events = resolvePresetEvents(song);

    const tick = () => {
      const elapsed = performance.now() - startTimeRef.current;
      const clamped = Math.min(elapsed, durationMs);
      const frac = clamped / durationMs;
      progressRef.current = frac;
      setProgress(frac);

      const currentNotes = new Set<string>();
      for (const ev of events) {
        if (clamped >= ev.timeMs && clamped < ev.timeMs + ev.durationMs) {
          currentNotes.add(ev.note);
        }
      }

      prevNotesRef.current.forEach((note) => {
        if (!currentNotes.has(note)) onNoteOffRef.current(note);
      });
      currentNotes.forEach((note) => {
        if (!prevNotesRef.current.has(note)) onNoteOnRef.current(note);
      });
      prevNotesRef.current = currentNotes;

      const keys = new Set<string>();
      currentNotes.forEach((n) => {
        const k = getKeyForPresetNote(n);
        if (k) keys.add(k);
      });
      setPresetActiveKeys(keys);
      setPresetActiveNotes(currentNotes);
      if (currentNotes.size > 0) {
        setDisplayOctaveOffset(getDisplayOffsetForNotes(currentNotes));
      }

      if (elapsed >= durationMs) {
        progressRef.current = 1;
        setProgress(1);
        pauseRef.current();
        setHasEnded(true);
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isPlaying, song]);

  return {
    progress,
    setProgress: seek,
    isPlaying,
    hasEnded,
    play,
    pause,
    reset,
    presetActiveKeys,
    presetActiveNotes,
    /** When preset is playing, the octave offset for keyboard display so labels match notes. Null when not playing. */
    displayOctaveOffset,
  };
}
