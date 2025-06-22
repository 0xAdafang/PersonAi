import { useEffect, useState } from "react";
import { readTextFile, writeFile, create, exists } from "@tauri-apps/plugin-fs";
import { join, appDataDir } from "@tauri-apps/api/path";

export default function ChatPage() {
    const [character, setCharacter] = useState<any>(null);
    const [persona, setPersona] = useState<any>(null);
    const [message, setMessage] = useState("");
    const [history, setHistory] = useState<{sender : string; content: string}[]>([]);

    useEffect(() => {

        loadJson("characters/alys.json", setCharacter);
        loadJson("personas/player.json", setPersona);
    }, []);

    const loadJson = async (relPath: string, setter: Function) => {
    const fullPath = await join(await appDataDir(), relPath);
    const fileExists = await exists(fullPath);
    if (!fileExists) return alert(`File not found: ${relPath}`);
    const content = await readTextFile(fullPath);
    setter(JSON.parse(content));
    };

    const sendMessage = async () => {
        const res = await fetch("http://localhost:8080/ask", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                character_id: character?.name ?? "unknown",
                user_persona: persona,
                message
            })
        });

        const data = await res.json();
        const reply = { sender: character?.name ?? "AI", content: data.response };
        setHistory(h => [...h, reply]);
        setMessage("");
    };


return (
    <div className="p-6 max-w-3xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">💬 Chat with {character?.name ?? "AI"}</h1>

      <div className="bg-surface-100 rounded-xl p-4 h-96 overflow-y-scroll">
        {history.map((msg, i) => (
          <div key={i} className={`mb-2 ${msg.sender === "you" ? "text-right" : "text-left"}`}>
            <strong>{msg.sender === "you" ? "You" : msg.sender}</strong>: {msg.content}
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          value={message}
          onChange={e => setMessage(e.target.value)}
          className="input w-full"
          placeholder="Say something..."
        />
        <button onClick={sendMessage} className="btn btn-primary">Send</button>
      </div>
    </div>
  );
}