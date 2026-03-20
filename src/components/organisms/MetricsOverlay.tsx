import React from 'react';
import { MetricsCard } from '../molecules/MetricsCard';
import { PressureMeter } from '../atoms/PressureMeter';
import { westernNoteToSargam } from '../../utils/sargam';

type Props = {
  lidAngle: number | null;
  pressure: number;
  octaveOffset: number;
  activeNotes: string[];
  /** When 'sargam', active notes are shown as Sa, Re, etc. */
  keyLabelNotation?: 'western' | 'sargam';
  tonic?: string;
};

export function MetricsOverlay({
  lidAngle,
  pressure,
  octaveOffset,
  activeNotes,
  keyLabelNotation = 'western',
  tonic = 'C',
}: Props) {
  const activeNotesDisplay =
    keyLabelNotation === 'sargam'
      ? activeNotes.map((n) => westernNoteToSargam(n, tonic)).join(', ')
      : activeNotes.join(', ');
  const octaveNum = 4 + octaveOffset;
  const octaveRangeDisplay =
    keyLabelNotation === 'sargam'
      ? `${westernNoteToSargam(`C${octaveNum}`, tonic)}–${westernNoteToSargam(`C${octaveNum + 1}`, tonic)}`
      : `C${octaveNum}–C${octaveNum + 1}`;
  const rows = [
    { label: 'Lid angle', value: lidAngle !== null ? `${lidAngle.toFixed(1)}°` : '—' },
    { label: 'Pressure', value: `${(pressure * 100).toFixed(0)}%` },
    { label: 'Octave', value: `${octaveNum} (${octaveRangeDisplay})` },
    ...(keyLabelNotation === 'sargam'
      ? [{ label: 'Tonic', value: `Sa=${tonic}` }]
      : []),
    { label: 'Key labels', value: keyLabelNotation === 'sargam' ? 'Sargam' : 'Western' },
    { label: 'Active notes', value: activeNotes.length ? activeNotesDisplay : '—' },
  ];
  return (
    <div className="fixed top-4 right-4 w-56 z-50">
      <MetricsCard rows={rows}>
        <PressureMeter pressure={pressure} />
      </MetricsCard>
    </div>
  );
}
