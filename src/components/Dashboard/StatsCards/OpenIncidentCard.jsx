import React from 'react'
import { useDashboard } from '../../../context/DashboardContext'
const OpenIncidentsCard = () => {
const { data } = useDashboard()
const incidents = data?.stats?.openIncidents ?? '—'
return (
<div className="card">
<div className="text-sm text-gray-400">Open Incidents</div>
<div className="text-3xl font-bold mt-2">{incidents}</div>
<div className="text-sm text-gray-500">critical: 2</div>
</div>
)
}
export default OpenIncidentsCard