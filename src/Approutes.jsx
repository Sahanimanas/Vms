import {Routes, Route} from 'react-router-dom'
import DashboardPage from './pages/DashboardPage'
import IncidentManagementPage from './pages/IncidentManagementPage'
import AnalyticsReportsPage from './pages/AnalyticsReportsPage'
import PlaybackPage from './pages/Playback'
import Setting from './pages/Setting'
const Approutes = () => {
  return (
    <Routes>
      <Route path='/' element={<DashboardPage/>}/>
      <Route path='/incidents' element={<IncidentManagementPage/>}/>
      <Route path='/analytics' element={<AnalyticsReportsPage/>}/>
      <Route path='/playback' element={<PlaybackPage/>}/>
      <Route path='/settings' element={<Setting/>}/>
      <Route path='*' element={<div>404 Not Found</div>}/>

    </Routes>
  )
}

export default Approutes