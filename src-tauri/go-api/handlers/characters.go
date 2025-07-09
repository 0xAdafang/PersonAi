package handlers

import (
	"encoding/json"
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"go-api/models"
	"go-api/utils"
)

func SaveCharacterHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var newChar models.Character
	if err := json.NewDecoder(r.Body).Decode(&newChar); err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	characters, err := utils.LoadCharacters()
	if err != nil {
		http.Error(w, "JSON loading error", http.StatusInternalServerError)
		return
	}

	updated := false
	for i, c := range characters {
		if c.ID == newChar.ID {
			characters[i] = newChar
			updated = true
			break
		}
	}
	if !updated {
		characters = append(characters, newChar)
	}

	if err := utils.SaveCharacters(characters); err != nil {
		http.Error(w, "JSON writing error", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]string{"status": "saved"})
}

func DeleteCharacterHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var input struct {
		ID string `json:"id"`
	}
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "Invalid query", http.StatusBadRequest)
		return
	}

	characters, err := utils.LoadCharacters()
	if err != nil {
		http.Error(w, "JSON loading error", http.StatusInternalServerError)
		return
	}

	filtered := []models.Character{}
	var removedImg string
	for _, c := range characters {
		if c.ID != input.ID {
			filtered = append(filtered, c)
		} else {
			removedImg = c.Img
		}
	}

	if len(filtered) == len(characters) {
		http.Error(w, "Character not found", http.StatusNotFound)
		return
	}

	if err := utils.SaveCharacters(filtered); err != nil {
		http.Error(w, "JSON writing error", http.StatusInternalServerError)
		return
	}

	
	if removedImg != "" && !strings.Contains(removedImg, "placeholder") {
		full := filepath.Join("src-tauri", removedImg)
		_ = os.Remove(full)
	}

	
	utils.DeleteAllHistoryForCharacter(input.ID)

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"status": "deleted"})
}
