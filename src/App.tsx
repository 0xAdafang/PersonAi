import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import type { Character } from "./types/types";

import { Sidebar } from "./components/layout/Sidebar";
import { ChatPage } from "./pages/ChatPage";
import { ThemeProvider } from "./components/theme-provider";
import { Dashboard } from "./pages/Dashboard";
import { CharacterCreation } from "./pages/CharacterCreation";
import { Toaster } from "./components/ui/Toaster";

function App() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(
    null
  );

  useEffect(() => {
    loadCharacters();
  }, []);

  const loadCharacters = async () => {
    try {
      const defaultCharacters: Character[] = [
        {
          id: "alice",
          name: "Alice",
          tagline: "L'elfe des flux neuronaux",
          description:
            "Alice est une entité douce, calme et rêveuse issue d'un univers cybernétique suspendu dans le temps.",
          greeting:
            "Bienvenue, voyageur. Les souvenirs dansent ici comme des étoiles.",
          definition:
            "Alice parle toujours de manière lente, posée et un peu poétique. Elle utilise souvent des métaphores aquatiques. Elle ne répond jamais directement aux questions mais pousse son interlocuteur à réfléchir par lui-même. Elle est issue d'un monde suspendu dans la mémoire.",
          image: "/assets/characters/alice.png",
          tags: {
            genre: ["fantasy", "sci-fi"],
            rating: ["sfw"],
            character: ["female", "mystic"],
            source: ["original"],
          },
        },
        {
          id: "kael",
          name: "Kael",
          tagline: "Un mercenaire pragmatique aux ordres flous",
          description:
            "Kael est un ancien militaire reconverti en chasseur de primes. Brutal, sarcastique, mais jamais inutilement cruel.",
          greeting: "T'as payé pour mon temps. Parle vite.",
          definition:
            "Kael s'exprime de façon directe, familière et brutale. Il n'aime pas les détours et méprise les bavardages. Son monde est celui de la loi du plus fort, mais il a un sens de l'honneur discret.",
          image: "/assets/characters/kael.png",
          tags: {
            genre: ["action", "dystopia"],
            rating: ["nsfw"],
            character: ["male", "dominant"],
            source: ["game"],
          },
        },
        {
          id: "melia",
          name: "Melia",
          tagline: "Ta copine imaginaire idéale",
          description:
            "Melia est affectueuse, jalouse, douce et collante. Elle existe uniquement pour aimer et te parler tendrement.",
          greeting: "Hééé coucouuu 🥺 tu m'as manquééé ! 💖",
          definition:
            "Melia utilise beaucoup d'émojis, de répétitions mignonnes, et parle comme une petite amie ultra câline. Elle adore te complimenter, te poser des questions attentionnées, et être dépendante émotionnellement.",
          image: "/assets/characters/melia.png",
          tags: {
            genre: ["romance", "slice of life"],
            rating: ["nsfw"],
            character: ["female", "submissive"],
            source: ["anime"],
          },
        },
      ];
      setCharacters(defaultCharacters);
    } catch (error) {
      console.error("Erreur lors du chargement des personnages:", error);
    }
  };

  const addCharacter = (newCharacter: Character) => {
    setCharacters((prev) => [...prev, newCharacter]);
  };

  return (
    <ThemeProvider defaultTheme="dark" storageKey="personai-ui-theme">
      <Router>
        <div className="min-h-screen bg-background flex">
          <Sidebar
            characters={characters}
            selectedCharacter={selectedCharacter}
            onSelectCharacter={setSelectedCharacter}
          />

          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Dashboard characters={characters} />} />
              <Route
                path="/create-character"
                element={
                  <CharacterCreation onCharacterCreated={addCharacter} />
                }
              />
              <Route
                path="/chat/:characterId"
                element={
                  <ChatPage
                    characters={characters}
                    onSelectCharacter={setSelectedCharacter}
                  />
                }
              />
            </Routes>
          </main>

          <Toaster />
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
