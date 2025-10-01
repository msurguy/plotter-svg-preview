export function createFlattenControls() {
  return {
    maxError: { value: 0.1, min: 0.01, max: 2.0, step: 0.01 },
    strokeWidthMm: { value: 0.4, min: 0.01, max: 5, step: 0.01, label: "Stroke Width (mm)" },
    strokeColor: { value: "#111111" },
    lineCap: { options: ["butt", "round", "square"], value: "round" },
    lineJoin: { options: ["miter", "round", "bevel"], value: "round" },
    miterLimit: { value: 4, min: 1, max: 20, step: 0.5 },
  };
}
