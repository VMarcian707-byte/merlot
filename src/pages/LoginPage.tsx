import { useState } from 'react';
import { useStore } from '../store';
import { Wine, Shield, Smartphone, CreditCard } from 'lucide-react';

export default function LoginPage() {
  const { login, registerClient } = useStore();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const success = login(email, password);
    if (!success) {
      setError('Email sau parolă incorectă');
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!name || !phone || !email) {
      setError('Completați toate câmpurile');
      return;
    }
    registerClient(name, phone, email);
  };

  const quickLogin = (email: string, pass: string) => {
    setEmail(email);
    setPassword(pass);
    login(email, pass);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#1a0a0e] to-[#0a0a0a] flex flex-col items-center justify-center p-4">
      {/* Logo */}
      <div className="mb-8 text-center">
        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#722F37] to-[#C4A35A] flex items-center justify-center shadow-2xl shadow-[#722F37]/30">
          <Wine className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-white tracking-tight">MERLOT</h1>
        <p className="text-[#C4A35A] text-sm font-medium tracking-widest uppercase mt-1">VIP Fidelitate NFC</p>
      </div>

      {/* Card */}
      <div className="w-full max-w-md bg-[#1a1a1a]/90 backdrop-blur-xl border border-[#333] rounded-2xl p-6 shadow-2xl">
        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => { setMode('login'); setError(''); }}
            className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${mode === 'login' ? 'bg-[#722F37] text-white' : 'bg-[#222] text-gray-400 hover:text-white'}`}
          >
            Autentificare
          </button>
          <button
            onClick={() => { setMode('register'); setError(''); }}
            className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${mode === 'register' ? 'bg-[#722F37] text-white' : 'bg-[#222] text-gray-400 hover:text-white'}`}
          >
            Înregistrare
          </button>
        </div>

        {mode === 'login' ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1.5 uppercase tracking-wide">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:border-[#722F37] focus:ring-1 focus:ring-[#722F37] outline-none transition"
                placeholder="email@merlot.ro"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1.5 uppercase tracking-wide">Parolă</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:border-[#722F37] focus:ring-1 focus:ring-[#722F37] outline-none transition"
                placeholder="••••••••"
              />
            </div>
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-[#722F37] to-[#8B3A42] text-white py-3 rounded-lg font-semibold hover:from-[#8B3A42] hover:to-[#722F37] transition-all shadow-lg shadow-[#722F37]/20"
            >
              Intră în cont
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1.5 uppercase tracking-wide">Nume complet</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:border-[#722F37] focus:ring-1 focus:ring-[#722F37] outline-none transition"
                placeholder="Nume Prenume"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1.5 uppercase tracking-wide">Telefon</label>
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:border-[#722F37] focus:ring-1 focus:ring-[#722F37] outline-none transition"
                placeholder="+40 7XX XXX XXX"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1.5 uppercase tracking-wide">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:border-[#722F37] focus:ring-1 focus:ring-[#722F37] outline-none transition"
                placeholder="email@exemplu.ro"
              />
            </div>
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-[#722F37] to-[#8B3A42] text-white py-3 rounded-lg font-semibold hover:from-[#8B3A42] hover:to-[#722F37] transition-all shadow-lg shadow-[#722F37]/20"
            >
              Creează cont client
            </button>
          </form>
        )}

        {/* Quick Login */}
        <div className="mt-6 pt-6 border-t border-[#333]">
          <p className="text-xs text-gray-500 mb-3 text-center uppercase tracking-wide">Demo — Autentificare rapidă:</p>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => quickLogin('manager@merlot.ro', 'manager123')}
              className="flex flex-col items-center gap-1.5 p-3 bg-[#222] rounded-lg hover:bg-[#2a2a2a] transition group"
            >
              <Shield className="w-5 h-5 text-[#C4A35A]" />
              <span className="text-[10px] text-gray-400 group-hover:text-white">Manager</span>
            </button>
            <button
              onClick={() => quickLogin('barman@merlot.ro', 'barman123')}
              className="flex flex-col items-center gap-1.5 p-3 bg-[#222] rounded-lg hover:bg-[#2a2a2a] transition group"
            >
              <Smartphone className="w-5 h-5 text-[#C4A35A]" />
              <span className="text-[10px] text-gray-400 group-hover:text-white">Barman</span>
            </button>
            <button
              onClick={() => quickLogin('ion.popescu@email.com', 'client123')}
              className="flex flex-col items-center gap-1.5 p-3 bg-[#222] rounded-lg hover:bg-[#2a2a2a] transition group"
            >
              <CreditCard className="w-5 h-5 text-[#C4A35A]" />
              <span className="text-[10px] text-gray-400 group-hover:text-white">Client</span>
            </button>
          </div>
        </div>
      </div>

      <p className="mt-6 text-xs text-gray-600 text-center">
        © 2024 Merlot Nightclub — Sistem VIP NFC v1.0
      </p>
    </div>
  );
}
