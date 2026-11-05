import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// SVG source for standard icon
const svgIcon = `
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1e293b"/>
      <stop offset="100%" stop-color="#0f172a"/>
    </linearGradient>
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fbbf24"/>
      <stop offset="100%" stop-color="#f59e0b"/>
    </linearGradient>
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#000000" flood-opacity="0.4"/>
    </filter>
  </defs>

  <!-- Background -->
  <rect width="512" height="512" rx="104" fill="url(#bgGrad)"/>
  <rect x="8" y="8" width="496" height="496" rx="96" fill="none" stroke="#334155" stroke-width="6" opacity="0.6"/>

  <!-- Inner Clipboard Shape -->
  <g filter="url(#shadow)">
    <!-- Main Board -->
    <rect x="116" y="100" width="280" height="340" rx="28" fill="#1e293b" stroke="#f59e0b" stroke-width="8"/>
    
    <!-- Clip Top -->
    <rect x="196" y="70" width="120" height="48" rx="14" fill="url(#goldGrad)"/>
    <circle cx="256" cy="94" r="10" fill="#0f172a"/>

    <!-- Checklist Lines -->
    <line x1="166" y1="180" x2="260" y2="180" stroke="#94a3b8" stroke-width="12" stroke-linecap="round"/>
    <line x1="166" y1="230" x2="310" y2="230" stroke="#94a3b8" stroke-width="12" stroke-linecap="round"/>
    <line x1="166" y1="280" x2="240" y2="280" stroke="#94a3b8" stroke-width="12" stroke-linecap="round"/>

    <!-- Prominent Checkmark in Emerald/Gold -->
    <circle cx="330" cy="330" r="56" fill="#10b981"/>
    <path d="M308 330 L324 346 L356 312" fill="none" stroke="#ffffff" stroke-width="14" stroke-linecap="round" stroke-linejoin="round"/>
  </g>
</svg>
`;

// Maskable SVG with safe margin (15% padding on all sides)
const svgMaskable = `
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1e293b"/>
      <stop offset="100%" stop-color="#0f172a"/>
    </linearGradient>
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fbbf24"/>
      <stop offset="100%" stop-color="#f59e0b"/>
    </linearGradient>
  </defs>

  <!-- Full Bleed Background -->
  <rect width="512" height="512" fill="url(#bgGrad)"/>

  <!-- Centered Safe-zone content (scaled down inside 80% circle) -->
  <g transform="translate(51, 51) scale(0.8)">
    <rect x="116" y="100" width="280" height="340" rx="28" fill="#1e293b" stroke="#f59e0b" stroke-width="10"/>
    <rect x="196" y="70" width="120" height="48" rx="14" fill="url(#goldGrad)"/>
    <circle cx="256" cy="94" r="10" fill="#0f172a"/>

    <line x1="166" y1="180" x2="260" y2="180" stroke="#94a3b8" stroke-width="14" stroke-linecap="round"/>
    <line x1="166" y1="230" x2="310" y2="230" stroke="#94a3b8" stroke-width="14" stroke-linecap="round"/>
    <line x1="166" y1="280" x2="240" y2="280" stroke="#94a3b8" stroke-width="14" stroke-linecap="round"/>

    <circle cx="330" cy="330" r="56" fill="#10b981"/>
    <path d="M308 330 L324 346 L356 312" fill="none" stroke="#ffffff" stroke-width="14" stroke-linecap="round" stroke-linejoin="round"/>
  </g>
</svg>
`;

async function generate() {
  const svgBuf = Buffer.from(svgIcon);
  const maskableBuf = Buffer.from(svgMaskable);

  fs.writeFileSync(path.join(publicDir, 'icon.svg'), svgIcon.trim());

  await sharp(svgBuf).resize(192, 192).png().toFile(path.join(publicDir, 'pwa-192x192.png'));
  await sharp(svgBuf).resize(512, 512).png().toFile(path.join(publicDir, 'pwa-512x512.png'));
  await sharp(maskableBuf).resize(512, 512).png().toFile(path.join(publicDir, 'pwa-maskable-512x512.png'));
  await sharp(svgBuf).resize(180, 180).png().toFile(path.join(publicDir, 'apple-touch-icon.png'));
  await sharp(svgBuf).resize(64, 64).png().toFile(path.join(publicDir, 'favicon.ico'));

  console.log('Icons generated successfully!');
}

generate().catch(console.error);
