import { DEFAULT_RASTER_RESOLUTION } from "../constants/rendering";

export function createSvgControls() {
  return {
    mode: { options: ["Direct Raster", "Flatten & Stroke"], value: "Flatten & Stroke" },
    svgRotationDeg: { options: { "0°": 0, "90°": 90, "180°": 180, "-90°": -90 }, value: 0 },
    svgOpacity: { value: 1.0, min: 0, max: 1, step: 0.01 },
    scaleOnPaperPercent: {
      value: 100,
      min: 10,
      max: 200,
      step: 1,
      label: "Scale on Paper (%)",
    },
    keepAspect: { value: true },
    targetResolutionPx: {
      value: DEFAULT_RASTER_RESOLUTION,
      min: 128,
      max: 8192,
      step: 128,
    },
    paddingPx: { value: 32, min: 0, max: 400, step: 1 },
  };
}
