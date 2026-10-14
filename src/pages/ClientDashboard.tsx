import { useState } from 'react';
import { useStore } from '../store';
import { CreditCard, Bell, Calendar, History, LogOut, MapPin, Clock, Percent, PartyPopper, ChevronRight, Wifi } from 'lucide-react';

type Tab = 'card' | 'events' | 'history' | 'benefits';

export default function ClientDashboard() {
  const { currentUser, logout, nfcCards, visitsLog, announcements, discountRules } = useStore();
  const [activeTab, setActiveTab] = useState<Tab>('card');

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

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'card', label: 'Card', icon: <CreditCard className="w-5 h-5" /> },
    { id: 'benefits', label: 'Beneficii', icon: <Percent className="w-5 h-5" /> },
    { id: 'events', label: 'Evenimente', icon: <PartyPopper className="w-5 h-5" /> },
    { id: 'history', label: 'Istoric', icon: <History className="w-5 h-5" /> },
  ];

  const dayNames = ['Dum', 'Lun', 'Mar', 'Mie', 'Joi', 'Vin', 'Sâm'];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#722F37] via-[#5a252c] to-[#3d1a1f] px-5 pt-6 pb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-[#C4A35A]/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#C4A35A]/5 rounded-full translate-y-1/2 -translate-x-1/2" />
        <div className="relative flex justify-between items-start">
          <div>
            <p className="text-[#C4A35A] text-xs uppercase tracking-widest mb-1">Bine ai venit</p>
            <h1 className="text-xl font-bold">{currentUser.name}</h1>
            <p className="text-white/60 text-sm mt-0.5">{currentUser.phone}</p>
          </div>
          <button onClick={logout} className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition">
            <LogOut className="w-5 h-5 text-white/80" />
          </button>
        </div>

        {/* Notification badge */}
        {myAnnouncements.length > 0 && (
          <div className="mt-4 flex items-center gap-2 bg-white/10 rounded-lg px-3 py-2">
            <Bell className="w-4 h-4 text-[#C4A35A]" />
            <span className="text-sm text-white/90">{myAnnouncements.length} notificări noi</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="px-4 -mt-4">
        {activeTab === 'card' && (
          <div className="space-y-4">
            {/* VIP Card */}
            <div className="bg-gradient-to-br from-[#1a1a1a] to-[#111] border border-[#333] rounded-2xl p-5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#722F37]/20 to-transparent rounded-bl-full" />
              <div className="flex justify-between items-start mb-6">
                <div>
                  <p className="text-[#C4A35A] text-xs uppercase tracking-widest">Merlot VIP Card</p>
                  <p className="text-white text-lg font-bold mt-1">{currentUser.name}</p>
                </div>
                <div className="text-3xl">{currentUser.avatar}</div>
              </div>
              <div className="flex items-center gap-2 mb-4">
                <Wifi className="w-4 h-4 text-[#C4A35A]" />
                <span className="text-xs text-gray-400 font-mono">{myCard?.card_uuid || 'N/A'}</span>
              </div>
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-xs text-gray-500">Status</p>
                  <p className={`text-sm font-semibold ${myCard?.status === 'active' ? 'text-green-400' : 'text-red-400'}`}>
                    {myCard?.status === 'active' ? '● Activ' : '○ Inactiv'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">Vizite totale</p>
                  <p className="text-2xl font-bold text-[#C4A35A]">{myVisits.length}</p>
                </div>
              </div>
            </div>

            {/* Active Discount Alert */}
            {activeDiscounts.length > 0 && (
              <div className="bg-gradient-to-r from-[#722F37]/20 to-[#C4A35A]/10 border border-[#722F37]/30 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Percent className="w-5 h-5 text-[#C4A35A]" />
                  <span className="text-sm font-semibold text-[#C4A35A]">Reducere activă acum!</span>
                </div>
                {activeDiscounts.map(d => (
                  <div key={d.id} className="flex justify-between items-center mt-2">
                    <span className="text-sm text-white/80">{d.name}</span>
                    <span className="text-lg font-bold text-green-400">-{d.discount_percentage}%</span>
                  </div>
                ))}
              </div>
            )}

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#1a1a1a] border border-[#222] rounded-xl p-4">
                <p className="text-xs text-gray-500 mb-1">Total vizite</p>
                <p className="text-2xl font-bold text-white">{myVisits.length}</p>
              </div>
              <div className="bg-[#1a1a1a] border border-[#222] rounded-xl p-4">
                <p className="text-xs text-gray-500 mb-1">Reduceri aplicate</p>
                <p className="text-2xl font-bold text-[#C4A35A]">{myVisits.filter(v => v.discount_applied > 0).length}</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'benefits' && (
          <div className="space-y-3">
            <h2 className="text-lg font-bold mb-4">Beneficiile tale VIP</h2>
            {discountRules.map(rule => (
              <div key={rule.id} className={`bg-[#1a1a1a] border rounded-xl p-4 ${rule.is_active ? 'border-[#333]' : 'border-[#222] opacity-50'}`}>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-white">{rule.name}</h3>
                    <p className="text-sm text-gray-400 mt-1">{rule.description}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Clock className="w-3 h-3" />
                        <span>{rule.start_time} - {rule.end_time}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Calendar className="w-3 h-3" />
                        <span>{rule.valid_days.map(d => dayNames[d]).join(', ')}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-2xl font-bold ${rule.is_active ? 'text-green-400' : 'text-gray-600'}`}>
                      -{rule.discount_percentage}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'events' && (
          <div className="space-y-3">
            <h2 className="text-lg font-bold mb-4">Evenimente & Anunțuri</h2>
            {myAnnouncements.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <PartyPopper className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>Niciun eveniment momentan</p>
              </div>
            ) : (
              myAnnouncements.map(ann => (
                <div key={ann.id} className="bg-[#1a1a1a] border border-[#333] rounded-xl p-4 hover:border-[#722F37]/50 transition">
                  <div className="flex justify-between items-start">
                    <h3 className="font-semibold text-white text-sm">{ann.title}</h3>
                    <span className="text-xs bg-[#722F37]/20 text-[#C4A35A] px-2 py-0.5 rounded-full">
                      {ann.target === 'vip' ? 'VIP' : 'Toți'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 mt-2">{ann.message}</p>
                  <div className="flex items-center gap-2 mt-3 text-xs text-gray-500">
                    <Calendar className="w-3 h-3" />
                    <span>{new Date(ann.event_date).toLocaleDateString('ro-RO', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
                    <span className="mx-1">•</span>
                    <Clock className="w-3 h-3" />
                    <span>{new Date(ann.event_date).toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-3">
            <h2 className="text-lg font-bold mb-4">Istoric vizite</h2>
            {myVisits.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <History className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>Nicio vizită înregistrată</p>
              </div>
            ) : (
              [...myVisits].reverse().map(visit => (
                <div key={visit.id} className="bg-[#1a1a1a] border border-[#222] rounded-xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${visit.discount_applied > 0 ? 'bg-green-500/10' : 'bg-gray-500/10'}`}>
                      <MapPin className={`w-5 h-5 ${visit.discount_applied > 0 ? 'text-green-400' : 'text-gray-400'}`} />
                    </div>
                    <div>
                      <p className="text-sm text-white font-medium">
                        {new Date(visit.scanned_at).toLocaleDateString('ro-RO', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(visit.scanned_at).toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    {visit.discount_applied > 0 ? (
                      <span className="text-sm font-semibold text-green-400">-{visit.discount_applied}%</span>
                    ) : (
                      <span className="text-xs text-gray-500">Fără reducere</span>
                    )}
                  </div>
                </div>
              ))
            )}
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
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all ${activeTab === tab.id ? 'text-[#C4A35A] bg-[#722F37]/10' : 'text-gray-500 hover:text-gray-300'}`}
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
