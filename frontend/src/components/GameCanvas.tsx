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
     * 🌍 WORLD CONTAINER (for camera)
     */
    const world = new PIXI.Container();
    app.stage.addChild(world);

    /**
     * 🟦 GRID
     */
    const grid = new PIXI.Graphics();
    const gridSize = 50;

    const drawGrid = () => {
      grid.clear();
      grid.lineStyle(1, 0x1e293b, 0.5);

      for (let x = -2000; x < 2000; x += gridSize) {
        grid.moveTo(x, -2000);
        grid.lineTo(x, 2000);
      }

      for (let y = -2000; y < 2000; y += gridSize) {
        grid.moveTo(-2000, y);
        grid.lineTo(2000, y);
      }
    };

    drawGrid();
    world.addChild(grid);

    /**
     * 🧍 PLAYERS
     */
    const playersMap: Record<string, any> = {};
    const playerGraphics: Record<string, PIXI.Graphics> = {};
    const labels: Record<string, PIXI.Text> = {};
    const bubbles: Record<string, PIXI.Text> = {};

    let allPlayers: Record<string, any> = {};

    const player = { x: 0, y: 0 };
    const speed = 3;
    const PROXIMITY_RADIUS = 120;

    const proximityCircle = new PIXI.Graphics();
    world.addChild(proximityCircle);

    /**
     * 🎮 INPUT
     */
    const keys: Record<string, boolean> = {};

    window.addEventListener("keydown", (e) => {
      keys[e.key.toLowerCase()] = true;
    });

    window.addEventListener("keyup", (e) => {
      keys[e.key.toLowerCase()] = false;
    });

    /**
     * 📡 JOIN
     */
    socket.emit("join", { username });

    /**
     * 📡 PLAYERS UPDATE
     */
    socket.on("players", (players) => {
      allPlayers = players;

      Object.keys(players).forEach((id) => {
        if (!playerGraphics[id]) {
          const g = new PIXI.Graphics();
          g.beginFill(0x38bdf8);
          g.drawCircle(0, 0, 15);
          g.endFill();

          const label = new PIXI.Text(players[id].username, {
            fontSize: 12,
            fill: 0xffffff,
          });
          label.anchor.set(0.5);

          const bubble = new PIXI.Text("", {
            fontSize: 10,
            fill: 0xffffff,
          });
          bubble.anchor.set(0.5);

          world.addChild(g);
          world.addChild(label);
          world.addChild(bubble);

          playerGraphics[id] = g;
          labels[id] = label;
          bubbles[id] = bubble;
        }
      });

      // remove disconnected
      Object.keys(playerGraphics).forEach((id) => {
        if (!players[id]) {
          world.removeChild(playerGraphics[id]);
          world.removeChild(labels[id]);
          world.removeChild(bubbles[id]);

          delete playerGraphics[id];
          delete labels[id];
          delete bubbles[id];
        }
      });
    });

    /**
     * 💬 CHAT
     */
    socket.on("chat", (msg) => {
      setMessages((prev) => [...prev, msg]);

      const bubble = bubbles[msg.id];
      if (bubble) {
        bubble.text = msg.text;

        setTimeout(() => {
          bubble.text = "";
        }, 3000);
      }
    });

    /**
     * 📏 DISTANCE
     */
    const dist = (x1: number, y1: number, x2: number, y2: number) =>
      Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);

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
        const p = allPlayers[id];
        const g = playerGraphics[id];

        if (!g) return;

        // 🎯 SMOOTH INTERPOLATION
        g.x += (p.x - g.x) * 0.2;
        g.y += (p.y - g.y) * 0.2;

        labels[id].x = g.x;
        labels[id].y = g.y - 25;

        bubbles[id].x = g.x;
        bubbles[id].y = g.y - 45;

        if (id === socket.id) {
          g.tint = 0x22c55e;
        } else {
          const d = dist(player.x, player.y, p.x, p.y);

          if (d < PROXIMITY_RADIUS) {
            g.tint = 0xfacc15;
            nearby = true;
          } else {
            g.tint = 0x38bdf8;
          }
        }
      });

      setChatActive(nearby);

      // 🎥 CAMERA FOLLOW
      world.x = window.innerWidth / 2 - player.x;
      world.y = window.innerHeight / 2 - player.y;

      // 🔵 PROXIMITY CIRCLE
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