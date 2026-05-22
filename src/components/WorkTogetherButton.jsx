import React, { useState } from 'react';

// Update these in one place.
const PHONE_DISPLAY = '0400 000 000';
const PHONE_DIGITS  = '0400000000';
const EMAIL         = 'jeffo.productions@gmail.com';

export default function WorkTogetherButton({ buttonClassName, buttonStyle }) {
  const [open, setOpen] = useState(false);
  const [phoneOpen, setPhoneOpen] = useState(false);

  return (
    <div className="wc-contact-cta">
      <button
        type="button"
        className={buttonClassName}
        style={buttonStyle}
        onClick={() => setOpen((o) => !o)}
      >
        {open ? "Let's Make Some Cool Shit" : "Let's Work Together"}
      </button>

      {open && (
        <div className="wc-contact-panel">
          {/* Phone row — tap to reveal Text + Call */}
          <button
            type="button"
            className="wc-contact-row"
            onClick={() => setPhoneOpen((p) => !p)}
            aria-expanded={phoneOpen}
          >
            <span>{PHONE_DISPLAY}</span>
            <span className={`wc-contact-arrow ${phoneOpen ? 'open' : ''}`} aria-hidden>›</span>
          </button>

          {phoneOpen && (
            <div className="wc-contact-subrow">
              <a href={`sms:${PHONE_DIGITS}`} className="wc-contact-sub">Text</a>
              <a href={`tel:${PHONE_DIGITS}`} className="wc-contact-sub">Call</a>
            </div>
          )}

          {/* Email — direct mailto */}
          <a
            href={`mailto:${EMAIL}`}
            className="wc-contact-row wc-contact-link"
          >
            {EMAIL}
          </a>
        </div>
      )}
    </div>
  );
}
