package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"os/exec"
)

type Character struct {
	ID 				string 		`json:"id"`
	Name			string		`json:"name"`
	Role			string		`json:"role"`
	Personality		string		`json:"personality"`
	Tags 			map[string][]string		`json:"tags"`
}

type Scenario struct {
	ID      		string            `json:"id"`
	Title   		string            `json:"title"`
	Context 		string            `json:"context"`
	Tags    		map[string][]string `json:"tags"`
}

func loadCharacter(id string) (Character, error) {

	data, err := os.ReadFile("data/characters.json")
	if err != nil {
		return Character{}, err
	}

	var characters []Character
	if err := json.Unmarshal(data, &characters); err != nil {
		return Character{}, err
	}

	for _, c := range characters {
		if c.ID == id {
			return c, nil
		}
	}

	return Character{}, fmt.Errorf("personnage non trouvé")

}


func loadScenario(id string) (Scenario, error) {

	data, err := os.ReadFile("data/scenarios.json")
	if err != nil {
		return Scenario{}, err
	}

	var scenarios []Scenario
	if err := json.Unmarshal(data, &scenarios); err != nil {
		return Scenario{}, err
	}

	for _, s := range scenarios {
		if s.ID == id {
			return s, nil
		}
	}

	return Scenario{}, fmt.Errorf("scénario non trouvé")


}

type AskRequest struct {
	Question 		string 		`json:"question"`
	CharacterID 	string 		`json:"character_id"`
	ScenarioID 		string		`json:"scenario_id"`
	UserID			string		`json:"user_id"`
	Style			string		`json:"style"`	
}

type AskResponse struct {
	Answer string `json:"answer"`
}

var conversationHistory = make(map[string][]string)
const memoryLimit = 5

func buildPrompt(input AskRequest) (string, error) {

	char,err := loadCharacter(input.CharacterID)
	if err != nil {
		return "",err
	}

	scen, err := loadScenario(input.ScenarioID)
	if err != nil {
		return "",err
	}

	key := fmt.Sprintf("%s_%s_%s", input.CharacterID, input.ScenarioID, input.UserID)
	
	memory := conversationHistory[key]

	memory = append(memory, input.Question)
	if len(memory) > memoryLimit {
		memory = memory[len(memory)-memoryLimit:]
	}

	conversationHistory[key] = memory

	payload := map[string]interface{}{
	"question": input.Question,
	"character": map[string]string{
		"name":        char.Name,
		"role":        char.Role,
		"personality": char.Personality,
	},
	"scenario": map[string]string{
		"title":   scen.Title,
		"context": scen.Context,
	},

	"style": input.Style,
	"memory": memory,
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

func resetHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Méthode non autorisée", http.StatusMethodNotAllowed)
		return
	}

	var input struct {
		UserID		string `json:"user_id"`
		CharacterID string `json:"character_id"`
		ScenarioID	string `json:"scenario_id"`
	}

	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "Requête invalide", http.StatusBadRequest)
		return
	}

	key := fmt.Sprintf("%s_%s_%s", input.CharacterID, input.ScenarioID, input.UserID)
	delete(conversationHistory, key)
	w.WriteHeader(http.StatusOK)
}
	
func main() {

	http.HandleFunc("/reset", resetHandler)
	http.HandleFunc("/ask", askHandler)
	log.Println("🚀 Go API en écoute sur :8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
	
}

