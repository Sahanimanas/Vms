import { useState, useEffect } from "react";
import axios from "axios";
import { FiPlus, FiTrash2 } from "react-icons/fi";

const API = import.meta.env.VITE_API_BASE;

export default function CameraManager() {
  const [cameras, setCameras] = useState([]);
  const [form, setForm] = useState({ id: "", name: "", ip: "", username: "", password: "" });

  const fetchCameras = async () => {
    const { data } = await axios.get(API);
    setCameras(data);
  };

  const addCamera = async () => {
    if (!form.id || !form.ip) return;
    await axios.post(API, form);
    setForm({ id: "", name: "", ip: "", username: "", password: "" });
    fetchCameras();
  };

  const deleteCamera = async (id) => {
    await axios.delete(`${API}/${id}`);
    fetchCameras();
  };

  useEffect(() => { fetchCameras(); }, []);

  return (
    <div className="card">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-gray-300 font-semibold">Manage Cameras</h3>
        <button onClick={addCamera} className="flex items-center gap-1 bg-green-600 px-3 py-1 rounded text-sm">
          <FiPlus /> Add
        </button>
      </div>

      <div className="space-y-2 mb-4">
        {cameras.map((cam) => (
          <div key={cam.id} className="bg-gray-900 p-2 rounded flex justify-between items-center">
            <div>
              <div className="text-gray-200 text-sm">{cam.name || cam.id}</div>
              <div className="text-xs text-gray-500">{cam.ip}</div>
            </div>
            <button onClick={() => deleteCamera(cam.id)} className="text-gray-400 hover:text-red-400">
              <FiTrash2 />
            </button>
          </div>
        ))}
      </div>

      <div className="space-y-2">
        <input
          placeholder="Camera ID"
          value={form.id}
          onChange={(e) => setForm({ ...form, id: e.target.value })}
          className="bg-gray-800 p-2 rounded w-full"
        />
        <input
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="bg-gray-800 p-2 rounded w-full"
        />
        <input
          placeholder="IP Address"
          value={form.ip}
          onChange={(e) => setForm({ ...form, ip: e.target.value })}
          className="bg-gray-800 p-2 rounded w-full"
        />
        <input
          placeholder="Username"
          value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })}
          className="bg-gray-800 p-2 rounded w-full"
        />
        <input
          placeholder="Password"
          type="password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          className="bg-gray-800 p-2 rounded w-full"
        />
      </div>
    </div>
  );
}
