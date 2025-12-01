import EventSearch from "./EventSearch";
import EventCalendar from "./EventCalendar";
import SearchResults from "./SearchResults";
import VideoPlayback from "./VideoPlayback";
import EventStatistics from "./EventStatistics";
// import AIAnalysis from "./AIAnalysis";
import ExportOptions from "./ExportOptions";

export default function PlaybackPage() {
  return (
    <div className="grid grid-cols-12 gap-6">
      <div className="col-span-3 space-y-4">
        <EventSearch />
        <EventCalendar />
      </div>

      <div className="col-span-4">
        <SearchResults />
      </div>

      <div className="col-span-5 space-y-4">
        <VideoPlayback />
        <div className="grid grid-cols-3 gap-4">
          <EventStatistics />
          {/* <AIAnalysis /> */}
          <ExportOptions />
        </div>
      </div>
    </div>
  );
}
