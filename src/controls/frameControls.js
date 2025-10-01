export function createFrameControls() {
  return {
    visible: { value: false, label: "Visible" },
    color: { value: "#614638", label: "Frame Color" },
    borderWidthMm: {
      value: 35,
      min: 1,
      max: 150,
      step: 1,
      label: "Border Width (mm)",
    },
    depthMm: {
      value: 20,
      min: 1,
      max: 150,
      step: 1,
      label: "Depth (mm)",
    },
    frontOffsetMm: {
      value: 1,
      min: 0,
      max: 100,
      step: 0.25,
      label: "Front Offset (mm)",
    },
    metalness: {
      value: 0.05,
      min: 0,
      max: 1,
      step: 0.01,
      label: "Metalness",
    },
    roughness: {
      value: 0.35,
      min: 0,
      max: 1,
      step: 0.01,
      label: "Roughness",
    },
  };
}
