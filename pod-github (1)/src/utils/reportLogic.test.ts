import test from 'node:test';
import assert from 'node:assert/strict';
import {
  deriveStatusFromValue,
  calculateReportStats,
  generateEmailSubject,
  generateEmailBody,
  generateMailtoUrl,
  getReportFileName,
  formatDefectsList,
} from './reportLogic';
import { createSampleReportFromAttachment, createEmptyReport } from '../types/report';

test('deriveStatusFromValue categorizes values correctly', () => {
  assert.equal(deriveStatusFromValue('ok'), 'ok');
  assert.equal(deriveStatusFromValue('OK'), 'ok');
  assert.equal(deriveStatusFromValue('bez uwag'), 'ok');
  assert.equal(deriveStatusFromValue('brak uwag'), 'ok');
  assert.equal(deriveStatusFromValue('zgodne'), 'ok');
  assert.equal(deriveStatusFromValue('nie dotyczy'), 'na');
  assert.equal(deriveStatusFromValue('brak'), 'na');
  assert.equal(deriveStatusFromValue('brak miejsca'), 'na');
  assert.equal(deriveStatusFromValue('rysy salon'), 'defect');
  assert.equal(deriveStatusFromValue('brak kata Łazienka'), 'defect');
  assert.equal(deriveStatusFromValue(''), 'unfilled');
});

test('formatDefectsList formats single and multiple numbered defects', () => {
  assert.equal(formatDefectsList([]), '');
  assert.equal(formatDefectsList(['brak kąta']), 'brak kąta');
  assert.equal(formatDefectsList(['brak kąta', 'pęknięcie tynku']), '1. brak kąta; 2. pęknięcie tynku');
});

test('calculateReportStats calculates metrics for sample report matching attachment', () => {
  const sample = createSampleReportFromAttachment();
  const stats = calculateReportStats(sample.items);

  assert.equal(stats.total, 23);
  assert.equal(stats.filled, 23);
  assert.equal(stats.percentComplete, 100);
  // From attachment:
  // Defects:
  // 1. Kąty w narożnikach ścian: brak kata Łazienka
  // 2. Ocena wizualna wylewki: rysy salon
  // 3. Wod-kan - rozprowadzenie: rozp. brak wkucia
  // 4. Balustrada: rysy lewa strona
  assert.equal(stats.defectCount, 4);
  assert.equal(stats.okCount, 19);
});

test('calculateReportStats handles newly opened report with default brak uwag on all points', () => {
  const empty = createEmptyReport();
  const stats = calculateReportStats(empty.items);

  assert.equal(stats.total, 23);
  assert.equal(stats.filled, 23);
  assert.equal(stats.percentComplete, 100);
  assert.equal(stats.okCount, 23);
  assert.equal(stats.defectCount, 0);
  assert.equal(stats.unfilledCount, 0);

  // Verify that every point defaults to 'brak uwag' and status 'ok'
  empty.items.forEach((item) => {
    assert.equal(item.value, 'brak uwag');
    assert.equal(item.status, 'ok');
    assert.deepEqual(item.defects, []);
  });
});

test('generateEmailSubject creates descriptive subject with address and client', () => {
  const sample = createSampleReportFromAttachment();
  const subject = generateEmailSubject(sample);
  assert.match(subject, /stoleczna/i);
  assert.match(subject, /Kamil Sot/);
});

test('generateEmailBody includes defects list and inspector signature name', () => {
  const sample = createSampleReportFromAttachment();
  const body = generateEmailBody(sample);

  assert.match(body, /PODSUMOWANIE ODBIORU/);
  assert.match(body, /Kamil Sot/);
  assert.match(body, /brak kata Łazienka/);
  assert.match(body, /rysy salon/);
  assert.match(body, /Kamil Sot \(Inspektor\)/);
});

test('getReportFileName formats clean filename', () => {
  const sample = createSampleReportFromAttachment();
  const fileName = getReportFileName(sample);
  assert.match(fileName, /^Raport_Odbioru_stoleczna/);
  assert.match(fileName, /\.pdf$/);
});

test('generateEmailBody defaults to Koordynator signoff when inspectorName is empty', () => {
  const empty = createEmptyReport();
  const body = generateEmailBody(empty);
  assert.match(body, /Z poważaniem,\nKoordynator/);
});

test('item 16 in checklist is labeled exactly Wod-kan', () => {
  const empty = createEmptyReport();
  const item16 = empty.items.find((i) => i.id === 'wod_kan_rozprowadzenie');
  assert.ok(item16, 'Item 16 should exist');
  assert.equal(item16.label, 'Wod-kan');
  assert.equal(item16.label.includes('rozprowadzenie'), false);
});

test('GeneralInfo supports wodKanStatus and wodKanWkucie values', () => {
  const empty = createEmptyReport();
  assert.equal(empty.general.wodKanStatus, '');
  assert.equal(empty.general.wodKanWkucie, '');

  const sample = createSampleReportFromAttachment();
  assert.equal(sample.general.wodKanStatus, 'rozprowadzone');
  assert.equal(sample.general.wodKanWkucie, 'brak wkucia');
});

test('GeneralInfo supports contractNumber (Numer umowy)', () => {
  const empty = createEmptyReport();
  assert.equal(empty.general.contractNumber, '');

  const sample = createSampleReportFromAttachment();
  sample.general.contractNumber = 'UM/2026/05/123';
  assert.equal(sample.general.contractNumber, 'UM/2026/05/123');
});

test('generateMailtoUrl creates mailto link without body or statistics by default', () => {
  const sample = createSampleReportFromAttachment();
  const url = generateMailtoUrl(sample, 'deweloper@budimex.pl');

  assert.equal(url.startsWith('mailto:deweloper@budimex.pl?subject='), true);
  // Verify body is NOT present
  assert.equal(url.includes('&body='), false);
  // Verify report stats/content are NOT present
  assert.equal(url.includes('PODSUMOWANIE'), false);
  assert.equal(url.includes('Skontrolowano'), false);
  assert.equal(url.includes('Usterki'), false);
});

test('generateMailtoUrl uses report recipientEmail when customEmail is omitted', () => {
  const sample = createSampleReportFromAttachment();
  sample.recipientEmail = 'kontakt@deweloper.com';
  const url = generateMailtoUrl(sample);

  assert.equal(url.startsWith('mailto:kontakt@deweloper.com?subject='), true);
  assert.equal(url.includes('&body='), false);
});

