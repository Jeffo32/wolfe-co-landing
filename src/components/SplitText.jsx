import React from 'react';

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
