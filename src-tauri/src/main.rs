#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod types;
mod services;
mod file_utils;
mod commands;


use crate::services::start_all_services;
use crate::types::AppState;
use crate::commands::*;
use std::sync::atomic::AtomicBool;
use std::sync::Arc;

fn main() {
    start_all_services();
    
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
            update_character,
            save_persona,
            load_personas,
            delete_persona,
            update_persona,
            copy_image_to_persona,
            chat_with_character,
            load_character_by_id,
            load_persona_by_id,
            check_services_status,
            load_recent_chats,
            load_chat_history,
            delete_chat_history,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

