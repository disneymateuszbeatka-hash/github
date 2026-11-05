import React, { forwardRef } from 'react';
import { InspectionReport } from '../types/report';

interface PrintableReportDocumentProps {
  report: InspectionReport;
}

export interface PrintableReportHandles {
  getPage1: () => HTMLElement | null;
  getPage2: () => HTMLElement | null;
}

export const PrintableReportDocument = forwardRef<
  HTMLDivElement,
  PrintableReportDocumentProps
>(({ report }, ref) => {
  const commonItems = report.items.filter((i) => i.category === 'wspolne');
  const balconyItems = report.items.filter((i) => i.category === 'balkon');
  const parkingItems = report.items.filter((i) => i.category === 'miejsce_postojowe');

  // Collect all photos from items
  const allPhotos = report.items.flatMap((item) =>
    (item.photos || []).map((photoUrl) => ({
      itemLabel: item.label,
      itemValue: item.value,
      url: photoUrl,
    }))
  );

  return (
    <div ref={ref} className="printable-report-container text-[#000000] font-sans leading-relaxed">
      {/* PAGE 1: Metryka Lokalu + Punkty kontrolne wspólne (całkowicie mieści się bez ucinania) */}
      <div
        id="pdf-page-1"
        className="pdf-page w-[794px] h-[1123px] p-[45px] bg-white mx-auto flex flex-col justify-between box-border text-[12.5px] relative shadow-lg mb-8 print:shadow-none print:m-0"
        style={{ width: '794px', height: '1123px', boxSizing: 'border-box' }}
      >
        <div>
          {/* Header Title */}
          <div className="text-center mb-6">
            <h1 className="text-xl font-bold tracking-wider uppercase text-[#0f172a]">
              RAPORT ODBIORU LOKALU
            </h1>
          </div>

          {/* General Metadata (14 pozycji) */}
          <div className="space-y-1 mb-5 text-[#0f172a]">
            <div className="flex">
              <span className="w-64 font-normal text-[#1e293b]">Imię i nazwisko:</span>
              <span className="font-medium text-[#020617]">{report.general.clientName || '—'}</span>
            </div>
            <div className="flex">
              <span className="w-64 font-normal text-[#1e293b]">Adres lokalu:</span>
              <span className="font-medium text-[#020617]">{report.general.address || '—'}</span>
            </div>
            <div className="flex">
              <span className="w-64 font-normal text-[#1e293b]">Numer umowy:</span>
              <span className="font-medium text-[#020617]">{report.general.contractNumber || '—'}</span>
            </div>
            <div className="flex">
              <span className="w-64 font-normal text-[#1e293b]">Data i godzina:</span>
              <span className="font-medium text-[#020617]">{report.general.dateTime || '—'}</span>
            </div>
            <div className="flex">
              <span className="w-64 font-normal text-[#1e293b]">Obecność prądu w lokalu:</span>
              <span className="font-medium text-[#020617]">{report.general.electricityPresent || '—'}</span>
            </div>
            <div className="flex">
              <span className="w-64 font-normal text-[#1e293b]">Ściany tynkowane / surowe:</span>
              <span className="font-medium text-[#020617]">{report.general.wallsPlasterRaw || '—'}</span>
            </div>
            <div className="flex">
              <span className="w-64 font-normal text-[#1e293b]">Rodzaj tynku:</span>
              <span className="font-medium text-[#020617]">{report.general.plasterType || report.general.plasterCategoryPainted || '—'}</span>
            </div>
            <div className="flex">
              <span className="w-64 font-normal text-[#1e293b]">Lokal pomalowany:</span>
              <span className="font-medium text-[#020617]">{report.general.apartmentPainted || '—'}</span>
            </div>
            <div className="flex">
              <span className="w-64 font-normal text-[#1e293b]">Akrylowanie dylatacji:</span>
              <span className="font-medium text-[#020617]">{report.general.expansionJointAcrylic || '—'}</span>
            </div>
            <div className="flex">
              <span className="w-64 font-normal text-[#1e293b]">Konieczność gładzi:</span>
              <span className="font-medium text-[#020617]">{report.general.puttyNeeded || report.general.puttyPrimingNeeded || '—'}</span>
            </div>
            <div className="flex">
              <span className="w-64 font-normal text-[#1e293b]">Konieczność gruntowania:</span>
              <span className="font-medium text-[#020617]">{report.general.primingNeeded || report.general.puttyPrimingNeeded || '—'}</span>
            </div>
            <div className="flex">
              <span className="w-64 font-normal text-[#1e293b]">Ogrzewanie podłogowe:</span>
              <span className="font-medium text-[#020617]">{report.general.underfloorHeating || '—'}</span>
            </div>
            <div className="flex">
              <span className="w-64 font-normal text-[#1e293b]">Puste miejsce w rozdzielni:</span>
              <span className="font-medium text-[#020617]">{report.general.emptySpaceInFuseBox || '—'}</span>
            </div>
            <div className="flex">
              <span className="w-64 font-normal text-[#1e293b]">Wod-kan:</span>
              <span className="font-medium text-[#020617]">
                {report.general.wodKanStatus
                  ? report.general.wodKanStatus === 'rozprowadzone' && report.general.wodKanWkucie
                    ? `${report.general.wodKanStatus} (${report.general.wodKanWkucie})`
                    : report.general.wodKanStatus
                  : '—'}
              </span>
            </div>
          </div>

          {/* Section 1: Punkty kontrolne wspólne (18 punktów) */}
          <div className="mt-4">
            <h2 className="text-[13.5px] font-bold text-[#020617] mb-2 border-b border-[#e2e8f0] pb-1">
              Punkty kontrolne wspólne
            </h2>
            <div className="space-y-1 text-[#0f172a]">
              {commonItems.map((item) => {
                const valLower = (item.value || '').toLowerCase();
                const isDefect =
                  valLower &&
                  valLower !== 'ok' &&
                  valLower !== 'bez uwag' &&
                  valLower !== 'brak uwag' &&
                  valLower !== 'nie dotyczy' &&
                  valLower !== 'brak';
                return (
                  <div key={item.id} className="flex leading-snug">
                    <span className="font-normal text-[#1e293b] min-w-[280px] max-w-[420px] pr-2">
                      {item.label}:
                    </span>
                    {item.defects && item.defects.length > 0 ? (
                      <div className="flex-1 space-y-0.5">
                        {item.defects.map((def, dIdx) => (
                          <div key={dIdx} className="text-[#78350f] font-semibold underline decoration-[#fbbf24]">
                            {item.defects!.length > 1 ? `${dIdx + 1}. ` : ''}{def}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span
                        className={`flex-1 font-medium ${
                          isDefect ? 'text-[#78350f] font-semibold underline decoration-[#fbbf24]' : 'text-[#020617]'
                        }`}
                      >
                        {item.value || '—'}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer Page 1 */}
        <div className="pt-3 border-t border-[#e2e8f0] flex justify-between text-xs text-[#64748b]">
          <span>Raport Odbioru Lokalu • {report.general.address || 'Lokal'}</span>
          <span>Strona 1 z 2</span>
        </div>
      </div>

      {/* PAGE 2: Balkon/taras + Miejsce postojowe + Inne uwagi + Dokumentacja fotograficzna */}
      <div
        id="pdf-page-2"
        className="pdf-page w-[794px] h-[1123px] p-[45px] bg-white mx-auto flex flex-col justify-between box-border text-[12.5px] relative shadow-lg print:shadow-none print:m-0"
        style={{ width: '794px', height: '1123px', boxSizing: 'border-box' }}
      >
        <div>
          {/* Header Title repeated */}
          <div className="flex justify-between items-center border-b border-[#e2e8f0] pb-2.5 mb-5">
            <span className="font-bold text-[#1e293b] uppercase tracking-wide text-xs">
              RAPORT ODBIORU LOKALU — DOKOŃCZENIE
            </span>
            <span className="text-xs text-[#64748b]">{report.general.dateTime}</span>
          </div>

          {/* Section 2: Balkon / taras */}
          <div className="mb-5">
            <h2 className="text-[13.5px] font-bold text-[#020617] mb-2 border-b border-[#e2e8f0] pb-1">
              Balkon / taras
            </h2>
            <div className="space-y-1.5 text-[#0f172a]">
              {balconyItems.map((item) => {
                const valLower = (item.value || '').toLowerCase();
                const isDefect = valLower && valLower !== 'ok' && valLower !== 'bez uwag' && valLower !== 'brak uwag' && valLower !== 'nie dotyczy' && valLower !== 'brak';
                return (
                  <div key={item.id} className="flex leading-snug">
                    <span className="font-normal text-[#1e293b] min-w-[280px] max-w-[420px] pr-2">
                      {item.label}:
                    </span>
                    {item.defects && item.defects.length > 0 ? (
                      <div className="flex-1 space-y-0.5">
                        {item.defects.map((def, dIdx) => (
                          <div key={dIdx} className="text-[#78350f] font-semibold underline decoration-[#fbbf24]">
                            {item.defects!.length > 1 ? `${dIdx + 1}. ` : ''}{def}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span
                        className={`flex-1 font-medium ${
                          isDefect ? 'text-[#78350f] font-semibold underline decoration-[#fbbf24]' : 'text-[#020617]'
                        }`}
                      >
                        {item.value || '—'}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 3: Miejsce postojowe */}
          {parkingItems.length > 0 && (
            <div className="mb-5">
              <h2 className="text-[13.5px] font-bold text-[#020617] mb-2 border-b border-[#e2e8f0] pb-1">
                Miejsce postojowe
              </h2>
              <div className="space-y-1.5 text-[#0f172a]">
                {parkingItems.map((item) => {
                  const valLower = (item.value || '').toLowerCase();
                  const isDefect =
                    valLower &&
                    valLower !== 'ok' &&
                    valLower !== 'bez uwag' &&
                    valLower !== 'brak uwag' &&
                    valLower !== 'nie dotyczy' &&
                    valLower !== 'brak' &&
                    valLower !== 'brak miejsca';
                  return (
                    <div key={item.id} className="flex leading-snug">
                      <span className="font-normal text-[#1e293b] min-w-[280px] max-w-[420px] pr-2">
                        {item.label}:
                      </span>
                      {item.defects && item.defects.length > 0 ? (
                        <div className="flex-1 space-y-0.5">
                          {item.defects.map((def, dIdx) => (
                            <div key={dIdx} className="text-[#78350f] font-semibold underline decoration-[#fbbf24]">
                              {item.defects!.length > 1 ? `${dIdx + 1}. ` : ''}{def}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span
                          className={`flex-1 font-medium ${
                            isDefect ? 'text-[#78350f] font-semibold underline decoration-[#fbbf24]' : 'text-[#020617]'
                          }`}
                        >
                          {item.value || '—'}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Section 4: Inne uwagi */}
          <div className="mb-6">
            <h2 className="text-[13.5px] font-bold text-[#020617] mb-2 border-b border-[#e2e8f0] pb-1">
              Inne uwagi
            </h2>
            <div className="p-3 bg-[#f8fafc] border border-[#e2e8f0] rounded text-[12.5px] text-[#0f172a] min-h-[44px]">
              {report.otherRemarks ? report.otherRemarks : 'brak uwag'}
            </div>
          </div>

          {/* Photo Gallery if any attached */}
          {allPhotos.length > 0 && (
            <div className="mb-6">
              <h2 className="text-[13.5px] font-bold text-[#020617] mb-2 border-b border-[#e2e8f0] pb-1">
                Dokumentacja fotograficzna usterek ({allPhotos.length})
              </h2>
              <div className="grid grid-cols-3 gap-3">
                {allPhotos.slice(0, 6).map((item, idx) => (
                  <div key={idx} className="border border-[#cbd5e1] rounded overflow-hidden bg-[#f8fafc]">
                    <img
                      src={item.url}
                      alt={item.itemLabel}
                      className="w-full h-28 object-cover"
                    />
                    <div className="p-1.5 text-[11px] truncate bg-white">
                      <span className="font-semibold">{item.itemLabel}:</span> {item.itemValue}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Page 2 */}
        <div className="pt-3 border-t border-[#e2e8f0] flex justify-between text-xs text-[#64748b]">
          <span>Raport Odbioru Lokalu • {report.general.address || 'Lokal'}</span>
          <span>Strona 2 z 2</span>
        </div>
      </div>
    </div>
  );
});

PrintableReportDocument.displayName = 'PrintableReportDocument';
