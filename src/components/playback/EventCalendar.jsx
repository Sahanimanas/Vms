import Card from "../common/Card";

export default function EventCalendar() {
  return (
    <Card title="Event Calendar">
      <div className="text-gray-400 text-sm mb-3">November 2024</div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-400">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className={`p-2 rounded-md ${
              i === 1 ? "bg-amber-600 text-black font-bold" : "bg-gray-800"
            }`}
          >
            {i + 1}
          </div>
        ))}
      </div>
    </Card>
  );
}
