import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Character } from "../types/types";

import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../components/ui/select";
import { Button } from "../components/ui/button";
import { Label } from "../components/ui/label";
import { Badge } from "../components/ui/badge";


interface CharacterCreationProps {
  onCharacterCreated: (char: Character) => void;
}

export function CharacterCreation({
  onCharacterCreated,
}: CharacterCreationProps) {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    tagline: "",
    description: "",
    greeting: "",
    definition: "",
    genre: [] as string[],
    rating: "sfw" as "sfw" | "nsfw",
    characterType: [] as string[],
    source: "original",
  });

  const availableGenres = [
    "fantasy",
    "sci-fi",
    "romance",
    "action",
    "adventure",
    "mystery",
    "horror",
    "comedy",
    "drama",
    "slice of life",
    "dystopia",
  ];

  const availableCharacterTypes = [
    "male",
    "female",
    "non-binary",
    "dominant",
    "submissive",
    "switch",
    "mystic",
    "warrior",
    "noble",
    "rogue",
  ];

  const availableSources = ["original", "anime", "game", "book", "movie"];

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddTag = (field: "genre" | "characterType", value: string) => {
    if (!formData[field].includes(value)) {
      setFormData((prev) => ({ ...prev, [field]: [...prev[field], value] }));
    }
  };

  const handleRemoveTag = (field: "genre" | "characterType", value: string) => {
      setFormData((prev) => ({
      ...prev,
      [field]: prev[field].filter((v) => v !== value),
    }));
  };

  const generateId = (name: string) => {
    return (
      name
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "")
        .slice(0, 12) +
      "_" +
      Date.now()
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newCharacter: Character = {
      id: generateId(formData.name),
      name: formData.name,
      tagline: formData.tagline,
      description: formData.description,
      greeting: formData.greeting,
      definition: formData.definition,
      image: "/assets/characters/default.png",
      tags: {
        genre: formData.genre,
        rating: [formData.rating],
        character: formData.characterType,
        source: [formData.source],
      },
    };
    onCharacterCreated(newCharacter);
    navigate(`/chat/${newCharacter.id}`);
  };

  return (
    <div className="p-6 space-y-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold">Créer un nouveau personnage</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label>Nom</Label>
          <Input
            value={formData.name}
            onChange={(e) => handleChange("name", e.target.value)}
            required
          />
        </div>

        <div>
          <Label>Tagline</Label>
          <Input
            value={formData.tagline}
            onChange={(e) => handleChange("tagline", e.target.value)}
          />
        </div>

        <div>
          <Label>Description</Label>
          <Textarea
            value={formData.description}
            onChange={(e) => handleChange("description", e.target.value)}
          />
        </div>

        <div>
          <Label>Greeting</Label>
          <Textarea
            value={formData.greeting}
            onChange={(e) => handleChange("greeting", e.target.value)}
          />
        </div>

        <div>
          <Label>Définition (comportement, style, personnalité...)</Label>
          <Textarea
            value={formData.definition}
            onChange={(e) => handleChange("definition", e.target.value)}
          />
        </div>

        <div>
          <Label>Genres</Label>
          <div className="flex flex-wrap gap-2 mt-2">
            {availableGenres.map((g) => (
              <Badge
                key={g}
                className={`cursor-pointer ${
                  formData.genre.includes(g)
                    ? "bg-primary text-white"
                    : "bg-muted"
                }`}
                onClick={() =>
                  formData.genre.includes(g)
                    ? handleRemoveTag("genre", g)
                    : handleAddTag("genre", g)
                }
              >
                {g}
              </Badge>
            ))}
          </div>
        </div>

        <div>
          <Label>Type de personnage</Label>
          <div className="flex flex-wrap gap-2 mt-2">
            {availableCharacterTypes.map((type) => (
              <Badge
                key={type}
                className={`cursor-pointer ${
                  formData.characterType.includes(type)
                    ? "bg-primary text-white"
                    : "bg-muted"
                }`}
                onClick={() =>
                  formData.characterType.includes(type)
                    ? handleRemoveTag("characterType", type)
                    : handleAddTag("characterType", type)
                }
              >
                {type}
              </Badge>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Rating</Label>
            <Select onValueChange={(v: string) => handleChange("rating", v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sfw">SFW</SelectItem>
                <SelectItem value="nsfw">NSFW</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Source</Label>
            <Select onValueChange={(v: string) => handleChange("source", v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {availableSources.map((src) => (
                  <SelectItem key={src} value={src}>
                    {src}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button type="submit" className="mt-4">
          Créer le personnage
        </Button>
      </form>
    </div>
  );
}
