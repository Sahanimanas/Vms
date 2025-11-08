import { FiDatabase, FiActivity, FiHardDrive } from "react-icons/fi";
import { useAnalytics } from "../../context/AnalyticsContext";

const SystemHealthOverview = () => {
  const { data } = useAnalytics();
  const sys = data.system;
  return (
    <div className="card grid grid-cols-3 text-center">
      <div>
        <FiActivity className="mx-auto text-green-400" size={22} />
        <div className="text-lg font-bold">{sys?.uptime ?? "99.2%"}</div>
        <p className="text-xs text-gray-400">System Uptime</p>
      </div>
      <div>
        <FiDatabase className="mx-auto text-blue-400" size={22} />
        <div className="text-lg font-bold">{sys?.storage ?? "2.1TB"}</div>
        <p className="text-xs text-gray-400">Storage Used</p>
      </div>
      <div>
        <FiHardDrive className="mx-auto text-yellow-400" size={22} />
        <div className="text-lg font-bold">{sys?.cpu ?? "94%"}</div>
        <p className="text-xs text-gray-400">CPU Efficiency</p>
      </div>
    </div>
  );
};
export default SystemHealthOverview;
