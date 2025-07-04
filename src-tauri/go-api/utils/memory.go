package utils

import (
	"encoding/json"
	"fmt"
	"go-api/models"
	"os"
	"path/filepath"
)

const historyDir = "data/history"
const memoryLimit = 5


func LoadHistory(key string) []models.ChatMessage {
	path := fmt.Sprintf("data/history/%s.json", key)
	data, err := os.ReadFile(path)
	if err != nil {
		return []models.ChatMessage{}
	}

	var messages []models.ChatMessage
	if err := json.Unmarshal(data, &messages); err != nil {
		return []models.ChatMessage{}
	}
	return messages
}

func SaveHistory(key string, messages []models.ChatMessage) error {
	path := fmt.Sprintf("data/history/%s.json", key)
	data, err := json.MarshalIndent(messages, "", "  ")
	if err != nil {
		return err
	}
	return os.WriteFile(path, data, 0644)
}


func DeleteAllHistoryForCharacter(charID string) {
	entries, err := os.ReadDir(historyDir)
	if err != nil {
		return
	}

	for _, entry := range entries {
		name := entry.Name()
		if !entry.IsDir() && len(name) > len(charID)+1 && name[:len(charID)+1] == charID+"_" {
			_ = os.Remove(filepath.Join(historyDir, name))
		}
	}
}
