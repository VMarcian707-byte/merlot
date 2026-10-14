import { useState, useEffect } from 'react';
import { useStore } from '../store';
import { ScanLine, Check, X, LogOut, Clock, User, CreditCard, Wifi, AlertTriangle, History } from 'lucide-react';
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

  const handleNFCSimulate = (cardUuid: string) => {
    setScanning(true);
    setResult(null);
    setTimeout(() => {
      const scanResult = scanCard(cardUuid, currentUser.id);
      setResult(scanResult);
      setScanning(false);
    }, 1200);
  };

  const handleManualScan = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualUuid.trim()) {
      handleNFCSimulate(manualUuid.trim());
    }
  };

  const startNFCScan = async () => {
    if (!('NDEFReader' in window)) {
      alert('Web NFC nu este suportat pe acest browser. Folosește Chrome pe Android sau introdu UUID-ul manual.');
      return;
    }
    try {
      // @ts-ignore
      const ndef = new NDEFReader();
      setScanning(true);
      setResult(null);
      await ndef.scan();
      ndef.onreading = (event: any) => {
        const record = event.message.records[0];
        if (record) {
          const decoder = new TextDecoder();
          const url = decoder.decode(record.data);
          const uuid = url.split('/c/')[1] || url;
          const scanResult = scanCard(uuid, currentUser.id);
          setResult(scanResult);
          setScanning(false);
        }
      };
    } catch (err) {
      setScanning(false);
      console.error('NFC Error:', err);
    }
  };

  const todayVisits = visitsLog.filter(v => {
    const today = new Date().toDateString();
    return new Date(v.scanned_at).toDateString() === today;
  });

  const recentVisits = [...visitsLog].reverse().slice(0, 10);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Header */}
      <div className="bg-[#111] border-b border-[#222] px-5 py-4">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-[#C4A35A] text-xs uppercase tracking-widest">Barman Scanner</p>
            <h1 className="text-lg font-bold">{currentUser.name}</h1>
          </div>
          <div className="flex items-center gap-2">
            <div className="bg-[#222] rounded-lg px-3 py-1.5 text-xs text-gray-400">
              Vizite azi: <span className="text-white font-bold">{todayVisits.length}</span>
            </div>
            <button onClick={logout} className="p-2 rounded-lg bg-[#222] hover:bg-[#333] transition">
              <LogOut className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Scanner Zone */}
        <div className="bg-[#1a1a1a] border border-[#333] rounded-2xl p-6 text-center">
          <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-4 ${scanning ? 'bg-[#722F37]/20 animate-pulse' : 'bg-[#222]'}`}>
            {scanning ? (
              <Wifi className="w-10 h-10 text-[#C4A35A] animate-ping" />
            ) : (
              <ScanLine className="w-10 h-10 text-gray-400" />
            )}
          </div>
          <p className="text-sm text-gray-400 mb-4">
            {scanning ? 'Se scanează cardul NFC...' : 'Apropie cardul NFC de telefon sau introdu UUID-ul manual'}
          </p>

          {/* NFC Button */}
          <div className="flex gap-2 justify-center mb-4">
            <button
              onClick={startNFCScan}
              disabled={scanning}
              className="bg-gradient-to-r from-[#722F37] to-[#8B3A42] text-white px-6 py-3 rounded-xl font-semibold hover:from-[#8B3A42] hover:to-[#722F37] transition-all disabled:opacity-50 flex items-center gap-2"
            >
              <Wifi className="w-4 h-4" />
              Scanare NFC
            </button>
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="bg-[#222] text-gray-300 px-4 py-3 rounded-xl font-medium hover:bg-[#333] transition flex items-center gap-2"
            >
              <History className="w-4 h-4" />
              Istoric
            </button>
          </div>

          {/* Manual UUID Input */}
          <form onSubmit={handleManualScan} className="mt-4">
            <label className="block text-xs text-gray-500 mb-1.5 uppercase tracking-wide text-left">Introducere manuală UUID card:</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={manualUuid}
                onChange={e => setManualUuid(e.target.value)}
                placeholder="A1B2C3D4-E5F6-7890-ABCD-EF1234567890"
                className="flex-1 bg-[#0a0a0a] border border-[#333] rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:border-[#722F37] outline-none font-mono"
              />
              <button
                type="submit"
                disabled={!manualUuid.trim() || scanning}
                className="bg-[#722F37] text-white px-4 py-2.5 rounded-lg font-medium hover:bg-[#8B3A42] transition disabled:opacity-50"
              >
                Verifică
              </button>
            </div>
          </form>

          {/* Quick Test Cards */}
          <div className="mt-4 pt-4 border-t border-[#222]">
            <p className="text-xs text-gray-600 mb-2">Test rapid (carduri demo):</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {nfcCards.filter(c => c.status === 'active').slice(0, 3).map(card => {
                const client = users.find(u => u.id === card.assigned_user_id);
                return (
                  <button
                    key={card.id}
                    onClick={() => handleNFCSimulate(card.card_uuid)}
                    disabled={scanning}
                    className="bg-[#222] border border-[#333] rounded-lg px-3 py-2 text-xs text-gray-300 hover:border-[#722F37] hover:text-white transition disabled:opacity-50"
                  >
                    {client?.avatar} {client?.name?.split(' ')[0]}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Scan Result */}
        {result && (
          <div className={`border rounded-2xl p-5 ${result.valid ? 'bg-green-500/5 border-green-500/30' : 'bg-red-500/5 border-red-500/30'}`}>
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${result.valid ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                {result.valid ? <Check className="w-6 h-6 text-green-400" /> : <X className="w-6 h-6 text-red-400" />}
              </div>
              <div>
                <p className={`font-bold ${result.valid ? 'text-green-400' : 'text-red-400'}`}>
                  {result.valid ? 'Card Valid' : 'Card Invalid'}
                </p>
                <p className="text-xs text-gray-400">{result.message}</p>
              </div>
            </div>

            {result.valid && (
              <div className="space-y-3">
                <div className="flex items-center gap-3 bg-[#111] rounded-xl p-3">
                  <span className="text-3xl">{result.client_avatar}</span>
                  <div>
                    <p className="font-semibold text-white">{result.client_name}</p>
                    <p className="text-xs text-gray-400">{result.client_phone}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-[#111] rounded-xl p-3 text-center">
                    <p className="text-xs text-gray-500">Reducere</p>
                    <p className={`text-2xl font-bold ${result.discount_percentage > 0 ? 'text-green-400' : 'text-gray-400'}`}>
                      {result.discount}
                    </p>
                  </div>
                  <div className="bg-[#111] rounded-xl p-3 text-center">
                    <p className="text-xs text-gray-500">Vizite totale</p>
                    <p className="text-2xl font-bold text-[#C4A35A]">{result.total_visits}</p>
                  </div>
                </div>
                <div className="bg-[#111] rounded-xl p-3">
                  <p className="text-xs text-gray-500">Regulă aplicată</p>
                  <p className="text-sm text-white font-medium">{result.rule_name}</p>
                </div>
              </div>
            )}

            {!result.valid && (
              <div className="flex items-center gap-2 bg-red-500/10 rounded-xl p-3">
                <AlertTriangle className="w-5 h-5 text-red-400" />
                <p className="text-sm text-red-300">{result.message}</p>
              </div>
            )}

            <button
              onClick={() => setResult(null)}
              className="w-full mt-4 bg-[#222] text-gray-300 py-2.5 rounded-xl font-medium hover:bg-[#333] transition"
            >
              Scanează alt card
            </button>
          </div>
        )}

        {/* History */}
        {showHistory && (
          <div className="bg-[#1a1a1a] border border-[#333] rounded-2xl p-4">
            <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
              <History className="w-4 h-4 text-[#C4A35A]" />
              Ultimele scanări
            </h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {recentVisits.map(visit => {
                const client = users.find(u => u.id === visit.client_id);
                return (
                  <div key={visit.id} className="flex items-center justify-between bg-[#111] rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{client?.avatar || '🎫'}</span>
                      <div>
                        <p className="text-sm text-white">{client?.name || 'Necunoscut'}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(visit.scanned_at).toLocaleString('ro-RO', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                    <span className={`text-sm font-bold ${visit.discount_applied > 0 ? 'text-green-400' : 'text-gray-500'}`}>
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
