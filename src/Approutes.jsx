import {Routes, Route} from 'react-router-dom'
import DashboardPage from './pages/DashboardPage'
import IncidentManagementPage from './pages/IncidentManagementPage'
import AnalyticsReportsPage from './pages/AnalyticsReportsPage'

const Approutes = () => {
  return (
    <Routes>
      <Route path='/' element={<DashboardPage/>}/>
      <Route path='/incidents' element={<IncidentManagementPage/>}/>
      <Route path='/analytics' element={<AnalyticsReportsPage/>}/>
    </Routes>
  )
}

export default Approutes