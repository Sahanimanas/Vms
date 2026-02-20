import { useEffect, useState } from "react";
import { FiEye, FiTrash2, FiRefreshCw, FiDownload, FiCamera, FiAlertTriangle, FiX, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import Sidebar from "../components/Sidebar";

const FASTAPI_BASE = import.meta.env.VITE_FASTAPI_BASE || "http://localhost:9000";

// Severity badge component
const SeverityBadge = ({ severity }) => {
  const styles = {
    critical: "bg-red-500/20 text-red-400 border-red-500/30",
    high: "bg-orange-500/20 text-orange-400 border-orange-500/30",
    medium: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    low: "bg-green-500/20 text-green-400 border-green-500/30"
  };

  return (
    <span className={`text-xs px-2.5 py-1 rounded-full font-medium border ${styles[severity] || styles.low}`}>
      {severity}
    </span>
  );
};

// Detection item component
const DetectionItem = ({ detection }) => {
  const isViolation = detection.is_violation;
  
  return (
    <div className={`flex justify-between items-center p-3 rounded-lg ${
      isViolation ? 'bg-red-500/10 border border-red-500/20' : 'bg-green-500/10 border border-green-500/20'
    }`}>
      <div className="flex items-center gap-3">
        <span className={`text-lg ${isViolation ? 'text-red-400' : 'text-green-400'}`}>
          {isViolation ? '⚠️' : '✓'}
        </span>
        <div>
          <span className="text-white font-medium">{detection.class}</span>
          <span className="text-gray-400 text-sm ml-2">
            ({(detection.confidence * 100).toFixed(1)}%)
          </span>
        </div>
      </div>
      <div className="text-gray-500 text-xs">
        {detection.bbox?.width}×{detection.bbox?.height}px
      </div>
    </div>
  );
};

// Violation detail modal
const ViolationModal = ({ violation, onClose, onDelete }) => {
  if (!violation) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden border border-gray-700 shadow-2xl">
        {/* Header */}
        <div className="flex justify-between items-start p-6 border-b border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">Violation Details</h2>
            <p className="text-gray-400">
              {violation.date} at {violation.time}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onDelete(violation.id)}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              <FiTrash2 size={16} />
              Delete
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <FiX size={24} className="text-gray-400" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          {/* Image */}
          <div className="mb-6 rounded-xl overflow-hidden border border-gray-700">
            <img
              src={`${FASTAPI_BASE}/violation-images/${violation.image_path}`}
              alt="Violation"
              className="w-full"
            />
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-700/50 p-4 rounded-xl border border-gray-600">
              <div className="text-gray-400 text-sm mb-1">Camera</div>
              <div className="text-white font-medium">{violation.camera_name}</div>
            </div>
            <div className="bg-gray-700/50 p-4 rounded-xl border border-gray-600">
              <div className="text-gray-400 text-sm mb-1">Location</div>
              <div className="text-white font-medium">{violation.location}</div>
            </div>
            <div className="bg-gray-700/50 p-4 rounded-xl border border-gray-600">
              <div className="text-gray-400 text-sm mb-1">Severity</div>
              <SeverityBadge severity={violation.severity} />
            </div>
            <div className="bg-gray-700/50 p-4 rounded-xl border border-gray-600">
              <div className="text-gray-400 text-sm mb-1">Violations</div>
              <div className="text-red-400 font-bold text-xl">{violation.violation_count}</div>
            </div>
          </div>

          {/* Detections List */}
          <div className="bg-gray-700/30 rounded-xl p-4 border border-gray-600">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <FiAlertTriangle className="text-yellow-500" />
              Detected Items ({violation.detections?.length || 0})
            </h3>
            <div className="space-y-2">
              {violation.detections?.map((det, idx) => (
                <DetectionItem key={idx} detection={det} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function PPEViolations() {
  const [violations, setViolations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("today");
  const [cameraFilter, setCameraFilter] = useState("all");
  const [cameras, setCameras] = useState([]);
  const [dateRange, setDateRange] = useState({
    start: new Date().toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const [selectedViolation, setSelectedViolation] = useState(null);
  const [stats, setStats] = useState({ total: 0, today: 0, bySeverity: {} });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Fetch cameras for filter
  useEffect(() => {
    const fetchCameras = async () => {
      try {
        const response = await fetch(`${FASTAPI_BASE}/cameras/saved`);
        const data = await response.json();
        if (data.cameras) {
          setCameras(Object.entries(data.cameras).map(([id, config]) => ({
            id,
            name: config.camera_name || id
          })));
        }
      } catch (error) {
        console.error("Failed to fetch cameras:", error);
      }
    };
    fetchCameras();
  }, []);

  // Fetch violations
  const fetchViolations = async () => {
    setLoading(true);
    try {
      let url = `${FASTAPI_BASE}/violations`;
      
      if (cameraFilter !== "all") {
        url = `${FASTAPI_BASE}/violations/camera/${encodeURIComponent(cameraFilter)}`;
      } else if (filter === "today") {
        url = `${FASTAPI_BASE}/violations/today`;
      } else if (filter === "custom") {
        url = `${FASTAPI_BASE}/violations/range?start_date=${dateRange.start}&end_date=${dateRange.end}`;
      }

      const response = await fetch(url);
      const data = await response.json();
      setViolations(data.violations || []);
      
      // Fetch stats
      const statsResponse = await fetch(`${FASTAPI_BASE}/violations/stats`);
      const statsData = await statsResponse.json();
      setStats({
        total: statsData.total_violations || 0,
        today: statsData.violations_today || 0,
        bySeverity: statsData.by_severity || {}
      });

    } catch (error) {
      console.error("Failed to fetch violations:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchViolations();
  }, [filter, dateRange, cameraFilter]);

  // Delete violation
  const handleDeleteViolation = async (violationId) => {
    if (!window.confirm("Are you sure you want to delete this violation?")) {
      return;
    }

    try {
      const response = await fetch(`${FASTAPI_BASE}/violations/${violationId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        setSelectedViolation(null);
        await fetchViolations();
      } else {
        alert("Failed to delete violation");
      }
    } catch (error) {
      console.error("Failed to delete violation:", error);
      alert("Failed to delete violation");
    }
  };

  // Export to CSV
  const exportToCSV = () => {
    if (violations.length === 0) {
      alert("No data to export");
      return;
    }

    const headers = ["Date", "Time", "Camera", "Location", "Violations", "Total Detections", "Severity"];
    const rows = violations.map(v => [
      v.date,
      v.time,
      v.camera_name,
      v.location,
      v.violation_count,
      v.total_detections,
      v.severity
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ppe_violations_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  // Pagination
  const totalPages = Math.ceil(violations.length / itemsPerPage);
  const paginatedViolations = violations.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="flex h-screen bg-gray-900">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Violation Modal */}
      {selectedViolation && (
        <ViolationModal 
          violation={selectedViolation} 
          onClose={() => setSelectedViolation(null)}
          onDelete={handleDeleteViolation}
        />
      )}
      
      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-white mb-1">PPE Violations</h1>
            <p className="text-gray-400">Review and manage safety compliance violations</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-yellow-500/20 rounded-xl">
                  <FiAlertTriangle size={24} className="text-yellow-500" />
                </div>
                <div>
                  <div className="text-gray-400 text-sm">Today</div>
                  <div className="text-3xl font-bold text-white">{stats.today}</div>
                </div>
              </div>
            </div>

            <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-red-500/20 rounded-xl">
                  <FiAlertTriangle size={24} className="text-red-500" />
                </div>
                <div>
                  <div className="text-gray-400 text-sm">Total</div>
                  <div className="text-3xl font-bold text-white">{stats.total}</div>
                </div>
              </div>
            </div>

            <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-red-600/20 rounded-xl">
                  <span className="text-2xl">🚨</span>
                </div>
                <div>
                  <div className="text-gray-400 text-sm">Critical</div>
                  <div className="text-3xl font-bold text-red-400">{stats.bySeverity?.critical || 0}</div>
                </div>
              </div>
            </div>

            <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-orange-500/20 rounded-xl">
                  <span className="text-2xl">⚠️</span>
                </div>
                <div>
                  <div className="text-gray-400 text-sm">High</div>
                  <div className="text-3xl font-bold text-orange-400">{stats.bySeverity?.high || 0}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700 mb-6">
            <div className="flex flex-wrap items-center gap-4">
              {/* Time Filter */}
              <div className="flex gap-2">
                {["today", "all", "custom"].map((f) => (
                  <button
                    key={f}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      filter === f 
                        ? "bg-blue-600 text-white" 
                        : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                    }`}
                    onClick={() => {
                      setFilter(f);
                      setCurrentPage(1);
                    }}
                  >
                    {f === "today" ? "Today" : f === "all" ? "All Time" : "Custom"}
                  </button>
                ))}
              </div>

              {/* Date Range */}
              {filter === "custom" && (
                <div className="flex gap-2 items-center">
                  <input
                    type="date"
                    className="px-3 py-2 bg-gray-700 text-white rounded-lg text-sm border border-gray-600 focus:border-blue-500 outline-none"
                    value={dateRange.start}
                    onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                  />
                  <span className="text-gray-400">to</span>
                  <input
                    type="date"
                    className="px-3 py-2 bg-gray-700 text-white rounded-lg text-sm border border-gray-600 focus:border-blue-500 outline-none"
                    value={dateRange.end}
                    onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                  />
                </div>
              )}

              {/* Camera Filter */}
              <div className="flex items-center gap-2">
                <FiCamera className="text-gray-400" />
                <select
                  className="px-3 py-2 bg-gray-700 text-white rounded-lg text-sm border border-gray-600 focus:border-blue-500 outline-none"
                  value={cameraFilter}
                  onChange={(e) => {
                    setCameraFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                >
                  <option value="all">All Cameras</option>
                  {cameras.map((cam) => (
                    <option key={cam.id} value={cam.id}>{cam.name}</option>
                  ))}
                </select>
              </div>

              {/* Action Buttons */}
              <div className="ml-auto flex gap-2">
                <button
                  onClick={exportToCSV}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  <FiDownload size={16} />
                  Export CSV
                </button>
                <button
                  onClick={fetchViolations}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-medium transition-colors"
                  disabled={loading}
                >
                  <FiRefreshCw size={16} className={loading ? "animate-spin" : ""} />
                  Refresh
                </button>
              </div>
            </div>
          </div>

          {/* Violations Table */}
          <div className="bg-gray-800/50 rounded-xl border border-gray-700 overflow-hidden">
            {loading ? (
              <div className="text-center py-16">
                <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
                <p className="text-gray-400 mt-4">Loading violations...</p>
              </div>
            ) : violations.length === 0 ? (
              <div className="text-center py-16">
                <FiAlertTriangle size={48} className="mx-auto text-gray-600 mb-4" />
                <p className="text-gray-400 text-lg">No violations found</p>
                <p className="text-gray-500 text-sm mt-1">Try adjusting your filters</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-800/80">
                      <tr className="border-b border-gray-700">
                        <th className="text-left p-4 text-gray-400 font-medium text-sm">Date/Time</th>
                        <th className="text-left p-4 text-gray-400 font-medium text-sm">Camera</th>
                        <th className="text-left p-4 text-gray-400 font-medium text-sm">Location</th>
                        <th className="text-left p-4 text-gray-400 font-medium text-sm">Violations</th>
                        <th className="text-left p-4 text-gray-400 font-medium text-sm">Severity</th>
                        <th className="text-left p-4 text-gray-400 font-medium text-sm">Preview</th>
                        <th className="text-left p-4 text-gray-400 font-medium text-sm">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedViolations.map((violation) => (
                        <tr 
                          key={violation.id} 
                          className="border-b border-gray-700/50 hover:bg-gray-700/30 transition-colors"
                        >
                          <td className="p-4">
                            <div className="text-white text-sm font-medium">{violation.date}</div>
                            <div className="text-gray-500 text-xs">{violation.time}</div>
                          </td>
                          <td className="p-4 text-gray-300 text-sm">{violation.camera_name}</td>
                          <td className="p-4 text-gray-300 text-sm">{violation.location}</td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <span className="text-red-400 font-bold">{violation.violation_count}</span>
                              <span className="text-gray-500 text-xs">/ {violation.total_detections}</span>
                            </div>
                          </td>
                          <td className="p-4">
                            <SeverityBadge severity={violation.severity} />
                          </td>
                          <td className="p-4">
                            <img
                              src={`${FASTAPI_BASE}/violation-images/${violation.image_path}`}
                              alt="Violation"
                              className="h-12 w-20 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity border border-gray-600"
                              onClick={() => setSelectedViolation(violation)}
                            />
                          </td>
                          <td className="p-4">
                            <div className="flex gap-2">
                              <button
                                onClick={() => setSelectedViolation(violation)}
                                className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                                title="View Details"
                              >
                                <FiEye size={16} />
                              </button>
                              <button
                                onClick={() => handleDeleteViolation(violation.id)}
                                className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                                title="Delete"
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

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between p-4 border-t border-gray-700">
                    <div className="text-gray-400 text-sm">
                      Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, violations.length)} of {violations.length} violations
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="p-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <FiChevronLeft size={18} />
                      </button>
                      <span className="px-4 py-2 bg-gray-700 text-white rounded-lg">
                        {currentPage} / {totalPages}
                      </span>
                      <button
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="p-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <FiChevronRight size={18} />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}