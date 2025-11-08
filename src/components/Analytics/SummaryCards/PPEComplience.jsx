import { FiShield } from "react-icons/fi";
import { useAnalytics } from "../../../context/AnalyticsContext";

const PPEComplianceCard = () => {
  const { data } = useAnalytics();
  return (
    <div className="card flex items-center gap-3">
      <FiShield className="text-green-400" size={22} />
      <div>
        <div className="text-sm text-gray-400">PPE Compliance</div>
        <div className="text-2xl font-bold">{data.summary?.ppeCompliance ?? 0}%</div>
      </div>
    </div>
  );
};
export default PPEComplianceCard;
