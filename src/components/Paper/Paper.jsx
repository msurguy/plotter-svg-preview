import React, { useMemo } from "react";
import * as THREE from "three";
import { PaperShader } from "./PaperShader";
import {
  buildPaperFragmentShader,
  clampOctaveCount,
  NoiseTypes,
  FractalTypes,
  WarpTypes,
  WarpFractalTypes,
} from "./shaders/paperFragment.glsl";
import { computeEdgeMargin } from "../../utils/svg/flatten";
import {
  DEFAULT_NOISE_OCTAVES,
  DEFAULT_NOISE_SEED,
  DEFAULT_NOISE_FREQUENCY,
  DEFAULT_NOISE_GAIN,
  DEFAULT_NOISE_LACUNARITY,
  DEFAULT_NOISE_WEIGHTED_STRENGTH,
  DEFAULT_NOISE_PINGPONG_STRENGTH,
  DEFAULT_NOISE_TILING_X,
  DEFAULT_NOISE_TILING_Y,
  DEFAULT_WARP_AMP,
  DEFAULT_WARP_FREQUENCY,
  DEFAULT_SVG_SCALE,
  DEFAULT_FIBER_SEED_OFFSET,
  DEFAULT_FIBER_TILING_X,
  DEFAULT_FIBER_TILING_Y,
} from "../../constants.js";

const EMPTY_TEXTURE = new THREE.Texture();

export function Paper({
  size = [0.21, 0.297],
  svgTexture,
  svgOpacity = 1.0,
  svgScale = DEFAULT_SVG_SCALE,
  materialParams,
  lighting,
  noiseParams,
  fiberParams,
  rotation = [0, 0, 0],
}) {
  const edgeMargin = useMemo(() => computeEdgeMargin(svgTexture), [svgTexture]);

  const octaveCount = useMemo(
    () => clampOctaveCount(noiseParams?.octaves ?? DEFAULT_NOISE_OCTAVES),
    [noiseParams?.octaves]
  );

  const fragmentShader = useMemo(
    () => buildPaperFragmentShader(octaveCount),
    [octaveCount]
  );

  const shaderKey = useMemo(() => `paper-shader-${octaveCount}`, [octaveCount]);

  const uniforms = useMemo(() => {
    const paperColor = new THREE.Color(materialParams.paperColor);
    const ambientColor = new THREE.Color(lighting.ambientColor);
    const dirColor = new THREE.Color(lighting.dirColor);
    const noiseSeed = noiseParams?.seed ?? DEFAULT_NOISE_SEED;
    const noiseFrequency = noiseParams?.frequency ?? DEFAULT_NOISE_FREQUENCY;
    const noiseGain = noiseParams?.gain ?? DEFAULT_NOISE_GAIN;
    const noiseLacunarity = noiseParams?.lacunarity ?? DEFAULT_NOISE_LACUNARITY;
    const noiseWeightedStrength = noiseParams?.weightedStrength ?? DEFAULT_NOISE_WEIGHTED_STRENGTH;
    const noisePingPongStrength = noiseParams?.pingPongStrength ?? DEFAULT_NOISE_PINGPONG_STRENGTH;
    const noiseTilingX = Math.max(0.0001, noiseParams?.tilingX ?? DEFAULT_NOISE_TILING_X);
    const noiseTilingY = Math.max(0.0001, noiseParams?.tilingY ?? DEFAULT_NOISE_TILING_Y);
    const noiseType = NoiseTypes[noiseParams?.noiseType] ?? NoiseTypes.OpenSimplex2;
    const fractalType = FractalTypes[noiseParams?.fractalType] ?? FractalTypes.FBM;
    const warpEnabled = !!noiseParams?.warpEnabled;
    const warpAmp = noiseParams?.warpAmp ?? DEFAULT_WARP_AMP;
    const warpFrequency = noiseParams?.warpFrequency ?? DEFAULT_WARP_FREQUENCY;
    const warpType = WarpTypes[noiseParams?.warpType] ?? WarpTypes.OpenSimplex2;
    const warpFractalType = WarpFractalTypes[noiseParams?.warpFractalType] ?? WarpFractalTypes.Progressive;
    const fiberEnabled = fiberParams?.enabled ?? true;
    const fiberSeedOffset = fiberParams?.seedOffset ?? DEFAULT_FIBER_SEED_OFFSET;
    const fiberTilingX = Math.max(0.0001, fiberParams?.tilingX ?? DEFAULT_FIBER_TILING_X);
    const fiberTilingY = Math.max(0.0001, fiberParams?.tilingY ?? DEFAULT_FIBER_TILING_Y);

    return {
      uPaperColor: paperColor,
      uGrainIntensity: materialParams.grainIntensity,
      uFiberIntensity: materialParams.fiberIntensity,
      uAmbientColor: ambientColor,
      uAmbientIntensity: lighting.ambientIntensity,
      uDirColor: dirColor,
      uDirIntensity: lighting.dirIntensity,
      uLightPos: new THREE.Vector3(lighting.dirX, lighting.dirY, lighting.dirZ),
      uSvgMap: svgTexture ?? EMPTY_TEXTURE,
      uSvgOpacity: svgOpacity,
      uSvgScale: svgScale,
      uPaperSize: new THREE.Vector2(size[0], size[1]),
      uSvgEdgeMargin: edgeMargin,
      uNoiseSeed: noiseSeed,
      uNoiseFrequency: noiseFrequency,
      uNoiseType: noiseType,
      uNoiseFractalType: fractalType,
      uNoiseOctaves: octaveCount,
      uNoiseGain: noiseGain,
      uNoiseLacunarity: noiseLacunarity,
      uNoiseWeightedStrength: noiseWeightedStrength,
      uNoisePingPongStrength: noisePingPongStrength,
      uNoiseTiling: new THREE.Vector2(noiseTilingX, noiseTilingY),
      uNoiseWarpEnabled: warpEnabled,
      uNoiseWarpAmp: warpAmp,
      uNoiseWarpFrequency: warpFrequency,
      uNoiseWarpType: warpType,
      uNoiseWarpFractalType: warpFractalType,
      uFiberEnabled: fiberEnabled,
      uFiberSeedOffset: fiberSeedOffset,
      uFiberTiling: new THREE.Vector2(fiberTilingX, fiberTilingY),
    };
  }, [
    materialParams.paperColor,
    materialParams.grainIntensity,
    materialParams.fiberIntensity,
    lighting.ambientColor,
    lighting.ambientIntensity,
    lighting.dirColor,
    lighting.dirIntensity,
    lighting.dirX,
    lighting.dirY,
    lighting.dirZ,
    svgTexture,
    svgOpacity,
    svgScale,
    size,
    edgeMargin,
    noiseParams?.seed,
    noiseParams?.frequency,
    noiseParams?.noiseType,
    noiseParams?.fractalType,
    noiseParams?.octaves,
    noiseParams?.gain,
    noiseParams?.lacunarity,
    noiseParams?.weightedStrength,
    noiseParams?.pingPongStrength,
    noiseParams?.tilingX,
    noiseParams?.tilingY,
    noiseParams?.warpEnabled,
    noiseParams?.warpAmp,
    noiseParams?.warpFrequency,
    noiseParams?.warpType,
    noiseParams?.warpFractalType,
    fiberParams?.enabled,
    fiberParams?.seedOffset,
    fiberParams?.tilingX,
    fiberParams?.tilingY,
    octaveCount,
  ]);

  return (
    <mesh receiveShadow castShadow rotation={rotation}>
      <planeGeometry args={[size[0], size[1], 1, 1]} />
      <paperShader
        key={shaderKey}
        attach="material"
        transparent={false}
        fragmentShader={fragmentShader}
        {...uniforms}
      />
    </mesh>
  );
}
