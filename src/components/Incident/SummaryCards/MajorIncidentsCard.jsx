import { FiAlertTriangle } from "react-icons/fi";
import { useIncidents } from "../../../context/IncidentContext";

const MajorIncidentsCard = () => {
  const { data } = useIncidents();
  return (
    <div className="card flex items-center gap-3">
      <FiAlertTriangle className="text-yellow-400" size={22} />
      <div>
        <div className="text-sm text-gray-400">Major Incidents</div>
        <div className="text-2xl font-bold">{data.summary?.major ?? 0}</div>
        <p className="text-xs text-gray-500">Under investigation</p>
      </div>
    </div>
  );
};
export default MajorIncidentsCard;
