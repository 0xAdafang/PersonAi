import { useState } from "react";

const CreateCharacter = () => {
  const [form, setForm] = useState({
    name: "",
    tagline: "",
    description: "",
    greeting: "",
    definition: "",
    tags: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    console.log("Saving character...", form);
    
    // - sauvegarder en JSON local
    // - envoyer au backend Go
  };

  return (
    <div className="p-8 max-w-3xl mx-auto text-catppuccin-text">
      <h1 className="text-2xl font-bold mb-6">🧙 Create a new character</h1>

      <div className="space-y-4">
        <Input label="Name" name="name" value={form.name} onChange={handleChange} />
        <Input label="Tagline" name="tagline" value={form.tagline} onChange={handleChange} />
        <Textarea label="Description" name="description" value={form.description} onChange={handleChange} />
        <Textarea label="Greeting" name="greeting" value={form.greeting} onChange={handleChange} />
        <Textarea label="Definition" name="definition" value={form.definition} onChange={handleChange} />
        <Input label="Tags (comma separated)" name="tags" value={form.tags} onChange={handleChange} />

        <button
          onClick={handleSubmit}
          className="mt-4 bg-catppuccin-mauve hover:bg-catppuccin-pink text-white font-medium px-6 py-2 rounded-xl shadow transition hover:shadow-lg hover:scale-[1.03]"
        >
          Create Character
        </button>
      </div>
    </div>
  );
};

const Input = ({ label, ...props }: any) => (
  <div>
    <label className="block text-sm font-medium text-catppuccin-subtext1 mb-1">{label}</label>
    <input
      {...props}
      className="w-full bg-catppuccin-surface0 text-white p-2 rounded-lg border border-catppuccin-surface2 focus:outline-none focus:ring-2 focus:ring-catppuccin-mauve"
    />
  </div>
);

const Textarea = ({ label, ...props }: any) => (
  <div>
    <label className="block text-sm font-medium text-catppuccin-subtext1 mb-1">{label}</label>
    <textarea
      {...props}
      rows={4}
      className="w-full bg-catppuccin-surface0 text-white p-2 rounded-lg border border-catppuccin-surface2 focus:outline-none focus:ring-2 focus:ring-catppuccin-mauve"
    />
  </div>
);

export default CreateCharacter;
