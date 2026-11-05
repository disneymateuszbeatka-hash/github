import React from 'react';
import { InspectionReport } from '../types/report';
import { calculateReportStats } from '../utils/reportLogic';
import { X, FolderOpen, Calendar, Trash2, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';

interface SavedReportsModalProps {
  isOpen: boolean;
  onClose: () => void;
  reports: InspectionReport[];
  currentReportId: string;
  onSelectReport: (report: InspectionReport) => void;
  onDeleteReport: (id: string) => void;
}

export function SavedReportsModal({
  isOpen,
  onClose,
  reports,
  currentReportId,
  onSelectReport,
  onDeleteReport,
}: SavedReportsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg max-h-[85vh] flex flex-col bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden text-slate-100">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <FolderOpen className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold text-slate-100">
              Zapisane Raporty Odbiorów ({reports.length})
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 overflow-y-auto space-y-3">
          {reports.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-xs">
              Brak zapisanych raportów w pamięci urządzenia. Aktualny raport zapisuje się automatycznie.
            </div>
          ) : (
            reports.map((rep) => {
              const stats = calculateReportStats(rep.items);
              const isCurrent = rep.id === currentReportId;

              return (
                <div
                  key={rep.id}
                  className={`p-3.5 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                    isCurrent
                      ? 'bg-amber-500/10 border-amber-500/50'
                      : 'bg-slate-800/80 border-slate-700 hover:border-slate-600'
                  }`}
                >
                  <div
                    className="flex-1 cursor-pointer"
                    onClick={() => {
                      onSelectReport(rep);
                      onClose();
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-100">
                        {rep.general.address || 'Lokal bez adresu'}
                      </span>
                      {isCurrent && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500 text-slate-950">
                          Aktywny
                        </span>
                      )}
                    </div>

                    <div className="text-xs text-slate-400 mt-0.5">
                      {rep.general.clientName || 'Brak klienta'} • {rep.general.dateTime || 'Brak daty'}
                    </div>

                    <div className="flex items-center gap-3 mt-2 text-[11px]">
                      <span className="flex items-center gap-1 text-emerald-400">
                        <CheckCircle2 className="w-3.5 h-3.5" /> {stats.okCount} OK
                      </span>
                      <span className="flex items-center gap-1 text-amber-400">
                        <AlertTriangle className="w-3.5 h-3.5" /> {stats.defectCount} usterek
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onDeleteReport(rep.id)}
                      className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-700/50"
                      title="Usuń raport"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onSelectReport(rep);
                        onClose();
                      }}
                      className="p-2 rounded-lg bg-slate-700 hover:bg-amber-500 hover:text-slate-950 text-slate-200 transition-colors"
                      title="Otwórz raport"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="p-4 border-t border-slate-800 bg-slate-900/90 text-right">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold"
          >
            Zamknij
          </button>
        </div>
      </div>
    </div>
  );
}
