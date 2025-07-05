import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import Dashboard from "./pages/Dashboard";
import ChatHistoryPage from "./pages/ChatHistoryPage";
import CreateCharacter from "./pages/CreateCharacter";
import YourCharacters from "./pages/YourCharacters";
import EditCharacter from "./pages/EditCharacter";
import CreatePersona from "./pages/CreatePersona";
import YourPersonas from "./pages/YourPersonas";
import EditPersona from "./pages/EditPersona";
import ChatSetup from "./pages/ChatSetup";
import ChatPage from "./pages/ChatPage";





function App() {
  return (
    <Router>
      <div className="flex h-screen bg-catppuccin-base text-catppuccin-text">
        <Sidebar />
        <div className="flex flex-col flex-1 overflow-y-auto min-h-screen">
          <Header />
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/create-character" element={<CreateCharacter />} />
            <Route path="/characters" element={<YourCharacters />} />
            <Route path="/edit/:id" element={<EditCharacter />} />
            <Route path="/create-persona" element={<CreatePersona />} />
            <Route path="/personas" element={<YourPersonas />} />
            <Route path="/edit-persona/:id" element={<EditPersona />} />
            <Route path="/chat" element={<ChatSetup />} />
            <Route path="/chat/:characterId/:personaId" element={<ChatPage />} />
            <Route path="/chat-history" element={<ChatHistoryPage />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
