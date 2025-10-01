import {
  DEFAULT_PAPER_COLOR,
  DEFAULT_GRAIN_INTENSITY,
  DEFAULT_FIBER_INTENSITY,
} from '../constants.js';

export function createMaterialControls() {
  return {
    paperColor: { value: DEFAULT_PAPER_COLOR },
    grainIntensity: { value: DEFAULT_GRAIN_INTENSITY, min: 0, max: 0.4, step: 0.001 },
    fiberIntensity: { value: DEFAULT_FIBER_INTENSITY, min: 0, max: 0.3, step: 0.001 },
  };
}
