import { optimizeSvg, presets as svgoPresets } from "../utils/svgo";

self.onmessage = (event) => {
  const { id, svgText } = event.data || {};
  if (typeof id !== "number") {
    return;
  }
  try {
    const optimized = optimizeSvg(svgText, svgoPresets.OUTPUT_COMPACT)?.svg ?? svgText;
    self.postMessage({ id, ok: true, svg: optimized });
  } catch (err) {
    const message = err?.message || "Unknown optimization error";
    self.postMessage({ id, ok: false, error: message });
  }
};
