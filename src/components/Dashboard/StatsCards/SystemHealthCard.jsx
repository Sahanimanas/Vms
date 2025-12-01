import React from "react";
import { FiHeart } from "react-icons/fi";
import { useDashboard } from "../../../context/DashboardContext";

const SystemHealthCard = () => {
  const { data } = useDashboard();
  const pct = data?.stats?.systemHealthPercent ?? "--";

  return (
    <div className="card flex items-start gap-3">
      <div className="p-2 bg-green-900/30 rounded-lg">
        <FiHeart className="text-green-400" size={22} />
      </div>
      <div>
        <div className="text-sm text-gray-400">System Health</div>
        <div className="text-3xl font-bold mt-1">{pct}%</div>
        <div className="text-sm text-gray-500">Excellent</div>
      </div>
    </div>
  );
};

export default SystemHealthCard;
