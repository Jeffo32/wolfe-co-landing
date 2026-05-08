import React, { useEffect, useState } from 'react';
import { useMedia, SECTION_LIST, LOGO_PRESETS } from '../media/MediaContext.jsx';

export default function BackgroundEditor() {
  const {
    media, setFromFile, clearSection, editorOpen, setEditorOpen,
    logo, logoLibrary, addLogoToLibrary, pickLogo, clearLogo, removeLogoFromLibrary,
    logoScale, setLogoScale,
    textScale, setTextScale,
    tagY, setTagY,
    mediaOffsets, setMediaOffset,
  } = useMedia();

  // Toggle hotkey: B
  useEffect(() => {
    const onKey = (e) => {
      if (e.target.matches('input, textarea')) return;
      if (e.key === 'b' || e.key === 'B') setEditorOpen((o) => !o);
      if (e.key === 'Escape') setEditorOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [setEditorOpen]);

  return (
    <>
      {/* Floating BG button removed in v2 — editor still accessible via B key. */}

      <aside
        style={{
          position: 'fixed',
          top: 0, right: 0, bottom: 0,
          width: 'min(380px, 92vw)',
          background: 'rgba(23,22,24,0.98)',
          borderLeft: '1px solid rgba(207,191,170,0.12)',
          backdropFilter: 'blur(8px)',
          transform: editorOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.28s ease',
          zIndex: 9999,
          color: '#CFBFAA',
          fontFamily: "'Space Mono', monospace",
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        <header style={{
          padding: '20px 22px',
          borderBottom: '1px solid rgba(207,191,170,0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ fontSize: 9, letterSpacing: '0.4em', opacity: 0.5, textTransform: 'uppercase' }}>
              Wolfe Co · Editor
            </div>
            <div style={{
              fontFamily: "'Inter Tight', sans-serif",
              fontWeight: 800,
              fontSize: 18,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              marginTop: 4,
            }}>
              Section Backgrounds
            </div>
          </div>
          <button
            onClick={() => setEditorOpen(false)}
            style={{
              background: 'none', border: 'none',
              color: '#CFBFAA', cursor: 'pointer',
              fontSize: 18, opacity: 0.6,
              padding: 4,
            }}
            aria-label="Close editor"
          >×</button>
        </header>

        <div style={{ overflowY: 'auto', flex: 1, padding: '14px 18px 28px' }}>
          <LogoBlock
            logo={logo}
            presets={LOGO_PRESETS}
            library={logoLibrary}
            onUpload={addLogoToLibrary}
            onPick={pickLogo}
            onClear={clearLogo}
            onRemove={removeLogoFromLibrary}
            scale={logoScale}
            setScale={setLogoScale}
          />

          <LayoutBlock
            textScale={textScale} setTextScale={setTextScale}
            tagY={tagY} setTagY={setTagY}
          />

          <div style={{
            margin: '20px 0 8px',
            fontSize: 9,
            letterSpacing: '0.4em',
            opacity: 0.4,
            textTransform: 'uppercase',
          }}>Sections</div>

          {SECTION_LIST.map((s, i) => (
            <SectionRow
              key={s.id}
              section={s}
              index={i + 1}
              entry={media[s.id]}
              onFile={(f) => setFromFile(s.id, f)}
              onClear={() => clearSection(s.id)}
              offsetY={mediaOffsets[s.id] ?? 50}
              setOffsetY={(v) => setMediaOffset(s.id, v)}
            />
          ))}

          <div style={{
            marginTop: 22,
            padding: '14px 16px',
            border: '1px solid rgba(207,191,170,0.08)',
            borderRadius: 4,
            fontSize: 10,
            lineHeight: 1.7,
            letterSpacing: '0.04em',
            opacity: 0.55,
          }}>
            <div style={{ color: '#CE703F', letterSpacing: '0.3em', textTransform: 'uppercase', fontSize: 9, marginBottom: 8 }}>
              Notes
            </div>
            Press <span style={{ color: '#CE703F' }}>B</span> to toggle. Files stay only for this session.
            For prod, set <span style={{ color: '#CE703F' }}>VITE_BG_&lt;ID&gt;</span> env vars
            (e.g. <span style={{ color: '#CE703F' }}>VITE_BG_HERO=/hero.mp4</span>) and drop assets in <span style={{ color: '#CE703F' }}>/public</span>.
          </div>
        </div>
      </aside>
    </>
  );
}

function SectionRow({ section, index, entry, onFile, onClear, offsetY, setOffsetY }) {
  const [drag, setDrag] = useState(false);
  const num = String(index).padStart(2, '0');

  return (
    <div style={{
      borderTop: index === 1 ? 'none' : '1px solid rgba(207,191,170,0.06)',
      padding: '16px 4px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
          <span style={{ fontSize: 9, letterSpacing: '0.4em', opacity: 0.4 }}>{num}</span>
          <span style={{
            fontFamily: "'Inter Tight', sans-serif",
            fontWeight: 700,
            fontSize: 13,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
          }}>{section.label}</span>
        </div>
        <span style={{
          fontSize: 8,
          letterSpacing: '0.3em',
          textTransform: 'uppercase',
          color: entry ? '#CE703F' : 'rgba(207,191,170,0.4)',
        }}>
          {entry ? entry.type : section.defaultType}
          {entry?.source === 'env' && ' · env'}
        </span>
      </div>

      <label
        onDrop={(e) => { e.preventDefault(); setDrag(false); onFile(e.dataTransfer.files?.[0]); }}
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        style={{
          display: 'block',
          border: `1px dashed ${drag ? '#CE703F' : 'rgba(207,191,170,0.18)'}`,
          background: drag ? 'rgba(206,112,63,0.08)' : 'transparent',
          padding: '14px 12px',
          borderRadius: 4,
          textAlign: 'center',
          fontSize: 9,
          letterSpacing: '0.3em',
          textTransform: 'uppercase',
          cursor: 'pointer',
          transition: 'border-color 0.2s ease, background 0.2s ease',
          color: '#CFBFAA',
        }}
      >
        {entry?.name || (entry ? entry.url.split('/').pop() : 'Drop or click — image / video')}
        <input
          type="file"
          accept="image/*,video/*"
          onChange={(e) => onFile(e.target.files?.[0])}
          style={{ display: 'none' }}
        />
      </label>

      {entry && (
        <>
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <Preview entry={entry} />
            <button
              onClick={onClear}
              style={{
                flex: 1,
                background: 'none',
                border: '1px solid rgba(207,191,170,0.15)',
                color: 'rgba(207,191,170,0.7)',
                fontFamily: "'Space Mono', monospace",
                fontSize: 9,
                letterSpacing: '0.3em',
                textTransform: 'uppercase',
                padding: '8px 10px',
                cursor: 'pointer',
                borderRadius: 3,
              }}
            >Clear</button>
          </div>
          <Slider
            label="Y Position"
            value={offsetY}
            min={0}
            max={100}
            step={1}
            onChange={setOffsetY}
            valueFormatter={(v) => `${Math.round(v)}%`}
            leftLabel="Top"
            rightLabel="Bottom"
            onReset={() => setOffsetY(50)}
            isDefault={offsetY === 50}
            marginTop={10}
          />
        </>
      )}
    </div>
  );
}

function LayoutBlock({ textScale, setTextScale, tagY, setTagY }) {
  return (
    <div style={{
      padding: '14px 4px 4px',
      borderBottom: '1px solid rgba(207,191,170,0.08)',
      marginBottom: 6,
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'baseline',
        gap: 10,
        marginBottom: 14,
      }}>
        <span style={{ fontSize: 9, letterSpacing: '0.4em', opacity: 0.4 }}>—</span>
        <span style={{
          fontFamily: "'Inter Tight', sans-serif",
          fontWeight: 700,
          fontSize: 13,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
        }}>Layout</span>
      </div>

      <Slider
        label="Text Scale"
        value={textScale}
        min={0.7}
        max={2.5}
        step={0.05}
        onChange={setTextScale}
        valueFormatter={(v) => `${v.toFixed(2)}×`}
        leftLabel="0.7×"
        rightLabel="2.5×"
        onReset={() => setTextScale(1)}
        isDefault={textScale === 1}
      />

      <Slider
        label="Hero Tagline Y"
        value={tagY}
        min={-200}
        max={200}
        step={1}
        onChange={setTagY}
        valueFormatter={(v) => `${Math.round(v)}px`}
        leftLabel="−200"
        rightLabel="+200"
        onReset={() => setTagY(0)}
        isDefault={tagY === 0}
        marginTop={14}
      />
    </div>
  );
}

function Slider({
  label, value, min, max, step, onChange, valueFormatter,
  leftLabel, rightLabel, onReset, isDefault, marginTop = 0,
}) {
  return (
    <div style={{ marginTop }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 6,
      }}>
        <span style={{
          fontSize: 9, letterSpacing: '0.4em', opacity: 0.5, textTransform: 'uppercase',
        }}>{label}</span>
        <span style={{
          fontFamily: "'Inter Tight', sans-serif",
          fontWeight: 700,
          fontSize: 11,
          color: '#CE703F',
          fontVariantNumeric: 'tabular-nums',
        }}>{valueFormatter ? valueFormatter(value) : value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        onMouseDown={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
        style={{ width: '100%', accentColor: '#CE703F', cursor: 'pointer' }}
      />
      <div style={{
        display: 'flex', justifyContent: 'space-between', marginTop: 2,
        fontSize: 8, letterSpacing: '0.3em', opacity: 0.4, textTransform: 'uppercase',
      }}>
        <span>{leftLabel}</span>
        {onReset && (
          <button
            onClick={onReset}
            style={{
              background: 'none', border: 'none', padding: 0, cursor: 'pointer',
              fontSize: 8, letterSpacing: '0.3em', color: '#CFBFAA',
              opacity: isDefault ? 0.3 : 0.7, textTransform: 'uppercase',
              fontFamily: "'Space Mono', monospace",
            }}
          >Reset</button>
        )}
        <span>{rightLabel}</span>
      </div>
    </div>
  );
}

function Preview({ entry }) {
  const style = { width: 64, height: 40, objectFit: 'cover', borderRadius: 3, background: '#000', flexShrink: 0 };
  if (entry.type === 'video') return <video src={entry.url} muted autoPlay loop playsInline style={style} />;
  return <img src={entry.url} alt="" style={style} />;
}

function LogoBlock({ logo, presets = [], library, onUpload, onPick, onClear, onRemove, scale, setScale }) {
  const [drag, setDrag] = useState(false);
  const [presetErrors, setPresetErrors] = useState({});

  const handleFiles = (files) => {
    Array.from(files || []).forEach((f) => onUpload(f));
  };

  const isActive = (entry) => entry && logo && entry.id === logo.id;
  const isSvgActive = !logo;

  return (
    <div style={{ padding: '4px 4px 0' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
          <span style={{ fontSize: 9, letterSpacing: '0.4em', opacity: 0.4 }}>00</span>
          <span style={{
            fontFamily: "'Inter Tight', sans-serif",
            fontWeight: 700,
            fontSize: 13,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
          }}>Logo</span>
        </div>
        <span style={{
          fontSize: 8,
          letterSpacing: '0.3em',
          textTransform: 'uppercase',
          color: logo ? '#CE703F' : 'rgba(207,191,170,0.4)',
        }}>
          {logo ? (logo.source === 'env' ? 'image · env' : 'image') : 'svg default'}
        </span>
      </div>

      <label
        onDrop={(e) => { e.preventDefault(); setDrag(false); handleFiles(e.dataTransfer.files); }}
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        style={{
          display: 'block',
          border: `1px dashed ${drag ? '#CE703F' : 'rgba(207,191,170,0.18)'}`,
          background: drag ? 'rgba(206,112,63,0.08)' : 'transparent',
          padding: '14px 12px',
          borderRadius: 4,
          textAlign: 'center',
          fontSize: 9,
          letterSpacing: '0.3em',
          textTransform: 'uppercase',
          cursor: 'pointer',
          color: '#CFBFAA',
        }}
      >
        Drop or click — add logo (image)
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => handleFiles(e.target.files)}
          style={{ display: 'none' }}
        />
      </label>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(72px, 1fr))',
        gap: 8,
        marginTop: 12,
      }}>
        <LogoTile
          active={isSvgActive}
          onClick={onClear}
          label="SVG"
        >
          <svg width="32" height="30" viewBox="0 0 100 92" fill="none">
            <path d="M4 6 L24 86 L42 30 L50 30 L58 30 L76 86 L96 6"
              stroke="#CFBFAA" strokeWidth="1.5" strokeLinecap="square" strokeLinejoin="miter" fill="none" />
          </svg>
        </LogoTile>

        {presets.map((entry) => (
          <LogoTile
            key={entry.id}
            active={isActive(entry)}
            onClick={() => onPick(entry)}
            label={presetErrors[entry.id] ? 'missing' : entry.name}
          >
            {presetErrors[entry.id] ? (
              <span style={{ fontSize: 9, color: 'rgba(207,191,170,0.5)', textAlign: 'center', lineHeight: 1.3 }}>
                drop file at<br/>{entry.url}
              </span>
            ) : (
              <img
                src={entry.url}
                alt={entry.name}
                onError={() => setPresetErrors((p) => ({ ...p, [entry.id]: true }))}
                style={{ maxWidth: '100%', maxHeight: 44, objectFit: 'contain' }}
              />
            )}
          </LogoTile>
        ))}

        {library.map((entry) => (
          <LogoTile
            key={entry.id}
            active={isActive(entry)}
            onClick={() => onPick(entry)}
            onRemove={entry.source === 'object' ? () => onRemove(entry.id) : undefined}
          >
            <img src={entry.url} alt="" style={{ maxWidth: '100%', maxHeight: 44, objectFit: 'contain' }} />
          </LogoTile>
        ))}
      </div>

      <div style={{ marginTop: 18 }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 8,
        }}>
          <span style={{
            fontSize: 9, letterSpacing: '0.4em', opacity: 0.5, textTransform: 'uppercase',
          }}>Size</span>
          <span style={{
            fontFamily: "'Inter Tight', sans-serif",
            fontWeight: 700,
            fontSize: 12,
            color: '#CE703F',
            fontVariantNumeric: 'tabular-nums',
          }}>{scale.toFixed(2)}×</span>
        </div>
        <input
          type="range"
          min="0.5"
          max="8"
          step="0.05"
          value={scale}
          onChange={(e) => setScale(parseFloat(e.target.value))}
          onMouseDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
          style={{
            width: '100%',
            accentColor: '#CE703F',
            cursor: 'pointer',
          }}
        />
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: 4,
          fontSize: 8,
          letterSpacing: '0.3em',
          opacity: 0.4,
          textTransform: 'uppercase',
        }}>
          <span>0.5×</span>
          <button
            onClick={() => setScale(1)}
            style={{
              background: 'none', border: 'none', padding: 0, cursor: 'pointer',
              fontSize: 8, letterSpacing: '0.3em', color: '#CFBFAA',
              opacity: scale === 1 ? 0.3 : 0.7, textTransform: 'uppercase',
              fontFamily: "'Space Mono', monospace",
            }}
          >Reset</button>
          <span>8×</span>
        </div>
      </div>
    </div>
  );
}

function LogoTile({ active, onClick, onRemove, label, children }) {
  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={onClick}
        style={{
          width: '100%',
          aspectRatio: '1 / 1',
          background: '#0f0e10',
          border: `1px solid ${active ? '#CE703F' : 'rgba(207,191,170,0.12)'}`,
          borderRadius: 4,
          cursor: 'pointer',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 4,
          padding: 6,
          transition: 'border-color 0.15s ease',
        }}
      >
        {children}
        {label && (
          <span style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: 7,
            letterSpacing: '0.3em',
            color: active ? '#CE703F' : 'rgba(207,191,170,0.5)',
            textTransform: 'uppercase',
          }}>{label}</span>
        )}
      </button>
      {onRemove && (
        <button
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
          aria-label="Remove logo"
          style={{
            position: 'absolute',
            top: -6, right: -6,
            width: 18, height: 18,
            background: '#171618',
            border: '1px solid rgba(207,191,170,0.3)',
            borderRadius: 999,
            color: '#CFBFAA',
            fontSize: 11,
            lineHeight: 1,
            cursor: 'pointer',
            padding: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >×</button>
      )}
    </div>
  );
}
