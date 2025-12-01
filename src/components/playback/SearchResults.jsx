import Card from "../common/Card";

const results = [
  { id: 1, type: "PPE Violation - No Hard Hat", level: "Critical", time: "14:32:15" },
  { id: 2, type: "Fire Detection Alert", level: "Major", time: "14:28:55" },
  { id: 3, type: "Unauthorized Access", level: "Major", time: "14:25:00" },
  { id: 4, type: "Missing Safety Vest", level: "Minor", time: "14:20:40" },
];

export default function SearchResults() {
  return (
    <Card title="Search Results">
      <div className="space-y-3">
        {results.map((r) => (
          <div
            key={r.id}
            className="flex justify-between items-center bg-gray-800 p-2 rounded-md"
          >
            <div>
              <div className="text-sm text-gray-200">{r.type}</div>
              <div className="text-xs text-gray-500">{r.time}</div>
            </div>
            <span
              className={`text-xs font-semibold ${
                r.level === "Critical"
                  ? "text-red-500"
                  : r.level === "Major"
                  ? "text-amber-400"
                  : "text-blue-400"
              }`}
            >
              {r.level}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}
