import { useState, useEffect } from "react";
import { FiPlus, FiTrash2, FiPlay, FiSquare } from "react-icons/fi";
import {
  getCamerasStatus,
  saveCamera,
  deleteSavedCamera,
  startSavedCamera,
  stopCamera,
} from "../../api/cameraApi";

export default function CameraManager() {
  const [cameras, setCameras] = useState([]);
  const [form, setForm] = useState({
    camera_id: "",
    camera_name: "",
    rtsp_url: "",
    location: "",
    confidence_threshold: 0.5,
  });

  const fetchCameras = async () => {
    try {
      // GET /cameras/status returns:
      // { active_cameras, total_saved_cameras, active_status: {}, saved_cameras: {} }
      const statusData = await getCamerasStatus();
      const savedDict = statusData.saved_cameras || {};
      const activeStatusDict = statusData.active_status || {};

      // Convert dict to array for rendering
      const list = Object.entries(savedDict).map(([camId, config]) => ({
        camera_id: camId,
        camera_name: config.camera_name || camId,
        rtsp_url: config.rtsp_url,
        location: config.location,
        confidence_threshold: config.confidence_threshold,
        is_active: config.is_active || camId in activeStatusDict,
        total_detections: config.total_detections || 0,
      }));

      setCameras(list);
    } catch (err) {
      console.error("Failed to load cameras:", err);
    }
  };

  const addCamera = async () => {
    if (!form.camera_id || !form.rtsp_url) return;
    try {
      await saveCamera(form);
      setForm({
        camera_id: "",
        camera_name: "",
        rtsp_url: "",
        location: "",
        confidence_threshold: 0.5,
      });
      fetchCameras();
    } catch (err) {
      console.error("Failed to add camera:", err);
    }
  };

  const deleteCamera = async (id) => {
    try {
      await deleteSavedCamera(id);
      fetchCameras();
    } catch (err) {
      console.error("Failed to delete camera:", err);
    }
  };

  const toggleCamera = async (id, isActive) => {
    try {
      if (isActive) {
        await stopCamera(id);
      } else {
        await startSavedCamera(id);
      }
      fetchCameras();
    } catch (err) {
      console.error("Failed to toggle camera:", err);
    }
  };

  useEffect(() => {
    fetchCameras();
  }, []);

  return (
    <div className="card">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-gray-300 font-semibold">Manage Cameras</h3>
        <button onClick={addCamera} className="flex items-center gap-1 bg-green-600 px-3 py-1 rounded text-sm">
          <FiPlus /> Add
        </button>
      </div>

      <div className="space-y-2 mb-4">
        {cameras.map((cam) => (
          <div key={cam.camera_id} className="bg-gray-900 p-2 rounded flex justify-between items-center">
            <div>
              <div className="text-gray-200 text-sm flex items-center gap-2">
                {cam.camera_name || cam.camera_id}
                <span
                  className={`inline-block w-2 h-2 rounded-full ${
                    cam.is_active ? "bg-green-500" : "bg-red-600"
                  }`}
                />
              </div>
              <div className="text-xs text-gray-500">{cam.rtsp_url}</div>
              {cam.location && (
                <div className="text-xs text-gray-600">{cam.location}</div>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => toggleCamera(cam.camera_id, cam.is_active)}
                className={`text-gray-400 hover:${cam.is_active ? "text-orange-400" : "text-green-400"}`}
                title={cam.is_active ? "Stop stream" : "Start stream"}
              >
                {cam.is_active ? <FiSquare /> : <FiPlay />}
              </button>
              <button onClick={() => deleteCamera(cam.camera_id)} className="text-gray-400 hover:text-red-400">
                <FiTrash2 />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-2">
        <input
          placeholder="Camera ID"
          value={form.camera_id}
          onChange={(e) => setForm({ ...form, camera_id: e.target.value })}
          className="bg-gray-800 p-2 rounded w-full"
        />
        <input
          placeholder="Display Name"
          value={form.camera_name}
          onChange={(e) => setForm({ ...form, camera_name: e.target.value })}
          className="bg-gray-800 p-2 rounded w-full"
        />
        <input
          placeholder="RTSP URL (e.g. rtsp://admin:admin@192.168.1.6:554/live)"
          value={form.rtsp_url}
          onChange={(e) => setForm({ ...form, rtsp_url: e.target.value })}
          className="bg-gray-800 p-2 rounded w-full"
        />
        <input
          placeholder="Location"
          value={form.location}
          onChange={(e) => setForm({ ...form, location: e.target.value })}
          className="bg-gray-800 p-2 rounded w-full"
        />
      </div>
    </div>
  );
}
