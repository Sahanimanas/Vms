import { FiCheckCircle } from "react-icons/fi";
import { useIncidents } from "../../../context/IncidentContext";

const ResolvedTodayCard = () => {
  const { data } = useIncidents();
  return (
    <div className="card flex items-center gap-3">
      <FiCheckCircle className="text-green-500" size={22} />
      <div>
        <div className="text-sm text-gray-400">Resolved Today</div>
        <div className="text-2xl font-bold">{data.summary?.resolved ?? 0}</div>
        <p className="text-xs text-gray-500">Avg: 2.3 hrs</p>
      </div>
    </div>
  );
};
export default ResolvedTodayCard;
