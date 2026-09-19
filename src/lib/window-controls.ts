// Thin wrapper around the Tauri window API for the custom, chrome-less
// title bar. Juhra ships with `decorations: false` (no native title bar,
// no maximize button at all — not just disabled), so the app draws its
// own minimize/close controls and calls these.
//
// Falls back to no-ops when running outside a Tauri webview (e.g. `bun run
// dev` in a regular browser tab) so the UI still renders without crashing.

function isTauri(): boolean {
  return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
}

export async function minimizeWindow(): Promise<void> {
  if (!isTauri()) return;
  try {
    const { getCurrentWindow } = await import('@tauri-apps/api/window');
    await getCurrentWindow().minimize();
  } catch {
    // Ignore — running outside Tauri or the API isn't available yet.
  }
}

export async function closeWindow(): Promise<void> {
  if (!isTauri()) return;
  try {
    const { getCurrentWindow } = await import('@tauri-apps/api/window');
    await getCurrentWindow().close();
  } catch {
    // Ignore — running outside Tauri or the API isn't available yet.
  }
}
