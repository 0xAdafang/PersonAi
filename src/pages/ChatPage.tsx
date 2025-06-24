import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { Sidebar } from "../components/layout/Sidebar";
import { ChatBox } from "../components/chat/ChatBox"; 
import { RightSidebar } from "../components/layout/RightSidebar"; 
import type { Character } from "../types/types";

interface ChatPageProps {
  characters: Character[];
  onSelectCharacter?: (character: Character) => void;
}

export function ChatPage({ characters, onSelectCharacter }: ChatPageProps) {
  const { characterId } = useParams();
  const [character, setCharacter] = useState<Character | null>(null);

  useEffect(() => {
    const selected = characters.find((c) => c.id === characterId);
    if (selected) {
      setCharacter(selected);
      onSelectCharacter?.(selected);
    }
  }, [characterId, characters]);

  return (
    <div className="flex h-screen">
      <Sidebar
        characters={characters}
        selectedCharacter={character}
        onSelectCharacter={onSelectCharacter}
      />
      <main className="flex-1 flex flex-col">
        <ChatBox character={character} />
      </main>
      <RightSidebar character={character} />
    </div>
  );
}
