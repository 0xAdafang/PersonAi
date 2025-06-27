import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import Dashboard from "./pages/Dashboard";
import CreateCharacter from "./pages/CreateCharacter";
import YourCharacters from "./pages/YourCharacters";

// TODO: importer ces pages quand elles existeront
// import CreateCharacter from "./pages/CreateCharacter";
// import ChoosePersona from "./pages/ChoosePersona";
// import ChatPage from "./pages/ChatPage";

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
            {/* Routes futures */}
            {/*<Route path="/choose-persona" element={<ChoosePersona />} />
            <Route path="/chat" element={<ChatPage />} /> */}
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
