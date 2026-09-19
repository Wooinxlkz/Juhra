# Juhra

Juhra is a desktop game client — browse, discover, manage, and launch your game
library — built with [Tauri](https://tauri.app/) 2, Rust, React, Vite and
Tailwind CSS v4.

The project uses the same toolchain and build pipeline as the Xuro desktop app
(Bun + Vite + Rust/Cargo + Tauri), trimmed down to what a game client needs.

## Window behavior

The main window intentionally has **no maximize button** — only minimize and
close, set via `"maximizable": false` in `src-tauri/tauri.conf.json`.

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
