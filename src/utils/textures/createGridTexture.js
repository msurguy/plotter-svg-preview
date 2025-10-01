import * as THREE from "three";

import {
  BASE_RESOLUTION_PX,
  MIN_LINE_SPACING_PX,
  MAX_GRID_LINES,
  EPSILON,
} from '../../constants.js';

function collectLinePositions({ sizePx, spacingPx, fromEnd }) {
  const positions = [];
  if (spacingPx < MIN_LINE_SPACING_PX || !isFinite(spacingPx)) {
    return positions;
  }

  if (fromEnd) {
    for (let pos = sizePx; pos >= -EPSILON && positions.length < MAX_GRID_LINES; pos -= spacingPx) {
      const clamped = Math.min(sizePx, Math.max(0, pos));
      positions.push(clamped);
      if (clamped <= 0) break;
    }
  } else {
    for (let pos = 0; pos <= sizePx + EPSILON && positions.length < MAX_GRID_LINES; pos += spacingPx) {
      const clamped = Math.min(sizePx, Math.max(0, pos));
      positions.push(clamped);
      if (clamped >= sizePx) break;
    }
  }

  if (!positions.length) {
    positions.push(fromEnd ? sizePx : 0);
  }

  const set = new Set(positions.map((value) => Number(value.toFixed(3))));
  set.add(0);
  set.add(Number(sizePx.toFixed(3)));
  return Array.from(set).sort((a, b) => a - b);
}

export function createGridTexture({
  widthMeters,
  heightMeters,
  spacingMeters,
  lineColor = "#000000",
  lineOpacity = 0.35,
  lineThicknessPx = 1,
  originCorner = "Bottom Left",
}) {
  if (!widthMeters || !heightMeters || !spacingMeters || spacingMeters <= 0) {
    return null;
  }

  const longestSide = Math.max(widthMeters, heightMeters);
  const pixelsPerMeter = BASE_RESOLUTION_PX / Math.max(longestSide, Number.EPSILON);

  const widthPx = Math.max(2, Math.round(widthMeters * pixelsPerMeter));
  const heightPx = Math.max(2, Math.round(heightMeters * pixelsPerMeter));
  const spacingPx = spacingMeters * pixelsPerMeter;

  if (spacingPx < MIN_LINE_SPACING_PX) {
    return null;
  }

  const canvas = document.createElement("canvas");
  canvas.width = widthPx;
  canvas.height = heightPx;
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, widthPx, heightPx);
  ctx.imageSmoothingEnabled = false;
  ctx.globalAlpha = lineOpacity;
  ctx.strokeStyle = lineColor;
  ctx.lineWidth = lineThicknessPx;
  ctx.lineCap = "butt";
  ctx.lineJoin = "miter";

  const fromRight = /Right/.test(originCorner);
  const fromBottom = /Bottom/.test(originCorner);

  const verticalPositions = collectLinePositions({ sizePx: widthPx, spacingPx, fromEnd: fromRight });
  const horizontalPositions = collectLinePositions({ sizePx: heightPx, spacingPx, fromEnd: fromBottom });

  ctx.beginPath();
  for (const x of verticalPositions) {
    ctx.moveTo(x, 0);
    ctx.lineTo(x, heightPx);
  }
  for (const y of horizontalPositions) {
    ctx.moveTo(0, y);
    ctx.lineTo(widthPx, y);
  }
  ctx.stroke();
  ctx.globalAlpha = 1;

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  texture.anisotropy = 4;
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.magFilter = THREE.LinearFilter;
  texture.minFilter = THREE.LinearMipmapLinearFilter;

  return texture;
}
