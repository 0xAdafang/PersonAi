use std::process::{Command, Stdio};
use std::thread;
use std::time::Duration;

pub const API_BASE_URL: &str = "http://localhost:8080";
pub const SERVICE_STARTUP_DELAY: u64 = 2;

pub fn spawn_go_api() {
    let _ = Command::new("go")
        .arg("run")
        .arg(".")
        .current_dir("go-api")
        .spawn()
        .expect("❌ Impossible de lancer l'API Go");
}

pub fn spawn_python_llm() {
    let _ = Command::new("python")
        .arg("app.py")
        .current_dir("python-llm")
        .stdout(Stdio::inherit())
        .stderr(Stdio::inherit())
        .spawn()
        .expect("❌ Impossible de lancer l'API Python");
}

pub fn start_python_service() {
    thread::spawn(|| {
        let mut child = Command::new("python3")
            .arg("python-llm/app.py")
            .stdout(Stdio::piped())
            .stderr(Stdio::piped())
            .spawn()
            .expect("Échec du lancement du service Python");

        let _ = child.wait();
    });
}

pub fn start_go_service() {
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
        Err(format!("Erreur API: {}", response.status()))
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
        Err(format!("Erreur: {}", response.status()))
    }
}

pub async fn check_service_health() -> Result<String, String> {
    let client = reqwest::Client::new();
    let url = format!("{}/health", API_BASE_URL);

    match client.get(&url).send().await {
        Ok(_) => Ok("Services opérationnels".to_string()),
        Err(_) => Ok("Services non disponibles".to_string()),
    }
}
