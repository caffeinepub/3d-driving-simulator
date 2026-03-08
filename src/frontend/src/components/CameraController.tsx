import { useFrame, useThree } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import type { CarState } from "../hooks/useCarController";

interface CameraControllerProps {
  carState: React.RefObject<CarState>;
  mode: "thirdperson" | "topdown";
}

const LERP_SPEED = 6;
const THIRD_OFFSET_BACK = 10;
const THIRD_OFFSET_UP = 5;
const THIRD_LOOK_AHEAD = 4;
const TOPDOWN_HEIGHT = 65;

export function CameraController({ carState, mode }: CameraControllerProps) {
  const { camera } = useThree();
  const targetPos = useRef(new THREE.Vector3(0, TOPDOWN_HEIGHT, 0));
  const lookAtTarget = useRef(new THREE.Vector3(0, 0, 0));

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    const state = carState.current;
    const { position, rotation } = state;

    if (mode === "thirdperson") {
      // Position camera behind and above the car
      const behindX = position.x - Math.sin(rotation) * THIRD_OFFSET_BACK;
      const behindZ = position.z - Math.cos(rotation) * THIRD_OFFSET_BACK;

      targetPos.current.set(behindX, THIRD_OFFSET_UP, behindZ);

      // Look at a point slightly ahead of car
      const aheadX = position.x + Math.sin(rotation) * THIRD_LOOK_AHEAD;
      const aheadZ = position.z + Math.cos(rotation) * THIRD_LOOK_AHEAD;
      lookAtTarget.current.set(aheadX, 0.8, aheadZ);
    } else {
      // Top-down mode
      targetPos.current.set(position.x, TOPDOWN_HEIGHT, position.z);
      lookAtTarget.current.set(position.x, 0, position.z);
    }

    // Lerp camera position
    camera.position.lerp(targetPos.current, LERP_SPEED * dt);

    // Lerp look-at using a separate helper
    const currentLookAt = new THREE.Vector3();
    camera.getWorldDirection(currentLookAt);
    currentLookAt.multiplyScalar(10).add(camera.position);
    currentLookAt.lerp(lookAtTarget.current, LERP_SPEED * dt);
    camera.lookAt(currentLookAt);
  });

  return null;
}
