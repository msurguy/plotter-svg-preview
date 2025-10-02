import * as THREE from "three";
import { flattenSVG } from "flatten-svg";
import {
  clearFlattenCaches,
  getFlattenCache,
  getPendingFlattenComputation,
  setFlattenCache,
  setPendingFlattenComputation,
  clearPendingFlattenComputation,
} from "../cache";
import {
  DEFAULT_IMAGE_FALLBACK_PX,
  DEFAULT_RASTER_RESOLUTION,
  HALF_PIXEL_MARGIN_PX,
} from "../../constants/rendering";
import { rasterizeSvg } from "./rasterize";

let svgSandboxHost = null;

export { clearFlattenCaches };

function ensureSvgSandbox() {
  if (typeof document === "undefined") {
    return null;
  }
  if (!svgSandboxHost) {
    svgSandboxHost = document.createElement("div");
    svgSandboxHost.style.position = "absolute";
    svgSandboxHost.style.width = "0";
    svgSandboxHost.style.height = "0";
    svgSandboxHost.style.overflow = "hidden";
    svgSandboxHost.style.opacity = "0";
    svgSandboxHost.style.pointerEvents = "none";
    svgSandboxHost.setAttribute("aria-hidden", "true");
    document.body.appendChild(svgSandboxHost);
  }
  return svgSandboxHost;
}

function commandsToPathString(commands) {
  const parts = [];
  for (const cmd of commands) {
    if (!cmd) continue;
    const { type, values } = cmd;
    if (!type) continue;
    if (values && values.length) {
      parts.push(`${type} ${values.join(" ")}`);
    } else {
      parts.push(type);
    }
  }
  return parts.join(" ");
}

function serializeMatrix(matrix) {
  if (!matrix) return null;
  return { a: matrix.a, b: matrix.b, c: matrix.c, d: matrix.d, e: matrix.e, f: matrix.f };
}

function extractStrokeColor(element) {
  if (!element) return null;

  let stroke = null;

  // Try direct attribute first
  stroke = element.getAttribute('stroke');

  // Check for inline style
  if (!stroke || stroke === 'none') {
    const styleAttr = element.getAttribute('style');
    if (styleAttr) {
      const strokeMatch = styleAttr.match(/stroke\s*:\s*([^;]+)/);
      if (strokeMatch) {
        stroke = strokeMatch[1].trim();
      }
    }
  }

  // Try computed style if available
  if (!stroke || stroke === 'none') {
    try {
      const computedStyle = window.getComputedStyle(element);
      if (computedStyle.stroke && computedStyle.stroke !== 'none') {
        stroke = computedStyle.stroke;
      }
    } catch (e) {
      // getComputedStyle might not be available
    }
  }

  // If still no stroke, check fill as fallback
  if (!stroke || stroke === 'none') {
    stroke = element.getAttribute('fill');
    if (!stroke || stroke === 'none') {
      try {
        const computedStyle = window.getComputedStyle(element);
        if (computedStyle.fill && computedStyle.fill !== 'none') {
          stroke = computedStyle.fill;
        }
      } catch (e) {
        // ignore
      }
    }
  }

  // Normalize 'none' to null
  if (!stroke || stroke === 'none') {
    return null;
  }

  return stroke;
}

export function yieldToBrowser() {
  return new Promise((resolve) => {
    if (typeof window === "undefined") {
      resolve();
      return;
    }
    if (typeof requestIdleCallback === "function") {
      requestIdleCallback(() => resolve());
    } else {
      setTimeout(resolve, 0);
    }
  });
}

function hasModernPathSupport() {
  return typeof Path2D === "function" && typeof DOMMatrix === "function";
}

function boundsFromExtents(minX, minY, maxX, maxY) {
  const width = Math.max(1e-6, maxX - minX);
  const height = Math.max(1e-6, maxY - minY);
  return {
    minX,
    minY,
    maxX,
    maxY,
    width,
    height,
    centerX: (minX + maxX) * 0.5,
    centerY: (minY + maxY) * 0.5,
  };
}

async function computeStrokeGeometryWithPath2D(svgText) {
  if (!hasModernPathSupport()) {
    return null;
  }

  const doc = new DOMParser().parseFromString(svgText, "image/svg+xml");
  const svgEl = doc.documentElement;
  if (!svgEl) return null;

  const sandbox = ensureSvgSandbox();
  if (!sandbox) {
    return null;
  }

  sandbox.appendChild(svgEl);

  try {
    const geometries = svgEl.querySelectorAll(
      "path,polyline,polygon,line,rect,circle,ellipse"
    );

    const pathEntries = [];
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    let processed = 0;
    for (const shape of geometries) {
      if (typeof shape.getPathData !== "function") {
        continue;
      }
      const commands = shape.getPathData({ normalize: true });
      if (!commands || commands.length === 0) {
        continue;
      }

      const pathString = commandsToPathString(commands);
      if (!pathString) continue;

      let path;
      try {
        path = new Path2D(pathString);
      } catch (err) {
        console.warn("Failed to build Path2D", err);
        continue;
      }

      const ctm = serializeMatrix(shape.getCTM?.());
      const strokeColor = extractStrokeColor(shape);
      pathEntries.push({ path, matrix: ctm, color: strokeColor });

      try {
        const bbox = shape.getBBox();
        if (bbox && isFinite(bbox.x) && isFinite(bbox.y)) {
          const right = bbox.x + bbox.width;
          const bottom = bbox.y + bbox.height;
          if (isFinite(right) && isFinite(bottom)) {
            minX = Math.min(minX, bbox.x);
            minY = Math.min(minY, bbox.y);
            maxX = Math.max(maxX, right);
            maxY = Math.max(maxY, bottom);
          }
        }
      } catch (err) {
        console.warn("getBBox failed", err);
      }

      processed += 1;
      if (processed % 25 === 0) {
        await yieldToBrowser();
      }
    }

    if (
      !pathEntries.length ||
      !isFinite(minX) ||
      !isFinite(minY) ||
      !isFinite(maxX) ||
      !isFinite(maxY)
    ) {
      return null;
    }

    return {
      pathEntries,
      bounds: boundsFromExtents(minX, minY, maxX, maxY),
    };
  } finally {
    if (svgEl.parentNode === sandbox) {
      sandbox.removeChild(svgEl);
    }
  }
}

function computeStrokeGeometryLegacy(svgText, maxError) {
  if (typeof Path2D !== "function") {
    return null;
  }
  const doc = new DOMParser().parseFromString(svgText, "image/svg+xml");
  const svgEl = doc.documentElement;
  if (!svgEl) return null;

  const sandbox = ensureSvgSandbox();
  if (sandbox) {
    sandbox.appendChild(svgEl);
  }

  try {
    const lines = flattenSVG(svgEl, { maxError }) || [];
    if (!lines.length) {
      return null;
    }

    // Group lines by their stroke color to preserve colors
    const pathEntries = [];
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    // Build a map of stroke colors to their lines
    const colorMap = new Map();
    for (const line of lines) {
      // flatten-svg library returns stroke color directly on the line object
      const strokeColor = line.stroke || null;
      if (!colorMap.has(strokeColor)) {
        colorMap.set(strokeColor, []);
      }
      colorMap.get(strokeColor).push(line);
    }

    // Create a path for each color
    for (const [strokeColor, colorLines] of colorMap) {
      const path = new Path2D();

      for (const line of colorLines) {
        const pts = line.points;
        if (!pts || pts.length < 2) continue;
        path.moveTo(pts[0].x, pts[0].y);
        for (let i = 1; i < pts.length; i++) {
          const { x, y } = pts[i];
          path.lineTo(x, y);
        }

        for (const point of pts) {
          const { x, y } = point;
          if (!isFinite(x) || !isFinite(y)) continue;
          if (x < minX) minX = x;
          if (y < minY) minY = y;
          if (x > maxX) maxX = x;
          if (y > maxY) maxY = y;
        }
      }

      pathEntries.push({ path, matrix: null, color: strokeColor });
    }

    if (!pathEntries.length || !isFinite(minX) || !isFinite(minY) || !isFinite(maxX) || !isFinite(maxY)) {
      return null;
    }

    return {
      pathEntries,
      bounds: boundsFromExtents(minX, minY, maxX, maxY),
    };
  } finally {
    if (sandbox && svgEl.parentNode === sandbox) {
      sandbox.removeChild(svgEl);
    }
  }
}

export async function getFlattenedGeometry(svgText, maxError) {
  const cacheKey = `${maxError}::${svgText}`;
  const cached = getFlattenCache(cacheKey);
  if (cached) {
    return cached;
  }

  const pending = getPendingFlattenComputation(cacheKey);
  if (pending) {
    return pending;
  }

  const computation = (async () => {
    let result = await computeStrokeGeometryWithPath2D(svgText);
    if (!result) {
      result = computeStrokeGeometryLegacy(svgText, maxError);
    }
    if (!result) {
      return { pathEntries: null, bounds: null };
    }
    setFlattenCache(cacheKey, result);
    return result;
  })()
    .catch((err) => {
      console.error("Failed to flatten SVG", err);
      return { pathEntries: null, bounds: null };
    })
    .finally(() => {
      clearPendingFlattenComputation(cacheKey);
    });

  setPendingFlattenComputation(cacheKey, computation);
  return computation;
}

export async function flattenAndRasterizeSvg(
  svgText,
  {
    resolution = DEFAULT_RASTER_RESOLUTION,
    keepAspect = true,
    paddingPx = 0,
    rotationDeg = 0,
    maxError = 0.1,
    strokeWidthPx = 1,
    strokeColor = DEFAULT_STROKE_COLOR,
    lineCap = "round",
    lineJoin = "round",
    miterLimit = 4,
    preserveColors = false,
  } = {}
) {
  const flattened = await getFlattenedGeometry(svgText, maxError);
  if (!flattened.pathEntries || !flattened.bounds) {
    return rasterizeSvg(svgText, { resolution, keepAspect, paddingPx, rotationDeg });
  }

  const { pathEntries, bounds } = flattened;
  const w = bounds.width;
  const h = bounds.height;
  const aspect = w / h;

  const canvas = document.createElement("canvas");
  canvas.width = resolution;
  canvas.height = resolution;
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, resolution, resolution);
  ctx.lineCap = lineCap;
  ctx.lineJoin = lineJoin;
  ctx.miterLimit = miterLimit;
  if (!preserveColors) {
    ctx.strokeStyle = strokeColor;
  }
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  const pad = Math.max(0, Math.floor(paddingPx));
  const avail = Math.max(1, resolution - pad * 2);

  const rotationRad = THREE.MathUtils.degToRad(rotationDeg || 0);

  let scaleX;
  let scaleY;
  if (keepAspect) {
    const uniformScale = Math.min(avail / w, avail / h);
    scaleX = uniformScale;
    scaleY = uniformScale;
  } else {
    scaleX = avail / w;
    scaleY = avail / h;
  }

  let drawW = w * scaleX;
  let drawH = h * scaleY;

  const cosR = Math.cos(rotationRad);
  const sinR = Math.sin(rotationRad);
  const rotBoundsW = Math.abs(drawW * cosR) + Math.abs(drawH * sinR);
  const rotBoundsH = Math.abs(drawW * sinR) + Math.abs(drawH * cosR);
  const fitScale = Math.min(
    avail / Math.max(rotBoundsW, 1e-6),
    avail / Math.max(rotBoundsH, 1e-6),
    1
  );
  scaleX *= fitScale;
  scaleY *= fitScale;

  const { centerX, centerY } = bounds;
  const globalScale = Math.sqrt(Math.max(1e-12, Math.abs(scaleX) * Math.abs(scaleY)));

  ctx.save();
  ctx.translate(resolution / 2, resolution / 2);
  ctx.rotate(rotationRad);
  ctx.scale(scaleX, scaleY);
  ctx.translate(-centerX, -centerY);

  for (const entry of pathEntries) {
    const { path, matrix, color } = entry;
    if (!path) continue;

    let entryScale = 1;
    if (matrix) {
      const sx = Math.hypot(matrix.a, matrix.b);
      const sy = Math.hypot(matrix.c, matrix.d);
      entryScale = Math.sqrt(Math.max(1e-12, sx * sy));
    }

    ctx.lineWidth = strokeWidthPx / (globalScale * entryScale);

    // Set color for this path if preserveColors is enabled
    if (preserveColors && color) {
      ctx.strokeStyle = color;
    }

    ctx.save();
    if (matrix) {
      ctx.transform(matrix.a, matrix.b, matrix.c, matrix.d, matrix.e, matrix.f);
    }
    ctx.stroke(path);
    ctx.restore();
  }
  ctx.restore();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  texture.needsUpdate = true;
  return { texture, aspect };
}

export function computeEdgeMargin(svgTexture) {
  const img = svgTexture?.image;
  if (!img) return HALF_PIXEL_MARGIN_PX / DEFAULT_RASTER_RESOLUTION;
  const w =
    img.width || img.videoWidth || img.naturalWidth || DEFAULT_IMAGE_FALLBACK_PX;
  const h =
    img.height || img.videoHeight || img.naturalHeight || DEFAULT_IMAGE_FALLBACK_PX;
  const maxDim = Math.max(1, w, h);
  return HALF_PIXEL_MARGIN_PX / maxDim;
}
