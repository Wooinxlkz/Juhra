# Changelog

All notable changes to Juhra are documented here. Versions match the tag
the [release workflow](.github/workflows/release.yml) builds from
(`src-tauri/tauri.conf.json`'s `version` field).

## v0.2.0

Four features, all in one release:

- **Store & Library pages** (`/store`, `/library`) — real pages behind
  nav links that already existed but went nowhere. Store shows 3 new
  games with an "Add to Library" action; Library shows everything owned
  with a grid/list toggle and A–Z/Status sort. Session-only, same as
  Community — additions don't survive a restart yet.
- **Achievements tab** — a fifth GameHub tab per game, with a completion
  progress bar and locked/unlocked achievement cards (rarity %, unlock
  date).
- **Real notifications** — a Bell button in the Topbar with an unread
  badge, opening a real notification menu (mark one read, mark all
  read). Also fixed a real pre-existing bug while wiring this up: the
  Notifications and Social tabs in Settings were reusing General tab's
  state variables by copy-paste mistake, so toggling "Desktop
  notifications" was silently flipping "Launch with Juhra" behind the
  scenes. Now has its own dedicated state.
- **In-app update checker** — a "Check for Updates" button in Settings,
  plus an automatic check ~3s after launch that shows a dismissible
  banner if a newer version is out. Checks GitHub Releases directly
  (`src-tauri/src/lib.rs`), no signing/updater-artifact infrastructure
  needed. **Requires setup:** `GITHUB_REPO` in `lib.rs` is a placeholder
  (`"your-github-username/Juhra"`) — set it to your actual repo or this
  feature will always report "Couldn't check for updates."

## v0.1.9



- **Fixed a build-breaking config error** from v0.1.8: the NSIS
  `license` field I added doesn't exist — the real Tauri v2 schema
  (`additionalProperties: false` throughout) puts the license file at
  the top level as `bundle.licenseFile`, not under `bundle.windows.nsis`.
  Moved it there and verified the exact key list against Tauri's
  published schema this time instead of assuming. Everything else from
  v0.1.8 (installer branding, license page, Community CSS fixes) is
  unchanged.

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
