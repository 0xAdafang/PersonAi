use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::atomic::AtomicBool;
use std::sync::Arc;

#[derive(Debug, Serialize, Deserialize)]
pub struct AskRequest {
    pub question: String,
    pub character_id: String,
    pub user_id: String,
    pub style: String,
    pub user_persona: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct AskResponse {
    pub answer: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ResetRequest {
    pub user_id: String,
    pub character_id: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Character {
    pub id: String,
    pub name: String,
    pub tagline: String,
    pub description: String,
    pub greeting: String,
    pub definition: String,
    pub tags: HashMap<String, Vec<String>>,
    pub img: String,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct Persona {
    pub id: String,
    pub display_name: String,
    pub background: String,
    pub img: String,
}

pub struct AppState {
    pub services_running: Arc<AtomicBool>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ChatMessage {
    pub role: String,
    pub content: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct AskRequestForChat {
    pub question: String,
    pub character_id: String,
    pub user_id: String,
    pub model: String,
    pub memory: Vec<ChatMessage>,
}
