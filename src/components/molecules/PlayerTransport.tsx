import React from 'react';
import { SkipBack, Play, Pause, SkipForward, RotateCcw } from 'lucide-react';
import { Button } from '../ui/button';

type Props = {
  onPrev: () => void;
  onPlay: () => void;
  onNext: () => void;
  onReset: () => void;
  isPlaying: boolean;
  hasSelectedSong: boolean;
  hasEnded?: boolean;
  canGoPrev: boolean;
  canGoNext: boolean;
  showSelectOnly?: boolean;
};

export function PlayerTransport({
  onPrev,
  onPlay,
  onNext,
  onReset,
  isPlaying,
  hasSelectedSong,
  hasEnded = false,
  canGoPrev,
  canGoNext,
  showSelectOnly = false,
}: Props) {
  const showTransport = !showSelectOnly;

  return (
    <div className="w-full flex flex-col sm:flex-row flex-wrap items-center justify-center gap-4">
      {showTransport && (
        <div className="flex items-center justify-between gap-2 w-full">
          <div className="flex-0" />
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="rounded-full w-10 h-10"
              title="Previous song"
              onClick={onPrev}
              disabled={!hasSelectedSong || !canGoPrev}
            >
              <SkipBack className="w-5 h-5" strokeWidth={2.5} />
            </Button>
            <Button
              variant="default"
              size="icon"
              className="rounded-full w-12 h-12"
              title={
                hasEnded
                  ? 'Click Reset to play again'
                  : hasSelectedSong
                    ? isPlaying
                      ? 'Pause'
                      : 'Play'
                    : 'Select a song'
              }
              onClick={onPlay}
              disabled={!hasSelectedSong || hasEnded}
            >
              {isPlaying ? (
                <Pause className="w-6 h-6" strokeWidth={2.5} fill="currentColor" />
              ) : (
                <Play className="w-6 h-6 ml-0.5" strokeWidth={2.5} fill="currentColor" />
              )}
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="rounded-full w-10 h-10"
              title="Next song"
              onClick={onNext}
              disabled={!hasSelectedSong || !canGoNext}
            >
              <SkipForward className="w-5 h-5" strokeWidth={2.5} />
            </Button>
          </div>
          <Button
            variant="outline"
            size="icon"
            className="rounded-full w-10 h-10"
            title="Reset to start"
            onClick={onReset}
            disabled={!hasSelectedSong}
          >
            <RotateCcw className="w-5 h-5" strokeWidth={2.5} />
          </Button>
        </div>
      )}
    </div>
  );
}
