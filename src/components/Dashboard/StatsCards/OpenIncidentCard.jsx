import React from "react";
import { FiAlertTriangle } from "react-icons/fi";
import { useDashboard } from "../../../context/DashboardContext";

const OpenIncidentsCard = () => {
  const { data } = useDashboard();
  const incidents = data?.stats?.openIncidents ?? "—";

  return (
    <div className="card flex items-start gap-3">
      <div className="p-2 bg-red-900/30 rounded-lg">
        <FiAlertTriangle className="text-red-400" size={22} />
      </div>
      <div>
        <div className="text-sm text-gray-400">Open Incidents</div>
        <div className="text-3xl font-bold mt-1">{incidents}</div>
        <div className="text-sm text-gray-500">critical: 2</div>
      </div>
    </div>
  );
};

export default OpenIncidentsCard;
