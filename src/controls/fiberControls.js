import {
  DEFAULT_FIBER_SEED_OFFSET,
  DEFAULT_FIBER_TILING_X,
  DEFAULT_FIBER_TILING_Y,
} from '../constants.js';

export function createFiberControls() {
  return {
    enabled: { value: true },
    seedOffset: { value: DEFAULT_FIBER_SEED_OFFSET, min: 0, max: 10000, step: 1 },
    tilingX: { value: DEFAULT_FIBER_TILING_X, min: 1, max: 2000, step: 1 },
    tilingY: { value: DEFAULT_FIBER_TILING_Y, min: 0.1, max: 200, step: 0.1 },
  };
}
