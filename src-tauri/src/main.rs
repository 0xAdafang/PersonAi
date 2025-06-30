// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use serde::{Deserialize, Serialize};
use reqwest;
use std::collections::HashMap;
use std::process::{Command, Stdio};
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::Arc;
use std::{thread};
use std::time::Duration;
use tauri::{State};
use std::path::{Path, PathBuf};
use std::fs;


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
#[derive(Debug, Serialize, Deserialize)]
struct Character {
    id: String,
    name: String,
    tagline: String,
    description: String,
    greeting: String,
    definition: String,
    tags: HashMap<String, Vec<String>>, 
    img: String,
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

#[tauri::command]
async fn save_character(character: Character) -> Result<String, String> {
    let client = reqwest::Client::new();  
    
    match client
        .post("http://localhost:8080/save-character")
        .json(&character)
        .send()
        .await
    {
        Ok(response) => {
            if response.status().is_success() {
                Ok("Personnage sauvegardé".to_string())
            } else {
                Err(format!("Erreur sauvegarde: {}", response.status()))
            }
        }
        Err(e) => Err(format!("Erreur de connexion: {}", e)),
    }
}

#[tauri::command]
fn load_characters() -> Result<Vec<Character>, String> {
    use std::fs;
    let path = "data/characters.json";
    let content = fs::read_to_string(path)
        .map_err(|e| format!("Erreur lecture fichier: {}", e))?;
    serde_json::from_str::<Vec<Character>>(&content)
        .map_err(|e| format!("Erreur parsing JSON: {}", e))
}

#[tauri::command]
fn copy_image_to_path(file_name: String, data: Vec<u8>) -> Result<(), String> {

  let dest = std::path::PathBuf::from("../tauri-ui/public/assets/characters").join(&file_name);

  if !dest.parent().unwrap().exists() {
    return Err("Le dossier assets/characters n'existe pas".into());
  }
  fs::write(dest, data).map_err(|e| format!("Erreur écriture fichier : {}", e))
}

#[tauri::command]
fn delete_character(id: String) -> Result<(), String> {

  let path = Path::new("data/characters.json");

  let data = fs::read_to_string(path).map_err(|e| e.to_string())?;
  let mut characters: Vec<serde_json::Value> = serde_json::from_str(&data).map_err(|e| e.to_string())?;
  let original_len = characters.len();

  let mut removed_img: Option<String> = None;

  characters.retain(|c| {
    if c["id"] == id {
      if let Some(img) = c["img"].as_str() {
        removed_img = Some(img.to_string());
      }
      false
    } else {
      true
    }
  });

  if characters.len() == original_len {
    return Err("Character not found".into());
  }

  if let Some(img_path) = removed_img {
    if img_path != "placeholder.png" {
      let full_path = Path::new("src-tauri").join(img_path.trim_start_matches('/'));
      if full_path.exists() {
        let _ = fs::remove_file(&full_path);
      }
    }
  }

  let history_dir = Path::new("data/history");
  if let Ok(entries) = fs::read_dir(history_dir) {
    for entry in entries.flatten() {
      if let Ok(file_name) = entry.file_name().into_string() {
        if file_name.starts_with(&format!("{} ", id)) {
          let _ = fs::remove_file(entry.path());
        }
      }
    }
  }

  let updated = serde_json::to_string_pretty(&characters).map_err(|e| e.to_string())?;
  fs::write(path, updated).map_err(|e| e.to_string())?;

  Ok(())
}

fn spawn_go_api() {
    let _ = Command::new("go")
        .arg("run")
        .arg("../go-api/main.go")
        .spawn()
        .expect("❌ Impossible de lancer l'API Go");
}

fn spawn_python_llm() {
    let _ = Command::new("python")
        .args(["../python-llm/app.py"])
        .spawn()
        .expect("❌ Impossible de lancer le LLM Python");
}


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
      delete_character
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
