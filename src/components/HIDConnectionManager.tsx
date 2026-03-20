import React, { useCallback, useEffect } from 'react';
import { Cable } from 'lucide-react';
import { parseLidAngleFromReport } from '../utils/hidLidAngle';
import { Button } from './ui/button';
import type { ConnectionStatus } from '../types/connection';

export type { ConnectionStatus } from '../types/connection';

type Props = {
  onAngle: (angle: number) => void;
  onConnectionChange: (connected: boolean) => void;
  status: ConnectionStatus;
  errorMessage: string | null;
  onStatusChange: (status: ConnectionStatus, error: string | null) => void;
  compact?: boolean;
  buttonLabel?: string;
};

const WAIT_FOR_REPORT_MS = 2200;

export function HIDConnectionManager({
  onAngle,
  onConnectionChange,
  status,
  errorMessage,
  onStatusChange,
  compact = false,
  buttonLabel,
}: Props) {
  const connectLabel = buttonLabel ?? 'Connect Lid Sensor';
  const deviceRef = React.useRef<HIDDevice | null>(null);
  const hasReceivedReportRef = React.useRef(false);
  const [waitingForData, setWaitingForData] = React.useState(false);

  const inputReportHandler = useCallback(
    (ev: HIDInputReportEvent) => {
      if (!hasReceivedReportRef.current) {
        hasReceivedReportRef.current = true;
        setWaitingForData(false);
        onConnectionChange(true);
        onStatusChange('connected', null);
      }
      const angle = parseLidAngleFromReport(ev.data);
      onAngle(angle);
    },
    [onAngle, onConnectionChange, onStatusChange]
  );

  const cleanup = useCallback(() => {
    const dev = deviceRef.current;
    if (dev) {
      try {
        dev.removeEventListener('inputreport', inputReportHandler);
        dev.close();
      } catch {
        // ignore
      }
      deviceRef.current = null;
    }
    hasReceivedReportRef.current = false;
    setWaitingForData(false);
    onConnectionChange(false);
    onAngle(0);
  }, [inputReportHandler, onConnectionChange, onAngle]);

  const attachDevice = useCallback(
    (device: HIDDevice) => {
      deviceRef.current = device;
      hasReceivedReportRef.current = false;
      setWaitingForData(true);
      device.addEventListener('inputreport', inputReportHandler);
    },
    [inputReportHandler]
  );

  const detachDevice = useCallback((device: HIDDevice) => {
    try {
      device.removeEventListener('inputreport', inputReportHandler);
      device.close();
    } catch {
      // ignore
    }
    deviceRef.current = null;
  }, [inputReportHandler]);

  const handleConnect = useCallback(async () => {
    if (!navigator.hid) {
      onStatusChange('error', 'WebHID not supported. Please use Chrome on a MacBook.');
      return;
    }

    onStatusChange('connecting', null);
    cleanup();
    try {
      const existingDevices = await navigator.hid.getDevices();
      for (const device of existingDevices) {
        try {
          if (!device.opened) await device.open();
          attachDevice(device);
          await new Promise((r) => setTimeout(r, WAIT_FOR_REPORT_MS));
          if (hasReceivedReportRef.current) {
            return;
          }
          detachDevice(device);
        } catch {
          continue;
        }
      }

      setWaitingForData(false);
      onStatusChange('connecting', null);
      const devices = await navigator.hid.requestDevice({ filters: [] });
      if (!devices.length) {
        onStatusChange('error', 'No device selected. Connect again to choose the lid sensor.');
        return;
      }
      const device = devices[0];
      await device.open();
      attachDevice(device);
    } catch (err) {
      setWaitingForData(false);
      onStatusChange('error', err instanceof Error ? err.message : 'Connection failed.');
    }
  }, [cleanup, attachDevice, detachDevice, onStatusChange]);

  useEffect(() => {
    const hid = navigator.hid;
    if (!hid) return;
    const handleDisconnect = (ev: HIDConnectionEvent) => {
      if (ev.device === deviceRef.current) cleanup();
    };
    hid.addEventListener('disconnect', handleDisconnect);
    return () => {
      hid.removeEventListener('disconnect', handleDisconnect);
      cleanup();
    };
  }, [cleanup]);

  const isWebHIDSupported = typeof navigator !== 'undefined' && !!navigator.hid?.requestDevice;

  if (!isWebHIDSupported) {
    return compact ? (
      <Button variant="default" size="lg" className="rounded-full" disabled>
        <Cable className="w-4 h-4" strokeWidth={2} />
        {connectLabel}
      </Button>
    ) : (
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button variant="default" size="lg" className="rounded-full" disabled>
          <Cable className="w-4 h-4" strokeWidth={2} />
          {connectLabel}
        </Button>
        <p className="text-brand-error mt-2 text-[0.85rem] w-full text-center">
          WebHID not supported. Please use Chrome on a MacBook.
        </p>
      </div>
    );
  }

  if (compact) {
    return (
      <Button variant="default" size="lg" className="rounded-full" onClick={handleConnect} disabled={status === 'connecting'}>
        <Cable className="w-4 h-4" strokeWidth={2} />
        {connectLabel}
      </Button>
    );
  }

  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      <Button variant="default" size="lg" className="rounded-full" onClick={handleConnect} disabled={status === 'connecting'}>
        <Cable className="w-4 h-4" strokeWidth={2} />
        {connectLabel}
      </Button>
      {status === 'connected' && <span className="text-[0.8rem] text-brand-muted">Connected</span>}
      {status === 'connecting' && (
        <span className="text-[0.8rem] text-brand-muted">
          {waitingForData ? 'Waiting for sensor data…' : 'Connecting…'}
        </span>
      )}
      {errorMessage && (
        <p className="text-brand-error mt-2 text-[0.85rem] w-full text-center">{errorMessage}</p>
      )}
    </div>
  );
}
