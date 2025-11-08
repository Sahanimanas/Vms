import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useAnalytics } from "../../../context/AnalyticsContext";

const IncidentTrendsChart = () => {
  const { data } = useAnalytics();
  return (
    <div className="card">
      <div className="text-sm text-gray-400 mb-2">Incident Trends</div>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data.trends}>
          <XAxis dataKey="day" stroke="#777" />
          <YAxis stroke="#777" />
          <Tooltip />
          <Line type="monotone" dataKey="critical" stroke="#ef4444" strokeWidth={2} />
          <Line type="monotone" dataKey="major" stroke="#facc15" strokeWidth={2} />
          <Line type="monotone" dataKey="minor" stroke="#3b82f6" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
export default IncidentTrendsChart;
