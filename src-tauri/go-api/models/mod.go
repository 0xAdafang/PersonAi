package models

type Character struct {
	ID          string              `json:"id"`
	Name        string              `json:"name"`
	Tagline     string              `json:"tagline"`
	Description string              `json:"description"`
	Greeting    string              `json:"greeting"`
	Definition  string              `json:"definition"`
	Tags        map[string][]string `json:"tags"`
	Img         string              `json:"img"`
}

type Persona struct {
	ID           string `json:"id"`
	DisplayName  string `json:"display_name"`
	Background   string `json:"background"`
	Img          string `json:"img"`
}


type AskRequest struct {
	Question    string `json:"question"`
	CharacterID string `json:"character_id"`
	UserID      string `json:"user_id"`
	Style       string `json:"style"`
	UserPersona string `json:"user_persona"`
	Model       string `json:"model"`
}

type AskResponse struct {
	Answer string `json:"answer"`
}

type ChatMessage struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}
