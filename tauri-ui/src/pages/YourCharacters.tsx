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
  const [viewingCharacter, setViewingCharacter] = useState<Character | null>(null);

  const navigate = useNavigate();

  const loadCharacters = () => {
    invoke("load_characters")
      .then((res: any) => {
        setCharacters(res);
      })
      .catch((err) => {
        console.error("Error laoding:", err);
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
      loadCharacters(); 
    } catch (err) {
      console.error("Error deleting:", err);
      alert("❌ Failed to delete character.");
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto text-catppuccin-text space-y-6">
      <h1 className="text-2xl font-bold">Your Characters</h1>

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
                  onClick={() => setViewingCharacter(char)}
                >
                  View
                </button>
                <button
                  className="text-yellow-400 hover:underline"
                  onClick={() => navigate(`/edit/${char.id}`)}
                >
                  Edit
                </button>
                <button
                  className="text-red-400 hover:underline"
                  onClick={() => handleDelete(char.id, char.name)}
                >
                  Delete
                </button>
              </div>
            </div>

            {/* Tags display */}
            {char.tags?.general && char.tags.general.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1">
                {char.tags.general.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 text-xs rounded-full bg-purple-800/30 text-purple-200 border border-purple-700/50"
                  >
                    {tag}
                  </span>
                ))}
                {char.tags.general.length > 3 && (
                  <span className="px-2 py-1 text-xs rounded-full bg-gray-700/30 text-gray-300">
                    +{char.tags.general.length - 3}
                  </span>
                )}
              </div>
            )}
          </div>
        ))}

        {/* View Character Modal - Simplified */}
        {viewingCharacter && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-catppuccin-surface0 p-6 rounded-xl w-full max-w-2xl max-h-[80vh] overflow-y-auto relative text-catppuccin-text">
              <button
                onClick={() => setViewingCharacter(null)}
                className="absolute top-4 right-4 text-xl hover:text-red-400 transition-colors"
              >
                ✖
              </button>

              <div className="flex items-center gap-4 mb-6">
                <img
                  src={viewingCharacter.img || "/assets/characters/default.png"}
                  alt={viewingCharacter.name}
                  className="w-20 h-20 rounded-full object-cover border-2 border-purple-600"
                />
                <div>
                  <h2 className="text-2xl font-bold">{viewingCharacter.name}</h2>
                  <p className="text-catppuccin-subtext1">{viewingCharacter.tagline}</p>
                </div>
              </div>

              <div className="space-y-4">
                {viewingCharacter.description && (
                  <div>
                    <h3 className="font-semibold text-purple-200 mb-2">Description</h3>
                    <p className="text-catppuccin-text bg-catppuccin-surface1 p-3 rounded-lg">
                      {viewingCharacter.description}
                    </p>
                  </div>
                )}

                {viewingCharacter.greeting && (
                  <div>
                    <h3 className="font-semibold text-purple-200 mb-2">Greeting</h3>
                    <p className="text-catppuccin-text bg-catppuccin-surface1 p-3 rounded-lg">
                      {viewingCharacter.greeting}
                    </p>
                  </div>
                )}

                {viewingCharacter.definition && (
                  <div>
                    <h3 className="font-semibold text-purple-200 mb-2">Definition</h3>
                    <p className="text-catppuccin-text bg-catppuccin-surface1 p-3 rounded-lg whitespace-pre-wrap">
                      {viewingCharacter.definition}
                    </p>
                  </div>
                )}

                {viewingCharacter.tags?.general && viewingCharacter.tags.general.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-purple-200 mb-2">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {viewingCharacter.tags.general.map((tag) => (
                        <span
                          key={tag}
                          className="px-3 py-1 text-sm rounded-full bg-purple-800/50 text-purple-200 border border-purple-700/50"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => navigate(`/chat/${viewingCharacter.id}`)}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg transition-colors"
                >
                  Start Chat
                </button>
                <button
                  onClick={() => {
                    setViewingCharacter(null);
                    navigate(`/edit/${viewingCharacter.id}`);
                  }}
                  className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white py-2 rounded-lg transition-colors"
                >
                  Edit Character
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default YourCharacters;