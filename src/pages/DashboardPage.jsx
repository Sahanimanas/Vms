import React from 'react'
import DashboardLayout from '../components/Dashboard/Dashboardlayout'
import ActiveCamerasCard from '../components/Dashboard/StatsCards/ActiveCameraCard'
import OpenIncidentsCard from '../components/Dashboard/StatsCards/OpenIncidentCard'
import PPEViolationsCard from '../components/Dashboard/StatsCards/PPEVioationsCard'
import SystemHealthCard from '../components/Dashboard/StatsCards/SystemHealthCard'
import LiveCameraFeeds from '../components/Dashboard/Livecamerfeed'
import FacilityMap from '../components/Dashboard/FacilityMap'
import LiveAlerts from '../components/Dashboard/LiveAlerts'
import RecentEvents from '../components/Dashboard/RecentsEvents'
const DashboardPage = () => {
return (
<DashboardLayout>
<div className="grid grid-cols-4 gap-4">
<ActiveCamerasCard />
<OpenIncidentsCard />
<PPEViolationsCard />
<SystemHealthCard />
</div>
<div className="grid grid-cols-3 gap-4 mt-6">
<div className="col-span-2 space-y-4">
<LiveCameraFeeds />
</div>
<div className="col-span-1 space-y-4">
<FacilityMap />
<LiveAlerts />
</div>
</div>
<div className="mt-6">
<RecentEvents />
</div>
</DashboardLayout>
)
}
export default DashboardPage