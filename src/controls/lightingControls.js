import {
  DEFAULT_AMBIENT_INTENSITY,
  DEFAULT_DIR_INTENSITY,
  DEFAULT_DIR_X,
  DEFAULT_DIR_Y,
  DEFAULT_DIR_Z,
  ENV_PRESETS,
} from '../constants.js';

export function createLightingControls() {
  return {
    ambientIntensity: { value: DEFAULT_AMBIENT_INTENSITY, min: 0, max: 2, step: 0.01 },
    dirIntensity: { value: DEFAULT_DIR_INTENSITY, min: 0, max: 5, step: 0.01 },
    dirX: { value: DEFAULT_DIR_X, min: -5, max: 5, step: 0.01 },
    dirY: { value: DEFAULT_DIR_Y, min: -5, max: 5, step: 0.01 },
    dirZ: { value: DEFAULT_DIR_Z, min: -5, max: 5, step: 0.01 },
    envPreset: {
      options: ENV_PRESETS,
      value: "studio",
    },
    envBackground: { value: false },
  };
}
