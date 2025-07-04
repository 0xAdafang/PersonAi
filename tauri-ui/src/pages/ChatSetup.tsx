import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { invoke } from "@tauri-apps/api/core";

interface Character {
    id: string;
    name: string;
    tagline: string;
    img: string;
}

interface Persona {
    id: string;
    display_name: string;
    img: string;
}

const ChatSetup = () => {
    const navigate = useNavigate();
    const [characters, setCharacters] = useState<Character[]>([])
    const [personas, setPersonas] = useState<Persona[]>([])
    const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
    const [selectedPersona, setSelectedPersona] = useState<Persona | null>(null);

    useEffect(() => {
        invoke("load_characters").then((res: any) => setCharacters(res)).catch(console.error);
        invoke("load_personas").then((res:any) => setPersonas(res)).catch(console.error);
    }, []);

    const handleStartChat = () => {
        if (selectedCharacter && selectedPersona) {
            navigate(`/chat/${selectedCharacter.id}/${selectedPersona.id}`);
        }
    };

     return (
    <div className="p-6 max-w-6xl mx-auto text-catppuccin-text space-y-8">
      <h1 className="text-3xl font-bold text-center mb-4">Start a New Chat</h1>

      {/* Characters Section */}
      <div>
        <h2 className="text-xl font-semibold mb-2">Choose a Character</h2>
        {characters.length === 0 ? (
          <div className="text-center">
            <p className="mb-2">No characters available.</p>
            <button
              onClick={() => navigate("/create-character")}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded"
            >
              ➕ Create Character
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {characters.map((char) => (
              <div
                key={char.id}
                onClick={() => setSelectedCharacter(char)}
                className={`cursor-pointer border rounded-lg p-4 flex gap-4 items-center transition ${
                  selectedCharacter?.id === char.id
                    ? "border-purple-600 bg-purple-700/20"
                    : "border-gray-600 hover:border-purple-400"
                }`}
              >
                <img
                  src={char.img || "/assets/characters/default.png"}
                  alt={char.name}
                  className="w-16 h-16 rounded object-cover"
                />
                <div>
                  <h3 className="font-semibold">{char.name}</h3>
                  <p className="text-sm text-gray-400">{char.tagline}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Personas Section */}
      <div>
        <h2 className="text-xl font-semibold mb-2">Choose a Persona</h2>
        {personas.length === 0 ? (
          <div className="text-center">
            <p className="mb-2">No personas available.</p>
            <button
              onClick={() => navigate("/create-persona")}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded"
            >
              ➕ Create Persona
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {personas.map((p) => (
              <div
                key={p.id}
                onClick={() => setSelectedPersona(p)}
                className={`cursor-pointer border rounded-lg p-4 flex gap-4 items-center transition ${
                  selectedPersona?.id === p.id
                    ? "border-purple-600 bg-purple-700/20"
                    : "border-gray-600 hover:border-purple-400"
                }`}
              >
                <img
                  src={p.img || "/assets/personas/default.png"}
                  alt={p.display_name}
                  className="w-16 h-16 rounded object-cover"
                />
                <div>
                  <h3 className="font-semibold">{p.display_name}</h3>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Start Chat Button */}
      <div className="pt-4">
        <button
          disabled={!selectedCharacter || !selectedPersona}
          onClick={handleStartChat}
          className={`w-full py-4 text-white rounded-xl font-semibold transition ${
            selectedCharacter && selectedPersona
              ? "bg-purple-600 hover:bg-purple-700"
              : "bg-gray-600 cursor-not-allowed"
          }`}
        >
          💬 Let's Chat
        </button>
      </div>
    </div>
  );
};

export default ChatSetup;
