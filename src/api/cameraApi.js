import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_FASTAPI_BASE || 'http://localhost:9000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// ==================== SMART CAMERA OPERATIONS ====================

/**
 * Smart start - Backend checks status and starts if needed
 */
export const smartCameraAction = async (cameraId) => {
  try {
    const response = await api.post(`/cameras/check-and-start/${encodeURIComponent(cameraId)}`);
    return {
      success: true,
      data: response.data,
      action: response.data.status
    };
  } catch (error) {
    return {
      success: false,
      error: error,
      message: error.response?.data?.detail?.message || error.response?.data?.detail || error.message
    };
  }
};

/**
 * Stop camera
 */
export const stopCamera = async (cameraId) => {
  try {
    const response = await api.delete(`/camera/${encodeURIComponent(cameraId)}`);
    return {
      success: true,
      data: response.data,
      message: response.data.message
    };
  } catch (error) {
    return {
      success: false,
      error: error,
      message: error.response?.data?.detail || error.message
    };
  }
};

/**
 * Test RTSP connection
 */
export const testConnection = async (rtspUrl) => {
  try {
    const response = await api.post('/cameras/test-connection', null, {
      params: { rtsp_url: rtspUrl }
    });
    return {
      success: response.data.success,
      data: response.data,
      message: response.data.message
    };
  } catch (error) {
    return {
      success: false,
      error: error,
      message: error.response?.data?.detail || error.message
    };
  }
};

// ==================== CAMERA MANAGEMENT ====================

/**
 * Get status of all cameras
 */
export const getCamerasStatus = async () => {
  try {
    const response = await api.get('/cameras/status');
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Error fetching cameras status:', error);
    return {
      success: false,
      error: error,
      data: {
        active_cameras: 0,
        total_saved_cameras: 0,
        saved_cameras: {},
        active_status: {},
        violations_today: 0
      }
    };
  }
};

/**
 * Get all saved camera configurations
 */
export const getSavedCameras = async () => {
  try {
    const response = await api.get('/cameras/saved');
    return {
      success: true,
      data: response.data.cameras
    };
  } catch (error) {
    console.error('Error fetching saved cameras:', error);
    return {
      success: false,
      error: error,
      data: {}
    };
  }
};

/**
 * Save camera configuration
 */
export const saveCameraConfig = async (config) => {
  try {
    const response = await api.post('/cameras/save', config);
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    return {
      success: false,
      error: error,
      message: error.response?.data?.detail || error.message
    };
  }
};

/**
 * Delete camera configuration
 */
export const deleteCameraConfig = async (cameraId) => {
  try {
    const response = await api.delete(`/cameras/saved/${encodeURIComponent(cameraId)}`);
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    return {
      success: false,
      error: error,
      message: error.response?.data?.detail || error.message
    };
  }
};

/**
 * Get camera stream URL
 */
export const getStreamUrl = (cameraId) => {
  return `${API_BASE_URL}/camera/${encodeURIComponent(cameraId)}/stream`;
};

/**
 * Get camera detections
 */
export const getCameraDetections = async (cameraId) => {
  try {
    const response = await api.get(`/camera/${encodeURIComponent(cameraId)}/detections`);
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    return {
      success: false,
      error: error,
      data: { detections: [] }
    };
  }
};

/**
 * Get camera statistics
 */
export const getCameraStats = async (cameraId) => {
  try {
    const response = await api.get(`/camera/${encodeURIComponent(cameraId)}/stats`);
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    return {
      success: false,
      error: error,
      data: null
    };
  }
};

// ==================== VIOLATIONS ====================

/**
 * Get all violations
 */
export const getViolations = async () => {
  try {
    const response = await api.get('/violations');
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    return {
      success: false,
      error: error,
      data: { violations: [], total: 0 }
    };
  }
};

/**
 * Get today's violations
 */
export const getViolationsToday = async () => {
  try {
    const response = await api.get('/violations/today');
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    return {
      success: false,
      error: error,
      data: { violations: [], total: 0 }
    };
  }
};

/**
 * Get violations by date range
 */
export const getViolationsByRange = async (startDate, endDate) => {
  try {
    const response = await api.get('/violations/range', {
      params: { start_date: startDate, end_date: endDate }
    });
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    return {
      success: false,
      error: error,
      data: { violations: [], total: 0 }
    };
  }
};

/**
 * Get violations by camera
 */
export const getViolationsByCamera = async (cameraId) => {
  try {
    const response = await api.get(`/violations/camera/${encodeURIComponent(cameraId)}`);
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    return {
      success: false,
      error: error,
      data: { violations: [], total: 0 }
    };
  }
};

/**
 * Delete violation
 */
export const deleteViolation = async (violationId) => {
  try {
    const response = await api.delete(`/violations/${violationId}`);
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    return {
      success: false,
      error: error,
      message: error.response?.data?.detail || error.message
    };
  }
};

/**
 * Get violation image URL
 */
export const getViolationImageUrl = (imagePath) => {
  return `${API_BASE_URL}/violation-images/${imagePath}`;
};

/**
 * Get violation statistics
 */
export const getViolationStats = async () => {
  try {
    const response = await api.get('/violations/stats');
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    return {
      success: false,
      error: error,
      data: null
    };
  }
};

// ==================== WEBSOCKET ====================

/**
 * Create WebSocket connection for real-time detections
 */
export const createDetectionWebSocket = (cameraId, onMessage, onError) => {
  const wsUrl = `ws://${API_BASE_URL.replace('http://', '').replace('https://', '')}/camera/${cameraId}/detections-ws`;
  
  const ws = new WebSocket(wsUrl);
  
  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      onMessage(data);
    } catch (e) {
      console.error('WebSocket message parse error:', e);
    }
  };
  
  ws.onerror = (error) => {
    console.error('WebSocket error:', error);
    if (onError) onError(error);
  };
  
  ws.onclose = () => {
    console.log('WebSocket closed for camera:', cameraId);
  };
  
  return ws;
};

// ==================== UTILITY ====================

/**
 * Get API base URL
 */
export const getApiBaseUrl = () => API_BASE_URL;

/**
 * Health check
 */
export const healthCheck = async () => {
  try {
    const response = await api.get('/');
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    return {
      success: false,
      error: error
    };
  }
};

export default {
  smartCameraAction,
  stopCamera,
  testConnection,
  getCamerasStatus,
  getSavedCameras,
  saveCameraConfig,
  deleteCameraConfig,
  getStreamUrl,
  getCameraDetections,
  getCameraStats,
  getViolations,
  getViolationsToday,
  getViolationsByRange,
  getViolationsByCamera,
  deleteViolation,
  getViolationImageUrl,
  getViolationStats,
  createDetectionWebSocket,
  getApiBaseUrl,
  healthCheck
};