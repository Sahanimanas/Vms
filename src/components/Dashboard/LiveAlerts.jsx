import React from 'react'
import { useDashboard } from '../../context/DashboardContext'
const LiveAlerts = () => {
const { data } = useDashboard()
const alerts = data?.alerts ?? []
return (
<div className="card">
<div className="text-sm text-gray-400 mb-2">Live Alerts</div>
<div className="space-y-2">
{alerts.map(a => (
<div key={a.id} className="p-2 rounded-lg bg-gray-900 border bordergray-800">
<div className="text-xs font-semibold">{a.type}</div>
<div className="text-xs text-gray-400">{a.camera} • {a.time}</div>
</div>
))}
</div>

</div>
)
}
export default LiveAlerts