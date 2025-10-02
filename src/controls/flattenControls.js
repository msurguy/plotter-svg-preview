export function createFlattenControls() {
  return {
    maxError: { value: 0.1, min: 0.01, max: 2.0, step: 0.01 },
    preserveColors: { value: false, label: "Preserve Path Colors" },
    strokeWidthMm: { value: 0.4, min: 0.01, max: 5, step: 0.01, label: "Stroke Width (mm)" },
    strokeColor: { value: "#111111" },
    lineCap: { options: ["butt", "round", "square"], value: "round" },
    lineJoin: { options: ["miter", "round", "bevel"], value: "round" },
    miterLimit: { value: 4, min: 1, max: 20, step: 0.5 },

    // Ink blending settings
    inkBlending: {
      value: false,
      label: "Enable Ink Blending"
    },
    blendMode: {
      options: {
        "Multiply": "multiply",
        "Darken": "darken",
        "Color Burn": "color-burn",
        "Normal": "source-over",
        "Lighten": "lighten",
        "Screen": "screen"
      },
      value: "multiply",
      label: "Blend Mode"
    },
    inkOpacity: {
      value: 0.85,
      min: 0.1,
      max: 1.0,
      step: 0.05,
      label: "Ink Opacity"
    },
    edgeDarkening: {
      value: 0.3,
      min: 0,
      max: 1,
      step: 0.1,
      label: "Edge Darkening"
    },
  };
}
