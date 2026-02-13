import { useState, useEffect } from "react";
import { FiCamera, FiEdit2, FiTrash2, FiSave, FiX, FiPlus, FiRefreshCw } from "react-icons/fi";
import axios from "axios";
import Sidebar from "../components/Sidebar";

const FASTAPI_BASE = import.meta.env.VITE_FASTAPI_BASE || "http://localhost:9000";

export default function Settings() {
  const [cameras, setCameras] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCamera, setEditingCamera] = useState(null);
  const [formData, setFormData] = useState({
    camera_id: "",
    camera_name: "",
    rtsp_url: "",
    location: "",
    confidence_threshold: 0.5,
  });

  // Fetch all saved cameras
  const fetchCameras = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${FASTAPI_BASE}/cameras/saved`);
      const camerasData = response.data.cameras || {};
      
      // Convert object to array with additional info
      const camerasArray = Object.entries(camerasData).map(([id, config]) => ({
        id,
        ...config,
      }));
      
      setCameras(camerasArray);
    } catch (error) {
      console.error("Failed to fetch cameras:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCameras();
  }, []);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === "confidence_threshold" ? parseFloat(value) : value,
    });
  };

  // Add new camera
  const handleAddCamera = async (e) => {
    e.preventDefault();
    
    if (!formData.camera_id || !formData.rtsp_url) {
      alert("Camera ID and RTSP URL are required");
      return;
    }

    try {
      await axios.post(`${FASTAPI_BASE}/cameras/save`, formData);
      alert("Camera added successfully!");
      setShowAddModal(false);
      resetForm();
      fetchCameras();
    } catch (error) {
      console.error("Failed to add camera:", error);
      alert("Failed to add camera. Please try again.");
    }
  };

  // Update existing camera
  const handleUpdateCamera = async (e) => {
    e.preventDefault();
    
    try {
      await axios.put(`${FASTAPI_BASE}/cameras/saved/${editingCamera.id}`, formData);
      alert("Camera updated successfully!");
      setEditingCamera(null);
      resetForm();
      fetchCameras();
    } catch (error) {
      console.error("Failed to update camera:", error);
      alert("Failed to update camera. Please try again.");
    }
  };

  // Delete camera
  const handleDeleteCamera = async (cameraId) => {
    if (!window.confirm(`Are you sure you want to delete camera "${cameraId}"?`)) {
      return;
    }

    try {
      await axios.delete(`${FASTAPI_BASE}/cameras/saved/${cameraId}`);
      alert("Camera deleted successfully!");
      fetchCameras();
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
          <h1 className="text-2xl font-bold text-white mb-2">Settings</h1>
          <p className="text-gray-400">Configure cameras and system settings</p>
        </div>

        {/* Camera Configuration Section */}
        <div className="card mb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-white mb-1">Camera Configuration</h2>
              <p className="text-sm text-gray-400">Manage your camera connections and settings</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={fetchCameras}
                className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors"
                disabled={loading}
              >
                <FiRefreshCw size={16} className={loading ? "animate-spin" : ""} />
                Refresh
              </button>
              <button
                onClick={openAddModal}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
              >
                <FiPlus size={16} />
                Add Camera
              </button>
            </div>
          </div>

          {/* Camera List */}
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
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
              >
                Add Your First Camera
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-800/80">
                  <tr className="border-b border-gray-700">
                    <th className="text-left p-4 text-gray-400 font-medium text-sm">Camera ID</th>
                    <th className="text-left p-4 text-gray-400 font-medium text-sm">Name</th>
                    <th className="text-left p-4 text-gray-400 font-medium text-sm">Location</th>
                    <th className="text-left p-4 text-gray-400 font-medium text-sm">Status</th>
                    <th className="text-left p-4 text-gray-400 font-medium text-sm">Last Active</th>
                    <th className="text-left p-4 text-gray-400 font-medium text-sm">Detections</th>
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
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              camera.is_active ? "bg-green-500" : "bg-gray-500"
                            }`}
                          />
                          <span className="text-white font-medium text-sm">{camera.id}</span>
                        </div>
                      </td>
                      <td className="p-4 text-gray-300 text-sm">{camera.camera_name || "-"}</td>
                      <td className="p-4 text-gray-300 text-sm">{camera.location || "-"}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          camera.is_active 
                            ? "bg-green-500/20 text-green-400" 
                            : "bg-gray-600/20 text-gray-400"
                        }`}>
                          {camera.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="p-4 text-gray-400 text-sm">
                        {camera.last_active 
                          ? new Date(camera.last_active).toLocaleString()
                          : "Never"}
                      </td>
                      <td className="p-4 text-gray-300 text-sm">
                        {camera.total_detections || 0}
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => startEdit(camera)}
                            className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                            title="Edit Camera"
                          >
                            <FiEdit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteCamera(camera.id)}
                            className="p-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
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

        {/* System Information */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card">
            <h3 className="text-white font-medium mb-2">Total Cameras</h3>
            <p className="text-3xl font-bold text-blue-400">{cameras.length}</p>
          </div>
          <div className="card">
            <h3 className="text-white font-medium mb-2">Active Cameras</h3>
            <p className="text-3xl font-bold text-green-400">
              {cameras.filter(c => c.is_active).length}
            </p>
          </div>
          <div className="card">
            <h3 className="text-white font-medium mb-2">Total Detections</h3>
            <p className="text-3xl font-bold text-yellow-400">
              {cameras.reduce((sum, c) => sum + (c.total_detections || 0), 0)}
            </p>
          </div>
        </div>
      </div>

      {/* Add/Edit Camera Modal */}
      {(showAddModal || editingCamera) && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg max-w-2xl w-full border border-gray-700">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">
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
                  className="p-2 hover:bg-gray-700 rounded transition-colors"
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
                      Camera ID *
                    </label>
                    <input
                      type="text"
                      name="camera_id"
                      value={formData.camera_id}
                      onChange={handleInputChange}
                      disabled={!!editingCamera}
                      placeholder="e.g., camera_1, entrance_cam"
                      className="w-full px-4 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                      required
                    />
                    <p className="text-gray-500 text-xs mt-1">
                      Unique identifier for this camera
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
                      className="w-full px-4 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 outline-none"
                    />
                    <p className="text-gray-500 text-xs mt-1">
                      Friendly name for easy identification
                    </p>
                  </div>

                  {/* RTSP URL */}
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      RTSP URL *
                    </label>
                    <input
                      type="text"
                      name="rtsp_url"
                      value={formData.rtsp_url}
                      onChange={handleInputChange}
                      placeholder="rtsp://username:password@192.168.1.100:554/stream"
                      className="w-full px-4 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 outline-none font-mono text-sm"
                      required
                    />
                    <p className="text-gray-500 text-xs mt-1">
                      Full RTSP stream URL including credentials
                    </p>
                  </div>

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
                      className="w-full px-4 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 outline-none"
                    />
                    <p className="text-gray-500 text-xs mt-1">
                      Physical location of the camera
                    </p>
                  </div>

                  {/* Confidence Threshold */}
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Confidence Threshold: {formData.confidence_threshold}
                    </label>
                    <input
                      type="range"
                      name="confidence_threshold"
                      value={formData.confidence_threshold}
                      onChange={handleInputChange}
                      min="0.1"
                      max="1.0"
                      step="0.05"
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>0.1 (More detections)</span>
                      <span>1.0 (Fewer, more confident)</span>
                    </div>
                    <p className="text-gray-500 text-xs mt-1">
                      Minimum confidence for PPE detection (0.5 recommended)
                    </p>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex gap-3 mt-6">
                  <button
                    type="submit"
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium transition-colors"
                  >
                    <FiSave size={18} />
                    {editingCamera ? "Update Camera" : "Add Camera"}
                  </button>
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded font-medium transition-colors"
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