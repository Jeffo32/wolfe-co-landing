import React, { useEffect, useRef } from 'react';
import { useMedia } from '../media/MediaContext.jsx';

// Renders an absolutely-positioned background (video loop or image) for a section.
// Falls back to a solid bg when nothing is assigned.
export default function SectionMedia({
  id,
  overlay = 0.4,
  filter = 'grayscale(100%) brightness(0.7)',
  videoOpacity = 0.55,
  imageOpacity = 0.7,
  background = '#171618',
  fallback,         // optional element to render when no media
}) {
  const { media, mediaOffsets, mediaBlurs } = useMedia();
  const entry = media[id];
  const offsetY = mediaOffsets[id] ?? 50; // 0 = top, 50 = center, 100 = bottom
  const blur = mediaBlurs[id] ?? 0;
  const composedFilter = blur > 0 ? `${filter} blur(${blur}px)` : filter;
  const videoRef = useRef(null);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = true;
    v.playsInline = true;
    v.loop = true;
    const tryPlay = () => v.play().catch(() => {});
    if (v.readyState >= 2) tryPlay();
    else v.addEventListener('canplay', tryPlay, { once: true });
    return () => v.removeEventListener('canplay', tryPlay);
  }, [entry?.url]);

  return (
    <>
      <div style={{ position: 'absolute', inset: 0, background, zIndex: 0 }} />
      {entry?.type === 'video' && (
        <video
          ref={videoRef}
          src={entry.url}
          autoPlay
          loop
          muted
          playsInline
          style={{
            position: 'absolute', inset: 0, width: '100%', height: '100%',
            objectFit: 'cover',
            objectPosition: `center ${offsetY}%`,
            opacity: videoOpacity,
            filter: composedFilter,
            zIndex: 0,
          }}
        />
      )}
      {entry?.type === 'image' && (
        <div
          style={{
            position: 'absolute', inset: 0,
            backgroundImage: `url("${entry.url}")`,
            backgroundSize: 'cover',
            backgroundPosition: `center ${offsetY}%`,
            opacity: imageOpacity,
            filter: composedFilter,
            zIndex: 0,
          }}
        />
      )}
      {!entry && fallback && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 1 }}>{fallback}</div>
      )}
      <div style={{
        position: 'absolute', inset: 0,
        background: `rgba(23,22,24,${overlay})`,
        pointerEvents: 'none',
        zIndex: 1,
      }} />
    </>
  );
}
