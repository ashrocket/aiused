import qrcode from '../vendor/qrcode.mjs';
import { decodeVersioned, disclosurePath } from '../public/codec.mjs';

/** Create a vector QR for a canonical, case-sensitive versioned disclosure path. */
export function createQr(path, { mm = 12, ecc = 'M' } = {}) {
  if (typeof path !== 'string') throw new TypeError('The disclosure path must be a string.');
  const parts = /^\/([0-9A-Za-z_-]{1,4})\/([0-9A-Za-z_-]{1,17})$/.exec(path);
  if (!parts || parts[0] !== path) throw new RangeError('The disclosure path contains invalid characters.');
  const ids = decodeVersioned(parts[1], parts[2]);
  if (disclosurePath(ids, parts[1]) !== path) throw new RangeError('Use the canonical disclosure path.');
  if (ecc !== 'L' && ecc !== 'M') throw new RangeError('QR error correction must be L or M.');
  if (typeof mm !== 'number' || !Number.isFinite(mm) || mm < 8 || mm > 40) {
    throw new RangeError('QR size must be a finite number from 8 to 40 mm.');
  }

  const url = `https://aiused.org${path}`;
  const qr = qrcode(0, ecc);
  qr.addData(url, 'Byte');
  qr.make();
  const moduleCount = qr.getModuleCount();
  const totalModules = moduleCount + 8;
  const modules = [];
  for (let row = 0; row < moduleCount; row++) {
    for (let col = 0; col < moduleCount; col++) {
      if (qr.isDark(row, col)) modules.push(`M${col + 4} ${row + 4}h1v1h-1z`);
    }
  }

  // decodeVersioned restricts path to ASCII letters, digits, hyphen, underscore and separators;
  // mm is a finite number. Neither can inject markup into this fixed template.
  const title = `AI-use disclosure: ${url}`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${mm}mm" height="${mm}mm" viewBox="0 0 ${totalModules} ${totalModules}" role="img" aria-label="${title}" shape-rendering="crispEdges"><title>${title}</title><rect width="${totalModules}" height="${totalModules}" fill="#fff"/><path d="${modules.join('')}" fill="#000"/></svg>`;
  return {
    svg,
    url,
    moduleCount,
    totalModules,
    version: (moduleCount - 17) / 4,
    errorCorrection: ecc,
    mm,
    // Guidance at 0.254 mm/module, including the quiet zone; no scan guarantee.
    minimumPrintMm: Math.ceil(totalModules * 0.254 * 10) / 10,
  };
}
