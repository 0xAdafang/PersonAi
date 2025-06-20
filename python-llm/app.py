from flask import Flask, request, jsonify

app = Flask(__name__)

OLLAMA_URL = "http://host.docker.internal:11434/api/generate"

@app.route("/generate", methods=["POST"])
def generate():
    data = request.get_json()
    prompt = data.get("prompt", "")
    
    try:
        response = requests.post(OLLAMA_URL, json={
            "model": "mistral",
            "prompt": prompt,
            "stream": False
        })
        
        result = response.json()
        return jsonify({"response": result.get("response", "[Erreur réponse Ollama]")})
    except Exception as e:
        return jsonify({"response": f"[Erreur appel Ollama : {e}]"})
                
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=11434)
    
    