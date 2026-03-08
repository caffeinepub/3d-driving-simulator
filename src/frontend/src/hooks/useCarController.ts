import { useFrame } from "@react-three/fiber";
import { useCallback, useEffect, useRef } from "react";
import * as THREE from "three";

export interface CarState {
  position: THREE.Vector3;
  rotation: number;
  speed: number;
}

export interface CarControllerResult {
  carRef: React.RefObject<THREE.Group>;
  carState: React.RefObject<CarState>;
}

const MAX_SPEED = 30;
const ACCELERATION = 18;
const BRAKE_FORCE = 25;
const FRICTION = 8;
const REVERSE_MAX = 8;
const STEER_SPEED = 1.8;
const STEER_DECAY = 4.0;

export function useCarController(): CarControllerResult {
  const carRef = useRef<THREE.Group>(null!);
  const carState = useRef<CarState>({
    position: new THREE.Vector3(0, 0, 0),
    rotation: 0,
    speed: 0,
  });

  const keys = useRef({
    forward: false,
    backward: false,
    left: false,
    right: false,
  });

  const steerAngle = useRef(0);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    switch (e.code) {
      case "ArrowUp":
      case "KeyW":
        keys.current.forward = true;
        e.preventDefault();
        break;
      case "ArrowDown":
      case "KeyS":
        keys.current.backward = true;
        e.preventDefault();
        break;
      case "ArrowLeft":
      case "KeyA":
        keys.current.left = true;
        e.preventDefault();
        break;
      case "ArrowRight":
      case "KeyD":
        keys.current.right = true;
        e.preventDefault();
        break;
    }
  }, []);

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    switch (e.code) {
      case "ArrowUp":
      case "KeyW":
        keys.current.forward = false;
        break;
      case "ArrowDown":
      case "KeyS":
        keys.current.backward = false;
        break;
      case "ArrowLeft":
      case "KeyA":
        keys.current.left = false;
        break;
      case "ArrowRight":
      case "KeyD":
        keys.current.right = false;
        break;
    }
  }, []);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    const state = carState.current;
    const { forward, backward, left, right } = keys.current;

    // Acceleration / braking
    if (forward) {
      state.speed += ACCELERATION * dt;
    } else if (backward) {
      if (state.speed > 0.5) {
        state.speed -= BRAKE_FORCE * dt;
      } else {
        state.speed -= ACCELERATION * 0.5 * dt;
      }
    } else {
      // Friction
      if (Math.abs(state.speed) < FRICTION * dt) {
        state.speed = 0;
      } else {
        state.speed -= Math.sign(state.speed) * FRICTION * dt;
      }
    }

    // Clamp speed
    state.speed = Math.max(-REVERSE_MAX, Math.min(MAX_SPEED, state.speed));

    // Steering — more responsive at lower speeds
    const speedFactor = Math.min(Math.abs(state.speed) / 8, 1.0);
    const steerInput = (left ? 1 : 0) - (right ? 1 : 0);

    if (steerInput !== 0 && Math.abs(state.speed) > 0.5) {
      steerAngle.current +=
        steerInput * STEER_SPEED * speedFactor * dt * Math.sign(state.speed);
      steerAngle.current = Math.max(-1, Math.min(1, steerAngle.current));
    } else {
      // Decay steer angle
      if (Math.abs(steerAngle.current) < STEER_DECAY * dt) {
        steerAngle.current = 0;
      } else {
        steerAngle.current -= Math.sign(steerAngle.current) * STEER_DECAY * dt;
      }
    }

    // Apply rotation
    state.rotation += steerAngle.current * state.speed * 0.04 * dt * 60;

    // Move car forward in its facing direction
    const dx = Math.sin(state.rotation) * state.speed * dt;
    const dz = Math.cos(state.rotation) * state.speed * dt;
    state.position.x += dx;
    state.position.z += dz;

    // World boundary
    const BOUND = 120;
    state.position.x = Math.max(-BOUND, Math.min(BOUND, state.position.x));
    state.position.z = Math.max(-BOUND, Math.min(BOUND, state.position.z));

    // Apply to mesh
    if (carRef.current) {
      carRef.current.position.set(state.position.x, 0, state.position.z);
      carRef.current.rotation.y = state.rotation;
    }
  });

  return { carRef, carState };
}
