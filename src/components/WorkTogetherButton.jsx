import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

const PHONE_DISPLAY = '0400 000 000';
const PHONE_DIGITS  = '0400000000';

// Placeholder topic addresses — swap with real inboxes.
const EMAIL_TOPICS = [
  { label: 'Apps / Systems', to: 'apps@wolfe.co' },
  { label: 'Content',        to: 'content@wolfe.co' },
  { label: 'Brand',          to: 'brand@wolfe.co' },
  { label: 'Other',          to: 'hello@wolfe.co' },
];

const mailtoFor = (opt) =>
  `mailto:${opt.to}?subject=${encodeURIComponent(`Enquire about: ${opt.label}`)}`;

export default function WorkTogetherButton({ buttonClassName, buttonStyle }) {
  const [open, setOpen] = useState(false);
  const [phoneOpen, setPhoneOpen] = useState(false);
  const [emailOpen, setEmailOpen] = useState(false);
  const [revealedEmail, setRevealedEmail] = useState(null);
  const [toast, setToast] = useState(false);
  const toastTimer = useRef(0);

  const close = () => {
    setOpen(false);
    setPhoneOpen(false);
    setEmailOpen(false);
    setRevealedEmail(null);
    setToast(false);
    if (toastTimer.current) clearTimeout(toastTimer.current);
  };

  const flashToast = () => {
    setToast(true);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(false), 1800);
  };

  // Mobile: fire mailto (native Mail app opens).
  // Desktop: copy address to clipboard + reveal it on the button (most
  // desktop browsers don't have a mailto handler, so this is more reliable).
  const handleEnquiry = (opt) => {
    const isCoarse = typeof window !== 'undefined' &&
      window.matchMedia('(pointer: coarse)').matches;

    // Always copy to clipboard
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(opt.to).catch(() => {});
      }
    } catch (_) { /* ignore */ }

    flashToast();

    if (isCoarse) {
      const subject = `Enquire about: ${opt.label}`;
      window.location.href = `mailto:${opt.to}?subject=${encodeURIComponent(subject)}`;
    } else {
      setRevealedEmail(opt.label);
    }
  };

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
                  <button
                    type="button"
                    className="wc-contact-sub"
                    onClick={() => { window.location.href = `sms:${PHONE_DIGITS}`; }}
                  >Text</button>
                  <button
                    type="button"
                    className="wc-contact-sub"
                    onClick={() => { window.location.href = `tel:${PHONE_DIGITS}`; }}
                  >Call</button>
                </div>
              )}

              {/* Email — tap to reveal 4 enquiry topic buttons */}
              <button
                type="button"
                className="wc-contact-row"
                onClick={() => setEmailOpen((e) => !e)}
                aria-expanded={emailOpen}
              >
                <span className="wc-contact-row-label">Email</span>
                <span className={`wc-contact-arrow ${emailOpen ? 'open' : ''}`} aria-hidden>›</span>
              </button>
              {emailOpen && (
                <div className="wc-email-options">
                  <div className="wc-email-options-header">Enquire About</div>
                  {EMAIL_TOPICS.map((opt) => (
                    <button
                      key={opt.label}
                      type="button"
                      className={`wc-contact-sub ${revealedEmail === opt.label ? 'is-revealed' : ''}`}
                      onClick={() => handleEnquiry(opt)}
                      title={opt.to}
                    >
                      {revealedEmail === opt.label ? opt.to : opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {toast && (
              <div className="wc-contact-toast" role="status">
                Email address copied
              </div>
            )}
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
