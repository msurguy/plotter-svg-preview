// src/utils/svgo/worker.js
import { optimize } from 'svgo/browser';
import { buildSvgoConfig } from './explicit-config.js';

self.onmessage = (e) => {
  const { type, svg, inputConfig, outputConfig } = e.data || {};
  if (type === 'ping') return self.postMessage({ type: 'pong' });

  if (type === 'preprocessThenExport') {
    const c1 = buildSvgoConfig(svg, inputConfig);
    const r1 = optimize(svg, c1);
    const c2 = buildSvgoConfig(r1.data, outputConfig || inputConfig);
    const r2 = optimize(r1.data, c2);
    self.postMessage({
      type: 'done',
      input: {
        svg: r1.data,
        bytesIn: new Blob([svg]).size,
        bytesOut: new Blob([r1.data]).size
      },
      output: {
        svg: r2.data,
        bytesIn: new Blob([r1.data]).size,
        bytesOut: new Blob([r2.data]).size
      }
    });
  }
};
