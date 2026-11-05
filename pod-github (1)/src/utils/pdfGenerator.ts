import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { InspectionReport } from '../types/report';
import { getReportFileName, generateEmailSubject, generateEmailBody, generateMailtoUrl } from './reportLogic';

export interface GeneratePdfOptions {
  fileName?: string;
}

/**
 * Converts OKLCH color values to standard RGB [0-255].
 * Tailwind CSS v4 compiles color utilities to CSS oklch(...) which html2canvas 1.4 cannot parse.
 */
function oklchToRgb(l: number, c: number, h: number): [number, number, number] {
  const rad = ((h || 0) * Math.PI) / 180;
  const a = c * Math.cos(rad);
  const b = c * Math.sin(rad);

  const l_ = Math.pow(l + 0.3963377774 * a + 0.2158037573 * b, 3);
  const m_ = Math.pow(l - 0.1055613458 * a - 0.0638541728 * b, 3);
  const s_ = Math.pow(l - 0.0894841775 * a - 1.291485548 * b, 3);

  const rLin = +4.0767434772 * l_ - 3.3077115913 * m_ + 0.2309699292 * s_;
  const gLin = -1.2684380046 * l_ + 2.6097574011 * m_ - 0.3413193965 * s_;
  const bLin = -0.0041960863 * l_ - 0.7034186147 * m_ + 1.707614701 * s_;

  const toSrgb = (x: number) => {
    const clamped = Math.max(0, Math.min(1, x));
    return clamped <= 0.0031308
      ? Math.round(255 * (12.92 * clamped))
      : Math.round(255 * (1.055 * Math.pow(clamped, 1 / 2.4) - 0.055));
  };

  return [toSrgb(rLin), toSrgb(gLin), toSrgb(bLin)];
}

export function replaceOklchWithRgb(css: string): string {
  if (!css || !css.includes('oklch')) return css;
  return css.replace(
    /oklch\(\s*([\d.]+%?)\s+([\d.]+%?)\s+([\d.]+(?:deg|rad|turn)?)(?:\s*(?:\/|,)\s*([\d.]+%?))?\s*\)/gi,
    (_match, lStr, cStr, hStr, aStr) => {
      let l = lStr.endsWith('%') ? parseFloat(lStr) / 100 : parseFloat(lStr);
      let c = cStr.endsWith('%') ? (parseFloat(cStr) / 100) * 0.4 : parseFloat(cStr);
      let h = parseFloat(hStr);
      if (hStr.endsWith('rad')) h = (h * 180) / Math.PI;
      else if (hStr.endsWith('turn')) h = h * 360;
      let alpha = 1;
      if (aStr) {
        alpha = aStr.endsWith('%') ? parseFloat(aStr) / 100 : parseFloat(aStr);
      }
      const [r, g, b] = oklchToRgb(l, c, h);
      return alpha < 1
        ? `rgba(${r}, ${g}, ${b}, ${alpha})`
        : `rgb(${r}, ${g}, ${b})`;
    }
  );
}

/**
 * Renders the offscreen or hidden DOM pages into a multi-page PDF Blob.
 */
export async function generatePdfBlobFromPages(pageElements: HTMLElement[]): Promise<Blob> {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 210;
  const pageHeight = 297;

  for (let i = 0; i < pageElements.length; i++) {
    const pageEl = pageElements[i];

    // Create high-res canvas (scale 2 for crisp vector-like text)
    const canvas = await html2canvas(pageEl, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: 794, // Standard A4 at 96 DPI
      windowHeight: 1123,
      onclone: (clonedDoc: Document, clonedEl: HTMLElement) => {
        // 1. Ensure root elements have solid standard background and text color
        clonedDoc.documentElement.style.backgroundColor = '#ffffff';
        clonedDoc.documentElement.style.color = '#000000';
        if (clonedDoc.body) {
          clonedDoc.body.style.backgroundColor = '#ffffff';
          clonedDoc.body.style.color = '#000000';
        }

        // 2. Sanitize all stylesheet / <style> blocks in the cloned DOM to replace oklch with rgb
        const styles = clonedDoc.querySelectorAll('style');
        styles.forEach((styleTag) => {
          if (styleTag.textContent && styleTag.textContent.includes('oklch')) {
            styleTag.textContent = replaceOklchWithRgb(styleTag.textContent);
          }
        });

        // 3. Make sure cloned element itself is visible and opaque with white background
        clonedEl.style.backgroundColor = '#ffffff';
        clonedEl.style.color = '#000000';
        clonedEl.style.opacity = '1';
        clonedEl.style.transform = 'none';

        // 4. Inspect child elements and override any residual oklch computed values with rgb
        const win = clonedDoc.defaultView || window;
        const allNodes = clonedEl.querySelectorAll<HTMLElement>('*');
        allNodes.forEach((node) => {
          const cs = win.getComputedStyle(node);
          for (const prop of ['color', 'backgroundColor', 'borderColor', 'outlineColor']) {
            const val = cs.getPropertyValue(prop);
            if (val && val.includes('oklch')) {
              node.style.setProperty(prop, replaceOklchWithRgb(val), 'important');
            }
          }
        });
      },
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.95);

    if (i > 0) {
      pdf.addPage('a4', 'portrait');
    }

    pdf.addImage(imgData, 'JPEG', 0, 0, pageWidth, pageHeight);
  }

  return pdf.output('blob');
}

/**
 * Triggers download of generated PDF Blob.
 */
export function downloadPdfBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 500);
}

/**
 * Uses Web Share API (Android Native Share sheet) to directly share PDF file to Gmail, WhatsApp, Drive, etc.
 * Returns 'shared' if successful, 'canceled' if user dismissed the sheet, or 'unsupported' if not supported.
 */
export async function sharePdfFile(
  blob: Blob,
  filename: string,
  title: string,
  text: string
): Promise<'shared' | 'canceled' | 'unsupported'> {
  if (typeof navigator !== 'undefined' && navigator.canShare) {
    try {
      const file = new File([blob], filename, { type: 'application/pdf' });
      if (navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title,
          text,
        });
        return 'shared';
      }
    } catch (err: any) {
      if (err?.name === 'AbortError') {
        return 'canceled';
      }
      console.warn('Native file share failed:', err);
    }
  }

  // Fallback: try sharing title & text if text sharing is supported
  if (typeof navigator !== 'undefined' && navigator.share) {
    try {
      await navigator.share({
        title,
        text,
      });
      return 'shared';
    } catch (err: any) {
      if (err?.name === 'AbortError') {
        return 'canceled';
      }
      console.warn('Native text share failed:', err);
    }
  }

  return 'unsupported';
}

/**
 * Opens email client with mailto: link prefilled with recipient and subject (no body or stats).
 */
export function openMailto(report: InspectionReport, customEmail?: string, includeBody: boolean = false): void {
  const mailtoUrl = generateMailtoUrl(report, customEmail, includeBody);
  const link = document.createElement('a');
  link.href = mailtoUrl;
  link.target = '_self';
  document.body.appendChild(link);
  link.click();
  setTimeout(() => {
    document.body.removeChild(link);
  }, 300);
}
