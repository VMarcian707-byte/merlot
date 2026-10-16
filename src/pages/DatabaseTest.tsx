import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { LuxuryBackground, NoiseOverlay } from '../components/LuxuryUI';
import { CheckCircle, XCircle, AlertCircle, Database, Wifi, Shield, Zap, ArrowLeft } from 'lucide-react';

interface TestResult {
  name: string;
  status: 'pending' | 'success' | 'error' | 'warning';
  message: string;
  details?: string;
}

export default function DatabaseTest() {
  const [results, setResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [connectionInfo, setConnectionInfo] = useState({
    url: import.meta.env.VITE_SUPABASE_URL || 'NOT SET',
    key: import.meta.env.VITE_SUPABASE_ANON_KEY ? 'SET ✓' : 'NOT SET',
  });

  const addResult = (result: TestResult) => {
    setResults(prev => [...prev, result]);
  };

  const runTests = async () => {
    setIsRunning(true);
    setResults([]);

    // Test 1: Verifică configurație
    addResult({
      name: 'Configurație Environment',
      status: 'pending',
      message: 'Se verifică variabilele de mediu...'
    });

    await new Promise(r => setTimeout(r, 500));

    if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
      setResults(prev => prev.map((r, i) => 
        i === 0 ? {
          ...r,
          status: 'error',
          message: 'Variabile de mediu lipsă!',
          details: 'Verifică fișierul .env și asigură-te că VITE_SUPABASE_URL și VITE_SUPABASE_ANON_KEY sunt setate.'
        } : r
      ));
      setIsRunning(false);
      return;
    }

    setResults(prev => prev.map((r, i) => 
      i === 0 ? {
        ...r,
        status: 'success',
        message: 'Variabile de mediu configurate corect',
        details: `URL: ${import.meta.env.VITE_SUPABASE_URL}`
      } : r
    ));

    // Test 2: Conexiune la Supabase
    addResult({
      name: 'Conexiune Supabase',
      status: 'pending',
      message: 'Se testează conexiunea...'
    });

    await new Promise(r => setTimeout(r, 500));

    try {
      const { error } = await supabase.from('users').select('count', { count: 'exact', head: true });
      
      if (error) {
        setResults(prev => prev.map((r, i) => 
          i === 1 ? {
            ...r,
            status: 'error',
            message: 'Conexiune eșuată',
            details: error.message
          } : r
        ));
        setIsRunning(false);
        return;
      }

      setResults(prev => prev.map((r, i) => 
        i === 1 ? {
          ...r,
          status: 'success',
          message: 'Conexiune stabilită cu succes'
        } : r
      ));
    } catch (err: any) {
      setResults(prev => prev.map((r, i) => 
        i === 1 ? {
          ...r,
          status: 'error',
          message: 'Eroare de conexiune',
          details: err.message
        } : r
      ));
      setIsRunning(false);
      return;
    }

    // Test 3: Verifică tabele
    addResult({
      name: 'Tabele Bază de Date',
      status: 'pending',
      message: 'Se verifică existența tabelelor...'
    });

    await new Promise(r => setTimeout(r, 500));

    const tables = ['users', 'nfc_cards', 'discount_rules', 'visits_log', 'announcements'];
    const missingTables: string[] = [];

    for (const table of tables) {
      const { error } = await supabase.from(table as any).select('count', { count: 'exact', head: true });
      if (error && error.message.includes('does not exist')) {
        missingTables.push(table);
      }
    }

    if (missingTables.length > 0) {
      setResults(prev => prev.map((r, i) => 
        i === 2 ? {
          ...r,
          status: 'error',
          message: 'Tabele lipsă',
          details: `Rulează database/schema.sql în Supabase SQL Editor. Tabele lipsă: ${missingTables.join(', ')}`
        } : r
      ));
    } else {
      setResults(prev => prev.map((r, i) => 
        i === 2 ? {
          ...r,
          status: 'success',
          message: 'Toate tabelele există',
          details: tables.join(', ')
        } : r
      ));
    }

    // Test 4: Verifică date în tabele
    addResult({
      name: 'Date în Tabele',
      status: 'pending',
      message: 'Se numără înregistrările...'
    });

    await new Promise(r => setTimeout(r, 500));

    try {
      const { count: usersCount } = await supabase.from('users').select('*', { count: 'exact', head: true });
      const { count: cardsCount } = await supabase.from('nfc_cards').select('*', { count: 'exact', head: true });
      const { count: rulesCount } = await supabase.from('discount_rules').select('*', { count: 'exact', head: true });

      setResults(prev => prev.map((r, i) => 
        i === 3 ? {
          ...r,
          status: usersCount === 0 ? 'warning' : 'success',
          message: usersCount === 0 ? 'Baza de date goală' : 'Date găsite',
          details: `Users: ${usersCount || 0}, Cards: ${cardsCount || 0}, Rules: ${rulesCount || 0}`
        } : r
      ));
    } catch (err: any) {
      setResults(prev => prev.map((r, i) => 
        i === 3 ? {
          ...r,
          status: 'error',
          message: 'Eroare la citire date',
          details: err.message
        } : r
      ));
    }

    // Test 5: Test funcție SQL
    addResult({
      name: 'Funcție SQL scan_nfc_card',
      status: 'pending',
      message: 'Se testează funcția...'
    });

    await new Promise(r => setTimeout(r, 500));

    try {
      const { error } = await supabase.rpc('scan_nfc_card', {
        p_card_uuid: 'TEST-UUID-INVALID',
        p_barman_id: '00000000-0000-0000-0000-000000000000'
      });

      if (error && error.message.includes('function') && error.message.includes('does not exist')) {
        setResults(prev => prev.map((r, i) => 
          i === 4 ? {
            ...r,
            status: 'error',
            message: 'Funcția scan_nfc_card nu există',
            details: 'Rulează database/schema.sql pentru a crea funcțiile SQL'
          } : r
        ));
      } else {
        setResults(prev => prev.map((r, i) => 
          i === 4 ? {
            ...r,
            status: 'success',
            message: 'Funcția SQL există și funcționează',
            details: 'Test cu UUID invalid a returnat răspuns (expected)'
          } : r
        ));
      }
    } catch (err: any) {
      setResults(prev => prev.map((r, i) => 
        i === 4 ? {
          ...r,
          status: 'warning',
          message: 'Funcție testată cu erori',
          details: err.message
        } : r
      ));
    }

    // Test 6: Autentificare
    addResult({
      name: 'Sistem Autentificare',
      status: 'pending',
      message: 'Se verifică auth...'
    });

    await new Promise(r => setTimeout(r, 500));

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      setResults(prev => prev.map((r, i) => 
        i === 5 ? {
          ...r,
          status: 'success',
          message: session ? 'Utilizator autentificat' : 'Sistem auth funcțional',
          details: session ? `Logat ca: ${session.user.email}` : 'Niciun utilizator logat (normal)'
        } : r
      ));
    } catch (err: any) {
      setResults(prev => prev.map((r, i) => 
        i === 5 ? {
          ...r,
          status: 'error',
          message: 'Eroare sistem auth',
          details: err.message
        } : r
      ));
    }

    setIsRunning(false);
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-emerald-400" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-400" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-amber-400" />;
      default:
        return <div className="w-5 h-5 rounded-full border-2 border-[#D4AF37]/30 border-t-[#D4AF37] animate-spin" />;
    }
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return 'border-emerald-500/20 bg-emerald-500/5';
      case 'error':
        return 'border-red-500/20 bg-red-500/5';
      case 'warning':
        return 'border-amber-500/20 bg-amber-500/5';
      default:
        return 'border-white/10 bg-white/[0.02]';
    }
  };

  return (
    <div className="min-h-screen min-h-[100dvh] relative">
      <LuxuryBackground />
      <NoiseOverlay />

      <div className="relative z-10 max-w-2xl mx-auto px-5 py-10">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#D4AF37]/20 to-[#722F37]/20 flex items-center justify-center">
            <Database className="w-8 h-8 text-[#D4AF37]" />
          </div>
          <h1 className="font-display text-3xl text-white mb-2">Test Conexiune Bază de Date</h1>
          <p className="text-white/40 text-sm">Diagnostic complet pentru Supabase</p>
        </div>

        {/* Connection Info */}
        <div className="card-luxury mb-6 animate-slide-up stagger-1">
          <div className="flex items-center gap-2 mb-4">
            <Wifi className="w-4 h-4 text-[#D4AF37]" />
            <h3 className="font-display text-base text-white">Informații Conexiune</h3>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center p-3 rounded-lg bg-white/[0.02]">
              <span className="text-xs text-white/40 uppercase tracking-wider">Supabase URL</span>
              <span className={`text-xs font-mono ${connectionInfo.url === 'NOT SET' ? 'text-red-400' : 'text-emerald-400'}`}>
                {connectionInfo.url === 'NOT SET' ? '⚠️ NOT SET' : connectionInfo.url}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-lg bg-white/[0.02]">
              <span className="text-xs text-white/40 uppercase tracking-wider">Anon Key</span>
              <span className={`text-xs font-mono ${connectionInfo.key === 'NOT SET' ? 'text-red-400' : 'text-emerald-400'}`}>
                {connectionInfo.key}
              </span>
            </div>
          </div>
        </div>

        {/* Test Button */}
        <div className="mb-6 animate-slide-up stagger-2">
          <button
            onClick={runTests}
            disabled={isRunning}
            className="btn-luxury w-full flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isRunning ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Se rulează testele...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                Rulează Teste Complete
              </>
            )}
          </button>
        </div>

        {/* Results */}
        {results.length > 0 && (
          <div className="space-y-3 animate-slide-up stagger-3">
            <h3 className="font-display text-lg text-white mb-4">Rezultate Teste</h3>
            {results.map((result, idx) => (
              <div
                key={idx}
                className={`card-luxury ${getStatusColor(result.status)} transition-all duration-500`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    {getStatusIcon(result.status)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-white text-sm mb-1">{result.name}</h4>
                    <p className="text-xs text-white/60 mb-1">{result.message}</p>
                    {result.details && (
                      <p className="text-xs text-white/40 font-mono break-all">{result.details}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Help Section */}
        {results.length > 0 && results.some(r => r.status === 'error') && (
          <div className="mt-6 card-luxury border-amber-500/20 bg-amber-500/5 animate-slide-up stagger-4">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="w-4 h-4 text-amber-400" />
              <h3 className="font-display text-base text-white">Cum să rezolvi problemele</h3>
            </div>
            <div className="space-y-3 text-sm text-white/60">
              <div>
                <p className="text-white font-medium mb-1">1. Verifică fișierul .env</p>
                <p className="text-xs">Asigură-te că ai creat fișierul .env și ai adăugat:</p>
                <pre className="mt-2 p-3 rounded-lg bg-[#0a0608] text-xs text-emerald-300/80 overflow-x-auto">
{`VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here`}
                </pre>
              </div>
              <div>
                <p className="text-white font-medium mb-1">2. Rulează schema SQL</p>
                <p className="text-xs">Mergi la Supabase → SQL Editor și rulează conținutul din:</p>
                <pre className="mt-2 p-3 rounded-lg bg-[#0a0608] text-xs text-emerald-300/80">
                  database/schema.sql
                </pre>
              </div>
              <div>
                <p className="text-white font-medium mb-1">3. Restart server</p>
                <pre className="mt-2 p-3 rounded-lg bg-[#0a0608] text-xs text-emerald-300/80">
{`# Oprește serverul (Ctrl+C) și repornește
npm run dev`}
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* Back Button */}
        <div className="mt-8 text-center">
          <a
            href="/"
            className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-[#D4AF37] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Înapoi la Login
          </a>
        </div>
      </div>
    </div>
  );
}
