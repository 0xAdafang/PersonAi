// src/components/DashboardInfo.tsx
const DashboardInfo = () => (
  <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-catppuccin-subtext1">
    <div className="bg-catppuccin-surface1 p-4 rounded-lg shadow">
      <strong className="text-catppuccin-text">Last character used:</strong> Riven the Dark
    </div>
    <div className="bg-catppuccin-surface1 p-4 rounded-lg shadow">
      <strong className="text-catppuccin-text">Active persona:</strong> Wanderer
    </div>
    <div className="bg-catppuccin-surface1 p-4 rounded-lg shadow">
      <strong className="text-catppuccin-text">Recent chats:</strong> 3 available to resume
    </div>
    <div className="bg-catppuccin-surface1 p-4 rounded-lg shadow">
      <strong className="text-catppuccin-text">Model loaded:</strong> mythomax-l2-13b
    </div>
  </div>
);

export default DashboardInfo;
