import Card from "../common/Card";

export default function ExportOptions() {
  return (
    <Card title="Export Options">
      <div className="flex flex-col gap-2">
        <button className="bg-amber-500 text-black font-semibold py-1 rounded-md text-xs">
          Export Video Clip (MP4)
        </button>
        <button className="bg-gray-700 text-gray-300 py-1 rounded-md text-xs">
          Export Snapshots
        </button>
        <button className="bg-gray-700 text-gray-300 py-1 rounded-md text-xs">
          Export Event Data (CSV)
        </button>
        <button className="bg-green-600 text-white font-semibold py-1 rounded-md text-xs">
          Share Evidence Package
        </button>
      </div>
    </Card>
  );
}
