import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { getCamerasStatus, smartCameraAction, stopCamera } from "../api/cameraApi";

const DashboardContext = createContext();

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error("useDashboard must be used within DashboardProvider");
  }
  return context;
};

export const DashboardProvider = ({ children }) => {
  const [data, setData] = useState({
    cameras: [],
    stats: {
      activeCameras: 0,
      totalCameras: 0,
      inactiveCameras: 0,
      openIncidents: 0,
      ppeViolationsToday: 0,
      systemHealthPercent: 100,
    },
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Transform backend data to frontend format
  const transformCameraData = (statusData) => {
    const cameras = [];
    const savedCameras = statusData.saved_cameras || {};

    Object.keys(savedCameras).forEach((cameraId) => {
      const config = savedCameras[cameraId];
      const activeStatus = statusData.active_status?.[cameraId];

      cameras.push({
        id: cameraId,
        name: config.camera_name || cameraId,
        location: config.location || "",
        status: config.is_active && activeStatus?.running ? "online" : "offline",
        rtsp_url: config.rtsp_url,
        total_detections: config.total_detections || 0,
        lastSeen: config.last_active || null,
        is_active: config.is_active || false,
        running: activeStatus?.running || false,
      });
    });

    return cameras;
  };

  // Fetch dashboard data
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await getCamerasStatus();

      if (result.success) {
        const statusData = result.data;
        const cameras = transformCameraData(statusData);

        const activeCameras = cameras.filter((c) => c.status === "online").length;
        const totalCameras = cameras.length;

        setData({
          cameras,
          stats: {
            activeCameras,
            totalCameras,
            inactiveCameras: totalCameras - activeCameras,
            openIncidents: 0, // Backend doesn't provide this yet
            ppeViolationsToday: statusData.violations_today || 0,
            systemHealthPercent: activeCameras > 0 ? Math.round((activeCameras / totalCameras) * 100) : 0,
          },
        });
      } else {
        setError("Failed to load dashboard data");
        console.error("Dashboard fetch error:", result.error);
      }
    } catch (err) {
      setError("Failed to load dashboard data");
      console.error("Dashboard error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Start camera using smart action
  const startCamera = async (cameraId) => {
    try {
      console.log(`Starting camera: ${cameraId}`);
      
      const result = await smartCameraAction(cameraId);
      
      if (result.success) {
        console.log(`Camera ${cameraId} action result:`, result.data);
        
        // Refresh data after action
        await fetchData();
        
        return {
          success: true,
          message: result.data.message || "Camera action completed",
          data: result.data
        };
      } else {
        console.error(`Failed to start camera ${cameraId}:`, result.error);
        return {
          success: false,
          error: result.error,
          message: result.message
        };
      }
    } catch (error) {
      console.error(`Error starting camera ${cameraId}:`, error);
      return {
        success: false,
        error: error,
        message: error.message || "Unknown error occurred"
      };
    }
  };

  // Stop camera
  const stopCameraAction = async (cameraId) => {
    try {
      console.log(`Stopping camera: ${cameraId}`);
      
      const result = await stopCamera(cameraId);
      
      if (result.success) {
        console.log(`Camera ${cameraId} stopped:`, result.data);
        
        // Refresh data after action
        await fetchData();
        
        return {
          success: true,
          message: result.data.message || "Camera stopped",
          data: result.data
        };
      } else {
        console.error(`Failed to stop camera ${cameraId}:`, result.error);
        return {
          success: false,
          error: result.error,
          message: result.message
        };
      }
    } catch (error) {
      console.error(`Error stopping camera ${cameraId}:`, error);
      return {
        success: false,
        error: error,
        message: error.message || "Unknown error occurred"
      };
    }
  };

  // Refresh data
  const refresh = useCallback(async () => {
    await fetchData();
  }, [fetchData]);

  // Initial load
  useEffect(() => {
    fetchData();
    
    // Auto-refresh every 5 seconds
    const interval = setInterval(() => {
      fetchData();
    }, 5000);

    return () => clearInterval(interval);
  }, [fetchData]);

  return (
    <DashboardContext.Provider
      value={{
        data,
        loading,
        error,
        startCamera,
        stopCamera: stopCameraAction,
        refresh,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
};