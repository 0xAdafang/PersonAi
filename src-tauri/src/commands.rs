use crate::file_utils::{self, copy_image_file, delete_character_from_file, read_characters_file};
use crate::services::{
    self, check_service_health, make_http_request, make_simple_post_request, start_go_service, start_python_service, SERVICE_STARTUP_DELAY
};
use crate::types::{AppState, AskRequest, AskRequestForChat, AskResponse, Character, ChatMessage, Persona, RecentChat, ResetRequest};
use std::sync::atomic::Ordering;
use std::thread;
use std::time::Duration;
use tauri::State;
use serde::{Deserialize, Serialize};


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

#[tauri::command]
pub fn load_personas() -> Result<Vec<Persona>, String> {
    file_utils::read_personas_file()
}

#[tauri::command]
pub fn save_persona(persona: Persona) -> Result<String, String> {
    file_utils::update_persona(persona)
        .map(|_| "Persona sauvegardée".to_string())
}

#[tauri::command]
pub fn delete_persona(persona_id: String) -> Result<(), String> {
    file_utils::delete_persona_from_file(&persona_id)
}

#[tauri::command]
pub fn copy_image_to_persona(file_name: String, data: Vec<u8>) -> Result<(), String> {
    file_utils::copy_persona_image_file(file_name, data)
}

#[tauri::command]
pub fn update_persona(persona: Persona) -> Result<(), String> {
    file_utils::update_persona(persona)
}

#[tauri::command]
pub async fn chat_with_character(input: String,character_id: String,persona_id: String,history: Vec<ChatMessage>,) -> Result<String, String> {
    let ask_request = AskRequestForChat {
        question: input,
        character_id,
        user_id: persona_id,
        model: "dolphin-mistral".to_string(),
        memory: history,
    };

    match make_http_request::<AskRequestForChat, AskResponse>("/ask", &ask_request).await {
        Ok(response) => Ok(response.answer),
        Err(e) => Err(format!("Erreur LLM: {}", e)),
    }
}

#[tauri::command]
pub fn load_character_by_id(id: String) -> Result<Character, String> {
    let characters = read_characters_file()?;
    
    characters
        .into_iter()
        .find(|c| c.id == id)
        .ok_or_else(|| format!("Personnage avec l'ID '{}' non trouvé", id))
}

#[tauri::command]
pub fn load_persona_by_id(id: String) -> Result<Persona, String> {
    let personas = file_utils::read_personas_file()?;
    
    personas
        .into_iter()
        .find(|p| p.id == id)
        .ok_or_else(|| format!("Persona avec l'ID '{}' non trouvé", id))
}

#[tauri::command]
pub async fn check_services_status() -> Result<String, String> {
    services::check_all_services_health().await
}

#[tauri::command]
pub fn load_recent_chats() -> Result<Vec<RecentChat>, String> {
    let path = std::path::Path::new("data/history");
    let mut chats = vec![];

    if let Ok(entries) = std::fs::read_dir(path) {
        for entry in entries.flatten() {
            let path = entry.path();
            if path.extension().map(|e| e == "json").unwrap_or(false) {
                if let Some(file_stem) = path.file_stem().and_then(|s| s.to_str()) {
                  
                    let parts: Vec<&str> = file_stem.split('_').collect();
                    if parts.len() >= 2 {
                        let character_id = parts[0].to_string();
                        let persona_id = parts[1..].join("_"); 
                        
                       
                        if let Ok(content) = std::fs::read_to_string(&path) {
                            if let Ok(messages) = serde_json::from_str::<Vec<ChatMessage>>(&content) {
                                if !messages.is_empty() {
                                    
                                    let last_message = messages.last().unwrap();
                                    let timestamp = if let Some(ts) = last_message.timestamp.as_deref() {
                                        if let Ok(datetime) = chrono::DateTime::parse_from_rfc3339(ts) {
                                            
                                            (datetime.timestamp() * 1000 + datetime.timestamp_subsec_millis() as i64) as u64
                                            } else {
                                                0
                                            }
                                        } else {
                                            0
                                        };
                                    
                                    let (name, img) = if let Ok(characters) = read_characters_file() {
                                        if let Some(character) = characters.iter().find(|c| c.id == character_id) {
                                            (character.name.clone(), character.img.clone())
                                        } else {
                                            (character_id.clone(), String::new())
                                        }
                                    } else {
                                        (character_id.clone(), String::new())
                                    };
                                    
                                    chats.push(RecentChat {
                                        character_id,
                                        persona_id,
                                        name,
                                        img: Some(img),
                                        last_used: timestamp,
                                    });
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    
    Ok(chats)
}


#[tauri::command]
pub fn load_chat_history(character_id: String, persona_id: String) -> Result<Vec<ChatMessage>, String> {
    let filename = format!("data/history/{}_{}.json", character_id, persona_id);
    if std::path::Path::new(&filename).exists() {
        let content = std::fs::read_to_string(&filename).map_err(|e| e.to_string())?;
        let messages: Vec<ChatMessage> = serde_json::from_str(&content).map_err(|e| e.to_string())?;
        Ok(messages)
    } else {
        Ok(vec![]) 
    }
}


#[tauri::command]
pub fn delete_chat_history(character_id: String, persona_id: String) -> Result<(), String> {
    let filename = format!("data/history/{}_{}.json", character_id, persona_id);
    if std::path::Path::new(&filename).exists() {
        std::fs::remove_file(&filename).map_err(|e| e.to_string())?;
    }
    Ok(())
}