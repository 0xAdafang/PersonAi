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
		http.Error(w, "Méthode non autorisée", http.StatusMethodNotAllowed)
		return
	}

	var req models.AskRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Requête invalide", http.StatusBadRequest)
		return
	}

	answer, err := buildPrompt(req)
	if err != nil {
		http.Error(w, "Erreur service : "+err.Error(), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(models.AskResponse{Answer: answer})
}

func ResetHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Méthode non autorisée", http.StatusMethodNotAllowed)
		return
	}

	var input struct {
		UserID      string `json:"user_id"`
		CharacterID string `json:"character_id"`
	}
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "Requête invalide", http.StatusBadRequest)
		return
	}

	key := fmt.Sprintf("%s_%s", input.CharacterID, input.UserID)
	delete(conversationHistory, key)
	os.Remove(filepath.Join("data/history", key+".json"))

	w.WriteHeader(http.StatusOK)
}

func buildPrompt(input models.AskRequest) (string, error) {
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
		return "", fmt.Errorf("personnage introuvable")
	}

	key := fmt.Sprintf("%s_%s", input.CharacterID, input.UserID)
	memory := utils.LoadHistory(key)
	memory = append(memory, input.Question)

	conversationHistory[key] = memory
	utils.SaveHistory(key, memory)

	return callPythonLLM(input.Question, *char, memory, input.Model)
}

func callPythonLLM(prompt string, character models.Character, memory []string, model string) (string, error) {
	if model == "" {
		model = "pygmalion"
	}

	payload := map[string]interface{}{
		"type":                 "character",
		"model":                model,
		"character_name":       character.Name,
		"character_description": character.Description,
		"character_personality": character.Tagline,
		"character_background":  character.Definition,
		"user_message":          prompt,
		"memory":                memory,
	}

	jsonData, _ := json.Marshal(payload)

	resp, err := http.Post("http://localhost:11434/generate", "application/json", bytes.NewBuffer(jsonData))
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)

	var result map[string]interface{}
	json.Unmarshal(body, &result)

	if status, ok := result["status"].(string); ok && status != "success" {
		return fmt.Sprintf("[Erreur modèle: %v]", result["response"]), nil
	}

	return result["response"].(string), nil
}
