import React from "react";
import { Link, useLocation } from "react-router-dom";
import type { Character } from "../../types/types";
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";
import { Button } from "../ui/button";
import { Plus, Home, Bot } from "lucide-react";

interface SidebarProps {
  characters: Character[];
  selectedCharacter: Character | null;
  onSelectCharacter?: (char: Character) => void;
}

export function Sidebar({
  characters,
  selectedCharacter,
  onSelectCharacter,
}: SidebarProps) {
  const location = useLocation();

  return (
    <aside className="w-64 bg-card text-card-foreground border-r h-screen p-4 flex flex-col space-y-4">
      {/* Top: titre */}
      <div className="mb-6">
        <h2 className="text-xl font-bold tracking-tight">Story-chan</h2>
        <p className="text-sm text-muted-foreground">
          Your character playground
        </p>
      </div>

      {/* Dashboard + création */}
      <nav className="flex flex-col gap-2">
        <Button variant={location.pathname === "/" ? "secondary" : "ghost"}>
          <Link to="/" className="flex items-center">
            <Home className="w-4 h-4 mr-2" />
            Dashboard
          </Link>
        </Button>

        <Link to="/create-character">
          <Button
            variant={
              location.pathname === "/create-character"
                ? "secondary"
                : "outline"
            }
          >
            <Plus className="w-4 h-4 mr-2" />
            New character
          </Button>
        </Link>
      </nav>

      {/* Liste des personnages */}
      <div className="mt-6">
        <h4 className="text-sm font-semibold mb-2 text-muted-foreground">
          Characters
        </h4>
        <div className="space-y-2 overflow-y-auto max-h-[calc(100vh-280px)] pr-1">
          {characters.map((char) => (
            <Link
              key={char.id}
              to={`/chat/${char.id}`}
              onClick={() => onSelectCharacter?.(char)}
              className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors 
                ${
                  selectedCharacter?.id === char.id
                    ? "bg-muted"
                    : "hover:bg-muted/50"
                }
              `}
            >
              <Avatar className="w-8 h-8">
                <AvatarImage src={char.image} />
                <AvatarFallback>{char.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <span className="truncate text-sm">{char.name}</span>
            </Link>
          ))}
          {characters.length === 0 && (
            <div className="text-muted-foreground text-sm flex items-center gap-2 px-3 py-2">
              <Bot className="w-4 h-4" /> No characters
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
