import React, { useEffect, useRef, useState } from 'react';
import { MediaProvider } from './media/MediaContext.jsx';
import SectionMedia from './components/SectionMedia.jsx';
import BackgroundEditor from './components/BackgroundEditor.jsx';
import WolfeMark from './components/WolfeMark.jsx';
import { useMedia } from './media/MediaContext.jsx';
import { makeSplitter } from './components/SplitText.jsx';

// ---------- DIVISIONS HUB (concentric rings + sparkles) ----------
const DivisionsHub = () => (
  <svg
    className="wc-dx-hub-rings"
    viewBox="-160 -160 320 320"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden
  >
    <g fill="none" stroke="#CFBFAA">
      <circle r="58"  strokeOpacity="0.14" />
      <circle r="86"  strokeOpacity="0.18" />
      <circle r="118" strokeOpacity="0.16" />
      <circle r="146" strokeOpacity="0.10" />
    </g>
    {/* cardinal sparkles */}
    <g stroke="#CFBFAA" strokeOpacity="0.55" strokeLinecap="round" strokeWidth="1">
      <line x1="0" y1="-156" x2="0" y2="-138" />
      <line x1="-9" y1="-147" x2="9" y2="-147" />
      <line x1="0" y1="138" x2="0" y2="156" />
      <line x1="-9" y1="147" x2="9" y2="147" />
      <line x1="-156" y1="0" x2="-138" y2="0" />
      <line x1="-147" y1="-9" x2="-147" y2="9" />
      <line x1="138" y1="0" x2="156" y2="0" />
      <line x1="147" y1="-9" x2="147" y2="9" />
    </g>
    {/* small crosses at quadrants */}
    <g stroke="#CFBFAA" strokeOpacity="0.4" strokeLinecap="round">
      <g transform="translate(104 -104)"><line x1="-4" y1="0" x2="4" y2="0" /><line x1="0" y1="-4" x2="0" y2="4" /></g>
      <g transform="translate(-104 -104)"><line x1="-4" y1="0" x2="4" y2="0" /><line x1="0" y1="-4" x2="0" y2="4" /></g>
      <g transform="translate(104 104)"><line x1="-4" y1="0" x2="4" y2="0" /><line x1="0" y1="-4" x2="0" y2="4" /></g>
      <g transform="translate(-104 104)"><line x1="-4" y1="0" x2="4" y2="0" /><line x1="0" y1="-4" x2="0" y2="4" /></g>
    </g>
  </svg>
);

// ---------- SNAP SECTION (used for sections 02+) ----------
const Section = ({ id, children, style, className = '' }) => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold: 0.2 }
    );
    obs.observe(node);
    return () => obs.disconnect();
  }, []);

  return (
    <section
      id={id}
      ref={ref}
      className={`wc-section ${className}`}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(12px)',
        transition: 'opacity 0.8s ease, transform 0.8s ease',
        ...style,
      }}
    >
      {children}
    </section>
  );
};

// ---------- DATA ----------

const DIVISIONS = [
  {
    num: '01',
    name: 'Wolfe Studio',
    tag: 'Design & Brand',
    desc: 'Brand systems, identity, and content design built to outlive the trend cycle.',
  },
  {
    num: '02',
    name: 'Wolfe Productions',
    tag: 'Media',
    desc: 'Photo, video, and story-led content that commands attention and converts.',
  },
  {
    num: '03',
    name: 'Wolfe Labs',
    tag: 'Software & Systems',
    desc: 'Web, tools, and operating systems that compound — built for operators.',
  },
];

const OFFERS = [
  {
    num: '01',
    name: 'Content',
    division: 'Wolfe Productions',
    from: '$1,200',
    desc: 'Photo, video, and story-led content. Single shoots through to monthly retainers.',
    inclusions: ['Photography', 'Brand video', 'Social content', 'Documentary'],
  },
  {
    num: '02',
    name: 'Build',
    division: 'Wolfe Labs',
    from: '$1,200',
    desc: 'Web, apps, and internal tools. Single landing page through to custom platforms.',
    inclusions: ['Landing pages', 'Multi-page sites', 'Custom web apps', 'Digital products'],
  },
  {
    num: '03',
    name: 'Brand',
    division: 'Wolfe Studio',
    from: '$3,000',
    desc: 'Identity systems and business positioning. Built to be referenced, not redrawn.',
    inclusions: ['Identity & logo system', 'Brand guidelines', 'Positioning', 'Content design'],
  },
];

// ---------- COMPONENT ----------

export default function WolfeCoLanding() {
  return (
    <MediaProvider>
      <Landing />
      <BackgroundEditor />
    </MediaProvider>
  );
}

// Hook: drives an entrance progress on `ref` based on how far the nearest
// <section> has entered the viewport. Sets CSS var --p (0 → 1).
// 0 = section's top edge is one full viewport below the top.
// 1 = section's top edge has reached the top of the viewport.
function useScrollEnter(ref, { throw_ = 1 } = {}) {
  useEffect(() => {
    let raf = 0;
    const apply = () => {
      raf = 0;
      const el = ref.current;
      if (!el) return;
      const section = el.closest('section') || el;
      const vh = window.innerHeight || 1;
      const rect = section.getBoundingClientRect();
      const p = Math.max(0, Math.min(1, (vh - rect.top) / (vh * throw_)));
      el.style.setProperty('--p', p.toFixed(4));
    };
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(apply);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    apply();
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [ref, throw_]);
}

// Hook: drives a 3D tilt-up on `ref` based on how far the nearest <section> has
// scrolled past the top of the viewport. Sets CSS vars --tilt and --lift.
function useScrollTilt(ref, { maxTilt = 22, maxLift = -14, throw_ = 0.6 } = {}) {
  useEffect(() => {
    let raf = 0;
    const apply = () => {
      raf = 0;
      const el = ref.current;
      if (!el) return;
      const section = el.closest('section') || el;
      const vh = window.innerHeight || 1;
      const rect = section.getBoundingClientRect();
      const progress = Math.max(0, Math.min(1, -rect.top / (vh * throw_)));
      el.style.setProperty('--tilt', `${(progress * maxTilt).toFixed(2)}deg`);
      el.style.setProperty('--lift', `${(progress * maxLift).toFixed(1)}px`);
    };
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(apply);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    apply();
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [ref, maxTilt, maxLift, throw_]);
}

const DivisionsInner = React.forwardRef(function DivisionsInner(_, ref) {
  const split = makeSplitter();
  return (
    <div className="wc-dx wc-tilt-target wc-reveal-stage" ref={ref}>
      <div className="wc-dx-frame" aria-hidden>
        <span className="wc-dx-cross tl">+</span>
        <span className="wc-dx-cross tr">+</span>
        <span className="wc-dx-cross bl">+</span>
        <span className="wc-dx-cross br">+</span>
        <span className="wc-dx-cross tmid">+</span>
        <span className="wc-dx-cross bmid">+</span>
      </div>

      <span className="wc-dx-edge l-top">{split('Strategy')}</span>
      <span className="wc-dx-edge l-bot">{split('Creation')}</span>
      <span className="wc-dx-edge r-top">{split('Systems')}</span>
      <span className="wc-dx-edge r-bot">{split('Infrastructure')}</span>

      <div className="wc-dx-eyebrow">
        <span className="wc-dx-eyebrow-rule" />
        <span>{split('02 — Structure')}</span>
      </div>

      <div className="wc-dx-hub">
        <DivisionsHub />
        <div className="wc-dx-hub-text">
          <div className="wc-dx-hub-title">{split('Wolfe Co')}</div>
          <div className="wc-dx-hub-sub">{split('Holding & Umbrella')}</div>
        </div>
      </div>

      <div className="wc-dx-tree" aria-hidden>
        <span className="wc-dx-tree-stem" />
        <span className="wc-dx-tree-junction" />
        <span className="wc-dx-tree-cross" />
        <span className="wc-dx-tree-leg l" />
        <span className="wc-dx-tree-leg c" />
        <span className="wc-dx-tree-leg r" />
        <span className="wc-dx-tree-node l" />
        <span className="wc-dx-tree-node c" />
        <span className="wc-dx-tree-node r" />
      </div>

      <div className="wc-dx-cols">
        {DIVISIONS.map((d) => (
          <div className="wc-dx-col" key={d.num}>
            <div className="wc-dx-col-num">
              <span>{split(d.num)}</span>
              <span className="wc-ochre-dot" />
            </div>
            <div className="wc-dx-col-name">{split(d.name)}</div>
            <div className="wc-dx-col-tag">{split(d.tag)}</div>
          </div>
        ))}
      </div>
    </div>
  );
});

const CapabilitiesInner = React.forwardRef(function CapabilitiesInner(_, ref) {
  const split = makeSplitter();
  return (
    <div className="wc-stage wc-tilt-target wc-reveal-stage" ref={ref}>
      <div className="wc-cap-label tl">
        <span className="wc-num">{split('001')}</span>
        <span>{split('Strategy')}</span>
      </div>
      <div className="wc-cap-label tr">
        <span>{split('Video')}</span>
        <span className="wc-num">{split('002')}</span>
      </div>
      <div className="wc-cap-label bl">
        <span className="wc-num">{split('003')}</span>
        <span>{split('Content')}</span>
      </div>
      <div className="wc-cap-label br">
        <span>{split('Systems')}</span>
        <span className="wc-num">{split('004')}</span>
      </div>

      <div className="wc-cap-center">
        <span className="wc-cap-num">{split('03 — Capabilities')}</span>
        <span className="wc-cap-rule" />
        <span className="wc-cap-title">{split('Built To Travel')}</span>
      </div>
    </div>
  );
});

const OffersInner = React.forwardRef(function OffersInner(_, ref) {
  const split = makeSplitter();
  return (
    <div className="wc-offers-wrap">
      <div className="wc-offers-inner wc-tilt-target wc-reveal-stage" ref={ref}>
        <div className="wc-offers-head">
          <span className="wc-cap-num">{split('04 — What I Build')}</span>
          <span className="wc-cap-rule" />
          <h2 className="wc-offers-head-title">
            {split('Three Offers')}
            <span className="wc-period">{split('.')}</span>
          </h2>
          <span className="wc-offers-head-note">
            {split('From-prices · All + GST · Lakes Entrance, VIC')}
          </span>
        </div>

        <div className="wc-offers-grid">
          {OFFERS.map((o) => (
            <div className="wc-offer-card" key={o.num}>
              <div className="wc-offer-num">
                <span>{split(o.num)}</span>
                <span className="wc-ochre-dot" />
              </div>
              <div className="wc-offer-name">{split(o.name)}</div>
              <div className="wc-offer-division">{split(o.division)}</div>
              <div className="wc-offer-desc">{split(o.desc)}</div>

              <div className="wc-offer-incl">
                {o.inclusions.map((inc) => (
                  <span className="wc-offer-incl-item" key={inc}>
                    <span className="wc-offer-incl-tick" />
                    <span>{split(inc)}</span>
                  </span>
                ))}
              </div>

              <div className="wc-offer-price">
                <span className="wc-offer-price-from">{split('From')}</span>
                <span className="wc-offer-price-num">{split(o.from)}</span>
                <span className="wc-offer-price-gst">{split('+ GST')}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

const AvailabilityInner = React.forwardRef(function AvailabilityInner(_, ref) {
  const split = makeSplitter();
  return (
    <div className="wc-avail">
      <div className="wc-avail-inner wc-tilt-target wc-reveal-stage" ref={ref}>
        <span className="wc-avail-eyebrow">
          <span className="wc-rule-36" />
          <span>{split('05 — Availability')}</span>
          <span className="wc-rule-36" />
        </span>

        <h2 className="wc-avail-title">
          <span className="wc-statement-num">{split('2')}</span>
          {split(' Founding Partner Slots Left For 2026')}
          <span className="wc-period">{split('.')}</span>
        </h2>

        <div className="wc-avail-slots">
          <div className="wc-slot wc-slot--open">
            <span className="wc-slot-num">{split('01')}</span>
            <span className="wc-slot-state">
              <span className="wc-ochre-dot" />
              {split('Open')}
            </span>
          </div>
          <div className="wc-slot wc-slot--open">
            <span className="wc-slot-num">{split('02')}</span>
            <span className="wc-slot-state">
              <span className="wc-ochre-dot" />
              {split('Open')}
            </span>
          </div>
          <div className="wc-slot wc-slot--filled">
            <span className="wc-slot-num">{split('03')}</span>
            <span className="wc-slot-state">{split('Held')}</span>
          </div>
        </div>

        <p className="wc-avail-note">
          {split('Wolfe Co is taking on two more long-term clients for the year. Founding rates lock in permanently — every other client onboarded after these slots close will pay more. These are the lowest rates this brand will ever charge.')}
        </p>

        <div className="wc-avail-detail">
          <div className="wc-avail-detail-item">
            <span className="wc-avail-detail-rule" />
            <span className="wc-avail-detail-label">{split('Format')}</span>
            <span className="wc-avail-detail-val">{split('Retainer or Bundle')}</span>
          </div>
          <div className="wc-avail-detail-item">
            <span className="wc-avail-detail-rule" />
            <span className="wc-avail-detail-label">{split('Lock-in')}</span>
            <span className="wc-avail-detail-val">{split('Permanent Rate')}</span>
          </div>
          <div className="wc-avail-detail-item">
            <span className="wc-avail-detail-rule" />
            <span className="wc-avail-detail-label">{split('Scope')}</span>
            <span className="wc-avail-detail-val">{split('Custom Per Client')}</span>
          </div>
        </div>
      </div>
    </div>
  );
});

const ProofInner = React.forwardRef(function ProofInner(_, ref) {
  const split = makeSplitter();
  return (
    <div className="wc-stage wc-tilt-target wc-reveal-stage" ref={ref}>
      <span className="wc-proof-eyebrow">{split('06 — Proof')}</span>

      <div className="wc-proof-inner">
        <div className="wc-metric">
          <span className="wc-metric-rule" />
          <span className="wc-metric-num">{split('150+')}</span>
          <span className="wc-metric-label">{split('Projects')}</span>
        </div>
        <div className="wc-metric">
          <span className="wc-metric-rule" />
          <span className="wc-metric-num">{split('3.2M+')}</span>
          <span className="wc-metric-label">{split('Views')}</span>
        </div>
        <div className="wc-metric">
          <span className="wc-metric-rule" />
          <span className="wc-metric-num">{split('98%')}</span>
          <span className="wc-metric-label">{split('Retention')}</span>
        </div>
      </div>
    </div>
  );
});

const CTAInner = React.forwardRef(function CTAInner(_, ref) {
  const split = makeSplitter();
  return (
    <>
      <div className="wc-cta-inner wc-tilt-target wc-reveal-stage" ref={ref}>
        <span className="wc-cta-eyebrow">
          <span className="wc-ochre-dot" />
          {split('07 — Begin')}
        </span>
        <h2 className="wc-cta-title">
          {split('Ready To Build Authority')}
          <span className="wc-period">{split('?')}</span>
        </h2>
        <button className="wc-btn" onClick={() => {}}>
          {split('Claim a Founding Slot')}
        </button>
        <button className="wc-link" onClick={() => {}}>
          {split('View Work')}
        </button>
      </div>

      <div className="wc-footer-mark">
        <WolfeMark size={14} ignoreScale />
        <span>Wolfe Co — Coastal VIC</span>
        <span className="wc-ochre-dot" />
        <span>© 2026</span>
      </div>
    </>
  );
});

const StatementInner = React.forwardRef(function StatementInner(_, ref) {
  const split = makeSplitter();
  return (
    <div className="wc-statement-inner wc-tilt-target wc-reveal-stage" ref={ref}>
      <div className="wc-statement-eyebrow">
        <span className="wc-rule-36" />
        <span>{split('01 — Position')}</span>
        <span className="wc-rule-36" />
      </div>

      <h1 className="wc-statement-line">
        <span className="wc-statement-num">{split('20')}</span>
        {split(' Years Of Knowing What ')}
        {split('‘Good’')}
        {split(' Looks Like')}
        <span className="wc-period">{split('.')}</span>
      </h1>

      <div className="wc-credo">
        <span className="wc-credo-line">{split('I Know Good When I See It,')}</span>
        <span className="wc-credo-line">
          {split('Hear It, And Feel It')}
          <span className="wc-period">{split('.')}</span>
        </span>
        <span className="wc-credo-foot">
          <span className="wc-ochre-dot" />
          {split('Two Decades Of Practice')}
          <span className="wc-ochre-dot" />
        </span>
      </div>
    </div>
  );
});

function Landing() {
  const { textScale, tagY } = useMedia();
  const heroMarkRef = useRef(null);
  const statementRef = useRef(null);
  const divisionsRef = useRef(null);
  const capabilitiesRef = useRef(null);
  const offersRef = useRef(null);
  const availabilityRef = useRef(null);
  const proofRef = useRef(null);
  const ctaRef = useRef(null);

  useScrollTilt(heroMarkRef);

  useScrollEnter(statementRef);
  useScrollTilt(statementRef, { maxTilt: 18, maxLift: -10 });

  useScrollEnter(divisionsRef);
  useScrollTilt(divisionsRef, { maxTilt: 16, maxLift: -8 });

  useScrollEnter(capabilitiesRef);
  useScrollTilt(capabilitiesRef, { maxTilt: 16, maxLift: -8 });

  useScrollEnter(offersRef);
  useScrollTilt(offersRef, { maxTilt: 14, maxLift: -8 });

  useScrollEnter(availabilityRef);
  useScrollTilt(availabilityRef, { maxTilt: 14, maxLift: -8 });

  useScrollEnter(proofRef);
  useScrollTilt(proofRef, { maxTilt: 18, maxLift: -10 });

  useScrollEnter(ctaRef);
  useScrollTilt(ctaRef, { maxTilt: 16, maxLift: -8 });

  useEffect(() => {
    let meta = document.querySelector('meta[name="viewport"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'viewport';
      document.head.appendChild(meta);
    }
    meta.setAttribute(
      'content',
      'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no'
    );
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter+Tight:wght@700;800;900&family=Space+Mono:wght@400;700&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }
        html, body, #root { margin: 0; padding: 0; background: #171618; }
        html {
          scroll-snap-type: y mandatory;
          overscroll-behavior-y: none;
        }
        @media (hover: none) and (pointer: coarse) {
          /* Mobile / touch — let native momentum handle motion, snap softly. */
          html { scroll-snap-type: y proximity; }
        }
        body { -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }

        /* ROOT WRAP — NO scroll-snap (so hero scrub works).
           Snap is applied only to the post-hero deck. */
        .wc-wrap {
          background: #171618;
          color: #CFBFAA;
          font-family: 'Space Mono', ui-monospace, monospace;
        }

        /* Snap deck — every section including hero snaps. */
        .wc-deck { height: auto; }

        .wc-section {
          width: 100vw;
          height: 100dvh;
          scroll-snap-align: start;
          scroll-snap-stop: always;
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          perspective: 1400px;
          perspective-origin: 50% 60%;
        }
        @media (hover: none) and (pointer: coarse) {
          .wc-section { scroll-snap-stop: normal; }
        }

        .wc-ochre-dot {
          display: inline-block;
          width: 5px; height: 5px;
          background: #CE703F;
          border-radius: 50%;
          flex-shrink: 0;
        }
        .wc-cap-num {
          font-family: 'Space Mono', monospace;
          font-size: calc(10px * var(--text-scale, 1));
          letter-spacing: 0.4em;
          color: #CFBFAA;
          opacity: 0.5;
          text-transform: uppercase;
        }
        .wc-cap-rule {
          width: 24px; height: 1px;
          background: #CE703F;
          margin: 6px 0;
        }
        .wc-period { color: #CE703F; }

        /* ---------- HERO content (sits inside ScrollVideoBG) ---------- */
        .wc-hero-inner {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 32px;
          padding: 0 24px;
          text-align: center;
          z-index: 2;
        }
        .wc-hero-mark {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 18px;
          perspective: 1100px;
          perspective-origin: 50% 60%;
        }
        .wc-hero-mark > *,
        .wc-tilt-target {
          transform:
            translateY(var(--lift, 0px))
            rotateX(var(--tilt, 0deg));
          transform-origin: 50% 60%;
          transform-style: preserve-3d;
          transition: transform 140ms cubic-bezier(0.22, 0.61, 0.36, 1);
          will-change: transform;
          backface-visibility: hidden;
        }
        /* full-bleed wrapper used as a single tilt/reveal target inside a section */
        .wc-stage {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
        }

        /* ---------- LETTER-BY-LETTER REVEAL ---------- */
        .wc-reveal-stage {
          --p: 0;
          --step: 0.009;   /* progress units between consecutive letters starting */
          --rev: 0.05;     /* progress duration of a single letter's reveal */
        }
        .wc-letter {
          display: inline-block;
          --start: calc(var(--i, 0) * var(--step));
          --r: clamp(0, calc((var(--p) - var(--start)) / var(--rev)), 1);
          opacity: var(--r);
          transform:
            scale(calc(1 + (1 - var(--r)) * 0.55))
            translateY(calc((1 - var(--r)) * -28px))
            rotateX(calc((1 - var(--r)) * 35deg));
          transform-origin: 50% 60%;
          filter: blur(calc((1 - var(--r)) * 6px));
          transition:
            opacity 90ms linear,
            transform 90ms cubic-bezier(0.18, 0.7, 0.28, 1),
            filter 90ms linear;
          will-change: transform, opacity, filter;
        }
        .wc-hero-co {
          font-family: 'Space Mono', monospace;
          font-size: calc(13px * var(--text-scale, 1));
          letter-spacing: 0.45em;
          color: #CFBFAA;
          text-transform: uppercase;
        }
        .wc-hero-tag {
          font-family: 'Space Mono', monospace;
          font-size: calc(10px * var(--text-scale, 1));
          letter-spacing: 0.4em;
          color: #CFBFAA;
          opacity: 0.65;
          text-transform: uppercase;
          margin-top: 12px;
          display: inline-flex;
          align-items: center;
          gap: 12px;
          transform: translateY(var(--hero-tag-y, 0px));
        }

        .wc-scroll-cue {
          position: absolute;
          bottom: 36px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          z-index: 3;
        }
        .wc-scroll-line {
          width: 1px;
          height: 64px;
          background: linear-gradient(
            to bottom,
            rgba(207,191,170,0) 0%,
            rgba(207,191,170,0.5) 50%,
            rgba(207,191,170,0) 100%
          );
          animation: wcCueBreathe 4s ease-in-out infinite;
        }
        @keyframes wcCueBreathe {
          0%, 100% { opacity: 0.25; transform: translateY(-6px); }
          50%      { opacity: 1;    transform: translateY(6px); }
        }

        /* ---------- POWER ORB (logo overlay) ---------- */
        .wc-orb {
          transform: translate(-50%, -50%);
          border-radius: 999px;
          background: radial-gradient(
            circle at 35% 35%,
            #FFE7B3 0%,
            #F1A766 28%,
            #CE703F 55%,
            rgba(206,112,63,0) 78%
          );
          box-shadow:
            0 0 8px rgba(255,200,140,0.8),
            0 0 22px rgba(206,112,63,0.65),
            0 0 48px rgba(206,112,63,0.35);
          animation: wcOrbPulse 3.2s ease-in-out infinite;
          pointer-events: none;
        }
        .wc-orb::before,
        .wc-orb::after {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 999px;
          border: 1px solid rgba(206,112,63,0.55);
          opacity: 0;
          animation: wcOrbRing 3.2s ease-out infinite;
        }
        .wc-orb::after {
          animation-delay: 1.6s;
          border-color: rgba(255,213,160,0.45);
        }
        @keyframes wcOrbPulse {
          0%, 100% {
            box-shadow:
              0 0 6px rgba(255,200,140,0.7),
              0 0 18px rgba(206,112,63,0.55),
              0 0 36px rgba(206,112,63,0.25);
          }
          50% {
            box-shadow:
              0 0 10px rgba(255,210,160,1),
              0 0 30px rgba(241,167,102,0.85),
              0 0 64px rgba(206,112,63,0.5);
          }
        }
        @keyframes wcOrbRing {
          0%   { transform: scale(1);   opacity: 0.7; }
          100% { transform: scale(3.6); opacity: 0; }
        }

        /* ---------- STATEMENT ---------- */
        .wc-statement-bg {
          position: absolute; inset: 0;
          background: #111;
          /* SWAP: swap div background-image with your still. */
          background-size: cover;
          background-position: center;
        }
        .wc-statement-veil {
          position: absolute; inset: 0;
          background: rgba(17, 17, 17, 0.55);
        }
        .wc-statement-inner {
          position: relative;
          z-index: 2;
          padding: 0 32px;
          max-width: 1200px;
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 56px;
        }
        .wc-statement-eyebrow {
          font-family: 'Space Mono', monospace;
          font-size: calc(10px * var(--text-scale, 1));
          letter-spacing: 0.4em;
          text-transform: uppercase;
          color: #CFBFAA;
          opacity: 0.6;
          display: inline-flex;
          align-items: center;
          gap: 12px;
        }
        .wc-rule-36 {
          width: 36px;
          height: 1px;
          background: #CE703F;
        }
        .wc-statement-line {
          font-family: 'Inter Tight', sans-serif;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          font-size: calc(64px * var(--text-scale, 1));
          line-height: 1;
          color: #CFBFAA;
          max-width: 1100px;
        }
        .wc-statement-num {
          color: #CE703F;
          font-feature-settings: 'tnum';
        }
        .wc-credo {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 14px;
          margin-top: 8px;
        }
        .wc-credo-line {
          font-family: 'Inter Tight', sans-serif;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          font-size: calc(18px * var(--text-scale, 1));
          line-height: 1.3;
          color: #CFBFAA;
          opacity: 0.85;
        }
        .wc-credo-foot {
          font-family: 'Space Mono', monospace;
          font-size: calc(10px * var(--text-scale, 1));
          letter-spacing: 0.4em;
          color: #CFBFAA;
          opacity: 0.5;
          text-transform: uppercase;
          margin-top: 8px;
          display: inline-flex;
          align-items: center;
          gap: 10px;
        }

        /* ---------- DIVISIONS ---------- */
        .wc-div-wrap {
          width: 100%;
          height: 100%;
          padding: 88px 32px 48px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .wc-div-inner {
          width: 100%;
          max-width: 1280px;
          display: flex;
          flex-direction: column;
          gap: 56px;
        }
        .wc-div-head {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 14px;
          text-align: center;
        }
        .wc-div-head-title {
          font-family: 'Inter Tight', sans-serif;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          font-size: calc(40px * var(--text-scale, 1));
          color: #CFBFAA;
        }
        .wc-div-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1px;
          background: #2a2a2c;
        }
        .wc-div-card {
          background: #171618;
          padding: 40px 32px;
          display: flex;
          flex-direction: column;
          gap: 18px;
          min-height: 280px;
          position: relative;
        }
        .wc-div-card-num {
          font-family: 'Space Mono', monospace;
          font-size: calc(10px * var(--text-scale, 1));
          letter-spacing: 0.4em;
          color: #CFBFAA;
          opacity: 0.5;
          text-transform: uppercase;
          display: inline-flex;
          align-items: center;
          gap: 10px;
        }
        .wc-div-card-name {
          font-family: 'Inter Tight', sans-serif;
          font-weight: 800;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          font-size: calc(26px * var(--text-scale, 1));
          color: #CFBFAA;
          line-height: 1;
        }
        .wc-div-card-tag {
          font-family: 'Space Mono', monospace;
          font-size: calc(11px * var(--text-scale, 1));
          letter-spacing: 0.3em;
          color: #5C8A8A;
          text-transform: uppercase;
        }
        .wc-div-card-desc {
          font-family: 'Space Mono', monospace;
          font-size: calc(12px * var(--text-scale, 1));
          line-height: 1.7;
          color: #CFBFAA;
          opacity: 0.75;
          letter-spacing: 0.02em;
          text-transform: none;
          margin-top: auto;
        }

        /* ---------- CAPABILITIES ---------- */
        .wc-cap-bg {
          position: absolute; inset: 0;
          background: #111;
          /* SWAP: swap div background-image with your still. */
        }
        .wc-cap-veil {
          position: absolute; inset: 0;
          background: rgba(17, 17, 17, 0.4);
        }
        .wc-cap-center {
          position: relative;
          z-index: 2;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 14px;
        }
        .wc-cap-title {
          font-family: 'Inter Tight', sans-serif;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          font-size: calc(28px * var(--text-scale, 1));
          color: #CFBFAA;
        }
        .wc-cap-label {
          position: absolute;
          z-index: 3;
          font-family: 'Space Mono', monospace;
          font-size: calc(11px * var(--text-scale, 1));
          letter-spacing: 0.3em;
          text-transform: uppercase;
          color: #CFBFAA;
          display: inline-flex;
          align-items: center;
          gap: 10px;
        }
        .wc-cap-label.tl { top: 8%;    left: 6%; }
        .wc-cap-label.tr { top: 8%;    right: 6%; }
        .wc-cap-label.bl { bottom: 10%; left: 6%; }
        .wc-cap-label.br { bottom: 10%; right: 6%; }
        .wc-cap-label .wc-num {
          font-size: calc(9px * var(--text-scale, 1));
          opacity: 0.4;
          letter-spacing: 0.3em;
        }

        /* ---------- OFFERS ---------- */
        .wc-offers-wrap {
          width: 100%;
          height: 100%;
          padding: 88px 32px 48px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .wc-offers-inner {
          width: 100%;
          max-width: 1280px;
          display: flex;
          flex-direction: column;
          gap: 48px;
        }
        .wc-offers-head {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          text-align: center;
        }
        .wc-offers-head-title {
          font-family: 'Inter Tight', sans-serif;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          font-size: calc(40px * var(--text-scale, 1));
          color: #CFBFAA;
        }
        .wc-offers-head-note {
          font-family: 'Space Mono', monospace;
          font-size: calc(10px * var(--text-scale, 1));
          letter-spacing: 0.3em;
          color: #CFBFAA;
          opacity: 0.55;
          text-transform: uppercase;
          margin-top: 4px;
        }
        .wc-offers-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1px;
          background: #2a2a2c;
        }
        .wc-offer-card {
          background: #171618;
          padding: 36px 32px;
          display: flex;
          flex-direction: column;
          gap: 20px;
          min-height: 360px;
          position: relative;
        }
        .wc-offer-num {
          font-family: 'Space Mono', monospace;
          font-size: calc(10px * var(--text-scale, 1));
          letter-spacing: 0.4em;
          color: #CFBFAA;
          opacity: 0.5;
          text-transform: uppercase;
          display: inline-flex;
          align-items: center;
          gap: 10px;
        }
        .wc-offer-name {
          font-family: 'Inter Tight', sans-serif;
          font-weight: 800;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          font-size: calc(32px * var(--text-scale, 1));
          color: #CFBFAA;
          line-height: 1;
        }
        .wc-offer-division {
          font-family: 'Space Mono', monospace;
          font-size: calc(10px * var(--text-scale, 1));
          letter-spacing: 0.3em;
          color: #5C8A8A;
          text-transform: uppercase;
        }
        .wc-offer-desc {
          font-family: 'Space Mono', monospace;
          font-size: calc(12px * var(--text-scale, 1));
          line-height: 1.7;
          color: #CFBFAA;
          opacity: 0.75;
          letter-spacing: 0.02em;
          text-transform: none;
        }
        .wc-offer-incl {
          display: flex;
          flex-direction: column;
          gap: 6px;
          margin-top: auto;
        }
        .wc-offer-incl-item {
          font-family: 'Space Mono', monospace;
          font-size: calc(10px * var(--text-scale, 1));
          letter-spacing: 0.2em;
          color: #CFBFAA;
          opacity: 0.6;
          text-transform: uppercase;
          display: inline-flex;
          align-items: center;
          gap: 10px;
        }
        .wc-offer-incl-tick {
          width: 6px; height: 1px;
          background: #CE703F;
          flex-shrink: 0;
        }
        .wc-offer-price {
          padding-top: 20px;
          border-top: 1px solid #2a2a2c;
          display: flex;
          align-items: baseline;
          gap: 10px;
        }
        .wc-offer-price-from {
          font-family: 'Space Mono', monospace;
          font-size: calc(9px * var(--text-scale, 1));
          letter-spacing: 0.3em;
          color: #CE703F;
          text-transform: uppercase;
        }
        .wc-offer-price-num {
          font-family: 'Inter Tight', sans-serif;
          font-weight: 800;
          font-size: calc(24px * var(--text-scale, 1));
          letter-spacing: 0.04em;
          color: #CFBFAA;
        }
        .wc-offer-price-gst {
          font-family: 'Space Mono', monospace;
          font-size: calc(9px * var(--text-scale, 1));
          letter-spacing: 0.3em;
          color: #CFBFAA;
          opacity: 0.4;
          text-transform: uppercase;
          margin-left: auto;
        }

        /* ---------- AVAILABILITY ---------- */
        .wc-avail {
          background: #171618;
          width: 100%;
          height: 100%;
          padding: 64px 32px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .wc-avail-inner {
          width: 100%;
          max-width: 1100px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 48px;
          text-align: center;
        }
        .wc-avail-eyebrow {
          font-family: 'Space Mono', monospace;
          font-size: calc(10px * var(--text-scale, 1));
          letter-spacing: 0.4em;
          color: #CFBFAA;
          opacity: 0.5;
          text-transform: uppercase;
          display: inline-flex;
          align-items: center;
          gap: 12px;
        }
        .wc-avail-title {
          font-family: 'Inter Tight', sans-serif;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          font-size: calc(56px * var(--text-scale, 1));
          line-height: 1;
          color: #CFBFAA;
          max-width: 900px;
        }
        .wc-avail-slots {
          display: flex;
          gap: 24px;
          align-items: stretch;
          margin-top: 8px;
        }
        .wc-slot {
          width: 140px;
          padding: 28px 20px;
          border: 1px solid #2a2a2c;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          background: #171618;
        }
        .wc-slot--open { border-color: #CE703F; }
        .wc-slot--filled { opacity: 0.3; }
        .wc-slot-num {
          font-family: 'Inter Tight', sans-serif;
          font-weight: 800;
          font-size: calc(48px * var(--text-scale, 1));
          color: #CFBFAA;
          line-height: 1;
        }
        .wc-slot-state {
          font-family: 'Space Mono', monospace;
          font-size: calc(9px * var(--text-scale, 1));
          letter-spacing: 0.4em;
          text-transform: uppercase;
          color: #CFBFAA;
          opacity: 0.7;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }
        .wc-slot--open .wc-slot-state { color: #CE703F; opacity: 1; }
        .wc-avail-note {
          font-family: 'Space Mono', monospace;
          font-size: calc(12px * var(--text-scale, 1));
          line-height: 1.8;
          letter-spacing: 0.04em;
          color: #CFBFAA;
          opacity: 0.75;
          max-width: 640px;
        }
        .wc-avail-detail {
          display: flex;
          gap: 48px;
          flex-wrap: wrap;
          justify-content: center;
          margin-top: 8px;
        }
        .wc-avail-detail-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          min-width: 140px;
        }
        .wc-avail-detail-rule {
          width: 24px;
          height: 1px;
          background: #CE703F;
        }
        .wc-avail-detail-label {
          font-family: 'Space Mono', monospace;
          font-size: calc(9px * var(--text-scale, 1));
          letter-spacing: 0.4em;
          color: #CFBFAA;
          opacity: 0.5;
          text-transform: uppercase;
        }
        .wc-avail-detail-val {
          font-family: 'Inter Tight', sans-serif;
          font-weight: 700;
          font-size: calc(14px * var(--text-scale, 1));
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: #CFBFAA;
        }

        /* ---------- PROOF ---------- */
        .wc-proof-bg {
          position: absolute; inset: 0;
          background: #111;
          /* SWAP: swap div background-image with your still. */
        }
        .wc-proof-veil {
          position: absolute; inset: 0;
          background: rgba(17, 17, 17, 0.65);
        }
        .wc-proof-inner {
          position: relative;
          z-index: 2;
          display: flex;
          gap: 96px;
          align-items: flex-start;
          justify-content: center;
          padding: 0 32px;
          flex-wrap: wrap;
        }
        .wc-metric {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 18px;
          min-width: 180px;
        }
        .wc-metric-rule {
          width: 100%;
          max-width: 80px;
          height: 1px;
          background: #CE703F;
        }
        .wc-metric-num {
          font-family: 'Inter Tight', sans-serif;
          font-weight: 800;
          letter-spacing: 0.04em;
          font-size: calc(64px * var(--text-scale, 1));
          color: #CFBFAA;
          line-height: 1;
        }
        .wc-metric-label {
          font-family: 'Space Mono', monospace;
          font-size: calc(10px * var(--text-scale, 1));
          letter-spacing: 0.4em;
          color: #CFBFAA;
          opacity: 0.7;
          text-transform: uppercase;
        }
        .wc-proof-eyebrow {
          position: absolute;
          top: 40px;
          left: 50%;
          transform: translateX(-50%);
          font-family: 'Space Mono', monospace;
          font-size: calc(10px * var(--text-scale, 1));
          letter-spacing: 0.4em;
          color: #CFBFAA;
          opacity: 0.5;
          text-transform: uppercase;
          z-index: 3;
        }

        /* ---------- CTA ---------- */
        .wc-cta { background: #171618; }
        .wc-cta-inner {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 36px;
          padding: 0 24px;
          text-align: center;
        }
        .wc-cta-title {
          font-family: 'Inter Tight', sans-serif;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          font-size: calc(56px * var(--text-scale, 1));
          line-height: 1;
          color: #CFBFAA;
          max-width: 900px;
        }
        .wc-cta-eyebrow {
          font-family: 'Space Mono', monospace;
          font-size: calc(10px * var(--text-scale, 1));
          letter-spacing: 0.4em;
          color: #CFBFAA;
          opacity: 0.5;
          text-transform: uppercase;
          display: inline-flex;
          align-items: center;
          gap: 12px;
        }
        .wc-btn {
          background: #CFBFAA;
          color: #171618;
          border: none;
          padding: 18px 44px;
          font-family: 'Space Mono', monospace;
          font-size: calc(16px * var(--text-scale, 1));
          letter-spacing: 0.3em;
          text-transform: uppercase;
          cursor: pointer;
          transition: background 0.2s ease, transform 0.2s ease;
        }
        .wc-btn:hover { background: #fff; }
        .wc-btn:active { transform: translate(2px, 2px); }
        .wc-link {
          background: none;
          border: none;
          font-family: 'Space Mono', monospace;
          font-size: calc(16px * var(--text-scale, 1));
          letter-spacing: 0.3em;
          color: #CFBFAA;
          opacity: 0.7;
          text-transform: uppercase;
          text-decoration: underline;
          text-underline-offset: 6px;
          cursor: pointer;
          padding: 0;
        }
        .wc-link:hover { opacity: 1; }

        .wc-footer-mark {
          position: absolute;
          bottom: 32px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          align-items: center;
          gap: 10px;
          font-family: 'Space Mono', monospace;
          font-size: calc(9px * var(--text-scale, 1));
          letter-spacing: 0.4em;
          color: #CFBFAA;
          opacity: 0.4;
          text-transform: uppercase;
        }

        .wc-corner, .wc-corner-r {
          position: fixed;
          top: 28px;
          z-index: 50;
          display: flex;
          align-items: center;
          gap: 10px;
          font-family: 'Space Mono', monospace;
          font-size: calc(10px * var(--text-scale, 1));
          letter-spacing: 0.35em;
          color: #CFBFAA;
          opacity: 0.7;
          text-transform: uppercase;
          pointer-events: none;
        }
        .wc-corner { left: 28px; }
        .wc-corner-r { right: 28px; }

        /* ---------- DIVISIONS DIAGRAM ---------- */
        .wc-dx {
          position: relative;
          width: 100%;
          height: 100%;
          padding: 56px 56px 40px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 24px;
        }

        /* outer frame */
        .wc-dx-frame {
          position: absolute;
          top: 28px; right: 28px; bottom: 28px; left: 28px;
          border: 1px solid rgba(207,191,170,0.10);
          pointer-events: none;
          z-index: 2;
        }
        .wc-dx-cross {
          position: absolute;
          width: 14px; height: 14px;
          color: #CFBFAA;
          opacity: 0.55;
          font-family: 'Space Mono', monospace;
          font-size: calc(14px * var(--text-scale, 1));
          line-height: 1;
          display: flex; align-items: center; justify-content: center;
          background: #0a0a0c;
          padding: 2px;
        }
        .wc-dx-cross.tl   { top: -8px;    left: -8px; }
        .wc-dx-cross.tr   { top: -8px;    right: -8px; }
        .wc-dx-cross.bl   { bottom: -8px; left: -8px; }
        .wc-dx-cross.br   { bottom: -8px; right: -8px; }
        .wc-dx-cross.tmid { top: -8px;    left: 50%; transform: translateX(-50%); opacity: 0.35; }
        .wc-dx-cross.bmid { bottom: -8px; left: 50%; transform: translateX(-50%); opacity: 0.35; }

        /* edge labels (rotated) */
        .wc-dx-edge {
          position: absolute;
          font-family: 'Space Mono', monospace;
          font-size: calc(9px * var(--text-scale, 1));
          letter-spacing: 0.5em;
          color: #CFBFAA;
          opacity: 0.4;
          text-transform: uppercase;
          z-index: 3;
          white-space: nowrap;
        }
        .wc-dx-edge.l-top  { left: 60px;  top: 32%;     transform: rotate(-90deg); transform-origin: left top; }
        .wc-dx-edge.l-bot  { left: 60px;  bottom: 18%;  transform: rotate(-90deg); transform-origin: left bottom; }
        .wc-dx-edge.r-top  { right: 60px; top: 32%;     transform: rotate(90deg);  transform-origin: right top; }
        .wc-dx-edge.r-bot  { right: 60px; bottom: 18%;  transform: rotate(90deg);  transform-origin: right bottom; }

        /* eyebrow top-right */
        .wc-dx-eyebrow {
          position: absolute;
          top: 60px;
          right: 56px;
          display: flex;
          align-items: center;
          gap: 14px;
          font-family: 'Space Mono', monospace;
          font-size: calc(10px * var(--text-scale, 1));
          letter-spacing: 0.4em;
          color: #CFBFAA;
          opacity: 0.55;
          text-transform: uppercase;
          z-index: 3;
        }
        .wc-dx-eyebrow-rule {
          width: 56px;
          height: 1px;
          background: rgba(207,191,170,0.4);
        }

        /* hub */
        .wc-dx-hub {
          position: relative;
          width: 320px;
          aspect-ratio: 1 / 1;
          max-width: 32vh;
          margin-top: 0;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 3;
        }
        .wc-dx-hub-rings {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
        }
        .wc-dx-hub-text {
          position: relative;
          z-index: 2;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          text-align: center;
        }
        .wc-dx-hub-title {
          font-family: 'Space Mono', monospace;
          font-size: calc(15px * var(--text-scale, 1));
          letter-spacing: 0.45em;
          color: #CFBFAA;
          text-transform: uppercase;
        }
        .wc-dx-hub-sub {
          font-family: 'Space Mono', monospace;
          font-size: calc(9px * var(--text-scale, 1));
          letter-spacing: 0.4em;
          color: #CFBFAA;
          opacity: 0.5;
          text-transform: uppercase;
        }

        /* tree connector */
        .wc-dx-tree {
          position: relative;
          width: 78%;
          max-width: 1080px;
          height: 88px;
          flex-shrink: 0;
          z-index: 3;
        }
        .wc-dx-tree-stem {
          position: absolute;
          top: 0; left: 50%;
          width: 1px; height: 36px;
          background: rgba(207,191,170,0.35);
        }
        .wc-dx-tree-junction {
          position: absolute;
          top: 36px; left: 50%;
          width: 7px; height: 7px;
          border-radius: 999px;
          background: #CFBFAA;
          opacity: 0.7;
          transform: translate(-50%, -50%);
        }
        .wc-dx-tree-cross {
          position: absolute;
          top: 36px;
          left: 16.6667%;
          right: 16.6667%;
          height: 1px;
          background: rgba(207,191,170,0.35);
        }
        .wc-dx-tree-leg {
          position: absolute;
          top: 36px;
          width: 1px;
          height: 52px;
          background: rgba(207,191,170,0.35);
        }
        .wc-dx-tree-leg.l { left: 16.6667%; }
        .wc-dx-tree-leg.c { left: 50%; }
        .wc-dx-tree-leg.r { right: 16.6667%; }
        .wc-dx-tree-node {
          position: absolute;
          bottom: 0;
          width: 6px; height: 6px;
          border-radius: 999px;
          background: #CFBFAA;
          opacity: 0.6;
          transform: translate(-50%, 50%);
        }
        .wc-dx-tree-node.l { left: 16.6667%; }
        .wc-dx-tree-node.c { left: 50%; }
        .wc-dx-tree-node.r { left: auto; right: 16.6667%; transform: translate(50%, 50%); }

        /* columns */
        .wc-dx-cols {
          width: 78%;
          max-width: 1080px;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
          z-index: 3;
        }
        .wc-dx-col {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 10px;
          padding: 0 12px;
        }
        .wc-dx-col-num {
          font-family: 'Space Mono', monospace;
          font-size: calc(10px * var(--text-scale, 1));
          letter-spacing: 0.4em;
          color: #CFBFAA;
          opacity: 0.55;
          text-transform: uppercase;
          display: inline-flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 4px;
        }
        .wc-dx-col-name {
          font-family: 'Inter Tight', sans-serif;
          font-weight: 800;
          font-size: calc(22px * var(--text-scale, 1));
          letter-spacing: 0.06em;
          color: #CFBFAA;
          text-transform: uppercase;
          line-height: 1;
        }
        .wc-dx-col-tag {
          font-family: 'Space Mono', monospace;
          font-size: calc(10px * var(--text-scale, 1));
          letter-spacing: 0.3em;
          color: #5C8A8A;
          text-transform: uppercase;
          margin-bottom: 18px;
        }
        .wc-dx-col-desc {
          font-family: 'Space Mono', monospace;
          font-size: calc(11px * var(--text-scale, 1));
          line-height: 1.7;
          color: #CFBFAA;
          opacity: 0.7;
          letter-spacing: 0.02em;
          max-width: 30ch;
        }

        /* ---------- MOBILE ---------- */
        @media (max-width: 768px) {
          .wc-statement-line { font-size: calc(36px * var(--text-scale, 1)); }
          .wc-credo-line { font-size: calc(14px * var(--text-scale, 1)); letter-spacing: 0.1em; }
          .wc-cta-title, .wc-avail-title { font-size: calc(32px * var(--text-scale, 1)); }
          .wc-metric-num { font-size: calc(44px * var(--text-scale, 1)); }
          .wc-cap-title { font-size: calc(22px * var(--text-scale, 1)); }
          .wc-proof-inner { gap: 48px; flex-direction: column; align-items: center; }

          .wc-corner, .wc-corner-r { font-size: calc(9px * var(--text-scale, 1)); top: 18px; }
          .wc-corner { left: 18px; }
          .wc-corner-r { right: 18px; }

          .wc-cap-label { font-size: calc(10px * var(--text-scale, 1)); }
          .wc-cap-label.tl, .wc-cap-label.tr { top: 14%; }
          .wc-cap-label.bl, .wc-cap-label.br { bottom: 14%; }

          .wc-div-wrap, .wc-offers-wrap { padding: 56px 18px 28px; }
          .wc-div-grid, .wc-offers-grid { grid-template-columns: 1fr; }
          .wc-div-card { min-height: auto; padding: 28px 20px; }
          .wc-offer-card { min-height: auto; padding: 28px 20px; gap: 16px; }
          .wc-div-head-title, .wc-offers-head-title { font-size: calc(26px * var(--text-scale, 1)); }

          .wc-dx { padding: 36px 24px 24px; gap: 14px; }
          .wc-dx-frame { top: 14px; right: 14px; bottom: 14px; left: 14px; }
          .wc-dx-eyebrow { top: 28px; right: 24px; gap: 8px; }
          .wc-dx-eyebrow-rule { width: 24px; }
          .wc-dx-edge { letter-spacing: 0.4em; }
          .wc-dx-edge.l-top, .wc-dx-edge.l-bot { left: 28px; }
          .wc-dx-edge.r-top, .wc-dx-edge.r-bot { right: 28px; }
          .wc-dx-hub { width: 200px; max-width: 26vh; margin-top: 0; }
          .wc-dx-hub-title { font-size: calc(13px * var(--text-scale, 1)); letter-spacing: 0.35em; }
          .wc-dx-tree { width: 86%; height: 56px; }
          .wc-dx-tree-stem { height: 22px; }
          .wc-dx-tree-junction { top: 22px; }
          .wc-dx-tree-cross  { top: 22px; left: 8%; right: 8%; }
          .wc-dx-tree-leg    { top: 22px; height: 34px; }
          .wc-dx-tree-leg.l  { left: 8%; }
          .wc-dx-tree-leg.r  { right: 8%; }
          .wc-dx-tree-node.l { left: 8%; }
          .wc-dx-tree-node.r { right: 8%; }
          .wc-dx-cols { width: 92%; gap: 8px; }
          .wc-dx-col { padding: 0 4px; gap: 6px; }
          .wc-dx-col-name { font-size: calc(14px * var(--text-scale, 1)); }
          .wc-dx-col-tag { font-size: calc(9px * var(--text-scale, 1)); margin-bottom: 8px; }
          .wc-dx-col-desc { font-size: calc(10px * var(--text-scale, 1)); line-height: 1.6; }

          .wc-avail { padding: 48px 18px; }
          .wc-avail-slots { gap: 16px; }
          .wc-slot { width: 110px; padding: 22px 14px; }
          .wc-slot-num { font-size: calc(36px * var(--text-scale, 1)); }
          .wc-avail-detail { gap: 24px; }
          .wc-statement-inner { gap: 36px; }
        }
      `}</style>

      <div className="wc-wrap" style={{ '--text-scale': textScale, '--hero-tag-y': `${tagY}px` }}>
        <div className="wc-corner">
          <span className="wc-ochre-dot" />
          <span>Wolfe Co</span>
        </div>
        <div className="wc-corner-r">
          <span>VIC / AU</span>
          <span className="wc-ochre-dot" />
        </div>

        {/* DECK — mandatory snap on every section, including hero */}
        <div className="wc-deck">
          {/* 1. HERO */}
          <Section id="hero">
            <SectionMedia id="hero" overlay={0.4} />
            <div className="wc-hero-inner">
              <div className="wc-hero-mark" ref={heroMarkRef}>
                <WolfeMark size={88} />
              </div>
              <span className="wc-hero-tag">
                <span className="wc-ochre-dot" />
                Digital Content Creation
                <span className="wc-ochre-dot" />
              </span>
            </div>

            <div className="wc-scroll-cue">
              <span className="wc-scroll-line" />
            </div>
          </Section>
          {/* 2. STATEMENT */}
          <Section id="statement">
            <SectionMedia id="statement" overlay={0.55} />
            <StatementInner ref={statementRef} />
          </Section>

          {/* 3. DIVISIONS — schematic diagram layout */}
          <Section id="divisions" style={{ background: '#0a0a0c' }}>
            <SectionMedia id="divisions" overlay={0} />
            <DivisionsInner ref={divisionsRef} />
          </Section>

          {/* 4. CAPABILITIES */}
          <Section id="capabilities">
            <SectionMedia id="capabilities" overlay={0.4} />
            <CapabilitiesInner ref={capabilitiesRef} />
          </Section>

          {/* 5. OFFERS */}
          <Section id="offers" style={{ background: '#171618' }}>
            <SectionMedia id="offers" overlay={0} />
            <OffersInner ref={offersRef} />
          </Section>

          {/* 6. AVAILABILITY */}
          <Section id="availability" style={{ background: '#171618' }}>
            <SectionMedia id="availability" overlay={0} />
            <AvailabilityInner ref={availabilityRef} />
          </Section>

          {/* 7. PROOF */}
          <Section id="proof">
            <SectionMedia id="proof" overlay={0.65} />
            <ProofInner ref={proofRef} />
          </Section>

          {/* 8. CTA */}
          <Section id="cta" style={{ background: '#171618' }}>
            <SectionMedia id="cta" overlay={0} />
            <CTAInner ref={ctaRef} />
          </Section>
        </div>
      </div>
    </>
  );
}
