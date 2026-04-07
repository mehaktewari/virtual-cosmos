import { useState } from "react";
import GameCanvas from "./components/GameCanvas";

export default function App() {
  const [username, setUsername] = useState("");
  const [entered, setEntered] = useState(false);

  if (!entered) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-gray-900 text-white">
        <div className="bg-white/10 backdrop-blur-md p-6 rounded-xl w-80">
          <h1 className="text-xl font-bold mb-4 text-center">
            Enter Your Name
          </h1>

          <input
            className="w-full p-2 mb-3 rounded bg-black/30 outline-none"
            placeholder="Your name..."
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <button
            onClick={() => username && setEntered(true)}
            className="w-full bg-green-500 text-black py-2 rounded font-semibold"
          >
            Enter
          </button>
        </div>
      </div>
    );
  }

  return <GameCanvas username={username} />;
}