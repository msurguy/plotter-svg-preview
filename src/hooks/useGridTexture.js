import { useEffect, useState } from "react";
import { createGridTexture } from "../utils/textures/createGridTexture";
import { inchesToMeters, mmToMeters } from "../utils/math";

export function useGridTexture(gridParams, paperSize) {
  const [gridTexture, setGridTexture] = useState(null);

  useEffect(() => {
    if (!gridParams?.visible) {
      setGridTexture((prev) => {
        prev?.dispose?.();
        return null;
      });
      return undefined;
    }

    const spacingMeters = gridParams.unit === "mm"
      ? mmToMeters(gridParams.spacingMm)
      : inchesToMeters(gridParams.spacingIn);

    if (!spacingMeters || !isFinite(spacingMeters) || spacingMeters <= 0) {
      setGridTexture((prev) => {
        prev?.dispose?.();
        return null;
      });
      return undefined;
    }

    const texture = createGridTexture({
      widthMeters: paperSize.widthM,
      heightMeters: paperSize.heightM,
      spacingMeters,
      lineColor: gridParams.lineColor,
      lineOpacity: gridParams.lineOpacity,
      lineThicknessPx: gridParams.lineThicknessPx,
      originCorner: gridParams.originCorner,
    });

    setGridTexture((prev) => {
      if (prev && prev !== texture) {
        prev.dispose?.();
      }
      return texture;
    });

    return () => {
      texture?.dispose?.();
    };
  }, [
    gridParams?.visible,
    gridParams?.unit,
    gridParams?.spacingMm,
    gridParams?.spacingIn,
    gridParams?.lineColor,
    gridParams?.lineOpacity,
    gridParams?.lineThicknessPx,
    gridParams?.originCorner,
    paperSize.widthM,
    paperSize.heightM,
  ]);

  return gridTexture;
}
