import {
  UNIT_OPTIONS,
  CORNER_OPTIONS,
  DEFAULT_RULER_MARGIN_MM,
  DEFAULT_RULER_MARGIN_IN,
  DEFAULT_RULER_COLOR,
  DEFAULT_RULER_THICKNESS_PX,
  DEFAULT_RULER_OPACITY,
  RULER_SPACING_MM_OPTIONS,
  RULER_SPACING_IN_OPTIONS,
} from '../constants.js';

export function createRulerControls() {
  return {
    visible: { value: false },
    unit: { options: UNIT_OPTIONS, value: "mm" },
    marginMm: {
      value: DEFAULT_RULER_MARGIN_MM,
      min: 2,
      max: 120,
      step: 1,
      label: "Margin (mm)",
      render: (get) => get("Ruler.unit") === "mm",
    },
    marginIn: {
      value: DEFAULT_RULER_MARGIN_IN,
      min: 0.1,
      max: 5,
      step: 0.05,
      label: "Margin (in)",
      render: (get) => get("Ruler.unit") === "in",
    },
    majorSpacingMm: {
      options: RULER_SPACING_MM_OPTIONS.major,
      value: 10,
      render: (get) => get("Ruler.unit") === "mm",
    },
    minorSpacingMm: {
      options: RULER_SPACING_MM_OPTIONS.minor,
      value: 5,
      render: (get) => get("Ruler.unit") === "mm",
    },
    microSpacingMm: {
      options: RULER_SPACING_MM_OPTIONS.micro,
      value: 1,
      render: (get) => get("Ruler.unit") === "mm",
    },
    majorSpacingIn: {
      options: RULER_SPACING_IN_OPTIONS.major,
      value: 1,
      render: (get) => get("Ruler.unit") === "in",
    },
    minorSpacingIn: {
      options: RULER_SPACING_IN_OPTIONS.minor,
      value: 0.25,
      render: (get) => get("Ruler.unit") === "in",
    },
    microSpacingIn: {
      options: RULER_SPACING_IN_OPTIONS.micro,
      value: 0.0625,
      render: (get) => get("Ruler.unit") === "in",
    },
    color: { value: DEFAULT_RULER_COLOR },
    thicknessPx: { value: DEFAULT_RULER_THICKNESS_PX, min: 0.3, max: 4, step: 0.1 },
    opacity: { value: DEFAULT_RULER_OPACITY, min: 0, max: 1, step: 0.01 },
    showLabels: { value: true },
    labelEveryMajor: { value: 1, min: 1, max: 10, step: 1 },
    startCorner: {
      options: CORNER_OPTIONS,
      value: "Bottom Left",
    },
  };
}
