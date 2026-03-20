import React from 'react';
import { Cable, Music2, BarChart3, Wind } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '../ui/tabs';
import { HIDConnectionManager } from '../HIDConnectionManager';
import type { ConnectionStatus } from '../../types/connection';

type Props = {
  onAngle: (angle: number) => void;
  onConnectionChange: (connected: boolean) => void;
  connectionStatus: ConnectionStatus;
  errorMessage: string | null;
  onStatusChange: (status: ConnectionStatus, error: string | null) => void;
  connectionButtonLabel: string;
  connectionStatusLabel: string;
  autoBellows: boolean;
  onAutoBellowsChange: (value: boolean) => void;
  playPreRecordedMode: boolean;
  onPlayPreRecordedModeChange: (value: boolean) => void;
  metricsOpen: boolean;
  onMetricsOpenChange: (value: boolean) => void;
};

export function ActionsBar({
  onAngle,
  onConnectionChange,
  connectionStatus,
  errorMessage,
  onStatusChange,
  connectionButtonLabel,
  connectionStatusLabel,
  autoBellows,
  onAutoBellowsChange,
  playPreRecordedMode,
  onPlayPreRecordedModeChange,
  metricsOpen,
  onMetricsOpenChange,
}: Props) {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-2 flex flex-wrap justify-center gap-6">
      {/* Connection */}
      <div className="flex flex-col items-center gap-2">
        <div className="flex items-center gap-2 text-brand-muted">
          <Cable className="w-4 h-4" strokeWidth={2} />
          <span className="text-xs font-semibold uppercase tracking-wider">Connection</span>
        </div>
        <HIDConnectionManager
          onAngle={onAngle}
          onConnectionChange={onConnectionChange}
          status={connectionStatus}
          errorMessage={errorMessage}
          onStatusChange={onStatusChange}
          compact
          buttonLabel={connectionButtonLabel}
        />
        <span
          className={`text-xs font-medium ${
            connectionStatus === 'connected'
              ? 'text-brand-success'
              : connectionStatus === 'connecting'
                ? 'text-brand-warn'
                : connectionStatus === 'error'
                  ? 'text-brand-error'
                  : 'text-brand-muted'
          }`}
        >
          {connectionStatusLabel}
        </span>
      </div>

      {/* Bellows mode */}
      <div className="flex flex-col items-center gap-2">
        <div className="flex items-center gap-2 text-brand-muted">
          <Wind className="w-4 h-4" strokeWidth={2} />
          <span className="text-xs font-semibold uppercase tracking-wider">Bellows</span>
        </div>
        <Tabs
          value={autoBellows ? 'auto' : 'lid'}
          onValueChange={(v) => onAutoBellowsChange(v === 'auto')}
        >
          <TabsList className="w-[150px] h-11">
            <TabsTrigger value="lid" className="flex-1 rounded-full">Lid Pump</TabsTrigger>
            <TabsTrigger value="auto" className="flex-1 rounded-full">Auto</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Play mode */}
      <div className="flex flex-col items-center gap-2">
        <div className="flex items-center gap-2 text-brand-muted">
          <Music2 className="w-4 h-4" strokeWidth={2} />
          <span className="text-xs font-semibold uppercase tracking-wider">Play mode</span>
        </div>
        <Tabs
          value={playPreRecordedMode ? 'play' : 'custom'}
          onValueChange={(v) => onPlayPreRecordedModeChange(v === 'play')}
        >
          <TabsList className="w-[150px] h-11">
            <TabsTrigger value="custom" className="flex-1">Play</TabsTrigger>
            <TabsTrigger value="play" className="flex-1">Library</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Nerdy metrics */}
      <div className="flex flex-col items-center gap-2">
        <div className="flex items-center gap-2 text-brand-muted">
          <BarChart3 className="w-4 h-4" strokeWidth={2} />
          <span className="text-xs font-semibold uppercase tracking-wider">Metrics</span>
        </div>
        <Tabs
          value={metricsOpen ? 'on' : 'off'}
          onValueChange={(v) => onMetricsOpenChange(v === 'on')}
        >
          <TabsList className="w-[100px] h-11">
            <TabsTrigger value="off" className="flex-1">Off</TabsTrigger>
            <TabsTrigger value="on" className="flex-1">On</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    </div>
  );
}
