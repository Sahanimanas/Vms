import { useEffect, useState } from "react";
import { FiPlay, FiSquare } from "react-icons/fi";
import {
  getCamerasStatus,
  startSavedCamera,
  stopCamera,
  getStreamUrl,
} from "../../api/cameraApi";

export default function LiveCameraFeeds() {
  const [cams, setCams] = useState([]);
  const [stats, setStats] = useState({ activeCameras: 0, inactiveCameras: 0, totalCameras: 0 });
  const [fullCam, setFullCam] = useState(null);
  const [sectionFull, setSectionFull] = useState(false);
  const [startingCam, setStartingCam] = useState(null);
  const [stoppingCam, setStoppingCam] = useState(null);

  // pagination
  const [page, setPage] = useState(1);
  const perPage = 12;
  const maxPage = Math.max(1, Math.ceil(cams.length / perPage));
  const paginated = cams.slice((page - 1) * perPage, page * perPage);

  // fetch cameras from FastAPI
  // GET /cameras/status returns:
  // { active_cameras, total_saved_cameras, active_status: { cam_id: {...} }, saved_cameras: { cam_id: {...config} } }
  async function fetchCameras() {
    try {
      const statusData = await getCamerasStatus();

      const savedCamerasDict = statusData.saved_cameras || {};
      const activeStatusDict = statusData.active_status || {};

      // Map the dict to an array for UI rendering
      const list = Object.entries(savedCamerasDict).map(([camId, config]) => {
        const isActive = config.is_active || camId in activeStatusDict;
        return {
          id: camId,
          name: config.camera_name || camId,
          rtsp_url: config.rtsp_url,
          location: config.location,
          confidence_threshold: config.confidence_threshold,
          total_detections: config.total_detections || 0,
          status: isActive ? "online" : "offline",
          lastSeen: config.last_active || (isActive ? new Date().toISOString() : null),
        };
      });

      setCams(list);
      setStats({
        activeCameras: statusData.active_cameras ?? 0,
        inactiveCameras: (statusData.total_saved_cameras ?? 0) - (statusData.active_cameras ?? 0),
        totalCameras: statusData.total_saved_cameras ?? 0,
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
    const t = setInterval(fetchCameras, 15000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Start a camera stream
  const handleStartCamera = async (cameraId) => {
    setStartingCam(cameraId);
    try {
      await startSavedCamera(cameraId);
      await fetchCameras();
    } catch (err) {
      console.error("Failed to start camera:", err);
    } finally {
      setStartingCam(null);
    }
  };

  // Stop a camera stream
  const handleStopCamera = async (cameraId) => {
    setStoppingCam(cameraId);
    try {
      await stopCamera(cameraId);
      await fetchCameras();
    } catch (err) {
      console.error("Failed to stop camera:", err);
    } finally {
      setStoppingCam(null);
    }
  };

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

      {/* 1️⃣ NORMAL UI MODE */}
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
                    {cam.location && (
                      <span className="text-gray-500 text-xs">{cam.location}</span>
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
                      <img
                        src={getStreamUrl(cam.id)}
                        className="w-full h-full object-cover"
                        alt={cam.name || cam.id}
                      />
                    </div>
                  ) : (
                    <div
                      className="w-full bg-black/50 rounded-md flex flex-col items-center justify-center text-gray-500 text-sm"
                      style={{ aspectRatio: "16 / 9" }}
                    >
                      <div>Camera Offline</div>
                      <button
                        className="mt-2 flex items-center gap-1 px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded transition-colors disabled:opacity-50"
                        onClick={() => handleStartCamera(cam.id)}
                        disabled={startingCam === cam.id}
                      >
                        <FiPlay size={12} />
                        {startingCam === cam.id ? "Starting..." : "Start Stream"}
                      </button>
                    </div>
                  )}

                  {/* Controls overlay */}
                  <div className="absolute top-2 right-2 flex gap-1">
                    {cam.status === "online" && (
                      <button
                        className="bg-red-600/80 hover:bg-red-600 text-white text-xs px-2 py-1 rounded transition-colors disabled:opacity-50"
                        onClick={() => handleStopCamera(cam.id)}
                        disabled={stoppingCam === cam.id}
                        title="Stop stream"
                      >
                        <FiSquare size={12} />
                      </button>
                    )}
                    <button
                      className="bg-black/60 text-white text-xs px-2 py-1 rounded"
                      onClick={() => setFullCam(cam)}
                      title="Open full view"
                    >
                      Full
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* PAGINATION */}
          <div className="flex flex-wrap justify-center gap-4 mt-9 items-center">
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

            <button
              className="flex items-center gap-1 px-3 py-1 text-sm bg-gray-700 text-white rounded disabled:opacity-40"
              disabled={page === maxPage}
              onClick={() => setPage((p) => Math.min(maxPage, p + 1))}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* 2️⃣ FULLSCREEN SECTION MODE */}
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
                    <img
                      src={getStreamUrl(cam.id)}
                      className="w-full h-full object-cover"
                      alt={cam.name || cam.id}
                    />
                  </div>
                ) : (
                  <div
                    className="w-full bg-black/50 rounded-md flex flex-col items-center justify-center text-gray-500 text-sm"
                    style={{ aspectRatio: "16 / 9" }}
                  >
                    <div>Camera Offline</div>
                    <button
                      className="mt-2 flex items-center gap-1 px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded transition-colors disabled:opacity-50"
                      onClick={() => handleStartCamera(cam.id)}
                      disabled={startingCam === cam.id}
                    >
                      <FiPlay size={12} />
                      {startingCam === cam.id ? "Starting..." : "Start Stream"}
                    </button>
                  </div>
                )}

                <div className="absolute top-2 right-2 flex gap-1">
                  {cam.status === "online" && (
                    <button
                      className="bg-red-600/80 hover:bg-red-600 text-white text-xs px-2 py-1 rounded transition-colors"
                      onClick={() => handleStopCamera(cam.id)}
                      title="Stop stream"
                    >
                      <FiSquare size={12} />
                    </button>
                  )}
                  <button
                    className="bg-black/60 text-white text-xs px-3 py-1 rounded"
                    onClick={() => setFullCam(cam)}
                  >
                    Full
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3️⃣ SINGLE CAMERA FULL VIEW */}
      {fullCam && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-5xl">
            <div className="flex justify-between mb-2 text-white text-sm">
              <span>{fullCam.name || fullCam.id}</span>
              <div className="flex gap-2">
                {fullCam.status === "online" && (
                  <button
                    onClick={() => handleStopCamera(fullCam.id)}
                    className="px-2 py-1 bg-orange-600 rounded text-xs"
                  >
                    Stop
                  </button>
                )}
                {fullCam.status !== "online" && (
                  <button
                    onClick={() => handleStartCamera(fullCam.id)}
                    className="px-2 py-1 bg-green-600 rounded text-xs"
                  >
                    Start
                  </button>
                )}
                <button
                  onClick={() => setFullCam(null)}
                  className="px-2 py-1 bg-red-600 rounded"
                >
                  Close
                </button>
              </div>
            </div>

            {fullCam.status === "online" ? (
              <img
                src={getStreamUrl(fullCam.id)}
                className="w-full h-[70vh] rounded object-contain bg-black"
                alt={fullCam.name || fullCam.id}
              />
            ) : (
              <div className="w-full h-[70vh] rounded bg-black/50 flex flex-col items-center justify-center text-gray-500 text-xl">
                <div>Camera Offline</div>
                <button
                  className="mt-4 flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded transition-colors"
                  onClick={() => handleStartCamera(fullCam.id)}
                >
                  <FiPlay size={16} />
                  Start Stream
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
