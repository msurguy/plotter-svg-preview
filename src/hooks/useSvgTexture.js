import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MathUtils, Texture } from "three";
import { DEFAULT_RASTER_RESOLUTION } from "../constants/rendering";
import { IN_PER_M, MM_PER_M } from "../constants/paper";
import { runOptimizeWorker } from "../utils/svg/optimize";
import { normalizeSvgUnits } from "../utils/svg/normalize";
import { flattenAndRasterizeSvg, clearFlattenCaches, yieldToBrowser } from "../utils/svg/flatten";
import { rasterizeSvg } from "../utils/svg/rasterize";
import { optimizeSvg, presets as svgoPresets } from "../utils/svgo";

const EMPTY_TEXTURE = new Texture();

export function useSvgTexture({
  svgMode,
  svgParams,
  flattenControls,
  paperSize,
  defaultSvgUrl,
}) {
  const [svgFile, setSvgFile] = useState(null);
  const [svgSource, setSvgSource] = useState(null);
  const [svgTexture, setSvgTexture] = useState(null);
  const [svgAspect, setSvgAspect] = useState(1);
  const [textureKey, setTextureKey] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const regenTimer = useRef(null);
  const hasLoadedDefault = useRef(false);

  const handleSvgFileSelection = useCallback((file) => {
    if (!file) {
      setSvgFile(null);
      setIsProcessing(false);
      return;
    }
    const isSvg = file.type === "image/svg+xml" || file.name?.toLowerCase().endsWith(".svg");
    if (!isSvg) {
      alert("Please choose an SVG file.");
      return;
    }

    setIsProcessing(true);
    setSvgFile(file);
  }, []);

  useEffect(() => {
    if (!defaultSvgUrl || svgFile || hasLoadedDefault.current) {
      return;
    }

    let cancelled = false;

    async function loadDefaultSvg() {
      try {
        const response = await fetch(defaultSvgUrl);
        if (!response.ok) {
          throw new Error(`Failed to fetch default SVG (${response.status})`);
        }
        const blob = await response.blob();
        const defaultName = defaultSvgUrl.split("/").filter(Boolean).pop() || "default.svg";
        const file = new File([blob], defaultName, { type: "image/svg+xml" });

        if (!cancelled) {
          hasLoadedDefault.current = true;
          setIsProcessing(true);
          setSvgFile(file);
        }
      } catch (err) {
        console.warn("[useSvgTexture] Failed to load default SVG", err);
      }
    }

    loadDefaultSvg();

    return () => {
      cancelled = true;
    };
  }, [defaultSvgUrl, svgFile]);

  useEffect(() => {
    let cancelled = false;

    async function loadSvgSource(file) {
      try {
        if (!file) {
          setSvgSource(null);
          setIsProcessing(false);
          return;
        }
        const svgTextRaw = await file.text();
        let optimized = null;
        let workerTimedOut = false;
        try {
          const workerResult = await runOptimizeWorker(svgTextRaw, { timeoutMs: 15000 });
          if (workerResult) {
            optimized = workerResult;
          }
        } catch (err) {
          workerTimedOut = true;
          console.warn("Worker optimization failed", err);
        }

        if (!optimized) {
          if (workerTimedOut) {
            console.warn("[useSvgTexture] Skipping inline optimization after worker failure");
            optimized = null;
          } else {
            await yieldToBrowser();
            optimized =
              optimizeSvg(svgTextRaw, svgoPresets.OUTPUT_COMPACT)?.svg ?? svgTextRaw;
          }
        }

        let normalized = null;
        try {
          normalized = normalizeSvgUnits(optimized);
        } catch (err) {
          console.warn("Unit normalization failed", err);
        }
        const finalSvg = normalized || optimized || svgTextRaw;

        try {
          const parsed = new DOMParser().parseFromString(finalSvg, "image/svg+xml");
          const root = parsed?.documentElement;
          if (root) {
            console.info("[useSvgTexture] Final SVG ready", {
              widthAttr: root.getAttribute("width"),
              heightAttr: root.getAttribute("height"),
              viewBox: root.getAttribute("viewBox"),
              hasPolyline: !!root.querySelector("polyline")
            });
          }
        } catch (parseErr) {
          console.warn("[useSvgTexture] Failed to parse final SVG for logging", parseErr);
        }

        if (!cancelled) {
          clearFlattenCaches();
          setSvgSource(finalSvg);
        }
      } catch (err) {
        console.error("Failed to load SVG", err);
        if (!cancelled) {
          setSvgSource(null);
          setIsProcessing(false);
        }
      }
    }

    loadSvgSource(svgFile);

    return () => {
      cancelled = true;
    };
  }, [svgFile]);

  const clampedScalePercent = useMemo(() => {
    const raw = Number(svgParams.scaleOnPaperPercent);
    if (!Number.isFinite(raw)) {
      return 100;
    }
    return Math.min(200, Math.max(10, raw));
  }, [svgParams.scaleOnPaperPercent]);

  const scaleFactor = useMemo(() => clampedScalePercent / 100, [clampedScalePercent]);

  const svgScaleUniform = useMemo(
    () => 1 / Math.max(scaleFactor, 1e-6),
    [scaleFactor]
  );

  const drawingMetrics = useMemo(() => {
    const widthM = paperSize?.widthM;
    const heightM = paperSize?.heightM;
    if (!Number.isFinite(widthM) || !Number.isFinite(heightM)) {
      return null;
    }

    const minDimension = Math.min(widthM, heightM);
    const resolution = Number.isFinite(svgParams.targetResolutionPx) && svgParams.targetResolutionPx > 0
      ? svgParams.targetResolutionPx
      : DEFAULT_RASTER_RESOLUTION;
    const padRaw = Number.isFinite(svgParams.paddingPx) ? svgParams.paddingPx : 0;
    const padPx = Math.min(Math.max(0, Math.floor(padRaw)), Math.floor(resolution / 2));
    const availPx = Math.max(1, resolution - padPx * 2);
    const aspect = Number.isFinite(svgAspect) && svgAspect > 0 ? svgAspect : 1;

    let drawW = availPx;
    let drawH = availPx;
    if (svgParams.keepAspect) {
      if (aspect >= 1) {
        drawW = availPx;
        drawH = availPx / Math.max(aspect, 1e-6);
      } else {
        drawW = availPx * aspect;
        drawH = availPx;
      }
    }

    const rotationRad = MathUtils.degToRad(svgParams.svgRotationDeg || 0);
    const cosR = Math.cos(rotationRad);
    const sinR = Math.sin(rotationRad);
    const rotBoundsW = Math.abs(drawW * cosR) + Math.abs(drawH * sinR);
    const rotBoundsH = Math.abs(drawW * sinR) + Math.abs(drawH * cosR);
    const fitScale = Math.min(
      availPx / Math.max(rotBoundsW, 1e-6),
      availPx / Math.max(rotBoundsH, 1e-6),
      1
    );

    drawW *= fitScale;
    drawH *= fitScale;

    const axisWidthPx = Math.abs(drawW * cosR) + Math.abs(drawH * sinR);
    const axisHeightPx = Math.abs(drawW * sinR) + Math.abs(drawH * cosR);
    const metersPerPixel = minDimension / resolution;

    return {
      baseSquareSideM: Math.max(0, (resolution - padPx * 2) * metersPerPixel),
      padPhysicalM: padPx * metersPerPixel,
      axisWidthM: axisWidthPx * metersPerPixel,
      axisHeightM: axisHeightPx * metersPerPixel,
      metersPerPixel,
    };
  }, [
    paperSize?.widthM,
    paperSize?.heightM,
    svgParams.targetResolutionPx,
    svgParams.paddingPx,
    svgParams.keepAspect,
    svgParams.svgRotationDeg,
    svgAspect,
  ]);

  const flattenStrokeWidthPx = useMemo(() => {
    const strokeWidthMm = flattenControls.strokeWidthMm;
    if (!Number.isFinite(strokeWidthMm) || strokeWidthMm <= 0) {
      return 0;
    }
    const metersPerPixel = drawingMetrics?.metersPerPixel;
    const scale = Math.max(scaleFactor, 1e-6);
    if (!Number.isFinite(metersPerPixel) || metersPerPixel <= 0) {
      const minDimension = Math.min(paperSize?.widthM ?? 0, paperSize?.heightM ?? 0);
      const resolution = Number.isFinite(svgParams.targetResolutionPx) && svgParams.targetResolutionPx > 0
        ? svgParams.targetResolutionPx
        : DEFAULT_RASTER_RESOLUTION;
      const fallbackMetersPerPixel = minDimension / Math.max(resolution, 1);
      return (strokeWidthMm / MM_PER_M) / (fallbackMetersPerPixel * scale);
    }
    return (strokeWidthMm / MM_PER_M) / (metersPerPixel * scale);
  }, [
    drawingMetrics,
    flattenControls.strokeWidthMm,
    paperSize?.heightM,
    paperSize?.widthM,
    scaleFactor,
    svgParams.targetResolutionPx,
  ]);

  const scaleInfo = useMemo(() => {
    if (!drawingMetrics) {
      return null;
    }
    const widthM = drawingMetrics.axisWidthM * scaleFactor;
    const heightM = drawingMetrics.axisHeightM * scaleFactor;
    const squareSideM = drawingMetrics.baseSquareSideM * scaleFactor;

    return {
      percent: clampedScalePercent,
      widthMm: widthM * MM_PER_M,
      heightMm: heightM * MM_PER_M,
      widthIn: widthM * IN_PER_M,
      heightIn: heightM * IN_PER_M,
      squareSideMm: squareSideM * MM_PER_M,
      baseSquareSideMm: drawingMetrics.baseSquareSideM * MM_PER_M,
      padMm: drawingMetrics.padPhysicalM * MM_PER_M,
    };
  }, [drawingMetrics, scaleFactor, clampedScalePercent]);

  const strokeInfo = useMemo(() => {
    const strokeWidthMm = flattenControls.strokeWidthMm;
    if (!Number.isFinite(strokeWidthMm) || strokeWidthMm <= 0) {
      return null;
    }
    const strokeMeters = strokeWidthMm / MM_PER_M;
    return {
      widthMm: strokeWidthMm,
      widthIn: strokeMeters * IN_PER_M,
    };
  }, [flattenControls.strokeWidthMm]);

  useEffect(() => {
    if (!svgSource) {
      setSvgTexture((prev) => {
        if (prev && prev !== EMPTY_TEXTURE) {
          prev.dispose?.();
        }
        return null;
      });
      setSvgAspect(1);
      setIsProcessing(false);
      return undefined;
    }

    let disposed = false;

    async function regenerateTexture(svgText, resPx) {
      console.info("[useSvgTexture] Regenerating texture", {
        mode: svgMode,
        resolution: resPx,
        paddingPx: svgParams.paddingPx,
        keepAspect: svgParams.keepAspect,
        rotationDeg: svgParams.svgRotationDeg,
        flattenStrokeWidthPx,
      });

      let result;
      const commonOpts = {
        resolution: resPx,
        paddingPx: svgParams.paddingPx,
        keepAspect: svgParams.keepAspect,
        rotationDeg: svgParams.svgRotationDeg,
      };

      try {
        if (svgMode === "Flatten & Stroke") {
          result = await flattenAndRasterizeSvg(svgText, {
            ...commonOpts,
            maxError: flattenControls.maxError,
            strokeWidthPx: flattenStrokeWidthPx,
            strokeColor: flattenControls.strokeColor,
            lineCap: flattenControls.lineCap,
            lineJoin: flattenControls.lineJoin,
            miterLimit: flattenControls.miterLimit,
            preserveColors: flattenControls.preserveColors,
          });
        } else {
          result = await rasterizeSvg(svgText, commonOpts);
        }
      } catch (err) {
        console.error("[useSvgTexture] Failed to regenerate texture", err);
        if (!disposed) {
          setIsProcessing(false);
        }
        return;
      }

      if (!disposed) {
        setSvgTexture((prev) => {
          if (prev && prev !== result.texture) {
            prev.dispose?.();
          }
          return result.texture;
        });
        setSvgAspect(result.aspect);
        setTextureKey((k) => k + 1);
        console.info("[useSvgTexture] Texture updated", {
          aspect: result.aspect,
          key: textureKey + 1,
        });
        setIsProcessing(false);
      } else {
        result.texture.dispose?.();
      }
    }

    if (regenTimer.current) clearTimeout(regenTimer.current);
    const resolution = Number.isFinite(svgParams.targetResolutionPx) && svgParams.targetResolutionPx > 0
      ? svgParams.targetResolutionPx
      : DEFAULT_RASTER_RESOLUTION;
    setIsProcessing(true);
    regenTimer.current = setTimeout(() => {
      regenerateTexture(svgSource, resolution);
    }, 150);

    return () => {
      disposed = true;
      if (regenTimer.current) {
        clearTimeout(regenTimer.current);
      }
    };
  }, [
    svgSource,
    svgMode,
    svgParams.paddingPx,
    svgParams.keepAspect,
    svgParams.svgRotationDeg,
    svgParams.targetResolutionPx,
    flattenControls.maxError,
    flattenControls.strokeColor,
    flattenControls.lineCap,
    flattenControls.lineJoin,
    flattenControls.miterLimit,
    flattenControls.preserveColors,
    flattenStrokeWidthPx,
  ]);

  return {
    svgFile,
    setSvgFile,
    svgSource,
    svgTexture: svgTexture ?? EMPTY_TEXTURE,
    svgAspect,
    textureKey,
    handleSvgFileSelection,
    clampedScalePercent,
    scaleFactor,
    svgScaleUniform,
    drawingMetrics,
    scaleInfo,
    strokeInfo,
    flattenStrokeWidthPx,
    isProcessing,
  };
}
