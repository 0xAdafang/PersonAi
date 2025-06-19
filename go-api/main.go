package main

import (
	"encoding/json"
	"log"
	"net/http"
)

type AskRequest struct {
	Question string `json:"question"`
	CharacterID string `json:"character_id"`
	ScenarioID string`json:"scenario_id"`
}

type AskResponse struct {
	Answer string `json:"answer"`
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

	// 🚧 Appels vers Rust et Python à venir ici (mock pour l’instant)
	answer := "Réponse factice pour : " + req.Question

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(AskResponse{Answer: answer})
}
	
func main() {
	http.HandleFunc("/ask", askHandler)
	log.Println("🚀 Go API en écoute sur :8080")
	log.Fatal(http.ListenAndServe(":8000", nil))
}

