import { useAnalytics } from "../../../context/AnalyticsContext";

const RecentCriticalIncidents = () => {
  const { data } = useAnalytics();
  return (
    <div className="card">
      <div className="text-sm text-gray-400 mb-2">Recent Critical Incidents</div>
      <div className="space-y-2 text-sm">
        {data.incidents.map((i) => (
          <div key={i.id} className="flex justify-between border-b border-gray-800 pb-1">
            <span className="text-blue-400">{i.id}</span>
            <span>{i.title}</span>
            <span className="text-red-400">{i.severity}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
export default RecentCriticalIncidents;
