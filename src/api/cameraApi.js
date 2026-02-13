import axios from "axios";

const FASTAPI_BASE = import.meta.env.VITE_FASTAPI_BASE || "http://localhost:9000";

// ==================== Camera APIs ====================

export const getCamerasStatus = async () => {
  const response = await axios.get(`${FASTAPI_BASE}/cameras/status`);
  return response.data;
};

export const startSavedCamera = async (cameraId) => {
  const response = await axios.post(`${FASTAPI_BASE}/cameras/start-saved/${cameraId}`);
  return response.data;
};

export const stopCamera = async (cameraId) => {
  const response = await axios.delete(`${FASTAPI_BASE}/camera/${cameraId}`);
  return response.data;
};

export const saveCameraConfig = async (config) => {
  const response = await axios.post(`${FASTAPI_BASE}/cameras/save`, config);
  return response.data;
};

export const getSavedCameras = async () => {
  const response = await axios.get(`${FASTAPI_BASE}/cameras/saved`);
  return response.data;
};

export const deleteSavedCamera = async (cameraId) => {
  const response = await axios.delete(`${FASTAPI_BASE}/cameras/saved/${cameraId}`);
  return response.data;
};

export const getStreamUrl = (cameraId) => {
  return `${FASTAPI_BASE}/camera/${cameraId}/stream`;
};

// ==================== Violation APIs ====================

export const getAllViolations = async () => {
  const response = await axios.get(`${FASTAPI_BASE}/violations`);
  return response.data;
};

export const getViolationsToday = async () => {
  const response = await axios.get(`${FASTAPI_BASE}/violations/today`);
  return response.data;
};

export const getViolationsByRange = async (startDate, endDate) => {
  const response = await axios.get(`${FASTAPI_BASE}/violations/range`, {
    params: { start_date: startDate, end_date: endDate }
  });
  return response.data;
};

export const getViolationDetails = async (violationId) => {
  const response = await axios.get(`${FASTAPI_BASE}/violations/${violationId}`);
  return response.data;
};

export const deleteViolation = async (violationId) => {
  const response = await axios.delete(`${FASTAPI_BASE}/violations/${violationId}`);
  return response.data;
};

export const getViolationImageUrl = (violationId) => {
  return `${FASTAPI_BASE}/violations/image/${violationId}`;
};

// Helper to get violation image path from filename
export const getViolationImagePath = (imageFilename) => {
  return `${FASTAPI_BASE}/violation-images/${imageFilename}`;
};

// ==================== Detection APIs ====================

export const getCameraDetections = async (cameraId) => {
  const response = await axios.get(`${FASTAPI_BASE}/camera/${cameraId}/detections`);
  return response.data;
};

// WebSocket connection for real-time detections
export const connectDetectionsWebSocket = (cameraId, onMessage, onError) => {
  const wsUrl = `ws://localhost:9000/camera/${cameraId}/detections-ws`;
  const ws = new WebSocket(wsUrl);
  
  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    onMessage(data);
  };
  
  ws.onerror = (error) => {
    console.error("WebSocket error:", error);
    if (onError) onError(error);
  };
  
  ws.onclose = () => {
    console.log("WebSocket closed");
  };
  
  return ws;
};