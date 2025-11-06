import React from 'react'
import Sidebar from '../Sidebar'
import Topbar from '../Topbar'
const DashboardLayout = ({ children }) => (
<div className="flex text-white h-screen">
<Sidebar />
<div className="flex-1 flex flex-col">
<Topbar />
<main className="p-6 overflow-auto">{children}</main>
</div>
</div>
)
export default DashboardLayout