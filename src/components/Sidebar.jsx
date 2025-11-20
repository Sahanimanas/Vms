import React from 'react'
import { Link } from 'react-router-dom'
const Sidebar = () => {
 
const [isOpen, setIsOpen] = React.useState(true);


   return( 
<aside className="w-64 bg-gray-900 p-4 h-full border-r border-gray-800">
<div className="mb-6 text-white font-bold text-xl">RefineVMS</div>
<nav className="space-y-2 flex flex-col text-sm text-gray-300">
<Link to='/' className="px-3 py-2 rounded-lg hover:bg-gray-800" >Dashboard</Link>
<Link to='/incidents' className="px-3 py-2 rounded-lg hover:bg-gray-800">Incidents</Link>
<Link to='/analytics' className="px-3 py-2 rounded-lg hover:bg-gray-800">PPE Analytics</Link>
<Link to='/playback' className="px-3 py-2 rounded-lg hover:bg-gray-800">Playback</Link>
{/* <Link to='/reports' className="px-3 py-2 rounded-lg hover:bg-gray-800">Reports</Link> */}
<Link to='/settings' className="px-3 py-2 rounded-lg hover:bg-gray-800">Settings</Link>
</nav>
</aside>
)
}
export default Sidebar