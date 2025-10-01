import React from "react";
import * as THREE from "three";
import { DEFAULT_RULER_OFFSET_Z } from "../constants.js";

export function RulerOverlay({
  size,
  rotation = [0, 0, 0],
  texture,
  visible = true,
  offsetZ = DEFAULT_RULER_OFFSET_Z,
  centerShift = [0, 0],
}) {
  if (!visible || !texture || !size) {
    return null;
  }

  return (
    <mesh position={[centerShift[0], centerShift[1], offsetZ]} rotation={rotation} renderOrder={3}>
      <planeGeometry args={[size[0], size[1], 1, 1]} />
      <meshBasicMaterial
        attach="material"
        map={texture}
        transparent
        depthWrite={false}
        toneMapped={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}
