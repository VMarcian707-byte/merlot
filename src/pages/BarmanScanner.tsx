import { useState, useEffect } from 'react';
import { useStore } from '../store';
import { LuxuryBackground, OrnamentDivider, NoiseOverlay } from '../components/LuxuryUI';
import { 
  ScanLine, Check, X, LogOut, Wifi, AlertTriangle, History, 
  Activity, Receipt, BadgePercent, Coins, RotateCcw,
  Sparkles, CheckCircle2
} from 'lucide-react';
import { ScanResult } from '../types';

export default function BarmanScanner() {
  const { currentUser, logout, scanCard, nfcCards, visitsLog, users } = useStore();
  const [manualUuid, setManualUuid] = useState('');
  const [billAmountInput, setBillAmountInput] = useState('');
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

  const isNameEmail = currentUser.name.includes('@');
  const displayName = isNameEmail 
    ? currentUser.email.split('@')[0].split('.').map(part => 
        part.charAt(0).toUpperCase() + part.slice(1)
      ).join(' ')
    : currentUser.name;

  const currentBillAmount = billAmountInput ? parseFloat(billAmountInput) : undefined;

  const handleNFCSimulate = async (cardUuid: string, billOverride?: number) => {
    setScanning(true);
    setResult(null);
    const amountToCharge = billOverride !== undefined ? billOverride : currentBillAmount;
    setTimeout(async () => {
      const scanResult = await scanCard(cardUuid, currentUser.id, amountToCharge);
      setResult(scanResult);
      setScanning(false);
    }, 900);
  };

  const handleManualScan = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualUuid.trim()) {
      handleNFCSimulate(manualUuid.trim());
    }
  };

  const startNFCScan = async () => {
    if (!('NDEFReader' in window)) {
      setResult({
        valid: false,
        discount: '0%',
        discount_percentage: 0,
        client_name: '',
        client_phone: '',
        client_avatar: '',
        card_uuid: '',
        total_visits: 0,
        rule_name: '',
        message: 'Web NFC fizic nu este suportat în acest browser. Folosiți simulatorul NFC de mai jos sau introduceți UUID-ul.',
      });
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
          const scanResult = await scanCard(uuid, currentUser.id, currentBillAmount);
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

  const todayRevenue = todayVisits.reduce((acc, v) => acc + (v.final_amount ?? v.bill_amount ?? 0), 0);
  const recentVisits = [...visitsLog].reverse().slice(0, 15);

  const billPresets = [100, 250, 350, 500, 750, 1200];

  return (
    <div className="min-h-screen min-h-[100dvh] relative pb-16">
      <LuxuryBackground />
      <NoiseOverlay />

      {/* Header */}
      <div className="relative z-10 glass-dark border-b border-white/[0.05]">
        <div className="px-5 py-4 max-w-xl mx-auto">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-accent text-[#D4AF37]/60 text-xs tracking-[0.3em] uppercase italic mb-0.5">
                Staff Access & POS
              </p>
              <h1 className="font-display text-xl text-white font-medium">{displayName}</h1>
            </div>
            <div className="flex items-center gap-3">
              <div className="glass rounded-xl px-3 py-1.5 flex items-center gap-2">
                <Activity className="w-3.5 h-3.5 text-[#D4AF37]" />
                <div className="text-right">
                  <p className="text-[10px] text-white/40 uppercase">Azi</p>
                  <p className="text-xs text-white font-semibold">{todayVisits.length} scanări</p>
                </div>
              </div>
              <button 
                onClick={logout} 
                className="w-9 h-9 rounded-full glass flex items-center justify-center hover:border-[#D4AF37]/30 transition-all duration-300"
                title="Deconectare"
              >
                <LogOut className="w-4 h-4 text-white/40 hover:text-white" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 p-5 max-w-xl mx-auto space-y-5">

        {/* POS Bill Amount Card */}
        <div className="card-luxury border-[#D4AF37]/25 bg-gradient-to-br from-[#1a0d12]/90 via-[#0a0608]/90 to-black animate-slide-up">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#D4AF37]/15 flex items-center justify-center border border-[#D4AF37]/30">
                <Receipt className="w-4 h-4 text-[#D4AF37]" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white tracking-wide">Notă de Plată (POS Bar)</h3>
                <p className="text-[11px] text-white/40">Introdu valoarea notei pentru calculul reducerii automate</p>
              </div>
            </div>
            {billAmountInput && (
              <button
                type="button"
                onClick={() => setBillAmountInput('')}
                className="flex items-center gap-1 text-[11px] text-[#D4AF37]/70 hover:text-[#D4AF37] transition-colors px-2 py-1 rounded bg-white/[0.04]"
              >
                <RotateCcw className="w-3 h-3" /> Șterge
              </button>
            )}
          </div>

          {/* Amount Input */}
          <div className="relative mb-3">
            <input
              type="number"
              min="0"
              step="1"
              value={billAmountInput}
              onChange={e => setBillAmountInput(e.target.value)}
              placeholder="0.00"
              className="w-full bg-black/40 border-2 border-[#D4AF37]/30 rounded-xl px-4 py-3.5 text-2xl font-display font-bold text-white placeholder-white/20 focus:border-[#D4AF37] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20 transition-all"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-[#D4AF37] tracking-wider">
              RON
            </span>
          </div>

          {/* Quick Presets */}
          <div className="space-y-1.5">
            <p className="text-[10px] text-white/30 uppercase tracking-widest font-mono">Preseturi Rapide:</p>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
              {billPresets.map(val => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setBillAmountInput(val.toString())}
                  className={`py-1.5 px-2 rounded-lg text-xs font-semibold tracking-wide transition-all border ${
                    billAmountInput === val.toString()
                      ? 'bg-[#D4AF37] text-black border-[#D4AF37] shadow-sm shadow-[#D4AF37]/30'
                      : 'bg-white/[0.03] text-white/70 border-white/5 hover:border-[#D4AF37]/40 hover:text-white'
                  }`}
                >
                  {val} RON
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Scanner Zone */}
        <div className="card-luxury text-center animate-slide-up">
          <div className="mb-4">
            <p className="font-accent text-[#D4AF37]/60 text-xs tracking-[0.3em] uppercase italic mb-1">
              Verificare & Fidelitate
            </p>
            <h2 className="font-display text-xl text-white">Scanare Card NFC</h2>
          </div>

          {/* Scanner Visual */}
          <div className="relative mx-auto w-28 h-28 mb-5">
            <div className={`absolute inset-0 rounded-full border border-[#D4AF37]/20 ${scanning ? 'animate-pulse-gold' : ''}`} />
            <div className={`absolute inset-[-6px] rounded-full border border-[#D4AF37]/10 ${scanning ? 'animate-ping' : ''}`} style={{ animationDuration: '2s' }} />
            
            <div className={`absolute inset-0 rounded-full flex items-center justify-center ${
              scanning 
                ? 'bg-gradient-to-br from-[#D4AF37]/20 to-[#722F37]/20' 
                : 'bg-white/[0.03]'
            } transition-all duration-500`}>
              {scanning ? (
                <Wifi className="w-9 h-9 text-[#D4AF37] animate-pulse" />
              ) : (
                <ScanLine className="w-9 h-9 text-white/30" />
              )}
            </div>
          </div>

          <p className="text-xs text-white/50 mb-5">
            {scanning ? (
              <span className="text-[#D4AF37] font-medium animate-pulse">Se procesează cardul și se calculează nota...</span>
            ) : (
              'Apropie cardul NFC sau alege un client de test mai jos'
            )}
          </p>

          {/* Action Buttons */}
          <div className="flex gap-2.5 justify-center mb-5">
            <button
              onClick={startNFCScan}
              disabled={scanning}
              className="btn-luxury flex items-center gap-2 text-xs py-3 px-5 disabled:opacity-50 cursor-pointer"
            >
              <Wifi className="w-3.5 h-3.5" />
              Scanare NFC Fizic
            </button>
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="px-4 py-3 rounded-xl glass text-white/70 hover:text-[#D4AF37] hover:border-[#D4AF37]/20 transition-all duration-300 flex items-center gap-1.5 text-xs cursor-pointer"
            >
              <History className="w-3.5 h-3.5" />
              {showHistory ? 'Ascunde Istoric' : 'Jurnal Plăți'}
            </button>
          </div>

          <OrnamentDivider className="mb-4" />

          {/* Manual UUID Input */}
          <form onSubmit={handleManualScan} className="text-left mb-4">
            <label className="block text-[10px] text-white/30 tracking-[0.2em] uppercase mb-1.5 font-mono">
              Introducere Manuală UUID Card
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={manualUuid}
                onChange={e => setManualUuid(e.target.value)}
                placeholder="A1B2C3D4-E5F6-7890-..."
                className="input-luxury font-mono text-xs flex-1 py-2 px-3"
              />
              <button
                type="submit"
                disabled={!manualUuid.trim() || scanning}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#722F37] to-[#8B3A42] text-white text-xs font-semibold hover:from-[#8B3A42] hover:to-[#722F37] transition-all disabled:opacity-50 cursor-pointer"
              >
                Scanează
              </button>
            </div>
          </form>

          {/* Quick Test Cards Simulator */}
          <div className="pt-4 border-t border-white/5">
            <div className="flex items-center justify-between mb-2.5">
              <p className="text-[10px] text-white/30 tracking-[0.2em] uppercase font-mono">Simulare Scanare Clienți VIP:</p>
              <span className="text-[10px] text-[#D4AF37]/60">1-click test</span>
            </div>
            <div className="flex flex-wrap gap-2 justify-center">
              {nfcCards.filter(c => c.status === 'active').map(card => {
                const client = users.find(u => u.id === card.assigned_user_id);
                return (
                  <button
                    key={card.id}
                    onClick={() => handleNFCSimulate(card.card_uuid)}
                    disabled={scanning}
                    className="group flex items-center gap-2 px-3.5 py-2 rounded-xl glass hover:border-[#D4AF37]/40 hover:bg-[#D4AF37]/10 transition-all duration-300 disabled:opacity-50 cursor-pointer"
                  >
                    <span className="text-base">{client?.avatar || '🎩'}</span>
                    <span className="text-xs text-white/80 group-hover:text-[#D4AF37] font-medium transition-colors">
                      {client?.name || 'Client VIP'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Scan Result with POS Calculation Breakdown */}
        {result && (
          <div className={`card-luxury animate-scale-in ${
            result.valid 
              ? 'border-emerald-500/30 bg-gradient-to-br from-emerald-950/20 via-[#1a0d12]/90 to-black' 
              : 'border-red-500/30 bg-gradient-to-br from-red-950/20 via-[#1a0d12]/90 to-black'
          }`}>
            {/* Result header */}
            <div className="flex items-center gap-3.5 mb-5 pb-4 border-b border-white/5">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                result.valid 
                  ? 'bg-gradient-to-br from-emerald-400/25 to-emerald-500/5 border border-emerald-400/30' 
                  : 'bg-gradient-to-br from-red-400/25 to-red-500/5 border border-red-400/30'
              }`}>
                {result.valid ? (
                  <Check className="w-6 h-6 text-emerald-400" />
                ) : (
                  <X className="w-6 h-6 text-red-400" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className={`font-display text-lg font-semibold ${result.valid ? 'text-emerald-400' : 'text-red-400'}`}>
                    {result.valid ? 'Card VIP Validat' : 'Card Invalid'}
                  </p>
                  {result.valid && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] uppercase font-semibold tracking-wider bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                      Activ
                    </span>
                  )}
                </div>
                <p className="text-xs text-white/60 mt-0.5">{result.message}</p>
              </div>
            </div>

            {result.valid && (
              <div className="space-y-4">
                {/* Client info */}
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{result.client_avatar}</span>
                    <div>
                      <p className="font-display text-base text-white font-medium">{result.client_name}</p>
                      <p className="text-xs text-white/40">{result.client_phone || 'Fără telefon'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase tracking-wider text-white/40 block">Total Vizite</span>
                    <span className="text-sm font-bold text-[#D4AF37]">{result.total_visits}</span>
                  </div>
                </div>

                {/* Applied Rule */}
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BadgePercent className="w-4 h-4 text-[#D4AF37]" />
                    <div>
                      <p className="text-[10px] text-white/30 uppercase tracking-wider font-mono">Regulă Activă</p>
                      <p className="text-xs text-white font-medium">{result.rule_name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-base font-bold text-emerald-400 font-display">
                      {result.discount}
                    </span>
                  </div>
                </div>

                {/* POS Financial Calculation Box */}
                {result.bill_amount !== undefined && result.final_amount !== undefined ? (
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-black/80 to-[#140b0f] border border-[#D4AF37]/40 space-y-3.5 shadow-xl">
                    <div className="flex items-center gap-1.5 pb-2 border-b border-white/5">
                      <Coins className="w-4 h-4 text-[#D4AF37]" />
                      <span className="text-[11px] font-semibold text-white/80 uppercase tracking-widest font-mono">
                        Calcul Notă de Plată (POS)
                      </span>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between items-center text-white/60">
                        <span>Notă de Plată (Subtotal):</span>
                        <span className="font-mono text-white font-medium">{result.bill_amount.toFixed(2)} RON</span>
                      </div>

                      <div className="flex justify-between items-center text-emerald-400">
                        <span className="flex items-center gap-1">
                          Economie VIP ({result.discount_percentage}%):
                        </span>
                        <span className="font-mono font-bold">
                          -{result.discount_amount?.toFixed(2)} RON
                        </span>
                      </div>
                    </div>

                    <div className="h-[1px] bg-gradient-to-r from-transparent via-[#D4AF37]/50 to-transparent my-1" />

                    <div className="flex justify-between items-end pt-1">
                      <div>
                        <p className="text-[10px] text-white/40 uppercase tracking-widest font-mono">TOTAL DE ÎNCASAT</p>
                        <p className="text-[11px] text-emerald-400/90 font-medium">
                          ✓ Discount aplicat automat
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="font-display text-3xl font-bold text-[#D4AF37] tracking-tight">
                          {result.final_amount.toFixed(2)}
                        </span>
                        <span className="text-xs text-[#D4AF37] ml-1 font-semibold uppercase">RON</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Option to calculate if scanned without initial amount */
                  <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5 space-y-2.5">
                    <p className="text-xs text-white/60">Dorești să calculezi o notă pentru acest client acum?</p>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        placeholder="Sumă notă (RON)..."
                        value={billAmountInput}
                        onChange={e => setBillAmountInput(e.target.value)}
                        className="bg-black/50 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white flex-1 focus:border-[#D4AF37] focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (billAmountInput) {
                            handleNFCSimulate(result.card_uuid, parseFloat(billAmountInput));
                          }
                        }}
                        disabled={!billAmountInput}
                        className="px-3 py-1.5 rounded-lg bg-[#D4AF37] text-black font-semibold text-xs disabled:opacity-40 cursor-pointer"
                      >
                        Calculează
                      </button>
                    </div>
                  </div>
                )}
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
              className="w-full mt-5 py-3 rounded-xl glass text-white/70 hover:text-[#D4AF37] hover:border-[#D4AF37]/30 transition-all duration-300 text-xs tracking-wider uppercase font-semibold cursor-pointer"
            >
              Tranzacție Nouă / Închide
            </button>
          </div>
        )}

        {/* Payment History & Scan Log */}
        {showHistory && (
          <div className="card-luxury animate-slide-up">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/5">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-[#D4AF37]" />
                <h3 className="font-display text-base text-white">Jurnal Notițe & Scanări</h3>
              </div>
              <span className="text-xs text-white/40">
                Încasat azi: <span className="text-[#D4AF37] font-bold">{todayRevenue.toFixed(0)} RON</span>
              </span>
            </div>

            <div className="space-y-2.5 max-h-80 overflow-y-auto">
              {recentVisits.length === 0 ? (
                <p className="text-center text-xs text-white/40 py-6">Nicio scanare înregistrată.</p>
              ) : (
                recentVisits.map(visit => {
                  const client = users.find(u => u.id === visit.client_id);
                  return (
                    <div key={visit.id} className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:border-[#D4AF37]/20 transition-all">
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2.5">
                          <span className="text-lg">{client?.avatar || '🎫'}</span>
                          <div>
                            <p className="text-xs font-medium text-white">{client?.name || 'Client'}</p>
                            <p className="text-[10px] text-white/30">
                              {new Date(visit.scanned_at).toLocaleString('ro-RO', { 
                                day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' 
                              })}
                            </p>
                          </div>
                        </div>
                        <span className={`text-xs font-bold ${
                          visit.discount_applied > 0 ? 'text-emerald-400' : 'text-white/40'
                        }`}>
                          {visit.discount_applied > 0 ? `-${visit.discount_applied}%` : 'Standard'}
                        </span>
                      </div>

                      {/* Financial info if present */}
                      {visit.bill_amount ? (
                        <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[11px] font-mono">
                          <span className="text-white/40">
                            Notă: {visit.bill_amount} RON
                          </span>
                          <span className="text-emerald-400/80">
                            Disc: -{visit.discount_amount} RON
                          </span>
                          <span className="text-[#D4AF37] font-semibold">
                            Încasat: {visit.final_amount} RON
                          </span>
                        </div>
                      ) : null}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
