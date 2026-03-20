import React from 'react';

type Props = {
  className?: string;
  /** Width; height scales to match. */
  size?: number;
};

/** LidMonium logo: 3 keys in a row, same size, attached; middle key is dark. */
export function Logo({ className = '', size = 40 }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <rect x="2" y="4" width="12" height="28" rx="2" fill="#eae3d8" stroke="#d2c9bc" strokeWidth="0.6" />
      <rect x="3" y="5" width="10" height="1.2" rx="0.6" fill="rgba(255,255,255,0.5)" />
      <rect x="14" y="4" width="12" height="28" rx="2" fill="#2c1810" />
      <rect x="26" y="4" width="12" height="28" rx="2" fill="#eae3d8" stroke="#d2c9bc" strokeWidth="0.6" />
      <rect x="27" y="5" width="10" height="1.2" rx="0.6" fill="rgba(255,255,255,0.5)" />
    </svg>
  );
}
