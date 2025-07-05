import {
  RefreshCw,
  Download,
  Settings,
  UserCircle,
} from "lucide-react";

const Header = () => {
  return (
    <header className="h-20 flex items-center justify-between px-6 bg-zinc-950 text-white border-b border-zinc-800">
      <div className="text-lg font-medium">Let's make a new story..</div>
    </header>
  );
};

const IconButton = ({ icon, tooltip }: { icon: React.ReactNode; tooltip: string }) => (
  <button
    className="text-gray-400 hover:text-white transition relative group"
    aria-label={tooltip}
  >
    {icon}
    <span className="absolute bottom-[-1.8rem] left-1/2 -translate-x-1/2 text-xs text-gray-300 opacity-0 group-hover:opacity-100 transition pointer-events-none">
      {tooltip}
    </span>
  </button>
);

export default Header;
