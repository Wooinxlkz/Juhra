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

/// GitHub "owner/repo" the update checker looks at for releases — the
/// same repo `.github/workflows/release.yml` publishes to.
///
/// ⚠️ PLACEHOLDER — this must be set to your actual GitHub repo before
/// this feature will work. Until then, `check_for_updates` will just
/// return an error (surfaced in Settings as "Couldn't check for
/// updates"), which is a safe, non-breaking failure mode — it does not
/// stop the app from building or running.
const GITHUB_REPO: &str = "your-github-username/Juhra";

#[derive(serde::Serialize, Clone)]
#[serde(rename_all = "camelCase")]
struct UpdateCheckResult {
    available: bool,
    latest_version: String,
    url: String,
}

/// Parses a semver-ish "x.y.z" string (an optional leading "v" is
/// stripped first) into up to 3 numeric components for comparison.
/// Unparsable or missing components are treated as 0, which is a
/// deliberately forgiving fallback — worst case a malformed tag just
/// looks equal to 0.0.0 rather than crashing the check.
fn parse_version(raw: &str) -> [u32; 3] {
    let trimmed = raw.trim().trim_start_matches(['v', 'V']);
    let mut parts = [0u32; 3];
    for (i, segment) in trimmed.split('.').take(3).enumerate() {
        let numeric: String = segment.chars().take_while(|c| c.is_ascii_digit()).collect();
        parts[i] = numeric.parse().unwrap_or(0);
    }
    parts
}

#[derive(serde::Deserialize)]
struct GithubRelease {
    tag_name: String,
    html_url: String,
}

async fn fetch_update_status(current_version: &str) -> Result<UpdateCheckResult, String> {
    let client = reqwest::Client::builder()
        // GitHub's API rejects requests with no User-Agent header (403).
        .user_agent("Juhra-Client-Update-Checker")
        .build()
        .map_err(|e| e.to_string())?;

    let url = format!("https://api.github.com/repos/{GITHUB_REPO}/releases/latest");
    let response = client
        .get(&url)
        .send()
        .await
        .map_err(|e| e.to_string())?;

    if !response.status().is_success() {
        return Err(format!(
            "GitHub API returned {} — check GITHUB_REPO in lib.rs is set correctly and a release has been published",
            response.status()
        ));
    }

    let release: GithubRelease = response.json().await.map_err(|e| e.to_string())?;

    let latest = parse_version(&release.tag_name);
    let current = parse_version(current_version);
    let available = latest > current;

    Ok(UpdateCheckResult {
        available,
        latest_version: release.tag_name.trim_start_matches(['v', 'V']).to_string(),
        url: release.html_url,
    })
}

/// Manually-triggered from the "Check for Updates" button in Settings.
#[tauri::command]
async fn check_for_updates(app: tauri::AppHandle) -> Result<UpdateCheckResult, String> {
    let current_version = app.package_info().version.to_string();
    fetch_update_status(&current_version).await
}

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
        .invoke_handler(tauri::generate_handler![check_for_updates])
        .setup(|app| {
            build_tray(&app.handle())?;

            // Auto-check for updates ~3s after launch (past the initial
            // paint, so it never competes with startup) and emit an event
            // the frontend listens for (see the useEffect near the top of
            // Client() in JuhraReferenceClient.tsx) to show a dismissible
            // banner. Silent on failure — this is a background nice-to-have,
            // not a user-initiated action, so there's nothing useful to
            // surface if GITHUB_REPO isn't set yet or the network is down.
            let handle = app.handle().clone();
            tauri::async_runtime::spawn(async move {
                tokio::time::sleep(std::time::Duration::from_secs(3)).await;
                let current_version = handle.package_info().version.to_string();
                if let Ok(result) = fetch_update_status(&current_version).await {
                    if result.available {
                        let _ = handle.emit("juhra://update-available", result);
                    }
                }
            });

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running Juhra");
}
