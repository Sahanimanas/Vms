import Sidebar from "../Sidebar";
import Topbar from "../Topbar";

const AnalyticsLayout = ({ children }) => (
  <div className="flex h-screen bg-slate-900 text-gray-100">
    <Sidebar />
    <div className="flex-1 flex flex-col">
      <Topbar />
      <main className="p-6 overflow-auto">{children}</main>
    </div>
  </div>
);
export default AnalyticsLayout;
