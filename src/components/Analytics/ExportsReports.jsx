import { FiDownload } from "react-icons/fi";

const ExportReports = () => (
  <div className="card flex justify-between items-center">
    <div>
      <h4 className="text-gray-300 text-sm mb-1">Export & Report Options</h4>
      <select className="bg-gray-800 p-2 rounded text-sm">
        <option>Weekly Trend Report</option>
        <option>PPE Compliance Summary</option>
        <option>Machine Downtime Analysis</option>
      </select>
    </div>
    <button className="flex items-center gap-2 bg-blue-600 px-3 py-1 rounded text-sm">
      <FiDownload /> Generate Report
    </button>
  </div>
);
export default ExportReports;
