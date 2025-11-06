import { FiAlertCircle } from "react-icons/fi";
import { useIncidents } from "../../../context/IncidentContext";

const MinorIncidentsCard = () => {
  const { data } = useIncidents();
  return (
    <div className="card flex items-center gap-3">
      <FiAlertCircle className="text-blue-400" size={22} />
      <div>
        <div className="text-sm text-gray-400">Minor Incidents</div>
        <div className="text-2xl font-bold">{data.summary?.minor ?? 0}</div>
        <p className="text-xs text-gray-500">Routine follow-up</p>
      </div>
    </div>
  );
};
export default MinorIncidentsCard;
