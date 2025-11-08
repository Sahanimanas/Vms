import React from "react";
import { DashboardProvider } from "./context/DashboardContext";
import DashboardPage from "./pages/DashboardPage";
import IncidentManagementPage from "./pages/IncidentManagementPage";
import { IncidentProvider } from "./context/IncidentContext";
import { AnalyticsProvider } from "./context/AnalyticsContext";
import Approutes from "./Approutes";
function App() {
  return (
<AnalyticsProvider>
    <DashboardProvider>
      <IncidentProvider>
        <Approutes />
      </IncidentProvider>
    </DashboardProvider>
    </AnalyticsProvider>
  );
}
export default App;
