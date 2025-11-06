import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const IncidentContext = createContext();
export const useIncidents = () => useContext(IncidentContext);

export const IncidentProvider = ({ children }) => {
  const [data, setData] = useState({
    summary: {},
    incidents: [],
    selectedIncident: null,
  });
const API = import.meta.env.VITE_API_BASE || "http://localhost:4000/api";
  const fetchData = async () => {
    try {
      const res = await axios.get(`${API}/incidents`);
      setData(res.data);
    } catch (err) {
      console.error("Error fetching incident data:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <IncidentContext.Provider value={{ data, setData, fetchData }}>
      {children}
    </IncidentContext.Provider>
  );
};
// export default IncidentProvider;
