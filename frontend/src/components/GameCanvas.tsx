import { useEffect, useRef } from "react";
import * as PIXI from "pixi.js";

export default function GameCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // ✅ Create Pixi app (v7 style)
    const app = new PIXI.Application({
      resizeTo: window,
      backgroundColor: 0x0f172a,
      antialias: true,
    });

    // ✅ Attach canvas
    if (containerRef.current) {
      containerRef.current.innerHTML = "";
      containerRef.current.appendChild(app.view as HTMLCanvasElement);
    }

    // ✅ Create grid
    const grid = new PIXI.Graphics();
    const gridSize = 50;

    const drawGrid = () => {
      grid.clear();
      grid.lineStyle(1, 0x1e293b, 0.5);

      const width = app.renderer.width;
      const height = app.renderer.height;

      // Vertical lines
      for (let x = 0; x < width; x += gridSize) {
        grid.moveTo(x, 0);
        grid.lineTo(x, height);
      }

      // Horizontal lines
      for (let y = 0; y < height; y += gridSize) {
        grid.moveTo(0, y);
        grid.lineTo(width, y);
      }
    };

    drawGrid();
    app.stage.addChild(grid);

    // Resize handling
    const handleResize = () => {
      drawGrid();
    };

    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      app.destroy(true, true);
    };
  }, []);

  return <div ref={containerRef} className="w-full h-full" />;
}