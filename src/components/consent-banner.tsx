import { useState } from 'react';
import { getStoredConsent, setStoredConsent, type ConsentChoice } from '@/lib/font-consent';

// Juhra collects nothing and sends nothing anywhere on its own — no
// analytics, no telemetry, no tracking SDKs (see LEGAL/COMPLIANCE_AUDIT.md
// for what was actually checked, not just claimed). The one exception is
// loading three fonts from Google's servers, which contacts a third party
// before the person has agreed to anything. This banner is that consent
// gate, and it's wired to something real: declining actually stops the
// network call (see src/lib/font-consent.ts), it isn't a dead checkbox.
export function ConsentBanner() {
  const [choice, setChoice] = useState<ConsentChoice | null>(() => getStoredConsent());

  if (choice !== null) return null;

  const decide = (next: ConsentChoice) => {
    setStoredConsent(next);
    setChoice(next);
  };

  return (
    <div className="juhra-consent-banner" role="dialog" aria-labelledby="juhra-consent-title" aria-describedby="juhra-consent-body">
      <div className="juhra-consent-copy">
        <strong id="juhra-consent-title">Before you start</strong>
        <p id="juhra-consent-body">
          Juhra doesn't collect or transmit any data on its own — no accounts, no analytics, no tracking.
          The one exception: with your permission, it loads its typefaces from Google Fonts, which means
          contacting Google's servers. Decline and Juhra uses your system fonts instead, permanently, and
          never makes that call. Your choice is stored only on this device.
        </p>
      </div>
      <div className="juhra-consent-actions">
        <button type="button" className="juhra-consent-decline" onClick={() => decide('declined')}>
          Decline
        </button>
        <button type="button" className="juhra-consent-accept" onClick={() => decide('accepted')}>
          Accept
        </button>
      </div>
    </div>
  );
}
