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
    // Pixel-measured ochre-dot positions for each preset logo (square 1254px source).
    const isHead = logo.url?.includes('head');
    const isWMark = logo.url?.includes('w-no-bg');
    const orb = isHead
      ? { topPct: 69.62, diameterPct: 2.5 }
      : isWMark
      ? { topPct: 28.83, diameterPct: 2.95 }
      : null;
    const showOrb = !ignoreScale && final >= 80 && orb;
    const orbSize = showOrb ? Math.max(6, final * (orb.diameterPct / 100)) : 0;

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
              top: `${orb.topPct}%`,
              width: orbSize,
              height: orbSize,
            }}
          >
            <span className="wc-orb-spec" />
          </span>
        )}
      </div>
    );
  }
  return <SvgMark size={final} />;
}
