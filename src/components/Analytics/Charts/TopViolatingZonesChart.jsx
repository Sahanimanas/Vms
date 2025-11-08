import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { useAnalytics } from "../../../context/AnalyticsContext";

const TopViolatingZonesChart = () => {
  const { data } = useAnalytics();
  return (
    <div className="card">
      <div className="text-sm text-gray-400 mb-2">Top Violating Zones</div>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data.zones}>
          <XAxis dataKey="zone" stroke="#777" />
          <YAxis stroke="#777" />
          <Tooltip />
          <Bar dataKey="count" fill="#3b82f6" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
export default TopViolatingZonesChart;
