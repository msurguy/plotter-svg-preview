// src/index.js
import { optimize } from 'svgo/browser';
import { buildSvgoConfig, INPUT_PRESERVE, OUTPUT_COMPACT } from './explicit-config.js';
import { splitIntoTopLevelGroups } from './utils.js';

export const presets = { INPUT_PRESERVE, OUTPUT_COMPACT };

export function optimizeSvg(svgText, explicitConfig = INPUT_PRESERVE) {
  const svgoConfig = buildSvgoConfig(svgText, explicitConfig);
  const res = optimize(svgText, svgoConfig);
  return {
    svg: res.data,
    bytesIn: new Blob([svgText]).size,
    bytesOut: new Blob([res.data]).size,
    configUsed: svgoConfig
  };
}

export function preprocessThenExport(svgText, inputCfg = INPUT_PRESERVE, outputCfg = OUTPUT_COMPACT) {
  const a = optimizeSvg(svgText, inputCfg);
  const b = optimizeSvg(a.svg, outputCfg);
  return { input: a, output: b };
}

export function splitLayers(svgText) {
  return splitIntoTopLevelGroups(svgText);
}
