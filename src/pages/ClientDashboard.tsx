import { useState } from 'react';
import { useStore } from '../store';
import { LuxuryBackground, OrnamentDivider, GoldBadge, LuxuryCard, NoiseOverlay } from '../components/LuxuryUI';
import { 
  CreditCard, Bell, Calendar, History, LogOut, Clock, Percent, 
  PartyPopper, Wifi, Crown, Star, Sparkles, ChevronRight, MapPin,
  Wine, Gem, X, Trophy
} from 'lucide-react';
import BadgeShowcase from '../components/BadgeShowcase';

type Tab = 'card' | 'events' | 'history' | 'benefits' | 'badges';

export default function ClientDashboard() {
  const { currentUser, logout, nfcCards, visitsLog, announcements, discountRules } = useStore();
  const [activeTab, setActiveTab] = useState<Tab>('card');
  const [showNotifications, setShowNotifications] = useState(false);

  if (!currentUser) return null;

  const myCard = nfcCards.find(c => c.assigned_user_id === currentUser.id);
  const myVisits = visitsLog.filter(v => v.client_id === currentUser.id);
  const myAnnouncements = announcements.filter(a => a.target === 'all' || a.target === 'vip');

  const now = new Date();
  const dayOfWeek = now.getDay();
  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  const activeDiscounts = discountRules.filter(rule => {
    if (!rule.is_active) return false;
    if (!rule.valid_days.includes(dayOfWeek)) return false;
    if (currentTime >= rule.start_time && currentTime <= rule.end_time) return true;
    if (rule.end_time < rule.start_time && (currentTime >= rule.start_time || currentTime <= rule.end_time)) return true;
    return false;
  });

  const dayNames = ['Dum', 'Lun', 'Mar', 'Mie', 'Joi', 'Vin', 'Sâm'];
  
  // Verifică dacă name este email și extrage numele real
  const isNameEmail = currentUser.name.includes('@');
  const displayName = isNameEmail 
    ? currentUser.email.split('@')[0].split('.').map(part => 
        part.charAt(0).toUpperCase() + part.slice(1)
      ).join(' ')
    : currentUser.name;
  const fullName = displayName.split(' ');
  const firstName = fullName[0];

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'card', label: 'Cardul Meu', icon: <CreditCard className="w-5 h-5" /> },
    { id: 'benefits', label: 'Beneficii', icon: <Percent className="w-5 h-5" /> },
    { id: 'events', label: 'Evenimente', icon: <PartyPopper className="w-5 h-5" /> },
    { id: 'badges', label: 'Badge-uri', icon: <Trophy className="w-5 h-5" /> },
    { id: 'history', label: 'Istoric', icon: <History className="w-5 h-5" /> },
  ];

  return (
    <div className="min-h-screen min-h-[100dvh] relative pb-24">
      <LuxuryBackground />
      <NoiseOverlay />

      {/* Hero Header */}
      <div className="relative z-10">
        <div className="bg-gradient-to-b from-[#1a0d12]/80 via-[#1a0d12]/40 to-transparent backdrop-blur-xl">
          <div className="px-5 pt-6 pb-8">
            {/* Top bar */}
            <div className="flex justify-between items-start mb-8 animate-fade-in">
              <div>
                <p className="font-accent text-[#D4AF37]/60 text-xs tracking-[0.3em] uppercase italic mb-1">
                  Bine ai venit
                </p>
                <h1 className="font-display text-3xl text-white font-medium">
                  {firstName}
                </h1>
                <div className="flex items-center gap-2 mt-2">
                  <Crown className="w-3 h-3 text-[#D4AF37]" />
                  <span className="text-xs text-[#D4AF37]/70 tracking-wider uppercase">Member VIP</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setShowNotifications(true)}
                  className="relative w-10 h-10 rounded-full glass flex items-center justify-center hover:border-[#D4AF37]/30 transition-all duration-300"
                >
                  <Bell className="w-4 h-4 text-[#D4AF37]" />
                  {myAnnouncements.length > 0 && (
                    <div className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#D4AF37] flex items-center justify-center animate-pulse">
                      <span className="text-[9px] text-[#0a0608] font-bold">{myAnnouncements.length}</span>
                    </div>
                  )}
                </button>
                <button 
                  onClick={logout} 
                  className="w-10 h-10 rounded-full glass flex items-center justify-center hover:border-[#D4AF37]/30 transition-all duration-300"
                >
                  <LogOut className="w-4 h-4 text-white/50" />
                </button>
              </div>
            </div>

            {/* Active Discount Alert */}
            {activeDiscounts.length > 0 && (
              <div className="animate-slide-up stagger-1">
                <div className="relative overflow-hidden rounded-2xl border border-[#D4AF37]/20 bg-gradient-to-r from-[#D4AF37]/10 via-[#722F37]/10 to-[#D4AF37]/10 p-4">
                  <div className="absolute inset-0 animate-shimmer opacity-30" />
                  <div className="relative flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#D4AF37]/20 flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-5 h-5 text-[#D4AF37]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-[#D4AF37]/80 tracking-wider uppercase mb-0.5">Reducere activă acum</p>
                      <p className="text-white font-medium text-sm truncate">{activeDiscounts[0].name}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-2xl font-display font-bold text-[#D4AF37]">
                        -{activeDiscounts[0].discount_percentage}%
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="relative z-10 px-5 -mt-2">
        {activeTab === 'card' && (
          <div className="space-y-5 animate-fade-in">
            {/* VIP Card */}
            <div className="card-vip animate-slide-up stagger-2">
              <div className="relative z-10">
                {/* Card header */}
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Gem className="w-4 h-4 text-[#D4AF37]" />
                      <p className="font-accent text-[#D4AF37]/80 text-xs tracking-[0.3em] uppercase italic">
                        Merlot VIP Card
                      </p>
                    </div>
                    <h3 className="font-display text-xl text-white">{displayName}</h3>
                    <p className="text-white/30 text-xs mt-1 tracking-wider">{currentUser.phone}</p>
                  </div>
                  <div className="text-4xl">{currentUser.avatar}</div>
                </div>

                {/* Card number */}
                <div className="mb-8">
                  <div className="flex items-center gap-2 mb-2">
                    <Wifi className="w-3 h-3 text-[#D4AF37]/50" />
                    <span className="text-[10px] text-white/30 tracking-wider uppercase">NFC ID</span>
                  </div>
                  <p className="font-mono text-xs text-white/50 tracking-wider">
                    {myCard?.card_uuid || 'N/A'}
                  </p>
                </div>

                {/* Card footer */}
                <div className="flex justify-between items-end pt-6 border-t border-white/5">
                  <div>
                    <p className="text-[10px] text-white/30 tracking-wider uppercase mb-1">Status</p>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${myCard?.status === 'active' ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`} />
                      <span className={`text-sm font-medium ${myCard?.status === 'active' ? 'text-emerald-400' : 'text-red-400'}`}>
                        {myCard?.status === 'active' ? 'Activ' : 'Inactiv'}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-white/30 tracking-wider uppercase mb-1">Vizite</p>
                    <p className="text-3xl font-display font-bold text-gradient-gold">{myVisits.length}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3 animate-slide-up stagger-3">
              <div className="card-luxury text-center">
                <div className="w-10 h-10 mx-auto rounded-full bg-gradient-to-br from-[#D4AF37]/10 to-transparent flex items-center justify-center mb-3">
                  <Star className="w-5 h-5 text-[#D4AF37]" />
                </div>
                <p className="text-2xl font-display font-bold text-white">{myVisits.length}</p>
                <p className="text-[10px] text-white/40 tracking-wider uppercase mt-1">Total Vizite</p>
              </div>
              <div className="card-luxury text-center">
                <div className="w-10 h-10 mx-auto rounded-full bg-gradient-to-br from-emerald-400/10 to-transparent flex items-center justify-center mb-3">
                  <Percent className="w-5 h-5 text-emerald-400" />
                </div>
                <p className="text-2xl font-display font-bold text-white">
                  {myVisits.filter(v => v.discount_applied > 0).length}
                </p>
                <p className="text-[10px] text-white/40 tracking-wider uppercase mt-1">Reduceri Primite</p>
              </div>
            </div>

            {/* Member since */}
            <div className="card-luxury animate-slide-up stagger-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#722F37]/20 to-transparent flex items-center justify-center">
                  <Wine className="w-5 h-5 text-[#C4A35A]" />
                </div>
                <div>
                  <p className="text-xs text-white/40 tracking-wider uppercase">Membru din</p>
                  <p className="text-sm text-white font-medium">
                    {new Date(currentUser.created_at).toLocaleDateString('ro-RO', { 
                      day: 'numeric', month: 'long', year: 'numeric' 
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'benefits' && (
          <div className="space-y-4 animate-fade-in">
            <div className="text-center mb-6 animate-slide-up">
              <p className="font-accent text-[#D4AF37]/60 text-xs tracking-[0.3em] uppercase italic mb-2">
                Exclusiv pentru tine
              </p>
              <h2 className="font-display text-2xl text-white">Beneficiile Tale VIP</h2>
            </div>

            {discountRules.map((rule, idx) => (
              <div 
                key={rule.id} 
                className={`card-luxury animate-slide-up ${idx === 0 ? 'stagger-1' : idx === 1 ? 'stagger-2' : 'stagger-3'}`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-display text-lg text-white">{rule.name}</h3>
                      {rule.is_active && (
                        <GoldBadge>Activ</GoldBadge>
                      )}
                    </div>
                    <p className="text-sm text-white/50 mb-4">{rule.description}</p>
                    <div className="flex flex-wrap gap-2">
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                        <Clock className="w-3 h-3 text-[#D4AF37]/60" />
                        <span className="text-xs text-white/60">{rule.start_time} — {rule.end_time}</span>
                      </div>
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                        <Calendar className="w-3 h-3 text-[#D4AF37]/60" />
                        <span className="text-xs text-white/60">{rule.valid_days.map(d => dayNames[d]).join(', ')}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right ml-4 flex-shrink-0">
                    <p className={`text-3xl font-display font-bold ${rule.is_active ? 'text-gradient-gold' : 'text-white/20'}`}>
                      -{rule.discount_percentage}%
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'events' && (
          <div className="space-y-4 animate-fade-in">
            <div className="text-center mb-6 animate-slide-up">
              <p className="font-accent text-[#D4AF37]/60 text-xs tracking-[0.3em] uppercase italic mb-2">
                Experiențe exclusive
              </p>
              <h2 className="font-display text-2xl text-white">Evenimente & Party-uri</h2>
            </div>

            {myAnnouncements.length === 0 ? (
              <div className="card-luxury text-center py-16 animate-slide-up stagger-1">
                <PartyPopper className="w-12 h-12 mx-auto mb-4 text-white/10" />
                <p className="text-white/30 text-sm">Niciun eveniment momentan</p>
                <p className="text-white/20 text-xs mt-1">Revino curând pentru noutăți</p>
              </div>
            ) : (
              myAnnouncements.map((ann, idx) => (
                <div 
                  key={ann.id} 
                  className={`card-luxury animate-slide-up ${idx === 0 ? 'stagger-1' : idx === 1 ? 'stagger-2' : 'stagger-3'}`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-display text-lg text-white flex-1 pr-4">{ann.title}</h3>
                    <GoldBadge>{ann.target === 'vip' ? 'VIP' : 'Toți'}</GoldBadge>
                  </div>
                  <p className="text-sm text-white/50 leading-relaxed mb-4">{ann.message}</p>
                  {ann.event_date && (
                    <div className="flex items-center gap-4 pt-4 border-t border-white/5">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-[#D4AF37]/60" />
                        <span className="text-xs text-white/40">
                          {new Date(ann.event_date).toLocaleDateString('ro-RO', { 
                            weekday: 'short', day: 'numeric', month: 'short' 
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-[#D4AF37]/60" />
                        <span className="text-xs text-white/40">
                          {new Date(ann.event_date).toLocaleTimeString('ro-RO', { 
                            hour: '2-digit', minute: '2-digit' 
                          })}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-4 animate-fade-in">
            <div className="text-center mb-6 animate-slide-up">
              <p className="font-accent text-[#D4AF37]/60 text-xs tracking-[0.3em] uppercase italic mb-2">
                Amintirile tale
              </p>
              <h2 className="font-display text-2xl text-white">Istoric Vizite</h2>
            </div>

            {myVisits.length === 0 ? (
              <div className="card-luxury text-center py-16 animate-slide-up stagger-1">
                <History className="w-12 h-12 mx-auto mb-4 text-white/10" />
                <p className="text-white/30 text-sm">Nicio vizită înregistrată</p>
                <p className="text-white/20 text-xs mt-1">Vizitează-ne pentru a acumula experiențe</p>
              </div>
            ) : (
              <div className="space-y-2">
                {[...myVisits].reverse().map((visit, idx) => (
                  <div 
                    key={visit.id} 
                    className={`card-luxury flex items-center justify-between animate-slide-up ${idx < 5 ? `stagger-${idx + 1}` : ''}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        visit.discount_applied > 0 
                          ? 'bg-gradient-to-br from-emerald-400/20 to-transparent' 
                          : 'bg-white/[0.03]'
                      }`}>
                        <MapPin className={`w-4 h-4 ${visit.discount_applied > 0 ? 'text-emerald-400' : 'text-white/30'}`} />
                      </div>
                      <div>
                        <p className="text-sm text-white font-medium">
                          {new Date(visit.scanned_at).toLocaleDateString('ro-RO', { 
                            day: 'numeric', month: 'short', year: 'numeric' 
                          })}
                        </p>
                        <p className="text-xs text-white/30">
                          {new Date(visit.scanned_at).toLocaleTimeString('ro-RO', { 
                            hour: '2-digit', minute: '2-digit' 
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      {visit.discount_applied > 0 ? (
                        <span className="text-lg font-display font-bold text-emerald-400">
                          -{visit.discount_applied}%
                        </span>
                      ) : (
                        <span className="text-xs text-white/30 tracking-wider uppercase">Standard</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'badges' && (
          <div className="space-y-4 animate-fade-in">
            <div className="text-center mb-6 animate-slide-up">
              <p className="font-accent text-[#D4AF37]/60 text-xs tracking-[0.3em] uppercase italic mb-2">
                Realizările tale
              </p>
              <h2 className="font-display text-2xl text-white">Badge-uri & Achievements</h2>
            </div>
            <BadgeShowcase />
          </div>
        )}
      </div>

      {/* Notifications Panel */}
      {showNotifications && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center animate-fade-in">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowNotifications(false)}
          />
          
          {/* Panel */}
          <div className="relative w-full max-w-md mx-4 mb-4 sm:mb-0 max-h-[80vh] overflow-hidden animate-slide-up">
            <div className="card-luxury border-[#D4AF37]/20 bg-gradient-to-br from-[#1a0d12] to-[#0a0608]">
              {/* Header */}
              <div className="flex items-center justify-between p-5 border-b border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#D4AF37]/20 to-[#722F37]/20 flex items-center justify-center">
                    <Bell className="w-5 h-5 text-[#D4AF37]" />
                  </div>
                  <div>
                    <h2 className="font-display text-xl text-white">Notificări</h2>
                    <p className="text-xs text-white/40">{myAnnouncements.length} notificări noi</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowNotifications(false)}
                  className="w-8 h-8 rounded-full glass flex items-center justify-center hover:border-[#D4AF37]/30 transition-all"
                >
                  <X className="w-4 h-4 text-white/60" />
                </button>
              </div>

              {/* Content */}
              <div className="p-5 overflow-y-auto max-h-[60vh]">
                {myAnnouncements.length === 0 ? (
                  <div className="text-center py-12">
                    <Bell className="w-12 h-12 mx-auto mb-4 text-white/10" />
                    <p className="text-white/40 text-sm">Nicio notificare momentan</p>
                    <p className="text-white/20 text-xs mt-1">Vei primi notificări pentru evenimente și oferte</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {myAnnouncements.map((ann, idx) => (
                      <div 
                        key={ann.id} 
                        className="card-luxury animate-slide-up"
                        style={{ animationDelay: `${idx * 0.05}s` }}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-display text-base text-white flex-1 pr-2">{ann.title}</h3>
                          <GoldBadge>{ann.target === 'vip' ? 'VIP' : 'Toți'}</GoldBadge>
                        </div>
                        <p className="text-sm text-white/60 leading-relaxed mb-3">{ann.message}</p>
                        {ann.event_date && (
                          <div className="flex items-center gap-4 pt-3 border-t border-white/5">
                            <div className="flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-[#D4AF37]/60" />
                              <span className="text-xs text-white/40">
                                {new Date(ann.event_date).toLocaleDateString('ro-RO', { 
                                  weekday: 'short', day: 'numeric', month: 'short' 
                                })}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5 text-[#D4AF37]/60" />
                              <span className="text-xs text-white/40">
                                {new Date(ann.event_date).toLocaleTimeString('ro-RO', { 
                                  hour: '2-digit', minute: '2-digit' 
                                })}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-white/5">
                <button
                  onClick={() => setShowNotifications(false)}
                  className="w-full py-3 rounded-xl glass text-white/60 hover:text-[#D4AF37] hover:border-[#D4AF37]/30 transition-all duration-300 text-sm tracking-wider uppercase"
                >
                  Închide
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-50">
        <div className="glass-dark border-t border-white/[0.05] px-3 py-3">
          <div className="flex justify-around max-w-md mx-auto">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center gap-1.5 px-4 py-2 rounded-xl transition-all duration-500 ${
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
                  <div className="absolute -bottom-0 w-8 h-0.5 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent rounded-full" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
