import { FiFileText, FiVideo } from "react-icons/fi";

const AttachmentsList = ({ attachments = [] }) => (
  <div>
    <h4 className="text-sm text-gray-400 mb-2">Attachments</h4>
    <div className="space-y-2">
      {attachments.map((a, i) => (
        <div
          key={i}
          className="flex items-center gap-2 text-sm bg-gray-900 p-2 rounded-md"
        >
          {a.type === "video" ? (
            <FiVideo className="text-blue-400" />
          ) : (
            <FiFileText className="text-gray-400" />
          )}
          <span className="text-gray-300">{a.name}</span>
        </div>
      ))}
    </div>
  </div>
);
export default AttachmentsList;
