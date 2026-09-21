# Changelog

All notable changes to Juhra are documented here. Versions match the tag
the [release workflow](.github/workflows/release.yml) builds from
(`src-tauri/tauri.conf.json`'s `version` field).

## v0.1.8

- **Custom-branded Windows installer:** the setup UI no longer uses the
  default NSIS look. `src-tauri/installer/header.bmp` and `sidebar.bmp`
  were regenerated with the current app icon, on-brand dark background,
  and the same amber/gold accent used on the sign-in screen (they
  existed before but still had the *old* logo — now updated). Added a
  license page wired to the real [LICENSE](LICENSE)
  (`src-tauri/installer/LICENSE.txt`), shown during setup.
- **Community tab audit:** cross-checked every CSS class used across
  Discussions/Suggestions/Reviews/Guides against the stylesheet — found
  and fixed 3 that had no matching rule (`reference-community-discussions`,
  `reference-community-guides`, `reference-community-thread`), which
  would have rendered as unstyled containers. Also verified switching
  between games correctly resets Community's mock data (it does — the
  route wrapper is keyed by path, which changes per game, so the whole
  tree remounts).

## v0.1.7

- **Fixed:** Patch Notes, Merch, and Community tabs (inside a game's page)
  now fade in/out the same way the Overview tab already did. Previously
  those three had no transition at all and popped in/out instantly —
  the one real gap found in a full tab/menu/page flicker audit.
- **Updated:** [Compliance audit](legal/COMPLIANCE_AUDIT.md) re-run
  against everything added in v0.1.6 (tray icon, Community rebuild) —
  no new findings.
- Added this changelog.

## v0.1.6

- **Added:** Windows system tray icon and menu (`src-tauri/src/lib.rs`) —
  app name, All Games, a switcher for each game, Settings, Sign Out,
  Exit. Uses the app icon; routes and focuses the window on click.
- **Rebuilt:** the Community tab, from a static mock page into four real
  interactive sections — Discussions (with replies and sorting),
  Suggestions (up/down voting, status badges), Reviews (star ratings,
  aggregate score), and Guides. Session-only (no backend yet) — see the
  comment at the top of the Community section in
  `src/JuhraReferenceClient.tsx` for what a real backend integration
  would need to change.

## v0.1.5

- **Replaced:** the app and installer icon (`src-tauri/icons/*` —
  `Juhra.exe` and the NSIS setup executable) with new artwork. In-app UI
  logos were intentionally left untouched.
- **Fixed:** a UI flicker where the account menu and the game-library
  menu — anchored to the same fixed corner of the window — could
  briefly render on top of each other when switching directly from one
  to the other. Replaced the two independent open/closed states with a
  single mutually-exclusive one, isolated in its own `mode="wait"`
  animation group.

## v0.1.4 and earlier

Baseline. See [Compliance Audit §v0.1.3](legal/COMPLIANCE_AUDIT.md) for
the consent, third-party SDK, dark-pattern, and accessibility work done
up to that point.
