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
  img: string;
};

const YourCharacters = () => {
  const [characters, setCharacters] = useState<Character[]>([]);
  const navigate = useNavigate();

  const loadCharacters = () => {
    invoke("load_characters")
      .then((res: any) => {
        setCharacters(res);
      })
      .catch((err) => {
        console.error("Erreur chargement:", err);
      });
  };

  useEffect(() => {
    loadCharacters();
  }, []);

  const handleDelete = async (id: string, name: string) => {
    const confirmed = confirm(`⚠️ Are you sure you want to delete "${name}"? This action is irreversible.`);
    if (!confirmed) return;

    try {
      await invoke("delete_character", { id });
      alert(`🗑️ "${name}" deleted successfully.`);
      loadCharacters(); // reload list
    } catch (err) {
      console.error("Erreur suppression:", err);
      alert("❌ Failed to delete character.");
    }
  };

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
                src={char.img || "/assets/characters/default.png"}
                alt={char.name}
                className="w-14 h-14 rounded object-cover border border-catppuccin-surface2"
              />
              <div>
                <h2 className="text-lg font-semibold">{char.name}</h2>
                <p className="text-sm text-catppuccin-subtext1">{char.tagline}</p>
              </div>
            </div>

            <div className="flex justify-between mt-3 text-sm">
              <button
                className="text-catppuccin-mauve hover:underline"
                onClick={() => navigate(`/chat/${char.id}`)}
              >
                → Start Chat
              </button>
              <div className="space-x-2">
                <button
                  className="text-catppuccin-subtext1 hover:underline"
                  onClick={() => alert(char.description)}
                >
                  View
                </button>
                <button
                  className="text-red-400 hover:underline"
                  onClick={() => handleDelete(char.id, char.name)}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default YourCharacters;
