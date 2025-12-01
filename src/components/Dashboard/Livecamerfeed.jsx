import { useEffect, useState } from "react";
import axios from "axios";
import { FiPlayCircle, FiStopCircle } from "react-icons/fi";

const API = import.meta.env.VITE_API_BASE;

export default function LiveCameraFeeds() {
  const [recording, setRecording] = useState(false);

  const [cams, setCams] = useState([]);
  const [stats, setStats] = useState({ activeCameras: 0, inactiveCameras: 0, totalCameras: 0 });
  const [fullCam, setFullCam] = useState(null);
  const [sectionFull, setSectionFull] = useState(false);

  // pagination
  const [page, setPage] = useState(1);
  const perPage = 12;
  const maxPage = Math.max(1, Math.ceil(cams.length / perPage));
  const paginated = cams.slice((page - 1) * perPage, page * perPage);

  // fetch function (re-usable for polling)
  async function fetchCameras() {
    try {
      const { data } = await axios.get(`${API}/camera`);
      // API returns: { cameras: [...], activeCameras, inactiveCameras, totalCameras }
      const list = Array.isArray(data.cameras) ? data.cameras : [];
      setCams(list);
      setStats({
        activeCameras: data.activeCameras ?? list.filter((c) => c.status === "online").length,
        inactiveCameras: data.inactiveCameras ?? list.filter((c) => c.status === "offline").length,
        totalCameras: data.totalCameras ?? list.length,
      });

      // keep page within bounds when camera count changes
      const newMax = Math.max(1, Math.ceil(list.length / perPage));
      if (page > newMax) setPage(newMax);
    } catch (err) {
      console.error("Failed to load cameras", err);
    }
  }

  useEffect(() => {
    fetchCameras();

    // poll every 15s to match backend check interval
    const t = setInterval(fetchCameras, 15000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // small helper to format lastSeen
  const formatLastSeen = (iso) => {
    if (!iso) return "—";
    try {
      return new Date(iso).toLocaleString();
    } catch {
      return iso;
    }
  };

  return (
    <>
      {/* HEADER with stats */}
      <div className="mb-3 flex items-center justify-between">
        <div className="text-sm text-gray-400">Live Camera Feeds</div>
        <div className="flex items-center gap-4 text-xs text-gray-300">
          <div>Active: <span className="text-green-400">{stats.activeCameras}</span></div>
          <div>Inactive: <span className="text-red-400">{stats.inactiveCameras}</span></div>
          <div>Total: <span>{stats.totalCameras}</span></div>
        </div>
      </div>
     


      {/* 1️⃣ NORMAL UI MODE ------------------------------------------------ */}
      {!sectionFull && (
        <div className="card relative">
          <div className="flex justify-end items-center mb-3">
            <button
              className="px-2 py-1 bg-blue-600 text-white text-xs rounded"
              onClick={() => setSectionFull(true)}
            >
              Full View Section
            </button>
          </div>
 {recording && (
  <div className="flex items-center gap-2 z-50">
    <div className="w-3 h-3 bg-red-500 rounded-full animate-ping"></div>
    <div className="text-red-400 text-sm font-semibold">Recording...</div>
  </div>
)} 
          {/* FIXED HEIGHT AREA WITH PAGINATION */}
          <div style={{ height: "500px" }}>
            <div
              className="grid gap-2"
              style={{
  gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
}}

            >
              
              {paginated.map((cam) => (
                <div key={cam.id} className="relative">
                  {/* NAME + STATUS */}
                  <div className="flex items-center gap-2 text-xs text-gray-300 mb-1">
                    <span className="font-medium">{cam.name || cam.id}</span>

                    <span
                      className={`inline-block w-2 h-2 rounded-full ${
                        cam.status === "online" ? "bg-green-500" : "bg-red-600"
                      }`}
                      title={cam.status}
                    />

                    {cam.status === "offline" ? (
                      <span className="text-red-400 text-xs">Offline</span>
                    ) : (
                      <span className="text-green-300 text-xs">Live</span>
                    )}

                    <span className="text-gray-500 text-xs ml-auto">
                      {formatLastSeen(cam.lastSeen)}
                    </span>
                  </div>

                  {/* VIDEO OR OFFLINE PLACEHOLDER */}
                  {cam.status === "online" ? (
                    <div
                      className="w-full bg-black rounded-md overflow-hidden"
                      style={{ aspectRatio: "16 / 9" }}
                    >
                      <iframe
                        src={`http://localhost:8889/${cam.streamKey || cam.id}`}
                        className="w-full h-full border-0"
                        allow="autoplay"
                        title={cam.id}
                      />
                    </div>
                  ) : (
                    <div
                      className="w-full bg-black/50 rounded-md flex flex-col items-center justify-center text-red-500 text-sm"
                      style={{ aspectRatio: "16 / 9" }}
                    >
                      <div>Camera Offline</div>
                      <div className="text-xs text-gray-300 mt-1">{formatLastSeen(cam.lastSeen)}</div>
                    </div>
                  )}

                  <button
                    className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded"
                    onClick={() => cam.status === "online" && setFullCam(cam)}
                    disabled={cam.status !== "online"}
                    title={cam.status !== "online" ? "Camera offline" : "Open full view"}
                  >
                    Full
                  </button>
                </div>
              ))}
            </div>
          </div>

         {/* PAGINATION + RECORD CONTROLS */}
<div className="flex flex-wrap justify-center gap-4 mt-9 items-center">

  {/* Prev Button */}
  <button
    className="flex items-center gap-1 px-3 py-1 text-sm bg-gray-700 text-white rounded disabled:opacity-40"
    disabled={page === 1}
    onClick={() => setPage((p) => Math.max(1, p - 1))}
  >
    Prev
  </button>

  <span className="text-gray-400 text-sm">
    Page {page} / {maxPage}
  </span>

  {/* Next Button */}
  <button
    className="flex items-center gap-1 px-3 py-1 text-sm bg-gray-700 text-white rounded disabled:opacity-40"
    disabled={page === maxPage}
    onClick={() => setPage((p) => Math.min(maxPage, p + 1))}
  >
    Next
  </button>
 
  {/* START RECORDING */}
{(stats.activeCameras.length >0) ?
 !recording  && <button
  className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-md shadow"
  onClick={async () => {
    await fetch(`${API}/record/start`, { method: "POST" });
    setRecording(true);
  }}
>
  <FiPlayCircle size={18} />
  Start Recording
</button> : <button
  className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white text-sm rounded-md shadow cursor-not-allowed"
  disabled
>
  <FiPlayCircle size={18} />
  Start Recording
</button>
}

{/* STOP RECORDING */}
{recording ?<button
  className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded-md shadow"
  onClick={async () => {
    await fetch(`${API}/record/stop`, { method: "POST" });
    setRecording(false);
  }}
>
  <FiStopCircle size={18} />
  Stop Recording
</button>: <button
  className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white text-sm rounded-md shadow cursor-not-allowed"
  disabled
>
  <FiStopCircle size={18} />
  Stop Recording
</button>
}

</div>

        </div>
      )}

      {/* 2️⃣ FULLSCREEN SECTION MODE (ALL CAMERAS, BIG TILES) ------------------------ */}
      {sectionFull && (
        <div className="fixed inset-0 bg-black p-4 overflow-auto z-50">
          <div className="flex justify-between mb-4 text-white">
            <h2 className="text-lg">All Cameras - Fullscreen View</h2>
            <button
              onClick={() => setSectionFull(false)}
              className="px-3 py-1 bg-red-600 rounded"
            >
              Close
            </button>
          </div>

          <div
            className="grid gap-3"
            style={{
              gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            }}
          >
            {cams.map((cam) => (
              <div key={cam.id} className="relative">
                <div className="flex items-center gap-2 text-sm text-white mb-1">
                  <span className="font-medium">{cam.name || cam.id}</span>
                  <span
                    className={`inline-block w-2 h-2 rounded-full ${
                      cam.status === "online" ? "bg-green-500" : "bg-red-600"
                    }`}
                    title={cam.status}
                  />
                  <span className="text-gray-400 text-xs ml-auto">{formatLastSeen(cam.lastSeen)}</span>
                </div>

                {cam.status === "online" ? (
                  <div
                    className="w-full bg-black rounded-md overflow-hidden"
                    style={{ aspectRatio: "16 / 9" }}
                  >
                    <iframe
                      src={`http://localhost:8889/${cam.streamKey || cam.id}`}
                      className="w-full h-full border-0"
                      allow="autoplay"
                      title={cam.id}
                    />
                  </div>
                ) : (
                  <div
                    className="w-full bg-black/50 rounded-md flex items-center justify-center text-red-500 text-sm"
                    style={{ aspectRatio: "16 / 9" }}
                  >
                    Camera Offline
                  </div>
                )}

                <button
                  className="absolute top-2 right-2 bg-black/60 text-white text-xs px-3 py-1 rounded"
                  onClick={() => cam.status === "online" && setFullCam(cam)}
                  disabled={cam.status !== "online"}
                >
                  Full
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3️⃣ SINGLE CAMERA FULL VIEW ----------------------------------------- */}
      {fullCam && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-5xl">
            <div className="flex justify-between mb-2 text-white text-sm">
              <span>{fullCam.name || fullCam.id}</span>
              <button
                onClick={() => setFullCam(null)}
                className="px-2 py-1 bg-red-600 rounded"
              >
                Close
              </button>
            </div>

            <iframe
              src={`http://localhost:8889/${fullCam.streamKey || fullCam.id}`}
              className="w-full h-[70vh] rounded border-0"
              allow="autoplay"
              title={fullCam.id}
            />
          </div>
        </div>
      )}
    </>
  );
}
