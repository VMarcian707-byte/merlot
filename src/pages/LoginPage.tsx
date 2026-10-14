import { useState } from 'react';
import { useStore } from '../store';
import { LuxuryBackground, OrnamentDivider, LuxuryButton, LuxuryInput } from '../components/LuxuryUI';
import { Wine, Shield, Smartphone, CreditCard, Sparkles, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const { login, registerClient } = useStore();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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
    if (!name || !phone || !email) {
      setError('Completați toate câmpurile obligatorii');
      return;
    }
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 800));
    registerClient(name, phone, email);
    setIsLoading(false);
  };

  const quickLogin = (em: string, pass: string) => {
    setIsLoading(true);
    setTimeout(() => {
      login(em, pass);
      setIsLoading(false);
    }, 500);
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

          {mode === 'login' ? (
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
            </form>
          ) : (
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

          {/* Ornament */}
          <OrnamentDivider className="mt-8 mb-6" />

          {/* Quick Access */}
          <div className="text-center">
            <p className="text-[10px] text-white/30 tracking-[0.3em] uppercase mb-4">
              Acces Demo Rapid
            </p>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => quickLogin('manager@merlot.ro', 'manager123')}
                disabled={isLoading}
                className="group flex flex-col items-center gap-2 p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-[#D4AF37]/30 hover:bg-[#D4AF37]/5 transition-all duration-500 disabled:opacity-50"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#D4AF37]/20 to-[#D4AF37]/5 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                  <Shield className="w-4 h-4 text-[#D4AF37]" />
                </div>
                <span className="text-[10px] text-white/40 group-hover:text-[#D4AF37] tracking-wider uppercase transition-colors">Manager</span>
              </button>
              <button
                onClick={() => quickLogin('barman@merlot.ro', 'barman123')}
                disabled={isLoading}
                className="group flex flex-col items-center gap-2 p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-[#D4AF37]/30 hover:bg-[#D4AF37]/5 transition-all duration-500 disabled:opacity-50"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#D4AF37]/20 to-[#D4AF37]/5 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                  <Smartphone className="w-4 h-4 text-[#D4AF37]" />
                </div>
                <span className="text-[10px] text-white/40 group-hover:text-[#D4AF37] tracking-wider uppercase transition-colors">Barman</span>
              </button>
              <button
                onClick={() => quickLogin('ion.popescu@email.com', 'client123')}
                disabled={isLoading}
                className="group flex flex-col items-center gap-2 p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-[#D4AF37]/30 hover:bg-[#D4AF37]/5 transition-all duration-500 disabled:opacity-50"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#D4AF37]/20 to-[#D4AF37]/5 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                  <CreditCard className="w-4 h-4 text-[#D4AF37]" />
                </div>
                <span className="text-[10px] text-white/40 group-hover:text-[#D4AF37] tracking-wider uppercase transition-colors">Client</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-[10px] text-white/20 tracking-[0.2em] uppercase">
            © 2024 Merlot Nightclub — Powered by NFC
          </p>
        </div>
      </div>
    </div>
  );
}
