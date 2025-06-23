package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
)

type Character struct {
	ID          string              `json:"id"`
	Name        string              `json:"name"`
	Tagline     string              `json:"tagline"`
	Description string              `json:"description"`
	Greeting    string              `json:"greeting"`
	Definition  string              `json:"definition"` 
	Tags        map[string][]string `json:"tags"`
}


func loadCharacter(id string) (Character, error) {

	data, err := os.ReadFile("data/characters.json")
	if err != nil {
		return Character{}, err
	}

	var characters []Character
	if err := json.Unmarshal(data, &characters); err != nil {
		return Character{}, err
	}

	for _, c := range characters {
		if c.ID == id {
			return c, nil
		}
	}

	return Character{}, fmt.Errorf("personnage non trouvé")

}


type AskRequest struct {
	Question    string `json:"question"`
	CharacterID string `json:"character_id"`
	UserID      string `json:"user_id"`
	Style       string `json:"style"`
	UserPersona string `json:"user_persona"`
	Model       string `json:"model"`
}

type AskResponse struct {
	Answer string `json:"answer"`
}

var conversationHistory = make(map[string][]string)
const memoryLimit = 5


func buildPrompt(input AskRequest) (string, error) {
	char, err := loadCharacter(input.CharacterID)
	if err != nil {
		return "", err
	}

	key := fmt.Sprintf("%s_%s", input.CharacterID, input.UserID)
	memory := loadHistory(key)
	memory = append(memory, input.Question)
	
	if len(memory) > memoryLimit {
		memory = memory[len(memory)-memoryLimit:]
	}

	// Utilise directement la question utilisateur comme prompt
	// Le formatage se fait côté Python maintenant
	prompt := input.Question
	
	// Détermine le modèle à utiliser (défaut: pygmalion)
	model := input.Model
	if model == "" {
		model = "pygmalion" // Meilleur pour les personnages
	}

	conversationHistory[key] = memory
	saveHistory(key, memory)

	// Appelle Python avec le nouveau format
	response, err := callPythonLLM(prompt, char, memory, model)
	if err != nil {
		return "", err
	}

	return response, nil
}

func callPythonLLM(prompt string, character Character, memory []string, model string) (string, error) {
	payload := map[string]interface{}{
		"type": "character",
		"model": model, // pygmalion, mythomax, nous-hermes, mistral
		"character_name": character.Name,
		"character_description": character.Description,
		"character_personality": character.Tagline,
		"character_background": character.Definition,
		"user_message": prompt,
		"memory": memory,
	}

	jsonData, _ := json.Marshal(payload)

	resp, err := http.Post("http://localhost:11434/generate", "application/json", bytes.NewBuffer(jsonData))
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	var result map[string]interface{}
	body, _ := io.ReadAll(resp.Body)
	json.Unmarshal(body, &result)

	if status, ok := result["status"].(string); ok && status != "succes" {
		return fmt.Sprintf("[Erreur modèle: %v]", result["response"]), nil
	}

	return result["response"].(string), nil
}

func askHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Méthode non autorisée", http.StatusMethodNotAllowed)
		return
	}

	var req AskRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Requête invalide", http.StatusBadRequest)
		return
	}

	// Appelle directement buildPrompt qui gère tout maintenant
	answer, err := buildPrompt(req)
	if err != nil {
		http.Error(w, "Erreur service : "+err.Error(), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(AskResponse{Answer: answer})
}

func resetHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Méthode non autorisée", http.StatusMethodNotAllowed)
		return
	}

	var input struct {
		UserID		string `json:"user_id"`
		CharacterID string `json:"character_id"`
	}

	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "Requête invalide", http.StatusBadRequest)
		return
	}
	
	key := fmt.Sprintf("%s_%s", input.CharacterID, input.UserID)
	delete(conversationHistory, key)
	os.Remove(fmt.Sprintf("data/history/%s.json", key))
	w.WriteHeader(http.StatusOK)
}

func loadHistory(key string) []string {
	path := fmt.Sprintf("data/history/%s.json", key)
	data, err := os.ReadFile(path)
	if err != nil {
		return []string{}
	}
	var history []string
	json.Unmarshal(data, &history)
	return history
}

func saveHistory(key string, history []string) {
	path := fmt.Sprintf("data/history/%s.json", key)
	data, _ := json.Marshal(history)
	os.WriteFile(path, data, 0644)
}

func healthHandler(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"status": "ok"})
}
	
func main() {

	http.HandleFunc("/reset", resetHandler)
	http.HandleFunc("/ask", askHandler)
	http.HandleFunc("/health", healthHandler)
	log.Println("🚀 Go API en écoute sur :8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
	
}

