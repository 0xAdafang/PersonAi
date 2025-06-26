// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use serde::{Deserialize, Serialize};
use reqwest;
use std::process::{Command, Stdio};
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::Arc;
use std::thread;
use std::time::Duration;
use tauri::{State};

#[derive(Debug, Serialize, Deserialize)]
struct AskRequest {
  question: String,
  character_id: String,
  user_id: String,
  style: String,
  user_persona: String,
}

#[derive(Debug, Serialize, Deserialize)]
struct AskResponse {
  answer: String,
}

#[derive(Debug, Serialize, Deserialize)]
struct ResetRequest {
  user_id: String,
  character_id: String,
}

struct AppState {
  services_running: Arc<AtomicBool>,
}

#[tauri::command]
async fn start_services(state: State<'_,AppState>) -> Result<String, String> {
  if state.services_running.load(Ordering::Relaxed) {
    return Ok("Services déjà démarrés".to_string());
  }

  thread::spawn(|| {
    let mut child = Command::new("python3")
      .arg("python-llm/app.py")
      .stdout(Stdio::piped())
      .stderr(Stdio::piped())
      .spawn()
      .expect("Échec du lancement du service Python");

    let _ = child.wait();

  });

  thread::sleep(Duration::from_secs(2));

  thread::spawn(|| {
    let mut child = Command::new("go")
      .args(&["run", "main.go"])
      .current_dir("go-api")
      .stdout(Stdio::piped())
      .stderr(Stdio::piped())
      .spawn()
      .expect("Échec du lancement du service Go");

    let _ = child.wait();
  });

  thread::sleep(Duration::from_secs(2));
  Ok("Services démarrés avec succès".to_string())
}

#[tauri::command]
async fn ask_question(request: AskRequest) -> Result<AskResponse, String> {
  let client = reqwest::Client::new();

  match client
    .post("http://localhost:8080/ask")
    .json(&request)
    .send()
    .await

  {
    Ok(response) => {
      if response.status().is_success() {
        match response.json::<AskResponse>().await {
          Ok(ask_response) => Ok(ask_response),
          Err(e) => Err(format!("Erreur de parsing de la réponse: {}", e)),
        }
      } else {
          Err(format!("Erreur API: {}", response.status()))
      }
    }
    Err(e) => Err(format!("Erreur de connexion à l'API: {}", e)),
  }
}

#[tauri::command]
async fn reset_conversation(request: ResetRequest) -> Result<String, String> {
    let client = reqwest::Client::new();
    
    match client
        .post("http://localhost:8080/reset")
        .json(&request)
        .send()
        .await
    {
        Ok(response) => {
            if response.status().is_success() {
                Ok("Conversation réinitialisée".to_string())
            } else {
                Err(format!("Erreur reset: {}", response.status()))
            }
        }
        Err(e) => Err(format!("Erreur de connexion: {}", e)),
    }
}

#[tauri::command]
async fn check_services() -> Result<String, String> {
  let client = reqwest::Client::new();

  match client
    .get("http://localhost:8080/health")
    .send()
    .await
  {
    Ok(_) => Ok("Services opérationnels".to_string()),
    Err(_) => Ok("Services non disponibles".to_string()),
  }
}

fn main() {
  let app_state = AppState {
    services_running: Arc::new(AtomicBool::new(false)),
  };

  tauri::Builder::default()
    .manage(app_state)
    .invoke_handler(tauri::generate_handler![
      start_services,
      ask_question,
      reset_conversation,
      check_services
    ])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
