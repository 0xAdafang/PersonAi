use crate::file_utils::{copy_image_file, delete_character_from_file, read_characters_file};
use crate::services::{
    check_service_health, make_http_request, make_simple_post_request, start_go_service,
    start_python_service, SERVICE_STARTUP_DELAY,
};
use crate::types::{AppState, AskRequest, AskResponse, Character, ResetRequest};
use std::sync::atomic::Ordering;
use std::thread;
use std::time::Duration;
use tauri::State;

#[tauri::command]
pub async fn start_services(state: State<'_, AppState>) -> Result<String, String> {
    if state.services_running.load(Ordering::Relaxed) {
        return Ok("Services déjà démarrés".to_string());
    }

    start_python_service();
    thread::sleep(Duration::from_secs(SERVICE_STARTUP_DELAY));

    start_go_service();
    thread::sleep(Duration::from_secs(SERVICE_STARTUP_DELAY));

    state.services_running.store(true, Ordering::Relaxed);
    Ok("Services démarrés avec succès".to_string())
}

#[tauri::command]
pub async fn ask_question(request: AskRequest) -> Result<AskResponse, String> {
    make_http_request("/ask", &request).await
}

#[tauri::command]
pub async fn reset_conversation(request: ResetRequest) -> Result<String, String> {
    make_simple_post_request("/reset", &request)
        .await
        .map(|_| "Conversation réinitialisée".to_string())
}

#[tauri::command]
pub async fn check_services() -> Result<String, String> {
    check_service_health().await
}

#[tauri::command]
pub async fn save_character(character: Character) -> Result<String, String> {
    make_simple_post_request("/save-character", &character)
        .await
        .map(|_| "Personnage sauvegardé".to_string())
}

#[tauri::command]
pub fn load_characters() -> Result<Vec<Character>, String> {
    read_characters_file()
}

#[tauri::command]
pub fn copy_image_to_path(file_name: String, data: Vec<u8>) -> Result<(), String> {
    copy_image_file(file_name, data)
}

#[tauri::command]
pub fn delete_character(id: String) -> Result<(), String> {
    delete_character_from_file(&id)
}

#[tauri::command]
pub fn update_character(character: Character) -> Result<(), String> {
    crate::file_utils::update_character(character)
}

