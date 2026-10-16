import { useState } from 'react';
import { useStore } from '../store';
import { LuxuryBackground, OrnamentDivider, LuxuryButton, LuxuryInput } from '../components/LuxuryUI';
import { Wine, Sparkles, ArrowRight, Database, Mail, CheckCircle } from 'lucide-react';

export default function LoginPage() {
  const { login, registerClient } = useStore();
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 600));
    const success = login(email, password);
    if (!success) {
      setError('Credențiale incorecte. Verificați email-ul și parola.');
    }
    setIsLoading(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!name || !phone || !email || !password) {
      setError('Completați toate câmpurile obligatorii');
      return;
    }
    setIsLoading(true);
    try {
      await registerClient(name, phone, email, password);
    } catch (err: any) {
      setError(err?.message || 'Eroare la creare cont');
    }
    setIsLoading(false);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email) {
      setError('Introduceți email-ul');
      return;
    }
    setIsLoading(true);
    try {
      const { supabase } = await import('../lib/supabase');
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/reset-password'
      });
      if (error) throw error;
      setResetSent(true);
    } catch (err: any) {
      setError(err?.message || 'Eroare la trimitere email');
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen min-h-[100dvh] relative flex flex-col items-center justify-center px-5 py-10">
      <LuxuryBackground />
      
      {/* Main content */}
      <div className="relative z-10 w-full max-w-md animate-fade-in">
        {/* Logo & Branding */}
        <div className="text-center mb-10">
          {/* Logo mark */}
          <div className="relative inline-block mb-6">
            <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-[#722F37] to-[#3d1a1f] flex items-center justify-center glow-wine relative">
              <Wine className="w-9 h-9 text-[#D4AF37]" strokeWidth={1.5} />
              {/* Rotating ring */}
              <div className="absolute inset-[-4px] rounded-full border border-[#D4AF37]/20 animate-rotate-slow" />
              <div className="absolute inset-[-8px] rounded-full border border-[#D4AF37]/10" />
            </div>
            {/* Sparkle */}
            <Sparkles className="absolute -top-1 -right-1 w-4 h-4 text-[#D4AF37] animate-pulse" />
          </div>

          {/* Brand name */}
          <h1 className="font-display text-5xl md:text-6xl text-white font-medium tracking-tight mb-2">
            Merlot
          </h1>
          <div className="ornament-line w-24 mx-auto mb-3" />
          <p className="font-accent text-[#D4AF37]/80 text-sm tracking-[0.4em] uppercase italic">
            VIP Experience
          </p>
          <p className="text-white/30 text-xs mt-3 tracking-wider">
            Sistem exclusivist de fidelitate
          </p>
        </div>

        {/* Login Card */}
        <div className="card-luxury animate-slide-up">
          {/* Tabs */}
          <div className="flex mb-8 bg-white/[0.03] rounded-xl p-1">
            <button
              onClick={() => { setMode('login'); setError(''); }}
              className={`flex-1 py-3 rounded-lg text-xs font-medium tracking-[0.15em] uppercase transition-all duration-500 ${
                mode === 'login' 
                  ? 'bg-gradient-to-r from-[#722F37] to-[#8B3A42] text-white shadow-lg' 
                  : 'text-white/40 hover:text-white/60'
              }`}
            >
              Autentificare
            </button>
            <button
              onClick={() => { setMode('register'); setError(''); }}
              className={`flex-1 py-3 rounded-lg text-xs font-medium tracking-[0.15em] uppercase transition-all duration-500 ${
                mode === 'register' 
                  ? 'bg-gradient-to-r from-[#722F37] to-[#8B3A42] text-white shadow-lg' 
                  : 'text-white/40 hover:text-white/60'
              }`}
            >
              Înregistrare
            </button>
          </div>

          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-5">
              <LuxuryInput
                label="Email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="email@merlot.ro"
                required
              />
              <LuxuryInput
                label="Parolă"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
              {error && (
                <p className="text-red-400/80 text-xs text-center animate-fade-in">{error}</p>
              )}
              <LuxuryButton type="submit" variant="wine" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Se autentifică...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    Accesează Contul <ArrowRight className="w-4 h-4" />
                  </span>
                )}
              </LuxuryButton>
              
              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => { setMode('forgot'); setError(''); }}
                  className="text-xs text-[#D4AF37]/60 hover:text-[#D4AF37] transition-colors"
                >
                  Am uitat parola
                </button>
              </div>
            </form>
          )}

          {mode === 'forgot' && (
            <div className="space-y-5">
              {!resetSent ? (
                <form onSubmit={handleForgotPassword} className="space-y-5">
                  <div className="text-center mb-4">
                    <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-br from-[#D4AF37]/20 to-[#722F37]/20 flex items-center justify-center">
                      <Mail className="w-8 h-8 text-[#D4AF37]" />
                    </div>
                    <h3 className="font-display text-lg text-white mb-1">Resetare Parolă</h3>
                    <p className="text-xs text-white/40">Introduceți email-ul și vă vom trimite un link de resetare</p>
                  </div>
                  <LuxuryInput
                    label="Email"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="email@merlot.ro"
                    required
                  />
                  {error && (
                    <p className="text-red-400/80 text-xs text-center animate-fade-in">{error}</p>
                  )}
                  <LuxuryButton type="submit" variant="wine" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Se trimite...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        Trimite Link Resetare <Mail className="w-4 h-4" />
                      </span>
                    )}
                  </LuxuryButton>
                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => { setMode('login'); setError(''); }}
                      className="text-xs text-white/40 hover:text-white/60 transition-colors"
                    >
                      ← Înapoi la autentificare
                    </button>
                  </div>
                </form>
              ) : (
                <div className="text-center py-6">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 flex items-center justify-center">
                    <CheckCircle className="w-8 h-8 text-emerald-400" />
                  </div>
                  <h3 className="font-display text-lg text-white mb-2">Email Trimis!</h3>
                  <p className="text-sm text-white/60 mb-4">
                    Verificați inbox-ul pentru <span className="text-[#D4AF37]">{email}</span>
                  </p>
                  <p className="text-xs text-white/40 mb-6">
                    Click pe link-ul din email pentru a reseta parola
                  </p>
                  <button
                    onClick={() => { setMode('login'); setResetSent(false); setEmail(''); }}
                    className="btn-luxury w-full"
                  >
                    Înapoi la Autentificare
                  </button>
                </div>
              )}
            </div>
          )}

          {mode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-5">
              <LuxuryInput
                label="Nume complet"
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Nume Prenume"
                required
              />
              <LuxuryInput
                label="Telefon"
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="+40 7XX XXX XXX"
                required
              />
              <LuxuryInput
                label="Email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="email@exemplu.ro"
                required
              />
              <LuxuryInput
                label="Parolă"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Minim 6 caractere"
                required
              />
              {error && (
                <p className="text-red-400/80 text-xs text-center animate-fade-in">{error}</p>
              )}
              <LuxuryButton type="submit" variant="wine" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Se creează contul...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    Creează Cont VIP <Sparkles className="w-4 h-4" />
                  </span>
                )}
              </LuxuryButton>
            </form>
          )}

          {/* Info */}
          <div className="mt-8 text-center">
            <p className="text-[10px] text-white/30 tracking-[0.2em] uppercase mb-2">
              Sistem VIP Fidelitate NFC
            </p>
            <p className="text-[10px] text-white/20">
              Conectat la baza de date Supabase
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 space-y-3">
          <p className="text-[10px] text-white/20 tracking-[0.2em] uppercase">
            © 2024 Merlot Nightclub — Powered by NFC
          </p>
          <a
            href="/test-db"
            className="inline-flex items-center gap-1 text-[10px] text-white/30 hover:text-[#D4AF37] transition-colors"
          >
            <Database className="w-3 h-3" />
            Test Conexiune DB
          </a>
        </div>
      </div>
    </div>
  );
}
