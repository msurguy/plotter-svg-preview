import * as THREE from "three";
import { DEFAULT_RASTER_RESOLUTION } from "../../constants/rendering";
import { parseSvgIntrinsicSize } from "./parse";

export async function loadSvgImage(svgText, targetRes) {
  const blob = new Blob([svgText], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  try {
    const img = await new Promise((resolve, reject) => {
      const tag = new Image();
      tag.onload = () => resolve(tag);
      tag.onerror = reject;
      tag.src = url;
    });
    const w = img.naturalWidth || img.width || targetRes;
    const h = img.naturalHeight || img.height || targetRes;
    return { img, w, h };
  } finally {
    URL.revokeObjectURL(url);
  }
}

export async function rasterizeSvg(
  svgText,
  {
    resolution = DEFAULT_RASTER_RESOLUTION,
    keepAspect = true,
    paddingPx = 0,
    rotationDeg = 0,
  } = {}
) {
  const meta = parseSvgIntrinsicSize(svgText);
  const { img, w: natW, h: natH } = await loadSvgImage(svgText, resolution);

  const w = meta.wPx || natW || resolution;
  const h = meta.hPx || natH || resolution;
  const aspect = meta.aspect != null ? meta.aspect : h ? w / h : 1;

  const canvas = document.createElement("canvas");
  canvas.width = resolution;
  canvas.height = resolution;
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, resolution, resolution);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  const pad = Math.max(0, Math.floor(paddingPx));
  const avail = Math.max(1, resolution - pad * 2);

  const rotationRad = THREE.MathUtils.degToRad(rotationDeg || 0);

  let drawW;
  let drawH;
  if (keepAspect) {
    if (aspect >= 1) {
      drawW = avail;
      drawH = avail / aspect;
    } else {
      drawW = avail * aspect;
      drawH = avail;
    }
  } else {
    drawW = avail;
    drawH = avail;
  }

  const cosR = Math.cos(rotationRad);
  const sinR = Math.sin(rotationRad);
  const rotBoundsW = Math.abs(drawW * cosR) + Math.abs(drawH * sinR);
  const rotBoundsH = Math.abs(drawW * sinR) + Math.abs(drawH * cosR);
  const fitScale = Math.min(
    avail / Math.max(rotBoundsW, 1e-6),
    avail / Math.max(rotBoundsH, 1e-6),
    1
  );
  drawW *= fitScale;
  drawH *= fitScale;

  ctx.save();
  ctx.translate(resolution / 2, resolution / 2);
  ctx.rotate(rotationRad);
  ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
  ctx.restore();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  texture.needsUpdate = true;
  return { texture, aspect };
}
