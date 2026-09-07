import crypto from 'node:crypto';
import path from 'node:path';

export function sha256(text) {
  return crypto.createHash('sha256').update(text || '', 'utf8').digest('hex');
}

export function wordCount(text) {
  const trimmed = (text || '').trim();
  return trimmed ? trimmed.split(/\s+/).length : 0;
}

// Text files are read exactly. PDF and Word files use a light printable-text fallback so no
// document parser is trusted with unbounded input; users can paste text if extraction is poor.
export function extractText(buffer, filename = '') {
  if (!buffer?.length) return '';
  if (path.extname(filename).toLowerCase() === '.txt') return buffer.toString('utf8').trim();
  const printable = buffer.toString('latin1').replace(/[^\x09\x0a\x0d\x20-\x7e]+/g, ' ').replace(/\s{2,}/g, ' ').trim();
  return (printable.match(/[a-zA-Z]/g) || []).length >= 30 ? printable : '';
}
