// Prevents additional console window on Windows in release, DO NOT REMOVE.
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    // Best-effort mitigation for a known WebView2 (Chromium/Edge) rendering
    // bug on Windows where fixed-position elements using `backdrop-filter`
    // combined with GPU compositing can flicker/strobe. Disabling native
    // window-occlusion tracking avoids one common trigger for it. Must be
    // set before the webview is created.
    #[cfg(target_os = "windows")]
    {
        std::env::set_var(
            "WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS",
            "--disable-features=CalculateNativeWinOcclusion",
        );
    }

    juhra_lib::run()
}
