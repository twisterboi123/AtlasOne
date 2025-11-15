// Color utilities for hex parsing.
export function parseHex(hex){
  if(!hex) return null;
  hex = hex.trim().replace(/^#/,'');
  if(!/^([0-9a-fA-F]{6})$/.test(hex)) return null;
  const r = parseInt(hex.slice(0,2),16);
  const g = parseInt(hex.slice(2,4),16);
  const b = parseInt(hex.slice(4,6),16);
  return { r,g,b, decimal: (r<<16) + (g<<8) + b };
}
