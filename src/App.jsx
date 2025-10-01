import React, { useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment } from "@react-three/drei";
import { useControls, Leva } from "leva";
import { HeaderBar } from "./components/HeaderBar";
import { Paper } from "./components/Paper";
import { Frame } from "./components/Frame";
import { GridOverlay } from "./components/GridOverlay";
import { RulerOverlay } from "./components/RulerOverlay";
import { useSvgTexture } from "./hooks/useSvgTexture";
import { useGridTexture } from "./hooks/useGridTexture";
import { useRulerOverlay } from "./hooks/useRulerOverlay";
import { usePaperControls } from "./hooks/usePaperControls";
import { createPaperControls } from "./controls/paperControls";
import { createMaterialControls } from "./controls/materialControls";
import { createNoiseControls } from "./controls/noiseControls";
import { createFiberControls } from "./controls/fiberControls";
import { createGridControls } from "./controls/gridControls";
import { createRulerControls } from "./controls/rulerControls";
import { createSvgControls } from "./controls/svgControls";
import { createFlattenControls } from "./controls/flattenControls";
import { createFrameControls } from "./controls/frameControls";
import { createLightingControls } from "./controls/lightingControls";
import { formatMillimeters, formatInches } from "./utils/formatting";
import { DEFAULT_SHADOW_MAP_SIZE } from "./constants/rendering";

export default function App() {
  const paperControlsConfig = useMemo(() => createPaperControls(), []);
  const materialControlsConfig = useMemo(() => createMaterialControls(), []);
  const noiseControlsConfig = useMemo(() => createNoiseControls(), []);
  const fiberControlsConfig = useMemo(() => createFiberControls(), []);
  const gridControlsConfig = useMemo(() => createGridControls(), []);
  const rulerControlsConfig = useMemo(() => createRulerControls(), []);
  const svgControlsConfig = useMemo(() => createSvgControls(), []);
  const frameControlsConfig = useMemo(() => createFrameControls(), []);
  const flattenControlsConfig = useMemo(() => createFlattenControls(), []);
  const lightingControlsConfig = useMemo(() => createLightingControls(), []);

  const paperControlValues = useControls("Paper", paperControlsConfig, { order: -2 });
  const materialParams = useControls("Paper Material", materialControlsConfig);
  const noiseParams = useControls("Paper Noise", noiseControlsConfig);
  const fiberParams = useControls("Paper Fibers", fiberControlsConfig);
  const gridParams = useControls("Grid", gridControlsConfig);
  const rulerParams = useControls("Ruler", rulerControlsConfig);
  const svgParams = useControls("SVG", svgControlsConfig, { order: -1 });
  const frameParams = useControls("Frame", frameControlsConfig, { order: -1.1 });
  const flattenControls = useControls("Flatten & Stroke", flattenControlsConfig, { order: -0.5 });
  const lighting = useControls("Lighting", lightingControlsConfig);

  const { paperSize, paperPlaneSize, paperRotationRad } = usePaperControls(paperControlValues);

  const {
    svgFile,
    svgTexture,
    textureKey,
    handleSvgFileSelection,
    svgScaleUniform,
    scaleInfo,
    strokeInfo,
    isProcessing,
  } = useSvgTexture({
    svgMode: svgParams.mode,
    svgParams,
    flattenControls,
    paperSize,
  });

  const gridTexture = useGridTexture(gridParams, paperSize);
  const { overlay: rulerOverlay, rulerPlaneSize } = useRulerOverlay(rulerParams, paperSize);

  const dirPos = useMemo(() => [lighting.dirX, lighting.dirY, lighting.dirZ], [
    lighting.dirX,
    lighting.dirY,
    lighting.dirZ,
  ]);

  const rulerCenterShiftWorld = useMemo(() => {
    const centerShift = rulerOverlay?.centerShift ?? [0, 0];
    const [shiftX, shiftY] = centerShift;
    if (!shiftX && !shiftY) {
      return [0, 0];
    }
    const localX = shiftX;
    const localY = -shiftY;
    const cosR = Math.cos(paperRotationRad);
    const sinR = Math.sin(paperRotationRad);
    return [localX * cosR - localY * sinR, localX * sinR + localY * cosR];
  }, [rulerOverlay?.centerShift, paperRotationRad]);

  const svgHeaderInfo = useMemo(() => {
    const fileName = svgFile?.name ?? "—";
    const scale = scaleInfo ? `scale ${scaleInfo.percent.toFixed(0)}%` : "—";
    const drawingSize = scaleInfo
      ? `Drawing ≈ ${formatMillimeters(scaleInfo.widthMm)} × ${formatMillimeters(scaleInfo.heightMm)} mm (${formatInches(scaleInfo.widthIn)} × ${formatInches(scaleInfo.heightIn)} in)`
      : "—";
    const baseAndPadding = scaleInfo
      ? `Padding: ${formatMillimeters(scaleInfo.padMm)} mm/side`
      : "—";
    const strokeWidth = strokeInfo
      ? `Stroke ≈ ${formatMillimeters(strokeInfo.widthMm)} mm (${formatInches(strokeInfo.widthIn)} in)`
      : "—";

    return {
      fileName,
      scale,
      drawingSize,
      baseAndPadding,
      strokeWidth,
    };
  }, [scaleInfo, strokeInfo, svgFile]);

  return (
    <div className="app-layout">
      <HeaderBar
        onFileSelected={handleSvgFileSelection}
        svgInfo={svgHeaderInfo}
        isProcessing={isProcessing}
      />
      <div className="app-canvas">
        <Canvas camera={{ position: [0, 0, 0.6], fov: 35 }} shadows>
          <ambientLight intensity={lighting.ambientIntensity} />
          <directionalLight
            position={dirPos}
            intensity={lighting.dirIntensity}
            castShadow
            shadow-mapSize-width={DEFAULT_SHADOW_MAP_SIZE}
            shadow-mapSize-height={DEFAULT_SHADOW_MAP_SIZE}
          />
          <Environment preset={lighting.envPreset} background={lighting.envBackground} />

          <Frame
            size={paperPlaneSize}
            rotation={[0, 0, paperRotationRad]}
            visible={frameParams.visible}
            color={frameParams.color}
            borderWidthMm={frameParams.borderWidthMm}
            depthMm={frameParams.depthMm}
            frontOffsetMm={frameParams.frontOffsetMm}
            metalness={frameParams.metalness}
            roughness={frameParams.roughness}
          />
          <Paper
            key={textureKey}
            size={paperPlaneSize}
            svgTexture={svgTexture}
            svgOpacity={svgParams.svgOpacity}
            svgScale={svgScaleUniform}
            materialParams={materialParams}
            lighting={lighting}
            noiseParams={noiseParams}
            fiberParams={fiberParams}
            rotation={[0, 0, paperRotationRad]}
          />
          <GridOverlay
            size={paperPlaneSize}
            rotation={[0, 0, paperRotationRad]}
            texture={gridTexture}
            visible={gridParams.visible}
          />
          <RulerOverlay
            size={rulerOverlay?.size || rulerPlaneSize}
            rotation={[0, 0, paperRotationRad]}
            texture={rulerOverlay?.texture || null}
            visible={rulerParams.visible && !!rulerOverlay?.texture}
            centerShift={rulerCenterShiftWorld}
          />

          <OrbitControls enablePan maxPolarAngle={Math.PI / 2} minDistance={0.1} maxDistance={3.5} />
        </Canvas>
      </div>
      <div className="app-leva">
        <Leva oneLineLabels collapsed={false} fill flat titleBar={false} />
      </div>
    </div>
  );
}
