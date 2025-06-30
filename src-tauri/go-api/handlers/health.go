package handlers

import (
	"encoding/json"
	"net/http"
)

// HealthHandler répond simplement que l'API est vivante
func HealthHandler(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"status": "ok"})
}
