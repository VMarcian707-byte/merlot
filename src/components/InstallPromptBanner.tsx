import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Smartphone } from 'lucide-react';

// Evenimentul beforeinstallprompt nu este în tipurile DOM standard — îl declarăm aici.
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const DISMISS_KEY = 'merlot_install_dismissed_v1';
const DISMISS_MS = 3 * 24 * 60 * 60 * 1000; // 3 zile

function isStandalone(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    // @ts-expect-error - Safari iOS
    window.navigator.standalone === true
  );
}

function isIOS(): boolean {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}

export default function InstallPromptBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showIOSHint, setShowIOSHint] = useState(false);
  const [visible, setVisible] = useState(false);
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    if (isStandalone()) return; // deja instalată

    let dismissedAt: number | null = null;
    try {
      dismissedAt = Number(localStorage.getItem(DISMISS_KEY));
    } catch { /* ignore */ }
    if (dismissedAt && Date.now() - dismissedAt < DISMISS_MS) return;

    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setVisible(true);
    };
    window.addEventListener('beforeinstallprompt', onBeforeInstall);

    // Fallback iOS: Chrome Android afisează banner-ul nativ doar prin beforeinstallprompt;
    // pe iPhone evenimentul nu există, deci arătăm instrucțiuni "Add to Home Screen".
    const onAppInstalled = () => setVisible(false);
    window.addEventListener('appinstalled', onAppInstalled);

    const iosTimer = window.setTimeout(() => {
      if (isIOS() && !document.referrer.includes('android-app://')) {
        setShowIOSHint(true);
        setVisible(true);
      }
    }, 2500);

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall);
      window.removeEventListener('appinstalled', onAppInstalled);
      clearTimeout(iosTimer);
    };
  }, []);

  const dismiss = () => {
    setVisible(false);
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch { /* ignore */ }
  };

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    setInstalling(true);
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    setInstalling(false);
    if (outcome === 'accepted') {
      setVisible(false);
      setDeferredPrompt(null);
    }
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 120, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 120, opacity: 0 }}
          transition={{ type: 'spring', damping: 22, stiffness: 260 }}
          className="fixed bottom-4 left-4 right-4 z-[9999] mx-auto max-w-md"
        >
          <div className="relative overflow-hidden rounded-2xl border border-[#D4AF37]/40 bg-gradient-to-br from-[#1a0f13] to-[#0a0608] p-4 shadow-2xl shadow-black/60">
            <button
              onClick={dismiss}
              aria-label="Închide"
              className="absolute right-3 top-3 rounded-full p-1 text-white/40 transition hover:bg-white/10 hover:text-white"
            >
              <X size={16} />
            </button>

            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#722F37] shadow-lg">
                <Smartphone className="h-6 w-6 text-[#D4AF37]" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-display text-base font-semibold text-white">
                  Instalează Merlot VIP
                </p>
                {deferredPrompt ? (
                  <p className="mt-0.5 text-xs leading-relaxed text-white/60">
                    Adaugă aplicația pe telefon pentru acces instant și scanare NFC direct din ecranul principal.
                  </p>
                ) : showIOSHint ? (
                  <p className="mt-0.5 text-xs leading-relaxed text-white/60">
                    Pe iPhone: apasă butonul <span className="font-semibold text-[#D4AF37]">Share</span> (pătrățel cu săgeată ↑) din Safari, apoi{' '}
                    <span className="font-semibold text-[#D4AF37]">„Add to Home Screen"</span>.
                  </p>
                ) : null}

                {deferredPrompt && (
                  <button
                    onClick={handleInstall}
                    disabled={installing}
                    className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-[#D4AF37] px-4 py-2.5 text-sm font-bold text-[#0a0608] transition active:scale-[0.98] disabled:opacity-60"
                  >
                    <Download size={16} />
                    {installing ? 'Se instalează...' : 'Instalează acum'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
