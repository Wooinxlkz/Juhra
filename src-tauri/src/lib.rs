use tauri::menu::{MenuBuilder, MenuItemBuilder};
use tauri::tray::TrayIconBuilder;
use tauri::{Emitter, Manager};

/// The games shown in the tray menu, in display order. Kept in one place
/// so the tray menu is easy to keep in sync with the `games` array in
/// src/JuhraReferenceClient.tsx — id must match that array's `id` field
/// exactly, since it's used to build the `/games/{id}` route.
const TRAY_GAMES: &[(&str, &str)] = &[
    ("ashen-reach", "Ashen Reach"),
    ("red-assembly", "Red Assembly"),
    ("blue-echo", "Blue Echo"),
    ("palace-of-dust", "Palace of Dust"),
];

/// Bring the main window to the front — used when a second launch is
/// attempted while Juhra is already running (single-instance), so
/// re-clicking the app icon focuses the existing window instead of
/// silently doing nothing. Also used by the tray menu, since clicking a
/// game/settings entry there should surface the window, not just
/// navigate it in the background.
pub(crate) fn focus_main_window(app: &tauri::AppHandle) {
    let Some(window) = app.get_webview_window("main") else {
        return;
    };
    let _ = window.unminimize();
    let _ = window.show();
    let _ = window.set_focus();
}

/// Focus the window, then tell the frontend to route to `path`. The
/// frontend listens for this on the "juhra://navigate" event (see the
/// `useEffect` near the top of `Client()` in JuhraReferenceClient.tsx)
/// and hands it to wouter's `setPath`.
fn focus_and_navigate(app: &tauri::AppHandle, path: &str) {
    focus_main_window(app);
    let _ = app.emit("juhra://navigate", path);
}

/// Build the system tray icon and its menu — the Windows-taskbar-area
/// flyout the app icon shows (Riot Client style): app name, a game
/// switcher, then Settings / Sign Out / Exit. This is additive to the
/// existing window — it doesn't change what closing the window does.
fn build_tray(app: &tauri::AppHandle) -> tauri::Result<()> {
    let header = MenuItemBuilder::with_id("header", "Juhra")
        .enabled(false)
        .build(app)?;
    let all_games = MenuItemBuilder::with_id("all_games", "All Games").build(app)?;

    let mut menu_builder = MenuBuilder::new(app)
        .item(&header)
        .separator()
        .item(&all_games)
        .separator();

    for (id, title) in TRAY_GAMES {
        let item = MenuItemBuilder::with_id(format!("game_{id}"), *title).build(app)?;
        menu_builder = menu_builder.item(&item);
    }

    let settings = MenuItemBuilder::with_id("settings", "Settings").build(app)?;
    let sign_out = MenuItemBuilder::with_id("sign_out", "Sign Out").build(app)?;
    let exit = MenuItemBuilder::with_id("exit", "Exit").build(app)?;

    let menu = menu_builder
        .separator()
        .item(&settings)
        .item(&sign_out)
        .separator()
        .item(&exit)
        .build()?;

    TrayIconBuilder::with_id("main-tray")
        .icon(app.default_window_icon().unwrap().clone())
        .menu(&menu)
        .show_menu_on_left_click(true)
        .tooltip("Juhra")
        .on_menu_event(|app, event| match event.id().as_ref() {
            "exit" => app.exit(0),
            "all_games" => focus_and_navigate(app, "/games"),
            "settings" => {
                focus_main_window(app);
                let _ = app.emit("juhra://open-settings", ());
            }
            "sign_out" => {
                focus_main_window(app);
                let _ = app.emit("juhra://sign-out", ());
            }
            id if id.starts_with("game_") => {
                let game_id = id.trim_start_matches("game_");
                focus_and_navigate(app, &format!("/games/{game_id}"));
            }
            _ => {}
        })
        .build(app)?;

    Ok(())
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
        .setup(|app| {
            build_tray(&app.handle())?;
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running Juhra");
}
