// =============================================================================
// CONSTANTS
// =============================================================================
// Centralized constants file containing all configuration values used
// throughout the application. Constants are organized into logical sections
// with descriptions for easy maintenance.
// =============================================================================

// =============================================================================
// UNIT CONVERSION CONSTANTS
// =============================================================================

// Millimeters to meters conversion factor
export const MM_PER_M = 1000;

// Inches to meters conversion factor
export const IN_PER_M = 39.37007874015748;

// Pixels per unit conversions for SVG parsing
export const PX_PER_IN = 96;
export const PX_PER_CM = PX_PER_IN / 2.54;
export const PX_PER_MM = PX_PER_CM / 10;
export const PX_PER_PT = PX_PER_IN / 72;
export const PX_PER_PC = PX_PER_PT * 12;

// =============================================================================
// RENDERING & GRAPHICS CONSTANTS
// =============================================================================

// Default raster resolution for image processing
export const DEFAULT_RASTER_RESOLUTION = 2048;

// Fallback image size when rasterization fails
export const DEFAULT_IMAGE_FALLBACK_PX = DEFAULT_RASTER_RESOLUTION;

// Small margin to prevent pixel alignment issues
export const HALF_PIXEL_MARGIN_PX = 0.5;

// Shadow map resolution for lighting calculations
export const DEFAULT_SHADOW_MAP_SIZE = 2048;

// Base resolution for procedural textures
export const BASE_RESOLUTION_PX = 4096;

// Minimum line spacing to prevent aliasing artifacts
export const MIN_LINE_SPACING_PX = 0.25;

// Maximum grid lines to prevent performance degradation
export const MAX_GRID_LINES = 4000;

// Minimum margin for rulers to prevent edge clipping
export const MIN_MARGIN_METERS = 0.001;

// Z-offset to prevent z-fighting between overlays
export const DEFAULT_RULER_OFFSET_Z = 0.00075;

// Floating point comparison epsilon
export const EPSILON = 1e-6;

// =============================================================================
// NOISE GENERATION CONSTANTS
// =============================================================================

// Default number of octaves for noise generation
export const DEFAULT_NOISE_OCTAVES = 4;

// Available noise algorithm types
export const NoiseTypes = {
  OpenSimplex2: 0,
  OpenSimplex2S: 1,
  Cellular: 2,
  Perlin: 3,
  "Value Cubic": 4,
  Value: 5,
};

// Fractal noise combination methods
export const FractalTypes = {
  None: 0,
  FBM: 1,
  Ridged: 2,
  PingPong: 3,
};

// Domain warp noise types
export const WarpTypes = {
  OpenSimplex2: 0,
  "OpenSimplex2 Reduced": 1,
  BasicGrid: 2,
};

// Domain warp fractal combination methods
export const WarpFractalTypes = {
  Progressive: 4,
  Independent: 5,
};

// UI option arrays derived from noise type objects
export const NOISE_TYPE_OPTIONS = Object.keys(NoiseTypes);
export const FRACTAL_TYPE_OPTIONS = Object.keys(FractalTypes);
export const WARP_TYPE_OPTIONS = Object.keys(WarpTypes);
export const WARP_FRACTAL_TYPE_OPTIONS = Object.keys(WarpFractalTypes);

// =============================================================================
// PAPER SIZE PRESETS
// =============================================================================

// Standard paper sizes in meters (width x height)
export const PAPER_PRESETS = {
  Letter: { widthM: 0.2159, heightM: 0.2794 },
  Legal: { widthM: 0.2159, heightM: 0.3556 },
  Tabloid: { widthM: 0.2794, heightM: 0.4318 },
  Executive: { widthM: 0.18415, heightM: 0.2667 },
  A0: { widthM: 0.841, heightM: 1.189 },
  A1: { widthM: 0.594, heightM: 0.841 },
  A2: { widthM: 0.42, heightM: 0.594 },
  A3: { widthM: 0.297, heightM: 0.42 },
  A4: { widthM: 0.21, heightM: 0.297 },
  A5: { widthM: 0.148, heightM: 0.21 },
  A6: { widthM: 0.105, heightM: 0.148 },
  B4: { widthM: 0.25, heightM: 0.353 },
  B5: { widthM: 0.176, heightM: 0.25 },
  B6: { widthM: 0.125, heightM: 0.176 },
  "Square 25 cm": { widthM: 0.25, heightM: 0.25 },
  "Postcard 4x6 in": { widthM: 0.1016, heightM: 0.1524 },
  "Postcard 5x7 in": { widthM: 0.127, heightM: 0.1778 },
  "Square 8 in": { widthM: 0.2032, heightM: 0.2032 },
  "Square 10 in": { widthM: 0.254, heightM: 0.254 },
  "Square 12 in": { widthM: 0.3048, heightM: 0.3048 },
};

// UI options derived from paper presets
export const PAPER_PRESET_NAMES = Object.keys(PAPER_PRESETS);

// Default paper size selection
export const DEFAULT_PAPER_PRESET = "Letter";

// Default paper dimensions
export const DEFAULT_PAPER_SIZE = PAPER_PRESETS[DEFAULT_PAPER_PRESET];

// =============================================================================
// CONTROL DEFAULT VALUES
// =============================================================================

// Fiber texture generation defaults
export const DEFAULT_FIBER_SEED_OFFSET = 101;
export const DEFAULT_FIBER_TILING_X = 800;
export const DEFAULT_FIBER_TILING_Y = 10;

// Grid overlay defaults
export const DEFAULT_GRID_SPACING_MM = 10;
export const DEFAULT_GRID_SPACING_IN = 0.25;
export const DEFAULT_GRID_LINE_COLOR = "#1f5aff";
export const DEFAULT_GRID_LINE_OPACITY = 0.35;
export const DEFAULT_GRID_LINE_THICKNESS_PX = 1.0;

// Lighting system defaults
export const DEFAULT_AMBIENT_INTENSITY = 0.45;
export const DEFAULT_DIR_INTENSITY = 1.2;
export const DEFAULT_DIR_X = 0.7;
export const DEFAULT_DIR_Y = 1.5;
export const DEFAULT_DIR_Z = 1.0;

// Available environment presets for lighting
export const ENV_PRESETS = ["studio", "city", "sunset", "dawn", "night", "forest", "apartment", "lobby"];

// Material appearance defaults
export const DEFAULT_PAPER_COLOR = "#f6f2e8";
export const DEFAULT_STROKE_COLOR = "#111111";
export const DEFAULT_GRAIN_INTENSITY = 0.085;
export const DEFAULT_FIBER_INTENSITY = 0.07;

// Ruler overlay defaults
export const DEFAULT_RULER_MARGIN_MM = 20;
export const DEFAULT_RULER_MARGIN_IN = 0.75;
export const DEFAULT_RULER_COLOR = "#111111";
export const DEFAULT_RULER_THICKNESS_PX = 1.5;
export const DEFAULT_RULER_OPACITY = 0.9;

// SVG processing defaults
export const DEFAULT_SVG_SCALE_PERCENT = 100;
export const DEFAULT_SVG_SCALE = 0.9;
export const DEFAULT_SVG_PADDING_PX = 32;

// Noise parameter defaults
export const DEFAULT_NOISE_SEED = 1337;
export const DEFAULT_NOISE_FREQUENCY = 1.0;
export const DEFAULT_NOISE_GAIN = 0.5;
export const DEFAULT_NOISE_LACUNARITY = 2.0;
export const DEFAULT_NOISE_WEIGHTED_STRENGTH = 0.0;
export const DEFAULT_NOISE_PINGPONG_STRENGTH = 2.0;
export const DEFAULT_NOISE_TILING_X = 350;
export const DEFAULT_NOISE_TILING_Y = 350;
export const DEFAULT_WARP_AMP = 10.0;
export const DEFAULT_WARP_FREQUENCY = 2.0;

// =============================================================================
// UI OPTION SETS
// =============================================================================

// Corner position options used across multiple controls
export const CORNER_OPTIONS = {
  "Top Left": "Top Left",
  "Top Right": "Top Right",
  "Bottom Left": "Bottom Left",
  "Bottom Right": "Bottom Right",
};

// Unit system options
export const UNIT_OPTIONS = {
  Millimeters: "mm",
  Inches: "in"
};

// SVG rotation angle options
export const SVG_ROTATION_OPTIONS = {
  "0°": 0,
  "90°": 90,
  "180°": 180,
  "-90°": -90
};

// SVG processing mode options
export const SVG_MODE_OPTIONS = ["Direct Raster", "Flatten & Stroke"];

// Ruler spacing options for millimeters
export const RULER_SPACING_MM_OPTIONS = {
  major: { None: 0, "100 mm": 100, "50 mm": 50, "25 mm": 25, "10 mm": 10 },
  minor: { None: 0, "50 mm": 50, "25 mm": 25, "10 mm": 10, "5 mm": 5 },
  micro: { None: 0, "10 mm": 10, "5 mm": 5, "2 mm": 2, "1 mm": 1 }
};

// Ruler spacing options for inches
export const RULER_SPACING_IN_OPTIONS = {
  major: { None: 0, '1"': 1, '1/2"': 0.5, '1/4"': 0.25 },
  minor: { None: 0, '1/2"': 0.5, '1/4"': 0.25, '1/8"': 0.125 },
  micro: { None: 0, '1/4"': 0.25, '1/8"': 0.125, '1/16"': 0.0625, '1/32"': 0.03125 }
};

// =============================================================================
// FORMATTING PRECISION THRESHOLDS
// =============================================================================

// Millimeter formatting precision thresholds
export const MM_HIGH_PRECISION_THRESHOLD = 10;
export const MM_MEDIUM_PRECISION_THRESHOLD = 100;

// Inch formatting precision thresholds
export const IN_HIGH_PRECISION_THRESHOLD = 1;
export const IN_MEDIUM_PRECISION_THRESHOLD = 10;

// =============================================================================
// CACHE & PERFORMANCE LIMITS
// =============================================================================

// Maximum number of cached flatten operations to prevent memory bloat
export const FLATTEN_CACHE_LIMIT = 8;

// =============================================================================
// RULER LEVEL WEIGHTS
// =============================================================================

// Hierarchical weights for ruler tick mark levels
export const LEVEL_WEIGHTS = {
  micro: 0,
  minor: 1,
  major: 2,
  boundary: 3
};