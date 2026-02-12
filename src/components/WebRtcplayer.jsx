import { useEffect, useRef } from "react";

export default function WebRTCPlayer({ url }) {
  const videoRef = useRef(null);

  useEffect(() => {
    const pc = new RTCPeerConnection();

    pc.ontrack = (event) => {
      videoRef.current.srcObject = event.streams[0];
    };

    pc.addTransceiver("video", { direction: "recvonly" });

    async function start() {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/sdp" },
        body: offer.sdp,
      });

      const answer = await res.text();
      await pc.setRemoteDescription({ type: "answer", sdp: answer });
    }

    start();
    return () => pc.close();
  }, [url]);

  return (
    <video
      ref={videoRef}
      autoPlay
      playsInline
      muted
      className="w-full h-full object-cover"
    />
  );
}
