import React from "react";
import { FiCamera } from "react-icons/fi";
import { useDashboard } from "../../../context/DashboardContext";

const ActiveCamerasCard = () => {
  const { data } = useDashboard();
  const active = data?.stats?.activeCameras ?? "—";
  const total = data?.stats?.totalCameras ?? "—";

  return (
    <div className="card flex items-start gap-3">
      <div className="p-2 bg-green-900/30 rounded-lg">
        <FiCamera className="text-green-400" size={22} />
      </div>
      <div>
        <div className="text-sm text-gray-400">Active Cameras</div>
        <div className="text-3xl font-bold mt-1">{active}</div>
        <div className="text-sm text-gray-500">of {total} total</div>
      </div>
    </div>
  );
};

export default ActiveCamerasCard;
