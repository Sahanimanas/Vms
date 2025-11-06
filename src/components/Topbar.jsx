import React from 'react'
const Topbar = () => (
<header className="flex items-center justify-between p-4 border-b bordergray-800 bg-gray-900">
<div className="text-lg font-semibold">Control Dashboard</div>
<div className="flex items-center gap-4">
<div className="text-sm text-gray-400">System Online <span className='w-3 h-3 text-amber-100 bg-green-600 rounded-full'></span></div>
<button className="px-3 py-1 rounded-lg text-red-400 bg-gray-800">Alerts</button>
</div>
</header>
)
export default Topbar