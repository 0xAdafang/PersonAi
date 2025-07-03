import { MessageSquare, UserPlus, Users, History, Sparkles, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";

type Character = {
  id: string;
  name: string;
  img?: string;
};

const Sidebar = () => {
  const navigate = useNavigate();
  const [characters, setCharacters] = useState<Character[]>([]);

  useEffect(() => {
    invoke<Character[]>("load_characters")
      .then((res) => setCharacters(res.slice(0, 3))) 
      .catch((err) => console.error("Failed to load characters", err));
  }, []);

  return (
    <aside className="w-64 h-screen bg-zinc-900 text-white p-4 flex flex-col gap-4">
      <button
        onClick={() => navigate("/")}
        className="flex items-center justify-center h-20"
      >
        <img src="/assets/Logo.png" alt="Logo" className="h-28" />
      </button>

      <nav className="flex flex-col gap-2 text-sm">
        <Section title="Characters">
          <SidebarLink icon={UserPlus} label="Create" onClick={() => navigate("/create-character")} />
          <SidebarLink icon={Users} label="Manage" onClick={() => navigate("/characters")} />
        </Section>

        <Section title="Chats">
          <SidebarLink icon={MessageSquare} label="New Chat" onClick={() => navigate("/chat")} />
          <SidebarLink icon={History} label="History" onClick={() => navigate("/chat-history")} />
        </Section>

        <Section title="Personas">
          <SidebarLink icon={User} label="Create" onClick={() => navigate("/create-persona")} />
          <SidebarLink icon={Users} label="Manage" onClick={() => navigate("/personas")} />
        </Section>

        <Section title="Tools">
          <SidebarLink icon={Sparkles} label="Prompt Wizard" />
        </Section>
      </nav>

      {characters.length > 0 && (
        <div className="mt-6">
          <h2 className="text-xs uppercase tracking-wide text-gray-400 mb-2">Active Characters</h2>
          <div className="flex flex-col gap-2">
            {characters.map((char) => (
              <button
                key={char.id}
                className="flex items-center gap-2 hover:bg-zinc-800 rounded px-2 py-1 text-left"
                onClick={() => navigate(`/chat/${char.id}`)}
              >
                <img
                  src={char.img || "/assets/characters/default.png"}
                  alt={char.name}
                  className="w-8 h-8 rounded object-cover"
                />
                <span>{char.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
};

const SidebarLink = ({ icon: Icon, label, onClick }: { icon: any; label: string; onClick?: () => void }) => (
  <button onClick={onClick} className="flex items-center gap-2 px-2 py-1 hover:bg-zinc-800 rounded text-left">
    <Icon size={16} />
    {label}
  </button>
);

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="mt-2">
    <div className="font-semibold text-gray-400">{title}</div>
    <div className="mt-1 flex flex-col gap-1">{children}</div>
  </div>
);

export default Sidebar;
