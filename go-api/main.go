package main

import (
	"bytes"
	"encoding/json"
	"io"
	"log"
	"net/http"
	"os/exec"
)

type AskRequest struct {
	Question string `json:"question"`
	CharacterID string `json:"character_id"`
	ScenarioID string`json:"scenario_id"`
}

type AskResponse struct {
	Answer string `json:"answer"`
}

func buildPrompt(input AskRequest) (string, error) {

	payload := map[string] interface{}{
		"question" : input.Question,
		"character": map[string]string{
			"name":        "Aldor",
			"role":        "sage",
			"personality": "mystérieux et bienveillant",
		},

		"scenario": map[string]string{
			"title":   "La Tour du Temps",
			"context": "Le monde est figé depuis mille ans.",
		},
		"style": "poetique",
		"memory": []string{
			"Aldor t’a déjà parlé des portes temporelles.",
			"Tu as découvert une clepsydre étrange dans la salle du trône.",
		}, 
	}

	jsonData, _ := json.Marshal(payload)

	cmd := exec.Command("./rust-core")
	cmd.Stdin = bytes.NewBuffer(jsonData)
	output, err := cmd.Output()
	if err != nil {
		return "", err
	}
	return string(output), nil
}

func callPythonLLM(prompt string) (string, error) {
	payload := map[string]string{"prompt": prompt}
	jsonData, _ := json.Marshal(payload)

	resp, err := http.Post("http://python-llm:11434/generate", "application/json", bytes.NewBuffer(jsonData))
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	var result map[string]string
	body, _ := io.ReadAll(resp.Body)
	json.Unmarshal(body, &result)

	return result["response"], nil
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

	prompt, err := buildPrompt(req)
	if err != nil {
		http.Error(w, "Erreur Rust : "+err.Error(), http.StatusInternalServerError)
		return
	}
	answer, err := callPythonLLM(prompt)
	if err != nil {
		http.Error(w, "Erreur Python : "+err.Error(), http.StatusInternalServerError) 
		return
	}

	json.NewEncoder(w).Encode(AskResponse{Answer: answer})
}
	
func main() {
	http.HandleFunc("/ask", askHandler)
	log.Println("🚀 Go API en écoute sur :8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}

