import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiHome, FiAlertTriangle, FiBarChart2, FiPlay, FiSettings, FiAlertOctagon } from 'react-icons/fi';

const Sidebar = () => {
  const location = useLocation();
  
  const isActive = (path) => {
    return location.pathname === path;
  };

  const navItems = [
    { path: '/', label: 'Dashboard', icon: FiHome },
    { path: '/incidents', label: 'Incidents', icon: FiAlertOctagon },
    { path: '/ppe-violations', label: 'PPE Violations', icon: FiAlertTriangle },
    { path: '/analytics', label: 'PPE Analytics', icon: FiBarChart2 },
    { path: '/playback', label: 'Playback', icon: FiPlay },
    { path: '/settings', label: 'Settings', icon: FiSettings },
  ];

  return (
    <aside className="w-64 bg-gray-900 p-4 h-full border-r border-gray-800">
      <div className="mb-6 text-white font-bold text-xl">RefineVMS</div>
      <nav className="space-y-2 flex flex-col text-sm text-gray-300">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`px-3 py-2 rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2 ${
                active ? 'bg-gray-800 text-white' : ''
              }`}
            >
              <Icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;