import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { config } from '../config/index.js';

const root = path.resolve(config.storage.uploadDir || path.join(process.cwd(), '.runtime', 'uploads'));
const documentDir = path.join(root, 'documents');

async function ensureDocumentDir() {
  await fs.mkdir(documentDir, { recursive: true });
}

export async function storePrivateDocument(buffer, originalName) {
  await ensureDocumentDir();
  const ext = path.extname(originalName || '').toLowerCase();
  const filename = `${crypto.randomUUID()}${ext}`;
  const storedPath = path.join(documentDir, filename);
  await fs.writeFile(storedPath, buffer, { flag: 'wx' });
  return { path: storedPath, filename: path.basename(originalName || 'cv') };
}

export async function removePrivateDocument(storedPath) {
  if (!storedPath || !path.resolve(storedPath).startsWith(`${documentDir}${path.sep}`)) return;
  await fs.rm(storedPath, { force: true });
}
