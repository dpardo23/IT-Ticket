// Previene que se abra una consola negra en Windows al ejecutar el .exe
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::Manager;

// Creamos el comando que React va a llamar
#[tauri::command]
async fn show_main_window(window: tauri::Window) {
    window.get_webview_window("main").unwrap().show().unwrap();
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_os::init())
        .invoke_handler(tauri::generate_handler![show_main_window])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}