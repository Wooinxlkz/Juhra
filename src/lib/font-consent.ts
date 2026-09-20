// Juhra's only third-party network call is loading three type families
// (Manrope, DM Mono, Space Grotesk) from Google Fonts. That call sends
// the person's IP address to Google before they've agreed to anything,
// which is exactly what the privacy notice in <ConsentBanner /> exists to
// get ahead of. So the stylesheet is never statically imported — it's
// injected here, and only after explicit consent. Declining (or not
// deciding yet) means the app renders with the system font stack in
// index.css and never contacts Google at all.
//
// The consent choice itself is the one piece of local data this app
// persists (localStorage, this device only, never transmitted anywhere)
// — disclosed in LEGAL/PRIVACY_POLICY.md and LEGAL/COOKIE_POLICY.md.

const STORAGE_KEY = 'juhra-privacy-consent';
const FONTS_HREF =
  'https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Manrope:wght@400;500;600;700;800&family=Space+Grotesk:wght@400;500;600;700&display=swap';
const LINK_ID = 'juhra-google-fonts';

export type ConsentChoice = 'accepted' | 'declined';

export function getStoredConsent(): ConsentChoice | null {
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    return value === 'accepted' || value === 'declined' ? value : null;
  } catch {
    // Storage unavailable (e.g. disabled) — treat as no decision yet.
    return null;
  }
}

export function setStoredConsent(choice: ConsentChoice): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, choice);
  } catch {
    // Ignore — worst case the banner asks again next launch.
  }
  if (choice === 'accepted') {
    loadGoogleFonts();
  } else {
    unloadGoogleFonts();
  }
}

export function loadGoogleFonts(): void {
  if (document.getElementById(LINK_ID)) return;
  const link = document.createElement('link');
  link.id = LINK_ID;
  link.rel = 'stylesheet';
  link.href = FONTS_HREF;
  document.head.appendChild(link);
}

export function unloadGoogleFonts(): void {
  document.getElementById(LINK_ID)?.remove();
}

// Called once at startup: only actually loads the fonts if the person
// already accepted on a previous launch. A fresh install makes zero
// third-party network calls until the banner is answered.
export function applyStoredConsent(): void {
  if (getStoredConsent() === 'accepted') {
    loadGoogleFonts();
  }
}
