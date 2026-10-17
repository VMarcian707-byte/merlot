// ============================================
// SCANNER QR — FALLBACK iOS pentru carduri VIP
// Web NFC (NDEFReader) NU există pe iPhone/Safari;
// camera + BarcodeDetector (Safari 17+) sau jsQR (orice browser) preia
// același cod de pe cardul fizic → pipeline identic cu NFC (anti-fraud server-side).
// ============================================

export function isIOS(): boolean {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}

export function hasWebNFC(): boolean {
  return 'NDEFReader' in window;
}

/// Barmanul folosește un dispozitiv Apple → NFC fizic imposibil → activăm opțiunea QR
export function shouldOfferQrFallback(): boolean {
  return !hasWebNFC() && isIOS();
}

export function hasCameraSupport(): boolean {
  return typeof navigator !== 'undefined' &&
    !!navigator.mediaDevices &&
    typeof navigator.mediaDevices.getUserMedia === 'function';
}

// jsQR (fără dependențe în bundle — se încarcă on-demand din CDN, doar când barmanul
// deschide scannerul QR și browserul nu are BarcodeDetector nativ)
const JSQR_CDN = 'https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.js';
let jsqrLoadPromise: Promise<boolean> | null = null;

function ensureJsQR(): Promise<boolean> {
  if (typeof (window as any).jsQR === 'function') return Promise.resolve(true);
  if (!jsqrLoadPromise) {
    jsqrLoadPromise = new Promise<boolean>((resolve) => {
      const script = document.createElement('script');
      script.src = JSQR_CDN;
      script.async = true;
      script.onload = () => resolve(typeof (window as any).jsQR === 'function');
      script.onerror = () => { jsqrLoadPromise = null; resolve(false); };
      document.head.appendChild(script);
    });
  }
  return jsqrLoadPromise;
}

export interface QrScanHandle {
  stop: () => void;
}

/**
 * Pornește camera spate și detectează coduri QR.
 * Folosește BarcodeDetector nativ (Safari 17+ / Chrome) sau jsQR ca fallback.
 */
export async function startQrScanner(
  videoEl: HTMLVideoElement,
  onDetected: (text: string) => void,
  onError?: (err: Error) => void
): Promise<QrScanHandle> {
  let stream: MediaStream | null = null;
  let rafId = 0;
  let stopped = false;
  let lastResultAt = 0;

  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { ideal: 'environment' } },
      audio: false,
    });
  } catch (e: any) {
    onError?.(new Error(e?.name === 'NotAllowedError'
      ? 'Acces la cameră refuzat. Permite camera în setările browserului.'
      : 'Nu am putut accesa camera. Verifică permisiunile HTTPS.'));
    return { stop: () => {} };
  }

  videoEl.srcObject = stream;
  videoEl.setAttribute('playsinline', 'true'); // critic pe iOS — fără, camera se deschide fullscreen
  try { await videoEl.play(); } catch { /* autoplay handled by user gesture */ }

  const Detector = (window as any).BarcodeDetector;
  let detector: any = null;
  let useJsQR = false;

  if (Detector) {
    try {
      const supported = await Detector.getSupportedFormats();
      if (supported.includes('qr_code')) {
        detector = new Detector({ formats: ['qr_code'] });
      }
    } catch { /* fall through to jsQR */ }
  }
  if (!detector) {
    useJsQR = await ensureJsQR();
    if (!useJsQR) {
      onError?.(new Error('Browserul nu suportă detectarea codurilor QR (BarcodeDetector/jsQR indisponibil).'));
      stream.getTracks().forEach(t => t.stop());
      return { stop: () => {} };
    }
  }

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!;

  const tick = async () => {
    if (stopped) return;
    if (videoEl.readyState === videoEl.HAVE_ENOUGH_DATA) {
      // Rezolvare la max ~640px — suficient pentru QR, rapid pe iPhone
      const scale = Math.min(1, 640 / (videoEl.videoWidth || 640));
      canvas.width = Math.floor((videoEl.videoWidth || 640) * scale);
      canvas.height = Math.floor((videoEl.videoHeight || 480) * scale);
      ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height);

      let text: string | null = null;
      if (detector) {
        try {
          const codes = await detector.detect(canvas);
          if (codes.length > 0) text = codes[0].rawValue;
        } catch { /* ignore frame errors */ }
      } else {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = (window as any).jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'dontInvert',
        });
        if (code?.data) text = code.data;
      }

      // Anti-ghosting: ignoră aceeași citire la <1.5s distanță
      if (text && Date.now() - lastResultAt > 1500) {
        lastResultAt = Date.now();
        onDetected(text.trim());
        return; // oprește bucla; apelantul decide dacă repornește
      }
    }
    rafId = requestAnimationFrame(tick);
  };
  rafId = requestAnimationFrame(tick);

  return {
    stop: () => {
      stopped = true;
      cancelAnimationFrame(rafId);
      stream?.getTracks().forEach(t => t.stop());
      videoEl.srcObject = null;
    },
  };
}

/// Conținutul tipărit pe cardul VIP (același format ca eticheta NFC NDEF)
export function extractCardUuid(qrText: string): string | null {
  const s = qrText.trim();
  if (!s) return null;
  const urlMatch = s.match(/\/c\/([^?#\/\s]+)/i);
  if (urlMatch) return urlMatch[1].toUpperCase();
  // UUID "gol" (ex. A1B2C3D4-E5F6-...) sau alt cod unic
  if (/^[A-Za-z0-9_-]{8,64}$/.test(s)) return s.toUpperCase();
  return null;
}
