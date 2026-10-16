import { useState } from 'react';
import { useStore } from '../store';
import { LuxuryBackground, OrnamentDivider, GoldBadge, LuxuryCard, NoiseOverlay, StatCard, LuxuryButton } from '../components/LuxuryUI';
import RuleModal from '../components/RuleModal';
import {
  LogOut, Users, CreditCard, Bell, BarChart3, Settings, Plus,
  Ban, CheckCircle, XCircle, Send, Calendar, Clock, Percent,
  TrendingUp, UserCheck, ScanLine, Shield, BookOpen, Sparkles,
  Crown, Gem, Wine, ChevronRight, Zap, Wifi, Edit, Trash2, Trophy
} from 'lucide-react';
import { DiscountRule } from '../lib/supabase';

type AdminTab = 'dashboard' | 'cards' | 'rules' | 'badges' | 'notifications' | 'docs';

export default function AdminPanel() {
  const {
    currentUser, logout, users, nfcCards, visitsLog, announcements,
    discountRules, assignCard, blockCard, addAnnouncement, addNFCCard, toggleDiscountRule
  } = useStore();
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');

  const [annTitle, setAnnTitle] = useState('');
  const [annMessage, setAnnMessage] = useState('');
  const [annDate, setAnnDate] = useState('');
  const [annTarget, setAnnTarget] = useState<'all' | 'vip' | 'regular'>('all');
  const [annSent, setAnnSent] = useState(false);

  // Rule modal state
  const [showRuleModal, setShowRuleModal] = useState(false);
  const [editingRule, setEditingRule] = useState<DiscountRule | null>(null);

  if (!currentUser) return null;

  // Verifică dacă name este email și extrage numele real
  const isNameEmail = currentUser.name.includes('@');
  const displayName = isNameEmail 
    ? currentUser.email.split('@')[0].split('.').map(part => 
        part.charAt(0).toUpperCase() + part.slice(1)
      ).join(' ')
    : currentUser.name;

  const clients = users.filter(u => u.role === 'client');
  const activeCards = nfcCards.filter(c => c.status === 'active');
  const unassignedCards = nfcCards.filter(c => c.status === 'unassigned');
  const blockedCards = nfcCards.filter(c => c.status === 'blocked');
  const totalVisits = visitsLog.length;
  const todayVisits = visitsLog.filter(v => new Date(v.scanned_at).toDateString() === new Date().toDateString()).length;

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

  const handleEditRule = (rule: DiscountRule) => {
    setEditingRule(rule);
    setShowRuleModal(true);
  };

  const handleDeleteRule = async (id: string) => {
    if (confirm('Ești sigur că vrei să ștergi această regulă de discount?')) {
      try {
        await useStore.getState().deleteDiscountRule(id);
      } catch (error) {
        console.error('Error deleting rule:', error);
        alert('Eroare la ștergerea regulii');
      }
    }
  };

  const handleSaveRule = async (rule: Omit<DiscountRule, 'id' | 'created_at'> & { id?: string }) => {
    try {
      if (rule.id) {
        // Update existing rule
        const { id, ...updates } = rule;
        await useStore.getState().updateDiscountRule(id, updates);
      } else {
        // Create new rule
        await useStore.getState().addDiscountRule(rule as Omit<DiscountRule, 'id' | 'created_at'>);
      }
      setShowRuleModal(false);
      setEditingRule(null);
    } catch (error) {
      console.error('Error saving rule:', error);
      alert('Eroare la salvarea regulii');
    }
  };

  const dayNames = ['Dum', 'Lun', 'Mar', 'Mie', 'Joi', 'Vin', 'Sâm'];

  const tabs: { id: AdminTab; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <BarChart3 className="w-5 h-5" /> },
    { id: 'cards', label: 'Carduri', icon: <CreditCard className="w-5 h-5" /> },
    { id: 'rules', label: 'Reguli', icon: <Settings className="w-5 h-5" /> },
    { id: 'badges', label: 'Badge-uri', icon: <Trophy className="w-5 h-5" /> },
    { id: 'notifications', label: 'Notificări', icon: <Bell className="w-5 h-5" /> },
    { id: 'docs', label: 'Docs', icon: <BookOpen className="w-5 h-5" /> },
  ];

  return (
    <div className="min-h-screen min-h-[100dvh] relative pb-24">
      <LuxuryBackground />
      <NoiseOverlay />

      {/* Header */}
      <div className="relative z-10 glass-dark border-b border-white/[0.05]">
        <div className="px-5 py-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-accent text-[#D4AF37]/60 text-xs tracking-[0.3em] uppercase italic mb-1">
                Management
              </p>
              <h1 className="font-display text-xl text-white">Merlot Admin</h1>
            </div>
            <button 
              onClick={logout} 
              className="w-9 h-9 rounded-full glass flex items-center justify-center hover:border-[#D4AF37]/30 transition-all duration-300"
            >
              <LogOut className="w-4 h-4 text-white/40" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 p-5">
        {/* Dashboard */}
        {activeTab === 'dashboard' && (
          <div className="space-y-5 animate-fade-in">
            {/* Welcome */}
            <div className="text-center mb-8 animate-slide-up">
              <p className="font-accent text-[#D4AF37]/60 text-xs tracking-[0.3em] uppercase italic mb-2">
                Privire de ansamblu
              </p>
              <h2 className="font-display text-2xl text-white">Dashboard</h2>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="animate-slide-up stagger-1">
                <StatCard
                  icon={<Users className="w-6 h-6" />}
                  value={clients.length}
                  label="Clienți VIP"
                  accent="gold"
                />
              </div>
              <div className="animate-slide-up stagger-2">
                <StatCard
                  icon={<UserCheck className="w-6 h-6" />}
                  value={activeCards.length}
                  label="Carduri Active"
                  accent="green"
                />
              </div>
              <div className="animate-slide-up stagger-3">
                <StatCard
                  icon={<ScanLine className="w-6 h-6" />}
                  value={totalVisits}
                  label="Total Vizite"
                  accent="blue"
                />
              </div>
              <div className="animate-slide-up stagger-4">
                <StatCard
                  icon={<TrendingUp className="w-6 h-6" />}
                  value={todayVisits}
                  label="Vizite Azi"
                  accent="wine"
                />
              </div>
            </div>

            {/* Card Status */}
            <div className="card-luxury animate-slide-up stagger-5">
              <div className="flex items-center gap-2 mb-4">
                <Gem className="w-4 h-4 text-[#D4AF37]" />
                <h3 className="font-display text-base text-white">Status Carduri</h3>
              </div>
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-sm text-white/60">{activeCards.length} Active</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  <span className="text-sm text-white/60">{unassignedCards.length} Neasociate</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                  <span className="text-sm text-white/60">{blockedCards.length} Blocate</span>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="card-luxury animate-slide-up stagger-5">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-4 h-4 text-[#D4AF37]" />
                <h3 className="font-display text-base text-white">Activitate Recentă</h3>
              </div>
              <div className="space-y-2">
                {[...visitsLog].reverse().slice(0, 5).map(visit => {
                  const client = users.find(u => u.id === visit.client_id);
                  return (
                    <div key={visit.id} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{client?.avatar || '🎫'}</span>
                        <div>
                          <p className="text-sm text-white">{client?.name}</p>
                          <p className="text-xs text-white/30">
                            {new Date(visit.scanned_at).toLocaleString('ro-RO', { 
                              day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' 
                            })}
                          </p>
                        </div>
                      </div>
                      <span className={`text-sm font-display font-bold ${
                        visit.discount_applied > 0 ? 'text-emerald-400' : 'text-white/30'
                      }`}>
                        {visit.discount_applied > 0 ? `-${visit.discount_applied}%` : '—'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Cards Management */}
        {activeTab === 'cards' && (
          <div className="space-y-5 animate-fade-in">
            <div className="flex justify-between items-center animate-slide-up">
              <div>
                <p className="font-accent text-[#D4AF37]/60 text-xs tracking-[0.3em] uppercase italic mb-1">
                  Gestiune
                </p>
                <h2 className="font-display text-2xl text-white">Carduri NFC</h2>
              </div>
              <button
                onClick={addNFCCard}
                className="btn-luxury flex items-center gap-2 text-xs"
              >
                <Plus className="w-4 h-4" /> Card Nou
              </button>
            </div>

            {/* Unassigned */}
            {unassignedCards.length > 0 && (
              <div className="card-luxury border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-transparent animate-slide-up stagger-1">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  <h3 className="text-sm text-amber-400 font-medium">Carduri Neasociate ({unassignedCards.length})</h3>
                </div>
                <div className="space-y-3">
                  {unassignedCards.map(card => (
                    <div key={card.id} className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                      <p className="text-xs font-mono text-white/40 mb-2 truncate">{card.card_uuid}</p>
                      <select
                        className="w-full bg-[#0a0608] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white outline-none focus:border-[#D4AF37]/50 transition-colors"
                        onChange={(e) => e.target.value && assignCard(card.id, e.target.value)}
                        defaultValue=""
                      >
                        <option value="" disabled>Asociază unui client...</option>
                        {clients.map(c => (
                          <option key={c.id} value={c.id}>{c.avatar} {c.name}</option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* All Cards */}
            <div className="card-luxury animate-slide-up stagger-2">
              <h3 className="font-display text-base text-white mb-4">Toate Cardurile ({nfcCards.length})</h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {nfcCards.map(card => {
                  const client = users.find(u => u.id === card.assigned_user_id);
                  return (
                    <div key={card.id} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] group hover:border-[#D4AF37]/20 transition-all duration-300">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${
                            card.status === 'active' ? 'bg-emerald-400' : 
                            card.status === 'blocked' ? 'bg-red-400' : 'bg-amber-400'
                          }`} />
                          <p className="text-sm text-white truncate">{client?.name || 'Neasociat'}</p>
                        </div>
                        <p className="text-xs font-mono text-white/30 mt-1 truncate">{card.card_uuid}</p>
                      </div>
                      {card.status === 'active' && (
                        <button
                          onClick={() => blockCard(card.id)}
                          className="ml-2 p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 transition-all duration-300 opacity-0 group-hover:opacity-100"
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
          <div className="space-y-5 animate-fade-in">
            <div className="flex justify-between items-center mb-6 animate-slide-up">
              <div>
                <p className="font-accent text-[#D4AF37]/60 text-xs tracking-[0.3em] uppercase italic mb-2">
                  Configurare
                </p>
                <h2 className="font-display text-2xl text-white">Reguli de Discount</h2>
              </div>
              <button
                onClick={() => setShowRuleModal(true)}
                className="btn-luxury flex items-center gap-2 text-xs"
              >
                <Plus className="w-4 h-4" /> Adaugă Regulă
              </button>
            </div>

            <div className="space-y-3">
              {discountRules.map((rule, idx) => (
                <div 
                  key={rule.id} 
                  className={`card-luxury animate-slide-up stagger-${idx + 1} ${!rule.is_active ? 'opacity-50' : ''}`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-display text-lg text-white">{rule.name}</h3>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full tracking-wider uppercase ${
                          rule.is_active 
                            ? 'bg-emerald-400/10 text-emerald-400 border border-emerald-400/20' 
                            : 'bg-white/5 text-white/30 border border-white/10'
                        }`}>
                          {rule.is_active ? 'Activ' : 'Inactiv'}
                        </span>
                      </div>
                      <p className="text-sm text-white/40 mb-3">{rule.description}</p>
                      <div className="flex flex-wrap gap-2">
                        <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.06] text-xs text-white/50">
                          <Clock className="w-3 h-3 text-[#D4AF37]/60" />
                          {rule.start_time} — {rule.end_time}
                        </span>
                        <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.06] text-xs text-white/50">
                          <Calendar className="w-3 h-3 text-[#D4AF37]/60" />
                          {rule.valid_days.map(d => dayNames[d]).join(', ')}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-3 ml-4">
                      <span className={`text-3xl font-display font-bold ${rule.is_active ? 'text-gradient-gold' : 'text-white/20'}`}>
                        -{rule.discount_percentage}%
                      </span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditRule(rule)}
                          className="p-2 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 transition-all duration-300"
                          title="Editează"
                        >
                          <Edit className="w-4 h-4 text-sky-400" />
                        </button>
                        <button
                          onClick={() => toggleDiscountRule(rule.id)}
                          className={`p-2 rounded-lg transition-all duration-300 ${
                            rule.is_active 
                              ? 'bg-red-500/10 hover:bg-red-500/20' 
                              : 'bg-emerald-500/10 hover:bg-emerald-500/20'
                          }`}
                          title={rule.is_active ? 'Dezactivează' : 'Activează'}
                        >
                          {rule.is_active ? <XCircle className="w-4 h-4 text-red-400" /> : <CheckCircle className="w-4 h-4 text-emerald-400" />}
                        </button>
                        <button
                          onClick={() => handleDeleteRule(rule.id)}
                          className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 transition-all duration-300"
                          title="Șterge"
                        >
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Rule Modal */}
            {showRuleModal && (
              <RuleModal
                rule={editingRule}
                onClose={() => {
                  setShowRuleModal(false);
                  setEditingRule(null);
                }}
                onSave={handleSaveRule}
              />
            )}
          </div>
        )}

        {/* Badges Management */}
        {activeTab === 'badges' && (
          <div className="space-y-5 animate-fade-in">
            <div className="text-center mb-6 animate-slide-up">
              <p className="font-accent text-[#D4AF37]/60 text-xs tracking-[0.3em] uppercase italic mb-2">
                Gamification
              </p>
              <h2 className="font-display text-2xl text-white">Gestionare Badge-uri</h2>
            </div>

            <div className="card-luxury animate-slide-up stagger-1">
              <div className="flex items-center gap-2 mb-4">
                <Trophy className="w-5 h-5 text-[#D4AF37]" />
                <h3 className="font-display text-lg text-white">Badge-uri Disponibile</h3>
              </div>
              <p className="text-sm text-white/60 mb-6">
                Badge-urile sunt acordate automat clienților când ating anumite milestone-uri. 
                Acestea sunt definite în baza de date și pot fi gestionate direct din Supabase.
              </p>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  { emoji: '🎉', name: 'Prima Vizită', desc: '1 vizită', color: '#10B981' },
                  { emoji: '⭐', name: 'Client Fidel', desc: '5 vizite', color: '#F59E0B' },
                  { emoji: '🥉', name: 'VIP Bronze', desc: '10 vizite', color: '#CD7F32' },
                  { emoji: '🥈', name: 'VIP Silver', desc: '25 vizite', color: '#C0C0C0' },
                  { emoji: '🥇', name: 'VIP Gold', desc: '50 vizite', color: '#FFD700' },
                  { emoji: '💎', name: 'VIP Platinum', desc: '100 vizite', color: '#E5E4E2' },
                  { emoji: '🌅', name: 'Early Bird', desc: 'Special', color: '#FB923C' },
                  { emoji: '🔥', name: 'Streak Master', desc: '3 zile consecutive', color: '#EF4444' },
                ].map((badge, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] text-center hover:border-[#D4AF37]/30 transition-all duration-300"
                  >
                    <div 
                      className="w-12 h-12 mx-auto mb-2 rounded-full flex items-center justify-center text-2xl"
                      style={{ backgroundColor: `${badge.color}20` }}
                    >
                      {badge.emoji}
                    </div>
                    <h4 className="font-display text-sm text-white mb-1">{badge.name}</h4>
                    <p className="text-xs text-white/40">{badge.desc}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 rounded-xl bg-[#D4AF37]/5 border border-[#D4AF37]/20">
                <p className="text-sm text-[#D4AF37] font-medium mb-2">💡 Cum funcționează:</p>
                <ul className="text-xs text-white/60 space-y-1">
                  <li>• Badge-urile sunt acordate automat la fiecare scanare NFC</li>
                  <li>• Clienții își văd badge-urile în dashboard-ul lor</li>
                  <li>• Badge-urile deblocate motivează clienții să revină</li>
                  <li>• Poți adăuga badge-uri noi direct din Supabase SQL Editor</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Notifications */}
        {activeTab === 'notifications' && (
          <div className="space-y-5 animate-fade-in">
            <div className="text-center mb-6 animate-slide-up">
              <p className="font-accent text-[#D4AF37]/60 text-xs tracking-[0.3em] uppercase italic mb-2">
                Comunicare
              </p>
              <h2 className="font-display text-2xl text-white">Trimite Notificare</h2>
            </div>

            {/* Form */}
            <form onSubmit={handleSendAnnouncement} className="card-luxury space-y-4 animate-slide-up stagger-1">
              <div>
                <label className="block text-[10px] text-white/30 tracking-[0.2em] uppercase mb-2">Titlu</label>
                <input
                  type="text"
                  value={annTitle}
                  onChange={e => setAnnTitle(e.target.value)}
                  className="input-luxury"
                  placeholder="🎉 Titlu eveniment..."
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] text-white/30 tracking-[0.2em] uppercase mb-2">Mesaj</label>
                <textarea
                  value={annMessage}
                  onChange={e => setAnnMessage(e.target.value)}
                  className="input-luxury resize-none h-28"
                  placeholder="Detalii eveniment sau ofertă specială..."
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-white/30 tracking-[0.2em] uppercase mb-2">Data Eveniment</label>
                  <input
                    type="datetime-local"
                    value={annDate}
                    onChange={e => setAnnDate(e.target.value)}
                    className="input-luxury"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-white/30 tracking-[0.2em] uppercase mb-2">Destinatar</label>
                  <select
                    value={annTarget}
                    onChange={e => setAnnTarget(e.target.value as any)}
                    className="input-luxury"
                  >
                    <option value="all">Toți Clienții</option>
                    <option value="vip">Doar VIP</option>
                    <option value="regular">Doar Regular</option>
                  </select>
                </div>
              </div>
              <LuxuryButton type="submit" variant="wine" className="w-full">
                <span className="flex items-center justify-center gap-2">
                  <Send className="w-4 h-4" />
                  Trimite Notificarea
                </span>
              </LuxuryButton>
              {annSent && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 text-center animate-scale-in">
                  <p className="text-emerald-400 text-sm font-medium flex items-center justify-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Notificare trimisă cu succes!
                  </p>
                </div>
              )}
            </form>

            {/* Previous */}
            <div className="card-luxury animate-slide-up stagger-2">
              <h3 className="font-display text-base text-white mb-4">Notificări Trimise ({announcements.length})</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {announcements.map(ann => (
                  <div key={ann.id} className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                    <div className="flex justify-between items-start mb-1">
                      <p className="text-sm text-white font-medium flex-1 pr-2">{ann.title}</p>
                      <GoldBadge>{ann.target}</GoldBadge>
                    </div>
                    <p className="text-xs text-white/40">{ann.message}</p>
                    <p className="text-xs text-white/20 mt-1">
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
          <div className="space-y-5 animate-fade-in">
            <div className="text-center mb-6 animate-slide-up">
              <p className="font-accent text-[#D4AF37]/60 text-xs tracking-[0.3em] uppercase italic mb-2">
                Referință Tehnică
              </p>
              <h2 className="font-display text-2xl text-white">Documentație</h2>
            </div>

            {/* DB Schema */}
            <div className="card-luxury animate-slide-up stagger-1">
              <div className="flex items-center gap-2 mb-4">
                <Shield className="w-4 h-4 text-[#D4AF37]" />
                <h3 className="font-display text-base text-white">A: Schema Bază de Date</h3>
              </div>
              <pre className="bg-[#0a0608] rounded-xl p-4 text-xs text-emerald-300/80 overflow-x-auto font-mono leading-relaxed border border-white/[0.05]">
{`-- PostgreSQL Schema
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) UNIQUE,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL 
    CHECK (role IN ('client','barman','manager')),
  avatar VARCHAR(10),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE nfc_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_uuid VARCHAR(36) UNIQUE NOT NULL,
  assigned_user_id UUID REFERENCES users(id),
  status VARCHAR(20) DEFAULT 'unassigned'
    CHECK (status IN ('active','blocked','unassigned')),
  issued_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE discount_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  discount_percentage INTEGER NOT NULL,
  valid_days INTEGER[] NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE visits_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id UUID REFERENCES nfc_cards(id),
  client_id UUID REFERENCES users(id),
  barman_id UUID REFERENCES users(id),
  discount_applied INTEGER DEFAULT 0,
  scanned_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  event_date TIMESTAMPTZ,
  target VARCHAR(20) DEFAULT 'all',
  created_by_manager_id UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);`}
              </pre>
            </div>

            {/* Auth Flow */}
            <div className="card-luxury animate-slide-up stagger-2">
              <div className="flex items-center gap-2 mb-4">
                <Zap className="w-4 h-4 text-[#D4AF37]" />
                <h3 className="font-display text-base text-white">B: Flux Autentificare</h3>
              </div>
              <div className="space-y-3 text-sm text-white/60">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#D4AF37]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs text-[#D4AF37]">1</span>
                  </div>
                  <p>POST /api/auth/login → Server verifică credentials</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#D4AF37]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs text-[#D4AF37]">2</span>
                  </div>
                  <p>Returnează JWT cu rol → Frontend decodează</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#D4AF37]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs text-[#D4AF37]">3</span>
                  </div>
                  <div>
                    <p>Redirecționare pe rol:</p>
                    <div className="ml-4 mt-1 space-y-0.5 text-xs text-[#D4AF37]/70">
                      <p>• client → /dashboard-client</p>
                      <p>• barman → /scanner-barman</p>
                      <p>• manager → /admin</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Scan Logic */}
            <div className="card-luxury animate-slide-up stagger-3">
              <div className="flex items-center gap-2 mb-4">
                <ScanLine className="w-4 h-4 text-[#D4AF37]" />
                <h3 className="font-display text-base text-white">C: Logica Scanare & Discount</h3>
              </div>
              <pre className="bg-[#0a0608] rounded-xl p-4 text-xs text-sky-300/80 overflow-x-auto font-mono leading-relaxed border border-white/[0.05]">
{`// POST /api/scan
async function handleScan(card_uuid, barman_id) {
  const card = await db.nfc_cards.findOne({ card_uuid });
  if (!card) return { valid: false, message: "Card necunoscut" };
  if (card.status === 'blocked') return { valid: false };
  
  const client = await db.users.findOne({ id: card.assigned_user_id });
  const now = new Date();
  const dayOfWeek = now.getDay();
  const currentTime = now.toTimeString().slice(0, 5);

  const rules = await db.discount_rules.findMany({
    is_active: true,
    valid_days: { contains: dayOfWeek }
  });

  let bestDiscount = 0;
  for (const rule of rules) {
    const inRange = currentTime >= rule.start_time 
                 && currentTime <= rule.end_time;
    if (inRange && rule.discount_percentage > bestDiscount) {
      bestDiscount = rule.discount_percentage;
    }
  }

  await db.visits_log.create({
    card_id: card.id,
    client_id: client.id,
    barman_id,
    discount_applied: bestDiscount
  });

  return { valid: true, discount: bestDiscount, client };
}`}
              </pre>
            </div>

            {/* NFC Programming */}
            <div className="card-luxury animate-slide-up stagger-4">
              <div className="flex items-center gap-2 mb-4">
                <Wifi className="w-4 h-4 text-[#D4AF37]" />
                <h3 className="font-display text-base text-white">E: Programare NFC & Anti-Fraudă</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-[#D4AF37]/60 tracking-wider uppercase mb-2">NDEF URL Format</p>
                  <p className="font-mono text-xs text-white/60 bg-[#0a0608] rounded-lg p-3 border border-white/[0.05]">
                    https://vip.merlot.ro/c/{`{CARD_UUID}`}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[#D4AF37]/60 tracking-wider uppercase mb-2">Metode Anti-Fraudă</p>
                  <div className="space-y-1.5">
                    {[
                      'UUID unic per card (32 chars, criptografic)',
                      'Validare server-side la fiecare scanare',
                      'Rate limiting: max 1 scanare/card/minut',
                      'Geolocație barman: doar din locația Merlot',
                      'Timestamp server-side (nu client-side)',
                      'NFC chip UID hardware-level (imposibil de clonat)',
                      'Screenshot-proof: UI nu arată UUID complet',
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-white/50">
                        <CheckCircle className="w-3 h-3 text-emerald-400/60 flex-shrink-0" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-[#D4AF37]/60 tracking-wider uppercase mb-2">Carduri NFC Recomandate</p>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { name: 'NTAG215', desc: '504 bytes, ideal URL' },
                      { name: 'NTAG216', desc: '888 bytes, mai mult' },
                      { name: 'DESFire', desc: 'AES, securitate max' },
                    ].map(chip => (
                      <div key={chip.name} className="text-center p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                        <p className="text-xs text-[#D4AF37] font-medium">{chip.name}</p>
                        <p className="text-[10px] text-white/30 mt-0.5">{chip.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-50">
        <div className="glass-dark border-t border-white/[0.05] px-2 py-3">
          <div className="flex justify-around max-w-lg mx-auto">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center gap-1.5 px-3 py-2 rounded-xl transition-all duration-500 relative ${
                  activeTab === tab.id 
                    ? 'text-[#D4AF37]' 
                    : 'text-white/30 hover:text-white/50'
                }`}
              >
                <div className={`transition-transform duration-500 ${activeTab === tab.id ? 'scale-110' : ''}`}>
                  {tab.icon}
                </div>
                <span className="text-[9px] tracking-wider uppercase">{tab.label}</span>
                {activeTab === tab.id && (
                  <div className="absolute -bottom-1 w-6 h-0.5 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent rounded-full" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
