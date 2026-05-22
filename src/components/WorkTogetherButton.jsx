import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

const PHONE_DISPLAY = '0400 000 000';
const PHONE_DIGITS  = '0400000000';
const EMAIL         = 'jeffo.productions@gmail.com';

export default function WorkTogetherButton({ buttonClassName, buttonStyle }) {
  const [open, setOpen] = useState(false);
  const [phoneOpen, setPhoneOpen] = useState(false);

  const close = () => { setOpen(false); setPhoneOpen(false); };

  // ESC to close
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') close(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <>
      <button
        type="button"
        className={buttonClassName}
        style={buttonStyle}
        onClick={() => setOpen(true)}
      >
        Let's Work Together
      </button>

      {open && typeof document !== 'undefined' && createPortal(
        <div className="wc-contact-backdrop" onClick={close}>
          <div
            className="wc-contact-modal"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Contact"
          >
            <button
              type="button"
              className="wc-contact-modal-cta"
              onClick={close}
            >
              Let's Make Some Cool Shit
            </button>

            <div className="wc-contact-panel">
              {/* Phone — label flips to the number when expanded, Text + Call slide in below */}
              <button
                type="button"
                className="wc-contact-row"
                onClick={() => setPhoneOpen((p) => !p)}
                aria-expanded={phoneOpen}
              >
                <span className="wc-contact-row-label">
                  {phoneOpen ? PHONE_DISPLAY : 'Phone'}
                </span>
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
                className="wc-contact-row"
              >
                Email
              </a>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
