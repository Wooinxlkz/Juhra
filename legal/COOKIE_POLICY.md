# Juhra Cookie Policy

**Last updated:** [DATE OF FIRST PUBLIC RELEASE — fill in before publishing]

## This is a desktop app, not a website — so what does "cookies" even mean here?

Juhra is a native desktop application built on Tauri, not a web page loaded in a browser. It does not set HTTP cookies in the traditional sense. This policy exists anyway because Juhra's embedded webview *does* have access to browser-style storage (`localStorage`) and can make outbound web requests, and we think you deserve the same transparency and consent you'd get from a cookie policy on a website, even though the underlying mechanism is slightly different.

## What Juhra actually stores locally

| What | Where | Purpose | Expires |
|---|---|---|---|
| Privacy/consent choice (`juhra-privacy-consent`) | `localStorage`, this device only | Remembers whether you accepted or declined loading Google Fonts, so you're not asked every launch | Until you clear app data or uninstall |
| Theme preference (light/dark) | in-memory (React state) | Remembers your chosen theme for the current session | Cleared when you close the app (does not currently persist across restarts) |

Neither of these is transmitted anywhere. They stay on your device.

## Third-party requests ("the closest thing we have to a cookie")

The one outbound web request Juhra makes is to **Google Fonts**, to load the Manrope, DM Mono, and Space Grotesk typefaces — and only if you accept the in-app consent banner shown on first launch. This is the practical equivalent of a "strictly optional, non-essential cookie" on a website: declining doesn't break the app, it just falls back to your system's built-in fonts.

We do not use any:
- Advertising or ad-retargeting trackers
- Analytics or behavioral-tracking scripts
- Session-replay or heatmap tools
- Cross-site or cross-app tracking identifiers

If any of the above is ever added in a future version, this policy — and the consent banner — will be updated *before* it ships, not after.

## Your choice

The consent banner gives you two real, equally-supported options: **Accept** or **Decline**. Declining is not a dead end, a dark pattern, or a degraded experience beyond the (cosmetic) font fallback. You can change your mind by clearing the app's local storage or reinstalling, which resets the choice and shows the banner again.

## Contact

Questions about this policy: **karimsc01t@gmail.com**

---

See also: [Privacy Policy](PRIVACY_POLICY.md) · [Terms of Service](TERMS_OF_SERVICE.md)
