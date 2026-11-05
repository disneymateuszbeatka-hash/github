import { ChecklistItem, InspectionReport } from '../types/report';

export interface ReportStats {
  total: number;
  filled: number;
  okCount: number;
  defectCount: number;
  naCount: number;
  unfilledCount: number;
  percentComplete: number;
}

/**
 * Determines status based on text input.
 */
export function deriveStatusFromValue(val: string): 'ok' | 'defect' | 'na' | 'unfilled' {
  const trimmed = val.trim().toLowerCase();
  if (!trimmed) return 'unfilled';
  if (trimmed === 'ok' || trimmed === 'dobry' || trimmed === 'zgodne' || trimmed === 'poprawny' || trimmed === 'brak uwag' || trimmed === 'bez uwag') {
    return 'ok';
  }
  if (trimmed === 'nie dotyczy' || trimmed === 'nd' || trimmed === 'n/d' || trimmed === 'brak' || trimmed === 'brak miejsca') {
    return 'na';
  }
  return 'defect';
}

/**
 * Formats an array of defects into a clean display string.
 */
export function formatDefectsList(defects: string[]): string {
  if (!defects || defects.length === 0) return '';
  if (defects.length === 1) return defects[0];
  return defects.map((d, idx) => `${idx + 1}. ${d}`).join('; ');
}

/**
 * Calculates report statistics for UI and export.
 */
export function calculateReportStats(items: ChecklistItem[]): ReportStats {
  const total = items.length;
  let okCount = 0;
  let defectCount = 0;
  let naCount = 0;
  let unfilledCount = 0;

  for (const item of items) {
    const status = item.value ? (item.status === 'unfilled' ? deriveStatusFromValue(item.value) : item.status) : 'unfilled';
    if (status === 'ok') okCount++;
    else if (status === 'defect') defectCount++;
    else if (status === 'na') naCount++;
    else unfilledCount++;
  }

  const filled = total - unfilledCount;
  const percentComplete = total > 0 ? Math.round((filled / total) * 100) : 0;

  return {
    total,
    filled,
    okCount,
    defectCount,
    naCount,
    unfilledCount,
    percentComplete,
  };
}

/**
 * Formats a clean filename for PDF export.
 */
export function getReportFileName(report: InspectionReport): string {
  const addressSlug = (report.general.address || 'lokal')
    .toLowerCase()
    .replace(/[^a-z0-9]/gi, '_')
    .slice(0, 30);
  const dateStr = (report.general.dateTime || 'data')
    .replace(/[^0-9]/g, '')
    .slice(0, 8);
  return `Raport_Odbioru_${addressSlug}_${dateStr || Date.now()}.pdf`;
}

/**
 * Generates email subject line.
 */
export function generateEmailSubject(report: InspectionReport): string {
  const addr = report.general.address || 'Lokal mieszkalny';
  const client = report.general.clientName ? ` - ${report.general.clientName}` : '';
  return `Raport Odbioru Lokalu: ${addr}${client}`;
}

/**
 * Generates formatted plain text email body summarizing the inspection report.
 */
export function generateEmailBody(report: InspectionReport): string {
  const stats = calculateReportStats(report.items);
  const defects = report.items.filter((i) => {
    const s = i.value ? (i.status === 'unfilled' ? deriveStatusFromValue(i.value) : i.status) : 'unfilled';
    return s === 'defect';
  });

  let text = `Dzień dobry,\n\n`;
  text += `W załączeniu przesyłam oficjalny RAPORT ODBIORU TECHNICZNEGO LOKALU.\n\n`;
  text += `PODSUMOWANIE ODBIORU:\n`;
  text += `• Inwestor / Klient: ${report.general.clientName || 'Brak danych'}\n`;
  text += `• Adres lokalu: ${report.general.address || 'Brak danych'}\n`;
  text += `• Data i godzina: ${report.general.dateTime || 'Brak danych'}\n`;
  text += `• Stan prądu w lokalu: ${report.general.electricityPresent}\n`;
  text += `• Ściany: ${report.general.wallsPlasterRaw} | Tynk: ${report.general.plasterType || report.general.plasterCategoryPainted || '—'} | Malowanie: ${report.general.apartmentPainted || '—'}\n`;
  text += `• Ogrzewanie podłogowe: ${report.general.underfloorHeating}\n`;
  text += `• Skontrolowano punktów: ${stats.filled}/${stats.total} (${stats.percentComplete}%)\n`;
  text += `• Liczba stwierdzonych usterek/uwag: ${stats.defectCount}\n\n`;

  if (defects.length > 0) {
    text += `WYKRYTE USTERKI I UWAGI DO POPRAWY:\n`;
    defects.forEach((d, idx) => {
      const catLabel = d.category === 'balkon' ? 'Balkon/taras' : d.category === 'miejsce_postojowe' ? 'Miejsce postojowe' : 'Wspólne';
      text += `${idx + 1}. [${catLabel}] ${d.label}: ${d.value}${d.notes ? ` (${d.notes})` : ''}\n`;
    });
    text += `\n`;
  } else {
    text += `Brak stwierdzonych usterek w skontrolowanych punktach.\n\n`;
  }

  if (report.otherRemarks && report.otherRemarks.trim() !== 'brak') {
    text += `Inne uwagi: ${report.otherRemarks}\n\n`;
  }

  text += `Pełny raport wraz z checklistą w formacie PDF znajduje się w załączniku.\n\n`;
  text += `Z poważaniem,\n${report.inspectorName || 'Koordynator'}`;

  return text;
}

/**
 * Generates mailto URL with recipient and subject.
 * By default does not include any message body or report statistics.
 */
export function generateMailtoUrl(
  report: InspectionReport,
  customEmail?: string,
  includeBody: boolean = false
): string {
  const recipient = (customEmail ?? report.recipientEmail ?? '').trim();
  const subject = encodeURIComponent(generateEmailSubject(report));
  const bodyParam = includeBody ? `&body=${encodeURIComponent(generateEmailBody(report))}` : '';
  return `mailto:${recipient}?subject=${subject}${bodyParam}`;
}
