use serde_json::{Value, json};

use crate::types::Character;
use std::fs;
use std::path::{Path, PathBuf};

pub const CHARACTERS_FILE_PATH: &str = "data/characters.json";
pub const ASSETS_PATH: &str = "../tauri-ui/public/assets/characters";
pub const HISTORY_DIR: &str = "data/history";

pub fn read_characters_file() -> Result<Vec<Character>, String> {

    let content = fs::read_to_string(CHARACTERS_FILE_PATH)
        .map_err(|e| format!("Erreur lecture fichier: {}", e))?;
    
    serde_json::from_str::<Vec<Character>>(&content)
        .map_err(|e| format!("Erreur parsing JSON: {}", e))
}

pub fn write_characters_file(characters: &[serde_json::Value]) -> Result<(), String> {

    let updated = serde_json::to_string_pretty(characters)
        .map_err(|e| format!("Erreur sérialisation JSON: {}", e))?;

    fs::write(CHARACTERS_FILE_PATH, updated)
        .map_err(|e| format!("Erreur écriture fichier: {}", e))
}

pub fn copy_image_file(file_name: String, data: Vec<u8>) -> Result<(), String> {

    let dest = PathBuf::from(ASSETS_PATH).join(&file_name);

    if !dest.parent().unwrap().exists() {
        return Err("Le dossier assets/characters n'existe pas".into());
    }

    fs::write(dest, data).map_err(|e| format!("Erreur écriture fichier : {}", e))
}

pub fn remove_character_image(img_path: &str) {

    if img_path != "placeholder.png" {
        let full_path = Path::new("src-tauri").join(img_path.trim_start_matches('/'));

        if full_path.exists() {
            let _ = fs::remove_file(&full_path);
        }
    }
}

pub fn remove_character_history(character_id: &str) {

    let history_dir = Path::new(HISTORY_DIR);
    
    if let Ok(entries) = fs::read_dir(history_dir) {
        for entry in entries.flatten() {
            if let Ok(file_name) = entry.file_name().into_string() {
                if file_name.starts_with(&format!("{} ", character_id)) {
                    let _ = fs::remove_file(entry.path());
                }
            }
        }
    }
}

pub fn delete_character_from_file(id: &str) -> Result<(), String> {

    let path = Path::new(CHARACTERS_FILE_PATH);
    
    let data = fs::read_to_string(path).map_err(|e| e.to_string())?;
    let mut characters: Vec<serde_json::Value> = 
        serde_json::from_str(&data).map_err(|e| e.to_string())?;
    
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
        return Err("Personnage non trouvé".into());
    }

    // Supprimer l'image associée
    if let Some(img_path) = removed_img {
        remove_character_image(&img_path);
    }

    // Supprimer l'historique
    remove_character_history(id);

    // Sauvegarder le fichier mis à jour
    write_characters_file(&characters)?;

    Ok(())
}

pub fn update_character(updated_char: Character) -> Result<(), String> {
    // Lire les personnages actuels
    let mut characters = read_characters_file()?;

    // Trouver et remplacer le personnage existant
    let mut found = false;
    for char in &mut characters {
        if char.id == updated_char.id {
            *char = updated_char.clone();
            found = true;
            break;
        }
    }

    // Si non trouvé, on l’ajoute à la fin
    if !found {
        characters.push(updated_char);
    }

    // Convertir en Vec<Value> pour `write_characters_file`
    let values: Vec<Value> = characters
        .into_iter()
        .map(|c| json!(c))
        .collect();

    write_characters_file(&values)
}