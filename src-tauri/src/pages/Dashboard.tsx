import { Card } from "../components/Card";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card onClick={() => navigate('/character')}>
        <h2 className="text-xl font-bold mb-2">🎭 Créer un personnage</h2>
        <p>Définis le nom, le rôle, l’image et la personnalité du personnage IA.</p>
      </Card>

      <Card onClick={() => navigate('/persona')}>
        <h2 className="text-xl font-bold mb-2">🧠 Créer un user persona</h2>
        <p>Décris ton rôle en tant que joueur : nom, comportement, préférences.</p>
      </Card>

      <Card onClick={() => navigate('/chat')}>
        <h2 className="text-xl font-bold mb-2">💬 Reprendre une discussion</h2>
        <p>Continue ta dernière conversation ou sélectionne un personnage.</p>
      </Card>
    </div>
  );
}
