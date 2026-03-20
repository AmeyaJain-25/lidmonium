import React from 'react';
import { Logo } from '../atoms/Logo';

type Props = {
  title?: string;
};

export function AppHeader({ title = 'LidMonium' }: Props) {
  return (
    <header className="w-full pt-8 px-6 pb-5 shrink-0">
      <div className="flex flex-col items-center gap-3">
        <Logo size={48} className="text-brand-dark" />
        <h1 className="text-[1.75rem] font-semibold text-brand-dark tracking-[0.12em] uppercase m-0 text-center">
          {title}
        </h1>
      </div>
    </header>
  );
}
