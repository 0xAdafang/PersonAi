use std::process::{Command, Stdio};
use std::thread;
use std::time::Duration;

pub const API_BASE_URL: &str = "http://localhost:8080";
pub const SERVICE_STARTUP_DELAY: u64 = 2;
pub const OLLAMA_STARTUP_DELAY: u64 = 5; 

pub fn start_ollama_service() {
    thread::spawn(|| {
        println!("🚀 Démarrage d'Ollama...");
        let mut child = Command::new("ollama")
            .arg("serve")
            .stdout(Stdio::piped())
            .stderr(Stdio::piped())
            .spawn()
            .expect("❌ Échec du lancement d'Ollama - Assurez-vous qu'Ollama est installé");

        let _ = child.wait();
    });
}

pub fn start_python_service() {
    thread::spawn(|| {
        println!("🐍 Démarrage du service Python LLM...");
        
        let python_commands = if cfg!(windows) {
            vec!["py", "python", "python3"]
        } else {
            vec!["python3", "python"]
        };
        
        let mut python_cmd = None;
        for cmd in python_commands {
            if Command::new(cmd).arg("--version").output().is_ok() {
                python_cmd = Some(cmd);
                break;
            }
        }
        
        let python_cmd = python_cmd.unwrap_or_else(|| {
            eprintln!("❌ Aucune installation Python trouvée");
            eprintln!("💡 Installez Python depuis https://python.org ou Microsoft Store");
            std::process::exit(1);
        });
        
        println!("🐍 Utilisation de la commande Python: {}", python_cmd);
        
        let mut child = Command::new(python_cmd)
            .arg("python-llm/app.py")
            .stdout(Stdio::inherit())
            .stderr(Stdio::inherit())
            .spawn()
            .unwrap_or_else(|e| {
                eprintln!("❌ Échec du lancement du service Python avec '{}': {}", python_cmd, e);
                std::process::exit(1);
            });

        let _ = child.wait();
    });
}

pub fn start_go_service() {
    thread::spawn(|| {
        println!("🔧 Démarrage du service Go API...");
        let mut child = Command::new("go")
            .args(&["run", "main.go"])
            .current_dir("go-api")
            .stdout(Stdio::inherit()) // Affiche les logs Go
            .stderr(Stdio::inherit())
            .spawn()
            .expect("❌ Échec du lancement du service Go");

        let _ = child.wait();
    });
}


pub fn start_all_services() {
    println!("🚀 Démarrage de tous les services...");
    
    
    start_ollama_service();
    println!("⏳ Attente du démarrage d'Ollama...");
    thread::sleep(Duration::from_secs(OLLAMA_STARTUP_DELAY));
    
    
    start_python_service();
    println!("⏳ Attente du démarrage du service Python...");
    thread::sleep(Duration::from_secs(SERVICE_STARTUP_DELAY));
    
   
    start_go_service();
    println!("⏳ Attente du démarrage du service Go...");
    thread::sleep(Duration::from_secs(SERVICE_STARTUP_DELAY));
    
    println!("✅ Tous les services sont en cours de démarrage");
}


pub async fn check_ollama_health() -> Result<String, String> {
    let client = reqwest::Client::new();
    let url = "http://localhost:11434/api/tags";

    match client.get(&*url).send().await {
        Ok(response) => {
            if response.status().is_success() {
                Ok("Ollama opérationnel".to_string())
            } else {
                Err(format!("Ollama répond avec le statut: {}", response.status()))
            }
        }
        Err(e) => Err(format!("Ollama non disponible: {}", e)),
    }
}

pub async fn make_http_request<T, R>(endpoint: &str, payload: &T) -> Result<R, String>
where
    T: serde::Serialize,
    R: for<'de> serde::Deserialize<'de>,
{
    let client = reqwest::Client::new();
    let url = format!("{}{}", API_BASE_URL, endpoint);

    let response = client
        .post(&url)
        .json(payload)
        .send()
        .await
        .map_err(|e| format!("Erreur de connexion à l'API: {}", e))?;

    if response.status().is_success() {
        response
            .json::<R>()
            .await
            .map_err(|e| format!("Erreur de parsing de la réponse: {}", e))
    } else {
        let status = response.status();
        let body = response.text().await.unwrap_or_else(|_| "Impossible de lire le corps de la réponse".to_string());
        Err(format!("Erreur API {}: {}", status, body))
    }
}

pub async fn make_simple_post_request<T>(endpoint: &str, payload: &T) -> Result<String, String>
where
    T: serde::Serialize,
{
    let client = reqwest::Client::new();
    let url = format!("{}{}", API_BASE_URL, endpoint);

    let response = client
        .post(&url)
        .json(payload)
        .send()
        .await
        .map_err(|e| format!("Erreur de connexion: {}", e))?;

    if response.status().is_success() {
        Ok("Opération réussie".to_string())
    } else {
        let status = response.status();
        let body = response.text().await.unwrap_or_else(|_| "Impossible de lire le corps de la réponse".to_string());
        Err(format!("Erreur {}: {}", status, body))
    }
}

pub async fn check_service_health() -> Result<String, String> {
    let client = reqwest::Client::new();
    let url = format!("{}/health", API_BASE_URL);

    match client.get(&url).send().await {
        Ok(response) => {
            if response.status().is_success() {
                Ok("Services opérationnels".to_string())
            } else {
                Ok(format!("Services répondent avec le statut: {}", response.status()))
            }
        }
        Err(_) => Ok("Services non disponibles".to_string()),
    }
}


pub async fn check_all_services_health() -> Result<String, String> {
    let mut results = Vec::new();
    
    
    match check_ollama_health().await {
        Ok(msg) => results.push(format!("🤖 Ollama: {}", msg)),
        Err(msg) => results.push(format!("❌ Ollama: {}", msg)),
    }
    
    
    match check_service_health().await {
        Ok(msg) => results.push(format!("🔧 Services: {}", msg)),
        Err(msg) => results.push(format!("❌ Services: {}", msg)),
    }
    
    Ok(results.join("\n"))
}

fn port_in_use(p: u16) -> bool {
    std::net::TcpListener::bind(("127.0.0.1", p)).is_err()
}