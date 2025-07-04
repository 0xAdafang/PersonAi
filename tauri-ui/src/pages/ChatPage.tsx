import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { invoke } from "@tauri-apps/api/core";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp?: Date;
}

interface Character {
  id: string;
  name: string;
  tagline: string;
  img: string;
  definition: string;
  greeting: string;
}

interface Persona {
  id: string;
  display_name: string;
  background: string;
  img: string;
}

const ChatPage = () => {
  const { characterId, personaId } = useParams();
  const navigate = useNavigate();
  const [character, setCharacter] = useState<Character | null>(null);
  const [persona, setPersona] = useState<Persona | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [servicesStarted, setServicesStarted] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initializeChat = async () => {
      try {
        await startServicesIfNeeded();

        if (characterId && personaId) {
          const [loadedCharacter, loadedPersona] = await Promise.all([
            invoke<Character>("load_character_by_id", { id: characterId }),
            invoke<Persona>("load_persona_by_id", { id: personaId })
            ]);

          setCharacter(loadedCharacter);
          setPersona(loadedPersona);

          console.log("CharacterID:", characterId);
            console.log("PersonaID:", personaId);


          if (loadedCharacter) {
            setMessages([{
            role: "assistant",
            content: loadedCharacter.greeting || `Salut ! Je suis ${loadedCharacter.name}.`,
            timestamp: new Date()
            }]);
          }
        }
      } catch (err) {
        console.error("Erreur d'initialisation:", err);
        setError("Impossible d'initialiser le chat. Vérifiez que tous les services sont démarrés.");
      }
    };

    initializeChat();
  }, [characterId, personaId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const startServicesIfNeeded = async () => {
    if (servicesStarted) return;

    try {
      await invoke("start_services");
      setServicesStarted(true);
    } catch (err) {
      console.error("Erreur services:", err);
      throw err;
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    setError(null);

    const trimmedHistory = [...messages]; // historique sans le message courant
    const userMessage: Message = {
      role: "user",
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const aiResponse: string = await invoke("chat_with_character", {
        input: userMessage.content,
        characterId,
        personaId,
        history: trimmedHistory,
      });

      const botMessage: Message = {
        role: "assistant",
        content: aiResponse,
        timestamp: new Date()
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      console.error("Erreur LLM:", err);
      const errorMessage: Message = {
        role: "assistant",
        content: "❌ Désolé, je ne peux pas répondre en ce moment.",
        timestamp: new Date()
      };
      setMessages((prev) => [...prev, errorMessage]);
      setError("Erreur de communication avec le LLM");
    } finally {
      setLoading(false);
    }
  };

  const resetConversation = async () => {
    try {
      await invoke("reset_conversation", {
        userId: personaId,
        characterId: characterId
      });

      if (character) {
        setMessages([{
        role: "assistant",
        content: character.greeting || `Salut ! Je suis ${character.name}.`,
        timestamp: new Date()
        }]);
      } else {
        setMessages([]);
      }
    } catch (err) {
      console.error("Erreur reset:", err);
      setError("Impossible de réinitialiser la conversation");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTimestamp = (timestamp?: Date) => {
    if (!timestamp) return "";
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex h-screen bg-catppuccin-base text-catppuccin-text overflow-hidden">
      <div className="flex-1 flex flex-col">
        <div className="px-6 py-4 border-b border-zinc-800 bg-zinc-900 flex justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate("/")} className="text-gray-400 hover:text-white">← Retour</button>
            <h1 className="text-xl font-semibold">Discussion avec {character?.name || "Personnage"}</h1>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={resetConversation} className="bg-red-600 hover:bg-red-700 px-3 py-1 text-sm rounded text-white">🔄 Reset</button>
            <div className={`w-2 h-2 rounded-full ${servicesStarted ? "bg-green-500" : "bg-red-500"}`}></div>
          </div>
        </div>

        {error && (
          <div className="px-6 py-2 bg-red-900/50 text-red-200 text-sm">
            ⚠️ {error}
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-2xl px-4 py-3 rounded-xl ${msg.role === "user" ? "bg-purple-700/30 text-right" : "bg-zinc-700/60"}`}>
                <p className="whitespace-pre-wrap">{msg.content}</p>
                {msg.timestamp && (
                  <div className="text-xs opacity-50 mt-1">{formatTimestamp(msg.timestamp)}</div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-zinc-700/60 px-4 py-3 rounded-xl">
                <div className="flex items-center gap-2">
                  <div className="animate-spin w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full"></div>
                  <span className="text-sm opacity-70">{character?.name} tape...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 border-t border-zinc-800 bg-zinc-900">
          <form onSubmit={(e) => { e.preventDefault(); sendMessage(); }} className="flex gap-3">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Écrivez votre message..."
              rows={1}
              className="flex-1 p-3 rounded-lg bg-zinc-800 resize-none focus:outline-none focus:ring-2 focus:ring-purple-600"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="bg-purple-600 hover:bg-purple-700 px-5 py-2 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "⏳" : "Envoyer"}
            </button>
          </form>
          <div className="text-xs text-gray-400 mt-1">
            Entrée = envoyer, Shift+Entrée = retour ligne
          </div>
        </div>
      </div>

      <aside className="w-80 p-6 border-l border-zinc-800 bg-zinc-900 overflow-y-auto">
        {character && (
          <div className="space-y-4 text-center">
            <img
              src={character.img || "/assets/characters/default.png"}
              alt={character.name}
              className="w-24 h-24 rounded-full object-cover border-2 border-purple-600 mx-auto"
              onError={(e) => (e.currentTarget.src = "/assets/characters/default.png")}
            />
            <h2 className="text-xl font-bold">{character.name}</h2>
            <p className="text-sm text-catppuccin-subtext1">{character.tagline}</p>
            <hr className="border-zinc-700 my-4" />
            <div className="text-sm whitespace-pre-wrap bg-zinc-800 p-3 rounded-lg max-h-60 overflow-y-auto">
              {character.definition}
            </div>
          </div>
        )}

        {persona && (
          <div className="mt-6 pt-6 border-t border-zinc-700 space-y-3">
            <h3 className="text-sm font-semibold text-purple-300">Votre Persona</h3>
            <div className="flex items-center gap-3">
              <img
                src={persona.img || "/assets/personas/default.png"}
                alt={persona.display_name}
                className="w-12 h-12 rounded-full object-cover"
                onError={(e) => (e.currentTarget.src = "/assets/personas/default.png")}
              />
              <div>
                <div className="text-sm font-medium">{persona.display_name}</div>
              </div>
            </div>
            <div className="text-sm whitespace-pre-wrap bg-zinc-800 p-3 rounded-lg">
              {persona.background}
            </div>
          </div>
        )}
      </aside>
    </div>
  );
};

export default ChatPage;
