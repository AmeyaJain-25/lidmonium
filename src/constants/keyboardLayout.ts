export const KEY_WIDTH = 52;
export const KEY_GAP = 3;
export const TOTAL_WHITE_WIDTH = 8 * KEY_WIDTH + 7 * KEY_GAP;
export const WHITE_KEY_HEIGHT = 150;
export const BLACK_KEY_HEIGHT = 90;
export const BLACK_KEY_WIDTH = 30;
export const BELLOWS_HEIGHT = 36;
export const LID_ANGLE_MIN = 45;
export const LID_ANGLE_MAX = 95;

export function getBellowsClipPath(lidAngle: number | null): string {
  const frac =
    lidAngle == null
      ? 1
      : Math.max(0, Math.min(1, (lidAngle - LID_ANGLE_MIN) / (LID_ANGLE_MAX - LID_ANGLE_MIN)));
  const apexY = (1 - frac) * 100;
  return `polygon(0% ${apexY}%, 100% 100%, 0% 100%)`;
}

export const BLACK_LEFT_OFFSETS = [
  (KEY_WIDTH + KEY_GAP) * 1 - BLACK_KEY_WIDTH / 2,
  (KEY_WIDTH + KEY_GAP) * 2 - BLACK_KEY_WIDTH / 2,
  (KEY_WIDTH + KEY_GAP) * 4 - BLACK_KEY_WIDTH / 2,
  (KEY_WIDTH + KEY_GAP) * 5 - BLACK_KEY_WIDTH / 2,
  (KEY_WIDTH + KEY_GAP) * 6 - BLACK_KEY_WIDTH / 2,
];
