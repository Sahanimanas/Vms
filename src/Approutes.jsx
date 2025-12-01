import {Routes, Route} from 'react-router-dom'
import DashboardPage from './pages/DashboardPage'
import IncidentManagementPage from './pages/IncidentManagementPage'
import AnalyticsReportsPage from './pages/AnalyticsReportsPage'
import PlaybackPage from './pages/Playback'
const Approutes = () => {
  return (
    <Routes>
      <Route path='/' element={<DashboardPage/>}/>
      <Route path='/incidents' element={<IncidentManagementPage/>}/>
      <Route path='/analytics' element={<AnalyticsReportsPage/>}/>
      <Route path='/playback' element={<PlaybackPage/>}/>
    </Routes>
  )
}

export default Approutes