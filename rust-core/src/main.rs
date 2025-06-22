use serde::Deserialize;
use std::io::{self, Read};

#[derive(Deserialize)]
struct Character {
    name: String,
    tagline: String,
    description: String,
    greeting: String,
    definition: String,
}

#[derive(Deserialize)]
struct PromptInput {
    character: Character,
    style: String,
    memory: Vec<String>,
    user: String,
    user_persona: String,
}

fn main() {
    let mut buffer = String::new();
    io::stdin().read_to_string(&mut buffer).unwrap();

    let parsed: PromptInput = match serde_json::from_str(&buffer) {
        Ok(p) => p,
        Err(e) => {
            eprintln!("Erreur de parsing JSON : {}", e);
            std::process::exit(1);
        }
    };

    let prompt = format!(
        "[Nom]: {}\n[Tagline]: {}\n[Description]: {}\n[Greeting]: {}\n[Style]: {}\n[Définition]: {}\n[Utilisateur - Profil]: {}\n[Mémoire]: {}\n[Utilisateur]: {}",
        parsed.character.name,
        parsed.character.tagline,
        parsed.character.description,
        parsed.character.greeting,
        parsed.style,
        parsed.character.definition,
        parsed.user_persona,
        parsed.memory.join(" | "),
        parsed.user
    );

    println!("{}", prompt);
}



