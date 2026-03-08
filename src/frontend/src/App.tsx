import { Canvas } from "@react-three/fiber";
import { useCallback, useEffect, useState } from "react";
import { CameraController } from "./components/CameraController";
import { Car } from "./components/Car";
import { CityScene } from "./components/CityScene";
import { MiniMap } from "./components/MiniMap";
import { SpeedometerHUD } from "./components/SpeedometerHUD";
import { useCarController } from "./hooks/useCarController";

type CameraMode = "thirdperson" | "topdown";

function DrivingSimulator() {
  const [cameraMode, setCameraMode] = useState<CameraMode>("thirdperson");
  const controller = useCarController();

  // Camera toggle with V or C key
  const handleCameraToggle = useCallback(() => {
    setCameraMode((prev) =>
      prev === "thirdperson" ? "topdown" : "thirdperson",
    );
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.code === "KeyV" || e.code === "KeyC") {
        handleCameraToggle();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [handleCameraToggle]);

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        position: "relative",
        overflow: "hidden",
        background: "#0a0d14",
      }}
    >
      {/* 3D Canvas */}
      <Canvas
        data-ocid="sim.canvas_target"
        shadows
        camera={{ fov: 60, near: 0.1, far: 500, position: [0, 65, 0] }}
        gl={{
          antialias: true,
          toneMapping: 2, // ACESFilmic
          toneMappingExposure: 1.2,
        }}
        style={{ width: "100%", height: "100%", display: "block" }}
      >
        <CityScene />
        <Car controller={controller} />
        <CameraController carState={controller.carState} mode={cameraMode} />
      </Canvas>

      {/* HUD Overlays */}

      {/* Instructions — top left */}
      <div
        className="hud-panel"
        style={{
          position: "absolute",
          top: "20px",
          left: "20px",
          padding: "12px 16px",
          borderRadius: "10px",
          zIndex: 100,
          minWidth: "220px",
        }}
      >
        <div
          style={{
            fontFamily: '"Geist Mono", monospace',
            fontSize: "9px",
            fontWeight: 700,
            letterSpacing: "0.16em",
            color: "rgba(80,255,140,0.6)",
            marginBottom: "8px",
            textTransform: "uppercase",
          }}
        >
          Controls
        </div>
        <div
          style={{
            fontFamily: '"Sora", sans-serif',
            fontSize: "11px",
            lineHeight: "1.9",
            color: "rgba(200,220,255,0.7)",
          }}
        >
          <span style={{ color: "rgba(80,255,140,0.8)" }}>W / ↑</span> —
          Accelerate
          <br />
          <span style={{ color: "rgba(80,255,140,0.8)" }}>S / ↓</span> — Brake /
          Reverse
          <br />
          <span style={{ color: "rgba(80,255,140,0.8)" }}>A / ←</span> — Steer
          Left
          <br />
          <span style={{ color: "rgba(80,255,140,0.8)" }}>D / →</span> — Steer
          Right
          <br />
          <span style={{ color: "rgba(80,255,140,0.8)" }}>V / C</span> — Toggle
          Camera
        </div>
      </div>

      {/* App title — top center */}
      <div
        style={{
          position: "absolute",
          top: "20px",
          left: "50%",
          transform: "translateX(-50%)",
          fontFamily: '"Bricolage Grotesque", sans-serif',
          fontSize: "15px",
          fontWeight: 700,
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: "rgba(80,255,140,0.85)",
          textShadow: "0 0 12px rgba(80,255,140,0.4)",
          zIndex: 100,
          userSelect: "none",
          pointerEvents: "none",
        }}
      >
        3D City Drive
      </div>

      {/* Camera toggle — top right */}
      <div
        style={{
          position: "absolute",
          top: "20px",
          right: "20px",
          zIndex: 100,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          gap: "8px",
        }}
      >
        <button
          type="button"
          data-ocid="camera.toggle"
          className="cam-toggle-btn"
          onClick={handleCameraToggle}
          aria-label={`Switch to ${cameraMode === "thirdperson" ? "top-down" : "third-person"} view`}
        >
          <span style={{ opacity: 0.5, marginRight: "6px" }}>📷</span>
          {cameraMode === "thirdperson" ? "3RD PERSON" : "TOP DOWN"}
        </button>
        <div
          style={{
            fontFamily: '"Geist Mono", monospace',
            fontSize: "9px",
            letterSpacing: "0.12em",
            color: "rgba(80,255,140,0.35)",
            textAlign: "right",
          }}
        >
          Press V to switch
        </div>
      </div>

      {/* Speedometer HUD — bottom center */}
      <SpeedometerHUD carState={controller.carState} />

      {/* Mini-map — bottom right */}
      <MiniMap carState={controller.carState} />

      {/* Scanline overlay for atmosphere */}
      <div
        className="scanline-overlay"
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          zIndex: 50,
        }}
      />

      {/* Footer */}
      <div
        style={{
          position: "absolute",
          bottom: "8px",
          left: "50%",
          transform: "translateX(-50%)",
          fontFamily: '"Sora", sans-serif',
          fontSize: "9px",
          color: "rgba(80,120,100,0.4)",
          zIndex: 100,
          pointerEvents: "none",
          letterSpacing: "0.05em",
          whiteSpace: "nowrap",
        }}
      >
        © {new Date().getFullYear()}. Built with love using{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            color: "rgba(80,255,140,0.4)",
            textDecoration: "none",
            pointerEvents: "all",
          }}
        >
          caffeine.ai
        </a>
      </div>
    </div>
  );
}

export default function App() {
  return <DrivingSimulator />;
}
