import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  InspectionReport,
  ChecklistItem,
  createEmptyReport,
  createSampleReportFromAttachment,
} from './types/report';
import {
  loadCurrentDraft,
  saveCurrentDraft,
  getSavedReports,
  saveReportToHistory,
  deleteReportFromHistory,
} from './utils/storage';
import { calculateReportStats, getReportFileName } from './utils/reportLogic';
import { useSpeechRecognition } from './utils/useSpeechRecognition';

import { HeaderBar } from './components/HeaderBar';
import { ReportInfoForm } from './components/ReportInfoForm';
import { ChecklistSection } from './components/ChecklistSection';
import { ExportEmailModal } from './components/ExportEmailModal';
import { SavedReportsModal } from './components/SavedReportsModal';
import { PrintableReportDocument } from './components/PrintableReportDocument';
import { OfflineIndicator } from './components/OfflineIndicator';

import {
  Building2,
  CheckCircle2,
  AlertTriangle,
  Share2,
  FileText,
  Eye,
  EyeOff,
  Filter,
  CheckCheck,
  Send,
  MessageSquare,
  ShieldCheck,
} from 'lucide-react';

export default function App() {
  const [report, setReport] = useState<InspectionReport>(() => loadCurrentDraft());
  const [activeTab, setActiveTab] = useState<'all' | 'info' | 'wspolne' | 'balkon' | 'miejsce_postojowe' | 'inne'>('all');
  const [filterMode, setFilterMode] = useState<'all' | 'defects' | 'unfilled'>('all');
  const [showPdfPreview, setShowPdfPreview] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isSavedModalOpen, setIsSavedModalOpen] = useState(false);
  const [savedReports, setSavedReports] = useState<InspectionReport[]>(() => getSavedReports());

  const printableDocRef = useRef<HTMLDivElement | null>(null);

  // Speech recognition
  const { isListening, activeItemId, startListening, stopListening } = useSpeechRecognition();

  // Auto-save draft on changes
  useEffect(() => {
    saveCurrentDraft(report);
    saveReportToHistory(report);
  }, [report]);

  // Handle manifest shortcuts (?action=new, ?action=saved, ?action=export)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const action = params.get('action');
      if (action === 'saved') {
        setIsSavedModalOpen(true);
      } else if (action === 'export') {
        setIsExportModalOpen(true);
      } else if (action === 'new') {
        const fresh = createEmptyReport();
        setReport(fresh);
      }
    }
  }, []);

  const stats = useMemo(() => calculateReportStats(report.items), [report.items]);

  // Voice result handler
  const handleStartVoice = (itemId: string, onResult?: (text: string) => void) => {
    startListening(itemId, (text: string) => {
      if (onResult) {
        onResult(text);
      } else {
        handleItemChange(itemId, { value: text, status: 'defect' });
      }
    });
  };

  const handleItemChange = (itemId: string, updated: Partial<ChecklistItem>) => {
    setReport((prev) => ({
      ...prev,
      items: prev.items.map((item) => (item.id === itemId ? { ...item, ...updated } : item)),
    }));
  };

  const handleMarkAllCategoryAsOk = (category: 'wspolne' | 'balkon' | 'miejsce_postojowe') => {
    setReport((prev) => ({
      ...prev,
      items: prev.items.map((item) => {
        if (item.category === category && (!item.value || item.status === 'unfilled')) {
          return {
            ...item,
            value: 'brak uwag',
            status: 'ok',
            defects: [],
          };
        }
        return item;
      }),
    }));
  };

  const handleNewReport = () => {
    if (confirm('Czy na pewno chcesz utworzyć nowy czysty raport? Aktualny stan został zapisany w historii.')) {
      const fresh = createEmptyReport();
      setReport(fresh);
      saveReportToHistory(fresh);
      setSavedReports(getSavedReports());
    }
  };

  const handleLoadSample = () => {
    const sample = createSampleReportFromAttachment();
    setReport(sample);
    saveReportToHistory(sample);
    setSavedReports(getSavedReports());
  };

  const handleDeleteSavedReport = (id: string) => {
    deleteReportFromHistory(id);
    setSavedReports(getSavedReports());
  };

  // Filter items based on current view filter
  const filteredCommonItems = useMemo(() => {
    return report.items
      .filter((i) => i.category === 'wspolne')
      .filter((i) => {
        if (filterMode === 'defects') return i.status === 'defect';
        if (filterMode === 'unfilled') return !i.value || i.status === 'unfilled';
        return true;
      });
  }, [report.items, filterMode]);

  const filteredBalconyItems = useMemo(() => {
    return report.items
      .filter((i) => i.category === 'balkon')
      .filter((i) => {
        if (filterMode === 'defects') return i.status === 'defect';
        if (filterMode === 'unfilled') return !i.value || i.status === 'unfilled';
        return true;
      });
  }, [report.items, filterMode]);

  const filteredParkingItems = useMemo(() => {
    return report.items
      .filter((i) => i.category === 'miejsce_postojowe')
      .filter((i) => {
        if (filterMode === 'defects') return i.status === 'defect';
        if (filterMode === 'unfilled') return !i.value || i.status === 'unfilled';
        return true;
      });
  }, [report.items, filterMode]);

  const getPage1Element = () => document.getElementById('pdf-page-1');
  const getPage2Element = () => document.getElementById('pdf-page-2');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans pb-28">
      {/* Top Application Bar */}
      <HeaderBar
        report={report}
        onNewReport={handleNewReport}
        onOpenExportModal={() => setIsExportModalOpen(true)}
        onOpenSavedModal={() => setIsSavedModalOpen(true)}
        savedReportsCount={savedReports.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-3 sm:px-6 py-4 space-y-4">
        {/* View Switcher & Filter Pills */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          {/* Navigation Tabs */}
          <div className="flex overflow-x-auto pb-1 sm:pb-0 gap-1.5 text-xs font-medium no-scrollbar">
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`px-3 py-2 rounded-xl whitespace-nowrap transition-all ${
                activeTab === 'all'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow'
                  : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
              }`}
            >
              Wszystkie punkty
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('info')}
              className={`px-3 py-2 rounded-xl whitespace-nowrap transition-all ${
                activeTab === 'info'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow'
                  : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
              }`}
            >
              Metryka lokalu
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('wspolne')}
              className={`px-3 py-2 rounded-xl whitespace-nowrap transition-all ${
                activeTab === 'wspolne'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow'
                  : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
              }`}
            >
              Wspólne ({report.items.filter((i) => i.category === 'wspolne').length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('balkon')}
              className={`px-3 py-2 rounded-xl whitespace-nowrap transition-all ${
                activeTab === 'balkon'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow'
                  : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
              }`}
            >
              Balkon/taras ({report.items.filter((i) => i.category === 'balkon').length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('miejsce_postojowe')}
              className={`px-3 py-2 rounded-xl whitespace-nowrap transition-all ${
                activeTab === 'miejsce_postojowe'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow'
                  : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
              }`}
            >
              Miejsce postojowe ({report.items.filter((i) => i.category === 'miejsce_postojowe').length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('inne')}
              className={`px-3 py-2 rounded-xl whitespace-nowrap transition-all ${
                activeTab === 'inne'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow'
                  : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
              }`}
            >
              Inne uwagi
            </button>
          </div>

          {/* Filter Defect / Unfilled Mode */}
          <div className="flex items-center gap-1.5 self-end sm:self-auto">
            <span className="text-[11px] text-slate-400 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" />
              Filtr:
            </span>
            <button
              type="button"
              onClick={() => setFilterMode('all')}
              className={`px-2 py-1 text-xs rounded-lg ${
                filterMode === 'all'
                  ? 'bg-slate-700 text-white font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Wszystkie
            </button>
            <button
              type="button"
              onClick={() => setFilterMode('defects')}
              className={`px-2 py-1 text-xs rounded-lg flex items-center gap-1 ${
                filterMode === 'defects'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold'
                  : 'text-slate-400 hover:text-amber-400'
              }`}
            >
              <AlertTriangle className="w-3 h-3 text-amber-400" />
              Usterki ({stats.defectCount})
            </button>
            <button
              type="button"
              onClick={() => setFilterMode('unfilled')}
              className={`px-2 py-1 text-xs rounded-lg ${
                filterMode === 'unfilled'
                  ? 'bg-slate-700 text-white font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Do zrobienia ({stats.unfilledCount})
            </button>
          </div>
        </div>

        {/* SECTION 1: Metryka lokalu */}
        {(activeTab === 'all' || activeTab === 'info') && (
          <ReportInfoForm
            general={report.general}
            onChange={(updated) => setReport((prev) => ({ ...prev, general: updated }))}
          />
        )}

        {/* SECTION 2: Punkty kontrolne wspólne */}
        {(activeTab === 'all' || activeTab === 'wspolne') && (
          <ChecklistSection
            title="Punkty kontrolne wspólne"
            category="wspolne"
            items={filteredCommonItems}
            onItemChange={handleItemChange}
            onMarkAllCategoryAsOk={handleMarkAllCategoryAsOk}
            isListening={isListening}
            activeMicItemId={activeItemId}
            onStartVoice={handleStartVoice}
            onStopVoice={stopListening}
          />
        )}

        {/* SECTION 3: Balkon / taras */}
        {(activeTab === 'all' || activeTab === 'balkon') && (
          <ChecklistSection
            title="Balkon / taras"
            category="balkon"
            items={filteredBalconyItems}
            onItemChange={handleItemChange}
            onMarkAllCategoryAsOk={handleMarkAllCategoryAsOk}
            isListening={isListening}
            activeMicItemId={activeItemId}
            onStartVoice={handleStartVoice}
            onStopVoice={stopListening}
          />
        )}

        {/* SECTION 4: Miejsce postojowe */}
        {(activeTab === 'all' || activeTab === 'miejsce_postojowe') && (
          <ChecklistSection
            title="Miejsce postojowe"
            category="miejsce_postojowe"
            items={filteredParkingItems}
            onItemChange={handleItemChange}
            onMarkAllCategoryAsOk={handleMarkAllCategoryAsOk}
            isListening={isListening}
            activeMicItemId={activeItemId}
            onStartVoice={handleStartVoice}
            onStopVoice={stopListening}
          />
        )}

        {/* SECTION 5: Inne, uwagi, podpisy */}
        {(activeTab === 'all' || activeTab === 'inne') && (
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 sm:p-5 shadow-lg backdrop-blur space-y-5">
            <div className="flex items-center justify-between border-b border-slate-700/60 pb-3">
              <h2 className="text-base font-bold text-amber-400 flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Inne Uwagi i Koordynator
              </h2>
            </div>

            {/* Inne uwagi (matches PDF page 2) */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-amber-400" />
                Inne uwagi:
              </label>
              <textarea
                value={report.otherRemarks}
                onChange={(e) => setReport((prev) => ({ ...prev, otherRemarks: e.target.value }))}
                placeholder="Wpisz ewentualne uwagi dodatkowe..."
                rows={3}
                className="w-full bg-slate-900/90 border border-slate-700 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            {/* Dane Koordynatora */}
            <div className="pt-2 border-t border-slate-700/60">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Imię i nazwisko koordynatora
                </label>
                <input
                  type="text"
                  value={report.inspectorName || ''}
                  onChange={(e) => setReport((prev) => ({ ...prev, inspectorName: e.target.value }))}
                  placeholder=""
                  className="w-full sm:max-w-md bg-slate-900/90 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100"
                />
              </div>
            </div>
          </div>
        )}

        {/* Live PDF Preview Toggle Button */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={() => setShowPdfPreview(!showPdfPreview)}
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-amber-400 transition-colors py-1"
          >
            {showPdfPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {showPdfPreview ? 'Ukryj podgląd dokumentu PDF' : 'Pokaż podgląd dokumentu PDF (2 strony A4)'}
          </button>

          <span className="text-[11px] text-slate-500">
            Zgodne z checklistą odbiorową PDF
          </span>
        </div>

        {/* Live PDF Document Preview */}
        {showPdfPreview && (
          <div className="border border-slate-800 rounded-2xl p-4 bg-slate-900 overflow-x-auto shadow-2xl">
            <div className="text-xs text-amber-400 font-bold mb-3 flex items-center gap-1.5">
              <FileText className="w-4 h-4" />
              Podgląd generowanego dokumentu PDF:
            </div>
            <div className="transform scale-[0.8] origin-top sm:scale-100 sm:origin-top flex justify-center">
              <PrintableReportDocument ref={printableDocRef} report={report} />
            </div>
          </div>
        )}

        {/* Footer author note - widoczne wyłącznie w aplikacji */}
        <div className="pt-4 pb-2 text-center text-xs text-slate-500 font-medium select-none">
          opracował Kamil Sot
        </div>

        {/* Hidden Printable Document for HTML2Canvas & jsPDF background rendering when preview is toggled off */}
        {!showPdfPreview && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              zIndex: -9999,
              opacity: 1,
              pointerEvents: 'none',
              transform: 'none',
            }}
            aria-hidden="true"
          >
            <PrintableReportDocument ref={printableDocRef} report={report} />
          </div>
        )}
      </main>

      {/* Sticky Bottom Android Action Bar */}
      <div className="fixed bottom-0 inset-x-0 z-40 bg-slate-900/95 border-t border-slate-800 backdrop-blur-md px-3 sm:px-6 pt-2.5 pb-2 shadow-2xl">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
          {/* Quick Metrics */}
          <div className="flex items-center gap-2 text-xs">
            <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex flex-col items-center justify-center">
              <span className="text-[10px] text-slate-400 leading-none">OK</span>
              <span className="font-bold text-emerald-400 text-xs">{stats.okCount}</span>
            </div>

            <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex flex-col items-center justify-center">
              <span className="text-[10px] text-slate-400 leading-none">Błędy</span>
              <span className={`font-bold text-xs ${stats.defectCount > 0 ? 'text-amber-400' : 'text-slate-400'}`}>
                {stats.defectCount}
              </span>
            </div>

            <div className="hidden xs:block text-[11px] text-slate-400">
              <span className="text-slate-200 font-semibold">{report.general.address || 'Lokal'}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Primary Action Button */}
            <button
              type="button"
              onClick={() => setIsExportModalOpen(true)}
              className="flex-1 sm:flex-initial py-2.5 px-5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Generuj PDF &amp; Udostępnij</span>
            </button>
          </div>
        </div>

        {/* Informacja autorska na samym dole aplikacji */}
        <div className="text-center pt-1 text-[11px] text-slate-500 select-none font-normal">
          opracował Kamil Sot
        </div>
      </div>

      {/* Export / Share Modal */}
      <ExportEmailModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        report={report}
        getPage1Element={getPage1Element}
        getPage2Element={getPage2Element}
      />

      {/* Saved Reports History Modal */}
      <SavedReportsModal
        isOpen={isSavedModalOpen}
        onClose={() => setIsSavedModalOpen(false)}
        reports={savedReports}
        currentReportId={report.id}
        onSelectReport={(r) => setReport(r)}
        onDeleteReport={handleDeleteSavedReport}
      />

      {/* Real-time PWA Offline Status Banner */}
      <OfflineIndicator />
    </div>
  );
}
