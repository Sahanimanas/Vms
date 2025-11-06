import {Routes, Route} from 'react-router-dom'
import DashboardPage from './pages/DashboardPage'
import IncidentManagementPage from './pages/IncidentManagementPage'

const Approutes = () => {
  return (
    <Routes>
      <Route path='/' element={<DashboardPage/>}/>
      <Route path='/incidents' element={<IncidentManagementPage/>}/>
    </Routes>
  )
}

export default Approutes