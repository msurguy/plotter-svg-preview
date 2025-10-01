import * as THREE from "three";

import {
  BASE_RESOLUTION_PX,
  MIN_MARGIN_METERS,
  LEVEL_WEIGHTS,
} from '../../constants.js';

function getUnitsPerMeter(unit) {
  return unit === "in" ? 39.37007874015748 : 1000;
}

function formatLabel(valueUnits, unit) {
  if (unit === "in") {
    const rounded = Math.round(valueUnits * 1000) / 1000;
    return `${rounded.toFixed(3).replace(/\.0+$/, "").replace(/(\.\d*?)0+$/, "$1")} in`;
  }

  const rounded = Math.round(valueUnits);
  if (rounded % 10 === 0 && rounded >= 10) {
    const cm = rounded / 10;
    if (cm % 10 === 0) {
      const meters = cm / 100;
      if (meters >= 1) {
        return `${meters} m`;
      }
    }
    return `${cm} cm`;
  }
  return `${rounded} mm`;
}

function buildTickMap(lengthUnits, levels) {
  const tickMap = new Map();

  function addLevel({ spacingUnits, lengthRatio, thicknessScale, type, labelEvery }) {
    if (!spacingUnits || !isFinite(spacingUnits) || spacingUnits <= 0) {
      return;
    }

    const epsilon = spacingUnits * 1e-4;
    let idx = 0;
    for (let pos = 0; pos <= lengthUnits + epsilon; pos += spacingUnits) {
      const clamped = Math.min(lengthUnits, Math.max(0, pos));
      const key = Number(clamped.toFixed(5));
      const prev = tickMap.get(key);
      if (!prev || LEVEL_WEIGHTS[type] >= LEVEL_WEIGHTS[prev.type]) {
        tickMap.set(key, {
          positionUnits: clamped,
          lengthRatio,
          thicknessScale,
          type,
          labelEvery,
          labelIndex: type === "major" ? idx : prev?.labelIndex ?? null,
          spacingUnits,
        });
      }
      idx += 1;
    }
  }

  levels.forEach(addLevel);

  // Ensure boundary ticks exist and dominate shorter ticks.
  const boundaryConfig = {
    positionUnits: 0,
    lengthRatio: 1,
    thicknessScale: 1.5,
    type: "boundary",
    labelEvery: 1,
    labelIndex: 0,
    spacingUnits: null,
  };
  tickMap.set(0, boundaryConfig);
  tickMap.set(lengthUnits, { ...boundaryConfig, positionUnits: lengthUnits, labelIndex: tickMap.size });

  return Array.from(tickMap.values()).sort((a, b) => a.positionUnits - b.positionUnits);
}

export function createRulerTexture({
  paperWidthMeters,
  paperHeightMeters,
  marginMeters,
  unit = "mm",
  color = "#111111",
  opacity = 0.9,
  thicknessPx = 1.5,
  majorSpacingUnits,
  minorSpacingUnits,
  microSpacingUnits,
  startCorner = "Bottom Left",
  showLabels = true,
  labelEveryMajor = 1,
}) {
  if (!paperWidthMeters || !paperHeightMeters) {
    return null;
  }

  const margin = Math.max(MIN_MARGIN_METERS, marginMeters || MIN_MARGIN_METERS);

  const baseLongestSide = Math.max(
    paperWidthMeters + margin * 2,
    paperHeightMeters + margin * 2,
    Number.EPSILON
  );
  const pixelsPerMeter = BASE_RESOLUTION_PX / baseLongestSide;
  const marginPx = margin * pixelsPerMeter;

  const unitsPerMeter = getUnitsPerMeter(unit);
  const widthUnits = paperWidthMeters * unitsPerMeter;
  const heightUnits = paperHeightMeters * unitsPerMeter;
  const paperWidthPx = paperWidthMeters * pixelsPerMeter;
  const paperHeightPx = paperHeightMeters * pixelsPerMeter;

  const majorSpacing = Math.max(0, majorSpacingUnits || 0);
  const minorSpacing = Math.max(0, minorSpacingUnits || 0);
  const microSpacing = Math.max(0, microSpacingUnits || 0);

  const majorLabelEvery = Math.max(1, labelEveryMajor || 1);

  const horizontalTicks = buildTickMap(widthUnits, [
    { spacingUnits: microSpacing, lengthRatio: 0.35, thicknessScale: 0.8, type: "micro" },
    { spacingUnits: minorSpacing, lengthRatio: 0.55, thicknessScale: 1.0, type: "minor" },
    {
      spacingUnits: majorSpacing || minorSpacing || microSpacing || widthUnits,
      lengthRatio: 0.85,
      thicknessScale: 1.2,
      type: "major",
      labelEvery: majorLabelEvery,
    },
  ]);

  const verticalTicks = buildTickMap(heightUnits, [
    { spacingUnits: microSpacing, lengthRatio: 0.35, thicknessScale: 0.8, type: "micro" },
    { spacingUnits: minorSpacing, lengthRatio: 0.55, thicknessScale: 1.0, type: "minor" },
    {
      spacingUnits: majorSpacing || minorSpacing || microSpacing || heightUnits,
      lengthRatio: 0.85,
      thicknessScale: 1.2,
      type: "major",
      labelEvery: majorLabelEvery,
    },
  ]);

  const majorLengthPx = Math.max(marginPx * 0.9, 12);
  const labelFontPx = Math.min(28, Math.max(10, marginPx * 0.6));
  const labelPadding = Math.max(4, marginPx * 0.15);
  const measureCtx = document.createElement("canvas").getContext("2d");
  measureCtx.font = `${labelFontPx}px "Inter", "Helvetica Neue", Arial, sans-serif`;

  let maxVerticalLabelWidthPx = 0;

  horizontalTicks.forEach((tick) => {
    const shouldLabel = showLabels && (tick.type === "major" || tick.type === "boundary");
    if (shouldLabel) {
      const labelModulo = tick.labelEvery || 1;
      const isAllowed = tick.type === "boundary" || !tick.labelIndex || tick.labelIndex % labelModulo === 0;
      tick.label = isAllowed ? formatLabel(tick.positionUnits, unit) : null;
    } else {
      tick.label = null;
    }
  });

  verticalTicks.forEach((tick) => {
    const shouldLabel = showLabels && (tick.type === "major" || tick.type === "boundary");
    if (shouldLabel) {
      const labelModulo = tick.labelEvery || 1;
      const isAllowed = tick.type === "boundary" || !tick.labelIndex || tick.labelIndex % labelModulo === 0;
      if (isAllowed) {
        const text = formatLabel(tick.positionUnits, unit);
        tick.label = text;
        const width = measureCtx.measureText(text).width;
        if (width > maxVerticalLabelWidthPx) {
          maxVerticalLabelWidthPx = width;
        }
      } else {
        tick.label = null;
      }
    } else {
      tick.label = null;
    }
  });

  const horizontalLabelPadPx = showLabels ? labelPadding + maxVerticalLabelWidthPx : 0;
  const verticalLabelPadPx = showLabels ? labelPadding + labelFontPx : 0;

  const leftPadPx = marginPx + majorLengthPx + horizontalLabelPadPx;
  const rightPadPx = marginPx + majorLengthPx + horizontalLabelPadPx;
  const topPadPx = marginPx + majorLengthPx + verticalLabelPadPx;
  const bottomPadPx = marginPx + majorLengthPx + verticalLabelPadPx;

  const canvasWidth = Math.max(32, Math.round(paperWidthPx + leftPadPx + rightPadPx));
  const canvasHeight = Math.max(32, Math.round(paperHeightPx + topPadPx + bottomPadPx));

  const centerOffsetXPx = (rightPadPx - leftPadPx) * 0.5;
  const centerOffsetYPx = (bottomPadPx - topPadPx) * 0.5;

  const canvas = document.createElement("canvas");
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);
  ctx.imageSmoothingEnabled = true;

  const paperLeftPx = leftPadPx;
  const paperTopPx = topPadPx;
  const paperRightPx = paperLeftPx + paperWidthPx;
  const paperBottomPx = paperTopPx + paperHeightPx;

  ctx.save();
  ctx.globalAlpha = opacity;
  ctx.strokeStyle = color;
  ctx.fillStyle = color;

  // Draw inner paper outline to anchor the ruler visually.
  ctx.lineWidth = thicknessPx * 1.2;
  ctx.strokeRect(paperLeftPx, paperTopPx, paperWidthPx, paperHeightPx);

  const leftToRight = /Left/i.test(startCorner);
  const bottomToTop = /Bottom/i.test(startCorner);

  function getHorizontalX(positionUnits) {
    const meters = positionUnits / unitsPerMeter;
    if (leftToRight) {
      return paperLeftPx + meters * pixelsPerMeter;
    }
    return paperRightPx - meters * pixelsPerMeter;
  }

  function getVerticalY(positionUnits) {
    const meters = positionUnits / unitsPerMeter;
    if (bottomToTop) {
      return paperBottomPx - meters * pixelsPerMeter;
    }
    return paperTopPx + meters * pixelsPerMeter;
  }

  ctx.font = `${labelFontPx}px "Inter", "Helvetica Neue", Arial, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "top";

  horizontalTicks.forEach((tick) => {
    const x = getHorizontalX(tick.positionUnits);
    const lengthPx = majorLengthPx * (tick.lengthRatio ?? 1);
    const bottomStart = paperBottomPx;
    const topStart = paperTopPx;

    ctx.lineWidth = Math.max(0.25, thicknessPx * (tick.thicknessScale ?? 1));

    ctx.beginPath();
    ctx.moveTo(x, bottomStart);
    ctx.lineTo(x, bottomStart + lengthPx);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(x, topStart);
    ctx.lineTo(x, topStart - lengthPx);
    ctx.stroke();

    if (tick.label) {
      ctx.fillText(tick.label, x, bottomStart + lengthPx + labelPadding);
      ctx.textBaseline = "bottom";
      ctx.fillText(tick.label, x, topStart - lengthPx - labelPadding);
      ctx.textBaseline = "top";
    }
  });

  ctx.textBaseline = "middle";
  ctx.textAlign = "right";

  verticalTicks.forEach((tick) => {
    const y = getVerticalY(tick.positionUnits);
    const lengthPx = majorLengthPx * (tick.lengthRatio ?? 1);
    const leftStart = paperLeftPx;
    const rightStart = paperRightPx;

    ctx.lineWidth = Math.max(0.25, thicknessPx * (tick.thicknessScale ?? 1));

    ctx.beginPath();
    ctx.moveTo(leftStart - lengthPx, y);
    ctx.lineTo(leftStart, y);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(rightStart, y);
    ctx.lineTo(rightStart + lengthPx, y);
    ctx.stroke();

    if (tick.label) {
      const leftX = leftStart - (lengthPx + labelPadding);
      const rightX = rightStart + (lengthPx + labelPadding);

      ctx.textAlign = "right";
      ctx.fillText(tick.label, leftX, y);

      ctx.textAlign = "left";
      ctx.fillText(tick.label, rightX, y);
    }
  });

  ctx.restore();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  texture.anisotropy = 4;
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.magFilter = THREE.LinearFilter;
  texture.minFilter = THREE.LinearMipmapLinearFilter;

  return {
    texture,
    planeWidthMeters: canvasWidth / pixelsPerMeter,
    planeHeightMeters: canvasHeight / pixelsPerMeter,
    marginMeters: margin,
    centerOffsetMeters: [
      centerOffsetXPx / pixelsPerMeter,
      centerOffsetYPx / pixelsPerMeter,
    ],
  };
}
