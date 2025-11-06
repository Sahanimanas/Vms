import React from 'react'
import { useDashboard } from '../../../context/DashboardContext'
const ActiveCamerasCard = () => {
const { data } = useDashboard()
const active = data?.stats?.activeCameras ?? '—'
const total = data?.stats?.totalCameras ?? '—'
return (
<div className="card">
<div className="text-sm text-gray-400">Active Cameras</div>
<div className="text-3xl font-bold mt-2">{active}</div>
<div className="text-sm text-gray-500">of {total} total</div>
</div>
)
}
export default ActiveCamerasCard