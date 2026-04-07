import { useEffect, useRef } from "react";
import * as PIXI from "pixi.js";
import { socket } from "../socket";

export default function GameCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);

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
     * 🧍 PLAYERS MAP
     */
    const playerGraphics: Record<string, PIXI.Graphics> = {};

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
     * 🧠 LOCAL PLAYER POSITION
     */
    const player = { x: 400, y: 300 };
    const speed = 3;

    /**
     * 📡 RECEIVE PLAYERS FROM SERVER
     */
    socket.on("players", (players: any) => {
      Object.keys(players).forEach((id) => {
        if (!playerGraphics[id]) {
          const g = new PIXI.Graphics();

          // Different color for self
          const isMe = id === socket.id;
          g.beginFill(isMe ? 0x22c55e : 0x38bdf8);
          g.drawCircle(0, 0, 15);
          g.endFill();

          app.stage.addChild(g);
          playerGraphics[id] = g;
        }

        playerGraphics[id].x = players[id].x;
        playerGraphics[id].y = players[id].y;
      });

      // Remove disconnected players
      Object.keys(playerGraphics).forEach((id) => {
        if (!players[id]) {
          app.stage.removeChild(playerGraphics[id]);
          delete playerGraphics[id];
        }
      });
    });

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

      // Send updates only if moved
      if (moved) {
        socket.emit("move", player);
      }
    });

    /**
     * 🧹 CLEANUP
     */
    const handleResize = () => drawGrid();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      socket.off("players");
      app.destroy(true, true);
    };
  }, []);

  return <div ref={containerRef} className="w-full h-full" />;
}