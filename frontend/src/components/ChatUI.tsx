import { useState, useEffect, useRef } from "react";

interface Props {
  visible: boolean;
  messages: any[];
  onSend: (msg: string) => void;
}

export default function ChatUI({ visible, messages, onSend }: Props) {
  const [input, setInput] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!visible) return null;

  const handleSend = () => {
    if (!input.trim()) return;
    onSend(input);
    setInput("");
  };

  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[360px] bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-4 text-white shadow-2xl">
      <div className="h-44 overflow-y-auto text-sm space-y-2 mb-3">
        {messages.map((msg, i) => (
          <div key={i} className="bg-white/10 px-2 py-1 rounded-md">
            <span className="text-green-300 font-semibold">
              {msg.username}:
            </span>{" "}
            {msg.text}
          </div>
        ))}
        <div ref={endRef} />
      </div>

      <div className="flex gap-2">
        <input
          className="flex-1 px-3 py-2 rounded-lg bg-black/30 outline-none"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type message..."
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <button
          onClick={handleSend}
          className="bg-green-500 px-4 rounded-lg text-black font-semibold"
        >
          Send
        </button>
      </div>
    </div>
  );
}