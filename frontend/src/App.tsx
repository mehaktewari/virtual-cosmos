import { useEffect, useState } from "react";
import { socket } from "./socket";
import GameCanvas from "./components/GameCanvas";

export default function App() {
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    socket.connect();

    socket.on("connect", () => {
      setConnected(true);
    });

    socket.on("disconnect", () => {
      setConnected(false);
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
    };
  }, []);

  return (
    <div className="w-screen h-screen relative overflow-hidden">
      <GameCanvas />

      <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-md px-4 py-2 rounded-lg text-white text-sm">
        {connected ? "🟢 Connected" : "🔴 Disconnected"}
      </div>
    </div>
  );
}