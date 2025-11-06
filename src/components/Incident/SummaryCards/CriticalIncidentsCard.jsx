import { FiAlertOctagon } from "react-icons/fi";
import { useIncidents } from "../../../context/IncidentContext";

const CriticalIncidentsCard = () => {
  const { data } = useIncidents();
  return (
    <div className="card flex items-center gap-3">
      <FiAlertOctagon className="text-red-500" size={22} />
      <div>
        <div className="text-sm text-gray-400">Critical Incidents</div>
        <div className="text-2xl font-bold">{data.summary?.critical ?? 0}</div>
        <p className="text-xs text-gray-500">Requires immediate action</p>
      </div>
    </div>
  );
};
export default CriticalIncidentsCard;
