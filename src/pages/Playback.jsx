import PlaybackPage from "../components/playback/PlaybackPage";
import PlaybackLayout from "../components/playback/PlaybackLayout";
export default function Playback() {
  return (
    <PlaybackLayout>
    <div className="p-6">
      <PlaybackPage />
    </div>
    </PlaybackLayout>
  );
}
