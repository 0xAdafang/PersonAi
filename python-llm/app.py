from flask import Flask, request, jsonify
import requests
import json

app = Flask(__name__)

# Configuration des modèles disponibles
MODELS = {
    "pygmalion": "pygmalion2",
    "mythomax": "mythomax-l2-13b", 
    "nous-hermes": "nous-hermes-llama2-13b",
    "mistral": "mistral"  # Garde en fallback
}

# URL d'Ollama (adapté pour usage local, pas Docker)
OLLAMA_URL = "http://localhost:11434/api/generate"

def format_prompt_for_character(prompt_data):
    """
    Formate le prompt spécifiquement pour le roleplay de personnages
    """
    character_prompt = f"""### Character Roleplay Instructions ###

You are roleplaying as {prompt_data.get('character_name', 'a character')}.

**Character Profile:**
- Name: {prompt_data.get('character_name', 'Unknown')}
- Description: {prompt_data.get('character_description', 'No description')}
- Personality: {prompt_data.get('character_personality', 'Friendly')}
- Background: {prompt_data.get('character_background', 'Unknown background')}

**Conversation Context:**
Previous messages: {prompt_data.get('memory', [])}
Current user message: {prompt_data.get('user_message', '')}

**Instructions:**
- Stay completely in character at all times
- Respond as {prompt_data.get('character_name', 'the character')} would respond
- Use the character's speech patterns and personality
- Don't break character or mention you're an AI
- Keep responses conversational and engaging
- Reference past conversation when relevant

**Response:**"""
    
    return character_prompt

@app.route("/generate", methods=["POST"])
def generate():
    data = request.get_json()
    
    # Récupère le modèle demandé (défaut: pygmalion)
    requested_model = data.get("model", "pygmalion")
    model_name = MODELS.get(requested_model, MODELS["pygmalion"])
    
    # Traite le prompt selon le type
    if data.get("type") == "character":
        # Prompt spécialisé pour les personnages
        formatted_prompt = format_prompt_for_character(data)
    else:
        # Prompt simple
        formatted_prompt = data.get("prompt", "")
    
    try:
        # Paramètres optimisés pour le roleplay
        ollama_payload = {
            "model": model_name,
            "prompt": formatted_prompt,
            "stream": False,
            "options": {
                "temperature": 0.8,      # Plus créatif
                "top_p": 0.9,           # Diversité contrôlée
                "top_k": 40,            # Limite les choix
                "repeat_penalty": 1.1,   # Évite les répétitions
                "num_ctx": 4096,        # Contexte étendu
                "num_predict": 512      # Réponses plus longues
            }
        }
        
        response = requests.post(OLLAMA_URL, json=ollama_payload, timeout=60)
        
        if response.status_code == 200:
            result = response.json()
            ai_response = result.get("response", "[Erreur réponse Ollama]")
            
            # Nettoie la réponse (enlève les instructions visibles)
            cleaned_response = clean_response(ai_response)
            
            return jsonify({
                "response": cleaned_response,
                "model_used": model_name,
                "status": "success"
            })
        else:
            return jsonify({
                "response": f"[Erreur Ollama HTTP {response.status_code}]",
                "status": "error"
            })
            
    except requests.exceptions.Timeout:
        return jsonify({
            "response": "[Timeout - Le modèle met trop de temps à répondre]",
            "status": "timeout"
        })
    except Exception as e:
        return jsonify({
            "response": f"[Erreur appel Ollama : {e}]",
            "status": "error"
        })

def clean_response(response):
    """
    Nettoie la réponse pour enlever les artefacts du prompt
    """
    # Enlève les instructions qui pourraient apparaître
    lines_to_remove = [
        "### Character Roleplay Instructions ###",
        "**Character Profile:**",
        "**Conversation Context:**",
        "**Instructions:**",
        "**Response:**"
    ]
    
    cleaned = response
    for line in lines_to_remove:
        cleaned = cleaned.replace(line, "")
    
    # Enlève les espaces en trop
    cleaned = "\n".join([line.strip() for line in cleaned.split("\n") if line.strip()])
    
    return cleaned.strip()

@app.route("/models", methods=["GET"])
def list_models():
    """
    Endpoint pour lister les modèles disponibles
    """
    return jsonify({
        "available_models": MODELS,
        "recommended": "pygmalion"
    })

@app.route("/health", methods=["GET"])
def health_check():
    """
    Endpoint de santé
    """
    return jsonify({"status": "healthy", "service": "PersonAI LLM Service"})

if __name__ == "__main__":
    print("🤖 PersonAI LLM Service démarré")
    print(f"📍 Modèles disponibles: {list(MODELS.keys())}")
    print("🔗 Ollama URL:", OLLAMA_URL)
    app.run(host="0.0.0.0", port=11434, debug=True)