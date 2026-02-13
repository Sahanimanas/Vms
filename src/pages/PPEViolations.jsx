import { useEffect, useState } from "react";
import { FiEye, FiTrash2, FiRefreshCw, FiDownload } from "react-icons/fi";
import axios from "axios";
import Sidebar from "../components/Sidebar";

const FASTAPI_BASE = import.meta.env.VITE_FASTAPI_BASE || "http://localhost:9000";

export default function PPEViolations() {
  const [violations, setViolations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("all"); // all, today, custom
  const [dateRange, setDateRange] = useState({
    start: new Date().toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const [selectedViolation, setSelectedViolation] = useState(null);
  const [stats, setStats] = useState({ total: 0, today: 0 });

  const fetchViolations = async () => {
    setLoading(true);
    try {
      let response;
      
      if (filter === "today") {
        response = await axios.get(`${FASTAPI_BASE}/violations/today`);
      } else if (filter === "custom") {
        response = await axios.get(`${FASTAPI_BASE}/violations/range`, {
          params: {
            start_date: dateRange.start,
            end_date: dateRange.end
          }
        });
      } else {
        response = await axios.get(`${FASTAPI_BASE}/violations`);
      }

      setViolations(response.data.violations || []);
      
      // Fetch stats
      const todayResponse = await axios.get(`${FASTAPI_BASE}/violations/today`);
      const allResponse = await axios.get(`${FASTAPI_BASE}/violations`);
      
      setStats({
        today: todayResponse.data.total || 0,
        total: allResponse.data.total || 0
      });

    } catch (error) {
      console.error("Failed to fetch violations:", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteViolation = async (violationId) => {
    if (!window.confirm("Are you sure you want to delete this violation?")) {
      return;
    }

    try {
      await axios.delete(`${FASTAPI_BASE}/violations/${violationId}`);
      await fetchViolations();
    } catch (error) {
      console.error("Failed to delete violation:", error);
      alert("Failed to delete violation");
    }
  };

  const exportToCSV = () => {
    if (violations.length === 0) {
      alert("No data to export");
      return;
    }

    const headers = ["Date", "Time", "Camera", "Location", "Violations Count", "Severity"];
    const rows = violations.map(v => [
      v.date,
      v.time,
      v.camera_name,
      v.location,
      v.violation_count,
      v.severity
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ppe_violations_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  useEffect(() => {
    fetchViolations();
  }, [filter, dateRange]);

  return (
    <div className="flex h-screen bg-gray-900">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-white mb-2">PPE Violations</h1>
            <p className="text-gray-400">Review and manage safety compliance violations</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-yellow-500/20 rounded-lg">
                  <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div>
                  <div className="text-gray-400 text-sm">Today's Violations</div>
                  <div className="text-2xl font-bold text-white">{stats.today}</div>
                </div>
              </div>
            </div>

            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-red-500/20 rounded-lg">
                  <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div>
                  <div className="text-gray-400 text-sm">Total Violations</div>
                  <div className="text-2xl font-bold text-white">{stats.total}</div>
                </div>
              </div>
            </div>

            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-500/20 rounded-lg">
                  <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <div className="text-gray-400 text-sm">Current Filter</div>
                  <div className="text-lg font-medium text-white capitalize">{filter}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700 mb-6">
            <div className="flex flex-wrap items-center gap-4">
              {/* Filter Buttons */}
              <div className="flex gap-2">
                <button
                  className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                    filter === "all" 
                      ? "bg-blue-600 text-white" 
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  }`}
                  onClick={() => setFilter("all")}
                >
                  All Time
                </button>
                <button
                  className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                    filter === "today" 
                      ? "bg-blue-600 text-white" 
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  }`}
                  onClick={() => setFilter("today")}
                >
                  Today
                </button>
                <button
                  className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                    filter === "custom" 
                      ? "bg-blue-600 text-white" 
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  }`}
                  onClick={() => setFilter("custom")}
                >
                  Custom Range
                </button>
              </div>

              {/* Date Range Inputs */}
              {filter === "custom" && (
                <div className="flex gap-2 items-center">
                  <input
                    type="date"
                    className="px-3 py-2 bg-gray-700 text-white rounded text-sm border border-gray-600 focus:border-blue-500 outline-none"
                    value={dateRange.start}
                    onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                  />
                  <span className="text-gray-400">to</span>
                  <input
                    type="date"
                    className="px-3 py-2 bg-gray-700 text-white rounded text-sm border border-gray-600 focus:border-blue-500 outline-none"
                    value={dateRange.end}
                    onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                  />
                </div>
              )}

              {/* Action Buttons */}
              <div className="ml-auto flex gap-2">
                <button
                  onClick={exportToCSV}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded text-sm font-medium transition-colors"
                >
                  <FiDownload size={16} />
                  Export CSV
                </button>
                <button
                  onClick={fetchViolations}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm font-medium transition-colors"
                  disabled={loading}
                >
                  <FiRefreshCw size={16} className={loading ? "animate-spin" : ""} />
                  Refresh
                </button>
              </div>
            </div>
          </div>

          {/* Violations Table */}
          <div className="bg-gray-800/50 rounded-lg border border-gray-700 overflow-hidden">
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                <p className="text-gray-400 mt-4">Loading violations...</p>
              </div>
            ) : violations.length === 0 ? (
              <div className="text-center py-12">
                <svg className="w-12 h-12 mx-auto text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <p className="text-gray-400">No violations found for the selected period</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-800/80">
                    <tr className="border-b border-gray-700">
                      <th className="text-left p-4 text-gray-400 font-medium text-sm">Date</th>
                      <th className="text-left p-4 text-gray-400 font-medium text-sm">Time</th>
                      <th className="text-left p-4 text-gray-400 font-medium text-sm">Camera</th>
                      <th className="text-left p-4 text-gray-400 font-medium text-sm">Location</th>
                      <th className="text-left p-4 text-gray-400 font-medium text-sm">Violations</th>
                      <th className="text-left p-4 text-gray-400 font-medium text-sm">Severity</th>
                      <th className="text-left p-4 text-gray-400 font-medium text-sm">Preview</th>
                      <th className="text-left p-4 text-gray-400 font-medium text-sm">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {violations.map((violation) => (
                      <tr 
                        key={violation.id} 
                        className="border-b border-gray-700/50 hover:bg-gray-700/30 transition-colors"
                      >
                        <td className="p-4 text-gray-300 text-sm">{violation.date}</td>
                        <td className="p-4 text-gray-300 text-sm">{violation.time}</td>
                        <td className="p-4 text-gray-300 text-sm">{violation.camera_name}</td>
                        <td className="p-4 text-gray-300 text-sm">{violation.location}</td>
                        <td className="p-4">
                          <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs font-medium">
                            {violation.violation_count} items
                          </span>
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            violation.severity === "critical" 
                              ? "bg-red-500/20 text-red-400" 
                              : "bg-orange-500/20 text-orange-400"
                          }`}>
                            {violation.severity}
                          </span>
                        </td>
                        <td className="p-4">
                          <img
                            src={`${FASTAPI_BASE}/violation-images/${violation.image_path}`}
                            alt="Violation"
                            className="h-12 w-20 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity border border-gray-600"
                            onClick={() => setSelectedViolation(violation)}
                          />
                        </td>
                        <td className="p-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => setSelectedViolation(violation)}
                              className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                              title="View Details"
                            >
                              <FiEye size={16} />
                            </button>
                            <button
                              onClick={() => deleteViolation(violation.id)}
                              className="p-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
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
            )}
          </div>
        </div>
      </div>

      {/* Violation Detail Modal */}
      {selectedViolation && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-700">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">Violation Details</h2>
                  <p className="text-gray-400">
                    {selectedViolation.date} at {selectedViolation.time}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedViolation(null)}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
                >
                  Close
                </button>
              </div>

              {/* Image */}
              <div className="mb-6">
                <img
                  src={`${FASTAPI_BASE}/violation-images/${selectedViolation.image_path}`}
                  alt="Violation"
                  className="w-full rounded-lg border border-gray-700"
                />
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-700/50 p-4 rounded border border-gray-600">
                  <div className="text-gray-400 text-sm mb-1">Camera</div>
                  <div className="text-white font-medium">{selectedViolation.camera_name}</div>
                </div>
                <div className="bg-gray-700/50 p-4 rounded border border-gray-600">
                  <div className="text-gray-400 text-sm mb-1">Location</div>
                  <div className="text-white font-medium">{selectedViolation.location}</div>
                </div>
                <div className="bg-gray-700/50 p-4 rounded border border-gray-600">
                  <div className="text-gray-400 text-sm mb-1">Severity</div>
                  <div className="text-white font-medium capitalize">{selectedViolation.severity}</div>
                </div>
                <div className="bg-gray-700/50 p-4 rounded border border-gray-600">
                  <div className="text-gray-400 text-sm mb-1">Total Violations</div>
                  <div className="text-white font-medium">{selectedViolation.violation_count}</div>
                </div>
              </div>

              {/* Detections List */}
              <div className="bg-gray-700/50 p-4 rounded border border-gray-600">
                <h3 className="text-white font-medium mb-3">Detected Violations</h3>
                <div className="space-y-2">
                  {selectedViolation.detections.map((det, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-gray-600/50 p-3 rounded">
                      <div>
                        <span className="text-white font-medium">{det.class}</span>
                        <span className="text-gray-400 text-sm ml-2">
                          ({(det.confidence * 100).toFixed(1)}% confidence)
                        </span>
                      </div>
                      <div className="text-gray-400 text-sm">
                        Position: ({det.center.x}, {det.center.y})
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}