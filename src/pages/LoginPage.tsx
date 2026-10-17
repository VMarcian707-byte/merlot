import { useState } from 'react';
import { useStore } from '../store';
import { auth, mockStore } from '../lib/supabase';
import { LuxuryBackground, OrnamentDivider, LuxuryButton, LuxuryInput } from '../components/LuxuryUI';
import EmailPreviewModal from '../components/EmailPreviewModal';
import { Wine, Sparkles, ArrowRight, Database, Mail, CheckCircle, Eye, Copy, Check, ExternalLink, KeyRound } from 'lucide-react';

export default function LoginPage() {
  const { login, registerClient } = useStore();
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [resetDelivery, setResetDelivery] = useState<'email' | 'demo' | null>(null);
  const [resetError, setResetError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [resetData, setResetData] = useState<{
    email: string;
    name: string;
    resetUrl: string;
    token: string;
  } | null>(null);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 600));
    const success = await login(email, password);
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
      setError('Introduceți adresa de email.');
      return;
    }
    setIsLoading(true);
    try {
      const record = await auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/reset-password'
      });
      const targetUser = mockStore.getUserByEmail(email);
      setResetData({
        email: email,
        name: targetUser ? targetUser.name : email.split('@')[0],
        resetUrl: record.resetUrl,
        token: record.token,
      });
      // Reflectă REALIV statusul livrării email-ului (nu promite un email care nu a fost trimis)
      setResetDelivery(record.delivered ? 'email' : 'demo');
      setResetError(record.delivered ? null : (record as any).error ?? null);
      setResetSent(true);
    } catch (err: any) {
      setError(err?.message || 'Eroare la generarea cererii de resetare');
    } finally {
      setIsLoading(false);
    }
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
              
              <div className="pt-2">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-[1px] flex-1 bg-white/10" />
                  <span className="text-[10px] uppercase tracking-wider text-[#D4AF37]/60">Demo Quick Access</span>
                  <div className="h-[1px] flex-1 bg-white/10" />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => { setEmail('manager@merlot.ro'); setPassword('Manager123!'); }}
                    className="p-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/5 hover:border-[#D4AF37]/30 text-[11px] text-white/80 transition-all text-center cursor-pointer"
                  >
                    👑 Manager
                  </button>
                  <button
                    type="button"
                    onClick={() => { setEmail('barman@merlot.ro'); setPassword('Barman123!'); }}
                    className="p-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/5 hover:border-[#D4AF37]/30 text-[11px] text-white/80 transition-all text-center cursor-pointer"
                  >
                    🍸 Barman
                  </button>
                  <button
                    type="button"
                    onClick={() => { setEmail('client@merlot.ro'); setPassword('Client123!'); }}
                    className="p-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/5 hover:border-[#D4AF37]/30 text-[11px] text-white/80 transition-all text-center cursor-pointer"
                  >
                    🎩 Client VIP
                  </button>
                </div>
              </div>

              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => { setMode('forgot'); setError(''); }}
                  className="text-xs text-[#D4AF37]/60 hover:text-[#D4AF37] transition-colors cursor-pointer"
                >
                  Am uitat parola
                </button>
              </div>
            </form>
          )}

          {mode === 'forgot' && (
            <div className="space-y-5 animate-fade-in">
              {!resetSent ? (
                <form onSubmit={handleForgotPassword} className="space-y-5">
                  <div className="text-center mb-4">
                    <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-br from-[#722F37] to-[#3a131b] border border-[#D4AF37]/40 flex items-center justify-center glow-wine">
                      <KeyRound className="w-8 h-8 text-[#D4AF37]" />
                    </div>
                    <h3 className="font-display text-xl text-white mb-1">Resetare Parolă VIP</h3>
                    <p className="text-xs text-white/50">
                      Introduceți adresa de email pentru a genera link-ul securizat de resetare
                    </p>
                  </div>

                  {/* Preset quick test helper */}
                  <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 space-y-2">
                    <span className="text-[10px] uppercase tracking-wider text-[#D4AF37]/80 block font-mono">
                      Conturi Demo — Test Rapid Resetare:
                    </span>
                    <div className="grid grid-cols-3 gap-1.5">
                      <button
                        type="button"
                        onClick={() => setEmail('client@merlot.ro')}
                        className={`p-1.5 rounded-lg border text-[11px] transition-all cursor-pointer truncate ${
                          email === 'client@merlot.ro'
                            ? 'bg-[#722F37]/50 border-[#D4AF37] text-white'
                            : 'bg-white/5 border-white/5 text-white/70 hover:bg-white/10'
                        }`}
                      >
                        🎩 Client VIP
                      </button>
                      <button
                        type="button"
                        onClick={() => setEmail('barman@merlot.ro')}
                        className={`p-1.5 rounded-lg border text-[11px] transition-all cursor-pointer truncate ${
                          email === 'barman@merlot.ro'
                            ? 'bg-[#722F37]/50 border-[#D4AF37] text-white'
                            : 'bg-white/5 border-white/5 text-white/70 hover:bg-white/10'
                        }`}
                      >
                        🍸 Barman
                      </button>
                      <button
                        type="button"
                        onClick={() => setEmail('manager@merlot.ro')}
                        className={`p-1.5 rounded-lg border text-[11px] transition-all cursor-pointer truncate ${
                          email === 'manager@merlot.ro'
                            ? 'bg-[#722F37]/50 border-[#D4AF37] text-white'
                            : 'bg-white/5 border-white/5 text-white/70 hover:bg-white/10'
                        }`}
                      >
                        👑 Manager
                      </button>
                    </div>
                  </div>

                  <LuxuryInput
                    label="Adresă Email"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="email@merlot.ro"
                    required
                  />

                  {error && (
                    <p className="text-red-400 text-xs text-center animate-fade-in bg-red-500/10 p-2.5 rounded-lg border border-red-500/20">
                      {error}
                    </p>
                  )}

                  <LuxuryButton type="submit" variant="wine" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Se generează cererea...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        Generează & Trimite Email VIP <Mail className="w-4 h-4 text-[#D4AF37]" />
                      </span>
                    )}
                  </LuxuryButton>

                  <div className="flex items-center justify-between pt-1">
                    <button
                      type="button"
                      onClick={() => { setMode('login'); setError(''); }}
                      className="text-xs text-white/40 hover:text-white/70 transition-colors cursor-pointer"
                    >
                      ← Înapoi la autentificare
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setResetData({
                          email: email || 'client@merlot.ro',
                          name: 'Client VIP',
                          resetUrl: `${window.location.origin}/reset-password?email=${encodeURIComponent(email || 'client@merlot.ro')}&token=demo_token`,
                          token: 'demo_token',
                        });
                        setShowEmailModal(true);
                      }}
                      className="text-xs text-[#D4AF37]/80 hover:text-[#D4AF37] transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Previzualizează Șablonul
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4 py-2 animate-fade-in">
                  <div className="text-center">
                    <div className={`w-16 h-16 mx-auto mb-3 rounded-full border flex items-center justify-center glow-wine ${
                      resetDelivery === 'email'
                        ? 'bg-gradient-to-br from-emerald-500/20 to-[#722F37]/30 border-emerald-500/40'
                        : 'bg-gradient-to-br from-amber-500/20 to-[#722F37]/30 border-amber-500/40'
                    }`}>
                      {resetDelivery === 'email' ? (
                        <CheckCircle className="w-9 h-9 text-emerald-400" />
                      ) : (
                        <Mail className="w-9 h-9 text-amber-400" />
                      )}
                    </div>
                    <h3 className="font-display text-xl text-white mb-1">
                      {resetDelivery === 'email' ? 'Email VIP Trimis!' : 'Cerere Înregistrată (Mod Demo)'}
                    </h3>
                    <p className="text-xs text-white/60">
                      {resetDelivery === 'email'
                        ? 'Solicitarea securizată a fost trimisă către:'
                        : 'Nu s-a putut trimite emailul real. Link-ul de mai jos este functional în acest browser:'}
                    </p>
                    <div className="inline-block mt-2 px-3 py-1 rounded-full bg-white/5 border border-[#D4AF37]/30 text-xs text-[#D4AF37] font-medium font-mono">
                      {resetData?.email || email}
                    </div>
                    {resetDelivery === 'email' && (
                      <p className="text-[11px] text-white/40 mt-2">
                        Nu ați primit nimic? Verificați folderul <span className="text-white/70">Spam / Promotions</span>.
                      </p>
                    )}
                  </div>

                  {resetError && (
                    <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-[11px] text-red-300 leading-relaxed">
                      <strong>Motiv:</strong> {resetError}
                      <a
                        href="https://supabase.com/dashboard"
                        target="_blank"
                        rel="noreferrer"
                        className="block mt-1.5 text-[#D4AF37] underline underline-offset-2"
                      >
                        Deschide Supabase Dashboard → Authentication pentru remedieri →
                      </a>
                    </div>
                  )}

                  {/* Primary Direct Action */}
                  <div className="p-4 rounded-xl bg-gradient-to-br from-[#722F37]/30 to-black/60 border border-[#D4AF37]/40 space-y-3">
                    <div className="flex items-center gap-2 text-xs text-white/80">
                      <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                      <span>Testare Imediată (fără a deschide inbox-ul):</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        if (resetData?.resetUrl) {
                          window.location.href = resetData.resetUrl;
                        }
                      }}
                      className="w-full py-3 px-4 rounded-lg bg-gradient-to-r from-[#722F37] via-[#8B3A42] to-[#722F37] hover:brightness-110 text-white font-semibold text-xs tracking-wider uppercase border border-[#D4AF37]/40 shadow-xl flex items-center justify-center gap-2 cursor-pointer transition-all"
                    >
                      <span>⚡ Deschide Link & Resetează Acum</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setShowEmailModal(true)}
                        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] text-[#D4AF37] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Vezi Email & Cod</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (resetData?.resetUrl) {
                            navigator.clipboard.writeText(resetData.resetUrl);
                            setCopiedLink(true);
                            setTimeout(() => setCopiedLink(false), 2000);
                          }
                        }}
                        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] text-white/80 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedLink ? 'Copiat!' : 'Copiază Link'}</span>
                      </button>
                    </div>
                  </div>

                  <p className="text-[11px] text-white/40 text-center leading-relaxed">
                    💡 <strong className="text-white/60">Pentru producție:</strong> Apăsați pe <span className="text-[#D4AF37]">"Vezi Email & Cod"</span> pentru a copia șablonul HTML în setările Supabase Dashboard.
                  </p>

                  <div className="pt-2 flex items-center justify-between text-xs">
                    <button
                      type="button"
                      onClick={() => { setResetSent(false); setResetDelivery(null); setResetError(null); }}
                      className="text-white/40 hover:text-white/70 transition-colors cursor-pointer"
                    >
                      ← Trimite pentru alt cont
                    </button>
                    <button
                      type="button"
                      onClick={() => { setMode('login'); setResetSent(false); setResetDelivery(null); setResetError(null); }}
                      className="text-[#D4AF37]/80 hover:text-[#D4AF37] transition-colors cursor-pointer"
                    >
                      Înapoi la Autentificare
                    </button>
                  </div>
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

      {/* Luxury Email Preview & Supabase Template Modal */}
      <EmailPreviewModal
        isOpen={showEmailModal}
        onClose={() => setShowEmailModal(false)}
        recipientName={resetData?.name || 'Client VIP'}
        recipientEmail={resetData?.email || email || 'client@merlot.ro'}
        resetUrl={resetData?.resetUrl || `${window.location.origin}/reset-password?email=${encodeURIComponent(email || 'client@merlot.ro')}&token=demo_token`}
        onNavigateToReset={() => {
          setShowEmailModal(false);
          if (resetData?.resetUrl) {
            window.location.href = resetData.resetUrl;
          }
        }}
      />
    </div>
  );
}
