import { useState, useEffect } from 'react';
import { useStore } from '../store';
import { supabase } from '../lib/supabase';
import { LuxuryBackground, OrnamentDivider, LuxuryButton, LuxuryInput } from '../components/LuxuryUI';
import { Wine, KeyRound, CheckCircle, AlertCircle } from 'lucide-react';

export default function ResetPasswordPage() {
  const { login } = useStore();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isValidToken, setIsValidToken] = useState(true);

  useEffect(() => {
    // Verifică dacă există un token de resetare în URL
    const hash = window.location.hash;
    if (!hash || !hash.includes('access_token')) {
      setIsValidToken(false);
    }
  }, []);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Parola trebuie să aibă minim 6 caractere');
      return;
    }

    if (password !== confirmPassword) {
      setError('Parolele nu se potrivesc');
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) throw error;

      setSuccess(true);

      // După 3 secunde, redirecționează la login
      setTimeout(() => {
        window.location.href = '/';
      }, 3000);
    } catch (err: any) {
      setError(err?.message || 'Eroare la resetarea parolei');
    }
    setIsLoading(false);
  };

  if (!isValidToken) {
    return (
      <div className="min-h-screen min-h-[100dvh] relative flex flex-col items-center justify-center px-5 py-10">
        <LuxuryBackground />
        
        <div className="relative z-10 w-full max-w-md animate-fade-in">
          <div className="card-luxury text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-red-500/20 to-red-500/5 flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-red-400" />
            </div>
            <h2 className="font-display text-2xl text-white mb-2">Link Invalid</h2>
            <p className="text-sm text-white/60 mb-6">
              Link-ul de resetare a parolei este invalid sau a expirat.
            </p>
            <a href="/" className="btn-luxury inline-block">
              Înapoi la Autentificare
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen min-h-[100dvh] relative flex flex-col items-center justify-center px-5 py-10">
      <LuxuryBackground />
      
      <div className="relative z-10 w-full max-w-md animate-fade-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="relative inline-block mb-6">
            <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-[#722F37] to-[#3d1a1f] flex items-center justify-center glow-wine relative">
              <KeyRound className="w-9 h-9 text-[#D4AF37]" strokeWidth={1.5} />
              <div className="absolute inset-[-4px] rounded-full border border-[#D4AF37]/20 animate-rotate-slow" />
              <div className="absolute inset-[-8px] rounded-full border border-[#D4AF37]/10" />
            </div>
          </div>
          <h1 className="font-display text-4xl text-white font-medium tracking-tight mb-2">
            Resetare Parolă
          </h1>
          <div className="ornament-line w-24 mx-auto mb-3" />
          <p className="font-accent text-[#D4AF37]/80 text-sm tracking-[0.4em] uppercase italic">
            Merlot VIP
          </p>
        </div>

        {/* Card */}
        <div className="card-luxury animate-slide-up">
          {!success ? (
            <form onSubmit={handleResetPassword} className="space-y-5">
              <div className="text-center mb-4">
                <p className="text-xs text-white/40">
                  Introduceți noua parolă pentru contul dvs.
                </p>
              </div>

              <LuxuryInput
                label="Parolă Nouă"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Minim 6 caractere"
                required
              />

              <LuxuryInput
                label="Confirmă Parola"
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Reintroduceți parola"
                required
              />

              {error && (
                <p className="text-red-400/80 text-xs text-center animate-fade-in">{error}</p>
              )}

              <LuxuryButton type="submit" variant="wine" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Se resetează...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    Resetează Parola <KeyRound className="w-4 h-4" />
                  </span>
                )}
              </LuxuryButton>
            </form>
          ) : (
            <div className="text-center py-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-emerald-400" />
              </div>
              <h3 className="font-display text-xl text-white mb-2">Parolă Resetată!</h3>
              <p className="text-sm text-white/60 mb-4">
                Parola a fost resetată cu succes.
              </p>
              <p className="text-xs text-white/40">
                Veți fi redirecționat automat la pagina de autentificare...
              </p>
            </div>
          )}
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
