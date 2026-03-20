export function parseLidAngleFromReport(data: DataView): number {
  if (data.byteLength < 1) return 0;
  const raw = data.getUint8(0);
  return (raw / 255) * 180;
}
