import { useMemo } from "react";
import { MathUtils } from "three";
import { PAPER_PRESETS } from "../constants/paper";

export function usePaperControls({ preset, customWidth, customHeight, paperRotationDeg }) {
  const paperSize = useMemo(
    () =>
      preset !== "Custom"
        ? PAPER_PRESETS[preset]
        : { widthM: customWidth, heightM: customHeight },
    [preset, customWidth, customHeight]
  );

  const paperPlaneSize = useMemo(() => [paperSize.widthM, paperSize.heightM], [paperSize]);

  const paperRotationRad = useMemo(
    () => MathUtils.degToRad(paperRotationDeg || 0),
    [paperRotationDeg]
  );

  return { paperSize, paperPlaneSize, paperRotationRad };
}
