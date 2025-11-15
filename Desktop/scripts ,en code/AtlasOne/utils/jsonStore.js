// Utility for safe JSON read/write with auto-file creation.
import { promises as fs } from 'fs';
import path from 'path';

const base = path.resolve('data');

async function ensureFile(file, defaultData) {
  const full = path.join(base, file);
  try {
    await fs.access(full);
  } catch {
    await fs.writeFile(full, JSON.stringify(defaultData, null, 2));
  }
}

export async function readJSON(file, defaultData = {}) {
  await ensureFile(file, defaultData);
  const full = path.join(base, file);
  try {
    const raw = await fs.readFile(full, 'utf8');
    return JSON.parse(raw || 'null') ?? defaultData;
  } catch (e) {
    console.error('Failed to read JSON', file, e);
    return structuredClone(defaultData);
  }
}

export async function writeJSON(file, data) {
  const full = path.join(base, file);
  try {
    await fs.writeFile(full, JSON.stringify(data, null, 2));
    return true;
  } catch (e) {
    console.error('Failed to write JSON', file, e);
    return false;
  }
}

export async function updateJSON(file, updater, defaultData = {}) {
  const current = await readJSON(file, defaultData);
  const updated = await updater(current);
  await writeJSON(file, updated);
  return updated;
}
