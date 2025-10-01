import { PAPER_PRESET_NAMES, DEFAULT_PAPER_PRESET } from "../constants/paper";

export function createPaperControls() {
  const paperPresetOptions = [...PAPER_PRESET_NAMES, "Custom"];
  return {
    preset: { options: paperPresetOptions, value: DEFAULT_PAPER_PRESET },
    customWidth: {
      value: 0.21,
      min: 0.05,
      max: 1,
      step: 0.001,
      render: (get) => get("Paper.preset") === "Custom",
    },
    customHeight: {
      value: 0.297,
      min: 0.05,
      max: 1,
      step: 0.001,
      render: (get) => get("Paper.preset") === "Custom",
    },
    paperRotationDeg: {
      options: { "-90°": -90, "0°": 0, "90°": 90 },
      value: 0,
    },
  };
}
