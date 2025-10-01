import * as THREE from "three";
import { extend } from "@react-three/fiber";
import { shaderMaterial } from "@react-three/drei";
import { buildPaperFragmentShader } from "./shaders/paperFragment.glsl";
import { DEFAULT_NOISE_OCTAVES, NoiseTypes, FractalTypes, WarpTypes, WarpFractalTypes } from "../../constants/noise";
import { DEFAULT_RASTER_RESOLUTION, HALF_PIXEL_MARGIN_PX } from "../../constants/rendering";

const PaperShader = shaderMaterial(
  {
    uPaperColor: new THREE.Color("#f6f2e8"),
    uGrainIntensity: 0.08,
    uFiberIntensity: 0.07,
    uAmbientColor: new THREE.Color("#ffffff"),
    uAmbientIntensity: 0.45,
    uDirColor: new THREE.Color("#ffffff"),
    uDirIntensity: 1.2,
    uLightPos: new THREE.Vector3(0.7, 1.5, 1.0),
    uSvgMap: null,
    uSvgOpacity: 1.0,
    uSvgScale: 0.9,
    uPaperSize: new THREE.Vector2(0.21, 0.297),
    uSvgEdgeMargin: HALF_PIXEL_MARGIN_PX / DEFAULT_RASTER_RESOLUTION,
    uNoiseSeed: 1337,
    uNoiseFrequency: 1.0,
    uNoiseType: NoiseTypes.OpenSimplex2,
    uNoiseFractalType: FractalTypes.FBM,
    uNoiseOctaves: DEFAULT_NOISE_OCTAVES,
    uNoiseGain: 0.5,
    uNoiseLacunarity: 2.0,
    uNoiseWeightedStrength: 0.0,
    uNoisePingPongStrength: 2.0,
    uNoiseTiling: new THREE.Vector2(350, 350),
    uNoiseWarpEnabled: false,
    uNoiseWarpAmp: 10.0,
    uNoiseWarpFrequency: 2.0,
    uNoiseWarpType: WarpTypes.OpenSimplex2,
    uNoiseWarpFractalType: WarpFractalTypes.Progressive,
    uFiberEnabled: true,
    uFiberSeedOffset: 101.0,
    uFiberTiling: new THREE.Vector2(800, 10),
  },
  /* glsl */`
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vViewPos;
  void main(){
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    vec4 viewPos = modelViewMatrix * vec4(position, 1.0);
    vViewPos = viewPos.xyz;
    gl_Position = projectionMatrix * viewPos;
  }
  `,
  buildPaperFragmentShader(DEFAULT_NOISE_OCTAVES)
);

extend({ PaperShader });

export { PaperShader };
