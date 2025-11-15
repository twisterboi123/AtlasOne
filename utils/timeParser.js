// Parses human time strings like 10m, 2h, 1d, 1h30m, 2h15m10s.
export function parseDuration(str) {
  if (!str) return null;
  const pattern = /((\d+)d)?((\d+)h)?((\d+)m)?((\d+)s)?/i;
  const match = str.match(pattern);
  if (!match) return null;
  const days = parseInt(match[2] || '0', 10);
  const hours = parseInt(match[4] || '0', 10);
  const mins = parseInt(match[6] || '0', 10);
  const secs = parseInt(match[8] || '0', 10);
  const ms = (((days * 24 + hours) * 60 + mins) * 60 + secs) * 1000;
  return ms > 0 ? ms : null;
}

export function formatDuration(ms) {
  const s = Math.floor(ms / 1000);
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const parts = [];
  if (d) parts.push(`${d}d`);
  if (h) parts.push(`${h}h`);
  if (m) parts.push(`${m}m`);
  if (sec) parts.push(`${sec}s`);
  return parts.join(' ') || '0s';
}
