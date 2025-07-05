import React, { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { useNavigate } from "react-router-dom";

interface ChatHistoryEntry {
  character_id: string;
  persona_id: string;
  name: string;
  img?: string;
  last_used: number;
}



export default function ChatHistoryPage() {
  const [history, setHistory] = useState<ChatHistoryEntry[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    invoke<ChatHistoryEntry[]>("load_recent_chats")
      .then((data) => {
       
        const sorted = data.sort((a, b) => b.last_used - a.last_used);
        setHistory(sorted);
      })
      .catch((err) => {
        console.error("Error loading history:", err);
      });
  }, []);

  const handleDelete = async (characterId: string, personaId: string) => {
    try {
      await invoke("delete_chat_history", { 
        character_id: characterId, 
        persona_id: personaId 
      });
      setHistory((prev) => 
        prev.filter(h => !(h.character_id === characterId && h.persona_id === personaId))
      );
    } catch (err) {
      console.error("Error deleting history:", err);
    }
  };

  return (
    <div className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {history.length === 0 ? (
        <p className="text-zinc-400 text-center w-full col-span-full">
          Aucun chat enregistré pour le moment.
        </p>
      ) : (
        history.map((entry) => (
          <Card key={`${entry.character_id}_${entry.persona_id}`} className="bg-zinc-800 text-white">
            <CardContent className="p-4 flex flex-col items-start gap-2">
              <div className="flex items-center gap-3">
                <img
                  src={entry.img || "/assets/characters/default.png"}
                  alt={entry.name}
                  className="w-12 h-12 rounded object-cover"
                />
                <div>
                  <h3 className="text-lg font-bold">{entry.name}</h3>
                </div>
              </div>
              <div className="flex gap-2 mt-2">
                <Button 
                  onClick={() => navigate(`/chat/${entry.character_id}/${entry.persona_id}`)}
                >
                  Continuer
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={() => handleDelete(entry.character_id, entry.persona_id)}
                >
                  Supprimer
                </Button>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}

const Card = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`rounded-lg shadow bg-zinc-800 ${className}`}>{children}</div>
);

const CardContent = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`p-4 ${className}`}>{children}</div>
);

const Button = ({
  children,
  onClick,
  variant = "default",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "default" | "destructive";
}) => {
  const base = "px-3 py-1 rounded font-medium text-sm transition-colors";
  const variants = {
    default: "bg-purple-600 hover:bg-purple-700 text-white",
    destructive: "bg-red-600 hover:bg-red-700 text-white",
  };
  return (
    <button onClick={onClick} className={`${base} ${variants[variant]}`}>
      {children}
    </button>
  );
};