import React, { useRef, useEffect, useState } from 'react';

const PRESET_SRC = import.meta.env.VITE_HERO_VIDEO || '';

export default function ScrollVideoBG({
  children,
  mode = 'loop', // 'loop' | 'scrub'
  scrollLength = '300vh', // only applies in scrub mode
  overlay = 0.4,
  filter = 'grayscale(100%) brightness(0.7)',
  videoOpacity = 0.55,
  background = '#171618',
}) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const sectionRef = useRef(null);
  const rafRef = useRef(null);
  const targetTimeRef = useRef(0);
  const currentTimeRef = useRef(0);

  const [videoUrl, setVideoUrl] = useState(PRESET_SRC || null);
  const [ready, setReady] = useState(false);
  const [loadProgress, setLoadProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const usePreset = !!PRESET_SRC;
  const isScrub = mode === 'scrub';

  const handleFile = (file) => {
    if (!file || !file.type.startsWith('video/')) return;
    if (videoUrl && !usePreset) URL.revokeObjectURL(videoUrl);
    setReady(false);
    setLoadProgress(0);
    setVideoUrl(URL.createObjectURL(file));
  };

  const paint = () => {
    const v = videoRef.current, c = canvasRef.current;
    if (!v || !c || !v.videoWidth) return;
    const ctx = c.getContext('2d');
    if (c.width !== v.videoWidth) {
      c.width = v.videoWidth;
      c.height = v.videoHeight;
    }
    ctx.drawImage(v, 0, 0, c.width, c.height);
  };

  // load handlers
  useEffect(() => {
    const v = videoRef.current;
    if (!v || !videoUrl) return;
    v.muted = true;
    v.playsInline = true;
    v.preload = 'auto';
    v.loop = !isScrub;

    const onProgress = () => {
      if (v.buffered.length && v.duration) {
        setLoadProgress(v.buffered.end(v.buffered.length - 1) / v.duration);
      }
    };
    const onReady = () => {
      if (v.duration && !isNaN(v.duration)) {
        setLoadProgress(1);
        setReady(true);
        paint();
        if (!isScrub) {
          v.play().catch(() => {});
        }
      }
    };
    v.addEventListener('progress', onProgress);
    v.addEventListener('canplay', onReady);
    v.addEventListener('seeked', paint);
    v.load();
    return () => {
      v.removeEventListener('progress', onProgress);
      v.removeEventListener('canplay', onReady);
      v.removeEventListener('seeked', paint);
    };
  }, [videoUrl, isScrub]);

  // loop mode: paint each frame via rAF
  useEffect(() => {
    if (!ready || isScrub) return;
    let running = true;
    const tick = () => {
      if (!running) return;
      paint();
      requestAnimationFrame(tick);
    };
    tick();
    return () => { running = false; };
  }, [ready, isScrub]);

  // scrub mode: lerp playhead toward scroll target
  useEffect(() => {
    if (!ready || !isScrub) return;
    let running = true;
    const tick = () => {
      if (!running) return;
      const v = videoRef.current;
      if (v && v.duration) {
        const diff = targetTimeRef.current - currentTimeRef.current;
        if (Math.abs(diff) > 0.01) {
          const next = currentTimeRef.current + diff * 0.15;
          currentTimeRef.current = next;
          v.currentTime = next;
        }
      }
      requestAnimationFrame(tick);
    };
    tick();
    return () => { running = false; };
  }, [ready, isScrub]);

  // scrub mode: scroll → progress mapping
  useEffect(() => {
    if (!isScrub) return;
    const onScroll = () => {
      if (rafRef.current) return;
      rafRef.current = requestAnimationFrame(() => {
        const v = videoRef.current, s = sectionRef.current;
        if (v && s && v.duration) {
          const r = s.getBoundingClientRect();
          const scrollable = r.height - window.innerHeight;
          const p = Math.max(0, Math.min(1, -r.top / scrollable));
          targetTimeRef.current = p * v.duration;
        }
        rafRef.current = null;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [ready, isScrub]);

  const showUploader = !ready && !usePreset;
  const showBuffering = !ready && usePreset;

  // loop mode: single snap-aligned hero section
  if (!isScrub) {
    return (
      <>
        <video
          ref={videoRef}
          src={videoUrl || undefined}
          style={{ display: 'none' }}
          muted
          playsInline
          preload="auto"
          loop
        />

        {showUploader && (
          <DropOverlay
            isDragging={isDragging}
            setIsDragging={setIsDragging}
            handleFile={handleFile}
            videoUrl={videoUrl}
            loadProgress={loadProgress}
          />
        )}

        <section
          ref={sectionRef}
          className="wc-section"
          style={{
            position: 'relative',
            background,
            scrollSnapAlign: 'start',
          }}
        >
          <canvas
            ref={canvasRef}
            style={{
              position: 'absolute', inset: 0, width: '100%', height: '100%',
              objectFit: 'cover',
              transform: 'translateZ(0)', willChange: 'transform',
              opacity: ready ? videoOpacity : 0,
              filter,
              transition: 'opacity 0.6s ease',
            }}
          />
          <div style={{ position: 'absolute', inset: 0, background: `rgba(23,22,24,${overlay})`, pointerEvents: 'none' }} />
          {showBuffering && <BufferBar loadProgress={loadProgress} />}
          <div style={{ position: 'absolute', inset: 0, zIndex: 2 }}>{children}</div>
        </section>
      </>
    );
  }

  // scrub mode: tall section with sticky inner
  return (
    <>
      <video
        ref={videoRef}
        src={videoUrl || undefined}
        style={{ display: 'none' }}
        muted
        playsInline
        preload="auto"
      />

      {showUploader && (
        <DropOverlay
          isDragging={isDragging}
          setIsDragging={setIsDragging}
          handleFile={handleFile}
          videoUrl={videoUrl}
          loadProgress={loadProgress}
        />
      )}

      <section
        ref={sectionRef}
        style={{
          position: 'relative',
          height: ready ? scrollLength : '100dvh',
          background,
        }}
      >
        <div style={{
          position: 'sticky', top: 0, width: '100%', height: '100dvh',
          overflow: 'hidden', background,
        }}>
          <canvas
            ref={canvasRef}
            style={{
              position: 'absolute', inset: 0, width: '100%', height: '100%',
              objectFit: 'cover',
              transform: 'translateZ(0)', willChange: 'transform',
              opacity: ready ? videoOpacity : 0,
              filter,
              transition: 'opacity 0.6s ease',
            }}
          />
          <div style={{ position: 'absolute', inset: 0, background: `rgba(23,22,24,${overlay})`, pointerEvents: 'none' }} />
          {showBuffering && <BufferBar loadProgress={loadProgress} />}
          <div style={{ position: 'absolute', inset: 0, zIndex: 2 }}>{children}</div>
        </div>
      </section>
    </>
  );
}

function DropOverlay({ isDragging, setIsDragging, handleFile, videoUrl, loadProgress }) {
  return (
    <div
      onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleFile(e.dataTransfer.files?.[0]); }}
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: isDragging ? '#1f1a14' : '#171618',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
        fontFamily: "'Space Mono', ui-monospace, monospace", color: '#CFBFAA',
      }}
    >
      <div style={{
        border: `2px dashed ${isDragging ? '#CE703F' : 'rgba(207,191,170,0.25)'}`,
        borderRadius: 8, padding: '56px 40px', textAlign: 'center', maxWidth: 460, width: '100%',
      }}>
        <div style={{ fontSize: 22, letterSpacing: '0.3em', marginBottom: 8, color: videoUrl ? '#CE703F' : '#CFBFAA', textTransform: 'uppercase' }}>
          {videoUrl ? 'Buffering' : 'Drop Video Here'}
        </div>
        <div style={{ fontSize: 10, letterSpacing: '0.4em', opacity: 0.5, marginBottom: 28, textTransform: 'uppercase' }}>
          MP4 / WebM / MOV (H.264) · 9:16 · &lt;8MB
        </div>
        {!videoUrl && (
          <label style={{
            display: 'inline-block', padding: '12px 24px', border: '1px solid rgba(207,191,170,0.3)',
            borderRadius: 4, fontSize: 10, letterSpacing: '0.4em', cursor: 'pointer', textTransform: 'uppercase',
          }}>
            Or Pick A File
            <input type="file" accept="video/*" onChange={(e) => handleFile(e.target.files?.[0])} style={{ display: 'none' }} />
          </label>
        )}
        {videoUrl && (
          <div style={{ width: '100%', height: 3, background: 'rgba(207,191,170,0.1)', borderRadius: 2, overflow: 'hidden' }}>
            <div style={{ width: `${loadProgress * 100}%`, height: '100%', background: '#CE703F', transition: 'width 0.15s' }} />
          </div>
        )}
      </div>
    </div>
  );
}

function BufferBar({ loadProgress }) {
  return (
    <div style={{
      position: 'absolute', inset: 0, display: 'flex',
      alignItems: 'center', justifyContent: 'center', zIndex: 5,
    }}>
      <div style={{ width: 200, height: 2, background: 'rgba(207,191,170,0.1)', overflow: 'hidden' }}>
        <div style={{ width: `${loadProgress * 100}%`, height: '100%', background: '#CE703F', transition: 'width 0.15s' }} />
      </div>
    </div>
  );
}
