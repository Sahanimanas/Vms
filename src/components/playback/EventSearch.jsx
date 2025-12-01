import Card from "../common/Card";

export default function EventSearch() {
  return (
    <Card title="AI Event Search">
      <input
        type="text"
        placeholder="Find no-helmet events..."
        className="w-full bg-gray-800 text-gray-300 p-2 rounded-md text-sm mb-3"
      />
      <div className="flex gap-2 mb-3">
        <button className="bg-red-600 px-3 py-1 rounded-md text-white text-xs">
          Fire Alert
        </button>
        <button className="bg-blue-600 px-3 py-1 rounded-md text-white text-xs">
          Motion
        </button>
      </div>
      <div className="text-xs text-gray-400 mb-1">Time Range</div>
      <input type="datetime-local" className="bg-gray-800 text-gray-400 w-full text-sm rounded-md mb-2" />
      <input type="datetime-local" className="bg-gray-800 text-gray-400 w-full text-sm rounded-md mb-2" />
      <button className="bg-amber-500 text-black font-semibold w-full py-2 rounded-md text-sm">
        Search Events
      </button>
    </Card>
  );
}
