package handlers

import (
	"encoding/json"
	"net/http"
	"os"
	"path/filepath"
)

func DebugPathsHandler(w http.ResponseWriter, r *http.Request) {
	wd, _ := os.Getwd()

	characterFile := filepath.Join("..", "data", "characters.json")
	personaFile := filepath.Join("..", "data", "personas.json")

	_, charErr := os.Stat(characterFile)
	_, personaErr := os.Stat(personaFile)
	

	var dataFiles []string
	if files, err := os.ReadDir("data"); err == nil {
		for _, file := range files {
			dataFiles = append(dataFiles, file.Name())
		}
	}

	response := map[string]interface{}{
		"working_directory":      wd,
		"character_file_path":    characterFile,
		"persona_file_path":      personaFile,
		"character_file_exists":  charErr == nil,
		"persona_file_exists":    personaErr == nil,
		"data_folder_contents":   dataFiles,
	}

	if charErr != nil {
		response["character_error"] = charErr.Error()
	}
	if personaErr != nil {
		response["persona_error"] = personaErr.Error()
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}
