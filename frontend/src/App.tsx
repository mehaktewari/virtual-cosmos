import { useEffect, useState } from "react";
import { socket } from "./socket";

export default function App() {
  const [connected, setConnected] = useState(false);
  const [socketId, setSocketId] = useState("");

  useEffect(() => {
    socket.connect();

    socket.on("connect", () => {
      setConnected(true);
      setSocketId(socket.id || "");
      console.log("Connected:", socket.id);
    });
    
    socket.on("welcome", (data) => {
      console.log(data.message);
    });

    socket.on("disconnect", () => {
      setConnected(false);
      console.log("Disconnected");
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
    };
  }, []);

  return (
    <div className="h-full flex flex-col items-center justify-center bg-gray-900 text-white gap-4">
      <h1 className="text-3xl font-bold">🌌 Virtual Cosmos</h1>

      <div className="text-lg">
        Status:{" "}
        <span className={connected ? "text-green-400" : "text-red-400"}>
          {connected ? "Connected" : "Disconnected"}
        </span>
      </div>

      {connected && (
        <div className="text-sm text-gray-400">
          Socket ID: {socketId}
        </div>
      )}
    </div>
  );
}