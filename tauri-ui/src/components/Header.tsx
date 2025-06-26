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

      <nav className="flex items-center gap-6">
        <IconButton icon={<RefreshCw size={20} />} tooltip="Reset chat" />
        <IconButton icon={<Download size={20} />} tooltip="Export data" />
        <IconButton icon={<Settings size={20} />} tooltip="Settings" />

        <button className="w-9 h-9 rounded-full overflow-hidden ring-2 ring-catppuccin-mauve hover:ring-4 transition">
          <img
            src="/assets/avatar.jpg"
            alt="Profile"
            className="w-full h-full object-cover"
          />
        </button>
      </nav>
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
