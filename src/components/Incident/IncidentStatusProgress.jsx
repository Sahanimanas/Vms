import { FiCircle, FiCheckCircle } from "react-icons/fi";

const IncidentStatusProgress = ({ status }) => {
  const stages = ["Open", "Under Review", "Resolved", "Closed"];
  const activeIndex = stages.indexOf(status);

  return (
    <div className="space-y-2">
      <div className="text-sm text-gray-400">Status Progress</div>
      <div className="flex items-center gap-3">
        {stages.map((s, idx) => (
          <div key={s} className="flex items-center gap-2">
            {idx <= activeIndex ? (
              <FiCheckCircle className="text-green-500" />
            ) : (
              <FiCircle className="text-gray-600" />
            )}
            <span
              className={`text-xs ${
                idx <= activeIndex ? "text-green-400" : "text-gray-500"
              }`}
            >
              {s}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
export default IncidentStatusProgress;
