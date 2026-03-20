import React from 'react';

type Props = {
  pressure: number;
};

export function PressureMeter({ pressure }: Props) {
  const pct = Math.max(0, Math.min(100, pressure * 100));
  return (
    <div className="w-full h-2.5 rounded-lg overflow-hidden bg-[rgba(44,24,16,0.1)] border border-[rgba(44,24,16,0.12)]">
      <div
        className="h-full rounded-lg bg-gradient-to-r from-[#6b5344] to-[#8b6f5c] transition-[width] duration-75 ease-out"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
