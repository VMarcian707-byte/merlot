import { createClient } from '@supabase/supabase-js';

// ============================================
// CONFIGURARE SUPABASE
// ============================================
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

if (supabaseUrl === 'YOUR_SUPABASE_URL' || supabaseAnonKey === 'YOUR_SUPABASE_ANON_KEY') {
  console.warn('⚠️ Supabase nu este configurat! Editează src/lib/supabase.ts sau creează .env');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ============================================
// TIPURI TYPESCRIPT
// ============================================

export type UserRole = 'client' | 'barman' | 'manager';
export type CardStatus = 'active' | 'blocked' | 'unassigned';
export type AnnouncementTarget = 'all' | 'vip' | 'regular';

export interface User {
  id: string;
  name: string;
  phone: string | null;
  email: string;
  role: UserRole;
  avatar: string | null;
  created_at: string;
}

export interface NFCCard {
  id: string;
  card_uuid: string;
  assigned_user_id: string | null;
  status: CardStatus;
  issued_at: string;
}

export interface DiscountRule {
  id: string;
  name: string;
  description: string | null;
  discount_percentage: number;
  valid_days: number[];
  start_time: string;
  end_time: string;
  is_active: boolean;
  created_at: string;
}

export interface VisitLog {
  id: string;
  card_id: string;
  client_id: string;
  barman_id: string;
  discount_applied: number;
  scanned_at: string;
}

export interface Announcement {
  id: string;
  title: string;
  message: string;
  event_date: string | null;
  target: AnnouncementTarget;
  created_by_manager_id: string;
  created_at: string;
}

export type BadgeRequirementType = 'visits' | 'referrals' | 'spending' | 'streak' | 'special' | 'manual';

export interface Badge {
  id: string;
  code: string;
  name: string;
  description: string | null;
  emoji: string | null;
  icon_color: string;
  requirement_type: BadgeRequirementType;
  requirement_value: number;
  is_active: boolean;
  created_at: string;
}

export interface UserBadge {
  id: string;
  user_id: string;
  badge_id: string;
  earned_at: string;
  // Joined fields
  code?: string;
  name?: string;
  description?: string | null;
  emoji?: string | null;
  icon_color?: string;
}

// ============================================
// DATABASE API
// ============================================

export const db = {
  // ---------- USERS ----------
  users: {
    async getAll() {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as User[];
    },

    async getByEmail(email: string) {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();
      if (error) throw error;
      return data as User;
    },

    async getById(id: string) {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data as User;
    },

    async getClients() {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('role', 'client')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as User[];
    },

    async create(userData: Omit<User, 'id' | 'created_at'> & { password: string }) {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            name: userData.name,
            role: userData.role,
            phone: userData.phone,
            avatar: userData.avatar,
          }
        }
      });
      if (authError) throw authError;

      const { data, error } = await supabase
        .from('users')
        .update({
          name: userData.name,
          phone: userData.phone,
          email: userData.email,
          role: userData.role,
          avatar: userData.avatar,
        })
        .eq('id', authData.user!.id)
        .select()
        .single();
      
      if (error) throw error;
      return data as User;
    },

    async update(id: string, updates: Partial<User>) {
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data as User;
    },
  },

  // ---------- NFC CARDS ----------
  nfcCards: {
    async getAll() {
      const { data, error } = await supabase
        .from('nfc_cards')
        .select('*')
        .order('issued_at', { ascending: false });
      if (error) throw error;
      return data as NFCCard[];
    },

    async getByUUID(card_uuid: string) {
      const { data, error } = await supabase
        .from('nfc_cards')
        .select('*')
        .eq('card_uuid', card_uuid)
        .single();
      if (error) throw error;
      return data as NFCCard;
    },

    async getUnassigned() {
      const { data, error } = await supabase
        .from('nfc_cards')
        .select('*')
        .eq('status', 'unassigned')
        .order('issued_at', { ascending: false });
      if (error) throw error;
      return data as NFCCard[];
    },

    async assign(cardId: string, userId: string) {
      const { data, error } = await supabase
        .from('nfc_cards')
        .update({ assigned_user_id: userId, status: 'active' })
        .eq('id', cardId)
        .select()
        .single();
      if (error) throw error;
      return data as NFCCard;
    },

    async block(cardId: string) {
      const { data, error } = await supabase
        .from('nfc_cards')
        .update({ status: 'blocked' })
        .eq('id', cardId)
        .select()
        .single();
      if (error) throw error;
      return data as NFCCard;
    },

    async create(card_uuid: string) {
      const { data, error } = await supabase
        .from('nfc_cards')
        .insert({ card_uuid, status: 'unassigned' })
        .select()
        .single();
      if (error) throw error;
      return data as NFCCard;
    },
  },

  // ---------- DISCOUNT RULES ----------
  discountRules: {
    async getAll() {
      const { data, error } = await supabase
        .from('discount_rules')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as DiscountRule[];
    },

    async getActive() {
      const { data, error } = await supabase
        .from('discount_rules')
        .select('*')
        .eq('is_active', true);
      if (error) throw error;
      return data as DiscountRule[];
    },

    async toggle(id: string, is_active: boolean) {
      const { data, error } = await supabase
        .from('discount_rules')
        .update({ is_active })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data as DiscountRule;
    },

    async create(rule: Omit<DiscountRule, 'id' | 'created_at'>) {
      const { data, error } = await supabase
        .from('discount_rules')
        .insert(rule)
        .select()
        .single();
      if (error) throw error;
      return data as DiscountRule;
    },

    async update(id: string, updates: Partial<DiscountRule>) {
      const { data, error } = await supabase
        .from('discount_rules')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data as DiscountRule;
    },

    async delete(id: string) {
      const { error } = await supabase
        .from('discount_rules')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
  },

  // ---------- VISITS LOG ----------
  visitsLog: {
    async getAll() {
      const { data, error } = await supabase
        .from('visits_log')
        .select('*')
        .order('scanned_at', { ascending: false });
      if (error) throw error;
      return data as VisitLog[];
    },

    async getByClientId(clientId: string) {
      const { data, error } = await supabase
        .from('visits_log')
        .select('*')
        .eq('client_id', clientId)
        .order('scanned_at', { ascending: false });
      if (error) throw error;
      return data as VisitLog[];
    },

    async getToday() {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('visits_log')
        .select('*')
        .gte('scanned_at', `${today}T00:00:00`)
        .lte('scanned_at', `${today}T23:59:59`)
        .order('scanned_at', { ascending: false });
      if (error) throw error;
      return data as VisitLog[];
    },

    async create(visit: Omit<VisitLog, 'id' | 'scanned_at'>) {
      const { data, error } = await supabase
        .from('visits_log')
        .insert(visit)
        .select()
        .single();
      if (error) throw error;
      return data as VisitLog;
    },

    async countByClientId(clientId: string) {
      const { count, error } = await supabase
        .from('visits_log')
        .select('*', { count: 'exact', head: true })
        .eq('client_id', clientId);
      if (error) throw error;
      return count || 0;
    },
  },

  // ---------- ANNOUNCEMENTS ----------
  announcements: {
    async getAll() {
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Announcement[];
    },

    async getForUser(target: AnnouncementTarget) {
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .in('target', ['all', target])
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Announcement[];
    },

    async create(announcement: Omit<Announcement, 'id' | 'created_at'>) {
      const { data, error } = await supabase
        .from('announcements')
        .insert(announcement)
        .select()
        .single();
      if (error) throw error;
      return data as Announcement;
    },
  },

  // ---------- BADGES ----------
  badges: {
    async getAll() {
      const { data, error } = await supabase
        .from('badges')
        .select('*')
        .eq('is_active', true)
        .order('requirement_value', { ascending: true });
      if (error) throw error;
      return data as Badge[];
    },

    async getByCode(code: string) {
      const { data, error } = await supabase
        .from('badges')
        .select('*')
        .eq('code', code)
        .single();
      if (error) throw error;
      return data as Badge;
    },

    async getUserBadges(userId: string) {
      const { data, error } = await supabase
        .from('user_badges')
        .select(`
          *,
          badges:badge_id (
            id,
            code,
            name,
            description,
            emoji,
            icon_color
          )
        `)
        .eq('user_id', userId)
        .order('earned_at', { ascending: false });
      if (error) throw error;
      return data as any[];
    },

    async awardBadge(userId: string, badgeId: string) {
      const { data, error } = await supabase
        .from('user_badges')
        .insert({ user_id: userId, badge_id: badgeId })
        .select()
        .single();
      if (error) {
        // Badge deja acordat
        if (error.code === '23505') return null;
        throw error;
      }
      return data as UserBadge;
    },

    async checkAndAwardBadges(userId: string) {
      const { data, error } = await supabase.rpc('award_badges_for_visit', {
        p_client_id: userId
      });
      if (error) throw error;
      return data;
    },
  },
};

// ============================================
// AUTH API
// ============================================

export const auth = {
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single();
    
    if (profileError) throw profileError;
    return profile as User;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: profile, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();
    
    if (error) return null;
    return profile as User;
  },

  onAuthStateChange(callback: (user: User | null) => void) {
    return supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();
        callback(profile as User);
      } else if (event === 'SIGNED_OUT') {
        callback(null);
      }
    });
  },
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

export function generateUUID(): string {
  const chars = '0123456789ABCDEF';
  let uuid = '';
  for (let i = 0; i < 32; i++) {
    if (i === 8 || i === 12 || i === 16 || i === 20) uuid += '-';
    uuid += chars[Math.floor(Math.random() * 16)];
  }
  return uuid;
}

export function calculateActiveDiscount(rules: DiscountRule[]): { rule: DiscountRule | null; applicable: boolean } {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  const applicableRules = rules.filter(rule => {
    if (!rule.is_active) return false;
    if (!rule.valid_days.includes(dayOfWeek)) return false;
    
    if (currentTime >= rule.start_time && currentTime <= rule.end_time) return true;
    
    if (rule.end_time < rule.start_time) {
      if (currentTime >= rule.start_time || currentTime <= rule.end_time) return true;
    }
    
    return false;
  });

  if (applicableRules.length > 0) {
    const bestRule = applicableRules.reduce((best, rule) =>
      rule.discount_percentage > best.discount_percentage ? rule : best
    );
    return { rule: bestRule, applicable: true };
  }

  return { rule: null, applicable: false };
}
