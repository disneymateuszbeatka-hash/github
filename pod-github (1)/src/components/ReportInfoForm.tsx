import React from 'react';
import { GeneralInfo } from '../types/report';
import { Building2, Calendar, User, Zap, Sparkles, Layers, ShieldCheck, HelpCircle, Droplets, FileText } from 'lucide-react';

interface ReportInfoFormProps {
  general: GeneralInfo;
  onChange: (updated: GeneralInfo) => void;
}

export function ReportInfoForm({ general, onChange }: ReportInfoFormProps) {
  const updateField = (field: keyof GeneralInfo, val: string) => {
    onChange({
      ...general,
      [field]: val,
    });
  };

  return (
    <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 sm:p-5 shadow-lg backdrop-blur space-y-4">
      <div className="flex items-center justify-between border-b border-slate-700/60 pb-3">
        <h2 className="text-base font-bold text-amber-400 flex items-center gap-2">
          <Building2 className="w-5 h-5" />
          Metryka Lokalu i Odbioru
        </h2>
        <span className="text-xs text-slate-400 font-medium">Krok 1 z 3</span>
      </div>

      <div className="flex flex-col space-y-4">
        {/* Imię i nazwisko */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-amber-400" />
            Imię i nazwisko
          </label>
          <input
            type="text"
            value={general.clientName}
            onChange={(e) => updateField('clientName', e.target.value)}
            placeholder=""
            className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        {/* Adres lokalu */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-amber-400" />
            Adres lokalu
          </label>
          <input
            type="text"
            value={general.address}
            onChange={(e) => updateField('address', e.target.value)}
            placeholder=""
            className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        {/* Numer umowy */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-amber-400" />
            Numer umowy
          </label>
          <input
            type="text"
            value={general.contractNumber || ''}
            onChange={(e) => updateField('contractNumber', e.target.value)}
            placeholder=""
            className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        {/* Data i godzina */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-amber-400" />
            Data i godzina
          </label>
          <input
            type="text"
            value={general.dateTime}
            onChange={(e) => updateField('dateTime', e.target.value)}
            placeholder=""
            className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        {/* Obecność prądu w lokalu */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            Obecność prądu w lokalu
          </label>
          <div className="flex gap-2">
            {['tak', 'nie'].map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => updateField('electricityPresent', opt)}
                className={`flex-1 py-2 text-xs rounded-xl font-bold uppercase tracking-wider transition-all active:scale-95 ${
                  general.electricityPresent.toLowerCase() === opt
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                    : 'bg-slate-700/60 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        {/* Ściany tynkowane / surowe */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-amber-400" />
            Ściany tynkowane / surowe
          </label>
          <div className="flex gap-2">
            {['tynkowane', 'surowe'].map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => updateField('wallsPlasterRaw', opt)}
                className={`flex-1 py-2 text-xs rounded-xl font-bold uppercase tracking-wider transition-all active:scale-95 ${
                  general.wallsPlasterRaw.toLowerCase() === opt
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                    : 'bg-slate-700/60 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        {/* Rodzaj tynku */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Rodzaj tynku
          </label>
          <div className="flex gap-2">
            {['tynk gipsowy', 'tynk cementowy'].map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => updateField('plasterType', opt)}
                className={`flex-1 py-2 text-xs rounded-xl font-bold transition-all active:scale-95 ${
                  (general.plasterType || '').toLowerCase() === opt
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                    : 'bg-slate-700/60 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        {/* Lokal pomalowany */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Lokal pomalowany
          </label>
          <div className="grid grid-cols-3 gap-1.5">
            {['tak farba', 'tak grunt', 'nie, tynk surowy'].map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => updateField('apartmentPainted', opt)}
                className={`py-2 px-1 text-center text-xs rounded-xl font-bold transition-all active:scale-95 ${
                  (general.apartmentPainted || '').toLowerCase() === opt
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                    : 'bg-slate-700/60 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        {/* Akrylowanie dylatacji */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Akrylowanie dylatacji
          </label>
          <div className="flex gap-2">
            {['nie', 'tak', 'częściowo'].map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => updateField('expansionJointAcrylic', opt)}
                className={`flex-1 py-1.5 text-xs rounded-lg font-semibold transition-all ${
                  general.expansionJointAcrylic.toLowerCase() === opt
                    ? 'bg-amber-500 text-slate-950'
                    : 'bg-slate-700/60 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        {/* Konieczność gładzi */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Konieczność gładzi
          </label>
          <div className="flex gap-2">
            {['tak', 'nie'].map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => updateField('puttyNeeded', opt)}
                className={`flex-1 py-2 text-xs rounded-xl font-bold uppercase tracking-wider transition-all active:scale-95 ${
                  (general.puttyNeeded || '').toLowerCase() === opt
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                    : 'bg-slate-700/60 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        {/* Konieczność gruntowania */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Konieczność gruntowania
          </label>
          <div className="flex gap-2">
            {['tak', 'nie'].map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => updateField('primingNeeded', opt)}
                className={`flex-1 py-2 text-xs rounded-xl font-bold uppercase tracking-wider transition-all active:scale-95 ${
                  (general.primingNeeded || '').toLowerCase() === opt
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                    : 'bg-slate-700/60 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        {/* Ogrzewanie podłogowe */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Ogrzewanie podłogowe
          </label>
          <div className="flex gap-2">
            {['nie', 'tak', 'częściowe (łazienka)'].map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => updateField('underfloorHeating', opt)}
                className={`flex-1 py-1.5 text-xs rounded-lg font-semibold transition-all ${
                  general.underfloorHeating.toLowerCase() === opt
                    ? 'bg-amber-500 text-slate-950'
                    : 'bg-slate-700/60 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        {/* Puste miejsce w rozdzielni */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Puste miejsce w rozdzielni
          </label>
          <div className="flex gap-2">
            {['tak', 'nie'].map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => updateField('emptySpaceInFuseBox', opt)}
                className={`flex-1 py-2 text-xs rounded-xl font-bold uppercase tracking-wider transition-all active:scale-95 ${
                  (general.emptySpaceInFuseBox || '').toLowerCase() === opt
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                    : 'bg-slate-700/60 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        {/* Wod-kan */}
        <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-700/60 space-y-2.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Droplets className="w-3.5 h-3.5 text-amber-400" />
              Wod-kan
            </label>
            {general.wodKanStatus && (
              <span className="text-[11px] font-semibold text-amber-400">
                {general.wodKanStatus}
                {general.wodKanStatus === 'rozprowadzone' && general.wodKanWkucie ? ` (${general.wodKanWkucie})` : ''}
              </span>
            )}
          </div>
          <div className="flex gap-2">
            {[
              { id: 'rozprowadzone', label: 'rozprowadzone' },
              { id: 'brak rozprowadzenia', label: 'brak rozprowadzenia' },
            ].map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => {
                  const isCurrent = (general.wodKanStatus || '').toLowerCase() === opt.id;
                  const newStatus = isCurrent ? '' : opt.id;
                  onChange({
                    ...general,
                    wodKanStatus: newStatus,
                    wodKanWkucie: newStatus === 'rozprowadzone' ? (general.wodKanWkucie || '') : '',
                  });
                }}
                className={`flex-1 py-2 text-xs rounded-xl font-bold transition-all active:scale-95 ${
                  (general.wodKanStatus || '').toLowerCase() === opt.id
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                    : 'bg-slate-700/60 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Opcja wkucia widoczna po kliknięciu "rozprowadzone" */}
          {general.wodKanStatus === 'rozprowadzone' && (
            <div className="pt-2.5 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center gap-2">
              <span className="text-xs text-slate-400 font-medium shrink-0">Wkucie instalacji:</span>
              <div className="flex flex-1 gap-2">
                {[
                  { id: 'wkute', label: 'wkute' },
                  { id: 'brak wkucia', label: 'brak wkucia' },
                ].map((subOpt) => {
                  const isSubCurrent = (general.wodKanWkucie || '').toLowerCase() === subOpt.id;
                  return (
                    <button
                      key={subOpt.id}
                      type="button"
                      onClick={() => updateField('wodKanWkucie', isSubCurrent ? '' : subOpt.id)}
                      className={`flex-1 py-1.5 px-3 text-xs rounded-lg font-bold transition-all active:scale-95 ${
                        isSubCurrent
                          ? 'bg-amber-500 text-slate-950 shadow-sm'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-750 border border-slate-700/60'
                      }`}
                    >
                      {subOpt.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
