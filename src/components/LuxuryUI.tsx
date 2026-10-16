import { ReactNode } from 'react';

// Animated background particles
export function LuxuryBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Deep gradient base */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0608] via-[#120a0e] to-[#0a0608]" />
      
      {/* Ambient light orbs */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-[#722F37]/8 blur-[120px] animate-float" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-[#D4AF37]/5 blur-[100px] animate-float" style={{ animationDelay: '3s' }} />
      <div className="absolute top-[40%] left-[50%] w-[300px] h-[300px] rounded-full bg-[#8B3A42]/6 blur-[80px] animate-float" style={{ animationDelay: '5s' }} />
      
      {/* Subtle gold dust particles */}
      {Array.from({ length: 20 }).map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-[#D4AF37]/30"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animation: `float ${4 + Math.random() * 6}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 5}s`,
          }}
        />
      ))}
      
      {/* Top decorative line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#D4AF37]/20 to-transparent" />
    </div>
  );
}

// Ornamental divider
export function OrnamentDivider({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center gap-3 ${className}`}>
      <div className="h-px w-12 bg-gradient-to-r from-transparent to-[#D4AF37]/40" />
      <div className="w-1.5 h-1.5 rotate-45 border border-[#D4AF37]/40" />
      <div className="w-1 h-1 rounded-full bg-[#D4AF37]/60" />
      <div className="w-1.5 h-1.5 rotate-45 border border-[#D4AF37]/40" />
      <div className="h-px w-12 bg-gradient-to-l from-transparent to-[#D4AF37]/40" />
    </div>
  );
}

// Luxury section header
export function SectionHeader({ 
  title, 
  subtitle, 
  align = 'center' 
}: { 
  title: string; 
  subtitle?: string; 
  align?: 'center' | 'left';
}) {
  return (
    <div className={`${align === 'center' ? 'text-center' : 'text-left'}`}>
      {subtitle && (
        <p className="font-accent text-[#D4AF37]/80 text-sm tracking-[0.3em] uppercase mb-2 italic">
          {subtitle}
        </p>
      )}
      <h2 className="font-display text-2xl md:text-3xl text-white font-medium">
        {title}
      </h2>
    </div>
  );
}

// Gold badge
export function GoldBadge({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium tracking-wider uppercase
      bg-gradient-to-r from-[#D4AF37]/10 to-[#D4AF37]/5 
      border border-[#D4AF37]/20 text-[#D4AF37] ${className}`}>
      {children}
    </span>
  );
}

// Luxury card wrapper
export function LuxuryCard({ 
  children, 
  className = '',
  glow = false
}: { 
  children: ReactNode; 
  className?: string;
  glow?: boolean;
}) {
  return (
    <div className={`card-luxury ${glow ? 'glow-gold' : ''} ${className}`}>
      {children}
    </div>
  );
}

// Stat card
export function StatCard({ 
  icon, 
  value, 
  label, 
  accent = 'gold' 
}: { 
  icon: ReactNode; 
  value: string | number; 
  label: string;
  accent?: 'gold' | 'wine' | 'green' | 'blue';
}) {
  const accentColors = {
    gold: 'text-[#D4AF37] from-[#D4AF37]/10 to-[#D4AF37]/5 border-[#D4AF37]/15',
    wine: 'text-[#C4A35A] from-[#722F37]/15 to-[#722F37]/5 border-[#722F37]/20',
    green: 'text-emerald-400 from-emerald-400/10 to-emerald-400/5 border-emerald-400/15',
    blue: 'text-sky-400 from-sky-400/10 to-sky-400/5 border-sky-400/15',
  };

  return (
    <div className={`relative bg-gradient-to-br ${accentColors[accent]} border rounded-2xl p-5 overflow-hidden group hover:scale-[1.02] transition-all duration-500`}>
      <div className="absolute top-0 right-0 w-20 h-20 rounded-full bg-current opacity-5 -translate-y-1/2 translate-x-1/2" />
      <div className={`${accentColors[accent].split(' ')[0]} mb-3`}>{icon}</div>
      <p className="text-3xl font-display font-bold text-white mb-1">{value}</p>
      <p className="text-xs text-white/40 tracking-wider uppercase">{label}</p>
    </div>
  );
}

// Luxury button
export function LuxuryButton({ 
  children, 
  onClick, 
  variant = 'wine',
  className = '',
  disabled = false,
  type = 'button'
}: { 
  children: ReactNode; 
  onClick?: () => void;
  variant?: 'wine' | 'gold' | 'ghost';
  className?: string;
  disabled?: boolean;
  type?: 'button' | 'submit';
}) {
  const variants = {
    wine: 'btn-luxury',
    gold: 'btn-gold',
    ghost: 'px-6 py-3 rounded-xl border border-white/10 text-white/70 hover:border-[#D4AF37]/30 hover:text-[#D4AF37] transition-all duration-300 text-sm tracking-wider uppercase font-medium',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${variants[variant]} ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {children}
    </button>
  );
}

// Luxury input
export function LuxuryInput({ 
  label, 
  ...props 
}: { 
  label?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-xs text-white/40 tracking-[0.2em] uppercase font-medium">
          {label}
        </label>
      )}
      <input {...props} className={`input-luxury ${props.className || ''}`} />
    </div>
  );
}

// Luxury textarea
export function LuxuryTextarea({ 
  label, 
  ...props 
}: { 
  label?: string;
} & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-xs text-white/40 tracking-[0.2em] uppercase font-medium">
          {label}
        </label>
      )}
      <textarea {...props} className={`input-luxury resize-none ${props.className || ''}`} />
    </div>
  );
}

// Noise overlay for texture
export function NoiseOverlay() {
  return <div className="noise-overlay" />;
}

// Loading shimmer
export function Shimmer({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-shimmer rounded-lg ${className}`} />
  );
}
