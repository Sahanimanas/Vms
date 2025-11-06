import React from 'react'
import { useDashboard } from '../../../context/DashboardContext'
const PPEViolationsCard = () => {
const { data } = useDashboard()
const v = data?.stats?.ppeViolationsToday ?? '—'
return (
<div className="card">
<div className="text-sm text-gray-400">PPE Violations Today</div>
<div className="text-3xl font-bold mt-2">{v}</div>
<div className="text-sm text-gray-500">+3 from yesterday</div>
</div>
)
}

export default PPEViolationsCard