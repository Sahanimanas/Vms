import Card from "../common/Card";

export default function EventStatistics() {
  const data = [
    { label: "PPE Violations", count: 12 },
    { label: "Safety Alerts", count: 9 },
    { label: "Access Violations", count: 5 },
    { label: "Motion Events", count: 23 },
  ];

  return (
    <Card title="Event Statistics">
      {data.map((d) => (
        <div key={d.label} className="flex justify-between text-gray-400 text-sm mb-1">
          <span>{d.label}</span>
          <span className="text-gray-200">{d.count}</span>
        </div>
      ))}
    </Card>
  );
}
