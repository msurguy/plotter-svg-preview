import {
  DEFAULT_NOISE_OCTAVES,
  NOISE_TYPE_OPTIONS,
  FRACTAL_TYPE_OPTIONS,
  WARP_TYPE_OPTIONS,
  WARP_FRACTAL_TYPE_OPTIONS,
} from "../constants/noise";

export function createNoiseControls() {
  return {
    seed: { value: 1337, min: 1, max: 100000, step: 1 },
    frequency: { value: 1.0, min: 0.01, max: 10.0, step: 0.01 },
    tilingX: { value: 350, min: 1, max: 1000, step: 1 },
    tilingY: { value: 350, min: 1, max: 1000, step: 1 },
    noiseType: { options: NOISE_TYPE_OPTIONS, value: "OpenSimplex2" },
    fractalType: { options: FRACTAL_TYPE_OPTIONS, value: "FBM" },
    octaves: { value: DEFAULT_NOISE_OCTAVES, min: 1, max: 12, step: 1 },
    gain: { value: 0.5, min: 0.0, max: 1.0, step: 0.01 },
    lacunarity: { value: 2.0, min: 1.0, max: 4.0, step: 0.01 },
    weightedStrength: { value: 0.0, min: 0.0, max: 1.0, step: 0.01 },
    pingPongStrength: { value: 2.0, min: 0.0, max: 5.0, step: 0.01 },
    warpEnabled: { value: false },
    warpAmp: {
      value: 10.0,
      min: 0.0,
      max: 50.0,
      step: 0.1,
      render: (get) => get("Paper Noise.warpEnabled"),
    },
    warpFrequency: {
      value: 2.0,
      min: 0.01,
      max: 10.0,
      step: 0.01,
      render: (get) => get("Paper Noise.warpEnabled"),
    },
    warpType: {
      options: WARP_TYPE_OPTIONS,
      value: "OpenSimplex2",
      render: (get) => get("Paper Noise.warpEnabled"),
    },
    warpFractalType: {
      options: WARP_FRACTAL_TYPE_OPTIONS,
      value: "Progressive",
      render: (get) => get("Paper Noise.warpEnabled"),
    },
  };
}
