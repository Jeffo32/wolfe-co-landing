import React from 'react';
import { useMedia } from '../media/MediaContext.jsx';

const SvgMark = ({ size }) => (
  <svg
    width={size}
    height={size * 0.92}
    viewBox="0 0 100 92"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-label="Wolfe Co"
  >
    <path
      d="M4 6 L24 86 L42 30 L50 30 L58 30 L76 86 L96 6"
      stroke="#CFBFAA"
      strokeWidth="1.5"
      strokeLinecap="square"
      strokeLinejoin="miter"
      fill="none"
    />
  </svg>
);

export default function WolfeMark({ size = 96, ignoreScale = false }) {
  const { logo, logoScale } = useMedia();
  const scale = ignoreScale ? 1 : (logoScale ?? 1);
  const final = size * scale;
  if (logo?.url) {
    // Show animated power orb only on the large hero instance, not the tiny footer mark.
    const showOrb = !ignoreScale && final >= 80;
    // Wolf-head logo: dot sits roughly mid-line. W-mark logo: dot sits near top.
    const orbTopPct = logo.url?.includes('head') ? 65 : 16;
    return (
      <div
        style={{
          position: 'relative',
          width: final,
          height: final,
          display: 'block',
        }}
      >
        <img
          src={logo.url}
          alt="Wolfe Co"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            display: 'block',
          }}
        />
        {showOrb && (
          <span
            aria-hidden
            className="wc-orb"
            style={{
              position: 'absolute',
              left: '50%',
              top: `${orbTopPct}%`,
              width: Math.max(8, final * 0.022),
              height: Math.max(8, final * 0.022),
            }}
          />
        )}
      </div>
    );
  }
  return <SvgMark size={final} />;
}
