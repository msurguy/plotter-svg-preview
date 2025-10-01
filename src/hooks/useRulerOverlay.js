import { useEffect, useMemo, useState } from "react";
import { createRulerTexture } from "../utils/textures/createRulerTexture";
import { inchesToMeters, mmToMeters } from "../utils/math";

export function useRulerOverlay(rulerParams, paperSize) {
  const [overlay, setOverlay] = useState(null);

  const rulerMarginMeters = useMemo(() => {
    const raw = rulerParams.unit === "mm"
      ? mmToMeters(rulerParams.marginMm)
      : inchesToMeters(rulerParams.marginIn);
    if (!Number.isFinite(raw)) {
      return 0;
    }
    return Math.max(0, raw);
  }, [rulerParams.unit, rulerParams.marginMm, rulerParams.marginIn]);

  const rulerPlaneSize = useMemo(() => {
    const safeMargin = Number.isFinite(rulerMarginMeters) ? Math.max(0, rulerMarginMeters) : 0;
    const extra = safeMargin * 2;
    return [paperSize.widthM + extra, paperSize.heightM + extra];
  }, [paperSize.widthM, paperSize.heightM, rulerMarginMeters]);

  useEffect(() => {
    if (!rulerParams?.visible) {
      setOverlay((prev) => {
        prev?.texture?.dispose?.();
        return null;
      });
      return undefined;
    }

    const margin = rulerMarginMeters;
    if (!isFinite(margin) || margin <= 0) {
      setOverlay((prev) => {
        prev?.texture?.dispose?.();
        return null;
      });
      return undefined;
    }

    const majorSpacingUnits = rulerParams.unit === "mm"
      ? rulerParams.majorSpacingMm
      : rulerParams.majorSpacingIn;
    const minorSpacingUnits = rulerParams.unit === "mm"
      ? rulerParams.minorSpacingMm
      : rulerParams.minorSpacingIn;
    const microSpacingUnits = rulerParams.unit === "mm"
      ? rulerParams.microSpacingMm
      : rulerParams.microSpacingIn;

    const result = createRulerTexture({
      paperWidthMeters: paperSize.widthM,
      paperHeightMeters: paperSize.heightM,
      marginMeters: margin,
      unit: rulerParams.unit,
      color: rulerParams.color,
      opacity: rulerParams.opacity,
      thicknessPx: rulerParams.thicknessPx,
      majorSpacingUnits,
      minorSpacingUnits,
      microSpacingUnits,
      startCorner: rulerParams.startCorner,
      showLabels: rulerParams.showLabels,
      labelEveryMajor: rulerParams.labelEveryMajor,
    });

    if (!result?.texture) {
      setOverlay((prev) => {
        prev?.texture?.dispose?.();
        return null;
      });
      return undefined;
    }

    setOverlay((prev) => {
      if (prev?.texture && prev.texture !== result.texture) {
        prev.texture.dispose?.();
      }
      return {
        texture: result.texture,
        size: [result.planeWidthMeters, result.planeHeightMeters],
        marginMeters: result.marginMeters,
        centerShift: result.centerOffsetMeters ?? [0, 0],
      };
    });

    return () => {
      result.texture?.dispose?.();
    };
  }, [
    rulerParams?.visible,
    rulerParams?.unit,
    rulerParams?.marginMm,
    rulerParams?.marginIn,
    rulerParams?.majorSpacingMm,
    rulerParams?.majorSpacingIn,
    rulerParams?.minorSpacingMm,
    rulerParams?.minorSpacingIn,
    rulerParams?.microSpacingMm,
    rulerParams?.microSpacingIn,
    rulerParams?.color,
    rulerParams?.opacity,
    rulerParams?.thicknessPx,
    rulerParams?.showLabels,
    rulerParams?.labelEveryMajor,
    rulerParams?.startCorner,
    paperSize.widthM,
    paperSize.heightM,
    rulerMarginMeters,
  ]);

  return { overlay, rulerPlaneSize, rulerMarginMeters };
}
