let optimizeWorker = null;
let optimizeWorkerReqId = 0;
const OPTIMIZE_PENDING = new Map();

function ensureOptimizeWorker() {
  if (typeof window === "undefined" || typeof Worker === "undefined") {
    console.info("[optimizeWorker] Worker unavailable (SSR or no Worker support)");
    return null;
  }
  if (!optimizeWorker) {
    try {
      optimizeWorker = new Worker(new URL("../../workers/svgOptimizeWorker.js", import.meta.url), {
        type: "module",
      });
      console.info("[optimizeWorker] Worker started");
      optimizeWorker.onmessage = (event) => {
        const { id, ok, svg, error } = event.data || {};
        const resolver = OPTIMIZE_PENDING.get(id);
        if (!resolver) {
          return;
        }
        if (resolver.timeoutId) {
          clearTimeout(resolver.timeoutId);
        }
        OPTIMIZE_PENDING.delete(id);
        const durationMs = performance.now() - (resolver.startedAt || performance.now());
        if (ok) {
          console.info("[optimizeWorker] Completed", { id, durationMs });
          resolver.resolve(svg);
        } else {
          console.warn("[optimizeWorker] Reported error", { id, durationMs, error });
          resolver.reject(new Error(error || "Optimization failed"));
        }
      };
      optimizeWorker.onerror = (err) => {
        const error = err?.message || "Optimization worker error";
        console.error("[optimizeWorker] onerror", error);
        for (const [, resolver] of OPTIMIZE_PENDING.entries()) {
          if (resolver.timeoutId) {
            clearTimeout(resolver.timeoutId);
          }
          resolver.reject(new Error(error));
        }
        OPTIMIZE_PENDING.clear();
        optimizeWorker.terminate();
        optimizeWorker = null;
      };
    } catch (err) {
      console.error("Failed to start SVG optimization worker", err);
      optimizeWorker = null;
    }
  }
  return optimizeWorker;
}

export function runOptimizeWorker(svgText, { timeoutMs = 10000 } = {}) {
  const worker = ensureOptimizeWorker();
  if (!worker) {
    console.info("[optimizeWorker] Falling back to main-thread optimization");
    return Promise.resolve(null);
  }
  optimizeWorkerReqId += 1;
  const id = optimizeWorkerReqId;
  const promise = new Promise((resolve, reject) => {
    console.info("[optimizeWorker] Queue request", { id });
    const pendingEntry = { resolve, reject, startedAt: performance.now(), timeoutId: null };
    if (timeoutMs > 0 && Number.isFinite(timeoutMs)) {
      pendingEntry.timeoutId = setTimeout(() => {
        if (!OPTIMIZE_PENDING.has(id)) {
          return;
        }
        OPTIMIZE_PENDING.delete(id);
        console.warn("[optimizeWorker] Timed out", { id, timeoutMs });
        reject(new Error("SVG optimization worker timed out"));
      }, timeoutMs);
    }
    OPTIMIZE_PENDING.set(id, pendingEntry);
    worker.postMessage({ id, svgText });
  });
  return promise;
}
