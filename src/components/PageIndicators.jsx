import React, { useEffect, useRef, useState } from 'react';

export default function PageIndicators() {
  const [activeIdx, setActiveIdx] = useState(0);
  const [count, setCount] = useState(0);
  const [visible, setVisible] = useState(false);
  const fadeTimer = useRef(0);
  const rafRef = useRef(0);

  useEffect(() => {
    const refreshCount = () => {
      const n = document.querySelectorAll('section.wc-section').length;
      setCount(n);
    };
    refreshCount();

    const apply = () => {
      rafRef.current = 0;
      const list = document.querySelectorAll('section.wc-section');
      let bestIdx = 0;
      let bestDist = Infinity;
      list.forEach((s, i) => {
        const d = Math.abs(s.getBoundingClientRect().top);
        if (d < bestDist) { bestDist = d; bestIdx = i; }
      });
      setActiveIdx(bestIdx);
    };

    const onScroll = () => {
      setVisible(true);
      clearTimeout(fadeTimer.current);
      fadeTimer.current = window.setTimeout(() => setVisible(false), 600);
      if (!rafRef.current) rafRef.current = requestAnimationFrame(apply);
    };

    apply();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', refreshCount);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', refreshCount);
      clearTimeout(fadeTimer.current);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  if (!count) return null;
  return (
    <div className={`wc-pageind ${visible ? 'is-visible' : ''}`} aria-hidden>
      {Array.from({ length: count }).map((_, i) => (
        <span
          key={i}
          className={`wc-pageind-dot ${i === activeIdx ? 'active' : ''}`}
        />
      ))}
    </div>
  );
}
