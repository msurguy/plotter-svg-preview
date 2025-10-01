// src/utils/svgo/explicit-config.js
export const INPUT_PRESERVE = {
  multipass: true,
  js2svg: { pretty: false },
  preset: {
    removeDoctype: { enabled: true },
    removeXMLProcInst: { enabled: true },
    removeComments: { enabled: true },
    removeMetadata: { enabled: true },
    removeEditorsNSData: { enabled: true },
    cleanupAttrs: { enabled: true },

    mergeStyles: { enabled: true },
    inlineStyles: { enabled: true, params: { onlyMatchedOnce: true, removeMatchedSelectors: true } },
    minifyStyles: { enabled: true },

    cleanupIds: { enabled: true },
    removeUselessDefs: { enabled: true },

    cleanupNumericValues: { enabled: true, params: { floatPrecision: 3, leadingZero: true, defaultPx: true, convertToPx: true } },
    convertColors: { enabled: true },

    removeUnknownsAndDefaults: { enabled: true },
    removeNonInheritableGroupAttrs: { enabled: true },
    removeUselessStrokeAndFill: { enabled: true },
    cleanupEnableBackground: { enabled: true },

    removeHiddenElems: { enabled: true },
    removeEmptyText: { enabled: true },

    convertShapeToPath: { enabled: false },
    convertEllipseToCircle: { enabled: true },

    moveElemsAttrsToGroup: { enabled: false },
    moveGroupAttrsToElems: { enabled: false },
    collapseGroups: { enabled: false },

    convertPathData: {
      enabled: true,
      params: {
        applyTransforms: true,
        applyTransformsStroked: true,
        straightCurves: true,
        convertToQ: true,
        lineShorthands: true,
        convertToZ: true,
        curveSmoothShorthands: true,
        floatPrecision: 3,
        transformPrecision: 5,
        smartArcRounding: true,
        removeUseless: true,
        collapseRepeated: true,
        utilizeAbsolute: true,
        forceAbsolutePath: false
      }
    },
    convertTransform: { enabled: true },

    removeEmptyAttrs: { enabled: true },
    removeEmptyContainers: { enabled: true },
    removeUnusedNS: { enabled: true },

    mergePaths: { enabled: false, params: { floatPrecision: 3, noSpaceAfterFlags: false } },
    sortAttrs: { enabled: false },
    sortDefsChildren: { enabled: true },

    removeDesc: { enabled: true }
  },
  extra: {
    removeScripts: { enabled: true },
    prefixIds: { enabled: true, params: { prefix: 'svgprep-' } },
    removeXMLNS: { enabled: false },
    removeDimensions: { enabled: false },
    removeViewBox: { enabled: false }
  }
};

export const OUTPUT_COMPACT = {
  ...INPUT_PRESERVE,
  preset: {
    ...INPUT_PRESERVE.preset,
    convertShapeToPath: { enabled: true },
    moveElemsAttrsToGroup: { enabled: true },
    moveGroupAttrsToElems: { enabled: true },
    collapseGroups: { enabled: true },
    mergePaths: { enabled: true, params: { floatPrecision: 3, noSpaceAfterFlags: false } }
  },
  extra: {
    ...INPUT_PRESERVE.extra,
    removeDimensions: { enabled: true },
    removeViewBox: { enabled: false }
  }
};

export function buildSvgoConfig(svgText, explicit) {
  const overrides = {};
  for (const [name, spec] of Object.entries(explicit.preset || {})) {
    if (!spec || typeof spec.enabled === 'undefined') continue;
    if (spec.enabled === false) {
      overrides[name] = false;
    } else if (spec.params && Object.keys(spec.params).length) {
      overrides[name] = spec.params;
    }
  }
  const plugins = [{ name: 'preset-default', params: { overrides } }];
  const extras = explicit.extra || {};
  for (const [name, spec] of Object.entries(extras)) {
    if (spec && spec.enabled) {
      plugins.push(spec.params ? { name, params: spec.params } : { name });
    }
  }
  return {
    multipass: !!explicit.multipass,
    js2svg: explicit.js2svg || { pretty: false },
    plugins
  };
}
