import AnalyticsLayout from "../components/Analytics/AnalyticsLayout";
import ReportFilters from "../components/Analytics/ReportFilters";
import TotalIncidentsCard from "../components/Analytics/SummaryCards/TotalIncidentsCard";
import AvgResolutionCard from "../components/Analytics/SummaryCards/AvgResolutionCards";
import PPEComplianceCard from "../components/Analytics/SummaryCards/PPEComplience";
import ActiveCamerasCard from "../components/Analytics/SummaryCards/ActiveCameraCard";
import IncidentTrendsChart from "../components/Analytics/Charts/IncidentTrendChart";
import TopViolatingZonesChart from "../components/Analytics/Charts/TopViolatingZonesChart";
import RecentCriticalIncidents from "../components/Analytics/Charts/RecentCriticalIncidents";
import SystemHealthOverview from "../components/Analytics/SystemHealth";
import ExportReports from "../components/Analytics/ExportsReports";

const AnalyticsReportsPage = () => (
  <AnalyticsLayout>
    <ReportFilters />

    {/* Summary Cards */}
    <div className="grid grid-cols-4 gap-4 mb-6">
      <TotalIncidentsCard />
      <AvgResolutionCard />
      <PPEComplianceCard />
      <ActiveCamerasCard />
    </div>

    {/* Charts */}
    <div className="grid grid-cols-2 gap-4 mb-6">
      <IncidentTrendsChart />
      <TopViolatingZonesChart />
    </div>

    {/* Bottom Section */}
    <div className="grid grid-cols-2 gap-4 mb-6">
      <RecentCriticalIncidents />
      <SystemHealthOverview />
    </div>

    <ExportReports />
  </AnalyticsLayout>
);
export default AnalyticsReportsPage;
