import { useState } from "react";

interface Props {
  visible: boolean;
  messages: any[];
  onSend: (msg: string) => void;
}

export default function ChatUI({ visible, messages, onSend }: Props) {
  const [input, setInput] = useState("");

  if (!visible) return null;

  const handleSend = () => {
    if (!input.trim()) return;
    onSend(input);
    setInput("");
  };

  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[320px] bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-3 text-white shadow-xl">
      <div className="h-40 overflow-y-auto text-sm space-y-1 mb-2">
        {messages.map((msg, i) => (
          <div key={i}>
            <span className="text-green-300 font-semibold">
              {msg.id.slice(0, 4)}:
            </span>{" "}
            {msg.text}
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          className="flex-1 px-2 py-1 rounded bg-black/30 outline-none"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Say something..."
        />
        <button
          onClick={handleSend}
          className="bg-green-500 px-3 rounded text-black font-semibold"
        >
          Send
        </button>
      </div>
    </div>
  );
}