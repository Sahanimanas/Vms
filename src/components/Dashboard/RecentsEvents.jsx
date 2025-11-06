import React from 'react'
import { useDashboard } from '../../context/DashboardContext'
const RecentEvents = () => {
const { data } = useDashboard()
const events = data?.events ?? []
return (
<div className="card">
<div className="text-sm text-gray-400 mb-3">Recent Events Timeline</div>
<div className="space-y-3">
{events.map(e => (
<div key={e.id} className="p-3 rounded-lg bg-gray-900 border bordergray-800 flex justify-between">
<div>
<div className="text-sm font-semibold">{e.title}</div>
<div className="text-xs text-gray-400">{e.details}</div>
</div>
<div className="text-xs text-gray-500">{e.time}</div>
</div>
))}
</div>
</div>
)
}
export default RecentEvents