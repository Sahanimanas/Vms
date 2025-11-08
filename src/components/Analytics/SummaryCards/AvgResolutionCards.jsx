import { FiClock } from "react-icons/fi";
import { useAnalytics } from "../../../context/AnalyticsContext";

const AvgResolutionCard = () => {
  const { data } = useAnalytics();
  return (
    <div className="card flex items-center gap-3">
      <FiClock className="text-yellow-400" size={22} />
      <div>
        <div className="text-sm text-gray-400">Avg Resolution Time</div>
        <div className="text-2xl font-bold">{data.summary?.avgResolution ?? "0h"}</div>
      </div>
    </div>
  );
};
export default AvgResolutionCard;
