/**
 * Sargam (Indian solfege) ↔ Western note conversion.
 * Sa Re Ga Ma Pa Dha Ni = shuddh; re ga dha ni = komal (flat); ma = tivra Ma (sharp).
 * Semitones above tonic: Sa=0, Re=2, re=1, Ga=4, ga=3, Ma=5, ma=6, Pa=7, Dha=9, dha=8, Ni=11, ni=10.
 */

import type { NoteEvent, PresetSong } from '../data/presetSongs';

const PITCH_CLASSES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'] as const;

const WESTERN_NOTE_REGEX = /^([A-G]#?)(\d+)$/;

/** Sargam syllable (lowercase = komal; "ma" = tivra Ma) → semitone above tonic. */
const SARGAM_TO_SEMITONE: Record<string, number> = {
  Sa: 0,
  sa: 0,
  Re: 2,
  re: 1,
  Ga: 4,
  ga: 3,
  Ma: 5,
  ma: 6,
  Pa: 7,
  pa: 7,
  Dha: 9,
  dha: 8,
  Ni: 11,
  ni: 10,
};

/** Semitone (0–11) → sargam display label (shuddh / komal / tivra). */
const SEMITONE_TO_SARGAM: Record<number, string> = {
  0: 'Sa',
  1: 're',
  2: 'Re',
  3: 'ga',
  4: 'Ga',
  5: 'Ma',
  6: 'ma',
  7: 'Pa',
  8: 'dha',
  9: 'Dha',
  10: 'ni',
  11: 'Ni',
};

function getTonicIndex(tonic: string): number {
  const i = PITCH_CLASSES.indexOf(tonic as (typeof PITCH_CLASSES)[number]);
  return i >= 0 ? i : 0;
}

/** Parse sargam string: "Sa", "Re", "ga", "Sa4", "Re5". Returns Western note (e.g. "C4") or null if invalid. */
export function parseSargamNote(
  sargamNote: string,
  tonic: string,
  defaultOctave: number = 4
): string | null {
  const m = sargamNote.match(/^(sa|re|ga|ma|pa|dha|ni|Sa|Re|Ga|Ma|Pa|Dha|Ni)(\d+)?$/i);
  if (!m) return null;
  const syllable = m[1];
  const octave = m[2] != null ? parseInt(m[2], 10) : defaultOctave;
  const semitone = SARGAM_TO_SEMITONE[syllable];
  if (semitone === undefined) return null;
  const tonicIdx = getTonicIndex(tonic);
  const noteIdx = (tonicIdx + semitone) % 12;
  const pitch = PITCH_CLASSES[noteIdx];
  const clampedOctave = Math.max(3, Math.min(6, octave));
  return `${pitch}${clampedOctave}`;
}

/**
 * Convert Western note to sargam label for display, with octave indicator.
 * Octave 3 = lower (e.g. ",Sa"), 4 = middle ("Sa"), 5 = upper ("Sa'"), 6 = double upper ("Sa''").
 * e.g. westernNoteToSargam("C4", "C") → "Sa"; westernNoteToSargam("C5", "C") → "Sa'"; westernNoteToSargam("E4", "C") → "Ga".
 */
export function westernNoteToSargam(westernNote: string, tonic: string): string {
  const m = westernNote.match(WESTERN_NOTE_REGEX);
  if (!m) return westernNote;
  const pitch = m[1];
  const octave = parseInt(m[2], 10);
  const pitchIdx = PITCH_CLASSES.indexOf(pitch as (typeof PITCH_CLASSES)[number]);
  if (pitchIdx < 0) return westernNote;
  const tonicIdx = getTonicIndex(tonic);
  const semitone = (pitchIdx - tonicIdx + 12) % 12;
  const syllable = SEMITONE_TO_SARGAM[semitone];
  if (syllable == null) return westernNote;
  if (octave <= 3) return `,${syllable}`;
  if (octave === 4) return syllable;
  if (octave === 5) return `${syllable}'`;
  return `${syllable}''`;
}

/**
 * Resolve preset events to Western notes. If song.notation is 'sargam', convert each event.note
 * via parseSargamNote; otherwise return events as-is.
 */
export function resolvePresetEvents(song: PresetSong | null): NoteEvent[] {
  if (!song || !song.events.length) return [];
  const notation = song.notation ?? 'western';
  const tonic = (song.tonic ?? 'C').trim();
  const defaultOctave = 4;

  if (notation === 'western') {
    return song.events.map((ev) => ({ ...ev }));
  }

  const resolved: NoteEvent[] = [];
  for (const ev of song.events) {
    const western = parseSargamNote(ev.note, tonic, defaultOctave);
    if (western) {
      resolved.push({ ...ev, note: western });
    }
  }
  return resolved;
}
