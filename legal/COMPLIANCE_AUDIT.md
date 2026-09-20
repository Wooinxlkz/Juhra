# Juhra Compliance Audit — v0.1.3

This documents what was actually checked in the codebase, what was found, and what was fixed. It's written to be verifiable against the source, not a generic checklist — every line item below references the actual file/component involved. Where something is out of scope for a code audit (business registration, real legal review, a live payment processor's terms), that's stated explicitly rather than glossed over.

## Consent & data minimization

- **Finding:** The app statically loaded three Google Fonts on every launch with no disclosure or consent, plus an unused `Inter` font link that was never applied anywhere in the CSS (dead weight, an extra unnecessary request).
- **Fix:** Removed the unused `Inter` link entirely (`index.html`). Replaced the static font `@import` with a consent-gated loader (`src/lib/font-consent.ts`) — the app makes **zero** third-party network calls on a fresh install until the person answers the banner (`src/components/consent-banner.tsx`). Declining is fully functional: the app permanently falls back to system fonts and never contacts Google.

## Third-party SDK audit

Searched the entire frontend (`*.tsx`) for analytics, telemetry, tracking, or arbitrary network-call patterns (`analytics`, `gtag`, `mixpanel`, `segment`, `amplitude`, `sentry`, `fetch(`, `axios`, `track(`), and the Rust backend (`Cargo.toml`, `src-tauri/src/`) for networking or telemetry crates (`reqwest`, `http::`).

- **Result:** None found, in either the frontend or the Rust backend. `Cargo.toml`'s only dependencies are Tauri core, the opener/dialog/single-instance plugins, and serde — no networking crate at all.
- **Result:** No `localStorage`/`sessionStorage`/`indexedDB` usage existed anywhere before this pass (confirmed by search). The only local storage now in the app is the consent choice described above.
- **Conclusion:** Google Fonts (now consent-gated) is genuinely the only third party Juhra talks to, as of this version.

## Dark patterns / hidden fees / fake reviews / unsupported claims

Searched all UI copy in the frontend for review/rating/testimonial language, urgency or scarcity phrasing, pricing text, and superlative claims.

- **Fake reviews:** None found. The community/forum section shows placeholder post authors (e.g. "Mara Voss") as clearly fictional example content representing what a live community feed would look like — not presented as real testimonials, star ratings, or review counts.
- **Hidden fees:** No pricing or checkout UI exists in the app yet — there is currently no purchase flow to audit. The [Refund Policy](REFUND_POLICY.md) and [Terms of Service](TERMS_OF_SERVICE.md) commit in writing, in advance, that when purchases are added, the price shown at checkout will be the final price with no fee added afterward.
- **Unsupported claims:** No "#1", "best", "guaranteed", or unverifiable superlative language found anywhere in the UI copy.
- **Dark patterns:** No countdown timers, fake scarcity ("only 2 left"), forced continuity, or confirm-shaming language found. The new consent banner presents Accept/Decline as equal-weight buttons, not a highlighted "accept" next to a de-emphasized "decline" link.

## Accessibility — color contrast

Computed actual WCAG 2.1 contrast ratios (not visual estimation) for every `color:` declaration in both stylesheets against their respective backgrounds, using the standard relative-luminance formula.

- **Dark theme:** Found 23 distinct selectors (73 declarations across theme/media-query variants) using white text below the 4.5:1 AA threshold for normal text — as low as 2.4:1 in places (settings sidebar footer, version label, a friend-row icon). Bumped all of them to a minimum alpha that guarantees ≥5:1.
- **Light theme:** Found the equivalent issue for dark-on-light text (28 declarations), bumped to ≥5:1.
- **Sign-in screen:** Found one genuine failure — the email/password input placeholder text at 2.4:1. Fixed to ~5.7:1.
- **Not done / out of scope for this pass:** A full manual screen-reader pass and complete keyboard-navigation audit were not performed. Contrast was fixed programmatically and verified by calculation; visual review of the actual rendered app (which this environment can't run) is still worth doing before shipping.

## Fonts — licensing

- Manrope, DM Mono, and Space Grotesk (loaded via Google Fonts, now consent-gated) are all released under the **SIL Open Font License (OFL)**, which permits commercial use, bundling, and redistribution at no cost and with no royalty.
- **Not done:** The fonts are still loaded from Google's CDN rather than self-hosted/bundled into the app. Self-hosting would remove the third-party network call entirely (rather than just gating it behind consent) — this wasn't done in this pass because it requires downloading the actual font binary files, which wasn't possible in this working environment. If you want this, download the `.woff2` files for these three families from Google Fonts and drop them in `src/assets/fonts/`; the `@font-face` rules and the change to `font-consent.ts` to serve them locally are a small follow-up.

## Images & video — licensing

- The bundled art (`assets/generated_images/`, `assets/generated_videos/`) is named in a way that strongly indicates it was produced by an AI image/video generation tool, not licensed stock photography or original artwork commissioned from an artist.
- **Not verified, and can't be from a code audit alone:** which specific tool generated this content, and what that tool's terms of service say about commercial usage rights and ownership of the output. This varies significantly by generator and has been a genuinely unsettled legal area in several jurisdictions. **Before enabling any purchase/monetization functionality, confirm the provenance and commercial-use rights of every file under `assets/generated_images/` and `assets/generated_videos/`, or replace them with art you have clear commercial rights to.** This is flagged as a real open item, not resolved by this audit.

## Age / children's data

- The app requires no account, name, email, or other personal identifier to use in its current form, so there is currently nothing for a minor to submit.
- Privacy Policy §5 commits to age-confirmation at the point of purchase once in-game purchases are enabled, consistent with standard platform/payment-processor requirements.
- **Not done:** No COPPA-specific or Algeria-specific minors'-data legal review was performed — this is genuinely a legal question, not a code one, and should go to a lawyer before purchases involving minors are enabled.

## Unsubscribe & data deletion

- No email-sending functionality exists in the app yet, so there is nothing to unsubscribe from today.
- Process and response-time commitments for when email/accounts are added are documented in [DATA_DELETION_REQUESTS.md](DATA_DELETION_REQUESTS.md), including the requirement that marketing unsubscribes never silently cut off required transactional email, and vice versa.

## What this audit does **not** cover

Being direct about the boundary of what a code-level audit can actually verify:
- **Business registration / trade license status in Algeria** — a legal/administrative question, not a code one.
- **The actual terms of whichever payment processor is eventually integrated** — can't be audited before that integration exists.
- **A licensed lawyer's review of the drafted policies** — every legal document in `legal/` says this explicitly and should not be treated as final legal advice.
- **Live, rendered visual/accessibility testing** — contrast was fixed by calculation against the source CSS; this wasn't visually verified in a running build, since this environment can't run the compiled app.

---

See also: [Privacy Policy](PRIVACY_POLICY.md) · [Terms of Service](TERMS_OF_SERVICE.md) · [Cookie Policy](COOKIE_POLICY.md) · [Refund Policy](REFUND_POLICY.md)
