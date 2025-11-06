import React from "react";
import { DashboardProvider } from "./context/DashboardContext";
import DashboardPage from "./pages/DashboardPage";
import IncidentManagementPage from "./pages/IncidentManagementPage";
import { IncidentProvider } from "./context/IncidentContext";
import Approutes from "./Approutes";
function App() {
  return (
    <DashboardProvider>
      <IncidentProvider>
        <Approutes />
      </IncidentProvider>
    </DashboardProvider>
  );
}
export default App;
