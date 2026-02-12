import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

const AnalyticsContext = createContext();
export const useAnalytics = () => useContext(AnalyticsContext);

export const AnalyticsProvider = ({ children }) => {
  const [data, setData] = useState({
    summary: {},
    trends: [],
    zones: [],
    compliance: [],
    shifts: [],
    severity: [],
    incidents: [],
    system: {},
  });
const API = import.meta.env.VITE_API_BASE || "http://localhost:4000/api";
  const fetchData = async () => {
    try {
      const res = await axios.get(`${API}/analytics`);
      setData(res.data);
    } catch (err) {
      console.error("Analytics fetch error:", err);
    }
  };

  useEffect(() => { fetchData(); }, []);

  return (
    <AnalyticsContext.Provider value={{ data, refresh: fetchData }}>
      {children}
    </AnalyticsContext.Provider>
  );
};
