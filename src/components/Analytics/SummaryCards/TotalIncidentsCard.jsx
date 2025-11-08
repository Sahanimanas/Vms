import { FiAlertTriangle } from "react-icons/fi";
import { useAnalytics } from "../../../context/AnalyticsContext";

const TotalIncidentsCard = () => {
  const { data } = useAnalytics();
  return (
    <div className="card flex items-center gap-3">
      <FiAlertTriangle className="text-red-400" size={22} />
      <div>
        <div className="text-sm text-gray-400">Total Incidents</div>
        <div className="text-2xl font-bold">{data.summary?.total ?? 0}</div>
      </div>
    </div>
  );
};
export default TotalIncidentsCard;
