import { useState, useEffect } from "react";
import { FiCamera, FiEdit2, FiTrash2, FiSave, FiX, FiPlus, FiRefreshCw, FiAlertTriangle, FiCheckCircle, FiActivity, FiWifi, FiWifiOff } from "react-icons/fi";
import Sidebar from "../components/Sidebar";

const FASTAPI_BASE = import.meta.env.VITE_FASTAPI_BASE || "http://localhost:9000";

// Status badge component
const StatusBadge = ({ status, isActive }) => {
  const statusConfig = {
    online: { bg: "bg-green-500/20", text: "text-green-400", border: "border-green-500/30", label: "Online" },
    offline: { bg: "bg-gray-600/20", text: "text-gray-400", border: "border-gray-500/30", label: "Offline" },
    starting: { bg: "bg-blue-500/20", text: "text-blue-400", border: "border-blue-500/30", label: "Starting" },
    stopping: { bg: "bg-yellow-500/20", text: "text-yellow-400", border: "border-yellow-500/30", label: "Stopping" },
    error: { bg: "bg-red-500/20", text: "text-red-400", border: "border-red-500/30", label: "Error" },
    reconnecting: { bg: "bg-orange-500/20", text: "text-orange-400", border: "border-orange-500/30", label: "Reconnecting" },
  };

  const config = statusConfig[status] || statusConfig[isActive ? 'online' : 'offline'];

  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${config.bg} ${config.text} ${config.border}`}>
      {config.label}
    </span>
  );
};

// Detection stats component
const DetectionStats = ({ violations, compliances, total }) => (
  <div className="flex items-center gap-3">
    <span className="flex items-center gap-1 text-red-400" title="Violations">
      <FiAlertTriangle size={12} />
      {violations || 0}
    </span>
    <span className="flex items-center gap-1 text-green-400" title="Compliant">
      <FiCheckCircle size={12} />
      {compliances || 0}
    </span>
    <span className="text-gray-500 text-xs">/ {total || 0}</span>
  </div>
);

export default function Settings() {
  const [cameras, setCameras] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCamera, setEditingCamera] = useState(null);
  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionResult, setConnectionResult] = useState(null);
  const [formData, setFormData] = useState({
    camera_id: "",
    camera_name: "",
    rtsp_url: "",
    location: "",
    confidence_threshold: 0.5,
  });
  const [systemStats, setSystemStats] = useState({
    totalCameras: 0,
    activeCameras: 0,
    totalViolations: 0,
    totalCompliances: 0,
    totalDetections: 0,
  });

  // Fetch all saved cameras
  const fetchCameras = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${FASTAPI_BASE}/cameras/status`);
      const data = await response.json();
      
      const camerasData = data.saved_cameras || {};
      const activeStatus = data.active_status || {};
      
      // Convert object to array with additional info
      const camerasArray = Object.entries(camerasData).map(([id, config]) => ({
        id,
        ...config,
        runtime_stats: activeStatus[id] || null,
      }));
      
      setCameras(camerasArray);
      
      // Calculate system stats
      const stats = camerasArray.reduce((acc, cam) => ({
        totalCameras: acc.totalCameras + 1,
        activeCameras: acc.activeCameras + (cam.is_active ? 1 : 0),
        totalViolations: acc.totalViolations + (cam.violation_count || 0),
        totalCompliances: acc.totalCompliances + (cam.compliance_count || 0),
        totalDetections: acc.totalDetections + (cam.total_detections || 0),
      }), {
        totalCameras: 0,
        activeCameras: 0,
        totalViolations: 0,
        totalCompliances: 0,
        totalDetections: 0,
      });
      
      setSystemStats(stats);
    } catch (error) {
      console.error("Failed to fetch cameras:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCameras();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchCameras, 30000);
    return () => clearInterval(interval);
  }, []);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === "confidence_threshold" ? parseFloat(value) : value,
    });
    setConnectionResult(null);
  };

  // Test connection
  const handleTestConnection = async () => {
    if (!formData.rtsp_url) {
      setConnectionResult({ success: false, message: "Please enter RTSP URL first" });
      return;
    }

    setTestingConnection(true);
    setConnectionResult(null);

    try {
      const response = await fetch(`${FASTAPI_BASE}/cameras/test-connection?rtsp_url=${encodeURIComponent(formData.rtsp_url)}`, {
        method: 'POST'
      });
      const data = await response.json();
      
      setConnectionResult({
        success: data.success,
        message: data.message,
        frameSize: data.frame_size
      });
    } catch (error) {
      setConnectionResult({
        success: false,
        message: error.message || "Connection test failed"
      });
    } finally {
      setTestingConnection(false);
    }
  };

  // Add new camera
  const handleAddCamera = async (e) => {
    e.preventDefault();
    
    if (!formData.camera_id || !formData.rtsp_url) {
      alert("Camera ID and RTSP URL are required");
      return;
    }

    try {
      const response = await fetch(`${FASTAPI_BASE}/cameras/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        alert("Camera added successfully!");
        setShowAddModal(false);
        resetForm();
        fetchCameras();
      } else {
        const error = await response.json();
        alert(`Failed to add camera: ${error.detail || 'Unknown error'}`);
      }
    } catch (error) {
      console.error("Failed to add camera:", error);
      alert("Failed to add camera. Please try again.");
    }
  };

  // Update existing camera
  const handleUpdateCamera = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch(`${FASTAPI_BASE}/cameras/saved/${encodeURIComponent(editingCamera.id)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        alert("Camera updated successfully!");
        setEditingCamera(null);
        resetForm();
        fetchCameras();
      } else {
        const error = await response.json();
        alert(`Failed to update camera: ${error.detail || 'Unknown error'}`);
      }
    } catch (error) {
      console.error("Failed to update camera:", error);
      alert("Failed to update camera. Please try again.");
    }
  };

  // Delete camera
  const handleDeleteCamera = async (cameraId) => {
    if (!window.confirm(`Are you sure you want to delete camera "${cameraId}"?\nThis will also stop the camera if it's running.`)) {
      return;
    }

    try {
      const response = await fetch(`${FASTAPI_BASE}/cameras/saved/${encodeURIComponent(cameraId)}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        alert("Camera deleted successfully!");
        fetchCameras();
      } else {
        const error = await response.json();
        alert(`Failed to delete camera: ${error.detail || 'Unknown error'}`);
      }
    } catch (error) {
      console.error("Failed to delete camera:", error);
      alert("Failed to delete camera. Please try again.");
    }
  };

  // Start editing a camera
  const startEdit = (camera) => {
    setEditingCamera(camera);
    setFormData({
      camera_id: camera.id,
      camera_name: camera.camera_name || "",
      rtsp_url: camera.rtsp_url || "",
      location: camera.location || "",
      confidence_threshold: camera.confidence_threshold || 0.5,
    });
    setConnectionResult(null);
  };

  // Cancel editing/adding
  const cancelEdit = () => {
    setEditingCamera(null);
    setShowAddModal(false);
    resetForm();
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      camera_id: "",
      camera_name: "",
      rtsp_url: "",
      location: "",
      confidence_threshold: 0.5,
    });
    setConnectionResult(null);
  };

  // Open add modal
  const openAddModal = () => {
    resetForm();
    setShowAddModal(true);
  };

  return (
    <div className="flex h-screen bg-gray-900">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white mb-1">Settings</h1>
          <p className="text-gray-400">Configure cameras and system settings</p>
        </div>

        {/* System Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <FiCamera size={20} className="text-blue-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{systemStats.totalCameras}</div>
                <div className="text-xs text-gray-400">Total Cameras</div>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <FiActivity size={20} className="text-green-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-green-400">{systemStats.activeCameras}</div>
                <div className="text-xs text-gray-400">Active</div>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-500/20 rounded-lg">
                <FiAlertTriangle size={20} className="text-red-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-red-400">{systemStats.totalViolations}</div>
                <div className="text-xs text-gray-400">Violations</div>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <FiCheckCircle size={20} className="text-green-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-green-400">{systemStats.totalCompliances}</div>
                <div className="text-xs text-gray-400">Compliant</div>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-500/20 rounded-lg">
                <FiActivity size={20} className="text-yellow-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-400">{systemStats.totalDetections}</div>
                <div className="text-xs text-gray-400">Total Detections</div>
              </div>
            </div>
          </div>
        </div>

        {/* Camera Configuration Section */}
        <div className="bg-gray-800/50 rounded-xl border border-gray-700 mb-6">
          <div className="flex items-center justify-between p-4 border-b border-gray-700">
            <div>
              <h2 className="text-xl font-bold text-white mb-1">Camera Configuration</h2>
              <p className="text-sm text-gray-400">Manage your camera connections and settings</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={fetchCameras}
                className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                disabled={loading}
              >
                <FiRefreshCw size={16} className={loading ? "animate-spin" : ""} />
                Refresh
              </button>
              <button
                onClick={openAddModal}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <FiPlus size={16} />
                Add Camera
              </button>
            </div>
          </div>

          {/* Camera List */}
          <div className="p-4">
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                <p className="text-gray-400 mt-4">Loading cameras...</p>
              </div>
            ) : cameras.length === 0 ? (
              <div className="text-center py-12">
                <FiCamera size={48} className="mx-auto text-gray-600 mb-4" />
                <p className="text-gray-400 mb-4">No cameras configured</p>
                <button
                  onClick={openAddModal}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Add Your First Camera
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-800/80">
                    <tr className="border-b border-gray-700">
                      <th className="text-left p-4 text-gray-400 font-medium text-sm">Camera</th>
                      <th className="text-left p-4 text-gray-400 font-medium text-sm">Location</th>
                      <th className="text-left p-4 text-gray-400 font-medium text-sm">Status</th>
                      <th className="text-left p-4 text-gray-400 font-medium text-sm">Detections</th>
                      <th className="text-left p-4 text-gray-400 font-medium text-sm">Last Active</th>
                      <th className="text-left p-4 text-gray-400 font-medium text-sm">Confidence</th>
                      <th className="text-left p-4 text-gray-400 font-medium text-sm">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cameras.map((camera) => (
                      <tr 
                        key={camera.id} 
                        className="border-b border-gray-700/50 hover:bg-gray-700/30 transition-colors"
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <span
                              className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                                camera.is_active ? "bg-green-500 animate-pulse" : "bg-gray-500"
                              }`}
                            />
                            <div>
                              <div className="text-white font-medium text-sm">{camera.camera_name || camera.id}</div>
                              <div className="text-gray-500 text-xs font-mono">{camera.id}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-gray-300 text-sm">{camera.location || "-"}</td>
                        <td className="p-4">
                          <StatusBadge status={camera.status} isActive={camera.is_active} />
                        </td>
                        <td className="p-4">
                          <DetectionStats 
                            violations={camera.violation_count}
                            compliances={camera.compliance_count}
                            total={camera.total_detections}
                          />
                        </td>
                        <td className="p-4 text-gray-400 text-sm">
                          {camera.last_active 
                            ? new Date(camera.last_active).toLocaleString()
                            : "Never"}
                        </td>
                        <td className="p-4 text-gray-300 text-sm">
                          {(camera.confidence_threshold * 100).toFixed(0)}%
                        </td>
                        <td className="p-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => startEdit(camera)}
                              className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                              title="Edit Camera"
                            >
                              <FiEdit2 size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteCamera(camera.id)}
                              className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                              title="Delete Camera"
                            >
                              <FiTrash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* PPE Detection Legend */}
        <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-4">
          <h3 className="text-white font-semibold mb-3">Detection Color Legend</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-3 bg-red-500/10 rounded-lg border border-red-500/20">
              <div className="w-4 h-4 bg-red-500 rounded"></div>
              <div>
                <div className="text-red-400 font-medium text-sm">Violation (Red)</div>
                <div className="text-gray-500 text-xs">Missing PPE - no helmet, no vest, etc.</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-green-500/10 rounded-lg border border-green-500/20">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <div>
                <div className="text-green-400 font-medium text-sm">Compliant (Green)</div>
                <div className="text-gray-500 text-xs">PPE detected - helmet, vest, goggles, etc.</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-orange-500/10 rounded-lg border border-orange-500/20">
              <div className="w-4 h-4 bg-orange-500 rounded"></div>
              <div>
                <div className="text-orange-400 font-medium text-sm">Other (Orange)</div>
                <div className="text-gray-500 text-xs">Unknown or other detections</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit Camera Modal */}
      {(showAddModal || editingCamera) && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-gray-800 rounded-xl max-w-2xl w-full border border-gray-700 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1">
                    {editingCamera ? "Edit Camera" : "Add New Camera"}
                  </h2>
                  <p className="text-gray-400">
                    {editingCamera 
                      ? "Update camera configuration" 
                      : "Configure a new camera connection"}
                  </p>
                </div>
                <button
                  onClick={cancelEdit}
                  className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <FiX size={24} className="text-gray-400" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={editingCamera ? handleUpdateCamera : handleAddCamera}>
                <div className="space-y-4">
                  {/* Camera ID */}
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Camera ID <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      name="camera_id"
                      value={formData.camera_id}
                      onChange={handleInputChange}
                      disabled={!!editingCamera}
                      placeholder="e.g., camera_1, entrance_cam"
                      className="w-full px-4 py-2.5 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      required
                    />
                    <p className="text-gray-500 text-xs mt-1">
                      Unique identifier (no spaces or special characters)
                    </p>
                  </div>

                  {/* Camera Name */}
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Camera Name
                    </label>
                    <input
                      type="text"
                      name="camera_name"
                      value={formData.camera_name}
                      onChange={handleInputChange}
                      placeholder="e.g., Main Entrance, Warehouse Floor"
                      className="w-full px-4 py-2.5 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 outline-none transition-colors"
                    />
                  </div>

                  {/* RTSP URL */}
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      RTSP URL <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      name="rtsp_url"
                      value={formData.rtsp_url}
                      onChange={handleInputChange}
                      placeholder="rtsp://username:password@192.168.1.100:554/stream"
                      className="w-full px-4 py-2.5 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 outline-none font-mono text-sm transition-colors"
                      required
                    />
                    <p className="text-gray-500 text-xs mt-1">
                      Full RTSP stream URL including credentials
                    </p>
                  </div>

                  {/* Test Connection Button */}
                  <button
                    type="button"
                    onClick={handleTestConnection}
                    disabled={testingConnection || !formData.rtsp_url}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed border border-gray-600 text-white rounded-lg transition-colors"
                  >
                    {testingConnection ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Testing Connection...
                      </>
                    ) : connectionResult?.success ? (
                      <>
                        <FiWifi className="text-green-400" />
                        Connection Verified
                      </>
                    ) : connectionResult?.success === false ? (
                      <>
                        <FiWifiOff className="text-red-400" />
                        Test Failed - Try Again
                      </>
                    ) : (
                      <>
                        <FiWifi />
                        Test Connection
                      </>
                    )}
                  </button>

                  {/* Connection Result */}
                  {connectionResult && (
                    <div className={`flex items-start gap-2 p-3 rounded-lg text-sm ${
                      connectionResult.success 
                        ? 'bg-green-500/10 border border-green-500/30 text-green-400' 
                        : 'bg-red-500/10 border border-red-500/30 text-red-400'
                    }`}>
                      {connectionResult.success ? (
                        <FiCheckCircle className="flex-shrink-0 mt-0.5" />
                      ) : (
                        <FiAlertTriangle className="flex-shrink-0 mt-0.5" />
                      )}
                      <div>
                        <div>{connectionResult.message}</div>
                        {connectionResult.frameSize && (
                          <div className="text-xs mt-1 opacity-75">
                            Frame size: {connectionResult.frameSize.width}x{connectionResult.frameSize.height}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Location */}
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Location
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      placeholder="e.g., Building A - Ground Floor"
                      className="w-full px-4 py-2.5 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 outline-none transition-colors"
                    />
                  </div>

                  {/* Confidence Threshold */}
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Confidence Threshold: <span className="text-blue-400">{(formData.confidence_threshold * 100).toFixed(0)}%</span>
                    </label>
                    <input
                      type="range"
                      name="confidence_threshold"
                      value={formData.confidence_threshold}
                      onChange={handleInputChange}
                      min="0.1"
                      max="1.0"
                      step="0.05"
                      className="w-full accent-blue-500"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>10% (More detections)</span>
                      <span>100% (Higher accuracy)</span>
                    </div>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex gap-3 mt-6 pt-4 border-t border-gray-700">
                  <button
                    type="submit"
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                  >
                    <FiSave size={18} />
                    {editingCamera ? "Update Camera" : "Add Camera"}
                  </button>
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}