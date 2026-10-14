import { useState } from 'react';
import { useStore } from '../store';
import {
  LogOut, Users, CreditCard, Bell, BarChart3, Settings, Plus,
  Ban, CheckCircle, XCircle, Send, Calendar, Clock, Percent,
  TrendingUp, UserCheck, ScanLine, Shield
} from 'lucide-react';

type AdminTab = 'dashboard' | 'cards' | 'rules' | 'notifications' | 'docs';

export default function AdminPanel() {
  const {
    currentUser, logout, users, nfcCards, visitsLog, announcements,
    discountRules, assignCard, blockCard, addAnnouncement, addNFCCard, toggleDiscountRule
  } = useStore();
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');

  // Notification form state
  const [annTitle, setAnnTitle] = useState('');
  const [annMessage, setAnnMessage] = useState('');
  const [annDate, setAnnDate] = useState('');
  const [annTarget, setAnnTarget] = useState<'all' | 'vip' | 'regular'>('all');
  const [annSent, setAnnSent] = useState(false);

  if (!currentUser) return null;

  const clients = users.filter(u => u.role === 'client');
  const activeCards = nfcCards.filter(c => c.status === 'active');
  const unassignedCards = nfcCards.filter(c => c.status === 'unassigned');
  const blockedCards = nfcCards.filter(c => c.status === 'blocked');
  const totalVisits = visitsLog.length;
  const todayVisits = visitsLog.filter(v => new Date(v.scanned_at).toDateString() === new Date().toDateString()).length;
  const totalDiscountsGiven = visitsLog.reduce((sum, v) => sum + v.discount_applied, 0);

  const handleSendAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (annTitle && annMessage && annDate) {
      addAnnouncement(annTitle, annMessage, annDate, annTarget);
      setAnnTitle('');
      setAnnMessage('');
      setAnnDate('');
      setAnnSent(true);
      setTimeout(() => setAnnSent(false), 3000);
    }
  };

  const handleAssignCard = (cardId: string, userId: string) => {
    assignCard(cardId, userId);
  };

  const dayNames = ['Dum', 'Lun', 'Mar', 'Mie', 'Joi', 'Vin', 'Sâm'];

  const tabs: { id: AdminTab; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Stats', icon: <BarChart3 className="w-5 h-5" /> },
    { id: 'cards', label: 'Carduri', icon: <CreditCard className="w-5 h-5" /> },
    { id: 'rules', label: 'Reguli', icon: <Settings className="w-5 h-5" /> },
    { id: 'notifications', label: 'Notificări', icon: <Bell className="w-5 h-5" /> },
    { id: 'docs', label: 'Docs', icon: <Shield className="w-5 h-5" /> },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pb-20">
      {/* Header */}
      <div className="bg-[#111] border-b border-[#222] px-5 py-4">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-[#C4A35A] text-xs uppercase tracking-widest">Admin Panel</p>
            <h1 className="text-lg font-bold">Merlot Management</h1>
          </div>
          <button onClick={logout} className="p-2 rounded-lg bg-[#222] hover:bg-[#333] transition">
            <LogOut className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </div>

      <div className="p-4">
        {/* Dashboard */}
        {activeTab === 'dashboard' && (
          <div className="space-y-4">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gradient-to-br from-[#722F37]/20 to-[#722F37]/5 border border-[#722F37]/30 rounded-xl p-4">
                <Users className="w-6 h-6 text-[#C4A35A] mb-2" />
                <p className="text-2xl font-bold text-white">{clients.length}</p>
                <p className="text-xs text-gray-400">Clienți VIP</p>
              </div>
              <div className="bg-gradient-to-br from-green-500/10 to-green-500/5 border border-green-500/20 rounded-xl p-4">
                <UserCheck className="w-6 h-6 text-green-400 mb-2" />
                <p className="text-2xl font-bold text-white">{activeCards.length}</p>
                <p className="text-xs text-gray-400">Carduri Active</p>
              </div>
              <div className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/20 rounded-xl p-4">
                <ScanLine className="w-6 h-6 text-blue-400 mb-2" />
                <p className="text-2xl font-bold text-white">{totalVisits}</p>
                <p className="text-xs text-gray-400">Total Vizite</p>
              </div>
              <div className="bg-gradient-to-br from-[#C4A35A]/10 to-[#C4A35A]/5 border border-[#C4A35A]/20 rounded-xl p-4">
                <TrendingUp className="w-6 h-6 text-[#C4A35A] mb-2" />
                <p className="text-2xl font-bold text-white">{todayVisits}</p>
                <p className="text-xs text-gray-400">Vizite Azi</p>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-[#1a1a1a] border border-[#333] rounded-xl p-4">
              <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#C4A35A]" />
                Activitate recentă
              </h3>
              <div className="space-y-2">
                {[...visitsLog].reverse().slice(0, 5).map(visit => {
                  const client = users.find(u => u.id === visit.client_id);
                  return (
                    <div key={visit.id} className="flex items-center justify-between bg-[#111] rounded-lg p-3">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{client?.avatar || '🎫'}</span>
                        <div>
                          <p className="text-sm text-white">{client?.name}</p>
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

            {/* Card Status Summary */}
            <div className="bg-[#1a1a1a] border border-[#333] rounded-xl p-4">
              <h3 className="font-semibold text-white mb-3">Status Carduri NFC</h3>
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                  <span className="text-sm text-gray-300">{activeCards.length} Active</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <span className="text-sm text-gray-300">{unassignedCards.length} Neasociate</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <span className="text-sm text-gray-300">{blockedCards.length} Blocate</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Cards Management */}
        {activeTab === 'cards' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold">Management Carduri NFC</h2>
              <button
                onClick={addNFCCard}
                className="bg-[#722F37] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#8B3A42] transition flex items-center gap-1"
              >
                <Plus className="w-4 h-4" /> Card Nou
              </button>
            </div>

            {/* Unassigned Cards */}
            {unassignedCards.length > 0 && (
              <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-xl p-4">
                <h3 className="text-sm font-semibold text-yellow-400 mb-3">Carduri neasociate ({unassignedCards.length})</h3>
                <div className="space-y-2">
                  {unassignedCards.map(card => (
                    <div key={card.id} className="bg-[#111] rounded-lg p-3">
                      <p className="text-xs font-mono text-gray-400 mb-2">{card.card_uuid}</p>
                      <div className="flex gap-2">
                        <select
                          className="flex-1 bg-[#0a0a0a] border border-[#333] rounded-lg px-3 py-2 text-sm text-white outline-none"
                          onChange={(e) => e.target.value && handleAssignCard(card.id, e.target.value)}
                          defaultValue=""
                        >
                          <option value="" disabled>Asociază client...</option>
                          {clients.map(c => (
                            <option key={c.id} value={c.id}>{c.name} ({c.phone})</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* All Cards */}
            <div className="bg-[#1a1a1a] border border-[#333] rounded-xl p-4">
              <h3 className="text-sm font-semibold text-white mb-3">Toate cardurile ({nfcCards.length})</h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {nfcCards.map(card => {
                  const client = users.find(u => u.id === card.assigned_user_id);
                  return (
                    <div key={card.id} className="bg-[#111] rounded-lg p-3 flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${card.status === 'active' ? 'bg-green-400' : card.status === 'blocked' ? 'bg-red-400' : 'bg-yellow-400'}`} />
                          <p className="text-sm text-white truncate">{client?.name || 'Neasociat'}</p>
                        </div>
                        <p className="text-xs font-mono text-gray-500 mt-1 truncate">{card.card_uuid}</p>
                      </div>
                      {card.status === 'active' && (
                        <button
                          onClick={() => blockCard(card.id)}
                          className="ml-2 p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 transition"
                          title="Blochează card"
                        >
                          <Ban className="w-4 h-4 text-red-400" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Discount Rules */}
        {activeTab === 'rules' && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold">Reguli de Discount</h2>
            <div className="space-y-3">
              {discountRules.map(rule => (
                <div key={rule.id} className={`bg-[#1a1a1a] border rounded-xl p-4 ${rule.is_active ? 'border-[#333]' : 'border-[#222] opacity-60'}`}>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-white">{rule.name}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${rule.is_active ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
                          {rule.is_active ? 'Activ' : 'Inactiv'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-400 mt-1">{rule.description}</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <span className="text-xs bg-[#222] text-gray-300 px-2 py-1 rounded">
                          {rule.start_time} - {rule.end_time}
                        </span>
                        <span className="text-xs bg-[#222] text-gray-300 px-2 py-1 rounded">
                          {rule.valid_days.map(d => dayNames[d]).join(', ')}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className="text-xl font-bold text-[#C4A35A]">-{rule.discount_percentage}%</span>
                      <button
                        onClick={() => toggleDiscountRule(rule.id)}
                        className={`p-2 rounded-lg transition ${rule.is_active ? 'bg-red-500/10 hover:bg-red-500/20' : 'bg-green-500/10 hover:bg-green-500/20'}`}
                      >
                        {rule.is_active ? <XCircle className="w-4 h-4 text-red-400" /> : <CheckCircle className="w-4 h-4 text-green-400" />}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Notifications */}
        {activeTab === 'notifications' && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold">Trimite Notificare</h2>

            {/* Form */}
            <form onSubmit={handleSendAnnouncement} className="bg-[#1a1a1a] border border-[#333] rounded-xl p-4 space-y-3">
              <div>
                <label className="block text-xs text-gray-400 mb-1.5 uppercase tracking-wide">Titlu</label>
                <input
                  type="text"
                  value={annTitle}
                  onChange={e => setAnnTitle(e.target.value)}
                  className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-2.5 text-white placeholder-gray-600 focus:border-[#722F37] outline-none"
                  placeholder="🎉 Titlu eveniment..."
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1.5 uppercase tracking-wide">Mesaj</label>
                <textarea
                  value={annMessage}
                  onChange={e => setAnnMessage(e.target.value)}
                  className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-2.5 text-white placeholder-gray-600 focus:border-[#722F37] outline-none resize-none h-24"
                  placeholder="Detalii eveniment sau ofertă..."
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5 uppercase tracking-wide">Data eveniment</label>
                  <input
                    type="datetime-local"
                    value={annDate}
                    onChange={e => setAnnDate(e.target.value)}
                    className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-3 py-2.5 text-white focus:border-[#722F37] outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5 uppercase tracking-wide">Destinatar</label>
                  <select
                    value={annTarget}
                    onChange={e => setAnnTarget(e.target.value as any)}
                    className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-3 py-2.5 text-white focus:border-[#722F37] outline-none"
                  >
                    <option value="all">Toți clienții</option>
                    <option value="vip">Doar VIP</option>
                    <option value="regular">Doar Regular</option>
                  </select>
                </div>
              </div>
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-[#722F37] to-[#8B3A42] text-white py-3 rounded-lg font-semibold hover:from-[#8B3A42] hover:to-[#722F37] transition-all flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                Trimite Notificarea
              </button>
              {annSent && (
                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 text-center">
                  <p className="text-green-400 text-sm font-medium">✅ Notificare trimisă cu succes!</p>
                </div>
              )}
            </form>

            {/* Previous Announcements */}
            <div className="bg-[#1a1a1a] border border-[#333] rounded-xl p-4">
              <h3 className="text-sm font-semibold text-white mb-3">Notificări trimise ({announcements.length})</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {announcements.map(ann => (
                  <div key={ann.id} className="bg-[#111] rounded-lg p-3">
                    <div className="flex justify-between items-start">
                      <p className="text-sm text-white font-medium">{ann.title}</p>
                      <span className="text-xs bg-[#722F37]/20 text-[#C4A35A] px-2 py-0.5 rounded-full">
                        {ann.target}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">{ann.message}</p>
                    <p className="text-xs text-gray-600 mt-1">
                      {new Date(ann.created_at).toLocaleString('ro-RO', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Documentation */}
        {activeTab === 'docs' && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold">Documentație Tehnică</h2>

            {/* DB Schema */}
            <div className="bg-[#1a1a1a] border border-[#333] rounded-xl p-4">
              <h3 className="text-sm font-semibold text-[#C4A35A] mb-3 flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Secțiunea A: Schema Bază de Date (PostgreSQL)
              </h3>
              <pre className="bg-[#0a0a0a] rounded-lg p-3 text-xs text-green-300 overflow-x-auto font-mono leading-relaxed">
{`-- TABEL: users
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) UNIQUE,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('client','barman','manager')),
  avatar VARCHAR(10),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- TABEL: nfc_cards
CREATE TABLE nfc_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_uuid VARCHAR(36) UNIQUE NOT NULL,
  assigned_user_id UUID REFERENCES users(id),
  status VARCHAR(20) DEFAULT 'unassigned'
    CHECK (status IN ('active','blocked','unassigned')),
  issued_at TIMESTAMPTZ DEFAULT NOW()
);

-- TABEL: discount_rules
CREATE TABLE discount_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  discount_percentage INTEGER NOT NULL CHECK (discount_percentage BETWEEN 0 AND 100),
  valid_days INTEGER[] NOT NULL, -- [0-6]
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- TABEL: visits_log
CREATE TABLE visits_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id UUID REFERENCES nfc_cards(id),
  client_id UUID REFERENCES users(id),
  barman_id UUID REFERENCES users(id),
  discount_applied INTEGER DEFAULT 0,
  scanned_at TIMESTAMPTZ DEFAULT NOW()
);

-- TABEL: announcements
CREATE TABLE announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  event_date TIMESTAMPTZ,
  target VARCHAR(20) DEFAULT 'all'
    CHECK (target IN ('all','vip','regular')),
  created_by_manager_id UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- INDEXURI
CREATE INDEX idx_nfc_cards_uuid ON nfc_cards(card_uuid);
CREATE INDEX idx_nfc_cards_user ON nfc_cards(assigned_user_id);
CREATE INDEX idx_visits_client ON visits_log(client_id);
CREATE INDEX idx_visits_date ON visits_log(scanned_at);
CREATE INDEX idx_announcements_target ON announcements(target);`}
              </pre>
            </div>

            {/* Auth Flow */}
            <div className="bg-[#1a1a1a] border border-[#333] rounded-xl p-4">
              <h3 className="text-sm font-semibold text-[#C4A35A] mb-3 flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Secțiunea B: Flux Autentificare & Redirecționare
              </h3>
              <div className="bg-[#0a0a0a] rounded-lg p-3 text-xs text-gray-300 space-y-2">
                <p className="text-white font-medium">Flux Login:</p>
                <p>1. POST /api/auth/login → {`{ email, password }`}</p>
                <p>2. Server verifică credentials → returnează JWT cu role</p>
                <p>3. Frontend decodează JWT și redirecționează:</p>
                <div className="ml-4 space-y-1 text-green-300">
                  <p>• role=client → /dashboard-client</p>
                  <p>• role=barman → /scanner-barman</p>
                  <p>• role=manager → /admin</p>
                </div>
                <p className="text-white font-medium mt-3">Flux Înregistrare Client:</p>
                <p>1. POST /api/auth/register → {`{ name, phone, email }`}</p>
                <p>2. Server creează user cu role='client'</p>
                <p>3. Returnează JWT → redirect /dashboard-client</p>
                <p className="text-white font-medium mt-3">Flux Activare Card NFC:</p>
                <p>1. Client scanează card → URL: vip.merlot.ro/c/{`{UUID}`}</p>
                <p>2. PWA preia UUID → POST /api/cards/activate</p>
                <p>3. Server asociază card cu user → redirect /dashboard-client</p>
              </div>
            </div>

            {/* Scan Logic */}
            <div className="bg-[#1a1a1a] border border-[#333] rounded-xl p-4">
              <h3 className="text-sm font-semibold text-[#C4A35A] mb-3 flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Secțiunea C: Logica Scanare & Validare Discount
              </h3>
              <pre className="bg-[#0a0a0a] rounded-lg p-3 text-xs text-blue-300 overflow-x-auto font-mono leading-relaxed">
{`// POST /api/scan — Barman scanează card NFC
async function handleScan(card_uuid: string, barman_id: string) {
  // 1. Găsește cardul
  const card = await db.nfc_cards.findOne({ card_uuid });
  if (!card) return { valid: false, message: "Card necunoscut" };
  if (card.status === 'blocked') return { valid: false, message: "Card BLOCAT" };
  if (!card.assigned_user_id) return { valid: false, message: "Neasociat" };

  // 2. Găsește clientul
  const client = await db.users.findOne({ id: card.assigned_user_id });

  // 3. Calculează discount aplicabil ACUM
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0=Dum, 1=Lun...
  const currentTime = now.toTimeString().slice(0, 5); // "HH:MM"

  const rules = await db.discount_rules.findMany({
    is_active: true,
    valid_days: { contains: dayOfWeek }
  });

  let bestDiscount = 0;
  let appliedRule = null;

  for (const rule of rules) {
    const inTimeRange = (
      currentTime >= rule.start_time &&
      currentTime <= rule.end_time
    ) || (
      rule.end_time < rule.start_time && // overnight
      (currentTime >= rule.start_time || currentTime <= rule.end_time)
    );

    if (inTimeRange && rule.discount_percentage > bestDiscount) {
      bestDiscount = rule.discount_percentage;
      appliedRule = rule;
    }
  }

  // 4. Înregistrează vizita
  await db.visits_log.create({
    card_id: card.id,
    client_id: client.id,
    barman_id,
    discount_applied: bestDiscount,
    scanned_at: now
  });

  // 5. Returnează rezultat
  return {
    valid: true,
    discount: bestDiscount > 0 ? \`\${bestDiscount}%\` : "0%",
    discount_percentage: bestDiscount,
    client_name: client.name,
    client_phone: client.phone,
    rule_name: appliedRule?.name || "Fără reducere",
    message: bestDiscount > 0
      ? \`Reducere \${bestDiscount}% aplicată!\`
      : "Vizită înregistrată (fără reducere)"
  };
}`}
              </pre>
            </div>

            {/* Notifications */}
            <div className="bg-[#1a1a1a] border border-[#333] rounded-xl p-4">
              <h3 className="text-sm font-semibold text-[#C4A35A] mb-3 flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Secțiunea D: Modul Notificări
              </h3>
              <div className="bg-[#0a0a0a] rounded-lg p-3 text-xs text-gray-300 space-y-2">
                <p className="text-white font-medium">Arhitectură Push Notifications:</p>
                <p>1. Manager creează anunț → POST /api/announcements</p>
                <p>2. Server salvează în DB + trimite Push via Firebase Cloud Messaging</p>
                <p>3. PWA Client primește push → afișează notificare</p>
                <p>4. In-App feed: GET /api/announcements?target=vip</p>
                <div className="mt-3 text-white font-medium">Implementare FCM:</div>
                <pre className="text-purple-300 mt-1">{`// firebase-admin (Node.js Backend)
import admin from 'firebase-admin';

async function sendPushToSegment(
  title: string,
  body: string,
  target: 'all' | 'vip' | 'regular'
) {
  const tokens = await db.push_tokens.findMany({
    where: target === 'all' ? {} : { segment: target }
  });

  const message = {
    notification: { title, body },
    data: { type: 'announcement', target },
    tokens: tokens.map(t => t.fcm_token)
  };

  await admin.messaging().sendEachForMulticast(message);
}`}</pre>
              </div>
            </div>

            {/* NFC Programming */}
            <div className="bg-[#1a1a1a] border border-[#333] rounded-xl p-4">
              <h3 className="text-sm font-semibold text-[#C4A35A] mb-3 flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Secțiunea E: Programare Carduri NFC & Anti-Fraudă
              </h3>
              <div className="bg-[#0a0a0a] rounded-lg p-3 text-xs text-gray-300 space-y-3">
                <p className="text-white font-medium">Programare NFC (NDEF URL):</p>
                <pre className="text-green-300">{`// Scriere NDEF pe card NFC (Android - NFC Tools / Custom App)
const ndef = new NDEFWriter();
const url = \`https://vip.merlot.ro/c/\${CARD_UUID}\`;
const encoder = new TextEncoder();
const record = {
  recordType: "U", // URL record
  data: encoder.encode(url)
};
await ndef.write([record]);`}</pre>

                <p className="text-white font-medium mt-3">URL Format:</p>
                <p className="text-blue-300 font-mono">https://vip.merlot.ro/c/A1B2C3D4-E5F6-7890-ABCD-EF1234567890</p>

                <p className="text-white font-medium mt-3">Prevenire Fraudă:</p>
                <div className="space-y-1 text-yellow-300">
                  <p>1. ✅ UUID unic per card (32 chars, generat criptografic)</p>
                  <p>2. ✅ Validare server-side la fiecare scanare (nu doar client)</p>
                  <p>3. ✅ Rate limiting: max 1 scanare/card/minut</p>
                  <p>4. ✅ Geolocație barman: scanare doar din locația Merlot</p>
                  <p>5. ✅ Timestamp server-side (nu client-side)</p>
                  <p>6. ✅ Card token expirabil: semnat HMAC cu cheie secretă</p>
                  <p>7. ✅ Screenshot-proof: UI-ul nu arată UUID-ul complet clientului</p>
                  <p>8. ✅ NFC chip UID citit suplimentar (hardware-level, imposibil de clonat)</p>
                </div>

                <p className="text-white font-medium mt-3">Tipuri carduri NFC recomandate:</p>
                <div className="space-y-1">
                  <p>• <span className="text-green-300">NTAG215</span> — 504 bytes, ieftin, ideal pentru URL</p>
                  <p>• <span className="text-green-300">NTAG216</span> — 888 bytes, mai mult spațiu</p>
                  <p>• <span className="text-green-300">MIFARE DESFire</span> — criptare AES, securitate maximă</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#111]/95 backdrop-blur-xl border-t border-[#222] px-2 py-2">
        <div className="flex justify-around">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all ${activeTab === tab.id ? 'text-[#C4A35A] bg-[#722F37]/10' : 'text-gray-500 hover:text-gray-300'}`}
            >
              {tab.icon}
              <span className="text-[10px]">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
