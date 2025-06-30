package utils

import (
	"encoding/json"
	"errors"
	"os"

	"go-api/models"
)

const characterFile = "data/characters.json"

// LoadCharacters lit le fichier JSON et retourne la liste des personnages
func LoadCharacters() ([]models.Character, error) {
	data, err := os.ReadFile(characterFile)
	if err != nil {
		// S'il n'existe pas, on retourne une liste vide
		if errors.Is(err, os.ErrNotExist) {
			return []models.Character{}, nil
		}
		return nil, err
	}

	var characters []models.Character
	if len(data) > 0 {
		if err := json.Unmarshal(data, &characters); err != nil {
			return nil, err
		}
	}
	return characters, nil
}

// SaveCharacters écrit la liste des personnages dans le fichier JSON
func SaveCharacters(characters []models.Character) error {
	data, err := json.MarshalIndent(characters, "", "  ")
	if err != nil {
		return err
	}
	return os.WriteFile(characterFile, data, 0644)
}

func UpdateOrInsertCharacter(newChar models.Character) error {
	characters, err := LoadCharacters()
	if err != nil {
		return err
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

	return SaveCharacters(characters)
}