import { useState, useEffect } from 'react';
import { DiscountRule } from '../lib/supabase';
import { X } from 'lucide-react';

interface RuleModalProps {
  rule: DiscountRule | null;
  onClose: () => void;
  onSave: (rule: Omit<DiscountRule, 'id' | 'created_at'> & { id?: string }) => void;
}

export default function RuleModal({ rule, onClose, onSave }: RuleModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [discountPercentage, setDiscountPercentage] = useState(0);
  const [validDays, setValidDays] = useState<number[]>([]);
  const [startTime, setStartTime] = useState('18:00');
  const [endTime, setEndTime] = useState('22:00');
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (rule) {
      setName(rule.name);
      setDescription(rule.description || '');
      setDiscountPercentage(rule.discount_percentage);
      setValidDays(rule.valid_days);
      setStartTime(rule.start_time);
      setEndTime(rule.end_time);
      setIsActive(rule.is_active);
    }
  }, [rule]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const ruleData = {
      ...(rule?.id && { id: rule.id }),
      name,
      description,
      discount_percentage: discountPercentage,
      valid_days: validDays,
      start_time: startTime,
      end_time: endTime,
      is_active: isActive,
    };

    onSave(ruleData);
  };

  const toggleDay = (day: number) => {
    setValidDays(prev => 
      prev.includes(day) 
        ? prev.filter(d => d !== day)
        : [...prev, day].sort()
    );
  };

  const dayNames = ['Dum', 'Lun', 'Mar', 'Mie', 'Joi', 'Vin', 'Sâm'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto animate-slide-up">
        <div className="card-luxury border-[#D4AF37]/20 bg-gradient-to-br from-[#1a0d12] to-[#0a0608]">
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-white/5">
            <h2 className="font-display text-xl text-white">
              {rule ? 'Editează Regulă' : 'Adaugă Regulă Nouă'}
            </h2>
            <button 
              onClick={onClose}
              className="w-8 h-8 rounded-full glass flex items-center justify-center hover:border-[#D4AF37]/30 transition-all"
            >
              <X className="w-4 h-4 text-white/60" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-5 space-y-5">
            {/* Name */}
            <div>
              <label className="block text-xs text-white/40 tracking-wider uppercase mb-2">
                Nume Regulă
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="input-luxury"
                placeholder="Ex: Happy Hour Luni-Joi"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs text-white/40 tracking-wider uppercase mb-2">
                Descriere
              </label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="input-luxury resize-none h-20"
                placeholder="Descrierea regulii de discount..."
                required
              />
            </div>

            {/* Discount Percentage */}
            <div>
              <label className="block text-xs text-white/40 tracking-wider uppercase mb-2">
                Procent Reducere (%)
              </label>
              <input
                type="number"
                value={discountPercentage}
                onChange={e => setDiscountPercentage(Number(e.target.value))}
                className="input-luxury"
                min="0"
                max="100"
                required
              />
            </div>

            {/* Valid Days */}
            <div>
              <label className="block text-xs text-white/40 tracking-wider uppercase mb-2">
                Zile Valabile
              </label>
              <div className="grid grid-cols-7 gap-2">
                {dayNames.map((dayName, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => toggleDay(idx)}
                    className={`py-2 rounded-lg text-xs font-medium transition-all ${
                      validDays.includes(idx)
                        ? 'bg-[#D4AF37] text-[#0a0608]'
                        : 'bg-white/[0.03] text-white/40 border border-white/[0.06] hover:border-[#D4AF37]/30'
                    }`}
                  >
                    {dayName}
                  </button>
                ))}
              </div>
            </div>

            {/* Time Range */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-white/40 tracking-wider uppercase mb-2">
                  Oră Început
                </label>
                <input
                  type="time"
                  value={startTime}
                  onChange={e => setStartTime(e.target.value)}
                  className="input-luxury"
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-white/40 tracking-wider uppercase mb-2">
                  Oră Sfârșit
                </label>
                <input
                  type="time"
                  value={endTime}
                  onChange={e => setEndTime(e.target.value)}
                  className="input-luxury"
                  required
                />
              </div>
            </div>

            {/* Active Status */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
              <div>
                <p className="text-sm text-white font-medium">Regulă Activă</p>
                <p className="text-xs text-white/40">Activează/dezactivează regula</p>
              </div>
              <button
                type="button"
                onClick={() => setIsActive(!isActive)}
                className={`relative w-12 h-6 rounded-full transition-all ${
                  isActive ? 'bg-emerald-500' : 'bg-white/10'
                }`}
              >
                <div
                  className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${
                    isActive ? 'left-7' : 'left-1'
                  }`}
                />
              </button>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 rounded-xl glass text-white/60 hover:text-white hover:border-white/20 transition-all text-sm tracking-wider uppercase"
              >
                Anulează
              </button>
              <button
                type="submit"
                className="flex-1 btn-luxury"
              >
                {rule ? 'Salvează' : 'Adaugă'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
