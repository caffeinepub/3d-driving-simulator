import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type * as THREE from "three";
import type { CarControllerResult } from "../hooks/useCarController";

interface CarProps {
  controller: CarControllerResult;
}

// Wheel with rotation tracking
function AnimatedWheel({
  x,
  z,
  speedRef,
}: {
  x: number;
  z: number;
  speedRef: React.MutableRefObject<number>;
}) {
  const wheelRef = useRef<THREE.Mesh>(null!);
  const rotX = useRef(0);

  useFrame((_, delta) => {
    rotX.current += speedRef.current * delta * 0.5;
    if (wheelRef.current) {
      wheelRef.current.rotation.x = rotX.current;
    }
  });

  return (
    <mesh
      ref={wheelRef}
      position={[x, -0.3, z]}
      rotation={[0, 0, Math.PI / 2]}
      castShadow
    >
      <cylinderGeometry args={[0.45, 0.45, 0.3, 12]} />
      <meshStandardMaterial color="#1a1a1a" roughness={0.8} metalness={0.1} />
    </mesh>
  );
}

export function Car({ controller }: CarProps) {
  const { carRef, carState } = controller;
  const speedRef = useRef(0);

  useFrame(() => {
    speedRef.current = carState.current.speed;
  });

  return (
    <group ref={carRef} castShadow>
      {/* Car body */}
      <mesh position={[0, 0.5, 0]} castShadow>
        <boxGeometry args={[1.8, 0.7, 3.8]} />
        <meshStandardMaterial
          color="#cc2200"
          roughness={0.3}
          metalness={0.6}
          envMapIntensity={1.0}
        />
      </mesh>

      {/* Car front hood slope */}
      <mesh position={[0, 0.75, -1.1]} rotation={[0.25, 0, 0]} castShadow>
        <boxGeometry args={[1.75, 0.15, 0.8]} />
        <meshStandardMaterial color="#bb1e00" roughness={0.3} metalness={0.5} />
      </mesh>

      {/* Car trunk slope */}
      <mesh position={[0, 0.75, 1.1]} rotation={[-0.2, 0, 0]} castShadow>
        <boxGeometry args={[1.75, 0.15, 0.8]} />
        <meshStandardMaterial color="#bb1e00" roughness={0.3} metalness={0.5} />
      </mesh>

      {/* Cabin */}
      <mesh position={[0, 1.15, 0.2]} castShadow>
        <boxGeometry args={[1.55, 0.65, 1.9]} />
        <meshStandardMaterial
          color="#991800"
          roughness={0.25}
          metalness={0.4}
        />
      </mesh>

      {/* Windshield front */}
      <mesh position={[0, 1.05, -0.82]} rotation={[0.35, 0, 0]}>
        <planeGeometry args={[1.35, 0.55]} />
        <meshStandardMaterial
          color="#88ccff"
          transparent
          opacity={0.45}
          roughness={0.05}
          metalness={0.1}
        />
      </mesh>

      {/* Rear windshield */}
      <mesh position={[0, 1.05, 1.24]} rotation={[-0.35, 0, 0]}>
        <planeGeometry args={[1.35, 0.5]} />
        <meshStandardMaterial
          color="#88ccff"
          transparent
          opacity={0.4}
          roughness={0.05}
          metalness={0.1}
        />
      </mesh>

      {/* Headlights left */}
      <mesh position={[-0.7, 0.52, -1.92]}>
        <boxGeometry args={[0.35, 0.18, 0.05]} />
        <meshStandardMaterial
          color="#ffffaa"
          emissive="#ffee88"
          emissiveIntensity={1.5}
        />
      </mesh>
      {/* Headlights right */}
      <mesh position={[0.7, 0.52, -1.92]}>
        <boxGeometry args={[0.35, 0.18, 0.05]} />
        <meshStandardMaterial
          color="#ffffaa"
          emissive="#ffee88"
          emissiveIntensity={1.5}
        />
      </mesh>

      {/* Tail lights left */}
      <mesh position={[-0.7, 0.52, 1.92]}>
        <boxGeometry args={[0.35, 0.18, 0.05]} />
        <meshStandardMaterial
          color="#ff3300"
          emissive="#ff2200"
          emissiveIntensity={2.0}
        />
      </mesh>
      {/* Tail lights right */}
      <mesh position={[0.7, 0.52, 1.92]}>
        <boxGeometry args={[0.35, 0.18, 0.05]} />
        <meshStandardMaterial
          color="#ff3300"
          emissive="#ff2200"
          emissiveIntensity={2.0}
        />
      </mesh>

      {/* Wheel trim rings */}
      <mesh position={[-0.95, -0.3, -1.25]} rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[0.35, 0.06, 8, 12]} />
        <meshStandardMaterial color="#888888" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[0.95, -0.3, -1.25]} rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[0.35, 0.06, 8, 12]} />
        <meshStandardMaterial color="#888888" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[-0.95, -0.3, 1.25]} rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[0.35, 0.06, 8, 12]} />
        <meshStandardMaterial color="#888888" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[0.95, -0.3, 1.25]} rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[0.35, 0.06, 8, 12]} />
        <meshStandardMaterial color="#888888" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Animated wheels */}
      <AnimatedWheel x={-0.95} z={-1.25} speedRef={speedRef} />
      <AnimatedWheel x={0.95} z={-1.25} speedRef={speedRef} />
      <AnimatedWheel x={-0.95} z={1.25} speedRef={speedRef} />
      <AnimatedWheel x={0.95} z={1.25} speedRef={speedRef} />

      {/* Undercarriage */}
      <mesh position={[0, -0.05, 0]}>
        <boxGeometry args={[1.6, 0.15, 3.5]} />
        <meshStandardMaterial color="#222222" roughness={0.9} />
      </mesh>

      {/* Spoiler */}
      <mesh position={[0, 1.1, 1.85]} castShadow>
        <boxGeometry args={[1.6, 0.08, 0.25]} />
        <meshStandardMaterial color="#880000" roughness={0.4} metalness={0.5} />
      </mesh>

      {/* Spoiler supports */}
      <mesh position={[-0.55, 0.85, 1.85]}>
        <boxGeometry args={[0.06, 0.28, 0.06]} />
        <meshStandardMaterial color="#555555" metalness={0.6} />
      </mesh>
      <mesh position={[0.55, 0.85, 1.85]}>
        <boxGeometry args={[0.06, 0.28, 0.06]} />
        <meshStandardMaterial color="#555555" metalness={0.6} />
      </mesh>
    </group>
  );
}
