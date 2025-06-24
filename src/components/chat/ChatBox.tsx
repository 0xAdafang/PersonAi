import React, { useEffect, useRef, useState } from "react";
import type { Character } from "../../types/types";


import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Send } from "lucide-react";

interface Message {
  sender: "user" | "bot";
  content: string;
}

interface ChatBoxProps {
  character: Character | null;
}

export function ChatBox({ character }: ChatBoxProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messageEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSend = async () => {
    if (!character || !input.trim()) return;

    const userMessage = input.trim();

    setMessages(prev => [...prev, { sender: "user", content: userMessage }]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:8080/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: userMessage,
          character_id: character.id,
          user_id: "user-local", // à améliorer plus tard
          style: "default",
          model: "pygmalion",
          user_persona: "default",
        }),
      });

      const data = await response.json();
      setMessages(prev => [...prev, { sender: "bot", content: data.answer }]);
    } catch {
      setMessages(prev => [
        ...prev,
        { sender: "bot", content: "⚠️ Erreur de connexion à l'IA." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full p-4">
      <div className="flex-1 overflow-y-auto space-y-4 pr-2">
        {character ? (
          messages.map((msg, i) => (
            <div
              key={i}
              className={`max-w-[80%] p-3 rounded-lg text-sm whitespace-pre-line ${
                msg.sender === "user"
                  ? "ml-auto bg-primary text-primary-foreground"
                  : "mr-auto bg-muted text-muted-foreground"
              }`}
            >
              {msg.content}
            </div>
          ))
        ) : (
          <p className="text-muted-foreground">Sélectionnez un personnage pour commencer.</p>
        )}
        <div ref={messageEndRef} />
      </div>

      <div className="mt-4 flex items-center gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder={
            character ? `Parlez avec ${character.name}...` : "Choisissez un personnage d'abord"
          }
          disabled={!character || isLoading}
        />
        <Button onClick={handleSend} disabled={!character || isLoading || input.trim() === ""}>
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
