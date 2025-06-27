import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { useNavigate } from "react-router-dom";

type Character = {
  id: string;
  name: string;
  tagline: string;
  description: string;
  greeting: string;
  definition: string;
  tags: Record<string, string[]>;
};

const YourCharacters = () => {
  const [characters, setCharacters] = useState<Character[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    invoke("load_characters")
      .then((res: any) => {
        const parsed = JSON.parse(res);
        setCharacters(parsed);
      })
      .catch((err) => {
        console.error("Erreur chargement:", err);
      });
  }, []);

  return (
    <div className="p-8 max-w-5xl mx-auto text-catppuccin-text space-y-6">
      <h1 className="text-2xl font-bold">📂 Your Characters</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {characters.map((char) => (
          <div
            key={char.id}
            className="bg-catppuccin-surface0 border border-catppuccin-surface2 rounded-xl p-4 shadow hover:shadow-lg transition"
          >
            <div className="flex items-center gap-4 mb-3">
              <img
                src="/assets/1.png"
                alt={char.name}
                className="w-14 h-14 rounded object-cover border border-catppuccin-surface2"
              />
              <div>
                <h2 className="text-lg font-semibold">{char.name}</h2>
                <p className="text-sm text-catppuccin-subtext1">{char.tagline}</p>
              </div>
            </div>

            <div className="flex justify-between mt-3">
              <button
                className="text-sm text-catppuccin-mauve hover:underline"
                onClick={() => navigate(`/chat/${char.id}`)}
              >
                → Start Chat
              </button>
              <button
                className="text-sm text-catppuccin-subtext1 hover:underline"
                onClick={() => alert(char.description)}
              >
                View
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default YourCharacters;
