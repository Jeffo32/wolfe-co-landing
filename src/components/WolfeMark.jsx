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
    return (
      <img
        src={logo.url}
        alt="Wolfe Co"
        style={{
          width: final,
          height: final,
          objectFit: 'contain',
          display: 'block',
        }}
      />
    );
  }
  return <SvgMark size={final} />;
}
