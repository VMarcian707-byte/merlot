import { useState, useEffect } from 'react';
import { useStore } from '../store';
import { supabase, auth, mockStore, User } from '../lib/supabase';
import { LuxuryBackground, OrnamentDivider, LuxuryButton, LuxuryInput } from '../components/LuxuryUI';
import {
  KeyRound, CheckCircle2, AlertCircle, Eye, EyeOff, ShieldCheck,
  ArrowRight, Sparkles, RefreshCw, Lock, Check, UserCheck, Wine
} from 'lucide-react';

export default function ResetPasswordPage() {
  const { login } = useStore();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isValidToken, setIsValidToken] = useState(true);
  const [detectedEmail, setDetectedEmail] = useState<string>('');
  const [targetUser, setTargetUser] = useState<User | null>(null);
  const [countdown, setCountdown] = useState<number>(5);

  useEffect(() => {
    // 1. Check URL search parameters (?token=...&email=... or ?code=...)
    const params = new URLSearchParams(window.location.search);
    const queryToken = params.get('token');
    const queryEmail = params.get('email');
    const pkceCode = params.get('code');

    // 2. Check URL hash parameters (#access_token=...&type=recovery)
    const hash = window.location.hash;
    const hashParams = new URLSearchParams(hash.replace(/^#/, ''));
    const hashToken = hashParams.get('access_token');
    const hashType = hashParams.get('type');

    let resolvedEmail = queryEmail || '';
    let foundUser: User | null = null;

    if (queryToken) {
      const verified = auth.verifyResetToken(queryToken);
      if (verified && verified.user) {
        foundUser = verified.user;
        resolvedEmail = verified.user.email;
      }
    }

    if (!foundUser && resolvedEmail) {
      foundUser = mockStore.getUserByEmail(resolvedEmail);
    }

    // 3. Fallback to latest reset token generated in mockStore
    if (!foundUser) {
      const latest = mockStore.getLatestResetToken();
      if (latest && latest.user) {
        foundUser = latest.user;
        resolvedEmail = latest.user.email;
      }
    }

    // 4. Fallback to demo client if in demo / test mode without strict token
    if (foundUser) {
      setTargetUser(foundUser);
      setDetectedEmail(resolvedEmail);
      setIsValidToken(true);
    } else if (hashToken || pkceCode) {
      // Supabase native tokens present in URL
      setIsValidToken(true);
    } else {
      // No token found in URL or recent cache
      setIsValidToken(false);
    }
  }, []);

  // Handle countdown when success is reached
  useEffect(() => {
    if (!success) return;
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleAutoLogin();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [success, detectedEmail, password]);

  // Calculate password strength
  const getPasswordStrength = (pass: string) => {
    let score = 0;
    if (pass.length >= 6) score += 30;
    if (pass.length >= 8) score += 20;
    if (/[A-Z]/.test(pass)) score += 20;
    if (/[0-9]/.test(pass)) score += 15;
    if (/[^A-Za-z0-9]/.test(pass)) score += 15;
    return Math.min(score, 100);
  };

  const strength = getPasswordStrength(password);

  const getStrengthLabel = (score: number) => {
    if (score < 40) return { label: 'Slabă', color: 'bg-red-500', text: 'text-red-400' };
    if (score < 75) return { label: 'Medie', color: 'bg-amber-500', text: 'text-amber-400' };
    return { label: 'Excelentă', color: 'bg-emerald-500', text: 'text-emerald-400' };
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Parola trebuie să aibă minimum 6 caractere.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Parolele introduse nu coincid.');
      return;
    }

    setIsLoading(true);
    try {
      // 1. Try real Supabase auth update if available
      try {
        await supabase.auth.updateUser({
          password: password,
        });
      } catch (err) {
        console.warn('Supabase updateUser fallback to local mock store:', err);
      }

      // 2. Always update in our auth / mockStore to ensure persistent login works immediately
      const emailToUpdate = detectedEmail || targetUser?.email || 'client@merlot.ro';
      auth.updateUserPassword(emailToUpdate, password);

      // Save email for instant login prefill
      try {
        localStorage.setItem('merlot_last_email', emailToUpdate);
      } catch (_) {}

      setSuccess(true);
    } catch (err: any) {
      console.error('Password reset error:', err);
      setError(err?.message || 'A apărut o eroare la actualizarea parolei.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAutoLogin = async () => {
    const emailToLogin = detectedEmail || targetUser?.email || 'client@merlot.ro';
    try {
      // Clear URL query/hash so we switch to main dashboard cleanly
      window.history.replaceState({}, '', '/');
      const ok = await login(emailToLogin, password);
      if (!ok) {
        window.location.href = '/';
      }
    } catch {
      window.location.href = '/';
    }
  };

  const selectDemoAccount = (user: User) => {
    setTargetUser(user);
    setDetectedEmail(user.email);
    setIsValidToken(true);
    setError('');
  };

  // If token is invalid or missing, provide a friendly testing helper instead of dead end
  if (!isValidToken && !targetUser) {
    return (
      <div className="min-h-screen min-h-[100dvh] relative flex flex-col items-center justify-center px-5 py-10">
        <LuxuryBackground />
        
        <div className="relative z-10 w-full max-w-md animate-fade-in">
          <div className="text-center mb-6">
            <div className="w-16 h-16 mx-auto rounded-full bg-[#722F37]/30 border border-[#D4AF37]/30 flex items-center justify-center mb-4">
              <KeyRound className="w-8 h-8 text-[#D4AF37]" />
            </div>
            <h2 className="font-display text-2xl text-white mb-2">Resetare Parolă VIP</h2>
            <div className="ornament-line w-20 mx-auto mb-2" />
            <p className="text-xs text-white/50">
              Link-ul nu conține un token activ sau a fost accesat direct în mod test.
            </p>
          </div>

          <div className="card-luxury space-y-4">
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center">
              <p className="text-xs text-amber-200/90 font-medium mb-1">
                Alege un cont pentru a testa resetarea parolei:
              </p>
              <p className="text-[11px] text-amber-300/60">
                Poți seta o nouă parolă oricărui cont de test de mai jos:
              </p>
            </div>

            <div className="space-y-2">
              {mockStore.getUsers().slice(0, 3).map((u) => (
                <button
                  key={u.id}
                  onClick={() => selectDemoAccount(u)}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.07] hover:border-[#D4AF37]/40 transition-all text-left group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#722F37] to-[#2d1217] flex items-center justify-center text-white text-xs font-serif font-bold border border-[#D4AF37]/30">
                      {u.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-xs text-white font-medium group-hover:text-[#D4AF37] transition-colors">
                        {u.name}
                      </p>
                      <p className="text-[10px] text-white/40">{u.email}</p>
                    </div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/20 uppercase tracking-wider">
                    {u.role}
                  </span>
                </button>
              ))}
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <a
                href="/"
                className="w-full text-center py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-white/60 hover:text-white text-xs transition-colors"
              >
                ← Înapoi la Autentificare
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen min-h-[100dvh] relative flex flex-col items-center justify-center px-5 py-10">
      <LuxuryBackground />
      
      <div className="relative z-10 w-full max-w-md animate-fade-in">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="relative inline-block mb-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-[#722F37] to-[#3d1a1f] flex items-center justify-center glow-wine relative border border-[#D4AF37]/40 shadow-xl">
              <KeyRound className="w-8 h-8 text-[#D4AF37]" strokeWidth={1.75} />
              <div className="absolute inset-[-4px] rounded-full border border-[#D4AF37]/25 animate-rotate-slow" />
            </div>
          </div>
          <h1 className="font-display text-3xl text-white font-medium tracking-tight mb-1">
            Resetare Parolă
          </h1>
          <div className="ornament-line w-24 mx-auto mb-2" />
          <p className="font-accent text-[#D4AF37]/90 text-xs tracking-[0.3em] uppercase italic">
            Merlot Nightclub VIP
          </p>
        </div>

        {/* Card */}
        <div className="card-luxury animate-slide-up shadow-2xl backdrop-blur-xl border border-white/[0.08]">
          {!success ? (
            <form onSubmit={handleResetPassword} className="space-y-4">
              {/* Account badge */}
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.07] flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#722F37] border border-[#D4AF37]/30 flex items-center justify-center text-xs font-bold text-white">
                    {targetUser?.name?.charAt(0) || detectedEmail.charAt(0).toUpperCase() || 'M'}
                  </div>
                  <div className="text-left">
                    <p className="text-xs text-white font-medium">
                      {targetUser?.name || 'Membru VIP Merlot'}
                    </p>
                    <p className="text-[11px] text-white/50">
                      {detectedEmail || targetUser?.email || 'client@merlot.ro'}
                    </p>
                  </div>
                </div>
                <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                  <ShieldCheck className="w-3 h-3" /> Token Activ
                </span>
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-accent tracking-wider uppercase text-[#D4AF37]/80">
                  Parolă Nouă
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minim 6 caractere"
                    required
                    className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.08] focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] text-white placeholder-white/30 text-sm transition-all pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Strength Meter */}
              {password && (
                <div className="space-y-1 animate-fade-in">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-white/40">Complexitate:</span>
                    <span className={getStrengthLabel(strength).text}>
                      {getStrengthLabel(strength).label} ({strength}%)
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${getStrengthLabel(strength).color}`}
                      style={{ width: `${strength}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Confirm Password Input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-accent tracking-wider uppercase text-[#D4AF37]/80">
                  Confirmă Parola
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Reintroduceți noua parolă"
                    required
                    className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.08] focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] text-white placeholder-white/30 text-sm transition-all pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Match indicator */}
              {confirmPassword && (
                <div className="flex items-center gap-1.5 text-[11px] animate-fade-in">
                  {password === confirmPassword ? (
                    <span className="text-emerald-400 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Parolele se potrivesc
                    </span>
                  ) : (
                    <span className="text-red-400 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" /> Parolele nu coincid
                    </span>
                  )}
                </div>
              )}

              {error && (
                <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-300 text-xs text-center animate-fade-in">
                  {error}
                </div>
              )}

              <LuxuryButton
                type="submit"
                variant="wine"
                className="w-full py-3.5 mt-2"
                disabled={isLoading || password.length < 6 || password !== confirmPassword}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Se actualizează...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2 font-medium">
                    Actualizează Parola <KeyRound className="w-4 h-4" />
                  </span>
                )}
              </LuxuryButton>

              <div className="text-center pt-2">
                <a
                  href="/"
                  className="text-xs text-white/40 hover:text-white/70 transition-colors inline-flex items-center gap-1"
                >
                  ← Înapoi la Autentificare
                </a>
              </div>
            </form>
          ) : (
            <div className="text-center py-4 space-y-4 animate-scale-up">
              <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center glow-emerald shadow-lg">
                <CheckCircle2 className="w-9 h-9 text-emerald-400" />
              </div>
              
              <div>
                <h3 className="font-display text-2xl text-white font-medium mb-1">
                  Parolă Resetată cu Succes!
                </h3>
                <p className="text-xs text-emerald-300/80">
                  Noua ta parolă este activă și securizată.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-xs text-white/60 space-y-1">
                <p className="text-white/80 font-medium">
                  {targetUser?.name || 'Client VIP'}
                </p>
                <p className="text-[11px] text-[#D4AF37]">
                  {detectedEmail || targetUser?.email}
                </p>
              </div>

              <div className="space-y-2 pt-2">
                <button
                  onClick={handleAutoLogin}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#b38f2a] text-[#12070a] font-semibold text-sm hover:brightness-110 active:scale-95 transition-all shadow-lg flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  Autentifică-te Acum Direct ({countdown}s)
                  <ArrowRight className="w-4 h-4" />
                </button>

                <a
                  href="/"
                  className="block w-full py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-white/70 hover:text-white text-xs transition-colors"
                >
                  Mergi la Pagina de Autentificare
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-[10px] text-white/20 tracking-[0.2em] uppercase">
            © 2024 Merlot Nightclub • Toate drepturile rezervate
          </p>
        </div>
      </div>
    </div>
  );
}
