import { FiVideo } from "react-icons/fi";
import { useAnalytics } from "../../../context/AnalyticsContext";

const ActiveCamerasCard = () => {
  const { data } = useAnalytics();
  return (
    <div className="card flex items-center gap-3">
      <FiVideo className="text-blue-400" size={22} />
      <div>
        <div className="text-sm text-gray-400">Active Cameras</div>
        <div className="text-2xl font-bold">{data.summary?.activeCameras ?? "0/0"}</div>
      </div>
    </div>
  );
};
export default ActiveCamerasCard;
