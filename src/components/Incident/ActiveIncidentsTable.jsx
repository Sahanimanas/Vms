import { useIncidents } from "../../context/IncidentContext";
import clsx from "clsx";

const severityColor = {
  CRITICAL: "text-red-500 bg-red-900/20",
  MAJOR: "text-yellow-500 bg-yellow-900/20",
  MINOR: "text-blue-400 bg-blue-900/20",
  Resolved: "text-green-400 bg-green-900/20",
  Closed: "text-gray-400 bg-gray-800",
};

const ActiveIncidentsTable = () => {
  const { data, setData } = useIncidents();
  const incidents = data.incidents ?? [];

  return (
    <div className="card overflow-hidden">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-gray-300 text-sm font-medium">Active Incidents</h2>
      </div>

      <table className="w-full text-sm">
        <thead className="text-gray-400 border-b border-gray-700 text-left">
          <tr>
            <th className="py-2">ID</th>
            <th>Title</th>
            <th>Severity</th>
            <th>Status</th>
            <th>Assigned To</th>
            <th>Timestamp</th>
          </tr>
        </thead>
        <tbody>
          {incidents.map((i) => (
            <tr
              key={i.id}
              className="hover:bg-gray-800/50 cursor-pointer"
              onClick={() => setData((p) => ({ ...p, selectedIncident: i }))}
            >
              <td className="py-2 text-blue-400">{i.id}</td>
              <td>{i.title}</td>
              <td>
                <span
                  className={clsx(
                    "px-2 py-1 rounded-md text-xs font-semibold",
                    severityColor[i.severity]
                  )}
                >
                  {i.severity}
                </span>
              </td>
              <td>{i.status}</td>
              <td>{i.assigned}</td>
              <td>{i.time}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
export default ActiveIncidentsTable;
