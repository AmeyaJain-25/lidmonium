/** Single note event at a time (ms) with duration. */
export type NoteEvent = {
  timeMs: number;
  note: string;
  durationMs: number;
};

/** Drone keys that can be suggested for a song. */
export type DroneKey = 'sa' | 'pa' | 'ma';

/** Notation for preset events: Western (C4, F#4) or Sargam (Sa, Re, ga). */
export type PresetNotation = 'western' | 'sargam';

export type PresetSong = {
  id: string;
  name: string;
  durationMs: number;
  events: NoteEvent[];
  /** Octave offset for display when playing (-1=C3-C4, 0=C4-C5, 1=C5-C6). Used as initial display when song loads. */
  defaultOctave?: number;
  /** Suggested drones to complement this song. Shown as hint; can auto-enable on play. */
  suggestedDrones?: DroneKey[];
  /** Human-readable note range, e.g. "C3-C5". */
  noteRange?: string;
  /** Event note format. Default 'western'. When 'sargam', events[].note uses Sa/Re/Ga etc.; tonic required. */
  notation?: PresetNotation;
  /** Western pitch class of Sa (e.g. "C", "D", "F#"). Required when notation is 'sargam'; default "C". */
  tonic?: string;
};

/** Notes must be in harmonium range C3-C6. */
export const PRESET_SONGS: PresetSong[] = [
  {
    id: 'happy-birthday',
    name: 'Happy Birthday',
    durationMs: 16000,
    defaultOctave: 0,
    suggestedDrones: ['sa'],
    noteRange: 'C4-D5',
    events: [
      { timeMs: 0, note: 'G4', durationMs: 500 },
      { timeMs: 600, note: 'G4', durationMs: 300 },
      { timeMs: 1000, note: 'A4', durationMs: 800 },
      { timeMs: 1900, note: 'G4', durationMs: 800 },
      { timeMs: 2800, note: 'C5', durationMs: 800 },
      { timeMs: 3700, note: 'B4', durationMs: 1200 },
      { timeMs: 5100, note: 'G4', durationMs: 500 },
      { timeMs: 5700, note: 'G4', durationMs: 300 },
      { timeMs: 6100, note: 'A4', durationMs: 800 },
      { timeMs: 7000, note: 'G4', durationMs: 800 },
      { timeMs: 7900, note: 'D5', durationMs: 800 },
      { timeMs: 8800, note: 'C5', durationMs: 1200 },
      { timeMs: 10200, note: 'G4', durationMs: 500 },
      { timeMs: 10800, note: 'G4', durationMs: 300 },
      { timeMs: 11200, note: 'A4', durationMs: 800 },
      { timeMs: 12100, note: 'G4', durationMs: 800 },
      { timeMs: 13000, note: 'D5', durationMs: 800 },
      { timeMs: 13900, note: 'C5', durationMs: 2100 },
    ],
  },
  {
    id: 'twinkle-twinkle',
    name: 'Twinkle Twinkle Little Star',
    durationMs: 14000,
    defaultOctave: 0,
    suggestedDrones: ['sa'],
    noteRange: 'C4-A4',
    events: [
      { timeMs: 0, note: 'C4', durationMs: 500 },
      { timeMs: 500, note: 'C4', durationMs: 500 },
      { timeMs: 1000, note: 'G4', durationMs: 500 },
      { timeMs: 1500, note: 'G4', durationMs: 500 },
      { timeMs: 2000, note: 'A4', durationMs: 500 },
      { timeMs: 2500, note: 'A4', durationMs: 500 },
      { timeMs: 3000, note: 'G4', durationMs: 1000 },
      { timeMs: 4200, note: 'F4', durationMs: 500 },
      { timeMs: 4700, note: 'F4', durationMs: 500 },
      { timeMs: 5200, note: 'E4', durationMs: 500 },
      { timeMs: 5700, note: 'E4', durationMs: 500 },
      { timeMs: 6200, note: 'D4', durationMs: 500 },
      { timeMs: 6700, note: 'D4', durationMs: 500 },
      { timeMs: 7200, note: 'C4', durationMs: 1000 },
      { timeMs: 8500, note: 'G4', durationMs: 500 },
      { timeMs: 9000, note: 'G4', durationMs: 500 },
      { timeMs: 9500, note: 'F4', durationMs: 500 },
      { timeMs: 10000, note: 'F4', durationMs: 500 },
      { timeMs: 10500, note: 'E4', durationMs: 500 },
      { timeMs: 11000, note: 'E4', durationMs: 500 },
      { timeMs: 11500, note: 'D4', durationMs: 500 },
      { timeMs: 12000, note: 'D4', durationMs: 500 },
      { timeMs: 12500, note: 'C4', durationMs: 1500 },
    ],
  },
  {
    id: 'jingle-bells',
    name: 'Jingle Bells',
    durationMs: 24000,
    defaultOctave: 0,
    suggestedDrones: ['sa', 'pa'],
    noteRange: 'C4-G4',
    events: [
      { timeMs: 0, note: 'E4', durationMs: 400 },
      { timeMs: 400, note: 'E4', durationMs: 400 },
      { timeMs: 800, note: 'E4', durationMs: 800 },
      { timeMs: 1600, note: 'E4', durationMs: 400 },
      { timeMs: 2000, note: 'E4', durationMs: 400 },
      { timeMs: 2400, note: 'E4', durationMs: 800 },
      { timeMs: 3200, note: 'E4', durationMs: 400 },
      { timeMs: 3600, note: 'G4', durationMs: 400 },
      { timeMs: 4000, note: 'C4', durationMs: 400 },
      { timeMs: 4400, note: 'D4', durationMs: 400 },
      { timeMs: 4800, note: 'E4', durationMs: 1200 },
      { timeMs: 6200, note: 'F4', durationMs: 400 },
      { timeMs: 6600, note: 'F4', durationMs: 400 },
      { timeMs: 7000, note: 'F4', durationMs: 400 },
      { timeMs: 7400, note: 'F4', durationMs: 400 },
      { timeMs: 7800, note: 'F4', durationMs: 400 },
      { timeMs: 8200, note: 'E4', durationMs: 400 },
      { timeMs: 8600, note: 'E4', durationMs: 400 },
      { timeMs: 9000, note: 'E4', durationMs: 400 },
      { timeMs: 9400, note: 'D4', durationMs: 400 },
      { timeMs: 9800, note: 'D4', durationMs: 400 },
      { timeMs: 10200, note: 'E4', durationMs: 400 },
      { timeMs: 10600, note: 'D4', durationMs: 400 },
      { timeMs: 11000, note: 'G4', durationMs: 1200 },
      { timeMs: 12400, note: 'E4', durationMs: 400 },
      { timeMs: 12800, note: 'E4', durationMs: 400 },
      { timeMs: 13200, note: 'E4', durationMs: 800 },
      { timeMs: 14000, note: 'E4', durationMs: 400 },
      { timeMs: 14400, note: 'E4', durationMs: 400 },
      { timeMs: 14800, note: 'E4', durationMs: 800 },
      { timeMs: 15600, note: 'E4', durationMs: 400 },
      { timeMs: 16000, note: 'G4', durationMs: 400 },
      { timeMs: 16400, note: 'C4', durationMs: 400 },
      { timeMs: 16800, note: 'D4', durationMs: 400 },
      { timeMs: 17200, note: 'E4', durationMs: 1200 },
      { timeMs: 18600, note: 'F4', durationMs: 400 },
      { timeMs: 19000, note: 'F4', durationMs: 400 },
      { timeMs: 19400, note: 'F4', durationMs: 400 },
      { timeMs: 19800, note: 'F4', durationMs: 400 },
      { timeMs: 20200, note: 'F4', durationMs: 400 },
      { timeMs: 20600, note: 'E4', durationMs: 400 },
      { timeMs: 21000, note: 'E4', durationMs: 400 },
      { timeMs: 21400, note: 'E4', durationMs: 400 },
      { timeMs: 21800, note: 'D4', durationMs: 400 },
      { timeMs: 22200, note: 'D4', durationMs: 400 },
      { timeMs: 22600, note: 'E4', durationMs: 400 },
      { timeMs: 23000, note: 'D4', durationMs: 400 },
      { timeMs: 23400, note: 'G4', durationMs: 600 },
    ],
  },
  // {
  //   id: 'raghupati-raghav',
  //   name: 'Raghupati Raghav',
  //   notation: 'sargam',
  //   tonic: 'C',
  //   durationMs: 16000,
  //   defaultOctave: 0,
  //   suggestedDrones: ['sa', 'pa'],
  //   noteRange: 'C4-A4',
  //   events: [
  //     { timeMs: 0, note: 'sa', durationMs: 800 },
  //     { timeMs: 1000, note: 're', durationMs: 800 },
  //     { timeMs: 2000, note: 'ga', durationMs: 800 },
  //     { timeMs: 3000, note: 'ma', durationMs: 900 },
  //     { timeMs: 4200, note: 'ga', durationMs: 800 },
  //     { timeMs: 5200, note: 're', durationMs: 800 },
  //     { timeMs: 6200, note: 'sa', durationMs: 1000 },
  //     { timeMs: 7600, note: 'ga', durationMs: 800 },
  //     { timeMs: 8600, note: 'ma', durationMs: 800 },
  //     { timeMs: 9600, note: 'pa', durationMs: 900 },
  //     { timeMs: 10800, note: 'ma', durationMs: 800 },
  //     { timeMs: 11800, note: 'ga', durationMs: 800 },
  //     { timeMs: 12800, note: 're', durationMs: 800 },
  //     { timeMs: 13800, note: 'sa', durationMs: 1200 },
  //   ],
  // },
];
