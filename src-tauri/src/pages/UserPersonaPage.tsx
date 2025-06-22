import { useState } from "react";
import { Card } from "../components/Card";
import { writeFile, create } from "@tauri-apps/plugin-fs";
import { join, appDataDir } from "@tauri-apps/api/path";


const tags = ["logical", "curious", "emotional", "romantic", "shy", "dominant", "funny", "serious", "passive"];

export default function UserPersonaPage() {
  const [form, setForm] = useState({
    name: "",
    role: "",
    description: "",
    preferences: "",
    personality: "",
    tags: [] as string[]
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleTagToggle = (tag: string) => {
    setForm({
      ...form,
      tags: form.tags.includes(tag)
        ? form.tags.filter(t => t !== tag)
        : [...form.tags, tag]
    });
  };

  const handleSubmit = async () => {
    const fileName = form.name.toLowerCase().replace(/\s+/g, "_") + ".json";
    const dataDir = await appDataDir();
    const personaPath = await join(dataDir, "personas");

    await create(personaPath);
    const encoded = new TextEncoder().encode(JSON.stringify(form, null, 2));
    await writeFile(await join(personaPath, fileName), encoded);

    alert("User Persona saved!");
    };

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">👤 Create your Persona</h1>

        <Card>
            <form className="space-y-4">
            <div>
                <label>Name</label>
                <input name="name" value={form.name} onChange={handleChange} className="input w-full" />
            </div>

            <div>
                <label>Role</label>
                <input name="role" value={form.role} onChange={handleChange} className="input w-full" />
            </div>

            <div>
                <label>Description</label>
                <textarea name="description" value={form.description} onChange={handleChange} className="textarea w-full" />
            </div>

            <div>
                <label>Preferences</label>
                <textarea name="preferences" value={form.preferences} onChange={handleChange} className="textarea w-full" />
            </div>

            <div>
                <label>Personality</label>
                <textarea name="personality" value={form.personality} onChange={handleChange} className="textarea w-full" />
            </div>

            <div>
                <label>Tags</label>
                <div className="flex flex-wrap gap-2 mt-2">
                {tags.map(tag => (
                    <label key={tag} className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        checked={form.tags.includes(tag)}
                        onChange={() => handleTagToggle(tag)}
                    />
                    {tag}
                    </label>
                ))}
                </div>
            </div>

          <button type="button" onClick={handleSubmit} className="btn btn-primary mt-4">
            Save Persona
          </button>
        </form>
      </Card>
    </div>
  );
}
