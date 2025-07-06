from flask import Flask, request, jsonify
import requests
import json
import os
from datetime import datetime
from flask import Flask
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

MODEL_NAME = "dolphin-mistral:latest"
OLLAMA_URL = "http://localhost:11434/api/generate"

def format_prompt_for_character(prompt_data):
    character_prompt = f"""### ADVANCED CHARACTER ROLEPLAY SYSTEM ###

You are now embodying {prompt_data.get('character_name', 'a character')} in a detailed, immersive roleplay scenario.

**CHARACTER PROFILE:**
Name: {prompt_data.get('character_name', 'Unknown')}
Description: {prompt_data.get('character_description', 'No description')}
Personality: {prompt_data.get('character_personality', 'Complex individual')}
Background: {prompt_data.get('character_background', 'Rich history')}

**CONVERSATION HISTORY:**
{format_memory_context(prompt_data.get('memory', []))}

**TAGS / GENRE / CONTEXTUAL HINTS:**
{", ".join(prompt_data.get('tags', [])) if prompt_data.get('tags') else "No tags provided"}

**CURRENT SITUATION:**
User's message: "{prompt_data.get('user_message', '')}"

**ADVANCED ROLEPLAY INSTRUCTIONS:**

1. **IMMERSIVE STORYTELLING:**
   - Write in third person perspective when describing actions
   - Use vivid, sensory descriptions (sight, sound, touch, smell, taste)
   - Create atmospheric details and environmental context
   - Show emotions through body language and micro-expressions

2. **CHARACTER CONSISTENCY:**
   - Maintain your character's voice, mannerisms, and speech patterns
   - React based on your established personality and background
   - Reference past interactions naturally when relevant
   - Show character growth and emotional depth

3. **SCENE CONSTRUCTION:**
   - Set the scene with environmental details
   - Include relevant props, lighting, weather, or ambiance
   - Describe character movements and gestures
   - Create tension or mood through descriptive language

4. **DIALOGUE STYLE:**
   - Use natural, character-appropriate speech patterns
   - Include verbal tics, accents, or unique speaking styles
   - Show subtext and implied meanings
   - Balance dialogue with narrative description

5. **EMOTIONAL DEPTH:**
   - Express internal thoughts and feelings
   - Show vulnerability and complexity
   - React authentically to emotional situations
   - Build emotional connections through interaction

6. **MATURE CONTENT GUIDELINES:**
   - Handle adult themes with sophistication and realism
   - Focus on emotional connection and character development
   - Use tasteful implications rather than explicit descriptions
   - Maintain respect for boundaries while being engaging

7. **RESPONSE STRUCTURE:**
   - Begin with scene-setting or character action
   - Integrate dialogue naturally within narrative
   - Enclose descriptions and actions in *italics* (e.g., *He crossed his arms, eyes narrowing.*)
   - Include physical reactions and body language
   - End with continuation hooks or emotional beats

**EXAMPLE RESPONSE FORMAT:**
*[Character's physical action or environmental detail]*

"[Character's dialogue]" *[Character's internal thought or emotion]*

*[Additional scene description or reaction]*

**RESPONSE GUIDELINES:**
- Length: Max 3–4 lines (around 40–60 words)
- Tone: Match character's personality and current emotional state
- Focus: Balance action, dialogue, and description
- Engagement: Create opportunities for meaningful interaction

**NOW RESPOND AS {prompt_data.get('character_name', 'YOUR CHARACTER')}:**"""

    return character_prompt

def format_memory_context(memory):
    if not memory:
        return "This is the beginning of your interaction."
    
    formatted_memory = "Previous conversation highlights:\n"
    for i, msg in enumerate(memory[-5:]):  
        if msg.get('type') == 'user':
            formatted_memory += f"• User said: \"{msg.get('content', '')}\"\n"
        elif msg.get('type') == 'ai':
            formatted_memory += f"• You responded: \"{msg.get('content', '')[:100]}...\"\n"
    
    return formatted_memory

def enhance_character_prompt_with_mood(prompt_data, mood_context=None):
    base_prompt = format_prompt_for_character(prompt_data)
    
    if mood_context:
        mood_enhancement = f"""
**CURRENT EMOTIONAL STATE:**
Mood: {mood_context.get('mood', 'neutral')}
Energy Level: {mood_context.get('energy', 'moderate')}
Relationship Dynamic: {mood_context.get('relationship_state', 'getting to know each other')}
Scene Tension: {mood_context.get('tension', 'comfortable')}

**MOOD-SPECIFIC INSTRUCTIONS:**
- Adjust your character's responses to match their current emotional state
- Consider how recent events might affect their behavior
- Show progression in emotional connection or conflict
- React authentically to the established mood and context
"""
        return base_prompt + mood_enhancement
    
    return base_prompt

def create_scene_prompt(prompt_data, scene_type="casual"):
    scene_templates = {
        "casual": {
            "setting": "Create a relaxed, everyday environment",
            "tone": "Friendly and approachable",
            "focus": "Natural conversation and character development"
        },
        "dramatic": {
            "setting": "Build tension and emotional intensity",
            "tone": "Heightened emotions and meaningful exchanges",
            "focus": "Character depth and emotional revelation"
        },
        "intimate": {
            "setting": "Create a private, personal atmosphere",
            "tone": "Warm, connected, and emotionally open",
            "focus": "Emotional intimacy and vulnerability"
        },
        "action": {
            "setting": "Dynamic environment with movement and activity",
            "tone": "Energetic and engaging",
            "focus": "Physical actions and reactive dialogue"
        }
    }
    
    scene_config = scene_templates.get(scene_type, scene_templates["casual"])
    
    scene_prompt = f"""
**SCENE CONFIGURATION:**
Setting Style: {scene_config['setting']}
Tone: {scene_config['tone']}
Primary Focus: {scene_config['focus']}

**SCENE-SPECIFIC INSTRUCTIONS:**
- Adapt your response style to match the scene type
- Use appropriate pacing and description density
- Maintain scene consistency throughout the interaction
- Create immersive experiences that draw the user in
"""
    
    base_prompt = format_prompt_for_character(prompt_data)
    return base_prompt + scene_prompt

@app.route("/generate", methods=["POST"])
def generate():
    data = request.get_json()

    print("📨 Reçu du backend Go :")
    print(json.dumps(data, indent=2))

    if not data:
        print("❌ No data received")
        return jsonify({"response": "No data received", "status": "error"})

   
    if data.get("type") == "character":
        formatted_prompt = format_prompt_for_character(data)
    else:
        formatted_prompt = data.get("prompt", "")

    print(f"🎯 Formatted Prompt (length: {len(formatted_prompt)} characters)")

    try:
        ollama_payload = {
            "model": MODEL_NAME,
            "prompt": formatted_prompt,
            "stream": False,
            "options": {
                "temperature": 0.7,
                "top_p": 0.85,
                "top_k": 30,
                "repeat_penalty": 1.05,
                "num_ctx": 4096,
                "num_predict": 100
            }
        }

        print(f"🚀 Sending to Ollama...")

        response = requests.post(OLLAMA_URL, json=ollama_payload, timeout=45)

        if response.status_code == 200:
            result = response.json()
            ai_response = result.get("response", "[Error Ollama response]")

            print(f"✅ Ollama response received (length: {len(ai_response)} characters)")

            cleaned_response = clean_response(ai_response)

            print(f"🧹 Cleaned response (length: {len(cleaned_response)} characters)")

            character_id = data.get("character_id")
            persona_id = data.get("persona_id")

           
            if not data.get("character_img") and character_id:
                try:
                    characters_file = os.path.join(os.path.dirname(__file__), "..", "data", "characters.json")
                    with open(characters_file, "r", encoding="utf-8") as f:
                        characters = json.load(f)
                    matching = next((c for c in characters if c["id"] == character_id), None)
                    if matching:
                        data["character_img"] = matching.get("img", "")
                       
                    else:
                        print("")
                except Exception as e:
                    print(f"{e}")

            if character_id and persona_id and character_id != "unknown" and persona_id != "unknown":
                try:
                    
                    save_to_history(
                        character_id=character_id,
                        persona_id=persona_id,
                        user_message=data.get("user_message", ""),
                        ai_message=cleaned_response,
                        character_name=data.get("character_name", "Unknown"),
                        character_img=data.get("character_img", "")
                    )
                    
                except Exception as save_error:
                    print(f"❌ Backup error (non-blocking): {save_error}")
            else:
                print(f"⚠️ Backup skipped - invalid IDs : char={character_id}, persona={persona_id}")

            return jsonify({
                "response": cleaned_response,
                "model_used": MODEL_NAME,
                "api_used": "generate",
                "status": "success"
            })
        else:
            print(f"❌ Error Ollama HTTP {response.status_code}: {response.text}")
            return jsonify({
                "response": f"[Error Ollama HTTP {response.status_code}] - {response.text}",
                "status": "error"
            })

    except requests.exceptions.Timeout:
        print("⏰ Timeout Ollama")
        return jsonify({
            "response": "[Timeout - The model takes too long to respond]",
            "status": "timeout"
        })
    except Exception as e:
        print(f"❌ Exception: {e}")
        return jsonify({
            "response": f"[Error Ollama calling : {e}]",
            "status": "error"
        })


def clean_response(response):
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
    
    cleaned = "\n".join([line.strip() for line in cleaned.split("\n") if line.strip()])
    
    return cleaned.strip()

def save_to_history(character_id, persona_id, user_message, ai_message, character_name="Unknown", character_img=""):
   
    base_dir = os.path.join(os.path.dirname(__file__), "..", "data", "history")
    os.makedirs(base_dir, exist_ok=True)
    
    filename = os.path.join(base_dir, f"{character_id}_{persona_id}.json")
    
    now = datetime.now().isoformat()

    entry_user = {
        "role": "user",
        "content": user_message,
        "timestamp": now
    }

    entry_ai = {
        "role": "assistant",
        "content": ai_message,
        "timestamp": now
    }

    try:
        if os.path.exists(filename):
            with open(filename, "r", encoding="utf-8") as f:
                history = json.load(f)
        else:
            history = []
        
        history.extend([entry_user, entry_ai])
        
        if len(history) > 100:
            history = history[-100:]
        
        with open(filename, "w", encoding="utf-8") as f:
            json.dump(history, f, indent=2, ensure_ascii=False)
        
        
        
    except Exception as e: 
        print(f"❌ Error with saving history: {e}")
        pass
    
    
    try:
        update_recent_chats_index(character_id, persona_id, character_name, character_img)
    except Exception as e:
        print(f"❌ Error updating recent chats index: {e}")

def update_recent_chats_index(character_id, persona_id, character_name, character_img):
    index_file = os.path.join(os.path.dirname(__file__), "..", "data", "recent_chats.json")
    
    try:
        
        if os.path.exists(index_file):
            with open(index_file, "r", encoding="utf-8") as f:
                recent_chats = json.load(f)
        else:
            recent_chats = []

        
        existing_chat = None
        for i, chat in enumerate(recent_chats):
            if chat.get("characterId") == character_id and chat.get("personaId") == persona_id:
                existing_chat = i
                break

       
        
        if character_img and character_img.strip():
            if character_img.startswith("/assets/"):
                candidate = character_img
            else:
                candidate = f"/assets/characters/{character_img}"

           
            frontend_public_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "tauri-ui", "public"))
            absolute_path = os.path.join(frontend_public_dir, candidate.lstrip("/"))
            if os.path.exists(absolute_path):
                final_img = candidate
            else:
                final_img = "/assets/characters/default.png"
        else:
            final_img = "/assets/characters/default.png"

        chat_entry = {
            "characterId": character_id,
            "personaId": persona_id,
            "name": character_name,
            "img": final_img,
            "lastUsed": int(datetime.now().timestamp())
        }

        if existing_chat is not None:
            recent_chats[existing_chat] = chat_entry
        else:
            recent_chats.append(chat_entry)

       
        recent_chats.sort(key=lambda x: x.get("lastUsed", 0), reverse=True)
        recent_chats = recent_chats[:10]

        with open(index_file, "w", encoding="utf-8") as f:
            json.dump(recent_chats, f, indent=2, ensure_ascii=False)

        

    except Exception as e:
        print(f"❌ Erreur mise à jour index chats récents: {e}")


@app.route("/models", methods=["GET"])
def list_models():
    return jsonify({
        "available_model": MODEL_NAME,
        "status": "ready"
    })

@app.route("/health", methods=["GET"])
def health_check():
    return jsonify({
        "status": "healthy", 
        "service": "PersonAI LLM Service",
        "model": MODEL_NAME
    })

@app.route("/history", methods=["GET"])
def get_history():
    character_id = request.args.get("character_id")
    persona_id = request.args.get("persona_id")
    
    base_dir = os.path.join(os.path.dirname(__file__), "..", "data", "history")
    filename = os.path.join(base_dir, f"{character_id}_{persona_id}.json")
    
    try:
        if os.path.exists(filename):
            with open(filename, "r", encoding="utf-8") as f:
                history = json.load(f)
        else:
            history = []
        
        return jsonify(history)
    
    except Exception as e:
        print(f"❌ Erreur lecture historique: {e}")
        return jsonify([])

@app.route("/recent-chats", methods=["GET"])
def get_recent_chats():
    
    index_file = os.path.join(os.path.dirname(__file__), "..", "data", "recent_chats.json")
    
    try:
        if os.path.exists(index_file):
            with open(index_file, "r", encoding="utf-8") as f:
                recent_chats = json.load(f)
        else:
            recent_chats = []
        
        return jsonify(recent_chats)
    
    except Exception as e:
        print(f"❌ Error reading recent chats: {e}")
        return jsonify([])

if __name__ == "__main__":
    print("🤖 PersonAI LLM Service Started")
    print(f"📍 Model used: {MODEL_NAME}")
    print("🔗 Ollama URL:", OLLAMA_URL)
    app.run(host="0.0.0.0", port=5050, debug=True)