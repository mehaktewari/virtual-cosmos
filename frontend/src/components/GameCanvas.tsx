import { useEffect, useRef } from "react";
import * as PIXI from "pixi.js";

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
     * 🟦 GRID BACKGROUND
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
     * 🧍 PLAYER
     */
    const player = new PIXI.Graphics();
    player.beginFill(0x38bdf8); // cyan
    player.drawCircle(0, 0, 15);
    player.endFill();

    player.x = app.renderer.width / 2;
    player.y = app.renderer.height / 2;

    app.stage.addChild(player);

    /**
     * 🎮 INPUT HANDLING
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
     * ⚡ GAME LOOP
     */
    const speed = 3;

    app.ticker.add(() => {
      if (keys["w"] || keys["arrowup"]) {
        player.y -= speed;
      }
      if (keys["s"] || keys["arrowdown"]) {
        player.y += speed;
      }
      if (keys["a"] || keys["arrowleft"]) {
        player.x -= speed;
      }
      if (keys["d"] || keys["arrowright"]) {
        player.x += speed;
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
      app.destroy(true, true);
    };
  }, []);

  return <div ref={containerRef} className="w-full h-full" />;
}