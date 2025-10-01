import {
  PX_PER_IN,
  PX_PER_CM,
  PX_PER_MM,
  PX_PER_PT,
  PX_PER_PC,
} from '../../constants.js';

export function toPx(value) {
  if (value == null) return null;
  const match = String(value)
    .trim()
    .match(/^([+-]?\d*\.?\d+)(px|mm|cm|in|pt|pc)?$/i);
  if (!match) return null;
  const numeric = parseFloat(match[1]);
  const unit = (match[2] || "px").toLowerCase();
  switch (unit) {
    case "px":
      return numeric;
    case "mm":
      return numeric * PX_PER_MM;
    case "cm":
      return numeric * PX_PER_CM;
    case "in":
      return numeric * PX_PER_IN;
    case "pt":
      return numeric * PX_PER_PT;
    case "pc":
      return numeric * PX_PER_PC;
    default:
      return null;
  }
}

export function parseSvgIntrinsicSize(svgText) {
  const doc = new DOMParser().parseFromString(svgText, "image/svg+xml");
  const svg = doc.documentElement;
  const vb = svg.getAttribute("viewBox");
  let viewBox = null;
  let vbAspect = null;
  if (vb) {
    const nums = vb.split(/[\s,]+/).map(Number);
    if (
      nums.length === 4 &&
      Number.isFinite(nums[2]) &&
      Number.isFinite(nums[3]) &&
      nums[2] > 0 &&
      nums[3] > 0
    ) {
      viewBox = {
        minX: nums[0],
        minY: nums[1],
        width: nums[2],
        height: nums[3],
      };
      vbAspect = viewBox.width / viewBox.height;
    }
  }
  const widthAttr = svg.getAttribute("width");
  const heightAttr = svg.getAttribute("height");
  const wPx = toPx(widthAttr);
  const hPx = toPx(heightAttr);
  let aspect = null;
  if (vbAspect) {
    aspect = vbAspect;
  } else if (wPx && hPx && wPx > 0 && hPx > 0) {
    aspect = wPx / hPx;
  }
  return {
    wPx: wPx || null,
    hPx: hPx || null,
    aspect: aspect || null,
    viewBox,
  };
}
