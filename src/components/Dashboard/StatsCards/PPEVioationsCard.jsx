import React from "react";
import { FiAlertOctagon } from "react-icons/fi";
import { useDashboard } from "../../../context/DashboardContext";

const PPEViolationsCard = () => {
  const { data } = useDashboard();
  const v = data?.stats?.ppeViolationsToday ?? "—";

  return (
    <div className="card flex items-start gap-3">
      <div className="p-2 bg-yellow-900/30 rounded-lg">
        <FiAlertOctagon className="text-yellow-400" size={22} />
      </div>
      <div>
        <div className="text-sm text-gray-400">PPE Violations Today</div>
        <div className="text-3xl font-bold mt-1">{v}</div>
        <div className="text-sm text-gray-500">+3 from yesterday</div>
      </div>
    </div>
  );
};

export default PPEViolationsCard;
