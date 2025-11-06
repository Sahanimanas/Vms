import IncidentLayout from "../components/Incident/IncidentLayout";
import CriticalIncidentsCard from "../components/Incident/SummaryCards/CriticalIncidentsCard";
import MajorIncidentsCard from "../components/Incident/SummaryCards/MajorIncidentsCard";
import MinorIncidentsCard from "../components/Incident/SummaryCards/MinorIncidentsCard";
import ResolvedTodayCard from "../components/Incident/SummaryCards/ResolvedTodayCard";
import ActiveIncidentsTable from "../components/Incident/ActiveIncidentsTable";
import IncidentDetailsPanel from "../components/Incident/IncidentDetailsPanel";

const IncidentManagementPage = () => (
  <IncidentLayout>
    <div className="grid grid-cols-4 gap-4">
      <CriticalIncidentsCard />
      <MajorIncidentsCard />
      <MinorIncidentsCard />
      <ResolvedTodayCard />
    </div>

    <div className="grid grid-cols-3 gap-4 mt-6">
      <div className="col-span-2">
        <ActiveIncidentsTable />
      </div>
      <div className="col-span-1">
        <IncidentDetailsPanel />
      </div>
    </div>
  </IncidentLayout>
);
export default IncidentManagementPage;
