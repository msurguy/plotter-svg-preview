import React, { useMemo } from "react";
import { Color } from "three";
import { MM_PER_M } from "../constants.js";

const FRONT_FACE_OFFSET_M = 0.0002;

export function Frame({
  size,
  rotation = [0, 0, 0],
  visible = true,
  color = "#614638",
  borderWidthMm = 35,
  depthMm = 20,
  frontOffsetMm = 1,
  metalness = 0.05,
  roughness = 0.35,
}) {
  const { widthM, heightM, borderWidthM, depthM, frontOffsetM, frameColor } = useMemo(() => {
    const [paperWidth = 0, paperHeight = 0] = Array.isArray(size) ? size : [0, 0];
    const borderWidth = Math.max(0, borderWidthMm / MM_PER_M);
    const depth = Math.max(0.001, depthMm / MM_PER_M);
    const frontOffset = Math.max(0, frontOffsetMm / MM_PER_M) + FRONT_FACE_OFFSET_M;
    return {
      widthM: paperWidth,
      heightM: paperHeight,
      borderWidthM: borderWidth,
      depthM: depth,
      frontOffsetM: frontOffset,
      frameColor: new Color(color),
    };
  }, [size, borderWidthMm, depthMm, frontOffsetMm, color]);

  const metalnessClamped = Math.min(1, Math.max(0, metalness));
  const roughnessClamped = Math.min(1, Math.max(0, roughness));

  const framePieces = useMemo(() => {
    if (!widthM || !heightM || !borderWidthM) {
      return [];
    }

    const outerWidth = widthM + borderWidthM * 2;
    const outerHeight = heightM + borderWidthM * 2;
    const zPos = -depthM / 2 + frontOffsetM;

    return [
      {
        key: "top",
        position: [0, heightM / 2 + borderWidthM / 2, zPos],
        size: [outerWidth, borderWidthM, depthM],
      },
      {
        key: "bottom",
        position: [0, -(heightM / 2 + borderWidthM / 2), zPos],
        size: [outerWidth, borderWidthM, depthM],
      },
      {
        key: "left",
        position: [-(widthM / 2 + borderWidthM / 2), 0, zPos],
        size: [borderWidthM, outerHeight, depthM],
      },
      {
        key: "right",
        position: [widthM / 2 + borderWidthM / 2, 0, zPos],
        size: [borderWidthM, outerHeight, depthM],
      },
    ];
  }, [widthM, heightM, borderWidthM, depthM, frontOffsetM]);

  if (!visible || framePieces.length === 0) {
    return null;
  }

  return (
    <group rotation={rotation} renderOrder={1}>
      {framePieces.map(({ key, position, size: partSize }) => (
        <mesh key={key} position={position} castShadow receiveShadow>
          <boxGeometry args={partSize} />
          <meshStandardMaterial
            color={frameColor}
            metalness={metalnessClamped}
            roughness={roughnessClamped}
          />
        </mesh>
      ))}
    </group>
  );
}
