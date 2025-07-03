import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { useNavigate } from "react-router-dom";

const generateID = (name: string) => {
  return name.toLowerCase().replace(/\s+/g, "-") + "_" + Date.now();
};

const CreatePersona = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    display_name: "",
    background: "",
    img: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageSelect = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = () => {
          const buffer = reader.result as ArrayBuffer;
          invoke("copy_image_to_persona", {
            fileName: file.name,
            data: Array.from(new Uint8Array(buffer)),
          }).then(() => {
            setForm({ ...form, img: `/assets/personas/${file.name}` });
          });
        };
        reader.readAsArrayBuffer(file);
      }
    };
    input.click();
  };

  const handleSubmit = async () => {
    if (!form.display_name.trim()) {
      alert("❌ Persona name is required!");
      return;
    }

    const persona = {
      id: generateID(form.display_name),
      display_name: form.display_name,
      background: form.background,
      img: form.img || "placeholder.png",
    };

    try {
      await invoke("save_persona", { persona });
      alert("✅ Persona saved!");
      navigate("/personas");
    } catch (err) {
      console.error("Save error:", err);
      alert("❌ Save failed.");
    }
  };

  return (
    <div className="min-h-screen bg-catppuccin-base text-catppuccin-text">
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate("/")}
            className="text-purple-300 hover:text-white transition-colors"
          >
            ← Back
          </button>
          <h1 className="text-xl font-medium">Create Persona</h1>
          <div className="w-24" />
        </div>

        <div className="flex justify-center mb-8">
          <div
            onClick={handleImageSelect}
            className="relative w-32 h-32 rounded-full bg-gradient-to-br from-purple-800 to-purple-900 border-2 border-purple-600 hover:border-purple-400 cursor-pointer overflow-hidden group transition-all"
          >
            {form.img ? (
              <img
                src={form.img}
                alt="Preview"
                className="w-full h-full object-cover transition-opacity duration-300"
                onLoad={(e) => {
                  e.currentTarget.style.opacity = "1";
                }}
                style={{ opacity: 0 }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-4xl">🎭</div>
              </div>
            )}
            <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <span className="text-sm">Upload</span>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-purple-200 mb-2">
              Display Name
            </label>
            <input
              name="display_name"
              value={form.display_name}
              onChange={handleChange}
              placeholder="e.g. Mystic Bard"
              className="w-full bg-gray-800/50 backdrop-blur text-white p-4 rounded-xl border border-purple-700/50 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-purple-200 mb-2">
              Background
            </label>
            <textarea
              name="background"
              value={form.background}
              onChange={handleChange}
              placeholder="Describe your persona's traits, context, or tone..."
              rows={4}
              className="w-full bg-gray-800/50 backdrop-blur text-white p-4 rounded-xl border border-purple-700/50 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all resize-none"
            />
          </div>

          <div className="pt-6">
            <button
              onClick={handleSubmit}
              className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white font-medium py-4 rounded-xl transition-all transform hover:scale-[1.02] hover:shadow-lg hover:shadow-purple-500/25"
            >
              Create Persona
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePersona;
