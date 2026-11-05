export interface ChecklistItem {
  id: string;
  label: string;
  category: 'wspolne' | 'balkon' | 'miejsce_postojowe' | 'inne';
  value: string; // e.g. "ok", "brak kata Łazienka", "rysy salon", etc.
  status: 'ok' | 'defect' | 'na' | 'unfilled';
  quickSuggestions?: string[];
  notes?: string;
  photos?: string[]; // base64 or blob URLs
  defects?: string[]; // array of confirmed numbered defects
}

export interface GeneralInfo {
  clientName: string; // Imię i nazwisko
  address: string; // Adres lokalu
  contractNumber?: string; // Numer umowy
  dateTime: string; // Data i godzina
  electricityPresent: string; // Obecność prądu w lokalu (tak, nie)
  wallsPlasterRaw: string; // Ściany tynkowane / surowe ('tynkowane' | 'surowe')
  plasterType: string; // Kategoria / rodzaj tynku ('tynk gipsowy' | 'tynk cementowy')
  apartmentPainted: string; // Lokal pomalowany ('tak farba' | 'tak grunt' | 'nie, tynk surowy')
  plasterCategoryPainted?: string; // backwards compatibility
  expansionJointAcrylic: string; // Akrylowanie dylatacji (np. nie, tak)
  puttyNeeded: string; // Konieczność gładzi ('tak' | 'nie')
  primingNeeded: string; // Konieczność gruntowania ('tak' | 'nie')
  puttyPrimingNeeded?: string; // backwards compatibility
  underfloorHeating: string; // Ogrzewanie podłogowe (np. nie, tak)
  emptySpaceInFuseBox: string; // Puste miejsce w rozdzielni ('tak' | 'nie')
  wodKanStatus: string; // Wod-kan ('rozprowadzone' | 'brak rozprowadzenia' | '')
  wodKanWkucie: string; // Wod-kan wkucie ('wkute' | 'brak wkucia' | '')
}

export interface InspectionReport {
  id: string;
  createdAt: string;
  updatedAt: string;
  general: GeneralInfo;
  items: ChecklistItem[];
  otherRemarks: string; // Inne: brak / opis
  inspectorName?: string;
  recipientEmail?: string;
}

export const DEFAULT_CHECKLIST_ITEMS: Omit<ChecklistItem, 'value' | 'status' | 'photos' | 'notes'>[] = [
  // Punkty kontrolne wspólne
  {
    id: 'plaszczyzna_scian',
    category: 'wspolne',
    label: 'Płaszczyzna ścian',
  },
  {
    id: 'katy_w_naroznikach',
    category: 'wspolne',
    label: 'Kąty w narożnikach ścian',
  },
  {
    id: 'poziom_sufitu',
    category: 'wspolne',
    label: 'Poziom sufitu',
  },
  {
    id: 'ocena_scian_sufitow',
    category: 'wspolne',
    label: 'Ocena wizualna ścian i sufitów (rysy, wilgoć)',
  },
  {
    id: 'malowanie_farba',
    category: 'wspolne',
    label: 'Malowanie - przyczepność farby',
  },
  {
    id: 'poziom_wylewki',
    category: 'wspolne',
    label: 'Poziom wylewki',
  },
  {
    id: 'dylatacja_wylewki',
    category: 'wspolne',
    label: 'Dylatacja wylewki (obwodowa, w wejściu)',
  },
  {
    id: 'ocena_wylewki',
    category: 'wspolne',
    label: 'Ocena wizualna wylewki (rysy, wilgoć, mleczko na powierzchni)',
  },
  {
    id: 'glif_drzwiowy',
    category: 'wspolne',
    label: 'Szerokość i wysokość glifu drzwiowego - równość, wysokość do montażu',
  },
  {
    id: 'grzejniki_glowice',
    category: 'wspolne',
    label: 'Grzejniki + głowice (uszkodzenia)',
  },
  {
    id: 'okno_ocena_wizualna',
    category: 'wspolne',
    label: 'Okno - ocena wizualna (uszczelki, rama, szyba), mechanizmy',
  },
  {
    id: 'okno_pionowosc',
    category: 'wspolne',
    label: 'Okno - pionowość montażu',
  },
  {
    id: 'okno_glif_apu',
    category: 'wspolne',
    label: 'Okno - płaszczyzna glifu, listwy APU',
  },
  {
    id: 'okno_parapety_balustrada',
    category: 'wspolne',
    label: 'Okno - parapety zewnętrzne, balustrada portfenetr',
  },
  {
    id: 'instalacje_kuchnia_lazienka',
    category: 'wspolne',
    label: 'Instalacje w kuchni, łazience, pralni',
  },
  {
    id: 'wod_kan_rozprowadzenie',
    category: 'wspolne',
    label: 'Wod-kan',
  },
  {
    id: 'elektryka_gniazda_ip',
    category: 'wspolne',
    label: 'Elektryka - gniazda IP',
  },
  {
    id: 'wentylacja_kratka',
    category: 'wspolne',
    label: 'Wentylacja - montaż kratki / heliosa',
  },

  // Balkon / taras
  {
    id: 'balkon_poziom_posadzki',
    category: 'balkon',
    label: 'Poziom posadzki',
    quickSuggestions: ['ok', 'odchyłka od poziomu', 'brak spadku na zewnątrz', 'zastoiny wody', 'nie dotyczy'],
  },
  {
    id: 'balkon_plytki_fugi',
    category: 'balkon',
    label: 'Ocena wizualna płytek, fug',
    quickSuggestions: ['ok', 'głuche płytki', 'wykruszona fuga', 'brak spadku w stronę rynny', 'nie dotyczy'],
  },
  {
    id: 'balkon_balustrada',
    category: 'balkon',
    label: 'Balustrada',
    quickSuggestions: ['ok', 'rysy lewa strona', 'odprysk lakieru proszkowego', 'luz w kotwieniu do płyty'],
  },
  {
    id: 'balkon_elektryka',
    category: 'balkon',
    label: 'Elektryka',
    quickSuggestions: ['ok', 'brak oprawy hermetycznej IP', 'brak wyprowadzenia przewodu', 'nie dotyczy'],
  },

  // Miejsce postojowe
  {
    id: 'miejsce_postojowe',
    category: 'miejsce_postojowe',
    label: 'Miejsce postojowe',
    quickSuggestions: ['brak miejsca', 'brak uwag'],
  },
];

export function createEmptyReport(): InspectionReport {
  const now = new Date();
  const pad = (n: number) => n.toString().padStart(2, '0');
  const formattedDateTime = `${pad(now.getDate())}.${pad(now.getMonth() + 1)}.${now.getFullYear()} ${pad(now.getHours())}.${pad(now.getMinutes())}`;

  return {
    id: `rep_${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    general: {
      clientName: '',
      address: '',
      contractNumber: '',
      dateTime: '',
      electricityPresent: 'nie',
      wallsPlasterRaw: 'tynkowane',
      plasterType: 'tynk gipsowy',
      apartmentPainted: 'tak farba',
      expansionJointAcrylic: 'nie',
      puttyNeeded: 'tak',
      primingNeeded: 'tak',
      underfloorHeating: 'nie',
      emptySpaceInFuseBox: 'tak',
      wodKanStatus: '',
      wodKanWkucie: '',
    },
    items: DEFAULT_CHECKLIST_ITEMS.map((item) => ({
      ...item,
      value: 'brak uwag',
      status: 'ok',
      notes: '',
      photos: [],
      defects: [],
    })),
    otherRemarks: '',
    inspectorName: '',
    recipientEmail: '',
  };
}

export function createSampleReportFromAttachment(): InspectionReport {
  return {
    id: `rep_sample_attachment`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    general: {
      clientName: 'Kamil Sot',
      address: 'stoleczna',
      contractNumber: '',
      dateTime: '05.05.2026 12.00',
      electricityPresent: 'nie',
      wallsPlasterRaw: 'tynkowane',
      plasterType: 'tynk gipsowy',
      apartmentPainted: 'tak farba',
      expansionJointAcrylic: 'nie',
      puttyNeeded: 'tak',
      primingNeeded: 'tak',
      underfloorHeating: 'nie',
      emptySpaceInFuseBox: 'tak',
      wodKanStatus: 'rozprowadzone',
      wodKanWkucie: 'brak wkucia',
    },
    items: [
      {
        id: 'plaszczyzna_scian',
        category: 'wspolne',
        label: 'Płaszczyzna ścian',
        value: 'ok',
        status: 'ok',
        quickSuggestions: ['ok', 'nierówności', 'do poprawy'],
      },
      {
        id: 'katy_w_naroznikach',
        category: 'wspolne',
        label: 'Kąty w narożnikach ścian',
        value: 'brak kata Łazienka',
        status: 'defect',
        quickSuggestions: ['ok', 'brak kąta Łazienka', 'brak kąta Kuchnia'],
      },
      {
        id: 'poziom_sufitu',
        category: 'wspolne',
        label: 'Poziom sufitu',
        value: 'ok',
        status: 'ok',
        quickSuggestions: ['ok', 'odchyłka od poziomu'],
      },
      {
        id: 'ocena_scian_sufitow',
        category: 'wspolne',
        label: 'Ocena wizualna ścian i sufitów (rysy, wilgoć)',
        value: 'ok',
        status: 'ok',
        quickSuggestions: ['ok', 'rysy salon', 'wilgoć'],
      },
      {
        id: 'malowanie_farba',
        category: 'wspolne',
        label: 'Malowanie - przyczepność farby',
        value: 'ok',
        status: 'ok',
        quickSuggestions: ['ok', 'odparzenia farby'],
      },
      {
        id: 'poziom_wylewki',
        category: 'wspolne',
        label: 'Poziom wylewki',
        value: 'ok',
        status: 'ok',
        quickSuggestions: ['ok', 'odchyłka'],
      },
      {
        id: 'dylatacja_wylewki',
        category: 'wspolne',
        label: 'Dylatacja wylewki (obwodowa, w wejściu)',
        value: 'ok',
        status: 'ok',
        quickSuggestions: ['ok', 'brak dylatacji obwodowej'],
      },
      {
        id: 'ocena_wylewki',
        category: 'wspolne',
        label: 'Ocena wizualna wylewki (rysy, wilgoć, mleczko na powierzchni)',
        value: 'rysy salon',
        status: 'defect',
        quickSuggestions: ['ok', 'rysy salon', 'mleczko cementowe'],
      },
      {
        id: 'glif_drzwiowy',
        category: 'wspolne',
        label: 'Szerokość i wysokość glifu drzwiowego - równość, wysokość do montażu',
        value: 'ok',
        status: 'ok',
        quickSuggestions: ['ok', 'za wąski otwór'],
      },
      {
        id: 'grzejniki_glowice',
        category: 'wspolne',
        label: 'Grzejniki + głowice (uszkodzenia)',
        value: 'ok',
        status: 'ok',
        quickSuggestions: ['ok', 'brak głowic'],
      },
      {
        id: 'okno_ocena_wizualna',
        category: 'wspolne',
        label: 'Okno - ocena wizualna (uszczelki, rama, szyba), mechanizmy',
        value: 'ok',
        status: 'ok',
        quickSuggestions: ['ok', 'rysa na szybie'],
      },
      {
        id: 'okno_pionowosc',
        category: 'wspolne',
        label: 'Okno - pionowość montażu',
        value: 'ok',
        status: 'ok',
        quickSuggestions: ['ok', 'odchyłka pionu'],
      },
      {
        id: 'okno_glif_apu',
        category: 'wspolne',
        label: 'Okno - płaszczyzna glifu, listwy APU',
        value: 'ok',
        status: 'ok',
        quickSuggestions: ['ok', 'brak listwy APU'],
      },
      {
        id: 'okno_parapety_balustrada',
        category: 'wspolne',
        label: 'Okno - parapety zewnętrzne, balustrada portfenetr',
        value: 'ok',
        status: 'ok',
        quickSuggestions: ['ok', 'spadek odwrotny'],
      },
      {
        id: 'instalacje_kuchnia_lazienka',
        category: 'wspolne',
        label: 'Instalacje w kuchni, łazience, pralni',
        value: 'ok',
        status: 'ok',
        quickSuggestions: ['ok', 'brak podejścia'],
      },
      {
        id: 'wod_kan_rozprowadzenie',
        category: 'wspolne',
        label: 'Wod-kan',
        value: 'rozp. brak wkucia',
        status: 'defect',
        quickSuggestions: ['ok', 'rozp. brak wkucia'],
      },
      {
        id: 'elektryka_gniazda_ip',
        category: 'wspolne',
        label: 'Elektryka - gniazda IP',
        value: 'ok',
        status: 'ok',
        quickSuggestions: ['ok', 'brak gniazda IP'],
      },
      {
        id: 'wentylacja_kratka',
        category: 'wspolne',
        label: 'Wentylacja - montaż kratki / heliosa',
        value: 'ok',
        status: 'ok',
        quickSuggestions: ['ok', 'brak kratki'],
      },
      {
        id: 'balkon_poziom_posadzki',
        category: 'balkon',
        label: 'Poziom posadzki',
        value: 'ok',
        status: 'ok',
        quickSuggestions: ['ok', 'odchyłka od poziomu'],
        defects: [],
      },
      {
        id: 'balkon_plytki_fugi',
        category: 'balkon',
        label: 'Ocena wizualna płytek, fug',
        value: 'ok',
        status: 'ok',
        quickSuggestions: ['ok', 'pęknięta płytka'],
      },
      {
        id: 'balkon_balustrada',
        category: 'balkon',
        label: 'Balustrada',
        value: 'rysy lewa strona',
        status: 'defect',
        quickSuggestions: ['ok', 'rysy lewa strona'],
      },
      {
        id: 'balkon_elektryka',
        category: 'balkon',
        label: 'Elektryka',
        value: 'ok',
        status: 'ok',
        quickSuggestions: ['ok', 'brak oprawy'],
      },
      {
        id: 'miejsce_postojowe',
        category: 'miejsce_postojowe',
        label: 'Miejsce postojowe',
        value: 'brak uwag',
        status: 'ok',
        quickSuggestions: ['brak miejsca', 'brak uwag'],
        defects: [],
      },
    ],
    otherRemarks: 'brak',
    inspectorName: 'Kamil Sot (Inspektor)',
    recipientEmail: 'disneymateuszbeatka@gmail.com',
  };
}
