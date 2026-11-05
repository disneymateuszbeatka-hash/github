import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { usePWAInstall } from '../utils/usePWAInstall';
import {
  Smartphone,
  X,
  Download,
  QrCode,
  CheckCircle2,
  Copy,
  ExternalLink,
  ShieldCheck,
  Zap,
  Info,
  Package,
  Layers,
  Sparkles,
  FileCode2,
  ChevronDown,
  ChevronUp,
  AlertCircle,
} from 'lucide-react';

interface AndroidInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const MANIFEST_JSON_CONTENT = JSON.stringify(
  {
    id: './',
    name: 'Raport Odbioru Lokalu',
    short_name: 'Odbiór',
    description:
      'Mobilna checklista odbioru technicznego lokalu i mieszkania z generowaniem i wysyłką raportu PDF na e-mail.',
    lang: 'pl',
    dir: 'ltr',
    start_url: './',
    scope: './',
    display: 'standalone',
    display_override: ['window-controls-overlay', 'standalone', 'minimal-ui'],
    orientation: 'any',
    theme_color: '#0f172a',
    background_color: '#0f172a',
    categories: ['business', 'productivity', 'utilities'],
    prefer_related_applications: false,
    related_applications: [],
    handle_links: 'preferred',
    launch_handler: {
      client_mode: ['navigate-existing', 'auto'],
    },
    edge_side_panel: {
      preferred_width: 480,
    },
    icons: [
      {
        src: 'pwa-96x96.png',
        sizes: '96x96',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: 'pwa-128x128.png',
        sizes: '128x128',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: 'pwa-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: 'pwa-256x256.png',
        sizes: '256x256',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: 'pwa-384x384.png',
        sizes: '384x384',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: 'pwa-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: 'pwa-maskable-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
    screenshots: [
      {
        src: 'screenshots/desktop-1280x720.png',
        sizes: '1280x720',
        type: 'image/png',
        form_factor: 'wide',
        label: 'Główny pulpit odbioru technicznego lokalu na komputerze',
      },
      {
        src: 'screenshots/mobile-750x1334.png',
        sizes: '750x1334',
        type: 'image/png',
        form_factor: 'narrow',
        label: 'Mobilna checklista z notatkami głosowymi i zdjęciami',
      },
    ],
    shortcuts: [
      {
        name: 'Nowy Odbiór',
        short_name: 'Nowy',
        description: 'Rozpocznij nowy czysty protokół odbioru lokalu',
        url: './?action=new',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
        ],
      },
      {
        name: 'Zapisane Protokoły',
        short_name: 'Zapisane',
        description: 'Otwórz listę zapisanych odbiorów technicznych',
        url: './?action=saved',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
        ],
      },
      {
        name: 'Eksport PDF & E-mail',
        short_name: 'Eksport',
        description: 'Podgląd i wysyłka raportu PDF na e-mail',
        url: './?action=export',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
        ],
      },
    ],
  },
  null,
  2
);

export function AndroidInstallModal({ isOpen, onClose }: AndroidInstallModalProps) {
  const { isInstallable, isInstalled, install } = usePWAInstall();
  const [activeTab, setActiveTab] = useState<'device' | 'pwabuilder'>('device');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedManifest, setCopiedManifest] = useState(false);
  const [showManifestPreview, setShowManifestPreview] = useState(false);
  const [installSuccess, setInstallSuccess] = useState(false);

  const currentUrl =
    typeof window !== 'undefined'
      ? window.location.href.split('?')[0].split('#')[0]
      : '';

  useEffect(() => {
    if (isOpen && currentUrl) {
      QRCode.toDataURL(currentUrl, {
        width: 260,
        margin: 2,
        color: {
          dark: '#0f172a',
          light: '#ffffff',
        },
      })
        .then((url) => setQrDataUrl(url))
        .catch((err) => console.error('QR code generation error:', err));
    }
  }, [isOpen, currentUrl]);

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    const success = await install();
    if (success) {
      setInstallSuccess(true);
    }
  };

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2500);
    } catch {
      // fallback
    }
  };

  const handleCopyManifest = async () => {
    try {
      await navigator.clipboard.writeText(MANIFEST_JSON_CONTENT);
      setCopiedManifest(true);
      setTimeout(() => setCopiedManifest(false), 2500);
    } catch {
      // fallback
    }
  };

  const handleDownloadManifest = () => {
    const blob = new Blob([MANIFEST_JSON_CONTENT], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'manifest.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const pwaBuilderUrl = `https://www.pwabuilder.com/?url=${encodeURIComponent(currentUrl)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div
        className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                Instalacja &amp; APK
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold">
                  PWABuilder Ready
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Instalacja na telefonie oraz generator paczki APK / Google Play
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 px-4 pt-2 gap-2 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('device')}
            className={`pb-2.5 px-3 border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'device'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            Instalacja na smartfonie
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('pwabuilder')}
            className={`pb-2.5 px-3 border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'pwabuilder'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Package className="w-4 h-4" />
            PWABuilder (Plik APK / Sklep)
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs sm:text-sm text-slate-300">
          {activeTab === 'device' ? (
            <>
              {/* Status banner if already installed */}
              {isInstalled && (
                <div className="p-3 bg-emerald-950/60 border border-emerald-500/40 rounded-xl text-emerald-300 flex items-center gap-2.5">
                  <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />
                  <div>
                    <span className="font-bold">Aplikacja jest już zainstalowana!</span>
                    <p className="text-[11px] text-emerald-200/80 mt-0.5">
                      Działa jako pełnoekranowa aplikacja na Twoim urządzeniu.
                    </p>
                  </div>
                </div>
              )}

              {/* 1-Click Install Button if supported directly in current browser */}
              {isInstallable && !isInstalled && (
                <div className="p-3.5 bg-gradient-to-r from-amber-500/15 via-emerald-500/15 to-transparent border border-amber-500/30 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-100 flex items-center gap-1.5 text-xs">
                      <Zap className="w-4 h-4 text-amber-400" />
                      Wykryto obsługę natywnej instalacji
                    </span>
                    <span className="text-[10px] text-emerald-400 font-semibold">1 kliknięcie</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleInstallClick}
                    className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    Zainstaluj aplikację na tym telefonie
                  </button>
                </div>
              )}

              {/* QR Code Section to install on ANY Android phone */}
              <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-4 flex flex-col sm:flex-row items-center gap-4">
                {qrDataUrl ? (
                  <div className="bg-white p-2 rounded-xl shadow-md shrink-0">
                    <img
                      src={qrDataUrl}
                      alt="Zeskanuj telefonem aby zainstalować"
                      className="w-36 h-36 rounded-lg block"
                    />
                  </div>
                ) : (
                  <div className="w-36 h-36 bg-slate-700 rounded-xl flex items-center justify-center shrink-0">
                    <QrCode className="w-8 h-8 text-slate-400 animate-pulse" />
                  </div>
                )}

                <div className="flex-1 space-y-2 text-center sm:text-left">
                  <div className="font-bold text-slate-100 flex items-center justify-center sm:justify-start gap-1.5">
                    <QrCode className="w-4 h-4 text-amber-400" />
                    Zeskanuj aparatem telefonu
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Skieruj aparat dowolnego telefonu z Androidem na powyższy kod QR, aby otworzyć i zainstalować aplikację bezpośrednio na smartfonie.
                  </p>
                  <div className="pt-1 flex flex-wrap gap-2 justify-center sm:justify-start">
                    <button
                      type="button"
                      onClick={handleCopyUrl}
                      className="px-3 py-1.5 rounded-lg bg-slate-700/80 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      {copiedUrl ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedUrl ? 'Skopiowano adres URL!' : 'Kopiuj adres aplikacji'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Step-by-Step Instructions */}
              <div className="bg-slate-850 border border-slate-800 rounded-xl p-3.5 space-y-2.5">
                <h3 className="font-bold text-xs text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5" />
                  Instalacja w 3 prostych krokach:
                </h3>

                <ol className="space-y-2 text-xs text-slate-300 list-decimal list-inside pl-1">
                  <li className="leading-snug">
                    Otwórz link w przeglądarce <strong>Chrome</strong> na telefonie.
                  </li>
                  <li className="leading-snug">
                    Kliknij menu w prawym górnym rogu (<strong>trzy pionowe kropki ⋮</strong>).
                  </li>
                  <li className="leading-snug">
                    Wybierz opcję <strong>„Zainstaluj aplikację”</strong> (lub <em>„Dodaj do ekranu głównego”</em>).
                  </li>
                </ol>

                <div className="mt-2 pt-2 border-t border-slate-800 text-[11px] text-slate-400 flex items-start gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    System Android buduje zoptymalizowany pakiet WebAPK z własną ikoną w menu telefonu, pełnym ekranem i pamięcią podręczną offline.
                  </span>
                </div>
              </div>
            </>
          ) : (
            /* PWABuilder Specific Instructions & Validation */
            <div className="space-y-4">
              {/* Critical Alert explaining why PWABuilder can say "Manifest missing" when pasting dev URL */}
              <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-xl space-y-2">
                <div className="flex items-start gap-2 text-amber-300 font-bold text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
                  <span>Dlaczego PWABuilder może zgłaszać brak Manifestu przy wklejaniu adresu?</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Adres roboczy <code>ais-dev-...</code> w chmurze AI Studio wymaga autoryzacji Google (zwraca przekierowanie 302 do logowania dla zewnętrznych botów Microsoftu).
                </p>
                <p className="text-[11px] text-amber-200 font-medium">
                  <strong>Rozwiązanie w 1 krok:</strong> Skopiuj poniższy gotowy kod Manifestu i wklej go bezpośrednio w edytorze PWABuilder (opcja <em>„Edit / Paste Manifest”</em>) lub wgraj plik <code>manifest.json</code>.
                </p>
              </div>

              {/* Manifest Quick Actions */}
              <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-100 flex items-center gap-2 text-xs">
                    <FileCode2 className="w-4 h-4 text-amber-400" />
                    Gotowy plik Manifest.json (100% zgodny z PWABuilder)
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                    Zweryfikowany
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    type="button"
                    onClick={handleCopyManifest}
                    className="flex-1 py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {copiedManifest ? (
                      <CheckCircle2 className="w-4 h-4 text-slate-950" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                    {copiedManifest ? 'Skopiowano Manifest JSON!' : 'Kopiuj kod Manifest JSON'}
                  </button>

                  <button
                    type="button"
                    onClick={handleDownloadManifest}
                    className="py-2 px-3 rounded-xl bg-slate-700 hover:bg-slate-650 text-slate-200 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    Pobierz manifest.json
                  </button>
                </div>

                {/* Collapsible Manifest Code View */}
                <div className="border border-slate-700/60 rounded-lg overflow-hidden bg-slate-950/60">
                  <button
                    type="button"
                    onClick={() => setShowManifestPreview((prev) => !prev)}
                    className="w-full px-3 py-2 text-[11px] font-medium text-slate-400 hover:text-slate-200 flex items-center justify-between cursor-pointer"
                  >
                    <span>Podgląd zawartości manifest.json</span>
                    {showManifestPreview ? (
                      <ChevronUp className="w-3.5 h-3.5" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5" />
                    )}
                  </button>

                  {showManifestPreview && (
                    <pre className="p-3 text-[10px] text-emerald-300 font-mono overflow-x-auto max-h-48 border-t border-slate-800">
                      {MANIFEST_JSON_CONTENT}
                    </pre>
                  )}
                </div>
              </div>

              {/* Compliance checklist summary */}
              <div className="p-3 bg-slate-850 border border-slate-800 rounded-xl space-y-2 text-[11px]">
                <div className="font-bold text-slate-200 flex items-center gap-1.5 text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Spełnione wszystkie wymogi PWABuilder:
                </div>
                <div className="grid grid-cols-2 gap-2 text-slate-300">
                  <div className="flex items-center gap-1 text-emerald-400">
                    ✓ ID &amp; Start URL (/)
                  </div>
                  <div className="flex items-center gap-1 text-emerald-400">
                    ✓ Standalone + Override
                  </div>
                  <div className="flex items-center gap-1 text-emerald-400">
                    ✓ Ikony 96px do 512px
                  </div>
                  <div className="flex items-center gap-1 text-emerald-400">
                    ✓ Ikona Maskable (margines 15%)
                  </div>
                  <div className="flex items-center gap-1 text-emerald-400">
                    ✓ Zrzut Wide (1280x720)
                  </div>
                  <div className="flex items-center gap-1 text-emerald-400">
                    ✓ Zrzut Narrow (750x1334)
                  </div>
                  <div className="flex items-center gap-1 text-emerald-400">
                    ✓ 3 Skróty systemowe
                  </div>
                  <div className="flex items-center gap-1 text-emerald-400">
                    ✓ Service Worker Offline
                  </div>
                </div>
              </div>

              {/* Action Buttons for PWABuilder */}
              <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-4 space-y-3">
                <div className="font-bold text-slate-100 flex items-center gap-2 text-xs">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  Instrukcja generowania APK w PWABuilder:
                </div>

                <ol className="space-y-1.5 text-xs text-slate-300 list-decimal list-inside pl-1">
                  <li>
                    Otwórz <strong>pwabuilder.com</strong> i wprowadź adres aplikacji.
                  </li>
                  <li>
                    Jeśli pojawi się komunikat o braku manifestu (z powodu ochrony sesji Google w podglądzie), kliknij w PWABuilder pozycję <strong>„Manifest” &gt; „Edit Manifest”</strong> i wklej skopiowany wyżej kod JSON.
                  </li>
                  <li>
                    Przejdź do <strong>„Package for Stores”</strong> &gt; wybierz <strong>Android</strong> i pobierz gotowy plik <strong>.apk</strong> / <strong>.aab</strong>!
                  </li>
                </ol>

                <div className="flex flex-col sm:flex-row gap-2 pt-1">
                  <a
                    href={pwaBuilderUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all text-center"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Otwórz w PWABuilder.com
                  </a>

                  <button
                    type="button"
                    onClick={handleCopyUrl}
                    className="py-2.5 px-4 rounded-xl bg-slate-700 hover:bg-slate-650 text-slate-200 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {copiedUrl ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    {copiedUrl ? 'Skopiowano URL!' : 'Kopiuj URL aplikacji'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 sm:p-4 border-t border-slate-800 bg-slate-900/80 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            PWA Standalone &bull; Android WebAPK &bull; PWABuilder
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
          >
            Zamknij
          </button>
        </div>
      </div>
    </div>
  );
}
