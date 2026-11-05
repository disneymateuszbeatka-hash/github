import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const publicDir = path.resolve('public');
const screenshotsDir = path.resolve('public/screenshots');
const wellKnownDir = path.resolve('public/.well-known');

[publicDir, screenshotsDir, wellKnownDir].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// SVG standard icon
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

  <rect width="512" height="512" rx="104" fill="url(#bgGrad)"/>
  <rect x="8" y="8" width="496" height="496" rx="96" fill="none" stroke="#334155" stroke-width="6" opacity="0.6"/>

  <g filter="url(#shadow)">
    <rect x="116" y="100" width="280" height="340" rx="28" fill="#1e293b" stroke="#f59e0b" stroke-width="8"/>
    <rect x="196" y="70" width="120" height="48" rx="14" fill="url(#goldGrad)"/>
    <circle cx="256" cy="94" r="10" fill="#0f172a"/>
    <line x1="166" y1="180" x2="260" y2="180" stroke="#94a3b8" stroke-width="12" stroke-linecap="round"/>
    <line x1="166" y1="230" x2="310" y2="230" stroke="#94a3b8" stroke-width="12" stroke-linecap="round"/>
    <line x1="166" y1="280" x2="240" y2="280" stroke="#94a3b8" stroke-width="12" stroke-linecap="round"/>
    <circle cx="330" cy="330" r="56" fill="#10b981"/>
    <path d="M308 330 L324 346 L356 312" fill="none" stroke="#ffffff" stroke-width="14" stroke-linecap="round" stroke-linejoin="round"/>
  </g>
</svg>
`;

// Maskable SVG with safe margin (15% padding)
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

  <rect width="512" height="512" fill="url(#bgGrad)"/>

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

// Desktop Screenshot SVG (1280x720)
const svgDesktopScreenshot = `
<svg width="1280" height="720" viewBox="0 0 1280 720" xmlns="http://www.w3.org/2000/svg" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif">
  <!-- Window Background -->
  <rect width="1280" height="720" fill="#090d16"/>

  <!-- Top App Navigation Bar -->
  <rect width="1280" height="64" fill="#0f172a" stroke="#1e293b" stroke-width="1"/>
  <rect x="32" y="14" width="36" height="36" rx="8" fill="#f59e0b" fill-opacity="0.15" stroke="#f59e0b" stroke-opacity="0.4"/>
  <text x="80" y="38" fill="#f8fafc" font-size="16" font-weight="bold">Raport Odbioru Lokalu</text>
  <rect x="250" y="24" width="86" height="20" rx="4" fill="#f59e0b" fill-opacity="0.2"/>
  <text x="258" y="38" fill="#fbbf24" font-size="11" font-weight="600">PWA &amp; APK</text>
  <text x="80" y="52" fill="#94a3b8" font-size="11">Al. Jerozolimskie 142/35, Warszawa • Jan Kowalski</text>

  <!-- Metric Badges in Top Bar -->
  <rect x="880" y="16" width="160" height="32" rx="16" fill="#1e293b" stroke="#334155"/>
  <circle cx="904" cy="32" r="6" fill="#10b981"/>
  <text x="918" y="36" fill="#10b981" font-size="12" font-weight="bold">18 OK</text>
  <text x="964" y="36" fill="#64748b" font-size="12">|</text>
  <circle cx="984" cy="32" r="6" fill="#f59e0b"/>
  <text x="998" y="36" fill="#f59e0b" font-size="12" font-weight="bold">3 Usterki</text>

  <!-- Export Button in Top Bar -->
  <rect x="1060" y="14" width="188" height="36" rx="8" fill="#f59e0b"/>
  <text x="1092" y="38" fill="#0f172a" font-size="13" font-weight="bold">📄 Eksportuj PDF &amp; E-mail</text>

  <!-- Main Content Layout -->
  <!-- Categories Filter Bar -->
  <rect x="180" y="84" width="920" height="42" rx="10" fill="#0f172a" stroke="#1e293b"/>
  <rect x="186" y="89" width="130" height="32" rx="8" fill="#f59e0b"/>
  <text x="210" y="110" fill="#0f172a" font-size="12" font-weight="bold">Wszystkie (21)</text>

  <rect x="326" y="89" width="140" height="32" rx="8" fill="#1e293b"/>
  <text x="345" y="110" fill="#cbd5e1" font-size="12" font-weight="500">Części wspólne</text>

  <rect x="476" y="89" width="110" height="32" rx="8" fill="#1e293b"/>
  <text x="502" y="110" fill="#cbd5e1" font-size="12" font-weight="500">Balkon</text>

  <rect x="596" y="89" width="150" height="32" rx="8" fill="#1e293b"/>
  <text x="612" y="110" fill="#cbd5e1" font-size="12" font-weight="500">Miejsce postojowe</text>

  <!-- Card 1: Okna i drzwi balkonowe -->
  <rect x="180" y="146" width="920" height="110" rx="12" fill="#0f172a" stroke="#1e293b"/>
  <rect x="180" y="146" width="4" height="110" rx="2" fill="#f59e0b"/>
  <text x="204" y="174" fill="#f8fafc" font-size="15" font-weight="bold">1. Stolarka okienna i parapety</text>
  <rect x="204" y="188" width="60" height="20" rx="4" fill="#ef4444" fill-opacity="0.2"/>
  <text x="212" y="202" fill="#f87171" font-size="10" font-weight="bold">USTERKA</text>
  <text x="274" y="202" fill="#94a3b8" font-size="12">Rysa na szybie wewnętrznej pakietu 3-szybowego w salonie (dł. ok. 4 cm)</text>
  <rect x="204" y="218" width="150" height="26" rx="6" fill="#1e293b" stroke="#334155"/>
  <text x="216" y="235" fill="#cbd5e1" font-size="11">🎙️ Głosowo uzupełnione</text>
  <rect x="364" y="218" width="120" height="26" rx="6" fill="#1e293b" stroke="#334155"/>
  <text x="376" y="235" fill="#cbd5e1" font-size="11">📷 1 zdjęcie załączone</text>

  <!-- Card 2: Tynki i ściany -->
  <rect x="180" y="272" width="920" height="96" rx="12" fill="#0f172a" stroke="#1e293b"/>
  <rect x="180" y="272" width="4" height="96" rx="2" fill="#10b981"/>
  <text x="204" y="300" fill="#f8fafc" font-size="15" font-weight="bold">2. Tynki ścienne i kąty proste</text>
  <rect x="204" y="314" width="70" height="20" rx="4" fill="#10b981" fill-opacity="0.2"/>
  <text x="212" y="328" fill="#34d399" font-size="10" font-weight="bold">BEZ UWAG</text>
  <text x="284" y="328" fill="#94a3b8" font-size="12">Piony i kąty zgodne z normą PN-B-10110:2005. Brak spękań i ubytków.</text>

  <!-- Card 3: Posadzki i wylewki -->
  <rect x="180" y="384" width="920" height="96" rx="12" fill="#0f172a" stroke="#1e293b"/>
  <rect x="180" y="384" width="4" height="96" rx="2" fill="#10b981"/>
  <text x="204" y="412" fill="#f8fafc" font-size="15" font-weight="bold">3. Wylewki i poziomy podłóg</text>
  <rect x="204" y="426" width="70" height="20" rx="4" fill="#10b981" fill-opacity="0.2"/>
  <text x="212" y="440" fill="#34d399" font-size="10" font-weight="bold">BEZ UWAG</text>
  <text x="284" y="440" fill="#94a3b8" font-size="12">Odchyłki poniżej 2 mm na łacie 2 m. Dylatacje obwodowe poprawne.</text>

  <!-- Card 4: Instalacja elektryczna -->
  <rect x="180" y="496" width="920" height="110" rx="12" fill="#0f172a" stroke="#1e293b"/>
  <rect x="180" y="496" width="4" height="110" rx="2" fill="#f59e0b"/>
  <text x="204" y="524" fill="#f8fafc" font-size="15" font-weight="bold">4. Tablica rozdzielcza i osprzęt elektryczny</text>
  <rect x="204" y="538" width="60" height="20" rx="4" fill="#ef4444" fill-opacity="0.2"/>
  <text x="212" y="552" fill="#f87171" font-size="10" font-weight="bold">USTERKA</text>
  <text x="274" y="552" fill="#94a3b8" font-size="12">Brak opisu obwodu nr 4 w skrzynce bezpiecznikowej</text>
  <rect x="204" y="568" width="130" height="26" rx="6" fill="#1e293b" stroke="#334155"/>
  <text x="216" y="585" fill="#cbd5e1" font-size="11">🎙️ Notatka audio</text>

  <!-- Bottom Floating Summary Bar -->
  <rect x="180" y="626" width="920" height="54" rx="12" fill="#1e293b" stroke="#334155"/>
  <text x="204" y="658" fill="#f8fafc" font-size="13" font-weight="bold">Stan protokołu: Gotowy do podpisu</text>
  <text x="560" y="658" fill="#94a3b8" font-size="12">Zgodny z Ustawą Deweloperską i normami budowlanymi</text>
  <rect x="910" y="636" width="176" height="34" rx="8" fill="#10b981"/>
  <text x="940" y="658" fill="#022c22" font-size="12" font-weight="bold">✓ Wyślij protokół PDF</text>
</svg>
`;

// Mobile Screenshot SVG (750x1334)
const svgMobileScreenshot = `
<svg width="750" height="1334" viewBox="0 0 750 1334" xmlns="http://www.w3.org/2000/svg" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif">
  <!-- Mobile Screen Background -->
  <rect width="750" height="1334" fill="#090d16"/>

  <!-- Mobile Status Bar -->
  <rect width="750" height="44" fill="#0f172a"/>
  <text x="44" y="30" fill="#ffffff" font-size="15" font-weight="600">09:41</text>
  <text x="640" y="30" fill="#ffffff" font-size="14" font-weight="600">5G  100%</text>

  <!-- Mobile App Header -->
  <rect y="44" width="750" height="96" fill="#0f172a" stroke="#1e293b" stroke-width="1"/>
  <rect x="32" y="68" width="48" height="48" rx="12" fill="#f59e0b" fill-opacity="0.15" stroke="#f59e0b" stroke-opacity="0.4"/>
  <text x="96" y="92" fill="#f8fafc" font-size="18" font-weight="bold">Raport Odbioru Lokalu</text>
  <text x="96" y="112" fill="#94a3b8" font-size="13">Mieszkanie 42 • Warszawa</text>
  <rect x="560" y="72" width="158" height="40" rx="8" fill="#f59e0b"/>
  <text x="584" y="97" fill="#0f172a" font-size="13" font-weight="bold">PDF &amp; E-mail</text>

  <!-- Quick Progress Bar -->
  <rect x="32" y="156" width="686" height="44" rx="10" fill="#0f172a" stroke="#1e293b"/>
  <text x="52" y="184" fill="#10b981" font-size="14" font-weight="bold">✓ 18 OK</text>
  <text x="144" y="184" fill="#64748b" font-size="14">|</text>
  <text x="164" y="184" fill="#f59e0b" font-size="14" font-weight="bold">⚠ 3 Usterki</text>
  <text x="274" y="184" fill="#64748b" font-size="14">|</text>
  <text x="294" y="184" fill="#38bdf8" font-size="14" font-weight="600">Postęp: 85%</text>

  <!-- Tabs Navigation -->
  <rect x="32" y="216" width="180" height="42" rx="10" fill="#f59e0b"/>
  <text x="64" y="242" fill="#0f172a" font-size="14" font-weight="bold">Wszystkie (21)</text>

  <rect x="224" y="216" width="180" height="42" rx="10" fill="#1e293b"/>
  <text x="246" y="242" fill="#cbd5e1" font-size="14" font-weight="500">Części wspólne</text>

  <rect x="416" y="216" width="140" height="42" rx="10" fill="#1e293b"/>
  <text x="454" y="242" fill="#cbd5e1" font-size="14" font-weight="500">Balkon</text>

  <!-- Mobile Card 1: Okna -->
  <rect x="32" y="280" width="686" height="230" rx="16" fill="#0f172a" stroke="#1e293b"/>
  <rect x="32" y="280" width="6" height="230" rx="3" fill="#f59e0b"/>
  <text x="56" y="318" fill="#f8fafc" font-size="17" font-weight="bold">1. Stolarka okienna i parapety</text>
  <rect x="56" y="334" width="76" height="24" rx="4" fill="#ef4444" fill-opacity="0.2"/>
  <text x="66" y="351" fill="#f87171" font-size="12" font-weight="bold">USTERKA</text>
  <text x="56" y="388" fill="#cbd5e1" font-size="14">Rysa na szybie wewnętrznej pakietu 3-szybowego w salonie (dł. ok. 4 cm).</text>

  <!-- Voice & Photo Action Buttons -->
  <rect x="56" y="430" width="230" height="48" rx="10" fill="#1e293b" stroke="#334155"/>
  <text x="80" y="460" fill="#f8fafc" font-size="14" font-weight="600">🎙️ Mów usterkę</text>

  <rect x="300" y="430" width="210" height="48" rx="10" fill="#1e293b" stroke="#334155"/>
  <text x="324" y="460" fill="#f8fafc" font-size="14" font-weight="600">📷 Dodaj zdjęcie</text>

  <rect x="524" y="430" width="170" height="48" rx="10" fill="#10b981" fill-opacity="0.2" stroke="#10b981" stroke-opacity="0.4"/>
  <text x="560" y="460" fill="#34d399" font-size="14" font-weight="bold">✓ OK</text>

  <!-- Mobile Card 2: Tynki -->
  <rect x="32" y="530" width="686" height="170" rx="16" fill="#0f172a" stroke="#1e293b"/>
  <rect x="32" y="530" width="6" height="170" rx="3" fill="#10b981"/>
  <text x="56" y="568" fill="#f8fafc" font-size="17" font-weight="bold">2. Tynki ścienne i kąty</text>
  <rect x="56" y="584" width="84" height="24" rx="4" fill="#10b981" fill-opacity="0.2"/>
  <text x="66" y="601" fill="#34d399" font-size="12" font-weight="bold">BEZ UWAG</text>
  <text x="56" y="638" fill="#94a3b8" font-size="14">Kąty proste w kuchni i łazience sprawdzone kątownikiem budowlanym.</text>
  <text x="56" y="670" fill="#64748b" font-size="12">Piony zachowane, brak pęknięć.</text>

  <!-- Mobile Card 3: Drzwi wejściowe -->
  <rect x="32" y="720" width="686" height="170" rx="16" fill="#0f172a" stroke="#1e293b"/>
  <rect x="32" y="720" width="6" height="170" rx="3" fill="#10b981"/>
  <text x="56" y="758" fill="#f8fafc" font-size="17" font-weight="bold">3. Drzwi wejściowe antywłamaniowe</text>
  <rect x="56" y="774" width="84" height="24" rx="4" fill="#10b981" fill-opacity="0.2"/>
  <text x="66" y="791" fill="#34d399" font-size="12" font-weight="bold">BEZ UWAG</text>
  <text x="56" y="828" fill="#94a3b8" font-size="14">Ościeżnica osadzona prawidłowo, zamki działają płynnie, komplet kluczy.</text>

  <!-- Mobile Card 4: Instalacja sanitarna -->
  <rect x="32" y="910" width="686" height="190" rx="16" fill="#0f172a" stroke="#1e293b"/>
  <rect x="32" y="910" width="6" height="190" rx="3" fill="#f59e0b"/>
  <text x="56" y="948" fill="#f8fafc" font-size="17" font-weight="bold">4. Podejścia wodno-kanalizacyjne</text>
  <rect x="56" y="964" width="76" height="24" rx="4" fill="#ef4444" fill-opacity="0.2"/>
  <text x="66" y="981" fill="#f87171" font-size="12" font-weight="bold">USTERKA</text>
  <text x="56" y="1018" fill="#cbd5e1" font-size="14">Brak korka zaślepiającego podejście pralki w łazience.</text>
  <rect x="56" y="1042" width="180" height="36" rx="8" fill="#1e293b"/>
  <text x="76" y="1066" fill="#fbbf24" font-size="13">📷 1 zdjęcie załączone</text>

  <!-- Sticky Bottom App Bar -->
  <rect y="1190" width="750" height="144" fill="#0f172a" stroke="#1e293b" stroke-width="1"/>
  <rect x="32" y="1210" width="686" height="60" rx="14" fill="#f59e0b"/>
  <text x="210" y="1248" fill="#0f172a" font-size="17" font-weight="bold">📄 Generuj Protokół PDF &amp; E-mail</text>
  <text x="260" y="1295" fill="#94a3b8" font-size="12">Gotowy do podpisu przez dewelopera</text>
</svg>
`;

async function run() {
  const svgBuf = Buffer.from(svgIcon);
  const maskableBuf = Buffer.from(svgMaskable);

  // Write base SVGs
  fs.writeFileSync(path.join(publicDir, 'icon.svg'), svgIcon.trim());

  // Generate complete set of standard PWA icons for PWABuilder
  const sizes = [96, 128, 192, 256, 384, 512];
  for (const size of sizes) {
    await sharp(svgBuf)
      .resize(size, size)
      .png()
      .toFile(path.join(publicDir, `pwa-${size}x${size}.png`));
    console.log(`Generated pwa-${size}x${size}.png`);
  }

  // Maskable icon 512x512
  await sharp(maskableBuf)
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, 'pwa-maskable-512x512.png'));
  console.log('Generated pwa-maskable-512x512.png');

  // Apple touch icon (180x180)
  await sharp(svgBuf)
    .resize(180, 180)
    .png()
    .toFile(path.join(publicDir, 'apple-touch-icon.png'));
  console.log('Generated apple-touch-icon.png');

  // Favicon (64x64 PNG converted/saved)
  await sharp(svgBuf)
    .resize(64, 64)
    .png()
    .toFile(path.join(publicDir, 'favicon.ico'));
  console.log('Generated favicon.ico');

  // Screenshots for PWABuilder (Wide desktop + Narrow mobile)
  await sharp(Buffer.from(svgDesktopScreenshot))
    .resize(1280, 720)
    .png()
    .toFile(path.join(screenshotsDir, 'desktop-1280x720.png'));
  console.log('Generated screenshots/desktop-1280x720.png');

  await sharp(Buffer.from(svgMobileScreenshot))
    .resize(750, 1334)
    .png()
    .toFile(path.join(screenshotsDir, 'mobile-750x1334.png'));
  console.log('Generated screenshots/mobile-750x1334.png');

  console.log('All icons and screenshots created successfully!');
}

run().catch(console.error);
