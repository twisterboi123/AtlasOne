// Simple daily rotating logger writing to /logs/YYYY-MM-DD.log
import { promises as fs } from 'fs';
import path from 'path';

const logsDir = path.resolve('logs');

async function ensureDir() {
  try { await fs.access(logsDir); } catch { await fs.mkdir(logsDir, { recursive: true }); }
}

function todayFile() {
  const d = new Date();
  const name = d.toISOString().slice(0,10) + '.log';
  return path.join(logsDir, name);
}

export async function log(action, details = {}) {
  await ensureDir();
  const entry = {
    timestamp: new Date().toISOString(),
    action,
    ...details
  };
  const line = JSON.stringify(entry);
  await fs.appendFile(todayFile(), line + '\n');
}
