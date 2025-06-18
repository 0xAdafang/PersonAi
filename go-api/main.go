package main

import (
	"encoding/json"
	"log"
	"net/http"
)

type AskResquest struct {
	Question string `json:"question"`
}

func askHandler(w http.ResponseWriter, r *http.Request) {
	var req AskResquest
	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	response := "Réponse factice (à remplacer par le call Rust -> Python)"
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"answer" : response})
}

func main() {
	http.HandleFunc("/ask", askHandler)
	log.Println("✅ Go API en écoute sur :8080")
	log.Fatal(http.ListenAndServe(":8000", nil))
}