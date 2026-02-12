import React, { useState, useCallback } from 'react';
import DashboardLayout from '../components/Dashboard/Dashboardlayout';
import ActiveCamerasCard from '../components/Dashboard/StatsCards/ActiveCameraCard';
import OpenIncidentsCard from '../components/Dashboard/StatsCards/OpenIncidentCard';
import PPEViolationsCard from '../components/Dashboard/StatsCards/PPEVioationsCard';
import SystemHealthCard from '../components/Dashboard/StatsCards/SystemHealthCard';
import LiveCameraFeeds from '../components/Dashboard/Livecamerfeed';
import FacilityMap from '../components/Dashboard/FacilityMap';
import LiveAlerts from '../components/Dashboard/LiveAlerts';
import RecentEvents from '../components/Dashboard/RecentsEvents';
import AddCameraButton from '../components/Dashboard/AddCameraButton';

const DashboardPage = () => {
  const [refreshKey, setRefreshKey] = useState(0);

  // Callback when a new camera is added to refresh the feeds
  const handleCameraAdded = useCallback((newCamera) => {
    console.log('New camera added:', newCamera);
    // Trigger refresh of camera-related components
    setRefreshKey(prev => prev + 1);
  }, []);

  return (
    <DashboardLayout>
      {/* Header with Add Camera Button */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Control Dashboard</h1>
          <p className="text-slate-400 text-sm mt-1">
            Monitor cameras, incidents, and PPE compliance in real-time
          </p>
        </div>
        <AddCameraButton onCameraAdded={handleCameraAdded} />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        <ActiveCamerasCard key={`active-${refreshKey}`} />
        <OpenIncidentsCard />
        <PPEViolationsCard />
        <SystemHealthCard />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-3 gap-4 mt-6">
        <div className="col-span-2 space-y-4">
          <LiveCameraFeeds key={`feeds-${refreshKey}`} />
        </div>
        <div className="col-span-1 space-y-4">
          <FacilityMap />
          <LiveAlerts />
        </div>
      </div>

      {/* Recent Events */}
      <div className="mt-6">
        <RecentEvents />
      </div>
    </DashboardLayout>
  );
};

export default DashboardPage;