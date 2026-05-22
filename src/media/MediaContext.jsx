import React, { createContext, useContext, useState, useCallback, useEffect, useMemo, useRef } from 'react';

// Section ids must match the section ids used in App.jsx
export const SECTION_LIST = [
  { id: 'hero',         label: 'Hero',         defaultType: 'video', defaultOverlay: 0.4  },
  { id: 'statement',    label: 'Statement',    defaultType: 'image', defaultOverlay: 0.55 },
  { id: 'divisions',    label: 'Divisions',    defaultType: 'solid', defaultOverlay: 0    },
  { id: 'capabilities', label: 'Capabilities', defaultType: 'image', defaultOverlay: 0.4  },
  { id: 'offers',       label: 'Offers',       defaultType: 'solid', defaultOverlay: 0    },
  { id: 'availability', label: 'Availability', defaultType: 'solid', defaultOverlay: 0    },
  { id: 'proof',        label: 'Proof',        defaultType: 'image', defaultOverlay: 0.65 },
  { id: 'cta',          label: 'CTA',          defaultType: 'solid', defaultOverlay: 0    },
];

// Build initial state from VITE_BG_<ID> env vars when available.
// Format: VITE_BG_HERO=/hero.mp4 (extension determines image/video)
const VIDEO_EXT = /\.(mp4|webm|mov|m4v)(\?|#|$)/i;
const IMAGE_EXT = /\.(jpe?g|png|webp|avif|gif)(\?|#|$)/i;

const buildInitial = () => {
  const out = {};
  SECTION_LIST.forEach(({ id }) => {
    const envKey = `VITE_BG_${id.toUpperCase()}`;
    const url = import.meta.env[envKey];
    if (url) {
      const type = VIDEO_EXT.test(url) ? 'video' : IMAGE_EXT.test(url) ? 'image' : null;
      if (type) out[id] = { type, url, source: 'env' };
    }
  });
  // Back-compat: VITE_HERO_VIDEO maps to hero
  if (!out.hero && import.meta.env.VITE_HERO_VIDEO) {
    out.hero = { type: 'video', url: import.meta.env.VITE_HERO_VIDEO, source: 'env' };
  }
  return out;
};

// Hard-wired preset logos. Drop matching files into public/logos/.
export const LOGO_PRESETS = [
  { id: 'preset-w',    url: '/logos/Wolfe-co-w-no-bg.png', name: 'W Mark',    source: 'preset' },
  { id: 'preset-head', url: '/logos/Wolfe-co-head.png',    name: 'Wolf Head', source: 'preset' },
];

const buildInitialLogo = () => {
  if (import.meta.env.VITE_LOGO) {
    return { url: import.meta.env.VITE_LOGO, source: 'env', id: 'env' };
  }
  return LOGO_PRESETS.find((p) => p.id === 'preset-head') || null;
};

const buildInitialScale = () => {
  const v = parseFloat(import.meta.env.VITE_LOGO_SCALE);
  if (Number.isFinite(v)) return v;
  if (typeof window !== 'undefined' && window.innerWidth <= 768) return 4;
  return 8;
};

const MediaContext = createContext(null);

export function MediaProvider({ children }) {
  const [media, setMedia] = useState(buildInitial);
  const [editorOpen, setEditorOpen] = useState(false);
  const [logo, setLogoState] = useState(buildInitialLogo);
  const [logoLibrary, setLogoLibrary] = useState([]); // user-uploaded options
  const [logoScale, setLogoScale] = useState(buildInitialScale);
  // Mobile: keep text scale 1.0 and no tagline lift — desktop values would
  // overflow in a phone viewport.
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;
  const [textScale, setTextScale] = useState(isMobile ? 1.0 : 1.4);
  const [tagY, setTagY] = useState(isMobile ? 0 : 124);
  const [sectionBlur, setSectionBlur] = useState(0);
  const [mediaOffsets, setMediaOffsets] = useState({}); // sectionId -> 0..100 (object-position Y %)
  const [devMode, setDevMode] = useState(false);

  // Desktop shortcut: 'D' key toggles dev mode (no fancy keys).
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onKey = (e) => {
      if (e.target && e.target.matches && e.target.matches('input, textarea')) return;
      if (e.key === 'd' || e.key === 'D') setDevMode((v) => !v);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const setMediaOffset = useCallback((id, value) => {
    setMediaOffsets((prev) => ({ ...prev, [id]: value }));
  }, []);

  const addLogoToLibrary = useCallback((file) => {
    if (!file || !file.type.startsWith('image/')) return null;
    const url = URL.createObjectURL(file);
    const entry = { url, name: file.name, source: 'object', id: `${Date.now()}-${file.name}` };
    setLogoLibrary((prev) => [...prev, entry]);
    setLogoState(entry);
    return entry;
  }, []);

  const pickLogo = useCallback((entry) => setLogoState(entry), []);

  const clearLogo = useCallback(() => {
    setLogoState((prev) => {
      if (prev?.source === 'object') {
        // keep in library, just unset active — user might want to re-pick
      }
      return null;
    });
  }, []);

  const removeLogoFromLibrary = useCallback((id) => {
    setLogoLibrary((prev) => {
      const removed = prev.find((e) => e.id === id);
      if (removed?.source === 'object') URL.revokeObjectURL(removed.url);
      return prev.filter((e) => e.id !== id);
    });
    setLogoState((prev) => (prev?.id === id ? null : prev));
  }, []);

  const setSection = useCallback((id, payload) => {
    setMedia((prev) => {
      const old = prev[id];
      if (old?.source === 'object' && old.url) URL.revokeObjectURL(old.url);
      if (!payload) {
        const next = { ...prev };
        delete next[id];
        return next;
      }
      return { ...prev, [id]: payload };
    });
  }, []);

  const setFromFile = useCallback((id, file) => {
    if (!file) return;
    const isVideo = file.type.startsWith('video/');
    const isImage = file.type.startsWith('image/');
    if (!isVideo && !isImage) return;
    const url = URL.createObjectURL(file);
    setSection(id, { type: isVideo ? 'video' : 'image', url, source: 'object', name: file.name });
  }, [setSection]);

  const clearSection = useCallback((id) => setSection(id, null), [setSection]);

  const value = useMemo(() => ({
    media, setSection, setFromFile, clearSection,
    editorOpen, setEditorOpen,
    logo, logoLibrary, addLogoToLibrary, pickLogo, clearLogo, removeLogoFromLibrary,
    logoScale, setLogoScale,
    textScale, setTextScale,
    tagY, setTagY,
    sectionBlur, setSectionBlur,
    mediaOffsets, setMediaOffset,
    devMode, setDevMode,
  }), [media, setSection, setFromFile, clearSection, editorOpen,
       logo, logoLibrary, addLogoToLibrary, pickLogo, clearLogo, removeLogoFromLibrary,
       logoScale, textScale, tagY, sectionBlur, mediaOffsets, setMediaOffset, devMode]);

  return <MediaContext.Provider value={value}>{children}</MediaContext.Provider>;
}

export const useMedia = () => {
  const ctx = useContext(MediaContext);
  if (!ctx) throw new Error('useMedia must be inside MediaProvider');
  return ctx;
};
