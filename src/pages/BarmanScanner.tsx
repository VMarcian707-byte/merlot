import { useState, useEffect } from 'react';
import { useStore } from '../store';
import { LuxuryBackground, OrnamentDivider, GoldBadge, LuxuryCard, NoiseOverlay, LuxuryInput, LuxuryButton } from '../components/LuxuryUI';
import { ScanLine, Check, X, LogOut, Clock, Wifi, AlertTriangle, History, User, CreditCard, Sparkles, Shield, Activity } from 'lucide-react';
import { ScanResult } from '../types';

export default function BarmanScanner() {
  const { currentUser, logout, scanCard, nfcCards, visitsLog, users } = useStore();
  const [manualUuid, setManualUuid] = useState('');
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [nfcSupported, setNfcSupported] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    if ('NDEFReader' in window) {
      setNfcSupported(true);
    }
  }, []);

  if (!currentUser) return null;

  // Verifică dacă name este email și extrage numele real
  const isNameEmail = currentUser.name.includes('@');
  const displayName = isNameEmail 
    ? currentUser.email.split('@')[0].split('.').map(part => 
        part.charAt(0).toUpperCase() + part.slice(1)
      ).join(' ')
    : currentUser.name;

  const handleNFCSimulate = async (cardUuid: string) => {
    setScanning(true);
    setResult(null);
    setTimeout(async () => {
      const scanResult = await scanCard(cardUuid, currentUser.id);
      
      // Check and award badges if scan was successful
      if (scanResult.valid) {
        try {
          const { checkAndAwardBadges } = useStore.getState();
          const badgeResult = await checkAndAwardBadges(scanResult.client_name);
          if (badgeResult && badgeResult.new_badges && badgeResult.new_badges.length > 0) {
            // Add badge info to result
            scanResult.message += ` 🏆 ${badgeResult.new_badges.length} badge-uri noi câștigate!`;
          }
        } catch (error) {
          console.error('Error checking badges:', error);
        }
      }
      
      setResult(scanResult);
      setScanning(false);
    }, 1500);
  };

  const handleManualScan = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualUuid.trim()) {
      handleNFCSimulate(manualUuid.trim());
    }
  };

  const startNFCScan = async () => {
    if (!('NDEFReader' in window)) {
      alert('Web NFC nu este suportat. Folosește Chrome pe Android sau introdu UUID-ul manual.');
      return;
    }
    try {
      // @ts-ignore
      const ndef = new NDEFReader();
      setScanning(true);
      setResult(null);
      await ndef.scan();
      ndef.onreading = async (event: any) => {
        const record = event.message.records[0];
        if (record) {
          const decoder = new TextDecoder();
          const url = decoder.decode(record.data);
          const uuid = url.split('/c/')[1] || url;
          const scanResult = await scanCard(uuid, currentUser.id);
          setResult(scanResult);
          setScanning(false);
        }
      };
    } catch (err) {
      setScanning(false);
    }
  };

  const todayVisits = visitsLog.filter(v => {
    const today = new Date().toDateString();
    return new Date(v.scanned_at).toDateString() === today;
  });

  const recentVisits = [...visitsLog].reverse().slice(0, 10);

  return (
    <div className="min-h-screen min-h-[100dvh] relative">
      <LuxuryBackground />
      <NoiseOverlay />

      {/* Header */}
      <div className="relative z-10 glass-dark border-b border-white/[0.05]">
        <div className="px-5 py-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-accent text-[#D4AF37]/60 text-xs tracking-[0.3em] uppercase italic mb-1">
                Staff Access
              </p>
              <h1 className="font-display text-xl text-white">{displayName}</h1>
            </div>
            <div className="flex items-center gap-3">
              <div className="glass rounded-xl px-3 py-2 flex items-center gap-2">
                <Activity className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span className="text-xs text-white/60">
                  Azi: <span className="text-white font-semibold">{todayVisits.length}</span>
                </span>
              </div>
              <button 
                onClick={logout} 
                className="w-9 h-9 rounded-full glass flex items-center justify-center hover:border-[#D4AF37]/30 transition-all duration-300"
              >
                <LogOut className="w-4 h-4 text-white/40" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 p-5 space-y-5">
        {/* Scanner Zone */}
        <div className="card-luxury text-center animate-slide-up">
          <div className="mb-6">
            <p className="font-accent text-[#D4AF37]/60 text-xs tracking-[0.3em] uppercase italic mb-2">
              Verificare Card
            </p>
            <h2 className="font-display text-xl text-white">Scanare NFC</h2>
          </div>

          {/* Scanner Visual */}
          <div className="relative mx-auto w-32 h-32 mb-6">
            {/* Outer rings */}
            <div className={`absolute inset-0 rounded-full border border-[#D4AF37]/20 ${scanning ? 'animate-pulse-gold' : ''}`} />
            <div className={`absolute inset-[-8px] rounded-full border border-[#D4AF37]/10 ${scanning ? 'animate-ping' : ''}`} style={{ animationDuration: '2s' }} />
            <div className={`absolute inset-[-16px] rounded-full border border-[#D4AF37]/5 ${scanning ? 'animate-ping' : ''}`} style={{ animationDuration: '2.5s' }} />
            
            {/* Center icon */}
            <div className={`absolute inset-0 rounded-full flex items-center justify-center ${
              scanning 
                ? 'bg-gradient-to-br from-[#D4AF37]/20 to-[#722F37]/20' 
                : 'bg-white/[0.03]'
            } transition-all duration-500`}>
              {scanning ? (
                <Wifi className="w-10 h-10 text-[#D4AF37] animate-pulse" />
              ) : (
                <ScanLine className="w-10 h-10 text-white/30" />
              )}
            </div>
          </div>

          <p className="text-sm text-white/40 mb-6">
            {scanning ? (
              <span className="text-[#D4AF37]">Se citește cardul NFC...</span>
            ) : (
              'Apropie cardul de telefon sau introdu UUID-ul'
            )}
          </p>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-center mb-6">
            <button
              onClick={startNFCScan}
              disabled={scanning}
              className="btn-luxury flex items-center gap-2 disabled:opacity-50"
            >
              <Wifi className="w-4 h-4" />
              Scanare NFC
            </button>
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="px-5 py-3 rounded-xl glass text-white/60 hover:text-[#D4AF37] hover:border-[#D4AF37]/20 transition-all duration-300 flex items-center gap-2 text-sm"
            >
              <History className="w-4 h-4" />
              Istoric
            </button>
          </div>

          <OrnamentDivider className="mb-6" />

          {/* Manual UUID Input */}
          <form onSubmit={handleManualScan} className="text-left">
            <label className="block text-[10px] text-white/30 tracking-[0.2em] uppercase mb-2">
              Introducere Manuală UUID
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={manualUuid}
                onChange={e => setManualUuid(e.target.value)}
                placeholder="A1B2C3D4-E5F6-7890-..."
                className="input-luxury font-mono text-xs flex-1"
              />
              <button
                type="submit"
                disabled={!manualUuid.trim() || scanning}
                className="px-4 py-3 rounded-xl bg-gradient-to-r from-[#722F37] to-[#8B3A42] text-white text-sm font-medium hover:from-[#8B3A42] hover:to-[#722F37] transition-all disabled:opacity-50"
              >
                Verifică
              </button>
            </div>
          </form>

          {/* Quick Test Cards */}
          <div className="mt-6 pt-6 border-t border-white/5">
            <p className="text-[10px] text-white/20 tracking-[0.2em] uppercase mb-3">Test Rapid</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {nfcCards.filter(c => c.status === 'active').slice(0, 4).map(card => {
                const client = users.find(u => u.id === card.assigned_user_id);
                return (
                  <button
                    key={card.id}
                    onClick={() => handleNFCSimulate(card.card_uuid)}
                    disabled={scanning}
                    className="group flex items-center gap-2 px-3 py-2 rounded-xl glass hover:border-[#D4AF37]/30 hover:bg-[#D4AF37]/5 transition-all duration-300 disabled:opacity-50"
                  >
                    <span className="text-base">{client?.avatar}</span>
                    <span className="text-xs text-white/50 group-hover:text-[#D4AF37] transition-colors">
                      {client?.name?.split(' ')[0]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Scan Result */}
        {result && (
          <div className={`card-luxury animate-scale-in ${
            result.valid 
              ? 'border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-transparent' 
              : 'border-red-500/20 bg-gradient-to-br from-red-500/5 to-transparent'
          }`}>
            {/* Result header */}
            <div className="flex items-center gap-4 mb-6">
              <div className={`w-14 h-14 rounded-full flex items-center justify-center ${
                result.valid 
                  ? 'bg-gradient-to-br from-emerald-400/20 to-transparent' 
                  : 'bg-gradient-to-br from-red-400/20 to-transparent'
              }`}>
                {result.valid ? (
                  <Check className="w-7 h-7 text-emerald-400" />
                ) : (
                  <X className="w-7 h-7 text-red-400" />
                )}
              </div>
              <div>
                <p className={`font-display text-xl ${result.valid ? 'text-emerald-400' : 'text-red-400'}`}>
                  {result.valid ? 'Card Valid' : 'Card Invalid'}
                </p>
                <p className="text-xs text-white/40">{result.message}</p>
              </div>
            </div>

            {result.valid && (
              <div className="space-y-4">
                {/* Client info */}
                <div className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                  <span className="text-4xl">{result.client_avatar}</span>
                  <div>
                    <p className="font-display text-lg text-white">{result.client_name}</p>
                    <p className="text-xs text-white/40">{result.client_phone}</p>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                    <p className="text-[10px] text-white/30 tracking-wider uppercase mb-1">Reducere</p>
                    <p className={`text-3xl font-display font-bold ${
                      result.discount_percentage > 0 ? 'text-emerald-400' : 'text-white/30'
                    }`}>
                      {result.discount}
                    </p>
                  </div>
                  <div className="text-center p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                    <p className="text-[10px] text-white/30 tracking-wider uppercase mb-1">Vizite</p>
                    <p className="text-3xl font-display font-bold text-[#D4AF37]">{result.total_visits}</p>
                  </div>
                </div>

                {/* Applied rule */}
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                  <p className="text-[10px] text-white/30 tracking-wider uppercase mb-1">Regulă Aplicată</p>
                  <p className="text-sm text-white font-medium">{result.rule_name}</p>
                </div>
              </div>
            )}

            {!result.valid && (
              <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/5 border border-red-500/20">
                <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
                <p className="text-sm text-red-300">{result.message}</p>
              </div>
            )}

            <button
              onClick={() => setResult(null)}
              className="w-full mt-6 py-3 rounded-xl glass text-white/60 hover:text-[#D4AF37] hover:border-[#D4AF37]/30 transition-all duration-300 text-sm tracking-wider uppercase"
            >
              Scanează Alt Card
            </button>
          </div>
        )}

        {/* History */}
        {showHistory && (
          <div className="card-luxury animate-slide-up">
            <div className="flex items-center gap-2 mb-4">
              <History className="w-4 h-4 text-[#D4AF37]" />
              <h3 className="font-display text-lg text-white">Ultimele Scanări</h3>
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {recentVisits.map(visit => {
                const client = users.find(u => u.id === visit.client_id);
                return (
                  <div key={visit.id} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{client?.avatar || '🎫'}</span>
                      <div>
                        <p className="text-sm text-white">{client?.name || 'Necunoscut'}</p>
                        <p className="text-xs text-white/30">
                          {new Date(visit.scanned_at).toLocaleString('ro-RO', { 
                            day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' 
                          })}
                        </p>
                      </div>
                    </div>
                    <span className={`text-sm font-display font-bold ${
                      visit.discount_applied > 0 ? 'text-emerald-400' : 'text-white/30'
                    }`}>
                      {visit.discount_applied > 0 ? `-${visit.discount_applied}%` : '—'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
