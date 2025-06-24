import React, { useState } from "react";
import type { Character } from "../../types/types";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectItem, SelectContent, SelectTrigger, SelectValue } from "../ui/select";
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";
import { Trash2 } from "lucide-react";

interface RightSidebarProps {
  character: Character | null;
}

export function RightSidebar({ character }: RightSidebarProps) {
  const [model, setModel] = useState("pygmalion");
  const [persona, setPersona] = useState("default");

  const handleResetMemory = async () => {
    if (!character) return;

    try {
      const res = await fetch("http://localhost:8080/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: "user-local",
          character_id: character.id,
        }),
      });

      if (res.ok) {
        alert("Mémoire réinitialisée.");
      }
    } catch {
       alert("Erreur lors du reset de mémoire.");
    }
  };

  if (!character) return null;

  return (
    <aside className="w-72 bg-muted p-4 border-l space-y-4">
      <div className="text-sm text-muted-foreground">Options IA</div>

      <div className="flex items-center gap-3">
        <Avatar className="w-10 h-10">
          <AvatarImage src={character.image} />
          <AvatarFallback>{character.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div>
          <h3 className="font-bold">{character.name}</h3>
          <p className="text-xs text-muted-foreground truncate max-w-[140px]">{character.tagline}</p>
        </div>
      </div>

      <div>
        <Label>Modèle IA</Label>
        <Select value={model} onValueChange={(v) => setModel(v)}>
        <SelectTrigger>
          <SelectValue placeholder="Choisir un modèle" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="pygmalion">Pygmalion</SelectItem>
          <SelectItem value="mythomax">MythoMax</SelectItem>
          <SelectItem value="nous-hermes">Nous Hermes</SelectItem>
          <SelectItem value="mistral">Mistral</SelectItem>
        </SelectContent>
      </Select>
      </div>

      <div>
        <Label>User persona</Label>
        <Input
          placeholder="Ex: explorateur timide"
          value={persona}
          onChange={(e) => setPersona(e.target.value)}
        />
      </div>

      <Button
        variant="outline"
        onClick={handleResetMemory}
        className="w-full flex items-center justify-center gap-2"
      >
        <Trash2 className="w-4 h-4" />
        Réinitialiser la mémoire
      </Button>

      <div className="text-xs text-muted-foreground pt-4 border-t">
        Ce panneau permet de changer le modèle IA utilisé, de définir votre persona et de vider l'historique de conversation.
      </div>
    </aside>
  );
}
