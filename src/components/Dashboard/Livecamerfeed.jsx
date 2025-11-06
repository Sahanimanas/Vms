import { useEffect, useState } from "react";
import axios from "axios";

const API = import.meta.env.VITE_API_BASE;

export default function LiveCameraFeeds() {
  const [cams, setCams] = useState([]);

  useEffect(() => {
    axios.get(`${API}/cameras`).then(({ data }) => setCams(data)).catch((err) => {  throw new Error("No cameras loaded")} );
  }, []);
   console.log(cams);
  return (
    <div className="card">
      <div className="text-gray-400 text-sm mb-3">Live Camera Feeds</div>
      <div className="grid grid-cols-3 gap-4">
       <iframe
              src={`http://localhost:8889/cam-001`}
              className="w-full h-48 rounded-md border-0"
              allow="autoplay"
            />
             <iframe
              src={`http://localhost:8889/cam-002`}
              className="w-full h-48 rounded-md border-0"
              allow="autoplay"
            />
        {/* {cams.map((cam) => (
          <div key={cam.id}>
            <div className="text-xs text-gray-400 mb-1">{cam.name || cam.id}</div>
            <iframe
              src={`http://localhost:8889/cam-001`}
              title={cam.id}
              className="w-full h-50 rounded-md border-0"
              allow="autoplay"
            />
          </div>
        ))} */}
      </div>
    </div>
  );
}
