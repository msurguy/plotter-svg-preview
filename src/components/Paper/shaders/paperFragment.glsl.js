import {
  DEFAULT_NOISE_OCTAVES,
  FractalTypes,
  NoiseTypes,
  WarpFractalTypes,
  WarpTypes,
} from "../../../constants/noise";
import NOISE_GLSL_RAW from "../../../utils/glsl/noise.glsl?raw";

export function clampOctaveCount(octaves) {
  if (!Number.isFinite(octaves)) {
    return DEFAULT_NOISE_OCTAVES;
  }
  return Math.max(1, Math.min(12, Math.floor(octaves)));
}

function prepareNoiseLib(octaves) {
  const targetOctaves = clampOctaveCount(octaves);
  let lib = NOISE_GLSL_RAW;
  lib = lib.replace(/([+-]?\d+\.\d+)f/g, "$1");
  lib = lib.replace(/([+-]?\d+)\.f/g, "$1.");
  lib = lib.replace(/([+-]?\d+)f/g, "$1");
  lib = lib.replace(
    /for\s*\(\s*int\s*i\s*=\s*(\d+)\s*;\s*i\s*<\s*state\.octaves\s*;\s*i\+\+\s*\)/g,
    (_m, start) => `for (int i = ${start}; i < OCTAVES; i++)`
  );
  lib = lib.replace(
    /const\s+float\s+([A-Za-z0-9_]+)\s*\[\]\s*=\s*\{([\s\S]*?)\};/g,
    (_m, name, body) => {
      const items = body.split(",").map((s) => s.trim()).filter(Boolean);
      const count = items.length;
      return `const float ${name}[${count}] = float[${count}](${items.join(", ")});`;
    }
  );
  lib = lib.replace(
    /const\s+int\s+([A-Za-z0-9_]+)\s*\[\]\s*=\s*\{([\s\S]*?)\};/g,
    (_m, name, body) => {
      const items = body.split(",").map((s) => s.trim()).filter(Boolean);
      const count = items.length;
      return `const int ${name}[${count}] = int[${count}](${items.join(", ")});`;
    }
  );
  return `#define OCTAVES ${targetOctaves}\n${lib}`;
}

export function buildPaperFragmentShader(octaves = DEFAULT_NOISE_OCTAVES) {
  const lib = prepareNoiseLib(octaves);
  return /* glsl */`
  ${lib}
  precision highp float;
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vViewPos;

  uniform vec3  uPaperColor;
  uniform float uGrainIntensity;
  uniform float uFiberIntensity;

  uniform vec3  uAmbientColor;
  uniform float uAmbientIntensity;
  uniform vec3  uDirColor;
  uniform float uDirIntensity;
  uniform vec3  uLightPos;

  uniform sampler2D uSvgMap;
  uniform float     uSvgOpacity;
  uniform float     uSvgScale;
  uniform vec2      uPaperSize;
  uniform float     uSvgEdgeMargin;

  uniform float uNoiseSeed;
  uniform float uNoiseFrequency;
  uniform int   uNoiseType;
  uniform int   uNoiseFractalType;
  uniform int   uNoiseOctaves;
  uniform float uNoiseGain;
  uniform float uNoiseLacunarity;
  uniform float uNoiseWeightedStrength;
  uniform float uNoisePingPongStrength;
  uniform vec2  uNoiseTiling;

  uniform bool  uNoiseWarpEnabled;
  uniform float uNoiseWarpAmp;
  uniform float uNoiseWarpFrequency;
  uniform int   uNoiseWarpType;
  uniform int   uNoiseWarpFractalType;

  uniform bool  uFiberEnabled;
  uniform float uFiberSeedOffset;
  uniform vec2  uFiberTiling;

  fnl_state makeNoiseState(float seedOffset, float frequency, int noiseType, int fractalType) {
    fnl_state state = fnlCreateState(int(uNoiseSeed + seedOffset));
    state.frequency = frequency;
    state.noise_type = noiseType;
    state.fractal_type = fractalType;
    state.octaves = uNoiseOctaves;
    state.lacunarity = uNoiseLacunarity;
    state.gain = uNoiseGain;
    state.weighted_strength = uNoiseWeightedStrength;
    state.ping_pong_strength = uNoisePingPongStrength;
    return state;
  }

  vec2 applyDomainWarp(vec2 pos, float seedOffset) {
    vec2 warped = pos;
    if (uNoiseWarpEnabled) {
      fnl_state warpState = makeNoiseState(seedOffset + 97.0, uNoiseWarpFrequency, fnl_noise_type(uNoiseType), fnl_fractal_type(uNoiseWarpFractalType));
      warpState.domain_warp_type = fnl_domain_warp_type(uNoiseWarpType);
      warpState.domain_warp_amp = uNoiseWarpAmp;
      warpState.octaves = uNoiseOctaves;
      warpState.lacunarity = uNoiseLacunarity;
      warpState.gain = uNoiseGain;
      fnlDomainWarp2D(warpState, warped.x, warped.y);
    }
    return warped;
  }

  float sampleNoise2D(vec2 uv, vec2 tiling, float seedOffset) {
    vec2 scaled = uv * tiling;
    vec2 warped = applyDomainWarp(scaled, seedOffset);
    fnl_state state = makeNoiseState(seedOffset, uNoiseFrequency, fnl_noise_type(uNoiseType), fnl_fractal_type(uNoiseFractalType));
    float n = fnlGetNoise2D(state, warped.x, warped.y);
    return clamp(0.5 * (n + 1.0), 0.0, 1.0);
  }

  void main(){
    vec3 lightViewPos = (viewMatrix * vec4(uLightPos, 1.0)).xyz;
    vec3 L = normalize(lightViewPos - vViewPos);
    float NdotL = max(0.0, dot(normalize(vNormal), L));
    vec3 shade = uAmbientColor * uAmbientIntensity + uDirColor * uDirIntensity * NdotL;
    shade = clamp(shade, 0.0, 1.0);

    vec3 paper = uPaperColor;
    float grain = sampleNoise2D(vUv, uNoiseTiling, 0.0);
    paper += (grain - 0.5) * 2.0 * uGrainIntensity;

    float fiberSample = 0.0;
    if (uFiberEnabled) {
      fiberSample = sampleNoise2D(vUv, uFiberTiling, uFiberSeedOffset);
    }
    paper -= fiberSample * uFiberIntensity;
    paper = clamp(paper, 0.0, 1.0);

    vec2 worldPos = vec2(
      (vUv.x - 0.5) * uPaperSize.x,
      (vUv.y - 0.5) * uPaperSize.y
    );
    float halfMin = 0.5 * min(uPaperSize.x, uPaperSize.y);
    halfMin = max(halfMin, 1e-6);
    vec2 squarePos = (worldPos / halfMin) * uSvgScale;
    vec2 tuv = squarePos * 0.5 + 0.5;

    float margin = uSvgEdgeMargin;
    vec2 clampedUv = clamp(tuv, margin, 1.0 - margin);
    vec4 svgTex = texture2D(uSvgMap, clampedUv);

    float insideX = step(-margin, tuv.x) * (1.0 - step(1.0 + margin, tuv.x));
    float insideY = step(-margin, tuv.y) * (1.0 - step(1.0 + margin, tuv.y));
    float inside = insideX * insideY;
    svgTex *= inside;
    float A = svgTex.a * uSvgOpacity;

    vec3 paperLit = paper * shade;
    vec3 svgLit = svgTex.rgb * shade;
    vec3 outCol = mix(paperLit, svgLit, A);

    gl_FragColor = vec4(outCol, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
  `;
}

export { NoiseTypes, FractalTypes, WarpTypes, WarpFractalTypes };
