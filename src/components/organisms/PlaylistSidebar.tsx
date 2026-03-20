import React from 'react';
import { Music } from 'lucide-react';

export type SongOption = {
  id: string;
  name: string;
  noteRange?: string;
  suggestedDrones?: string[];
  notation?: 'western' | 'sargam';
  tonic?: string;
};

type Props = {
  open: boolean;
  songs: SongOption[];
  selectedSongId: string;
  onSongSelect: (id: string) => void;
};

export function PlaylistSidebar({ open, songs, selectedSongId, onSongSelect }: Props) {
  return (
    <aside
      className={`fixed top-0 left-0 z-40 h-screen w-56 bg-brand-dark/[0.08] border-r-2 border-brand-dark/10 shadow-lg overflow-y-auto transition-transform duration-300 ease-out ${
        open ? 'translate-x-0' : '-translate-x-full'
      } ${!open ? 'pointer-events-none' : ''}`}
      aria-label="Playlist"
      aria-hidden={!open}
    >
      <div className="p-4">
        <div className="flex items-center gap-2 mb-4 text-brand-muted">
          <Music className="w-5 h-5" strokeWidth={2} />
          <h2 className="text-sm font-semibold uppercase tracking-wider">Songs</h2>
        </div>
        <nav className="flex flex-col gap-1">
          {songs.map((song) => (
            <button
              key={song.id}
              type="button"
              onClick={() => onSongSelect(song.id)}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                selectedSongId === song.id
                  ? 'bg-primary text-primary-foreground'
                  : 'text-brand-dark hover:bg-brand-dark/10'
              }`}
            >
              <span className="block">{song.name}</span>
              {(song.noteRange || song.suggestedDrones?.length || song.notation === 'sargam') && (
                <span className="block text-[0.7rem] opacity-80 mt-0.5">
                  {[
                    song.notation === 'sargam' ? `Sargam · Sa=${song.tonic ?? 'C'}` : null,
                    song.noteRange,
                    song.suggestedDrones?.length ? `Drones: ${song.suggestedDrones.join(', ')}` : null,
                  ]
                    .filter(Boolean)
                    .join(' · ')}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>
    </aside>
  );
}
