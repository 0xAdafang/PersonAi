import { invoke } from "@tauri-apps/api/core";
import CardButton from "../components/CardButton";

const Dashboard = () => {
  return (
    <main className="p-8 flex flex-col items-center gap-6">
      <CardButton
        description="Design your own AI companion"
        image="/assets/1.png"
        to="/create-character"
      />
      <CardButton
        description="Define who you are in the story"
        image="/assets/4.png"
        to="/create-persona"
      />

      <CardButton
        description="Begin a conversation now"
        image="/assets/2.png"
        to="/chat"
      />
    </main>
  );
};

export default Dashboard;
