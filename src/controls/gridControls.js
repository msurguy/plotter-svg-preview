import {
  UNIT_OPTIONS,
  CORNER_OPTIONS,
  DEFAULT_GRID_SPACING_MM,
  DEFAULT_GRID_SPACING_IN,
  DEFAULT_GRID_LINE_COLOR,
  DEFAULT_GRID_LINE_OPACITY,
  DEFAULT_GRID_LINE_THICKNESS_PX,
} from '../constants.js';

export function createGridControls() {
  return {
    visible: { value: false },
    unit: { options: UNIT_OPTIONS, value: "mm" },
    spacingMm: {
      value: DEFAULT_GRID_SPACING_MM,
      min: 1,
      max: 200,
      step: 1,
      label: "Spacing (mm)",
      render: (get) => get("Grid.unit") === "mm",
    },
    spacingIn: {
      value: DEFAULT_GRID_SPACING_IN,
      min: 0.0625,
      max: 4,
      step: 0.0625,
      label: "Spacing (in)",
      render: (get) => get("Grid.unit") === "in",
    },
    lineColor: { value: DEFAULT_GRID_LINE_COLOR },
    lineOpacity: { value: DEFAULT_GRID_LINE_OPACITY, min: 0, max: 1, step: 0.01 },
    lineThicknessPx: { value: DEFAULT_GRID_LINE_THICKNESS_PX, min: 0.3, max: 5, step: 0.1 },
    originCorner: {
      options: CORNER_OPTIONS,
      value: "Bottom Left",
    },
  };
}
