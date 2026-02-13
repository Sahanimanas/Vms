import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { getCamerasStatus, startSavedCamera, stopCamera } from "../api/cameraApi";

const DashboardContext = createContext(null);
export const useDashboard = () => useContext(DashboardContext);

export const DashboardProvider = ({ children }) => {
  const [data, setData] = useState({
    stats: null,
    cameras: [],
    alerts: [],
    events: [],
    violationsToday: 0,
  });

  const [loading, setLoading] = useState(false);

  const API = import.meta.env.VITE_API_BASE || "http://localhost:4000/api";
  const FASTAPI = import.meta.env.VITE_FASTAPI_BASE || "http://localhost:9000";

  const fetchAll = async () => {
    try {
      setLoading(true);

      // Fetch camera status from FastAPI
      let statusData = { 
        active_cameras: 0, 
        total_saved_cameras: 0, 
        active_status: {}, 
        saved_cameras: {},
        violations_today: 0
      };

      try {
        statusData = await getCamerasStatus();
      } catch (err) {
        console.warn("Camera API unavailable:", err.message);
      }

      // Fetch alerts from Express backend (if available)
      let alerts = [];
      try {
        const alertRes = await axios.get(`${API}/alerts`);
        alerts = alertRes.data || [];
      } catch (err) {
        console.warn("Alerts API unavailable:", err.message);
      }

      // Calculate stats
      const activeCameras = statusData.active_cameras ?? 0;
      const totalCameras = statusData.total_saved_cameras ?? 0;
      const inactiveCameras = totalCameras - activeCameras;
      const violationsToday = statusData.violations_today ?? 0;

      const stats = {
        activeCameras,
        totalCameras,
        inactiveCameras,
        openIncidents: 0,
        ppeViolationsToday: violationsToday,
        systemHealthPercent: totalCameras > 0 ? Math.round((activeCameras / totalCameras) * 100) : 0,
      };

      // Map saved cameras to array format
      const savedCamerasDict = statusData.saved_cameras || {};
      const activeStatusDict = statusData.active_status || {};

      const cameraList = Object.entries(savedCamerasDict).map(([camId, config]) => {
        const isActive = config.is_active || camId in activeStatusDict;
        return {
          id: camId,
          name: config.camera_name || camId,
          rtsp_url: config.rtsp_url,
          location: config.location,
          status: isActive ? "online" : "offline",
          confidence_threshold: config.confidence_threshold,
          total_detections: config.total_detections || 0,
          lastSeen: config.last_active || (isActive ? new Date().toISOString() : null),
        };
      });

      setData({
        stats,
        cameras: cameraList,
        alerts,
        events: [],
        violationsToday,
      });

    } catch (err) {
      console.error("Failed to fetch dashboard", err);
    } finally {
      setLoading(false);
    }
  };

  // Camera control functions
  const startCamera = async (cameraId) => {
    try {
      await startSavedCamera(cameraId);
      await fetchAll(); // Refresh data
      return { success: true };
    } catch (error) {
      console.error("Failed to start camera:", error);
      return { success: false, error: error.message };
    }
  };

  const stopCameraById = async (cameraId) => {
    try {
      await stopCamera(cameraId);
      await fetchAll(); // Refresh data
      return { success: true };
    } catch (error) {
      console.error("Failed to stop camera:", error);
      return { success: false, error: error.message };
    }
  };

  useEffect(() => {
    fetchAll();
    const interval = setInterval(fetchAll, 10000); // Poll every 10s
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <DashboardContext.Provider 
      value={{ 
        data, 
        loading,
        refresh: fetchAll,
        startCamera,
        stopCamera: stopCameraById,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
};