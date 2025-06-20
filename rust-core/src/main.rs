use serde::Deserialize;
use std::io::{self, Read};

#[derive(Deserialize)]
struct Character {
    name: String,
    role: String,
    personality: String,
}

#[derive(Deserialize)]
struct Scenario {
    title: String,
    context: String,
}

#[derive(Deserialize)]
struct PromptInput {
    question: String,
    character: Character,
    scenario: Scenario,
    style: String,
    memory: Vec<String>,
}


fn main() {
    let mut input = String::new();
    io::stdin().read_to_string(&mut input).unwrap();

    let parsed: PromptInput = match serde_json::from_str(&input) {
        Ok(p) => p,
        Err(e) => {
            eprintln!("Erreur de parsing JSON : {}", e);
            std::process::exit(1);
        }
    };

    println!(
         "[Personnage]: {} ({}, {})\n[Scénario]: {} - {}\n[Style]: {}\n[Mémoire]: {}\n[Utilisateur]: {}",
        parsed.character.name,
        parsed.character.role,
        parsed.character.personality,
        parsed.scenario.title,
        parsed.scenario.context,
        parsed.style,
        parsed.memory.join(" | "),
        parsed.question
    );
}



