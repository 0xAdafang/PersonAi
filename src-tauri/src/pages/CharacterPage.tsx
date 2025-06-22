import React, {useState} from "react";
import{ Card } from "../components/Card";

declare global {
    interface Window {
        __TAURI__: any;
    }
}

const tags = [
    "fantasy", "anime", "romance", "slice of life",
    "horror", "politics", "action", "nsfw", "nsfl", "game", "books", "original"
];

export default function CharacterPage() {
    const [form, setForm] = useState({
        name: "",
        tagline: "",
        description: "",
        greeting: "",
        definition: "",
        tags: [] as string[],
        image: null as File | null
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setForm({...form, [name]: value});
    };

    const handleTagToggle = (tag: string) => {
        setForm({
            ...form,
            tags: form.tags.includes(tag)
                ? form.tags.filter(t => t !== tag)
                : [...form.tags, tag]
        });
    };

    const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        setForm({ ...form, image: file });
    };

    const handleSubmit = async () => {
        const payload = {
            ...form,
            image: form.image?.name ?? null 
        };

        const fs = window.__TAURI__.fs;
        const path = window.__TAURI__.path;
        const fileName = form.name.toLowerCase().replace(/\s+/g, "_") + ".json";

        const dataDir = await path.join(await path.appDataDir(), "characters");
        await fs.createDir(dataDir, { recursive: true });
        await fs.writeFile(await path.join(dataDir, fileName), JSON.stringify(payload, null, 2));
        alert("Character saved!");
    };        


 return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">🧬 Create a Character</h1>

      <Card>
        <form className="space-y-4">
          <div>
            <label>Name</label>
            <input name="name" value={form.name} onChange={handleChange} className="input w-full" />
          </div>

          <div>
            <label>Tagline</label>
            <input name="tagline" value={form.tagline} onChange={handleChange} className="input w-full" />
          </div>

          <div>
            <label>Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} className="textarea w-full" />
          </div>

          <div>
            <label>Greeting</label>
            <textarea name="greeting" value={form.greeting} onChange={handleChange} className="textarea w-full" />
          </div>

          <div>
            <label>Definition (backstory, personality…)</label>
            <textarea name="definition" value={form.definition} onChange={handleChange} className="textarea w-full h-40" />
          </div>

          <div>
            <label>Image</label>
            <input type="file" accept="image/*" onChange={handleImage} />
            {form.image && <p className="text-sm mt-1">Selected: {form.image.name}</p>}
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
            Save character
          </button>
        </form>
      </Card>
    </div>
  );
}