import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { useNavigate } from "react-router-dom";

interface Persona {
  id: string;
  display_name: string;
  background: string;
  img: string;
}

const YourPersonas = () => {
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [viewing, setViewing] = useState<Persona | null>(null);
  const navigate = useNavigate();

  const loadPersonas = () => {
    invoke("load_personas")
      .then((res: any) => setPersonas(res))
      .catch((err) => console.error("Failed to load personas:", err));
  };

  useEffect(() => {
    loadPersonas();
  }, []);

  const handleDelete = async (id: string, name: string) => {
    const confirmed = confirm(`⚠️ Delete persona \"${name}\"? This action is irreversible.`);
    if (!confirmed) return;

    try {
      await invoke("delete_persona", { personaId: id });
      alert(`🗑️ Persona \"${name}\" deleted.`);
      loadPersonas();
    } catch (err) {
      console.error("Failed to delete persona:", err);
      alert("❌ Delete failed.");
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto text-catppuccin-text space-y-6">
      <h1 className="text-2xl font-bold">Your Personas</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {personas.map((p) => (
          <div
            key={p.id}
            className="bg-catppuccin-surface0 border border-catppuccin-surface2 rounded-xl p-4 shadow hover:shadow-lg transition"
          >
            <div className="flex items-center gap-4 mb-3">
              <img
                src={p.img || "/assets/personas/default.png"}
                alt={p.display_name}
                className="w-14 h-14 rounded object-cover border border-catppuccin-surface2"
              />
              <div>
                <h2 className="text-lg font-semibold">{p.display_name}</h2>
              </div>
            </div>

            <div className="flex justify-between mt-3 text-sm">
              <button
                className="text-catppuccin-subtext1 hover:underline"
                onClick={() => setViewing(p)}
              >
                View
              </button>
              <div className="space-x-2">
                <button
                  className="text-yellow-400 hover:underline"
                  onClick={() => navigate(`/edit-persona/${p.id}`)}
                >
                  Edit
                </button>
                <button
                  className="text-red-400 hover:underline"
                  onClick={() => handleDelete(p.id, p.display_name)}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}

        {viewing && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-catppuccin-surface0 p-6 rounded-xl w-full max-w-xl max-h-[80vh] overflow-y-auto relative text-catppuccin-text">
              <button
                onClick={() => setViewing(null)}
                className="absolute top-4 right-4 text-xl hover:text-red-400"
              >
                ✖
              </button>

              <div className="flex items-center gap-4 mb-6">
                <img
                  src={viewing.img || "/assets/personas/default.png"}
                  alt={viewing.display_name}
                  className="w-20 h-20 rounded-full object-cover border-2 border-purple-600"
                />
                <h2 className="text-2xl font-bold">{viewing.display_name}</h2>
              </div>

              <div>
                <h3 className="font-semibold text-purple-200 mb-2">Background</h3>
                <p className="text-catppuccin-text bg-catppuccin-surface1 p-3 rounded-lg whitespace-pre-wrap">
                  {viewing.background}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default YourPersonas;
