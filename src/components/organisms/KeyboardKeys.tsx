import React from 'react';
import {
  KEY_TO_BASE_NOTE,
  KEYS_WHITE,
  KEYS_BLACK,
  applyOctave,
} from '../../constants/keyMap';
import {
  TOTAL_WHITE_WIDTH,
  WHITE_KEY_HEIGHT,
  BLACK_KEY_HEIGHT,
  BLACK_KEY_WIDTH,
  BELLOWS_HEIGHT,
  KEY_WIDTH,
  KEY_GAP,
  BLACK_LEFT_OFFSETS,
  getBellowsClipPath,
} from '../../constants/keyboardLayout';
import { westernNoteToSargam } from '../../utils/sargam';

export type KeyLabelNotation = 'western' | 'sargam';

type Props = {
  activeKeys: Set<string>;
  octaveOffset: number;
  lidAngle: number | null;
  /** Show key labels as Western (C4) or Sargam (Sa, Re). When sargam, tonic is used for conversion. */
  keyLabelNotation?: KeyLabelNotation;
  /** Western pitch class of Sa, e.g. "C". Used when keyLabelNotation is 'sargam'. */
  tonic?: string;
};

export function KeyboardKeys({
  activeKeys,
  octaveOffset,
  lidAngle,
  keyLabelNotation = 'western',
  tonic = 'C',
}: Props) {
  const getKeyLabel = (key: string) => {
    const note = applyOctave(KEY_TO_BASE_NOTE[key], octaveOffset);
    return keyLabelNotation === 'sargam' ? westernNoteToSargam(note, tonic) : note;
  };
  return (
    <div
      className="relative flex flex-col items-center w-full mx-auto px-2"
      style={{ maxWidth: TOTAL_WHITE_WIDTH + 16 }}
    >
      <div
        className="w-full mb-3 relative"
        style={{ width: TOTAL_WHITE_WIDTH, height: BELLOWS_HEIGHT, marginTop: 0 }}
      >
        <div
          className="absolute left-0 bottom-0 w-full h-full bg-gradient-to-br from-[#2a221a] via-[#1e1812] to-[#252018] transition-[clip-path] duration-75 ease-out shadow-md"
          style={{ clipPath: getBellowsClipPath(lidAngle) }}
        />
      </div>
      <div
        className="relative flex flex-col items-center"
        style={{ width: TOTAL_WHITE_WIDTH }}
      >
        <div
          className="flex w-full justify-center rounded-b-lg overflow-visible bg-gradient-to-b from-[#352a20] to-[#2c1810] pt-1 px-1 border border-t-0 border-black/20"
          style={{
            boxShadow:
              '0 8px 24px rgba(0,0,0,0.2), 0 2px 0 rgba(255,255,255,0.04) inset',
          }}
        >
          {KEYS_WHITE.map((key, idx) => (
            <div
              key={key}
              className={`flex flex-col items-center justify-end pb-2 gap-0 rounded-b-md border-t-0 transition-colors duration-75 flex-shrink-0 ${
                activeKeys.has(key)
                  ? 'bg-gradient-to-b from-[#e0d9ce] to-[#d2c9bc] border border-[rgba(60,45,35,0.2)] shadow-[inset_0_2px_6px_rgba(50,40,30,0.25)]'
                  : 'bg-gradient-to-b from-[#fffef8] via-[#f5efe6] to-[#eae3d8] border border-[rgba(60,45,35,0.2)] shadow-[inset_1px_0_0_rgba(255,255,255,0.9),inset_0_1px_0_rgba(255,255,255,0.5)]'
              }`}
              style={{
                width: KEY_WIDTH,
                height: WHITE_KEY_HEIGHT,
                marginRight: idx < KEYS_WHITE.length - 1 ? KEY_GAP : 0,
              }}
            >
              <span className="text-[0.8rem] font-bold text-[#55483d] leading-none tracking-tight">
                {key.toUpperCase()}
              </span>
              <span className="text-[0.65rem] font-medium text-[#55483d] opacity-90 leading-none">
                {getKeyLabel(key)}
              </span>
            </div>
          ))}
        </div>
        <div className="absolute top-0 left-0 w-full h-0 pointer-events-none">
          {KEYS_BLACK.map((key, i) => (
            <div
              key={key}
              className={`absolute top-0 flex flex-col items-center justify-end pb-2 gap-0 rounded-b-sm pointer-events-auto z-10 transition-colors duration-75 ${
                activeKeys.has(key)
                  ? 'bg-gradient-to-b from-[#5a4a42] to-[#2c1810]'
                  : 'bg-gradient-to-b from-[#2a1e16] to-[#1a120c]'
              }`}
              style={{
                left: BLACK_LEFT_OFFSETS[i],
                width: BLACK_KEY_WIDTH,
                height: BLACK_KEY_HEIGHT,
                boxShadow:
                  '0 2px 6px rgba(0,0,0,0.4), 0 1px 0 rgba(255,255,255,0.06) inset',
                border: '1px solid rgba(0,0,0,0.4)',
              }}
            >
              <span className="text-[0.7rem] font-bold text-white/90 leading-none">
                {key.toUpperCase()}
              </span>
              <span className="text-[0.55rem] font-medium text-white/80 leading-none">
                {getKeyLabel(key)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
