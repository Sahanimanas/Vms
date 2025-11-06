import Sidebar from "../Sidebar";
import Topbar from "../Topbar";

const IncidentLayout = ({ children }) => (
  <div className="flex text-white h-screen">
    <Sidebar />
    <div className="flex-1 flex flex-col">
      <header className="flex items-center justify-between p-4 border-b bordergray-800 bg-gray-900">
<div className="text-lg font-semibold">Incident Management</div>
<div className="flex items-center gap-4">
<div className="text-sm text-gray-400">System Online <div className='inline-block w-2 h-2 text-amber-100 bg-green-600 rounded-full'></div></div>
<button className="px-3 py-1 rounded-lg text-red-400 bg-gray-800">Alerts</button>
</div>
</header>
      <main className="p-6 bg-slate-900 overflow-auto">{children}</main>
    </div>
  </div>
);

export default IncidentLayout;
