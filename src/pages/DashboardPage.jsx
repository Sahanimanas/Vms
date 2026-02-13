import { FiCamera, FiAlertTriangle, FiActivity, FiPlay, FiSquare, FiRefreshCw, FiPlus } from "react-icons/fi";
import { useDashboard } from "../context/DashboardContext";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import Sidebar from "../components/Sidebar";
import { getStreamUrl } from "../api/cameraApi";
import AddCameraButton from "../components/Dashboard/AddCameraButton";

export default function Dashboard() {
  const { data, loading, startCamera, stopCamera, refresh } = useDashboard();
  const navigate = useNavigate();
  const [actionLoading, setActionLoading] = useState({});

  const handleStartCamera = async (cameraId) => {
    setActionLoading({ ...actionLoading, [cameraId]: "starting" });
    const result = await startCamera(cameraId);
    if (!result.success) {
      alert(`Failed to start camera: ${result.error}`);
    }
    setActionLoading({ ...actionLoading, [cameraId]: null });
  };

  const handleStopCamera = async (cameraId) => {
    
    setActionLoading({ ...actionLoading, [cameraId]: "stopping" });
    const result = await stopCamera(cameraId);
    if (!result.success) {
      alert(`Failed to stop camera: ${result.error}`);
    }
    setActionLoading({ ...actionLoading, [cameraId]: null });
  };

  if (loading && !data.stats) {
    return (
      <div className="flex h-screen bg-gray-900">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            <p className="text-gray-400 mt-4">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  const stats = data.stats || {
    activeCameras: 0,
    totalCameras: 0,
    inactiveCameras: 0,
    openIncidents: 0,
    ppeViolationsToday: 0,
    systemHealthPercent: 0,
    systemHealthPercent: 0,
  };

  return (
    <div className="flex h-screen bg-gray-900">
      {/* Left Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Center Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-white mb-2">Control Dashboard</h1>
            <p className="text-gray-400">Monitor cameras, incidents, and PPE compliance in real-time</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Active Cameras */}
            <div className="card">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-500/20 rounded-lg">
                  <FiCamera size={24} className="text-green-500" />
                </div>
                <div>
                  <div className="text-gray-400 text-sm">Active Cameras</div>
                  <div className="text-2xl font-bold text-white">{stats.activeCameras}</div>
                  <div className="text-xs text-gray-500">of {stats.totalCameras} total</div>
                </div>
              </div>
            </div>

            {/* Open Incidents */}
            <div className="card">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-red-500/20 rounded-lg">
                  <FiAlertTriangle size={24} className="text-red-500" />
                </div>
                <div>
                  <div className="text-gray-400 text-sm">Open Incidents</div>
                  <div className="text-2xl font-bold text-white">{stats.openIncidents}</div>
                  <div className="text-xs text-gray-500">critical: 2</div>
                </div>
              </div>
            </div>

            {/* PPE Violations Today - CLICKABLE */}
            <div 
              className="card cursor-pointer hover:bg-gray-800/80 transition-colors"
              onClick={() => navigate("/ppe-violations")}
            >
              <div className="flex items-center gap-3">
                <div className="p-3 bg-yellow-500/20 rounded-lg">
                  <FiAlertTriangle size={24} className="text-yellow-500" />
                </div>
                <div>
                  <div className="text-gray-400 text-sm">PPE Violations Today</div>
                  <div className="text-2xl font-bold text-white">{stats.ppeViolationsToday}</div>
                  <div className="text-xs text-blue-400">Click to view details →</div>
                </div>
              </div>
            </div>

            {/* System Health */}
            <div className="card">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-500/20 rounded-lg">
                  <FiActivity size={24} className="text-blue-500" />
                </div>
                <div>
                  <div className="text-gray-400 text-sm">System Health</div>
                  <div className="text-2xl font-bold text-white">{stats.systemHealthPercent}%</div>
                  <div className="text-xs text-gray-500">All systems operational</div>
                </div>
              </div>
            </div>
          </div>

          {/* Live Camera Feeds */}
          <div className="card mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Live Camera Feeds</h2>
              <div className="flex gap-4 text-sm">
                <span className="text-green-400">Active: {stats.activeCameras}</span>
                <span className="text-red-400">Inactive: {stats.inactiveCameras}</span>
                <span className="text-gray-400">Total: {stats.totalCameras}</span>
              </div>
            </div>

            {data.cameras.length === 0 ? (
              <div className="text-center py-12">
                <FiCamera size={48} className="mx-auto text-gray-600 mb-4" />
                <p className="text-gray-400 mb-4">No cameras configured</p>
                <AddCameraButton />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {data.cameras.map((camera) => (
                  <div
                    key={camera.id}
                    className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700"
                  >
                    {/* Camera Header */}
                    <div className="p-3 flex items-center justify-between bg-gray-800/50">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            camera.status === "online" ? "bg-green-500" : "bg-red-500"
                          }`}
                        />
                        <span className="text-white font-medium text-sm">{camera.name}</span>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded ${
                        camera.status === "online" 
                          ? "bg-green-500/20 text-green-400" 
                          : "bg-red-500/20 text-red-400"
                      }`}>
                        {camera.status}
                      </span>
                    </div>

                    {/* Video Stream or Offline Placeholder */}
                    {camera.status === "online" ? (
                      <div className="relative bg-black" style={{ aspectRatio: "16/9" }}>
                        <img
                          src={getStreamUrl(camera.id)}
                          alt={camera.name}
                          className="w-full h-full object-cover"
                        />
                        {/* Overlay Info */}
                        <div className="absolute bottom-2 left-2 right-2 flex justify-between items-end">
                          {camera.location && (
                            <span className="text-xs bg-black/60 text-white px-2 py-1 rounded">
                              📍 {camera.location}
                            </span>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div 
                        className="bg-gray-900/50 flex flex-col items-center justify-center text-gray-500"
                        style={{ aspectRatio: "16/9" }}
                      >
                        <FiCamera size={32} className="mb-2 opacity-50" />
                        <p className="text-sm">Camera Offline</p>
                      </div>
                    )}

                    {/* Camera Info & Controls */}
                    <div className="p-3 space-y-2">
                      <div className="flex items-center justify-between text-xs text-gray-400">
                        <span>Detections: {camera.total_detections}</span>
                        {camera.lastSeen && (
                          <span>{new Date(camera.lastSeen).toLocaleTimeString()}</span>
                        )}
                      </div>
                      
                      <div className="flex gap-2">
                        {camera.status === "online" ? (
                          <button
                            onClick={() => handleStopCamera(camera.id)}
                            disabled={actionLoading[camera.id] === "stopping"}
                            className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded text-sm transition-colors disabled:opacity-50"
                          >
                            <FiSquare size={14} />
                            {actionLoading[camera.id] === "stopping" ? "Stopping..." : "Stop"}
                          </button>
                        ) : (
                          <button
                            onClick={() => handleStartCamera(camera.id)}
                            disabled={actionLoading[camera.id] === "starting"}
                            className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded text-sm transition-colors disabled:opacity-50"
                          >
                            <FiPlay size={14} />
                            {actionLoading[camera.id] === "starting" ? "Starting..." : "Start"}
                          </button>
                        )}
                        <button
                          onClick={() => navigate("/playback")}
                          className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm transition-colors"
                        >
                          View
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => navigate("/ppe-violations")}
              className="card hover:bg-gray-800/80 transition-colors cursor-pointer text-center"
            >
              <FiAlertTriangle size={32} className="mx-auto text-yellow-500 mb-2" />
              <h3 className="text-white font-medium mb-1">View Violations</h3>
              <p className="text-gray-400 text-sm">Review PPE compliance violations</p>
            </button>

            <button
              onClick={() => navigate("/playback")}
              className="card hover:bg-gray-800/80 transition-colors cursor-pointer text-center"
            >
              <FiCamera size={32} className="mx-auto text-blue-500 mb-2" />
              <h3 className="text-white font-medium mb-1">Live Feeds</h3>
              <p className="text-gray-400 text-sm">Monitor camera feeds in real-time</p>
            </button>

            <button
              onClick={() => navigate("/settings")}
              className="card hover:bg-gray-800/80 transition-colors cursor-pointer text-center"
            >
              <FiActivity size={32} className="mx-auto text-green-500 mb-2" />
              <h3 className="text-white font-medium mb-1">Settings</h3>
              <p className="text-gray-400 text-sm">Configure cameras and system</p>
            </button>
          </div>
        </div>

        {/* Right Sidebar - Camera Controls */}
        <div className="w-80 flex-shrink-0 border-l border-gray-800 p-4 overflow-y-auto">
          <div className="sticky top-0">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">Camera Controls</h3>
              <button
                onClick={refresh}
                className="p-2 hover:bg-gray-700 rounded transition-colors"
                title="Refresh"
              >
                <FiRefreshCw size={16} className="text-gray-400" />
              </button>
            </div>

            {/* Add Camera Button */}
          

            {/* Camera List */}
            <div className="space-y-2">
                <AddCameraButton onCameraAdded={refresh} />
              {data.cameras.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FiCamera size={32} className="mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No cameras configured</p>
                  <p className="text-xs mt-1">Click "Add Camera" to get started</p>
                </div>
              ) : (
                <>
                  {data.cameras.map((camera) => (
                    <div
                      key={camera.id}
                      className="bg-gray-800 rounded-lg p-3 border border-gray-700"
                    >
                      {/* Camera Header */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              camera.status === "online" ? "bg-green-500" : "bg-red-500"
                            }`}
                          />
                          <span className="text-white text-sm font-medium truncate">
                            {camera.name}
                          </span>
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded ${
                          camera.status === "online" 
                            ? "bg-green-500/20 text-green-400" 
                            : "bg-red-500/20 text-red-400"
                        }`}>
                          {camera.status}
                        </span>
                      </div>

                      {/* Camera Info */}
                      {camera.location && (
                        <div className="text-xs text-gray-400 mb-2">
                          📍 {camera.location}
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex gap-1">
                        {camera.status === "online" ? (
                          <button
                            onClick={() => handleStopCamera(camera.id)}
                            disabled={actionLoading[camera.id] === "stopping"}
                            className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded text-xs transition-colors disabled:opacity-50"
                          >
                            <FiSquare size={12} />
                            {actionLoading[camera.id] === "stopping" ? "..." : "Stop"}
                          </button>
                        ) : (
                          <button
                            onClick={() => handleStartCamera(camera.id)}
                            disabled={actionLoading[camera.id] === "starting"}
                            className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded text-xs transition-colors disabled:opacity-50"
                          >
                            <FiPlay size={12} />
                            {actionLoading[camera.id] === "starting" ? "..." : "Start"}
                          </button>
                        )}
                        <button
                          onClick={() => navigate("/playback")}
                          className="px-2 py-1.5 bg-gray-700 hover:bg-gray-600 text-white rounded text-xs transition-colors"
                        >
                          View
                        </button>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>

            {/* Stats Summary */}
            {data.cameras.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-700">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-green-500/10 p-2 rounded">
                    <div className="text-green-400 font-medium">{stats.activeCameras}</div>
                    <div className="text-gray-400">Active</div>
                  </div>
                  <div className="bg-red-500/10 p-2 rounded">
                    <div className="text-red-400 font-medium">{stats.inactiveCameras}</div>
                    <div className="text-gray-400">Inactive</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}