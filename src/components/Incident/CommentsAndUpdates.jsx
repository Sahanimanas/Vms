import { FiUser } from "react-icons/fi";

const CommentsAndUpdates = ({ comments = [] }) => (
  <div>
    <h4 className="text-sm text-gray-400 mb-2">Comments & Updates</h4>
    <div className="space-y-2">
      {comments.map((c, i) => (
        <div key={i} className="bg-gray-900 p-2 rounded-md text-sm">
          <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
            <FiUser /> {c.user} • {c.time}
          </div>
          <p className="text-gray-300">{c.text}</p>
        </div>
      ))}
    </div>
  </div>
);
export default CommentsAndUpdates;