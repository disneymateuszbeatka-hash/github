import React, { useState } from 'react';
import { InspectionReport } from '../types/report';
import {
  generatePdfBlobFromPages,
  downloadPdfBlob,
  sharePdfFile,
} from '../utils/pdfGenerator';
import { getReportFileName } from '../utils/reportLogic';
import {
  X,
  FileDown,
  Share2,
  Loader2,
  CheckCircle,
  FileText,
  Smartphone,
} from 'lucide-react';

interface ExportEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: InspectionReport;
  getPage1Element: () => HTMLElement | null;
  getPage2Element: () => HTMLElement | null;
}

export function ExportEmailModal({
  isOpen,
  onClose,
  report,
  getPage1Element,
  getPage2Element,
}: ExportEmailModalProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeAction, setActiveAction] = useState<'share' | 'download' | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const fileName = getReportFileName(report);

  const getBlob = async (): Promise<Blob | null> => {
    const page1 = getPage1Element();
    const page2 = getPage2Element();
    if (!page1 || !page2) {
      setStatusMessage('Błąd: nie można odnaleźć stron raportu.');
      return null;
    }
    return await generatePdfBlobFromPages([page1, page2]);
  };

  const handleSharePdf = async () => {
    try {
      setIsGenerating(true);
      setActiveAction('share');
      setStatusMessage('Generowanie pliku PDF o wysokiej rozdzielczości...');

      const blob = await getBlob();
      if (!blob) {
        setIsGenerating(false);
        setActiveAction(null);
        return;
      }

      setStatusMessage('Otwieranie menu wyboru aplikacji...');

      const shareTitle = `Protokół odbioru - ${report.general.address || 'Lokal'}`;
      const shareText = `Protokół odbioru technicznego lokalu (${report.general.address || 'Lokal'}). W załączeniu raport PDF.`;

      const result = await sharePdfFile(blob, fileName, shareTitle, shareText);

      if (result === 'shared') {
        setStatusMessage('Udostępniono pomyślnie!');
      } else if (result === 'canceled') {
        setStatusMessage('Anulowano wybór aplikacji.');
      } else {
        // Fallback: if browser does not support Web Share API with files (e.g. desktop PC)
        downloadPdfBlob(blob, fileName);
        setStatusMessage(
          `Plik PDF (${fileName}) został zapisany. Twoja przeglądarka na tym urządzeniu nie obsługuje menu aplikacji.`
        );
      }
    } catch (e: any) {
      if (e?.name === 'AbortError') {
        setStatusMessage('Anulowano wybór aplikacji.');
      } else {
        console.error(e);
        setStatusMessage('Wystąpił błąd podczas przygotowywania pliku do udostępnienia.');
      }
    } finally {
      setIsGenerating(false);
      setActiveAction(null);
    }
  };

  const handleDownloadPdf = async () => {
    try {
      setIsGenerating(true);
      setActiveAction('download');
      setStatusMessage('Generowanie pliku PDF o wysokiej rozdzielczości...');
      const blob = await getBlob();
      if (blob) {
        downloadPdfBlob(blob, fileName);
        setStatusMessage(`Plik PDF (${fileName}) został pomyślnie zapisany na urządzeniu!`);
      }
    } catch (e) {
      console.error(e);
      setStatusMessage('Wystąpił błąd podczas generowania pliku PDF.');
    } finally {
      setIsGenerating(false);
      setActiveAction(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg flex flex-col bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden text-slate-100">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-900/90">
          <div>
            <h3 className="text-base font-bold text-amber-400 flex items-center gap-2">
              <FileText className="w-5 h-5 text-amber-400" />
              Generuj raport PDF &amp; Udostępnij
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Wybierz aplikację na telefonie lub zapisz plik w pamięci urządzenia
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Zamknij"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4">
          {/* Status Alert if any */}
          {statusMessage && (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2 animate-fade-in">
              <CheckCircle className="w-4 h-4 shrink-0 text-amber-400" />
              <span>{statusMessage}</span>
            </div>
          )}

          {/* Report summary info pill */}
          <div className="bg-slate-800/60 border border-slate-700/70 rounded-xl p-3 flex items-center justify-between text-xs text-slate-300">
            <span className="truncate max-w-[240px] font-medium text-slate-200">
              {report.general.address || 'Brak adresu'}
            </span>
            <span className="text-[11px] font-mono text-slate-400 shrink-0">
              {fileName}
            </span>
          </div>

          {/* Action options */}
          <div className="space-y-3 pt-1">
            {/* Primary Choice: Udostępnij w aplikacji (Android Share Sheet with attached PDF) */}
            <button
              type="button"
              disabled={isGenerating}
              onClick={handleSharePdf}
              className="w-full p-4 rounded-xl bg-gradient-to-r from-emerald-950/60 via-slate-850 to-slate-800/90 hover:from-emerald-950/80 hover:to-slate-800 border-2 border-emerald-500/60 hover:border-emerald-400 text-left transition-all active:scale-[0.99] disabled:opacity-60 group flex items-start gap-3.5 shadow-lg shadow-emerald-950/40 cursor-pointer"
            >
              <div className="w-11 h-11 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-300 shrink-0 group-hover:scale-105 transition-transform">
                {isGenerating && activeAction === 'share' ? (
                  <Loader2 className="w-6 h-6 animate-spin text-emerald-400" />
                ) : (
                  <Share2 className="w-6 h-6 text-emerald-400" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-slate-100 flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-base text-emerald-300">
                    Udostępnij
                  </span>
                  <span className="text-[10px] font-bold text-emerald-300 bg-emerald-500/20 px-2.5 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
                    <Smartphone className="w-3 h-3" />
                    Wybór aplikacji
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  Otwórz menu wyboru aplikacji na telefonie (<strong>Gmail, WhatsApp, Dysk, Wiadomości itp.</strong>) z automatycznie dołączonym plikiem PDF.
                </p>
              </div>
            </button>

            {/* Secondary Choice: Zapisz PDF na dysku */}
            <button
              type="button"
              disabled={isGenerating}
              onClick={handleDownloadPdf}
              className="w-full p-4 rounded-xl bg-slate-850/80 hover:bg-slate-800 border border-slate-700 hover:border-amber-500/50 text-left transition-all active:scale-[0.99] disabled:opacity-60 group flex items-start gap-3.5 shadow-lg shadow-black/20 cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 group-hover:scale-105 transition-transform">
                {isGenerating && activeAction === 'download' ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <FileDown className="w-5 h-5" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-slate-100 flex items-center justify-between">
                  <span>Zapisz PDF</span>
                  <span className="text-[11px] font-semibold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                    Pobierz
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Pobierz raport w formacie PDF (2 strony A4) bezpośrednio do pamięci urządzenia.
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end px-5 py-3 border-t border-slate-800 bg-slate-900/90 text-xs">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold cursor-pointer transition-colors"
          >
            Zamknij
          </button>
        </div>
      </div>
    </div>
  );
}
