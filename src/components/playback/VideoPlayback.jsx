import Card from "../common/Card";

export default function VideoPlayback() {
  return (
    <Card title="Video Playback">
      <div className="relative bg-black h-64 rounded-md flex items-center justify-center">
        <div className="text-gray-400 text-sm">No video selected</div>
      </div>
      <div className="mt-3 text-xs text-gray-400">Timeline</div>
      <div className="w-full h-2 bg-gray-700 rounded-full my-2">
        <div className="h-2 bg-amber-500 rounded-full" style={{ width: "45%" }}></div>
      </div>
      <div className="flex justify-between text-gray-500 text-xs">
        <span>14:00</span>
        <span>15:00</span>
      </div>
    </Card>
  );
}
