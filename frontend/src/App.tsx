import { useState } from "react";
import GameCanvas from "./components/GameCanvas";

export default function App() {
  const [step, setStep] = useState<"landing" | "name" | "game">("landing");
  const [username, setUsername] = useState("");

  // 🌌 LANDING PAGE
  if (step === "landing") {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-gradient-to-br from-[#020617] via-[#0f172a] to-[#020617] text-white">
        <div className="text-center space-y-6">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Virtual Cosmos
          </h1>

          <p className="text-gray-400">
            Real-time proximity social experience
          </p>

          <button
            onClick={() => setStep("name")}
            className="px-6 py-3 bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl hover:bg-white/20 transition"
          >
            Enter Universe →
          </button>
        </div>
      </div>
    );
  }

  // 🧑 NAME PAGE
  if (step === "name") {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-gradient-to-br from-[#020617] via-[#0f172a] to-[#020617] text-white">
        <div className="bg-white/10 backdrop-blur-xl p-8 rounded-2xl w-96 border border-white/20 shadow-2xl">
          <h2 className="text-2xl font-semibold mb-4 text-center">
            Enter Your Name
          </h2>

          <input
            className="w-full p-3 mb-4 rounded-lg bg-black/30 outline-none"
            placeholder="Your name..."
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <button
            onClick={() => username && setStep("game")}
            className="w-full bg-green-500 text-black py-3 rounded-lg font-semibold"
          >
            Start Exploring →
          </button>
        </div>
      </div>
    );
  }

  // 🎮 GAME
  return <GameCanvas username={username} />;
}