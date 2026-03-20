import React, { useState, useCallback, useRef, useMemo } from 'react';
import type { ConnectionStatus } from './types/connection';
import { KeyboardController } from './components/KeyboardController';
import { AudioEngine, AudioEngineHandle, type DroneState } from './components/AudioEngine';
import { AppHeader, MetricsOverlay, ActionsBar, PlayerBar, PlaylistSidebar, KeyboardKeys } from './components/organisms';
import { DroneCouplerBar } from './components/molecules/DroneCouplerBar';
import { getNoteForKey } from './constants/keyMap';
import { useBellowsPressure } from './hooks/useBellowsPressure';
import { useAutoPressure } from './hooks/useAutoPressure';
import { usePresetPlayer } from './hooks/usePresetPlayer';
import { PRESET_SONGS } from './data/presetSongs';
import { clampOctaveOffset } from './constants/keyMap';
import { westernNoteToSargam } from './utils/sargam';

function App() {
  const [lidAngle, setLidAngle] = useState<number | null>(null);
  const [connected, setConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeKeys, setActiveKeys] = useState<Set<string>>(new Set());
  const [drone, setDrone] = useState<DroneState>({ sa: false, pa: false, ma: false });
  const [couplerOn, setCouplerOn] = useState(false);
  const [octaveOffset, setOctaveOffset] = useState(0);
  const [metricsOpen, setMetricsOpen] = useState(false);
  const [autoBellows, setAutoBellows] = useState(false);
  const [playPreRecordedMode, setPlayPreRecordedMode] = useState(false);
  const [selectedSongId, setSelectedSongId] = useState<string>(PRESET_SONGS[0]?.id ?? 'custom');
  /** In custom mode, show keys as Western or Sargam. In preset mode, follows song.notation. */
  const [keyLabelNotationCustom, setKeyLabelNotationCustom] = useState<'western' | 'sargam'>('western');

  const lidPressure = useBellowsPressure(connected ? lidAngle : null);
  const audioRef = useRef<AudioEngineHandle>(null);

  const selectedSong =
    playPreRecordedMode && selectedSongId !== 'custom'
      ? PRESET_SONGS.find((s) => s.id === selectedSongId) ?? null
      : null;

  const handleNoteOn = useCallback((note: string) => {
    audioRef.current?.triggerAttack(note);
  }, []);

  const handleNoteOff = useCallback((note: string) => {
    audioRef.current?.triggerRelease(note);
  }, []);

  const {
    progress,
    setProgress,
    isPlaying,
    hasEnded,
    play,
    pause,
    reset,
    presetActiveKeys,
    presetActiveNotes,
    displayOctaveOffset,
  } = usePresetPlayer({
    song: selectedSong,
    onNoteOn: handleNoteOn,
    onNoteOff: handleNoteOff,
  });

  const displayKeys = useMemo(() => {
    const s = new Set(activeKeys);
    presetActiveKeys.forEach((k) => s.add(k));
    return s;
  }, [activeKeys, presetActiveKeys]);

  const hasActiveKeys = displayKeys.size > 0;
  const autoPressure = useAutoPressure(hasActiveKeys);
  // Lid Pump: use lid pressure (0 when not connected). Auto: use key-driven pressure.
  const pressure = autoBellows
    ? autoPressure
    : connected
      ? lidPressure
      : 0;

  const keyboardOctaveOffset =
    playPreRecordedMode && isPlaying && displayOctaveOffset != null
      ? displayOctaveOffset
      : octaveOffset;

  const keyLabelNotation =
    playPreRecordedMode && selectedSong
      ? (selectedSong.notation ?? 'western')
      : keyLabelNotationCustom;
  const keyLabelTonic =
    playPreRecordedMode && selectedSong ? (selectedSong.tonic ?? 'C') : 'C';

  const activeNotes = useMemo(() => {
    const keyboardNotes = Array.from(activeKeys).flatMap((k) => {
      const n = getNoteForKey(k, octaveOffset);
      return n ? [n] : [];
    });
    const presetNotes = Array.from(presetActiveNotes);
    return Array.from(new Set([...keyboardNotes, ...presetNotes])).sort();
  }, [activeKeys, presetActiveNotes, octaveOffset]);

  React.useEffect(() => {
    let done = false;
    const onGesture = () => {
      if (done) return;
      done = true;
      audioRef.current?.resume?.();
      document.removeEventListener('click', onGesture);
      document.removeEventListener('keydown', onGesture);
    };
    document.addEventListener('click', onGesture);
    document.addEventListener('keydown', onGesture);
    return () => {
      document.removeEventListener('click', onGesture);
      document.removeEventListener('keydown', onGesture);
    };
  }, []);

  const handleStatusChange = useCallback((status: ConnectionStatus, error: string | null) => {
    setConnectionStatus(status);
    setErrorMessage(error);
  }, []);

  const applySongConfig = useCallback((songId: string) => {
    const song = PRESET_SONGS.find((s) => s.id === songId);
    setOctaveOffset(clampOctaveOffset(song?.defaultOctave ?? 0));
    setDrone({
      sa: song?.suggestedDrones?.includes('sa') ?? false,
      pa: song?.suggestedDrones?.includes('pa') ?? false,
      ma: song?.suggestedDrones?.includes('ma') ?? false,
    });
    setCouplerOn(false);
  }, []);

  const handleSongChange = useCallback(
    (value: string) => {
      setSelectedSongId(value);
      applySongConfig(value);
    },
    [applySongConfig]
  );

  const currentSongIndex = selectedSong ? PRESET_SONGS.findIndex((s) => s.id === selectedSong.id) : -1;
  const goNext = useCallback(() => {
    if (currentSongIndex >= 0 && currentSongIndex < PRESET_SONGS.length - 1) {
      const nextId = PRESET_SONGS[currentSongIndex + 1].id;
      setSelectedSongId(nextId);
      applySongConfig(nextId);
    }
  }, [currentSongIndex, applySongConfig]);

  const goPrev = useCallback(() => {
    if (currentSongIndex > 0) {
      const prevId = PRESET_SONGS[currentSongIndex - 1].id;
      setSelectedSongId(prevId);
      applySongConfig(prevId);
    }
  }, [currentSongIndex, applySongConfig]);

  const handleProgressClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!selectedSong) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const frac = (e.clientX - rect.left) / rect.width;
      setProgress(frac);
    },
    [selectedSong, setProgress]
  );

  const connectionButtonLabel =
    connectionStatus === 'error'
      ? 'Retry connection'
      : connectionStatus === 'connecting'
        ? 'Connecting…'
        : 'Connect lid sensor';

  const connectionStatusLabel =
    connectionStatus === 'connected'
      ? 'Connected'
      : connectionStatus === 'connecting'
        ? 'Connecting…'
        : connectionStatus === 'error'
          ? 'Error'
          : 'Not connected';

  const songOptions = useMemo(
    () =>
      PRESET_SONGS.map((s) => ({
        id: s.id,
        name: s.name,
        noteRange: s.noteRange,
        suggestedDrones: s.suggestedDrones,
        notation: s.notation,
        tonic: s.tonic,
      })),
    []
  );

  return (
    <div className="min-h-screen overflow-auto bg-gradient-to-b from-[#f8f4ee] via-[#ebe4d9] to-[#e5ddd0] font-sans flex flex-col items-center p-0">
      <AppHeader />

      {/* Action controls */}
      <ActionsBar
        onAngle={setLidAngle}
        onConnectionChange={setConnected}
        connectionStatus={connectionStatus}
        errorMessage={errorMessage}
        onStatusChange={handleStatusChange}
        connectionButtonLabel={connectionButtonLabel}
        connectionStatusLabel={connectionStatusLabel}
        autoBellows={autoBellows}
        onAutoBellowsChange={setAutoBellows}
        playPreRecordedMode={playPreRecordedMode}
        onPlayPreRecordedModeChange={(value) => {
          setPlayPreRecordedMode(value);
          if (value) {
            const firstId = PRESET_SONGS[0]?.id ?? 'custom';
            setSelectedSongId(firstId);
            if (firstId !== 'custom') applySongConfig(firstId);
          } else {
            setOctaveOffset(0);
            setDrone({ sa: false, pa: false, ma: false });
            setCouplerOn(false);
            setAutoBellows(false);
          }
        }}
        metricsOpen={metricsOpen}
        onMetricsOpenChange={(value) => setMetricsOpen(value)}
      />

      {/* Debug panel - fixed top right when open */}
      {metricsOpen && (
        <MetricsOverlay
          lidAngle={lidAngle}
          pressure={pressure}
          octaveOffset={keyboardOctaveOffset}
          activeNotes={activeNotes}
          keyLabelNotation={keyLabelNotation}
          tonic={keyLabelTonic}
        />
      )}

      {/* Playlist sidebar - fixed left, full height, when play mode is on */}
      <PlaylistSidebar
        open={playPreRecordedMode}
        songs={songOptions}
        selectedSongId={selectedSongId}
        onSongSelect={handleSongChange}
      />

      {/* Harmonium keyboard */}
      <main className="flex-1 flex flex-col items-center py-2 px-4 sm:px-6 w-full max-w-[1000px] min-w-0 min-h-0 overflow-x-auto overflow-y-auto">
        <KeyboardKeys
          activeKeys={displayKeys}
          octaveOffset={keyboardOctaveOffset}
          lidAngle={lidAngle}
          keyLabelNotation={keyLabelNotation}
          tonic={keyLabelTonic}
        />

        {/* Drone + Coupler controls */}
        <div className="mt-6">
          <DroneCouplerBar
            drone={drone}
            onDroneChange={(key, value) => setDrone((d) => ({ ...d, [key]: value }))}
            couplerOn={couplerOn}
            onCouplerChange={setCouplerOn}
            disabled={playPreRecordedMode}
          />
        </div>

        {/* Key notes + octave message below keyboard */}
        <div className="mt-6 flex flex-col items-center gap-1">
          <p className="text-[0.8rem] text-brand-muted text-center max-w-[420px]">
            White: A S D F G H J K · Black: W E T Y U
          </p>
          <p className="text-[0.75rem] text-brand-stone/80 text-center">
            Octave {4 + keyboardOctaveOffset} (
            {keyLabelNotation === 'sargam'
              ? `${westernNoteToSargam('C3', keyLabelTonic)}–${westernNoteToSargam('C6', keyLabelTonic)}`
              : 'C3–C6'}
            )
            {playPreRecordedMode
              ? isPlaying && displayOctaveOffset != null
                ? ' · follows playback'
                : ' · fixed for song'
              : ' · Z down · X up'}
          </p>
          {!playPreRecordedMode && (
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[0.7rem] text-brand-stone/70">Key labels:</span>
              <button
                type="button"
                onClick={() => setKeyLabelNotationCustom('western')}
                className={`px-2 py-0.5 rounded text-[0.7rem] ${
                  keyLabelNotationCustom === 'western'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-brand-stone/20 text-brand-stone/80 hover:bg-brand-stone/30'
                }`}
              >
                Notes
              </button>
              <button
                type="button"
                onClick={() => setKeyLabelNotationCustom('sargam')}
                className={`px-2 py-0.5 rounded text-[0.7rem] ${
                  keyLabelNotationCustom === 'sargam'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-brand-stone/20 text-brand-stone/80 hover:bg-brand-stone/30'
                }`}
              >
                Sargam
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Footer: always in layout with fixed min-height, hidden when not in play mode so harmonium doesn't jump */}
      <footer className="w-full min-h-[200px] flex flex-col items-center mt-auto shrink-0 overflow-hidden">
        <div
          className={`w-full transition-transform duration-300 ease-out ${
            playPreRecordedMode ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
          } ${!playPreRecordedMode ? 'pointer-events-none' : ''}`}
        >
          <PlayerBar
            progress={progress}
            onProgressSeek={handleProgressClick}
            selectedSong={selectedSong}
            onPrev={goPrev}
            onPlay={selectedSong ? (isPlaying ? pause : play) : () => {}}
            onNext={goNext}
            onReset={reset}
            isPlaying={isPlaying}
            hasEnded={hasEnded}
            currentSongIndex={currentSongIndex}
            songsCount={PRESET_SONGS.length}
          />
        </div>

        {errorMessage && (
          <p className="text-brand-error text-[0.85rem] font-medium mt-4 px-6 py-4 text-center">
            {errorMessage}
          </p>
        )}
      </footer>

      <KeyboardController
        onNoteOn={handleNoteOn}
        onNoteOff={handleNoteOff}
        setActiveKeys={setActiveKeys}
        octaveOffset={octaveOffset}
        setOctaveOffset={setOctaveOffset}
        canChangeOctave={!playPreRecordedMode}
      />

      <AudioEngine ref={audioRef} pressure={pressure} drone={drone} couplerOn={couplerOn} />
    </div>
  );
}

export default App;
