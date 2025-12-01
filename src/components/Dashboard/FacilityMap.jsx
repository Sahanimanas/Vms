import React from "react";
import imageSrc from '../../assets/site-map.webp';
const cameraLocations = [
  { id: "CAM-01", x: 20, y: 30, status: "normal" },
  { id: "CAM-02", x: 45, y: 55, status: "warning" },
  { id: "CAM-03", x: 70, y: 40, status: "critical" },
  { id: "CAM-04", x: 85, y: 20, status: "normal" },
];

const statusColors = {
  normal: "bg-green-500",
  warning: "bg-yellow-500",
  critical: "bg-red-500",
};

const FacilityMap = () => (
  <div className="card">
    <div className="text-sm text-gray-400 mb-2">Facility Map</div>

    {/* MAP WRAPPER */}
    <div className="relative w-full h-48 bg-gray-800 rounded-md overflow-hidden">

      {/* Background Map */}
      <img
        src={imageSrc}   // <-- put your image here
        alt="Facility Map"
        className="w-full h-full object-cover opacity-90"
      />

      {/* Camera Markers */}
      {cameraLocations.map((cam) => (
        <div
          key={cam.id}
          className={`absolute w-3 h-3 rounded-full border border-white shadow ${statusColors[cam.status]}`}
          style={{
            left: `${cam.x}%`,
            top: `${cam.y}%`,
            transform: "translate(-50%, -50%)",
          }}
          title={cam.id}
        />
      ))}
    </div>

    {/* FOOTER STATS */}
    <div className="text-xs text-gray-400 mt-2">
      Normal 89 cameras · Warning 35 cameras · Critical 3 cameras
    </div>
  </div>
);

export default FacilityMap;
