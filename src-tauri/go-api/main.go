package main

import (
	"log"
	"net/http"

	"go-api/handlers"
)

func main() {
	http.HandleFunc("/health", handlers.HealthHandler)
	http.HandleFunc("/save-character", handlers.SaveCharacterHandler)
	http.HandleFunc("/delete-character", handlers.DeleteCharacterHandler)
	http.HandleFunc("/save-persona", handlers.SavePersonaHandler)
	http.HandleFunc("/delete-persona", handlers.DeletePersonaHandler)
	http.HandleFunc("/personas", handlers.ListPersonasHandler)
	http.HandleFunc("/ask", handlers.AskHandler)
	http.HandleFunc("/reset", handlers.ResetHandler)
	http.HandleFunc("/debug/paths", handlers.DebugPathsHandler)



	log.Println("\U0001F680 Go API en écoute sur :8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}