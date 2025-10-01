import { FLATTEN_CACHE_LIMIT } from '../constants.js';
const flattenCache = new Map();
const flattenPending = new Map();

export function getFlattenCache(key) {
  return flattenCache.get(key);
}

export function setFlattenCache(key, value) {
  if (flattenCache.has(key)) {
    flattenCache.delete(key);
  } else if (flattenCache.size >= FLATTEN_CACHE_LIMIT) {
    const oldestKey = flattenCache.keys().next().value;
    if (oldestKey !== undefined) {
      flattenCache.delete(oldestKey);
    }
  }
  flattenCache.set(key, value);
}

export function getPendingFlattenComputation(key) {
  return flattenPending.get(key);
}

export function setPendingFlattenComputation(key, promise) {
  flattenPending.set(key, promise);
}

export function clearPendingFlattenComputation(key) {
  flattenPending.delete(key);
}

export function clearFlattenCaches() {
  flattenCache.clear();
  flattenPending.clear();
}
