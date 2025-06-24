import React from "react";
import type { Character } from "../types/types";

interface DashboardProps {
  characters: Character[];
}

export function Dashboard({ characters }: DashboardProps) {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <p>Nombre de personnages : {characters.length}</p>
    </div>
  );
}
