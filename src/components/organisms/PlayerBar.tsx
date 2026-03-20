import React from 'react';
import { ProgressWithTime } from '../molecules/ProgressWithTime';
import { PlayerTransport } from '../molecules/PlayerTransport';
import { formatMs } from '../../utils/format';

type Song = { id: string; name: string; durationMs: number };

type Props = {
  progress: number;
  onProgressSeek: (e: React.MouseEvent<HTMLDivElement>) => void;
  selectedSong: Song | null;
  onPrev: () => void;
  onPlay: () => void;
  onNext: () => void;
  onReset: () => void;
  isPlaying: boolean;
  hasEnded: boolean;
  currentSongIndex: number;
  songsCount: number;
};

export function PlayerBar({
  progress,
  onProgressSeek,
  selectedSong,
  onPrev,
  onPlay,
  onNext,
  onReset,
  isPlaying,
  hasEnded,
  currentSongIndex,
  songsCount,
}: Props) {
  return (
    <div className="flex flex-col gap-4 items-center justify-center gap-4 w-full max-w-2xl mx-auto py-6 px-4 sm:px-6 bg-brand-dark/[0.06] rounded-lg">
      <div className="min-h-[52px] w-full">
        {selectedSong ? (
          <ProgressWithTime
            value={progress}
            onSeek={onProgressSeek}
            currentLabel={formatMs(progress * selectedSong.durationMs)}
            totalLabel={formatMs(selectedSong.durationMs)}
          />
        ) : null}
      </div>
      <PlayerTransport
        onPrev={onPrev}
        onPlay={onPlay}
        onNext={onNext}
        onReset={onReset}
        isPlaying={isPlaying}
        hasSelectedSong={!!selectedSong}
        hasEnded={hasEnded}
        canGoPrev={currentSongIndex > 0}
        canGoNext={currentSongIndex >= 0 && currentSongIndex < songsCount - 1}
      />
    </div>
  );
}
