import { MessageSquare, UserPlus, Users, History, Sparkles, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";

type Character = {
  id: string;
  name: string;
  img?: string;
  lastUsed?: string; 
};

type RecentChat = {
  characterId: string;
  personaId: string;
  name: string;
  img?: string;
  lastUsed: number; 
};

const Sidebar = () => {
  const navigate = useNavigate();
  const [characters, setCharacters] = useState<Character[]>([]);
  const [recentChats, setRecentChats] = useState<RecentChat[]>([]);

  
  useEffect(() => {
    invoke<Character[]>("load_characters")
      .then((res) => {
        
        const sortedChars = res
          .filter(char => char.lastUsed) 
          .sort((a, b) => {
            const dateA = new Date(a.lastUsed || 0).getTime();
            const dateB = new Date(b.lastUsed || 0).getTime();
            return dateB - dateA;
          })
          .slice(0, 3);
        
        setCharacters(sortedChars);
      })
      .catch((err) => console.error("Failed to load characters", err));
  }, []);

  
  useEffect(() => {
   
    const loadRecentChats = async () => {
      try {
        const response = await fetch("http://localhost:5050/recent-chats");
        if (response.ok) {
          const data: RecentChat[] = await response.json();
          setRecentChats(data.slice(0, 5)); 
        }
      } catch (error) {
        console.error("Error with loading", error);
        
       
        try {
          const res = await invoke<RecentChat[]>("load_recent_chats");
          const sorted = res.sort((a, b) => b.lastUsed - a.lastUsed).slice(0, 5);
          setRecentChats(sorted);
        } catch (err) {
          console.error("Fallback failed:", err);
        }
      }
    };
    
    loadRecentChats();
  }, []);

  const handleCharacterClick = (characterId: string) => {
    
    navigate(`/chat/${characterId}`);
  };

  const handleRecentChatClick = (characterId: string, personaId: string) => {
    
    console.log(`Navigation towards: /chat/${characterId}/${personaId}`);
    navigate(`/chat/${characterId}/${personaId}`);
  };

  const formatLastUsed = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffHours < 1) return "À l'instant";
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    if (diffHours < 48) return "Hier";
    return date.toLocaleDateString();
  };

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

      {/* CORRECTION: Section des chats récents améliorée */}
      {recentChats.length > 0 && (
        <div className="mt-6">
          <h2 className="text-xs uppercase tracking-wide text-gray-400 mb-2">
            Recent Chats
          </h2>
          <div className="flex flex-col gap-2">
            {recentChats.map((chat, index) => (
              <button
                key={`${chat.characterId}_${chat.personaId}_${index}`}
                className="flex items-center gap-2 hover:bg-zinc-800 rounded px-2 py-1 text-left transition-colors"
                onClick={() => handleRecentChatClick(chat.characterId, chat.personaId)}
                title={`Dernier message: ${formatLastUsed(chat.lastUsed)}`}
              >
                <img
                  src={chat.img || "/assets/characters/default.png"}
                  alt={chat.name}
                  className="w-8 h-8 rounded object-cover border border-zinc-700"
                  onError={(e) => {
                    e.currentTarget.src = "/assets/characters/default.png";
                  }}
                />
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{chat.name}</div>
                  <div className="text-xs text-gray-400 truncate">
                    {formatLastUsed(chat.lastUsed)}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* CORRECTION: Section des personnages actifs améliorée */}
      {characters.length > 0 && (
        <div className="mt-6">
          <h2 className="text-xs uppercase tracking-wide text-gray-400 mb-2">
            Active Characters
          </h2>
          <div className="flex flex-col gap-2">
            {characters.map((char) => (
              <button
                key={char.id}
                className="flex items-center gap-2 hover:bg-zinc-800 rounded px-2 py-1 text-left transition-colors"
                onClick={() => handleCharacterClick(char.id)}
                title={`Dernière utilisation: ${char.lastUsed ? new Date(char.lastUsed).toLocaleString() : 'Jamais'}`}
              >
                <img
                  src={char.img || "/assets/characters/default.png"}
                  alt={char.name}
                  className="w-8 h-8 rounded object-cover border border-zinc-700"
                  onError={(e) => {
                    e.currentTarget.src = "/assets/characters/default.png";
                  }}
                />
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{char.name}</div>
                  {char.lastUsed && (
                    <div className="text-xs text-gray-400 truncate">
                      {new Date(char.lastUsed).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
};

const SidebarLink = ({ icon: Icon, label, onClick }: { icon: any; label: string; onClick?: () => void }) => (
  <button onClick={onClick} className="flex items-center gap-2 px-2 py-1 hover:bg-zinc-800 rounded text-left transition-colors">
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