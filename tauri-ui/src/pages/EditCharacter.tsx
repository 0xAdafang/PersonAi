import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { useNavigate, useParams } from "react-router-dom";

const EditCharacter = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [form, setForm] = useState({
    name: "",
    tagline: "",
    description: "",
    greeting: "",
    definition: "",
    img: "",
  });

  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [searchTag, setSearchTag] = useState("");
  const [loading, setLoading] = useState(true);

  const predefinedTags = [
    "Anime", "Action", "Adventure", "Fantasy", "Romance", "Shy",
    "Yandere", "LGBTQIA+", "Platonic", "Boss", "Boyfriend",
    "Girlfriend", "Husband", "Mafia", "Wife", "Human", "Slice of Life",
    "Classmate", "Coworker", "Schoolmate", "RPG", "Vampire",
    "Love interest", "One-sided", "Magicverse", "Royalverse", "Comics",
    "SFW", "NSFW", "Dominant", "Submissive", "Male", "Female", "Non-binary"
  ];

  
  useEffect(() => {
    if (id) {
     
      invoke<any[]>("load_characters")
        .then((characters: any[]) => {
          const character = characters.find(char => char.id === id);
          if (character) {
            setForm({
              name: character.name || "",
              tagline: character.tagline || "",
              description: character.description || "",
              greeting: character.greeting || "",
              definition: character.definition || "",
              img: character.img || "",
            });
            
            
            const allTags: string[] = [];
            if (character.tags) {
              Object.values(character.tags).forEach((tagArray: any) => {
                if (Array.isArray(tagArray)) {
                  allTags.push(...tagArray);
                }
              });
            }
            setSelectedTags(allTags);
            setLoading(false);
          } else {
            alert("❌ Personnage non trouvé");
            navigate("/your-characters");
          }
        })
        .catch((err) => {
          console.error("Erreur chargement personnages:", err);
          alert("❌ Erreur lors du chargement du personnage");
          navigate("/your-characters");
        });
    } else {
      navigate("/your-characters");
    }
  }, [id, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageSelect = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = () => {
          const buffer = reader.result as ArrayBuffer;
          const blob = new Blob([buffer]);
          const newFilePath = `/assets/characters/${file.name}`;

          invoke("copy_image_to_path", {
            fileName: file.name,
            data: Array.from(new Uint8Array(buffer))
          }).then(() => {
            setForm({...form, img: newFilePath });
          }).catch((e) => {
            console.error("Copy failed", e);
          });
        };
        reader.readAsArrayBuffer(file);
      }
    };
    input.click();
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      alert("❌ Character name is required!");
      return;
    }

    const character = {
      id: id!,
      name: form.name,
      tagline: form.tagline,
      description: form.description,
      greeting: form.greeting,
      definition: form.definition,
      tags: { general: selectedTags },
      img: form.img || "placeholder.png",
    };

    try {
      await invoke("update_character", { character });
      alert("✅ Character updated successfully!");
      navigate("/your-characters");
    } catch (err) {
      console.error("Update error:", err);
      alert("❌ Update failed.");
    }
  };

  const filteredTags = predefinedTags.filter(tag => 
    !selectedTags.includes(tag) && 
    tag.toLowerCase().includes(searchTag.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-catppuccin-base text-catppuccin-text flex items-center justify-center">
        <div className="text-xl">Loading character...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-catppuccin-base text-catppuccin-text">
      <div className="min-h-screen">
        <div className="max-w-4xl mx-auto p-6">
        
          
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={() => navigate("/characters")}
              className="text-purple-300 hover:text-white transition-colors"
            >
              ← Back to Characters
            </button>
            <h1 className="text-xl font-medium">Edit Character</h1>
          </div>

          
          <div className="flex justify-center mb-8">
            <div 
              onClick={handleImageSelect}
              className="relative w-32 h-32 rounded-full bg-gradient-to-br from-purple-800 to-purple-900 border-2 border-purple-600 hover:border-purple-400 cursor-pointer overflow-hidden group transition-all"
            >
              {form.img ? (
                <img 
                  src={form.img} 
                  alt="Character preview"
                  className="w-full h-full object-cover transition-opacity duration-300"
                  onLoad={(e) => {
                    e.currentTarget.style.opacity = '1';
                  }}
                  style={{ opacity: 0 }}
                />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-4xl">🦊</div>
                  </div>
                )}
              <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="text-sm">Change Image</span>
              </div>
            </div>
          </div>

          
          <div className="space-y-6">
            
           
            <div>
              <label className="block text-sm font-medium text-purple-200 mb-2">
                Character name
              </label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="e.g. Albert Einstein"
                className="w-full bg-gray-800/50 backdrop-blur text-white p-4 rounded-xl border border-purple-700/50 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all"
              />
              <div className="text-right text-xs text-purple-300 mt-1">
                {form.name.length}/20
              </div>
            </div>

            
            <div>
              <label className="block text-sm font-medium text-purple-200 mb-2">
                Tagline
              </label>
              <input
                name="tagline"
                value={form.tagline}
                onChange={handleChange}
                placeholder="Add a short tagline of your Character"
                className="w-full bg-gray-800/50 backdrop-blur text-white p-4 rounded-xl border border-purple-700/50 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all"
              />
              <div className="text-right text-xs text-purple-300 mt-1">
                {form.tagline.length}/50
              </div>
            </div>

            
            <div>
              <label className="block text-sm font-medium text-purple-200 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="How would your Character describe themselves?"
                rows={4}
                className="w-full bg-gray-800/50 backdrop-blur text-white p-4 rounded-xl border border-purple-700/50 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all resize-none"
              />
              <div className="text-right text-xs text-purple-300 mt-1">
                {form.description.length}/500
              </div>
            </div>

           
            <div>
              <label className="block text-sm font-medium text-purple-200 mb-2">
                Greeting
              </label>
              <textarea
                name="greeting"
                value={form.greeting}
                onChange={handleChange}
                placeholder="e.g. Hello, I am Albert. Ask me anything about my scientific contributions."
                rows={3}
                className="w-full bg-gray-800/50 backdrop-blur text-white p-4 rounded-xl border border-purple-700/50 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all resize-none"
              />
              <div className="text-right text-xs text-purple-300 mt-1">
                {form.greeting.length}/4096
              </div>
            </div>

            
            <div>
              <label className="block text-sm font-medium text-purple-200 mb-2">
                Definition
              </label>
              <textarea
                name="definition"
                value={form.definition}
                onChange={handleChange}
                placeholder="Define your character's personality, background, and behavior patterns..."
                rows={4}
                className="w-full bg-gray-800/50 backdrop-blur text-white p-4 rounded-xl border border-purple-700/50 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all resize-none"
                />
              <div className="text-right text-xs text-purple-300 mt-1">
                {form.definition.length}/2000
              </div>
            </div>

            
            <div>
              <label className="block text-sm font-medium text-purple-200 mb-2">
                Tags
              </label>
              <div className="bg-gray-800/50 backdrop-blur p-4 rounded-xl border border-purple-700/50">
                <input
                  value={searchTag}
                  onChange={(e) => setSearchTag(e.target.value)}
                  placeholder="Search tags"
                  className="w-full bg-gray-700/50 backdrop-blur text-white p-3 rounded-lg border border-purple-600/50 focus:outline-none focus:border-purple-400 mb-4"
                />
                
               
                {selectedTags.length > 0 && (
                  <div className="mb-4">
                    <div className="text-sm text-purple-300 mb-2">Selected:</div>
                    <div className="flex flex-wrap gap-2">
                      {selectedTags.map(tag => (
                        <span
                          key={tag}
                          onClick={() => toggleTag(tag)}
                          className="px-3 py-1 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-full text-sm cursor-pointer hover:from-purple-500 hover:to-purple-600 transition-all transform hover:scale-105"
                        >
                          {tag} ×
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                
                <div className="max-h-40 overflow-y-auto">
                  <div className="flex flex-wrap gap-2">
                    {filteredTags.map(tag => (
                      <button
                        key={tag}
                        onClick={() => toggleTag(tag)}
                        className="px-3 py-1 bg-gray-700/50 text-purple-200 rounded-full text-sm hover:bg-purple-700/30 hover:text-white transition-all transform hover:scale-105"
                      >
                        + {tag}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

           
            <div className="pt-6">
              <button
                onClick={handleSubmit}
                className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white font-medium py-4 rounded-xl transition-all transform hover:scale-[1.02] hover:shadow-lg hover:shadow-purple-500/25"
              >
                Update Character
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default EditCharacter;