# Juhra

Juhra is a desktop game client — browse, discover, manage, and launch your game
library — built with [Tauri](https://tauri.app/) 2, Rust, React, Vite and
Tailwind CSS v4.

The project uses the same toolchain and build pipeline as the Xuro desktop app
(Bun + Vite + Rust/Cargo + Tauri), trimmed down to what a game client needs.

## v0.1.2 fixes

- Fixed a real bug: the settings modal's per-game accent class was written
  as `'...${contextGame.id}'` (single quotes — the interpolation never
  ran). Now a proper template literal.
- Split every dropdown/panel that both animates (Framer Motion
  opacity/scale/transform) **and** uses `backdrop-filter` into two
  layers: an outer element that only handles position/animation, and a
  static inner `-surface` element that carries the blur. Animating
  opacity/transform on the same element as `backdrop-filter` is a known
  WebView2/Chromium compositor bug that causes flicker and, worse, a
  paint/hit-test desync where the element stops responding to clicks.
  Applied to: the account menu, the game menu, the settings modal, and
  the friends panel (which also had backdrop-filter applied twice —
  removed the duplicate).
- Removed an animated `filter: blur()` transition on the in-game tab
  content — animating `filter` is one of the most GPU-expensive things
  you can animate and was a likely cause of the top tab bar feeling
  unresponsive when clicked in quick succession.
- Shrunk the window drag region from covering the full topbar down to a
  220px strip on the left (behind the title, where there's always empty
  space) so it can't ever sit over the in-game tab bar or the account/
  social dropdowns, which live in the same top strip.
- Follow-up pass: found that the sidebar rail, the in-game tab bar
  container itself, and the theme toggle also had `backdrop-filter`
  while containing a child that animates on every interaction (a
  layoutId active-indicator, or a spring-driven toggle thumb) — same bug
  family, just one level up (ancestor has the blur, child animates).
  Removed `backdrop-filter` from those three and compensated with a more
  opaque solid background so they don't look flat without the blur.
- Logo reprocessed and reinstalled again from the source image (same
  upload, verified byte-identical to previous rounds via hash).

## Window behavior

Juhra runs frameless, like the Riot Games client — no native title bar at
all, so there's no maximize button anywhere (not just disabled/greyed out).
The app draws its own minimize/close controls (top-right of the topbar, and
on the sign-in screen) wired to the Tauri window API in
`src/lib/window-controls.ts`. The window is fixed at 1280×720 and cannot be
resized (`"resizable": false`), matching a Riot-client-style launcher.

Relevant config in `src-tauri/tauri.conf.json`:
- `"decorations": false` — no OS title bar/buttons
- `"resizable": false`, `"maximizable": false` — fixed size, locked
- `"width"/"height": 1280/720` with matching min/max — hard-locks the size
- `"backgroundColor": "#0b0d11"` — avoids a white flash while the webview
  paints its first frame on startup

## Development

```bash
bun install
bun run dev        # web-only dev server
bun run tauri dev  # full desktop app with hot reload
```

## Building

```bash
bun run build:windows   # NSIS installer (.exe)
bun run build:mac       # .app / .dmg
bun run build:linux     # .deb / AppImage
```

Version numbers are kept in sync across `package.json`, `src-tauri/Cargo.toml`
and `src-tauri/tauri.conf.json` by:

```bash
bun run version:sync
```

## Releases

Pushing a tag like `v0.1.0` (matching the version in
`src-tauri/tauri.conf.json`) triggers `.github/workflows/release.yml`, which
builds the Windows installer and publishes it to a GitHub Release. You can
also trigger it manually via `workflow_dispatch` with an existing tag.

## Project structure

```
src/            React/TypeScript UI (Juhra client, sign-in gate, per-game themes)
src-tauri/      Rust/Tauri desktop shell
assets/         Images and video used by the UI
public/         Static files served as-is (favicon, robots.txt)
scripts/        Version sync helper
.github/        Release workflow
```
