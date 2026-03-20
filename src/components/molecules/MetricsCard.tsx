import React from 'react';

export type MetricsRow = { label: string; value: string };

type Props = {
  rows: MetricsRow[];
  children?: React.ReactNode;
};

export function MetricsCard({ rows, children }: Props) {
  return (
    <div className="p-4 bg-white/92 rounded-xl border border-[rgba(44,24,16,0.1)] shadow-lg text-[0.75rem] z-10">
      {rows.map((row, i) => (
        <div
          key={row.label}
          className="flex justify-between items-center mb-2 last:mb-0"
        >
          <span className="text-brand-muted">{row.label}</span>
          <span className="tabular-nums text-brand-dark font-semibold">{row.value}</span>
        </div>
      ))}
      {children && <div className="mt-2.5">{children}</div>}
    </div>
  );
}
