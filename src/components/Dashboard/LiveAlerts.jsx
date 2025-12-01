import React, { useEffect, useState } from "react";
import axios from "axios";

const LiveAlerts = () => {
  const [latest, setLatest] = useState(null);
  const [history, setHistory] = useState([]);
  
  const API = import.meta.env.VITE_API_BASE || "http://localhost:4000/api";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const latestRes = await axios.get(`${API}/latest-alert`);
        setLatest(latestRes.data);

        const historyRes = await axios.get(`${API}/alerts`);
        setHistory(historyRes.data);

      } catch (err) {
        console.error("Failed to load alerts", err);
      }
    };

    fetchData();

    // Optional: Auto refresh every 3 sec
    const timer = setInterval(fetchData, 3000);
    return () => clearInterval(timer);

  }, []);

  return (
    <div className="card">
      <div className="text-sm text-gray-400 mb-2">Live Alerts</div>

      {/* Latest Alert */}
      {latest ? (
        <div className="p-3 rounded-lg bg-gray-900 border border-gray-800 mb-3">
          <div className="text-xs font-semibold text-red-400">
            {latest.severity}
          </div>

          <div className="text-xs text-gray-300 mt-1">
            {latest.message}
          </div>

          <div className="text-xs text-gray-400 mt-1 bg-red-100/10 px-2 py-0.5 inline-block rounded">
            {latest.cameraId} • {latest.location}
          </div>

          <div className="text-[10px] text-gray-500 mt-1">
            {new Date(latest.timestamp).toLocaleString()}
          </div>
        </div>
      ) : (
        <div className="text-xs text-gray-500">Waiting for alerts...</div>
      )}

      {/* History */}
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {history.map((a) => (
          <div
            key={a.id}
            className="p-2 rounded-lg bg-gray-900 border border-gray-800"
          >
            <div className="text-xs font-semibold">{a.severity}</div>
            <div className="text-xs text-gray-400 mt-0.5">
              {a.message}
            </div>
            <div className="text-xs text-gray-400 bg-red-100/20 inline-block px-2 py-0.5 rounded-md mt-1">
              {a.cameraId} • {a.location}
            </div>
            <div className="text-[10px] text-gray-500 mt-1">
              {new Date(a.timestamp).toLocaleString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LiveAlerts;
