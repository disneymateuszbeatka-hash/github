import React, { useState, useRef } from 'react';
import { ChecklistItem } from '../types/report';
import { deriveStatusFromValue, formatDefectsList } from '../utils/reportLogic';
import {
  CheckCircle2,
  AlertTriangle,
  MinusCircle,
  Mic,
  MicOff,
  Camera,
  Trash2,
  Plus,
  Check,
  CheckCheck,
  X,
} from 'lucide-react';

interface ChecklistSectionProps {
  title: string;
  category: 'wspolne' | 'balkon' | 'miejsce_postojowe';
  items: ChecklistItem[];
  onItemChange: (id: string, updated: Partial<ChecklistItem>) => void;
  onMarkAllCategoryAsOk: (category: 'wspolne' | 'balkon' | 'miejsce_postojowe') => void;
  isListening: boolean;
  activeMicItemId: string | null;
  onStartVoice: (id: string, onResult?: (text: string) => void) => void;
  onStopVoice: () => void;
}

export function ChecklistSection({
  title,
  category,
  items,
  onItemChange,
  onMarkAllCategoryAsOk,
  isListening,
  activeMicItemId,
  onStartVoice,
  onStopVoice,
}: ChecklistSectionProps) {
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  // Draft text inputs for adding new defects per item: { [itemId]: string }
  const [draftInputs, setDraftInputs] = useState<{ [itemId: string]: string }>({});
  // Whether the input box is explicitly open/visible: { [itemId]: boolean }
  const [openComposer, setOpenComposer] = useState<{ [itemId: string]: boolean }>({});

  /**
   * Action: user clicks "Brak uwag"
   * Sets status to 'ok', value to 'brak uwag', clears defect list, closes composer
   */
  const handleSetNoRemarks = (item: ChecklistItem) => {
    setOpenComposer((prev) => ({ ...prev, [item.id]: false }));
    setDraftInputs((prev) => ({ ...prev, [item.id]: '' }));
    onItemChange(item.id, {
      value: 'brak uwag',
      status: 'ok',
      defects: [],
    });
  };

  /**
   * Action: user clicks "Usterka" or "+ Usterka"
   * Generates and opens the defect field numbered from 1 (or next number)
   */
  const handleOpenDefectComposer = (item: ChecklistItem) => {
    setOpenComposer((prev) => ({ ...prev, [item.id]: true }));

    // Extract current real defects (excluding placeholder strings like 'brak uwag')
    const current = (item.defects || []).filter(
      (d) => !['ok', 'brak uwag', 'bez uwag', 'nie dotyczy', 'brak', 'brak miejsca'].includes(d.trim().toLowerCase())
    );

    // If item currently has a defect value as single string (e.g. from sample)
    if (current.length === 0 && item.value && !['ok', 'brak uwag', 'bez uwag', 'nie dotyczy', 'brak', 'brak miejsca'].includes(item.value.trim().toLowerCase())) {
      current.push(item.value.trim());
    }

    onItemChange(item.id, {
      status: 'defect',
      defects: current,
      value: current.length > 0 ? formatDefectsList(current) : '',
    });
  };

  /**
   * Action: user confirms adding a numbered defect
   */
  const handleConfirmDefect = (item: ChecklistItem) => {
    const draft = (draftInputs[item.id] || '').trim();
    if (!draft) {
      return;
    }

    // Filter out non-defect strings
    const current = (item.defects || []).filter(
      (d) => !['ok', 'brak uwag', 'bez uwag', 'nie dotyczy', 'brak', 'brak miejsca'].includes(d.trim().toLowerCase())
    );
    const updatedDefects = [...current, draft];

    onItemChange(item.id, {
      defects: updatedDefects,
      value: formatDefectsList(updatedDefects),
      status: 'defect',
    });
    setDraftInputs((prev) => ({ ...prev, [item.id]: '' }));
    setOpenComposer((prev) => ({ ...prev, [item.id]: false }));
  };

  /**
   * Action: delete a specific numbered defect
   */
  const handleRemoveDefect = (item: ChecklistItem, defectIndex: number) => {
    const current = (item.defects || []).filter(
      (d) => !['ok', 'brak uwag', 'bez uwag', 'nie dotyczy', 'brak', 'brak miejsca'].includes(d.trim().toLowerCase())
    );
    const updated = current.filter((_, idx) => idx !== defectIndex);
    if (updated.length === 0) {
      onItemChange(item.id, {
        defects: [],
        value: '',
        status: 'unfilled',
      });
      setOpenComposer((prev) => ({ ...prev, [item.id]: false }));
    } else {
      onItemChange(item.id, {
        defects: updated,
        value: formatDefectsList(updated),
        status: 'defect',
      });
    }
  };

  /**
   * Action: user clicks "N/D" (Nie dotyczy)
   */
  const handleSetNA = (item: ChecklistItem) => {
    setOpenComposer((prev) => ({ ...prev, [item.id]: false }));
    setDraftInputs((prev) => ({ ...prev, [item.id]: '' }));
    onItemChange(item.id, {
      value: 'nie dotyczy',
      status: 'na',
      defects: [],
    });
  };

  /**
   * Action: user clicks "Brak miejsca" for parking space
   */
  const handleSetNoParking = (item: ChecklistItem) => {
    setOpenComposer((prev) => ({ ...prev, [item.id]: false }));
    setDraftInputs((prev) => ({ ...prev, [item.id]: '' }));
    onItemChange(item.id, {
      value: 'brak miejsca',
      status: 'na',
      defects: [],
    });
  };

  /**
   * Upload defect photo
   */
  const handlePhotoUpload = (item: ChecklistItem, e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        const currentPhotos = item.photos || [];
        onItemChange(item.id, {
          photos: [...currentPhotos, reader.result],
        });
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleRemovePhoto = (item: ChecklistItem, photoIndex: number) => {
    const currentPhotos = item.photos || [];
    const updated = currentPhotos.filter((_, idx) => idx !== photoIndex);
    onItemChange(item.id, { photos: updated });
  };

  return (
    <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 sm:p-5 shadow-lg backdrop-blur space-y-4">
      {/* Section Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-700/60 pb-3">
        <div>
          <h2 className="text-base font-bold text-amber-400 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
            {title}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {items.length} punktów kontrolnych • Wybierz „Brak uwag” lub kliknij „Usterka”
          </p>
        </div>

        <button
          type="button"
          onClick={() => onMarkAllCategoryAsOk(category)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/80 text-emerald-300 border border-emerald-700/50 hover:bg-emerald-900 text-xs font-semibold transition-all active:scale-95 cursor-pointer"
          title="Ustawia 'brak uwag' na wszystkich niewypełnionych pozycjach"
        >
          <CheckCheck className="w-3.5 h-3.5" />
          Oznacz pozostałe jako Brak uwag
        </button>
      </div>

      {/* Checklist items */}
      <div className="space-y-3.5">
        {items.map((item, index) => {
          const isItemActiveMic = isListening && activeMicItemId === item.id;
          const status = item.value
            ? item.status === 'unfilled'
              ? deriveStatusFromValue(item.value)
              : item.status
            : (item.status || 'unfilled');

          const isOk = status === 'ok';
          const isDefect = status === 'defect';
          const isNa = status === 'na';

          // Clean list of confirmed defects (excluding non-defect strings like 'brak uwag')
          const rawDefects = item.defects && item.defects.length > 0
            ? item.defects
            : (isDefect && item.value && !['ok', 'bez uwag', 'brak uwag', 'nie dotyczy', 'brak', 'brak miejsca'].includes(item.value.trim().toLowerCase()))
            ? [item.value]
            : [];

          const defectsList = rawDefects.filter(
            (d) => !['ok', 'bez uwag', 'brak uwag', 'nie dotyczy', 'brak', 'brak miejsca'].includes(d.trim().toLowerCase())
          );

          // Composer should be open if user explicitly toggled it, OR if item is defect with 0 defects yet
          const composerIsOpen = openComposer[item.id] ?? (isDefect && defectsList.length === 0);
          const nextDefectNumber = defectsList.length + 1;
          const currentDraft = draftInputs[item.id] || '';

          return (
            <div
              key={item.id}
              className={`p-3.5 sm:p-4 rounded-xl border transition-all ${
                isDefect
                  ? 'bg-amber-950/20 border-amber-500/60 shadow-md shadow-amber-950/30'
                  : isOk
                  ? 'bg-slate-900/60 border-emerald-500/40'
                  : isNa
                  ? 'bg-slate-900/40 border-slate-700/50 opacity-80'
                  : 'bg-slate-900/80 border-slate-700 hover:border-slate-600'
              }`}
            >
              {/* Row 1: Label and Primary Quick-Choice Buttons (Brak uwag / Usterka) */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <span className="text-xs font-mono font-bold text-amber-400/90 mt-0.5 min-w-[24px]">
                    {index + 1}.
                  </span>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-100 leading-snug">
                      {item.label}
                    </h3>

                    {/* Compact status pill if already selected */}
                    {isOk && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 mt-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Brak uwag
                      </span>
                    )}
                    {isDefect && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-400 mt-1">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        {defectsList.length === 0
                          ? 'Wprowadzanie usterki...'
                          : defectsList.length === 1
                          ? '1 stwierdzona usterka'
                          : `${defectsList.length} stwierdzone usterki`}
                      </span>
                    )}
                    {isNa && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-400 mt-1">
                        <MinusCircle className="w-3.5 h-3.5" />
                        {item.category === 'miejsce_postojowe' ? 'Brak miejsca' : 'Nie dotyczy'}
                      </span>
                    )}
                  </div>
                </div>

                {/* Primary Action Buttons */}
                {item.category === 'miejsce_postojowe' ? (
                  <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                    {/* Brak miejsca */}
                    <button
                      type="button"
                      onClick={() => handleSetNoParking(item)}
                      className={`px-3.5 py-2 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer ${
                        isNa
                          ? 'bg-slate-700 text-slate-100 shadow-md ring-2 ring-slate-400'
                          : 'bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700/80'
                      }`}
                    >
                      <MinusCircle className="w-4 h-4" />
                      Brak miejsca
                    </button>

                    {/* Brak uwag */}
                    <button
                      type="button"
                      onClick={() => handleSetNoRemarks(item)}
                      className={`px-3.5 py-2 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer ${
                        isOk
                          ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30 ring-2 ring-emerald-400'
                          : 'bg-slate-800 text-emerald-400 border border-emerald-800/80 hover:bg-emerald-950/60'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Brak uwag
                    </button>

                    {/* Usterka button */}
                    <button
                      type="button"
                      onClick={() => handleOpenDefectComposer(item)}
                      className={`px-3.5 py-2 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer ${
                        isDefect
                          ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30 ring-2 ring-amber-400'
                          : 'bg-slate-800 text-amber-400 border border-amber-800/80 hover:bg-amber-950/60'
                      }`}
                    >
                      <AlertTriangle className="w-4 h-4" />
                      {defectsList.length > 0 ? '+ Usterka' : 'Usterka'}
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                    {/* Brak uwag */}
                    <button
                      type="button"
                      onClick={() => handleSetNoRemarks(item)}
                      className={`px-3.5 py-2 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer ${
                        isOk
                          ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30 ring-2 ring-emerald-400'
                          : 'bg-slate-800 text-emerald-400 border border-emerald-800/80 hover:bg-emerald-950/60'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Brak uwag
                    </button>

                    {/* Usterka button */}
                    <button
                      type="button"
                      onClick={() => handleOpenDefectComposer(item)}
                      className={`px-3.5 py-2 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer ${
                        isDefect
                          ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30 ring-2 ring-amber-400'
                          : 'bg-slate-800 text-amber-400 border border-amber-800/80 hover:bg-amber-950/60'
                      }`}
                    >
                      <AlertTriangle className="w-4 h-4" />
                      {defectsList.length > 0 ? '+ Usterka' : 'Usterka'}
                    </button>

                    {/* Optional N/D */}
                    <button
                      type="button"
                      onClick={() => handleSetNA(item)}
                      className={`px-2.5 py-2 text-xs font-medium rounded-xl flex items-center gap-1 transition-all active:scale-95 cursor-pointer ${
                        isNa
                          ? 'bg-slate-700 text-slate-100 shadow-md ring-2 ring-slate-500'
                          : 'bg-slate-800/60 text-slate-400 border border-slate-700 hover:bg-slate-700/80'
                      }`}
                      title="Nie dotyczy"
                    >
                      <MinusCircle className="w-3.5 h-3.5" />
                      N/D
                    </button>
                  </div>
                )}
              </div>

              {/* Numbered defects list - numbered strictly from 1 (1., 2., 3., ...) */}
              {defectsList.length > 0 && (
                <div className="mt-3 pt-2.5 border-t border-slate-800/90 space-y-2">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-amber-400/90 flex items-center justify-between">
                    <span>Lista stwierdzonych usterek:</span>
                    <span className="text-[10px] text-slate-400 font-normal">
                      Kliknij krzyżyk, aby usunąć
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    {defectsList.map((defectText, dIdx) => (
                      <div
                        key={dIdx}
                        className="flex items-start justify-between gap-2 bg-slate-950/80 border border-amber-500/40 rounded-xl px-3 py-2 text-xs"
                      >
                        <div className="flex items-start gap-2.5 text-slate-100">
                          <span className="font-bold text-amber-400 font-mono text-xs shrink-0 mt-0.5">
                            {dIdx + 1}.
                          </span>
                          <span className="font-medium text-amber-100 leading-snug">
                            {defectText}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveDefect(item, dIdx)}
                          className="text-slate-400 hover:text-rose-400 p-1 rounded-lg hover:bg-rose-950/40 transition-colors shrink-0 cursor-pointer"
                          title={`Usuń usterkę ${dIdx + 1}`}
                          aria-label={`Usuń usterkę ${dIdx + 1}`}
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Inline button to add next numbered defect */}
                  {!composerIsOpen && (
                    <button
                      type="button"
                      onClick={() => handleOpenDefectComposer(item)}
                      className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-300 border border-amber-500/30 hover:bg-amber-500/20 text-xs font-semibold transition-all active:scale-95 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Dodaj usterkę #{nextDefectNumber}
                    </button>
                  )}
                </div>
              )}

              {/* Active Composer: input field for adding defects numbered from 1 */}
              {composerIsOpen && (
                <div className="mt-3 pt-3 border-t border-amber-500/30 space-y-2 bg-amber-950/25 -mx-3.5 sm:-mx-4 -mb-3.5 sm:-mb-4 p-3.5 sm:p-4 rounded-b-xl animate-fade-in">
                  <div className="flex items-center justify-between text-xs text-amber-300 font-semibold">
                    <span className="flex items-center gap-1.5">
                      <Plus className="w-3.5 h-3.5 text-amber-400" />
                      Pole dodawania usterki #{nextDefectNumber}:
                    </span>
                    {defectsList.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setOpenComposer((prev) => ({ ...prev, [item.id]: false }))}
                        className="text-slate-400 hover:text-slate-200 text-xs px-2 py-0.5 rounded hover:bg-slate-800 transition-colors cursor-pointer"
                      >
                        Anuluj
                      </button>
                    )}
                  </div>

                  {/* Input field with numbered badge (e.g. 1., 2.) */}
                  <div className="flex items-center gap-2">
                    <div className="flex items-center justify-center w-8 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 font-mono font-bold text-xs shrink-0 select-none">
                      {nextDefectNumber}.
                    </div>

                    <div className="relative flex-1">
                      <input
                        type="text"
                        autoFocus
                        value={currentDraft}
                        onChange={(e) =>
                          setDraftInputs((prev) => ({ ...prev, [item.id]: e.target.value }))
                        }
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleConfirmDefect(item);
                          }
                        }}
                        placeholder={`Wpisz treść usterki ${nextDefectNumber}...`}
                        className="w-full bg-slate-950 border border-amber-500/70 rounded-xl px-3.5 py-2 text-xs text-amber-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>

                    {/* OK / Dodaj button to confirm defect */}
                    <button
                      type="button"
                      onClick={() => handleConfirmDefect(item)}
                      className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md shadow-amber-500/20 active:scale-95 cursor-pointer shrink-0 transition-all"
                      title={`Zatwierdź usterkę ${nextDefectNumber}`}
                    >
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>Dodaj</span>
                    </button>

                    {/* Voice typing button */}
                    <button
                      type="button"
                      onClick={() => {
                        if (isItemActiveMic) {
                          onStopVoice();
                        } else {
                          onStartVoice(item.id, (spokenText) => {
                            setDraftInputs((prev) => ({
                              ...prev,
                              [item.id]: (prev[item.id] ? `${prev[item.id]} ` : '') + spokenText,
                            }));
                          });
                        }
                      }}
                      className={`p-2 rounded-xl border transition-all shrink-0 cursor-pointer ${
                        isItemActiveMic
                          ? 'bg-rose-500 text-white animate-bounce border-rose-400'
                          : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-amber-400 hover:border-amber-500/40'
                      }`}
                      title={isItemActiveMic ? 'Zatrzymaj dyktowanie' : 'Podyktuj usterkę głosem (polski)'}
                    >
                      {isItemActiveMic ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                    </button>

                    {/* Photo button */}
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      className="hidden"
                      ref={(el) => {
                        fileInputRefs.current[item.id] = el;
                      }}
                      onChange={(e) => handlePhotoUpload(item, e)}
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRefs.current[item.id]?.click()}
                      className="p-2 rounded-xl bg-slate-800 text-slate-300 border border-slate-700 hover:text-amber-400 hover:border-amber-500/40 transition-colors relative shrink-0 cursor-pointer"
                      title="Zrób zdjęcie lub dodaj z galerii"
                    >
                      <Camera className="w-4 h-4" />
                      {item.photos && item.photos.length > 0 && (
                        <span className="absolute -top-1 -right-1 bg-amber-500 text-slate-950 rounded-full w-4 h-4 text-[10px] font-bold flex items-center justify-center">
                          {item.photos.length}
                        </span>
                      )}
                    </button>
                  </div>

                  {/* Quick Suggestions for this item if available */}
                  {item.quickSuggestions && item.quickSuggestions.filter((s) => !['ok', 'brak uwag', 'bez uwag', 'nie dotyczy', 'brak'].includes(s.toLowerCase())).length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="text-[10px] text-slate-400">Szybka podpowiedź:</span>
                      {item.quickSuggestions
                        .filter((s) => !['ok', 'brak uwag', 'bez uwag', 'nie dotyczy', 'brak'].includes(s.toLowerCase()))
                        .map((sug, sIdx) => (
                          <button
                            key={sIdx}
                            type="button"
                            onClick={() => {
                              setDraftInputs((prev) => ({ ...prev, [item.id]: sug }));
                            }}
                            className="text-[11px] px-2 py-0.5 rounded-lg bg-slate-900 text-amber-300 border border-slate-700 hover:border-amber-500/50 hover:bg-slate-800 transition-colors cursor-pointer"
                          >
                            + {sug}
                          </button>
                        ))}
                    </div>
                  )}
                </div>
              )}

              {/* Photo thumbnails if attached to this item */}
              {item.photos && item.photos.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3 pt-2.5 border-t border-slate-800">
                  <span className="w-full text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    Załączone zdjęcia ({item.photos.length}):
                  </span>
                  {item.photos.map((photo, pIdx) => (
                    <div
                      key={pIdx}
                      className="relative group rounded-lg overflow-hidden border border-slate-700 w-16 h-16 bg-slate-950"
                    >
                      <img src={photo} alt="Usterka" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemovePhoto(item, pIdx)}
                        className="absolute inset-0 bg-slate-900/80 text-rose-400 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer"
                        title="Usuń zdjęcie"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
