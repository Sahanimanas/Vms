import Sidebar from "../Sidebar";

const PlaybackLayout = ({ children }) => (
  <div className="flex text-white h-screen">
    {/* Sidebar */}
    <Sidebar />

    {/* Right section */}
    <div className="flex-1 flex flex-col">

      {/* Topbar */}
      <header className="flex items-center justify-between p-4 border-b border-gray-800 bg-gray-900">
        <div className="text-lg font-semibold">Video Playback & Search</div>

        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-400 flex items-center gap-2">
            Recording Active
            <span className="inline-block w-2 h-2 bg-green-600 rounded-full"></span>
          </div>

          <button className="px-3 py-1 rounded-lg bg-gray-800 text-amber-400 border border-gray-700">
            Export Clip
          </button>
        </div>
      </header>

      {/* Page Content */}
      <main className="p-6 bg-slate-900 overflow-auto">
        {children}
      </main>
    </div>
  </div>
);

export default PlaybackLayout;
