package utils

import (
	"encoding/json"
	"errors"
	"os"

	"go-api/models"
)

const characterFile = "data/characters.json"
const personaFile = "data/personas.json"



func LoadCharacters() ([]models.Character, error) {
	data, err := os.ReadFile(characterFile)
	if err != nil {
		
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

func LoadPersonas() ([]models.Persona, error) {
	data, err := os.ReadFile(personaFile)
	if err != nil {
		if errors.Is(err, os.ErrNotExist) {
			return []models.Persona{}, nil
		}
		return nil, err
	}
	var personas []models.Persona
	if len(data) > 0 {
		if err := json.Unmarshal(data, &personas); err != nil {
			return nil, err
		}
	}
	return personas, nil
}

func SavePersonas(personas []models.Persona) error {
	data, err := json.MarshalIndent(personas, "", "  ")
	if err != nil {
		return err
	}
	return os.WriteFile(personaFile, data, 0644)
}

func DeletePersonaByID(id string) error {
	personas, err := LoadPersonas() 
	if err != nil {
		return err
	}
	filtered := []models.Persona{}
	for _, p := range personas {
		if p.ID != id {
			filtered = append(filtered, p)
		}
	}
	return SavePersonas(filtered)
}