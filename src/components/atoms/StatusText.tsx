import React from 'react';
import type { ConnectionStatus } from '../../types/connection';

function statusColorClass(status: ConnectionStatus): string {
  switch (status) {
    case 'connected':
      return 'text-brand-success';
    case 'connecting':
      return 'text-brand-warn';
    case 'error':
      return 'text-brand-error';
    default:
      return 'text-brand-muted';
  }
}

type Props = {
  status: ConnectionStatus;
  children: React.ReactNode;
};

export function StatusText({ status, children }: Props) {
  return (
    <span className={`text-[0.85rem] font-medium ${statusColorClass(status)}`}>
      {children}
    </span>
  );
}
