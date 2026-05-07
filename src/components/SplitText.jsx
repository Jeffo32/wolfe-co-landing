import React from 'react';

// Word-level splitter. Each word becomes a span.wc-word with --i index.
// Use a fresh splitter per render so the counter resets each time React re-renders.
export function makeWordSplitter(start = 0) {
  let i = start;
  return function splitWords(text) {
    const parts = String(text).split(/(\s+)/);
    const out = [];
    parts.forEach((part, idx) => {
      if (part === '') return;
      if (/^\s+$/.test(part)) {
        out.push(part);
        return;
      }
      out.push(
        <span key={`w-${i}-${idx}`} className="wc-word" style={{ '--i': i }}>
          {part}
        </span>
      );
      i++;
    });
    return out;
  };
}

// Creates a closure that hands out monotonically-increasing letter indices.
// Use a fresh splitter per render so the counter resets each time React re-renders.
export function makeSplitter(start = 0) {
  let i = start;
  return function split(text) {
    const out = [];
    Array.from(text).forEach((ch, idx) => {
      if (ch === ' ') {
        out.push(' '); // plain whitespace text node — browser handles word spacing
      } else {
        out.push(
          <span
            key={`${i}-${idx}`}
            className="wc-letter"
            style={{ '--i': i }}
          >
            {ch}
          </span>
        );
        i++;
      }
    });
    return out;
  };
}
