import React from 'react';

// Click handlers wired up later — for now they're no-ops.
const noop = () => {};

export default function TopNav() {
  return (
    <header className="wc-topbar" role="banner">
      <button
        type="button"
        className="wc-topbar-cta"
        onClick={noop}
      >
        Let's Work Together
      </button>

      <nav className="wc-topbar-nav" aria-label="Sections">
        <button type="button" className="wc-topbar-link" onClick={noop}>
          View Content
        </button>
        <button type="button" className="wc-topbar-link" onClick={noop}>
          View Builds
        </button>
        <button type="button" className="wc-topbar-link" onClick={noop}>
          View Brand
        </button>
      </nav>
    </header>
  );
}
