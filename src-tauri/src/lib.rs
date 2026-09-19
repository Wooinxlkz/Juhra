use tauri::Manager;

/// Bring the main window to the front — used when a second launch is
/// attempted while Juhra is already running (single-instance), so
/// re-clicking the app icon focuses the existing window instead of
/// silently doing nothing.
pub(crate) fn focus_main_window(app: &tauri::AppHandle) {
    let Some(window) = app.get_webview_window("main") else {
        return;
    };
    let _ = window.unminimize();
    let _ = window.show();
    let _ = window.set_focus();
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let mut builder = tauri::Builder::default();

    // Must be registered first: if Juhra is already running and the user
    // launches it again (desktop icon, Start menu, taskbar pin), this stops
    // a second process from starting and instead focuses the existing
    // window.
    #[cfg(desktop)]
    {
        builder = builder.plugin(tauri_plugin_single_instance::init(|app, _args, _cwd| {
            focus_main_window(app);
        }));
    }

    builder
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .setup(|_app| Ok(()))
        .run(tauri::generate_context!())
        .expect("error while running Juhra");
}
