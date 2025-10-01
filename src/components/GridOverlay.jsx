import React from "react";
import * as THREE from "three";

export function GridOverlay({ size, rotation = [0, 0, 0], texture, visible = true }) {
  if (!visible || !texture) {
    return null;
  }

  return (
    <mesh position={[0, 0, 0.0005]} rotation={rotation} renderOrder={2}>
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
