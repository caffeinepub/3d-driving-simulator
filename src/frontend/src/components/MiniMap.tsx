import { useCallback, useEffect, useRef } from "react";
import type { CarState } from "../hooks/useCarController";

interface MiniMapProps {
  carState: React.RefObject<CarState>;
}

const MAP_SIZE = 180;
const CITY_SIZE = 240;
const BLOCK_SIZE = 24;
const ROAD_WIDTH = 8;
const NUM_BLOCKS = 9;

const SCALE = MAP_SIZE / CITY_SIZE;

// World -> minimap coordinates
function worldToMap(x: number, z: number): [number, number] {
  const mx = (x + CITY_SIZE / 2) * SCALE;
  const mz = (z + CITY_SIZE / 2) * SCALE;
  return [mx, mz];
}

export function MiniMap({ carState }: MiniMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const state = carState.current;

    // Background
    ctx.fillStyle = "#0d111a";
    ctx.beginPath();
    ctx.arc(MAP_SIZE / 2, MAP_SIZE / 2, MAP_SIZE / 2, 0, Math.PI * 2);
    ctx.fill();

    // Clip to circle
    ctx.save();
    ctx.beginPath();
    ctx.arc(MAP_SIZE / 2, MAP_SIZE / 2, MAP_SIZE / 2 - 2, 0, Math.PI * 2);
    ctx.clip();

    // Draw city blocks (lighter background for blocks)
    ctx.fillStyle = "#1e2330";
    for (let bx = 0; bx < NUM_BLOCKS; bx++) {
      for (let bz = 0; bz < NUM_BLOCKS; bz++) {
        const worldX =
          -CITY_SIZE / 2 + ROAD_WIDTH / 2 + bx * BLOCK_SIZE + ROAD_WIDTH / 2;
        const worldZ =
          -CITY_SIZE / 2 + ROAD_WIDTH / 2 + bz * BLOCK_SIZE + ROAD_WIDTH / 2;
        const [mx, mz] = worldToMap(worldX, worldZ);
        const blockPx = (BLOCK_SIZE - ROAD_WIDTH) * SCALE;
        ctx.fillRect(mx, mz, blockPx, blockPx);
      }
    }

    // Draw roads
    ctx.fillStyle = "#0d111a";
    for (let i = 0; i <= NUM_BLOCKS; i++) {
      const pos = -CITY_SIZE / 2 + i * BLOCK_SIZE;
      const roadPx = ROAD_WIDTH * SCALE;

      // Vertical road
      const [vx, vz] = worldToMap(pos - ROAD_WIDTH / 2, -CITY_SIZE / 2);
      ctx.fillRect(vx, vz, roadPx, MAP_SIZE);

      // Horizontal road
      const [hx, hz] = worldToMap(-CITY_SIZE / 2, pos - ROAD_WIDTH / 2);
      ctx.fillRect(hx, hz, MAP_SIZE, roadPx);
    }

    // Road lines
    ctx.strokeStyle = "rgba(255,204,0,0.4)";
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= NUM_BLOCKS; i++) {
      const pos = -CITY_SIZE / 2 + i * BLOCK_SIZE;
      const [vx] = worldToMap(pos, 0);
      ctx.beginPath();
      ctx.moveTo(vx, 0);
      ctx.lineTo(vx, MAP_SIZE);
      ctx.stroke();

      const [, hz] = worldToMap(0, pos);
      ctx.beginPath();
      ctx.moveTo(0, hz);
      ctx.lineTo(MAP_SIZE, hz);
      ctx.stroke();
    }

    // Car dot with direction arrow
    const [cx, cz] = worldToMap(state.position.x, state.position.z);

    // Car shadow/glow
    const gradient = ctx.createRadialGradient(cx, cz, 0, cx, cz, 8);
    gradient.addColorStop(0, "rgba(80,255,140,0.6)");
    gradient.addColorStop(1, "rgba(80,255,140,0)");
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(cx, cz, 8, 0, Math.PI * 2);
    ctx.fill();

    // Direction arrow
    const rot = state.rotation;
    ctx.save();
    ctx.translate(cx, cz);
    ctx.rotate(rot);

    ctx.fillStyle = "#50ff8c";
    ctx.beginPath();
    ctx.moveTo(0, -5);
    ctx.lineTo(3, 3);
    ctx.lineTo(0, 1);
    ctx.lineTo(-3, 3);
    ctx.closePath();
    ctx.fill();

    ctx.restore();

    ctx.restore(); // restore clip

    // Border ring
    ctx.strokeStyle = "rgba(80,255,140,0.4)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(MAP_SIZE / 2, MAP_SIZE / 2, MAP_SIZE / 2 - 1, 0, Math.PI * 2);
    ctx.stroke();

    animFrameRef.current = requestAnimationFrame(draw);
  }, [carState]);

  useEffect(() => {
    animFrameRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [draw]);

  return (
    <div
      className="minimap-container"
      style={{
        position: "absolute",
        bottom: "24px",
        right: "24px",
        width: `${MAP_SIZE}px`,
        height: `${MAP_SIZE}px`,
        borderRadius: "50%",
        overflow: "hidden",
        zIndex: 100,
      }}
    >
      <canvas
        ref={canvasRef}
        data-ocid="minimap.canvas_target"
        width={MAP_SIZE}
        height={MAP_SIZE}
        style={{
          display: "block",
          borderRadius: "50%",
        }}
      />
      {/* MAP label */}
      <div
        style={{
          position: "absolute",
          top: "8px",
          left: "50%",
          transform: "translateX(-50%)",
          fontFamily: '"Geist Mono", monospace',
          fontSize: "9px",
          fontWeight: 700,
          letterSpacing: "0.18em",
          color: "rgba(80,255,140,0.8)",
          textTransform: "uppercase",
          textShadow: "0 0 8px rgba(80,255,140,0.5)",
          pointerEvents: "none",
        }}
      >
        MAP
      </div>
    </div>
  );
}
