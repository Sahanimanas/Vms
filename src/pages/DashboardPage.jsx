import { FiCamera, FiAlertTriangle, FiActivity, FiPlay, FiSquare, FiRefreshCw, FiX, FiAlertCircle, FiCheckCircle, FiMaximize2, FiMinimize2 } from "react-icons/fi";
import { useDashboard } from "../context/DashboardContext";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import { getStreamUrl, getCameraDetections } from "../api/cameraApi";
import AddCameraButton from "../components/Dashboard/AddCameraButton";

// Toast notification component
const Toast = ({ message, type, onClose }) => {
  const styles = {
    success: 'bg-green-600 border-green-500',
    error: 'bg-red-600 border-red-500',
    warning: 'bg-yellow-600 border-yellow-500',
    info: 'bg-blue-600 border-blue-500'
  };

  const icons = {
    success: <FiCheckCircle size={20} />,
    error: <FiX size={20} />,
    warning: <FiAlertTriangle size={20} />,
    info: <FiAlertCircle size={20} />
  };

  return (
    <div className={`${styles[type] || styles.info} text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 min-w-[300px] max-w-md border-l-4 animate-slide-in`}>
      <span className="flex-shrink-0">{icons[type]}</span>
      <p className="flex-1 text-sm">{message}</p>
      <button onClick={onClose} className="hover:bg-white/20 rounded p-1 transition-colors">
        <FiX size={16} />
      </button>
    </div>
  );
};

// Toast container
const ToastContainer = ({ toasts, removeToast }) => (
  <div className="fixed top-4 right-4 z-50 space-y-2">
    {toasts.map((toast) => (
      <Toast
        key={toast.id}
        message={toast.message}
        type={toast.type}
        onClose={() => removeToast(toast.id)}
      />
    ))}
  </div>
);

// Detection indicator component
const DetectionIndicator = ({ violations, compliances }) => {
  if (violations === 0 && compliances === 0) return null;
  
  return (
    <div className="absolute top-2 right-2 flex gap-1 z-10">
      {violations > 0 && (
        <span className="bg-red-500/90 text-white text-xs px-2 py-1 rounded-full font-medium animate-pulse">
          {violations} ⚠️
        </span>
      )}
      {compliances > 0 && (
        <span className="bg-green-500/90 text-white text-xs px-2 py-1 rounded-full font-medium">
          {compliances} ✓
        </span>
      )}
    </div>
  );
};

// Fullscreen Camera Modal
const FullscreenCameraModal = ({ camera, onClose }) => {
  const [detections, setDetections] = useState({ violations: 0, compliances: 0, details: [] });
  const [streamKey, setStreamKey] = useState(Date.now());
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showOverlay, setShowOverlay] = useState(true);

  // Poll for detections
  useEffect(() => {
    const fetchDetections = async () => {
      const result = await getCameraDetections(camera.id);
      if (result.success && result.data) {
        setDetections({
          violations: result.data.violation_count || 0,
          compliances: result.data.compliance_count || 0,
          details: result.data.detections || []
        });
      }
    };
    
    fetchDetections();
    const interval = setInterval(fetchDetections, 2000);
    return () => clearInterval(interval);
  }, [camera.id]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (isFullscreen) {
          document.exitFullscreen?.();
          setIsFullscreen(false);
        } else {
          onClose();
        }
      }
      // Press 'H' to toggle overlay
      if (e.key === 'h' || e.key === 'H') {
        setShowOverlay(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, isFullscreen]);

  // Toggle browser fullscreen
  const toggleFullscreen = () => {
    const elem = document.getElementById('fullscreen-camera-container');
    if (!isFullscreen) {
      elem?.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  // Refresh stream
  const refreshStream = () => {
    setStreamKey(Date.now());
  };

  return (
    <div 
      className="fixed inset-0 bg-black z-50" 
      id="fullscreen-camera-container"
      style={{ overflow: 'hidden' }}
    >
      {/* Video Stream - Absolute Full Size Background */}
      <img
        key={streamKey}
        src={`${getStreamUrl(camera.id)}?t=${streamKey}`}
        alt={camera.name}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          backgroundColor: '#000'
        }}
      />

      {/* Overlay Toggle Button - Always visible */}
      <button
        onClick={() => setShowOverlay(prev => !prev)}
        className="absolute top-4 left-4 z-30 p-2 bg-black/50 hover:bg-black/70 text-white rounded-lg transition-colors"
        title="Toggle Overlay (H)"
      >
        {showOverlay ? '🙈 Hide UI' : '👁️ Show UI'}
      </button>

      {/* Header - Conditional */}
      {showOverlay && (
        <div className="absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-black/80 via-black/40 to-transparent p-4 pt-3">
          <div className="flex items-center justify-between">
            {/* Camera Info */}
            <div className="flex items-center gap-4 ml-24">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
                <h2 className="text-white text-xl font-bold">{camera.name}</h2>
              </div>
              {camera.location && (
                <span className="text-gray-400 text-sm">📍 {camera.location}</span>
              )}
              <span className="bg-green-500/20 text-green-400 text-xs px-3 py-1 rounded-full border border-green-500/30">
                LIVE
              </span>
            </div>

            {/* Detection Stats */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 bg-black/60 backdrop-blur-sm px-4 py-2 rounded-lg">
                <div className="flex items-center gap-2">
                  <span className="text-red-400">⚠️</span>
                  <span className="text-white font-bold text-lg">{detections.violations}</span>
                  <span className="text-gray-400 text-sm">Violations</span>
                </div>
                <div className="w-px h-6 bg-gray-600"></div>
                <div className="flex items-center gap-2">
                  <span className="text-green-400">✓</span>
                  <span className="text-white font-bold text-lg">{detections.compliances}</span>
                  <span className="text-gray-400 text-sm">Compliant</span>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={refreshStream}
                className="p-2.5 bg-gray-800/80 hover:bg-gray-700 text-white rounded-lg transition-colors"
                title="Refresh Stream"
              >
                <FiRefreshCw size={20} />
              </button>
              <button
                onClick={toggleFullscreen}
                className="p-2.5 bg-gray-800/80 hover:bg-gray-700 text-white rounded-lg transition-colors"
                title={isFullscreen ? "Exit Fullscreen (ESC)" : "Enter Fullscreen"}
              >
                {isFullscreen ? <FiMinimize2 size={20} /> : <FiMaximize2 size={20} />}
              </button>
              <button
                onClick={onClose}
                className="p-2.5 bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors"
                title="Close (ESC)"
              >
                <FiX size={20} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Stats Bar - Conditional */}
      {showOverlay && (
        <div className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 pb-3">
          <div className="flex items-center justify-between">
            {/* Live Detections */}
            <div className="flex items-center gap-4">
              <span className="text-gray-300 text-sm font-medium">Live Detections:</span>
              {detections.details.length === 0 ? (
                <span className="text-gray-500 text-sm italic">No detections</span>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {detections.details.slice(0, 10).map((det, idx) => (
                    <span
                      key={idx}
                      className={`text-xs px-3 py-1.5 rounded-full font-medium ${
                        det.is_violation
                          ? 'bg-red-500/30 text-red-300 border border-red-500/50'
                          : det.is_compliance
                          ? 'bg-green-500/30 text-green-300 border border-green-500/50'
                          : 'bg-gray-500/30 text-gray-300 border border-gray-500/50'
                      }`}
                    >
                      {det.class} ({(det.confidence * 100).toFixed(0)}%)
                    </span>
                  ))}
                  {detections.details.length > 10 && (
                    <span className="text-gray-400 text-sm">+{detections.details.length - 10} more</span>
                  )}
                </div>
              )}
            </div>

            {/* Timestamp & Keyboard hint */}
            <div className="flex items-center gap-4">
              <span className="text-gray-500 text-xs">Press H to hide UI</span>
              <span className="text-gray-300 text-sm font-mono bg-black/50 px-3 py-1 rounded">
                {new Date().toLocaleTimeString()}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Detection Legend - Conditional */}
      {showOverlay && (
        <div className="absolute bottom-20 right-4 z-20 bg-black/70 backdrop-blur-sm p-3 rounded-lg text-xs border border-gray-700">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-red-500 rounded"></span>
              <span className="text-gray-200">Violation (Missing PPE)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-green-500 rounded"></span>
              <span className="text-gray-200">Compliant (PPE Detected)</span>
            </div>
          </div>
        </div>
      )}

      {/* Close button always visible when overlay is hidden */}
      {!showOverlay && (
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-30 p-2.5 bg-red-600/80 hover:bg-red-600 text-white rounded-lg transition-colors"
          title="Close (ESC)"
        >
          <FiX size={20} />
        </button>
      )}
    </div>
  );
};

// Error details modal
const ErrorModal = ({ error, onClose }) => (
  <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
    <div className="bg-gray-800 rounded-xl max-w-2xl w-full border border-gray-700 shadow-2xl">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start gap-3 mb-4">
          <div className="p-2 bg-red-500/20 rounded-lg">
            <FiAlertCircle className="text-red-500" size={24} />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-white mb-1">
              {error.title || "Camera Error"}
            </h3>
            <p className="text-gray-400 text-sm">{error.message}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <FiX className="text-gray-400" size={20} />
          </button>
        </div>

        {/* Error Details */}
        {error.details && (
          <div className="bg-gray-900/50 rounded-lg p-4 mb-4 border border-gray-700">
            <h4 className="text-white font-medium mb-2 text-sm">Technical Details:</h4>
            <p className="text-gray-400 text-sm font-mono">{error.details}</p>
          </div>
        )}

        {/* Recommendations */}
        {error.recommendations && error.recommendations.length > 0 && (
          <div className="bg-blue-500/10 rounded-lg p-4 mb-4 border border-blue-500/20">
            <h4 className="text-blue-400 font-medium mb-2 text-sm flex items-center gap-2">
              <span>💡</span> What to try:
            </h4>
            <ul className="space-y-2">
              {error.recommendations.map((rec, idx) => (
                <li key={idx} className="text-gray-300 text-sm flex items-start gap-2">
                  <span className="text-blue-400 mt-0.5">•</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors font-medium"
          >
            Close
          </button>
          {error.retryAction && (
            <button
              onClick={() => {
                error.retryAction();
                onClose();
              }}
              className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
            >
              Try Again
            </button>
          )}
        </div>
      </div>
    </div>
  </div>
);

// Camera card component
const CameraCard = ({ camera, onStart, onStop, actionLoading, onNavigate, onFullscreen }) => {
  const [detections, setDetections] = useState({ violations: 0, compliances: 0 });
  const isOnline = camera.status === "online";
  const [streamKey, setStreamKey] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setStreamKey(Date.now());
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // Poll for detections when camera is online
  useEffect(() => {
    if (!isOnline) return;
    
    const fetchDetections = async () => {
      const result = await getCameraDetections(camera.id);
      if (result.success && result.data) {
        setDetections({
          violations: result.data.violation_count || 0,
          compliances: result.data.compliance_count || 0
        });
      }
    };
    
    fetchDetections();
    const interval = setInterval(fetchDetections, 3000);
    return () => clearInterval(interval);
  }, [camera.id, isOnline]);

  return (
    <div className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700 hover:border-gray-600 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/5">
      {/* Camera Header */}
      <div className="p-3 flex items-center justify-between bg-gray-800/50 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              isOnline ? "bg-green-500 animate-pulse" : "bg-red-500"
            }`}
          />
          <span className="text-white font-medium text-sm truncate max-w-[150px]">
            {camera.name}
          </span>
        </div>
        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
          isOnline 
            ? "bg-green-500/20 text-green-400 border border-green-500/30" 
            : "bg-red-500/20 text-red-400 border border-red-500/30"
        }`}>
          {camera.status}
        </span>
      </div>

      {/* Video Stream or Offline Placeholder */}
      <div 
        className="relative bg-gray-900 cursor-pointer group" 
        style={{ aspectRatio: "16/9" }}
        onClick={() => isOnline && onFullscreen(camera)}
      >
        {isOnline ? (
          <>
            <img
              key={`${camera.id}-${streamKey}`}
              src={`${getStreamUrl(camera.id)}?t=${streamKey}`}
              alt={camera.name}
              className="w-full h-full object-cover"
              style={{ display: 'block' }}
            />
            
            {/* Fullscreen overlay on hover */}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
                <FiMaximize2 size={32} className="text-white" />
              </div>
              <span className="absolute bottom-4 text-white text-sm font-medium">
                Click for Fullscreen
              </span>
            </div>

            <DetectionIndicator 
              violations={detections.violations} 
              compliances={detections.compliances} 
            />
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500">
            <FiCamera size={40} className="mb-2 opacity-30" />
            <p className="text-sm font-medium">Camera Offline</p>
            <p className="text-xs text-gray-600 mt-1">Click Start to connect</p>
          </div>
        )}
        
        {/* Location overlay */}
        {camera.location && isOnline && (
          <div className="absolute bottom-2 left-2 z-10">
            <span className="text-xs bg-black/70 text-white px-2 py-1 rounded-md backdrop-blur-sm">
              📍 {camera.location}
            </span>
          </div>
        )}
      </div>

      {/* Camera Info & Controls */}
      <div className="p-3 space-y-3">
        {/* Stats row */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex gap-3">
            <span className="text-red-400" title="Total Violations">
              ⚠️ {camera.violation_count || 0}
            </span>
            <span className="text-green-400" title="Compliant Detections">
              ✓ {camera.compliance_count || 0}
            </span>
          </div>
          {camera.last_active && (
            <span className="text-gray-500">
              {new Date(camera.last_active).toLocaleTimeString()}
            </span>
          )}
        </div>
        
        {/* Action buttons */}
        <div className="flex gap-2">
          {isOnline ? (
            <button
              onClick={(e) => { e.stopPropagation(); onStop(camera.id); }}
              disabled={actionLoading[camera.id] === "stopping"}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiSquare size={14} />
              {actionLoading[camera.id] === "stopping" ? "Stopping..." : "Stop"}
            </button>
          ) : (
            <button
              onClick={(e) => { e.stopPropagation(); onStart(camera.id); }}
              disabled={actionLoading[camera.id] === "starting"}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiPlay size={14} />
              {actionLoading[camera.id] === "starting" ? "Starting..." : "Start"}
            </button>
          )}
          <button
            onClick={(e) => { e.stopPropagation(); isOnline && onFullscreen(camera); }}
            disabled={!isOnline}
            className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Fullscreen View"
          >
            <FiMaximize2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default function Dashboard() {
  const { data, loading, startCamera, stopCamera, refresh } = useDashboard();
  const navigate = useNavigate();
  const [actionLoading, setActionLoading] = useState({});
  const [toasts, setToasts] = useState([]);
  const [errorModal, setErrorModal] = useState(null);
  const [fullscreenCamera, setFullscreenCamera] = useState(null);

  // Toast management
  const addToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => removeToast(id), 5000);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Parse error response
  const parseError = (error, cameraId, action) => {
    let errorInfo = {
      title: `Failed to ${action} camera`,
      message: "An unexpected error occurred",
      details: null,
      recommendations: []
    };

    if (typeof error === 'string') {
      errorInfo.message = error;
    } else if (error?.response?.data) {
      const data = error.response.data;
      const status = error.response.status;
      
      if (status === 503) {
        errorInfo.title = "Camera Offline";
        errorInfo.message = data.detail?.message || data.message || `Camera '${cameraId}' is not reachable`;
        errorInfo.details = data.detail?.error || data.error;
        errorInfo.recommendations = [
          "Check if the camera is powered on",
          "Verify network connection to the camera",
          "Confirm the RTSP URL is correct",
          "Try pinging the camera IP address"
        ];
      } else if (status === 400) {
        errorInfo.title = "Camera Already Active";
        errorInfo.message = data.detail || `Camera '${cameraId}' is already running`;
        errorInfo.recommendations = [
          "Refresh the page to see current status",
          "Try stopping the camera first"
        ];
      } else if (status === 404) {
        errorInfo.title = "Camera Not Found";
        errorInfo.message = data.detail || `Camera '${cameraId}' not found`;
        errorInfo.recommendations = [
          "Verify the camera configuration exists",
          "Go to Settings to add the camera"
        ];
      } else if (status >= 500) {
        errorInfo.title = "Server Error";
        errorInfo.message = data.detail || "Backend server error";
        errorInfo.details = error.message;
        errorInfo.recommendations = [
          "Wait a moment and try again",
          "Check if the backend server is running"
        ];
      } else {
        errorInfo.message = data.detail || data.message || error.message;
      }
    } else if (error?.message) {
      errorInfo.message = error.message;
      
      if (error.message.includes('Network Error')) {
        errorInfo.title = "Connection Error";
        errorInfo.message = "Cannot connect to backend server";
        errorInfo.recommendations = [
          "Check if backend server is running (python main.py)",
          "Verify server is accessible at the configured URL"
        ];
      }
    }

    return errorInfo;
  };

  // Camera start handler
  const handleStartCamera = async (cameraId) => {
    setActionLoading(prev => ({ ...prev, [cameraId]: "starting" }));
    
    try {
      const result = await startCamera(cameraId);
      
      if (result.success) {
        addToast(`Camera '${cameraId}' started successfully`, 'success');
      } else {
        const errorInfo = parseError(result.error, cameraId, 'start');
        errorInfo.retryAction = () => handleStartCamera(cameraId);
        setErrorModal(errorInfo);
        addToast(errorInfo.message, 'error');
      }
    } catch (error) {
      const errorInfo = parseError(error, cameraId, 'start');
      errorInfo.retryAction = () => handleStartCamera(cameraId);
      setErrorModal(errorInfo);
      addToast(errorInfo.message, 'error');
    } finally {
      setActionLoading(prev => ({ ...prev, [cameraId]: null }));
    }
  };

  // Camera stop handler
  const handleStopCamera = async (cameraId) => {
    setActionLoading(prev => ({ ...prev, [cameraId]: "stopping" }));
    
    try {
      const result = await stopCamera(cameraId);
      
      if (result.success) {
        addToast(`Camera '${cameraId}' stopped successfully`, 'success');
        // Close fullscreen if this camera was in fullscreen
        if (fullscreenCamera?.id === cameraId) {
          setFullscreenCamera(null);
        }
      } else {
        const errorInfo = parseError(result.error, cameraId, 'stop');
        errorInfo.retryAction = () => handleStopCamera(cameraId);
        setErrorModal(errorInfo);
        addToast(errorInfo.message, 'error');
      }
    } catch (error) {
      const errorInfo = parseError(error, cameraId, 'stop');
      errorInfo.retryAction = () => handleStopCamera(cameraId);
      setErrorModal(errorInfo);
      addToast(errorInfo.message, 'error');
    } finally {
      setActionLoading(prev => ({ ...prev, [cameraId]: null }));
    }
  };

  // Refresh handler
  const handleRefresh = async () => {
    try {
      await refresh();
      addToast('Dashboard refreshed', 'success');
    } catch (error) {
      addToast('Failed to refresh dashboard', 'error');
    }
  };

  // Open fullscreen view
  const handleFullscreen = (camera) => {
    setFullscreenCamera(camera);
  };

  // Loading state
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
    systemHealthPercent: 100,
  };

  return (
    <div className="flex h-screen bg-gray-900">
      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      {/* Error Modal */}
      {errorModal && (
        <ErrorModal error={errorModal} onClose={() => setErrorModal(null)} />
      )}

      {/* Fullscreen Camera Modal */}
      {fullscreenCamera && (
        <FullscreenCameraModal 
          camera={fullscreenCamera} 
          onClose={() => setFullscreenCamera(null)} 
        />
      )}

      {/* Left Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Center Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white mb-1">Control Dashboard</h1>
                <p className="text-gray-400">Monitor cameras, incidents, and PPE compliance in real-time</p>
              </div>
              <button
                onClick={handleRefresh}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                title="Refresh Dashboard"
              >
                <FiRefreshCw size={20} className="text-gray-400" />
              </button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Active Cameras */}
            <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700 hover:border-green-500/30 transition-colors">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-500/20 rounded-xl">
                  <FiCamera size={24} className="text-green-500" />
                </div>
                <div>
                  <div className="text-gray-400 text-sm">Active Cameras</div>
                  <div className="text-3xl font-bold text-white">{stats.activeCameras}</div>
                  <div className="text-xs text-gray-500">of {stats.totalCameras} total</div>
                </div>
              </div>
            </div>

            {/* PPE Violations Today */}
            <div 
              className="bg-gray-800/50 rounded-xl p-5 border border-gray-700 hover:border-red-500/30 transition-colors cursor-pointer group"
              onClick={() => navigate("/ppe-violations")}
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-red-500/20 rounded-xl group-hover:bg-red-500/30 transition-colors">
                  <FiAlertTriangle size={24} className="text-red-500" />
                </div>
                <div>
                  <div className="text-gray-400 text-sm">Violations Today</div>
                  <div className="text-3xl font-bold text-white">{stats.ppeViolationsToday}</div>
                  <div className="text-xs text-blue-400 group-hover:text-blue-300">Click to view →</div>
                </div>
              </div>
            </div>

            {/* Compliant Detections */}
            <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700 hover:border-green-500/30 transition-colors">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-500/20 rounded-xl">
                  <FiCheckCircle size={24} className="text-green-500" />
                </div>
                <div>
                  <div className="text-gray-400 text-sm">Compliant</div>
                  <div className="text-3xl font-bold text-white">{stats.compliantToday || 0}</div>
                  <div className="text-xs text-gray-500">PPE detected</div>
                </div>
              </div>
            </div>

            {/* System Health */}
            <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700 hover:border-blue-500/30 transition-colors">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-500/20 rounded-xl">
                  <FiActivity size={24} className="text-blue-500" />
                </div>
                <div>
                  <div className="text-gray-400 text-sm">System Health</div>
                  <div className="text-3xl font-bold text-white">{stats.systemHealthPercent}%</div>
                  <div className="text-xs text-green-400">All systems operational</div>
                </div>
              </div>
            </div>
          </div>

          {/* Live Camera Feeds */}
          <div className="bg-gray-800/30 rounded-xl border border-gray-700 mb-6">
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <FiCamera className="text-blue-500" />
                Live Camera Feeds
                <span className="text-sm font-normal text-gray-400 ml-2">(Click to view fullscreen)</span>
              </h2>
              <div className="flex gap-4 text-sm">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span className="text-green-400">Active: {stats.activeCameras}</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                  <span className="text-red-400">Inactive: {stats.inactiveCameras}</span>
                </span>
              </div>
            </div>

            <div className="p-4">
              {data.cameras.length === 0 ? (
                <div className="text-center py-16">
                  <FiCamera size={56} className="mx-auto text-gray-600 mb-4" />
                  <p className="text-gray-400 text-lg mb-4">No cameras configured</p>
                  <AddCameraButton />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {data.cameras.map((camera) => (
                    <CameraCard
                      key={camera.id}
                      camera={camera}
                      onStart={handleStartCamera}
                      onStop={handleStopCamera}
                      actionLoading={actionLoading}
                      onNavigate={navigate}
                      onFullscreen={handleFullscreen}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => navigate("/ppe-violations")}
              className="bg-gray-800/50 rounded-xl p-6 border border-gray-700 hover:border-yellow-500/50 hover:bg-gray-800/80 transition-all cursor-pointer text-center group"
            >
              <FiAlertTriangle size={36} className="mx-auto text-yellow-500 mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="text-white font-semibold mb-1">View Violations</h3>
              <p className="text-gray-400 text-sm">Review PPE compliance violations</p>
            </button>

            <button
              onClick={() => navigate("/playback")}
              className="bg-gray-800/50 rounded-xl p-6 border border-gray-700 hover:border-blue-500/50 hover:bg-gray-800/80 transition-all cursor-pointer text-center group"
            >
              <FiCamera size={36} className="mx-auto text-blue-500 mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="text-white font-semibold mb-1">Live Feeds</h3>
              <p className="text-gray-400 text-sm">Monitor camera feeds in real-time</p>
            </button>

            <button
              onClick={() => navigate("/settings")}
              className="bg-gray-800/50 rounded-xl p-6 border border-gray-700 hover:border-green-500/50 hover:bg-gray-800/80 transition-all cursor-pointer text-center group"
            >
              <FiActivity size={36} className="mx-auto text-green-500 mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="text-white font-semibold mb-1">Settings</h3>
              <p className="text-gray-400 text-sm">Configure cameras and system</p>
            </button>
          </div>
        </div>

        {/* Right Sidebar - Camera Controls */}
        <div className="w-80 flex-shrink-0 border-l border-gray-800 bg-gray-900/50 p-4 overflow-y-auto">
          <div className="sticky top-0">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">Camera Controls</h3>
              <button
                onClick={handleRefresh}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                title="Refresh"
              >
                <FiRefreshCw size={16} className="text-gray-400" />
              </button>
            </div>

            {/* Add Camera Button */}
            <AddCameraButton onCameraAdded={handleRefresh} />

            {/* Camera List */}
            <div className="space-y-2 mt-4">
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
                      className="bg-gray-800 rounded-lg p-3 border border-gray-700 hover:border-gray-600 transition-colors"
                    >
                      {/* Camera Header */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              camera.status === "online" ? "bg-green-500 animate-pulse" : "bg-red-500"
                            }`}
                          />
                          <span className="text-white text-sm font-medium truncate max-w-[120px]">
                            {camera.name}
                          </span>
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          camera.status === "online" 
                            ? "bg-green-500/20 text-green-400" 
                            : "bg-red-500/20 text-red-400"
                        }`}>
                          {camera.status}
                        </span>
                      </div>

                      {/* Camera Info */}
                      {camera.location && (
                        <div className="text-xs text-gray-400 mb-2 truncate">
                          📍 {camera.location}
                        </div>
                      )}

                      {/* Detection Stats */}
                      <div className="flex gap-2 text-xs mb-2">
                        <span className="text-red-400">⚠️ {camera.violation_count || 0}</span>
                        <span className="text-green-400">✓ {camera.compliance_count || 0}</span>
                      </div>

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
                          onClick={() => camera.status === "online" && handleFullscreen(camera)}
                          disabled={camera.status !== "online"}
                          className="px-2 py-1.5 bg-gray-700 hover:bg-gray-600 text-white rounded text-xs transition-colors disabled:opacity-50"
                          title="Fullscreen"
                        >
                          <FiMaximize2 size={12} />
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
                  <div className="bg-green-500/10 p-3 rounded-lg border border-green-500/20">
                    <div className="text-green-400 font-bold text-lg">{stats.activeCameras}</div>
                    <div className="text-gray-400">Active</div>
                  </div>
                  <div className="bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                    <div className="text-red-400 font-bold text-lg">{stats.inactiveCameras}</div>
                    <div className="text-gray-400">Inactive</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}