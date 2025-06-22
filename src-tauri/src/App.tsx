import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import CharacterPage from './pages/CharacterPage';
import UserPersonaPage from './pages/UserPersonaPage';
import ChatPage from './pages/ChatPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        {/* Les autres routes à venir */}
        <Route path="/character" element={<CharacterPage />} />
        <Route path="/persona" element={<UserPersonaPage />} />
        <Route path="/chat" element={<ChatPage />} />
      </Routes>
    </BrowserRouter>
  );
}
