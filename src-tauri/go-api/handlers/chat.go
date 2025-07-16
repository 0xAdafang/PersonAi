package handlers

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"

	"go-api/models"
	"go-api/utils"
)

var conversationHistory = make(map[string][]string)

func AskHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req models.AskRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		fmt.Printf("🟢 AskHandler - Requête reçue:\n- CharacterID: %s\n- PersonaID: %s\n- Question: %s\n",
		req.CharacterID, req.UserID, req.Question)
		return
	}

	answer, err := buildPrompt(req)
	if err != nil {
		http.Error(w, "Service Error : "+err.Error(), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(models.AskResponse{Answer: answer})
	
}

func ResetHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var input struct {
		UserID      string `json:"user_id"`
		CharacterID string `json:"character_id"`
	}
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	key := fmt.Sprintf("%s_%s", input.CharacterID, input.UserID)
	delete(conversationHistory, key)
	os.Remove(filepath.Join("data/history", key+".json"))

	w.WriteHeader(http.StatusOK)
}

func buildPrompt(input models.AskRequest) (string, error) {

	fmt.Println("📥 buildPrompt - Début traitement")
	fmt.Printf("📌 characterID = %s, userID = %s\n", input.CharacterID, input.UserID)
	
	chars, err := utils.LoadCharacters()
	if err != nil {
		return "", err
	}

	var char *models.Character
	for _, c := range chars {
		if c.ID == input.CharacterID {
			char = &c
			break
		}
	}
	if char == nil {
		return "", fmt.Errorf("Character not found")
	}

	
	personas, err := utils.LoadPersonas()
	if err != nil {
		return "", err
	}

	var persona *models.Persona
	for _, p := range personas {
		if p.ID == input.UserID {
			persona = &p
			break
		}
	}

	key := fmt.Sprintf("%s_%s", input.CharacterID, input.UserID)
	memory := utils.LoadHistory(key) 

	
	memory = append(memory, models.ChatMessage{
		Role:    "user",
		Content: input.Question,
	})

	
	utils.SaveHistory(key, memory)

	return callPythonLLM(input.Question, *char, persona, memory, input.Model)
}

func callPythonLLM(prompt string, character models.Character, persona *models.Persona, memory []models.ChatMessage, model string) (string, error) {
	
	if model == "" {
		model = "dolphin-mistral"
	}
	
	fmt.Printf("🔍 Modèle demandé: '%s'\n", model)

	payload := map[string]interface{}{
    "type":                   "character",
    "model":                  model,
    "character_id":           character.ID,
    "character_name":         character.Name,
    "character_description":  character.Description,
    "character_personality":  character.Tagline,
    "character_background":   character.Definition,
    "user_message":           prompt,
    "memory":                 memory,
	}
	if persona != nil {
		payload["persona_id"] = persona.ID
		payload["user_persona_name"] = persona.DisplayName
		payload["user_persona_background"] = persona.Background
	}


	jsonData, err := json.Marshal(payload)
	if err != nil {
		return "", fmt.Errorf("échec encodage JSON: %w", err)
	}

	fmt.Println("📤 Requête envoyée à Flask à http://localhost:5050/generate")
	fmt.Printf("📤 Payload: %s\n", string(jsonData))

	resp, err := http.Post("http://localhost:5050/generate", "application/json", bytes.NewBuffer(jsonData))
	if err != nil {
		fmt.Printf("❌ Erreur HTTP: %v\n", err)
		return "", fmt.Errorf("requête HTTP échouée: %w", err)
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)
	fmt.Printf("📥 Réponse Flask (Status %d): %s\n", resp.StatusCode, string(body))

	if resp.StatusCode != 200 {
		return "", fmt.Errorf("erreur HTTP %d: %s", resp.StatusCode, string(body))
	}

	var result map[string]interface{}
	if err := json.Unmarshal(body, &result); err != nil {
		fmt.Printf("❌ Erreur parsing JSON: %v\n", err)
		return "", fmt.Errorf("réponse illisible: %w", err)
	}

	if status, ok := result["status"].(string); ok && status != "success" {
		fmt.Println("❌ Réponse avec erreur de Flask:")
		fmt.Println(string(body))
		return fmt.Sprintf("[Erreur modèle: %v]", result["response"]), nil
	}

	response, ok := result["response"].(string)
	if !ok {
		fmt.Printf("❌ Pas de field 'response' dans: %v\n", result)
		return "", fmt.Errorf("réponse invalide: pas de field 'response'")
	}

	fmt.Printf("✅ Réponse reçue: %s\n", response)
	return response, nil
}
