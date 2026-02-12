import React, { useState } from 'react';
import { X, Camera, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import axios from 'axios';
const AddCameraModal = ({ isOpen, onClose, onCameraAdded }) => {
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    ip: '',
    port: '554',
    username: '',
    password: '',
    streamPath: '/live'
  });
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
    setTestResult(null);
  };

  const generateRTSPUrl = () => {
    const { username, password, ip, port, streamPath } = formData;
    const auth = username && password ? `${username}:${password}@` : '';
    return `rtsp://${auth}${ip}:${port}${streamPath}`;
  };
   const API = import.meta.env.VITE_API_BASE || "http://localhost:4000/api";
  const testConnection = async () => {
    if (!formData.ip) {
      setError('IP address is required');
      return;
    }

    setTesting(true);
    setTestResult(null);

    try {
      const response = await axios.post(
        `${API}/cameras/test`,
        { 
          ip: formData.ip, 
          port: parseInt(formData.port) || 554 
        },
        {
          headers: { 'Content-Type': 'application/json' }
        }
      );
      
      setTestResult(response.data.online ? 'success' : 'failed');
    } catch (err) {
      setTestResult('failed');
    } finally {
      setTesting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.id || !formData.ip) {
      setError('Camera ID and IP address are required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await axios.post(
        `${API}/cameras`,
        {
          id: formData.id,
          name: formData.name || formData.id,
          ip: formData.ip,
          username: formData.username,
          password: formData.password,
          rtspUrl: generateRTSPUrl()
        },
        {
          headers: { 'Content-Type': 'application/json' }
        }
      );

      onCameraAdded?.(response.data);
      onClose();
      resetForm();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      id: '',
      name: '',
      ip: '',
      port: '554',
      username: '',
      password: '',
      streamPath: '/live'
    });
    setError('');
    setTestResult(null);
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
      <div className="relative w-full max-w-lg mx-4 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-cyan-500/20 rounded-lg">
              <Camera className="w-5 h-5 text-cyan-400" />
            </div>
            <h2 className="text-lg font-semibold text-white">Add RTSP Camera</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Camera ID & Name */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Camera ID <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                name="id"
                value={formData.id}
                onChange={handleChange}
                placeholder="cam-001"
                className="w-full px-3 py-2.5 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Display Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Entrance Camera"
                className="w-full px-3 py-2.5 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
              />
            </div>
          </div>

          {/* IP & Port */}
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                IP Address <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                name="ip"
                value={formData.ip}
                onChange={handleChange}
                placeholder="192.168.1.100"
                className="w-full px-3 py-2.5 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                RTSP Port
              </label>
              <input
                type="text"
                name="port"
                value={formData.port}
                onChange={handleChange}
                placeholder="554"
                className="w-full px-3 py-2.5 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
              />
            </div>
          </div>

          {/* Credentials */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Username
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="admin"
                className="w-full px-3 py-2.5 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full px-3 py-2.5 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
              />
            </div>
          </div>

          {/* Stream Path */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Stream Path
            </label>
            <input
              type="text"
              name="streamPath"
              value={formData.streamPath}
              onChange={handleChange}
              placeholder="/live"
              className="w-full px-3 py-2.5 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
            />
          </div>

          {/* Generated URL Preview */}
          <div className="p-3 bg-slate-800/50 border border-slate-700 rounded-lg">
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Generated RTSP URL
            </label>
            <code className="text-sm text-cyan-400 break-all">
              {generateRTSPUrl()}
            </code>
          </div>

          {/* Test Connection */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={testConnection}
              disabled={testing || !formData.ip}
              className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
            >
              {testing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Camera className="w-4 h-4" />
              )}
              Test Connection
            </button>
            
            {testResult === 'success' && (
              <span className="flex items-center gap-1.5 text-sm text-green-400">
                <CheckCircle2 className="w-4 h-4" />
                Camera is reachable
              </span>
            )}
            {testResult === 'failed' && (
              <span className="flex items-center gap-1.5 text-sm text-red-400">
                <AlertCircle className="w-4 h-4" />
                Connection failed
              </span>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-700">
            <button
              type="button"
              onClick={() => { onClose(); resetForm(); }}
              className="px-4 py-2.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Add Camera
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCameraModal;