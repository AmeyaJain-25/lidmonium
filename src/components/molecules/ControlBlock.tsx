import React from 'react';
import { Label } from '../atoms/Label';
import { StatusText } from '../atoms/StatusText';
import type { ConnectionStatus } from '../../types/connection';

type Props = {
  label: React.ReactNode;
  children: React.ReactNode;
  status?: ConnectionStatus;
  statusLabel?: React.ReactNode;
};

export function ControlBlock({ label, children, status, statusLabel }: Props) {
  return (
    <div className="flex flex-col items-center gap-3">
      <Label>{label}</Label>
      {children}
      {status != null && statusLabel != null && (
        <StatusText status={status}>{statusLabel}</StatusText>
      )}
    </div>
  );
}
