import { toPx } from "./parse";

function parseViewBox(vb) {
  if (!vb) return null;
  const nums = String(vb).trim().split(/[\s,]+/).map(Number);
  if (nums.length !== 4) return null;
  const [minX, minY, width, height] = nums;
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
    return null;
  }
  return { minX, minY, width, height };
}

export function normalizeSvgUnits(svgText) {
  if (!svgText || typeof svgText !== "string") return svgText;
  let doc;
  try {
    doc = new DOMParser().parseFromString(svgText, "image/svg+xml");
  } catch (_) {
    return svgText;
  }
  const svg = doc.documentElement;
  if (!svg || svg.nodeName.toLowerCase() !== "svg") return svgText;

  const widthAttr = svg.getAttribute("width");
  const heightAttr = svg.getAttribute("height");
  let wPx = toPx(widthAttr);
  let hPx = toPx(heightAttr);

  const vbRaw = svg.getAttribute("viewBox");
  const vb = parseViewBox(vbRaw);

  if ((!wPx || !hPx) && vb) {
    if (!wPx) wPx = vb.width;
    if (!hPx) hPx = vb.height;
  }

  if (!wPx || !hPx) {
    try {
      return new XMLSerializer().serializeToString(svg);
    } catch (_) {
      return svgText;
    }
  }

  svg.setAttribute("width", `${wPx}px`);
  svg.setAttribute("height", `${hPx}px`);

  const hasExistingViewBox = typeof vbRaw === "string" && vbRaw.trim().length > 0;

  if (!hasExistingViewBox) {
    const minX = vb ? vb.minX : 0;
    const minY = vb ? vb.minY : 0;
    svg.setAttribute("viewBox", `${minX} ${minY} ${wPx} ${hPx}`);
    console.info("[normalizeSvgUnits] Applied fallback viewBox", {
      minX,
      minY,
      widthPx: wPx,
      heightPx: hPx,
    });
  } else {
    console.info("[normalizeSvgUnits] Preserving existing viewBox", {
      viewBox: vbRaw,
      widthPx: wPx,
      heightPx: hPx,
    });
  }

  try {
    return new XMLSerializer().serializeToString(svg);
  } catch (_) {
    return svgText;
  }
}

export default normalizeSvgUnits;
