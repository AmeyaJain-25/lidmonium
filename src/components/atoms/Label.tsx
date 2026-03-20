import React from 'react';

type Props = {
  children: React.ReactNode;
};

export function Label({ children }: Props) {
  return (
    <span className="text-xs font-semibold text-brand-muted tracking-wide">
      {children}
    </span>
  );
}
