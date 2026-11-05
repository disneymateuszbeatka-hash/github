import { InspectionReport, createEmptyReport, createSampleReportFromAttachment, DEFAULT_CHECKLIST_ITEMS } from '../types/report';

const DRAFT_KEY = 'raport_odbioru_current_draft';
const REPORTS_LIST_KEY = 'raport_odbioru_history_v1';

export function loadCurrentDraft(): InspectionReport {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.general && Array.isArray(parsed.items)) {
        if (!parsed.general.plasterType) {
          parsed.general.plasterType = 'tynk gipsowy';
        }
        if (!parsed.general.apartmentPainted) {
          parsed.general.apartmentPainted = 'tak farba';
        } else if (parsed.general.apartmentPainted === 'nie tynki surowe') {
          parsed.general.apartmentPainted = 'nie, tynk surowy';
        }
        if (parsed.general.wallsPlasterRaw && parsed.general.wallsPlasterRaw !== 'surowe' && parsed.general.wallsPlasterRaw !== 'tynkowane') {
          parsed.general.wallsPlasterRaw = parsed.general.wallsPlasterRaw.includes('surow') ? 'surowe' : 'tynkowane';
        }
        if (!parsed.general.puttyNeeded) {
          parsed.general.puttyNeeded = parsed.general.puttyPrimingNeeded?.toLowerCase().includes('nie') ? 'nie' : 'tak';
        }
        if (!parsed.general.primingNeeded) {
          parsed.general.primingNeeded = parsed.general.puttyPrimingNeeded?.toLowerCase().includes('nie') ? 'nie' : 'tak';
        }
        if (parsed.general.emptySpaceInFuseBox && parsed.general.emptySpaceInFuseBox !== 'tak' && parsed.general.emptySpaceInFuseBox !== 'nie') {
          parsed.general.emptySpaceInFuseBox = parsed.general.emptySpaceInFuseBox.toLowerCase() === 'tak' ? 'tak' : 'nie';
        }
        if (parsed.id === 'rep_sample_attachment' || (parsed.general.clientName === 'Kamil Sot' && parsed.general.address === 'stoleczna')) {
          parsed.general.clientName = '';
          parsed.general.address = '';
          parsed.general.dateTime = '';
        }
        if (parsed.inspectorName === 'Inspektor Odbiorczy' || parsed.inspectorName === 'Kamil Sot (Inspektor)') {
          parsed.inspectorName = '';
        }
        if (parsed.recipientEmail === 'disneymateuszbeatka@gmail.com') {
          parsed.recipientEmail = '';
        }
        delete parsed.inspectorSignature;
        delete parsed.clientSignature;
        if (parsed.general.contractNumber === undefined) {
          parsed.general.contractNumber = '';
        }
        if (parsed.general.wodKanStatus === undefined) {
          parsed.general.wodKanStatus = '';
        }
        if (parsed.general.wodKanWkucie === undefined) {
          parsed.general.wodKanWkucie = '';
        }
        if (Array.isArray(parsed.items)) {
          const existingIds = new Set(parsed.items.map((i: any) => i.id));
          DEFAULT_CHECKLIST_ITEMS.forEach((defItem) => {
            if (!existingIds.has(defItem.id)) {
              parsed.items.push({
                ...defItem,
                value: 'brak uwag',
                status: 'ok',
                notes: '',
                photos: [],
                defects: [],
              });
            }
          });

          // Keep canonical order from DEFAULT_CHECKLIST_ITEMS
          parsed.items.sort((a: any, b: any) => {
            const idxA = DEFAULT_CHECKLIST_ITEMS.findIndex((d) => d.id === a.id);
            const idxB = DEFAULT_CHECKLIST_ITEMS.findIndex((d) => d.id === b.id);
            return (idxA >= 0 ? idxA : 999) - (idxB >= 0 ? idxB : 999);
          });

          parsed.items = parsed.items.map((item: any) => {
            const defItem = DEFAULT_CHECKLIST_ITEMS.find((d) => d.id === item.id);
            if (defItem) {
              item.label = defItem.label;
            }
            if (!item.value || item.status === 'unfilled') {
              item.value = 'brak uwag';
              item.status = 'ok';
            }
            if (!item.defects) {
              if (item.status === 'defect' && item.value && item.value !== 'ok' && item.value !== 'bez uwag' && item.value !== 'brak uwag') {
                item.defects = [item.value];
              } else {
                item.defects = [];
              }
            }
            return item;
          });
        }
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error loading draft from localStorage', e);
  }
  // Default to clean empty report
  return createEmptyReport();
}

export function saveCurrentDraft(report: InspectionReport): void {
  try {
    const updated = {
      ...report,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(DRAFT_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Error saving draft to localStorage', e);
  }
}

export function getSavedReports(): InspectionReport[] {
  try {
    const raw = localStorage.getItem(REPORTS_LIST_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Error loading saved reports', e);
  }
  return [];
}

export function saveReportToHistory(report: InspectionReport): void {
  try {
    const list = getSavedReports();
    const existingIdx = list.findIndex((r) => r.id === report.id);
    const toSave = { ...report, updatedAt: new Date().toISOString() };
    if (existingIdx >= 0) {
      list[existingIdx] = toSave;
    } else {
      list.unshift(toSave);
    }
    localStorage.setItem(REPORTS_LIST_KEY, JSON.stringify(list));
  } catch (e) {
    console.error('Error saving report to history', e);
  }
}

export function deleteReportFromHistory(id: string): void {
  try {
    const list = getSavedReports().filter((r) => r.id !== id);
    localStorage.setItem(REPORTS_LIST_KEY, JSON.stringify(list));
  } catch (e) {
    console.error('Error deleting report from history', e);
  }
}
