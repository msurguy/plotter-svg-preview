// src/utils/svog/utils.js
export function splitIntoTopLevelGroups(svgText) {
  const doc = new DOMParser().parseFromString(svgText, 'image/svg+xml');
  const svg = doc.documentElement;
  const viewBox = svg.getAttribute('viewBox') || '';
  const width = svg.getAttribute('width');
  const height = svg.getAttribute('height');
  const groups = Array.from(svg.children).filter(n => n.nodeName.toLowerCase() === 'g');
  if (!groups.length) return [svgText];
  const ser = new XMLSerializer();
  return groups.map((g) => {
    const mini = svg.cloneNode(false);
    if (viewBox) mini.setAttribute('viewBox', viewBox);
    if (width) mini.setAttribute('width', width);
    if (height) mini.setAttribute('height', height);
    mini.appendChild(g.cloneNode(true));
    return ser.serializeToString(mini);
  });
}
export function getAtPath(obj, path) {
  return path.split('.').reduce((o,k)=> (o ? o[k] : undefined), obj);
}
export function setAtPath(obj, path, value) {
  const parts = path.split('.');
  const last = parts.pop();
  let cur = obj;
  for (const k of parts) {
    if (typeof cur[k] !== 'object' || cur[k] === null) cur[k] = {};
    cur = cur[k];
  }
  cur[last] = value;
  return obj;
}
