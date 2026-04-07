import { useEffect, useRef, useState } from "react";
import * as PIXI from "pixi.js";
import { socket } from "../socket";
import ChatUI from "./ChatUI";

interface Props {
  username: string;
}

export default function GameCanvas({ username }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<any[]>([]);
  const [chatActive, setChatActive] = useState(false);

  useEffect(() => {
    const app = new PIXI.Application({
      resizeTo: window,
      backgroundColor: 0x0f172a,
      antialias: true,
    });

    if (containerRef.current) {
      containerRef.current.innerHTML = "";
      containerRef.current.appendChild(app.view as HTMLCanvasElement);
    }

    /**
     * 🟦 GRID
     */
    const grid = new PIXI.Graphics();
    const gridSize = 50;

    const drawGrid = () => {
      grid.clear();
      grid.lineStyle(1, 0x1e293b, 0.5);

      const width = app.renderer.width;
      const height = app.renderer.height;

      for (let x = 0; x < width; x += gridSize) {
        grid.moveTo(x, 0);
        grid.lineTo(x, height);
      }

      for (let y = 0; y < height; y += gridSize) {
        grid.moveTo(0, y);
        grid.lineTo(width, y);
      }
    };

    drawGrid();
    app.stage.addChild(grid);

    /**
     * 🧍 PLAYERS
     */
    const playerGraphics: Record<string, PIXI.Graphics> = {};
    const playerLabels: Record<string, PIXI.Text> = {};
    let allPlayers: Record<string, any> = {};

    /**
     * 🧠 LOCAL PLAYER
     */
    const player = { x: 400, y: 300 };
    const speed = 3;

    const PROXIMITY_RADIUS = 120;

    /**
     * 🔵 PROXIMITY CIRCLE
     */
    const proximityCircle = new PIXI.Graphics();
    app.stage.addChild(proximityCircle);

    /**
     * 🎮 INPUT
     */
    const keys: Record<string, boolean> = {};

    const handleKeyDown = (e: KeyboardEvent) => {
      keys[e.key.toLowerCase()] = true;
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keys[e.key.toLowerCase()] = false;
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    /**
     * 📡 RECEIVE PLAYERS
     */
    socket.emit("join", { username });

    socket.on("players", (players: any) => {
      allPlayers = players;

      Object.keys(players).forEach((id) => {
        if (!playerGraphics[id]) {
          const g = new PIXI.Graphics();
          g.beginFill(0x38bdf8);
          g.drawCircle(0, 0, 15);
          g.endFill();

          const label = new PIXI.Text(players[id].username || "User", {
            fontSize: 12,
            fill: 0xffffff,
          });
          label.anchor.set(0.5);

          app.stage.addChild(g);
          app.stage.addChild(label);

          playerGraphics[id] = g;
          playerLabels[id] = label;
        }

        playerGraphics[id].x = players[id].x;
        playerGraphics[id].y = players[id].y;

        playerLabels[id].x = players[id].x;
        playerLabels[id].y = players[id].y - 25;
      });

      // Remove disconnected
      Object.keys(playerGraphics).forEach((id) => {
        if (!players[id]) {
          app.stage.removeChild(playerGraphics[id]);
          app.stage.removeChild(playerLabels[id]);
          delete playerGraphics[id];
          delete playerLabels[id];
        }
      });
    });

    /**
     * 💬 CHAT
     */
    socket.on("chat", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    /**
     * 📏 DISTANCE
     */
    const getDistance = (x1: number, y1: number, x2: number, y2: number) => {
      return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    };

    /**
     * ⚡ GAME LOOP
     */
    app.ticker.add(() => {
      let moved = false;

      if (keys["w"] || keys["arrowup"]) {
        player.y -= speed;
        moved = true;
      }
      if (keys["s"] || keys["arrowdown"]) {
        player.y += speed;
        moved = true;
      }
      if (keys["a"] || keys["arrowleft"]) {
        player.x -= speed;
        moved = true;
      }
      if (keys["d"] || keys["arrowright"]) {
        player.x += speed;
        moved = true;
      }

      if (moved) socket.emit("move", player);

      let nearby = false;

      Object.keys(allPlayers).forEach((id) => {
        const other = allPlayers[id];
        const graphic = playerGraphics[id];

        if (!graphic) return;

        if (id === socket.id) {
          graphic.tint = 0x22c55e; // GREEN
          return;
        }

        const dist = getDistance(player.x, player.y, other.x, other.y);

        if (dist < PROXIMITY_RADIUS) {
          graphic.tint = 0xfacc15; // YELLOW
          nearby = true;
        } else {
          graphic.tint = 0x38bdf8; // BLUE
        }
      });

      setChatActive(nearby);

      // Draw circle
      proximityCircle.clear();
      proximityCircle.lineStyle(2, 0x22c55e, 0.6);
      proximityCircle.drawCircle(player.x, player.y, PROXIMITY_RADIUS);
    });

    return () => {
      socket.off("players");
      socket.off("chat");
      app.destroy(true, true);
    };
  }, [username]);

  const sendMessage = (msg: string) => {
    socket.emit("chat", msg);
  };

  return (
    <>
      <div ref={containerRef} className="w-full h-full" />
      <ChatUI visible={chatActive} messages={messages} onSend={sendMessage} />
    </>
  );
}