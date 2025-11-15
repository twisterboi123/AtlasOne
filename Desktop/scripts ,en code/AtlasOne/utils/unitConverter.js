// Basic unit conversions for length, time, temperature.
const lengthRates = { m:1, km:1000, cm:0.01, mm:0.001, mi:1609.34, ft:0.3048, in:0.0254 };
const timeRates = { s:1, m:60, h:3600, d:86400 };

function convertLength(value, from, to){
  if(!(from in lengthRates) || !(to in lengthRates)) return null;
  const meters = value * lengthRates[from];
  return meters / lengthRates[to];
}
function convertTime(value, from, to){
  if(!(from in timeRates) || !(to in timeRates)) return null;
  const seconds = value * timeRates[from];
  return seconds / timeRates[to];
}
function convertTemp(value, from, to){
  from = from.toLowerCase();
  to = to.toLowerCase();
  let c;
  if(from === 'c') c = value;
  else if(from === 'f') c = (value - 32) * 5/9;
  else if(from === 'k') c = value - 273.15;
  else return null;
  let out;
  if(to === 'c') out = c;
  else if(to === 'f') out = c * 9/5 + 32;
  else if(to === 'k') out = c + 273.15;
  else return null;
  return out;
}

export function convertUnits(value, from, to){
  if(!Number.isFinite(value)) return { error: 'Value must be a number'};
  if(!from || !to) return { error: 'From/to required'};
  if(['c','f','k'].includes(from.toLowerCase()) || ['c','f','k'].includes(to.toLowerCase())){
    const res = convertTemp(value, from, to);
    return res == null ? { error: 'Unsupported temperature unit'} : { result: res };
  }
  if(from in lengthRates && to in lengthRates){
    const res = convertLength(value, from, to);
    return res == null ? { error: 'Unsupported length unit'} : { result: res };
  }
  if(from in timeRates && to in timeRates){
    const res = convertTime(value, from, to);
    return res == null ? { error: 'Unsupported time unit'} : { result: res };
  }
  return { error: 'Unsupported units'};
}
