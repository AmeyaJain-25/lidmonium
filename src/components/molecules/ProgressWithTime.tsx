import React from 'react';
import { Progress } from '../ui/progress';

type Props = {
  value: number;
  currentLabel: string;
  totalLabel: string;
  onSeek?: (e: React.MouseEvent<HTMLDivElement>) => void;
};

export function ProgressWithTime({ value, currentLabel, totalLabel, onSeek }: Props) {
  const pct = Math.max(0, Math.min(1, value)) * 100;
  return (
    <div className="w-full">
      <div
        className="cursor-pointer mb-2 rounded-full overflow-hidden"
        onClick={onSeek}
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <Progress value={pct} className="h-2.5 rounded-full" noTransition />
      </div>
      <div className="flex justify-between text-[0.85rem] font-medium text-brand-muted tabular-nums">
        <span>{currentLabel}</span>
        <span>{totalLabel}</span>
      </div>
    </div>
  );
}
