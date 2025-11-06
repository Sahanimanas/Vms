import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
const DashboardContext = createContext(null);
export const useDashboard = () => useContext(DashboardContext);
export const DashboardProvider = ({ children }) => {
  const [data, setData] = useState({
    stats: null,
    cameras: [],
    alerts: [],
    events: [],
  });
  const API = import.meta.env.VITE_API_BASE || "http://localhost:4000/api";
  const fetchAll = async () => {
    try {
      const res = await axios.get(`${API}/dashboard`);
      setData(res.data);
    } catch (err) {
      console.error("Failed to fetch dashboard", err);
    }
  };
  useEffect(() => {
    fetchAll();
    const interval = setInterval(fetchAll, 10000); // poll every 10s
    return () => clearInterval(interval);
  }, []);
  return (
    <DashboardContext.Provider value={{ data, refresh: fetchAll }}>
      {children}
    </DashboardContext.Provider>
  );
};
