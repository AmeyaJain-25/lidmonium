// One-octave chromatic QWERTY layout
// White keys: home row (A–K). Black keys: row above (W, E, T, Y, U)

export const KEY_TO_BASE_NOTE: Record<string, string> = {
  // White keys (C4–C5)
  a: 'C4',
  s: 'D4',
  d: 'E4',
  f: 'F4',
  g: 'G4',
  h: 'A4',
  j: 'B4',
  k: 'C5',
  // Black keys
  w: 'C#4',
  e: 'D#4',
  t: 'F#4',
  y: 'G#4',
  u: 'A#4',
};

export const KEYS_WHITE = ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k'] as const;
export const KEYS_BLACK = ['w', 'e', 't', 'y', 'u'] as const;
export const OCTAVE_DOWN_KEY = 'z';
export const OCTAVE_UP_KEY = 'x';

/** Octave offset bounds: base keyboard C4–C5. -1→C3–C4, 0→C4–C5, +1→C5–C6. Full range C3–C6. */
export const OCTAVE_OFFSET_MIN = -1;
export const OCTAVE_OFFSET_MAX = 1;

export function clampOctaveOffset(offset: number): number {
  return Math.max(OCTAVE_OFFSET_MIN, Math.min(OCTAVE_OFFSET_MAX, offset));
}

const NOTE_REGEX = /^([A-G]#?)(\d+)$/;

/** Apply octave offset to a note (e.g. "C4", 1 → "C5"; "C4", -1 → "C3"). Clamped to C3–C6. */
export function applyOctave(note: string, offset: number): string {
  const m = note.match(NOTE_REGEX);
  if (!m) return note;
  const [, pitch, octaveStr] = m;
  const octave = parseInt(octaveStr, 10) + offset;
  return `${pitch}${Math.max(3, Math.min(6, octave))}`;
}

/** Get the note for a key at the given octave offset, or null if not a note key. */
export function getNoteForKey(key: string, octaveOffset: number): string | null {
  const base = KEY_TO_BASE_NOTE[key.toLowerCase()];
  if (!base) return null;
  return applyOctave(base, octaveOffset);
}

/** Whether the key is a note key (white or black). */
export function isNoteKey(key: string): boolean {
  return key.toLowerCase() in KEY_TO_BASE_NOTE;
}

/** Drone notes (Indian classical: Sa=C, Pa=G, Ma=F). Octave 4 for blend with keyboard. */
export const DRONE_SA = 'C4';
export const DRONE_PA = 'G4';
export const DRONE_MA = 'F4';

/** Pitches for note parsing. */
const PITCHES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'] as const;

/** All 37 harmonium notes C3–C6. */
export const HARMONIUM_NOTES: string[] = (() => {
  const out: string[] = [];
  for (let oct = 3; oct <= 5; oct++) {
    for (const p of PITCHES) out.push(`${p}${oct}`);
  }
  out.push('C6');
  return out;
})();

/** Get key that produces `note` at given octave offset, or null if out of range. */
export function getKeyForNote(note: string, octaveOffset: number): string | null {
  const base = applyOctave(note, -octaveOffset);
  const key = Object.entries(KEY_TO_BASE_NOTE).find(([, n]) => n === base)?.[0];
  return key ?? null;
}

/** Note (e.g. "C4") to key for default octave 4. Used by preset player for visual feedback. */
export const NOTE_TO_KEY: Record<string, string> = Object.fromEntries(
  (Object.entries(KEY_TO_BASE_NOTE) as [string, string][]).map(([k, n]) => [n, k])
);
