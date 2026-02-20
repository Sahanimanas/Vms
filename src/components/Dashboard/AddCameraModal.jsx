import React, { useState } from 'react';
import { FiX, FiCamera, FiAlertCircle, FiCheckCircle, FiLoader, FiWifi, FiWifiOff, FiPlay } from 'react-icons/fi';

const FASTAPI_BASE = import.meta.env.VITE_FASTAPI_BASE || "http://localhost:9000";

const AddCameraModal = ({ isOpen, onClose, onCameraAdded }) => {
  const [formData, setFormData] = useState({
    camera_id: '',
    camera_name: '',
    ip: '',
    port: '554',
    username: '',
    password: '',
    streamPath: '/live',
    location: '',
    confidence_threshold: 0.5,
  });
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [connectionTest, setConnectionTest] = useState(null);
  const [autoStart, setAutoStart] = useState(true);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
    setSuccess('');
    setConnectionTest(null);
  };

  const generateRTSPUrl = () => {
    const { username, password, ip, port, streamPath } = formData;
    
    if (!ip) return 'rtsp://[IP_ADDRESS]:[PORT][PATH]';
    
    const auth = username && password ? `${username}:${password}@` : '';
    const portStr = port || '554';
    const path = streamPath || '/live';
    return `rtsp://${auth}${ip}:${portStr}${path}`;
  };

  // Test connection before saving
  const handleTestConnection = async () => {
    if (!formData.ip) {
      setError('Please enter IP address first');
      return;
    }

    setTesting(true);
    setError('');
    setConnectionTest(null);

    try {
      const rtspUrl = generateRTSPUrl();
      const response = await fetch(`${FASTAPI_BASE}/cameras/test-connection?rtsp_url=${encodeURIComponent(rtspUrl)}`, {
        method: 'POST'
      });
      const data = await response.json();

      if (data.success) {
        setConnectionTest({
          status: 'success',
          message: data.message,
          frameSize: data.frame_size
        });
        setSuccess('Camera is online and reachable');
      } else {
        setConnectionTest({
          status: 'error',
          message: data.message || 'Camera is not reachable',
        });
        setError(`Connection failed: ${data.message || 'Unknown error'}`);
      }
    } catch (err) {
      const errorMsg = err.message || 'Connection test failed';
      setConnectionTest({
        status: 'error',
        message: errorMsg,
      });
      setError(errorMsg);
    } finally {
      setTesting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.camera_id || !formData.ip) {
      setError('Camera ID and IP address are required');
      return;
    }

    // Clean camera_id (remove spaces and special chars)
    const cleanCameraId = formData.camera_id.trim().replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_-]/g, '');
    
    if (cleanCameraId !== formData.camera_id.trim()) {
      setFormData(prev => ({ ...prev, camera_id: cleanCameraId }));
      setError(`Camera ID cleaned to: "${cleanCameraId}". Please submit again to confirm.`);
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const rtspUrl = generateRTSPUrl();

      // Step 1: Save camera configuration
      const saveResponse = await fetch(`${FASTAPI_BASE}/cameras/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          camera_id: cleanCameraId,
          rtsp_url: rtspUrl,
          camera_name: formData.camera_name || cleanCameraId,
          location: formData.location,
          confidence_threshold: parseFloat(formData.confidence_threshold) || 0.5,
        })
      });

      if (!saveResponse.ok) {
        const errorData = await saveResponse.json();
        throw new Error(errorData.detail || 'Failed to save camera configuration');
      }

      setSuccess('Camera configuration saved successfully');

      // Step 2: Optionally start the camera
      if (autoStart) {
        try {
          const startResponse = await fetch(`${FASTAPI_BASE}/cameras/check-and-start/${encodeURIComponent(cleanCameraId)}`, {
            method: 'POST'
          });
          
          if (startResponse.ok) {
            const startData = await startResponse.json();
            setSuccess(`Camera saved and ${startData.status === 'started' ? 'started' : 'activated'} successfully!`);
          } else {
            setSuccess('Camera saved, but failed to start stream. You can start it manually from the dashboard.');
          }
        } catch (startErr) {
          setSuccess('Camera saved, but failed to start stream. You can start it manually.');
          console.warn('Camera start error:', startErr);
        }
      } else {
        setSuccess('Camera configuration saved! You can start it from the dashboard.');
      }

      // Notify parent and close after delay
      setTimeout(() => {
        onCameraAdded?.();
        onClose();
        resetForm();
      }, 1500);

    } catch (err) {
      console.error('Error adding camera:', err);
      setError(err.message || 'Failed to add camera');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      camera_id: '',
      camera_name: '',
      ip: '',
      port: '554',
      username: '',
      password: '',
      streamPath: '/live',
      location: '',
      confidence_threshold: 0.5,
    });
    setError('');
    setSuccess('');
    setConnectionTest(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-lg mx-4 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-gray-700 bg-gray-900">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <FiCamera className="w-5 h-5 text-blue-400" />
            </div>
            <h2 className="text-lg font-semibold text-white">Add RTSP Camera</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Camera ID & Name */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Camera ID <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                name="camera_id"
                value={formData.camera_id}
                onChange={handleChange}
                placeholder="cam001"
                className="w-full px-3 py-2.5 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              />
              <p className="text-xs text-gray-500 mt-1">No spaces allowed</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Display Name
              </label>
              <input
                type="text"
                name="camera_name"
                value={formData.camera_name}
                onChange={handleChange}
                placeholder="Entrance Camera"
                className="w-full px-3 py-2.5 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              />
            </div>
          </div>

          {/* IP & Port */}
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                IP Address <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                name="ip"
                value={formData.ip}
                onChange={handleChange}
                placeholder="192.168.1.100"
                className="w-full px-3 py-2.5 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Port
              </label>
              <input
                type="text"
                name="port"
                value={formData.port}
                onChange={handleChange}
                placeholder="554"
                className="w-full px-3 py-2.5 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              />
            </div>
          </div>

          {/* Credentials */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Username
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="admin"
                autoComplete="off"
                className="w-full px-3 py-2.5 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                autoComplete="new-password"
                className="w-full px-3 py-2.5 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              />
            </div>
          </div>

          {/* Stream Path & Location */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Stream Path
              </label>
              <input
                type="text"
                name="streamPath"
                value={formData.streamPath}
                onChange={handleChange}
                placeholder="/live"
                className="w-full px-3 py-2.5 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Location
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Main Entrance"
                className="w-full px-3 py-2.5 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              />
            </div>
          </div>

          {/* Confidence Threshold */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              Detection Confidence: <span className="text-blue-400">{(formData.confidence_threshold * 100).toFixed(0)}%</span>
            </label>
            <input
              type="range"
              name="confidence_threshold"
              min="0.1"
              max="1.0"
              step="0.05"
              value={formData.confidence_threshold}
              onChange={handleChange}
              className="w-full accent-blue-500"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>10% (More detections)</span>
              <span>100% (Higher accuracy)</span>
            </div>
          </div>

          {/* Generated URL Preview */}
          <div className="p-3 bg-gray-800/50 border border-gray-700 rounded-lg">
            <label className="block text-xs font-medium text-gray-400 mb-1">
              Generated RTSP URL
            </label>
            <code className="text-sm text-blue-400 break-all font-mono">
              {generateRTSPUrl()}
            </code>
          </div>

          {/* Test Connection Button */}
          <button
            type="button"
            onClick={handleTestConnection}
            disabled={testing || !formData.ip}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed border border-gray-600 text-white rounded-lg transition-colors"
          >
            {testing ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Testing Connection...
              </>
            ) : connectionTest?.status === 'success' ? (
              <>
                <FiWifi className="w-4 h-4 text-green-400" />
                Connection Verified
              </>
            ) : connectionTest?.status === 'error' ? (
              <>
                <FiWifiOff className="w-4 h-4 text-red-400" />
                Test Failed - Try Again
              </>
            ) : (
              <>
                <FiWifi className="w-4 h-4" />
                Test Connection
              </>
            )}
          </button>

          {/* Connection Test Result */}
          {connectionTest && (
            <div className={`flex items-start gap-2 p-3 rounded-lg text-sm ${
              connectionTest.status === 'success' 
                ? 'bg-green-500/10 border border-green-500/30 text-green-400' 
                : 'bg-red-500/10 border border-red-500/30 text-red-400'
            }`}>
              {connectionTest.status === 'success' ? (
                <FiCheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              ) : (
                <FiAlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              )}
              <div>
                <span>{connectionTest.message}</span>
                {connectionTest.frameSize && (
                  <div className="text-xs opacity-75 mt-1">
                    Frame size: {connectionTest.frameSize.width}x{connectionTest.frameSize.height}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Auto-start toggle */}
          <label className="flex items-center gap-3 cursor-pointer p-3 bg-gray-800/50 border border-gray-700 rounded-lg hover:bg-gray-800 transition-colors">
            <input
              type="checkbox"
              checked={autoStart}
              onChange={(e) => setAutoStart(e.target.checked)}
              className="w-4 h-4 accent-blue-500 rounded"
            />
            <div className="flex items-center gap-2">
              <FiPlay size={14} className="text-green-400" />
              <span className="text-sm text-gray-300">
                Start camera stream automatically after saving
              </span>
            </div>
          </label>

          {/* Success Message */}
          {success && (
            <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400 text-sm">
              <FiCheckCircle className="w-4 h-4 flex-shrink-0" />
              {success}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
              <FiAlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <div className="flex-1 whitespace-pre-line">{error}</div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-700">
            <button
              type="button"
              onClick={() => { onClose(); resetForm(); }}
              disabled={loading}
              className="px-4 py-2.5 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !formData.camera_id || !formData.ip}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Adding Camera...
                </>
              ) : (
                <>
                  <FiCamera className="w-4 h-4" />
                  Add Camera
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCameraModal;