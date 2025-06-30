#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod types;
mod services;
mod file_utils;
mod commands;

use crate::services::{spawn_go_api, spawn_python_llm};
use crate::types::AppState;
use crate::commands::*;
use std::sync::atomic::AtomicBool;
use std::sync::Arc;

fn main() {
    spawn_go_api();
    spawn_python_llm();
    
    let app_state = AppState {
        services_running: Arc::new(AtomicBool::new(false)),
    };

    tauri::Builder::default()
        .manage(app_state)
        .invoke_handler(tauri::generate_handler![
            start_services,
            ask_question,
            reset_conversation,
            check_services,
            save_character,
            load_characters,
            copy_image_to_path,
            delete_character,
            update_character
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}