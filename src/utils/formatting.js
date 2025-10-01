import {
  MM_HIGH_PRECISION_THRESHOLD,
  MM_MEDIUM_PRECISION_THRESHOLD,
  IN_HIGH_PRECISION_THRESHOLD,
  IN_MEDIUM_PRECISION_THRESHOLD,
} from '../constants.js';

export function formatMillimeters(mm) {
  if (!Number.isFinite(mm)) return "—";
  const abs = Math.abs(mm);
  if (abs >= MM_MEDIUM_PRECISION_THRESHOLD) return mm.toFixed(0);
  if (abs >= MM_HIGH_PRECISION_THRESHOLD) return mm.toFixed(1);
  return mm.toFixed(2);
}

export function formatInches(inches) {
  if (!Number.isFinite(inches)) return "—";
  const abs = Math.abs(inches);
  if (abs >= IN_MEDIUM_PRECISION_THRESHOLD) return inches.toFixed(2);
  if (abs >= IN_HIGH_PRECISION_THRESHOLD) return inches.toFixed(3);
  return inches.toFixed(4);
}
