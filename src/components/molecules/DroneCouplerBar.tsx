import React from 'react';
import { Button } from '../ui/button';
import { Switch } from '../ui/switch';
import { Music2 } from 'lucide-react';
import type { DroneState } from '../AudioEngine';

type Props = {
  drone: DroneState;
  onDroneChange: (key: keyof DroneState, value: boolean) => void;
  couplerOn: boolean;
  onCouplerChange: (on: boolean) => void;
  disabled?: boolean;
};

export function DroneCouplerBar({
  drone,
  onDroneChange,
  couplerOn,
  onCouplerChange,
  disabled = false,
}: Props) {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex items-center gap-2 text-brand-muted">
        <Music2 className="w-4 h-4" strokeWidth={2} />
        <span className="text-xs font-semibold uppercase tracking-wider">Drones</span>
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        <Button
          variant={drone.sa ? 'default' : 'outline'}
          size="sm"
          className="rounded-full"
          disabled={disabled}
          onClick={() => !disabled && onDroneChange('sa', !drone.sa)}
        >
          Drone Sa (C)
        </Button>
        <Button
          variant={drone.pa ? 'default' : 'outline'}
          size="sm"
          className="rounded-full"
          disabled={disabled}
          onClick={() => !disabled && onDroneChange('pa', !drone.pa)}
        >
          Drone Pa (G)
        </Button>
        <Button
          variant={drone.ma ? 'default' : 'outline'}
          size="sm"
          className="rounded-full"
          disabled={disabled}
          onClick={() => !disabled && onDroneChange('ma', !drone.ma)}
        >
          Drone Ma (F)
        </Button>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 text-brand-muted">
          <span className="text-xs font-medium">Coupler</span>
          <Switch
            checked={couplerOn}
            onCheckedChange={onCouplerChange}
            disabled={disabled}
            className="data-[state=checked]:bg-primary"
          />
        </div>
        <span className="text-xs text-brand-muted">+1 octave</span>
      </div>
    </div>
  );
}
