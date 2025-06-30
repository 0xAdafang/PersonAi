package utils

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
)

const historyDir = "data/history"
const memoryLimit = 5

// LoadHistory retourne les derniers messages associés à une session
func LoadHistory(key string) []string {
	path := filepath.Join(historyDir, fmt.Sprintf("%s.json", key))
	data, err := os.ReadFile(path)
	if err != nil {
		return []string{}
	}

	var history []string
	if err := json.Unmarshal(data, &history); err != nil {
		return []string{}
	}
	return history
}

// SaveHistory écrit les messages pour une session
func SaveHistory(key string, history []string) {
	if len(history) > memoryLimit {
		history = history[len(history)-memoryLimit:]
	}

	path := filepath.Join(historyDir, fmt.Sprintf("%s.json", key))
	data, _ := json.Marshal(history)
	_ = os.WriteFile(path, data, 0644)
}

// DeleteAllHistoryForCharacter supprime tous les fichiers `id_*.json`
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
