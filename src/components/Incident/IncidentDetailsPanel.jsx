import { FiVideo, FiUser, FiClock } from "react-icons/fi";
import { useIncidents } from "../../context/IncidentContext";
import IncidentStatusProgress from "./IncidentStatusProgress";
import CommentsAndUpdates from "./CommentsAndUpdates";
import AttachmentsList from "./AttachmentsList";

const IncidentDetailsPanel = () => {
  const { data } = useIncidents();
  const incident = data.selectedIncident;
  if (!incident)
    return (
      <div className="card text-gray-400 text-sm text-center py-20">
        Select an incident to view details.
      </div>
    );

  return (
    <div className="card space-y-4">
      <div>
        <div className="flex justify-between items-center">
          <h3 className="font-semibold text-gray-200">{incident.title}</h3>
          <span className="bg-red-900/30 text-red-500 text-xs px-2 py-1 rounded-md">
            {incident.severity}
          </span>
        </div>
        <p className="text-xs text-gray-400 mt-1">{incident.description}</p>
      </div>

      <div className="bg-gray-800 p-3 rounded-md flex items-center gap-3">
        <FiVideo className="text-gray-400" />
        <span className="text-sm text-gray-300">
          {incident.camera} • {incident.zone}
        </span>
      </div>

      <IncidentStatusProgress status={incident.status} />
      <CommentsAndUpdates comments={incident.comments} />
      <AttachmentsList attachments={incident.attachments} />
    </div>
  );
};

export default IncidentDetailsPanel;
