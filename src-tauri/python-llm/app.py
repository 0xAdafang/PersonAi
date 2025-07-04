from flask import Flask, request, jsonify
import requests
import json
import os

app = Flask(__name__)

# ✅ Simplifié : Vicuna uniquement
MODEL_NAME = "vicuna:latest"
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
    
    print("📨 Reçu du backend Go :")
    print(json.dumps(data, indent=2))
    print(f"🎯 Modèle utilisé: {MODEL_NAME}")
    
    # Traite le prompt selon le type
    if data.get("type") == "character":
        formatted_prompt = format_prompt_for_character(data)
    else:
        formatted_prompt = data.get("prompt", "")
    
    try:
        # Payload pour Ollama avec Vicuna
        ollama_payload = {
            "model": MODEL_NAME,
            "prompt": formatted_prompt,
            "stream": False,
            "options": {
                "temperature": 0.8,
                "top_p": 0.9,
                "top_k": 40,
                "repeat_penalty": 1.1,
                "num_ctx": 4096,
                "num_predict": 512
            }
        }
        
        print(f"🚀 API utilisée: {OLLAMA_URL}")
        print(f"🚀 Modèle utilisé: {MODEL_NAME}")
        print("🚀 Payload envoyé à Ollama:")
        print(json.dumps(ollama_payload, indent=2))
        
        response = requests.post(OLLAMA_URL, json=ollama_payload, timeout=60)
        
        print(f"📡 Réponse Ollama - Status: {response.status_code}")
        print(f"📡 Réponse Ollama - Content: {response.text}")
        
        if response.status_code == 200:
            result = response.json()
            ai_response = result.get("response", "[Erreur réponse Ollama]")
            
            # Nettoie la réponse
            cleaned_response = clean_response(ai_response)
            
            return jsonify({
                "response": cleaned_response,
                "model_used": MODEL_NAME,
                "api_used": "generate",
                "status": "success"
            })
        else:
            return jsonify({
                "response": f"[Erreur Ollama HTTP {response.status_code}] - {response.text}",
                "status": "error"
            })
            
    except requests.exceptions.Timeout:
        return jsonify({
            "response": "[Timeout - Le modèle met trop de temps à répondre]",
            "status": "timeout"
        })
    except Exception as e:
        print(f"❌ Exception: {e}")
        return jsonify({
            "response": f"[Erreur appel Ollama : {e}]",
            "status": "error"
        })

def clean_response(response):
    """
    Nettoie la réponse du modèle
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
    Retourne le modèle disponible
    """
    return jsonify({
        "available_model": MODEL_NAME,
        "status": "ready"
    })

@app.route("/health", methods=["GET"])
def health_check():
    """
    Vérification de santé du service
    """
    return jsonify({
        "status": "healthy", 
        "service": "PersonAI LLM Service",
        "model": MODEL_NAME
    })

if __name__ == "__main__":
    print("🤖 PersonAI LLM Service démarré")
    print(f"📍 Modèle utilisé: {MODEL_NAME}")
    print("🔗 Ollama URL:", OLLAMA_URL)
    app.run(host="0.0.0.0", port=5050, debug=True)