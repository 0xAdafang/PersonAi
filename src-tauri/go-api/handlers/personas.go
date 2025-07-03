package handlers

import (
	"encoding/json"
	"net/http"

	"go-api/models"
	"go-api/utils"
)

func SavePersonaHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Méthode non autorisée", http.StatusMethodNotAllowed)
		return
	}

	var  p models.Persona
	if err := json.NewDecoder(r.Body).Decode(&p); err != nil {
		http.Error(w, "Requête invalide", http.StatusBadRequest)
		return
	}

	list, _ := utils.LoadPersonas()
	found := false
	for i, existing := range list {
		if existing.ID == p.ID {
			list[i] = p
			found = true
			break
		}
	}
	if found {
		list = append(list,p)
	}

	if err := utils.SavePersonas(list); err != nil {
		http.Error(w, "Erreur sauvegarde", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]string{"status": "saved"})
}

func DeletePersonaHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Méthode non autorisée", http.StatusMethodNotAllowed)
		return
	}

	var req struct {
		ID string  `json:"personaId"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Requête invalide", http.StatusBadRequest)
		return
	}

	if err := utils.DeletePersonaByID(req.ID); err != nil {
		http.Error(w, "Erreur suppression", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"status": "deleted"})
}

func ListPersonasHandler(w http.ResponseWriter, r *http.Request) {
	personas, err := utils.LoadPersonas()
	if err != nil {
		http.Error(w, "Erreur chargement", http.StatusInternalServerError)
		return
	}
	json.NewEncoder(w).Encode(personas)
}