import { useCallback, useEffect, useRef } from "react";
import type { CarState } from "../hooks/useCarController";

interface SpeedometerHUDProps {
  carState: React.RefObject<CarState>;
}

const GAUGE_SIZE = 140;
const CENTER = GAUGE_SIZE / 2;
const RADIUS = 52;
const START_ANGLE = Math.PI * 0.75;
const END_ANGLE = Math.PI * 2.25;
const MAX_SPEED_KMH = 108; // 30 units/s * 3.6

export function SpeedometerHUD({ carState }: SpeedometerHUDProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);
  const displaySpeed = useRef(0);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rawSpeed = carState.current.speed;
    const targetKmh = Math.abs(rawSpeed) * 3.6;

    // Smooth display speed
    displaySpeed.current += (targetKmh - displaySpeed.current) * 0.15;
    const kmh = Math.round(displaySpeed.current);
    const fraction = Math.min(displaySpeed.current / MAX_SPEED_KMH, 1);

    ctx.clearRect(0, 0, GAUGE_SIZE, GAUGE_SIZE);

    // Background circle
    ctx.fillStyle = "rgba(5, 8, 18, 0.0)";
    ctx.beginPath();
    ctx.arc(CENTER, CENTER, RADIUS + 8, 0, Math.PI * 2);
    ctx.fill();

    // Track arc (background)
    ctx.beginPath();
    ctx.arc(CENTER, CENTER, RADIUS, START_ANGLE, END_ANGLE);
    ctx.strokeStyle = "rgba(80,255,140,0.12)";
    ctx.lineWidth = 7;
    ctx.lineCap = "round";
    ctx.stroke();

    // Speed arc — color shifts from green to amber to red
    if (fraction > 0) {
      const currentAngle = START_ANGLE + (END_ANGLE - START_ANGLE) * fraction;
      const gradient = ctx.createLinearGradient(
        CENTER - RADIUS,
        CENTER,
        CENTER + RADIUS,
        CENTER,
      );
      gradient.addColorStop(0, "#50ff8c");
      gradient.addColorStop(0.6, "#a0ff50");
      gradient.addColorStop(0.85, "#ffcc00");
      gradient.addColorStop(1, "#ff4422");

      ctx.beginPath();
      ctx.arc(CENTER, CENTER, RADIUS, START_ANGLE, currentAngle);
      ctx.strokeStyle = gradient;
      ctx.lineWidth = 7;
      ctx.lineCap = "round";
      ctx.stroke();

      // Glow on arc end
      const tipX = CENTER + Math.cos(currentAngle) * RADIUS;
      const tipY = CENTER + Math.sin(currentAngle) * RADIUS;
      const glow = ctx.createRadialGradient(tipX, tipY, 0, tipX, tipY, 10);
      glow.addColorStop(0, "rgba(80,255,140,0.7)");
      glow.addColorStop(1, "rgba(80,255,140,0)");
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(tipX, tipY, 10, 0, Math.PI * 2);
      ctx.fill();
    }

    // Tick marks
    const numTicks = 9;
    for (let i = 0; i <= numTicks; i++) {
      const tickFrac = i / numTicks;
      const angle = START_ANGLE + (END_ANGLE - START_ANGLE) * tickFrac;
      const isMain = i % 3 === 0;
      const innerR = isMain ? RADIUS - 12 : RADIUS - 8;
      const outerR = RADIUS - 2;

      ctx.beginPath();
      ctx.moveTo(
        CENTER + Math.cos(angle) * innerR,
        CENTER + Math.sin(angle) * innerR,
      );
      ctx.lineTo(
        CENTER + Math.cos(angle) * outerR,
        CENTER + Math.sin(angle) * outerR,
      );
      ctx.strokeStyle = isMain
        ? "rgba(80,255,140,0.7)"
        : "rgba(80,255,140,0.3)";
      ctx.lineWidth = isMain ? 1.5 : 0.8;
      ctx.stroke();

      // Speed labels on main ticks
      if (isMain) {
        const labelKmh = Math.round((tickFrac * MAX_SPEED_KMH) / 10) * 10;
        const labelR = RADIUS - 20;
        ctx.fillStyle = "rgba(140,200,160,0.6)";
        ctx.font = `bold 7px "Geist Mono", monospace`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(
          `${labelKmh}`,
          CENTER + Math.cos(angle) * labelR,
          CENTER + Math.sin(angle) * labelR,
        );
      }
    }

    // Speed number
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // Glow effect
    ctx.shadowColor = "rgba(80,255,140,0.8)";
    ctx.shadowBlur = 12;
    ctx.fillStyle = "#50ff8c";
    ctx.font = `bold 28px "Geist Mono", monospace`;
    ctx.fillText(`${kmh}`, CENTER, CENTER + 2);

    // Reset shadow
    ctx.shadowBlur = 0;

    // KM/H label
    ctx.fillStyle = "rgba(80,255,140,0.5)";
    ctx.font = `600 8px "Sora", sans-serif`;
    ctx.fillText("km/h", CENTER, CENTER + 20);

    // Gear / direction indicator
    const isReversing = rawSpeed < -0.5;
    const isIdle = Math.abs(rawSpeed) < 0.5;
    const gearLabel = isReversing ? "R" : isIdle ? "P" : "D";
    const gearColor = isReversing
      ? "#ff4422"
      : isIdle
        ? "rgba(80,255,140,0.4)"
        : "#50ff8c";

    ctx.fillStyle = gearColor;
    ctx.shadowColor = isIdle ? "transparent" : gearColor;
    ctx.shadowBlur = 8;
    ctx.font = `bold 11px "Geist Mono", monospace`;
    ctx.fillText(gearLabel, CENTER, CENTER - 18);
    ctx.shadowBlur = 0;

    animFrameRef.current = requestAnimationFrame(draw);
  }, [carState]);

  useEffect(() => {
    animFrameRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [draw]);

  return (
    <div
      className="hud-panel"
      style={{
        position: "absolute",
        bottom: "24px",
        left: "50%",
        transform: "translateX(-50%)",
        width: `${GAUGE_SIZE + 24}px`,
        height: `${GAUGE_SIZE + 24}px`,
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100,
        padding: "0",
      }}
    >
      <canvas
        ref={canvasRef}
        width={GAUGE_SIZE}
        height={GAUGE_SIZE}
        style={{ display: "block" }}
      />
    </div>
  );
}
