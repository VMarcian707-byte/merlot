import { useStore } from '../store';
import { Trophy, Lock, Sparkles } from 'lucide-react';

export default function BadgeShowcase() {
  const { badges, userBadges } = useStore();

  const earnedBadgeIds = new Set(userBadges.map(ub => ub.badge_id));

  const earnedBadges = badges.filter(b => earnedBadgeIds.has(b.id));
  const lockedBadges = badges.filter(b => !earnedBadgeIds.has(b.id));

  return (
    <div className="space-y-6">
      {/* Earned Badges */}
      {earnedBadges.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="w-5 h-5 text-[#D4AF37]" />
            <h3 className="font-display text-lg text-white">Badge-uri Câștigate</h3>
            <span className="text-sm text-[#D4AF37]">({earnedBadges.length})</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {earnedBadges.map((badge, idx) => {
              const userBadge = userBadges.find(ub => ub.badge_id === badge.id);
              return (
                <div
                  key={badge.id}
                  className="card-luxury animate-slide-up group hover:scale-105 transition-all duration-300"
                  style={{ animationDelay: `${idx * 0.1}s` }}
                >
                  <div className="text-center">
                    <div 
                      className="w-16 h-16 mx-auto mb-3 rounded-full flex items-center justify-center text-3xl animate-float"
                      style={{ 
                        backgroundColor: `${badge.icon_color}20`,
                        boxShadow: `0 0 20px ${badge.icon_color}40`
                      }}
                    >
                      {badge.emoji}
                    </div>
                    <h4 className="font-display text-sm text-white mb-1">{badge.name}</h4>
                    <p className="text-xs text-white/40 mb-2">{badge.description}</p>
                    {userBadge && (
                      <p className="text-[10px] text-[#D4AF37]/60">
                        Câștigat: {new Date(userBadge.earned_at).toLocaleDateString('ro-RO')}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Locked Badges */}
      {lockedBadges.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Lock className="w-5 h-5 text-white/30" />
            <h3 className="font-display text-lg text-white/60">Badge-uri de Deblocat</h3>
            <span className="text-sm text-white/40">({lockedBadges.length})</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {lockedBadges.map((badge, idx) => (
              <div
                key={badge.id}
                className="card-luxury opacity-50 group hover:opacity-70 transition-all duration-300"
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                <div className="text-center">
                  <div 
                    className="w-16 h-16 mx-auto mb-3 rounded-full flex items-center justify-center text-3xl relative"
                    style={{ backgroundColor: `${badge.icon_color}10` }}
                  >
                    <span className="grayscale">{badge.emoji}</span>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Lock className="w-6 h-6 text-white/40" />
                    </div>
                  </div>
                  <h4 className="font-display text-sm text-white/60 mb-1">{badge.name}</h4>
                  <p className="text-xs text-white/30 mb-2">{badge.description}</p>
                  <div className="flex items-center justify-center gap-1 text-[10px] text-white/40">
                    <Sparkles className="w-3 h-3" />
                    <span>
                      {badge.requirement_type === 'visits' && `${badge.requirement_value} vizite`}
                      {badge.requirement_type === 'streak' && `${badge.requirement_value} zile consecutive`}
                      {badge.requirement_type === 'spending' && `${badge.requirement_value} lei cheltuiți`}
                      {badge.requirement_type === 'special' && 'Special'}
                      {badge.requirement_type === 'manual' && 'Manual'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {badges.length === 0 && (
        <div className="card-luxury text-center py-12">
          <Trophy className="w-16 h-16 mx-auto mb-4 text-white/10" />
          <p className="text-white/40 text-sm">Niciun badge disponibil momentan</p>
          <p className="text-white/20 text-xs mt-1">Revino curând pentru noi badge-uri!</p>
        </div>
      )}
    </div>
  );
}
