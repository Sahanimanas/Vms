import { FiFilter } from "react-icons/fi";

const ReportFilters = () => (
  <div className="card flex justify-between items-center p-4 mb-4">
    <div className="flex gap-3 items-center">
      <FiFilter className="text-gray-400" />
      <select className="bg-gray-800 p-2 rounded text-sm">
        <option>Last 7 Days</option>
        <option>Last 30 Days</option>
        <option>This Year</option>
      </select>
      <select className="bg-gray-800 p-2 rounded text-sm">
        <option>All Zones</option>
        <option>Processing</option>
        <option>Storage</option>
      </select>
      <select className="bg-gray-800 p-2 rounded text-sm">
        <option>All Shifts</option>
        <option>Morning</option>
        <option>Night</option>
      </select>
      <button className="bg-blue-600 px-3 py-1 rounded text-sm">Apply</button>
    </div>
    <div className="flex gap-2">
      <button className="bg-red-600 px-3 py-1 rounded text-sm">Export PDF</button>
      <button className="bg-green-600 px-3 py-1 rounded text-sm">Export Excel</button>
    </div>
  </div>
);
export default ReportFilters;
