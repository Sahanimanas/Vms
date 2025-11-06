import React from 'react'
import { useDashboard } from '../../../context/DashboardContext'
const SystemHealthCard = () => {
const { data } = useDashboard()
const pct = data?.stats?.systemHealthPercent ?? '--'
return (
<div className="card">
<div className="text-sm text-gray-400">System Health</div>
<div className="text-3xl font-bold mt-2">{pct}%</div>
<div className="text-sm text-gray-500">Excellent</div>
</div>
)
}
export default SystemHealthCard