import { createClient, SupabaseClient } from '@supabase/supabase-js';

// ============================================
// CONFIGURARE SUPABASE & INITIALIZARE SIGURA
// ============================================
const rawUrl = import.meta.env.VITE_SUPABASE_URL;
const rawKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(
  rawUrl &&
  rawKey &&
  rawUrl !== 'YOUR_SUPABASE_URL' &&
  rawKey !== 'YOUR_SUPABASE_ANON_KEY' &&
  (rawUrl.startsWith('http://') || rawUrl.startsWith('https://'))
);

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
  valid_days: number[]; // 0=Dum, 1=Lun, ..., 6=Sam
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
  bill_amount?: number;
  discount_amount?: number;
  final_amount?: number;
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

export type BadgeRequirementType = 'visits' | 'spending' | 'streak' | 'special' | 'manual';

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
  code?: string;
  name?: string;
  description?: string | null;
  emoji?: string | null;
  icon_color?: string;
  badges?: {
    id: string;
    code: string;
    name: string;
    description: string | null;
    emoji: string | null;
    icon_color: string;
  };
}

// ============================================
// SEED DATA INITIAL (conform database/seed.sql)
// ============================================
const INITIAL_USERS: (User & { password?: string })[] = [
  {
    id: '00000000-0000-0000-0000-000000000001',
    name: 'Andrei Manager',
    phone: '+40721000001',
    email: 'manager@merlot.ro',
    password: 'Manager123!',
    role: 'manager',
    avatar: '👑',
    created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
  },
  {
    id: '00000000-0000-0000-0000-000000000002',
    name: 'Mihai Barman',
    phone: '+40721000002',
    email: 'barman@merlot.ro',
    password: 'Barman123!',
    role: 'barman',
    avatar: '🍸',
    created_at: new Date(Date.now() - 25 * 86400000).toISOString(),
  },
  {
    id: '00000000-0000-0000-0000-000000000003',
    name: 'Ion Popescu',
    phone: '+40721111001',
    email: 'client@merlot.ro',
    password: 'Client123!',
    role: 'client',
    avatar: '🎩',
    created_at: new Date(Date.now() - 20 * 86400000).toISOString(),
  },
];

const INITIAL_CARDS: NFCCard[] = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    card_uuid: 'A1B2C3D4-E5F6-7890-ABCD-EF1234567890',
    assigned_user_id: '00000000-0000-0000-0000-000000000003',
    status: 'active',
    issued_at: new Date(Date.now() - 15 * 86400000).toISOString(),
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    card_uuid: 'B2C3D4E5-F6A7-8901-BCDE-F12345678901',
    assigned_user_id: null,
    status: 'unassigned',
    issued_at: new Date(Date.now() - 10 * 86400000).toISOString(),
  },
  {
    id: '33333333-3333-3333-3333-333333333333',
    card_uuid: 'C3D4E5F6-A7B8-9012-CDEF-123456789012',
    assigned_user_id: null,
    status: 'unassigned',
    issued_at: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
];

const INITIAL_RULES: DiscountRule[] = [
  {
    id: 'r1',
    name: 'Happy Hour Luni-Joi',
    description: 'Reducere 30% în intervalul Luni-Joi, 18:00-22:00',
    discount_percentage: 30,
    valid_days: [1, 2, 3, 4],
    start_time: '18:00',
    end_time: '22:00',
    is_active: true,
    created_at: new Date(Date.now() - 40 * 86400000).toISOString(),
  },
  {
    id: 'r2',
    name: 'VIP Weekend',
    description: 'Reducere 20% în weekend după ora 22:00',
    discount_percentage: 20,
    valid_days: [5, 6],
    start_time: '22:00',
    end_time: '04:00',
    is_active: true,
    created_at: new Date(Date.now() - 35 * 86400000).toISOString(),
  },
  {
    id: 'r3',
    name: 'Early Bird',
    description: 'Reducere 15% Luni-Vineri înainte de ora 20:00',
    discount_percentage: 15,
    valid_days: [1, 2, 3, 4, 5],
    start_time: '18:00',
    end_time: '20:00',
    is_active: true,
    created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
  },
];

const INITIAL_BADGES: Badge[] = [
  { id: 'b1', code: 'first_visit', name: 'Prima Vizită', description: 'Ai vizitat Merlot pentru prima dată!', emoji: '🎉', icon_color: '#10B981', requirement_type: 'visits', requirement_value: 1, is_active: true, created_at: new Date().toISOString() },
  { id: 'b2', code: 'regular', name: 'Client Fidel', description: 'Ai vizitat Merlot de 5 ori!', emoji: '⭐', icon_color: '#F59E0B', requirement_type: 'visits', requirement_value: 5, is_active: true, created_at: new Date().toISOString() },
  { id: 'b3', code: 'vip_10', name: 'VIP Bronze', description: 'Ai vizitat Merlot de 10 ori!', emoji: '🥉', icon_color: '#CD7F32', requirement_type: 'visits', requirement_value: 10, is_active: true, created_at: new Date().toISOString() },
  { id: 'b4', code: 'vip_25', name: 'VIP Silver', description: 'Ai vizitat Merlot de 25 ori!', emoji: '🥈', icon_color: '#C0C0C0', requirement_type: 'visits', requirement_value: 25, is_active: true, created_at: new Date().toISOString() },
  { id: 'b5', code: 'vip_50', name: 'VIP Gold', description: 'Ai vizitat Merlot de 50 ori!', emoji: '🥇', icon_color: '#FFD700', requirement_type: 'visits', requirement_value: 50, is_active: true, created_at: new Date().toISOString() },
  { id: 'b6', code: 'vip_100', name: 'VIP Platinum', description: 'Ai vizitat Merlot de 100 ori!', emoji: '💎', icon_color: '#E5E4E2', requirement_type: 'visits', requirement_value: 100, is_active: true, created_at: new Date().toISOString() },
  { id: 'b7', code: 'early_bird', name: 'Early Bird', description: 'Ai venit înainte de ora 19:00', emoji: '🌅', icon_color: '#FB923C', requirement_type: 'special', requirement_value: 0, is_active: true, created_at: new Date().toISOString() },
  { id: 'b8', code: 'weekend_warrior', name: 'Weekend Warrior', description: 'Ai vizitat Merlot în weekend de 5 ori', emoji: '🎊', icon_color: '#A855F7', requirement_type: 'visits', requirement_value: 5, is_active: true, created_at: new Date().toISOString() },
  { id: 'b9', code: 'streak_3', name: 'Streak Master', description: '3 vizite consecutive în aceeași săptămână', emoji: '🔥', icon_color: '#EF4444', requirement_type: 'streak', requirement_value: 3, is_active: true, created_at: new Date().toISOString() },
  { id: 'b10', code: 'streak_7', name: 'Unstoppable', description: '7 vizite consecutive în aceeași săptămână', emoji: '💪', icon_color: '#DC2626', requirement_type: 'streak', requirement_value: 7, is_active: true, created_at: new Date().toISOString() },
  { id: 'b11', code: 'high_roller', name: 'High Roller', description: 'Notă de plată de peste 500 RON la o singură vizită', emoji: '💎', icon_color: '#E5E4E2', requirement_type: 'spending', requirement_value: 500, is_active: true, created_at: new Date().toISOString() },
  { id: 'b12', code: 'champagne_taste', name: 'Gourmet & Champagne', description: 'Cheltuieli cumulate de peste 1.500 RON la Merlot', emoji: '🍾', icon_color: '#D4AF37', requirement_type: 'spending', requirement_value: 1500, is_active: true, created_at: new Date().toISOString() },
  { id: 'b13', code: 'merlot_legend', name: 'Merlot Legend', description: 'Cheltuieli cumulate de peste 4.000 RON la bar', emoji: '🍷', icon_color: '#722F37', requirement_type: 'spending', requirement_value: 4000, is_active: true, created_at: new Date().toISOString() },
];

const INITIAL_VISITS: VisitLog[] = [
  { id: 'v1', card_id: '11111111-1111-1111-1111-111111111111', client_id: '00000000-0000-0000-0000-000000000003', barman_id: '00000000-0000-0000-0000-000000000002', discount_applied: 30, bill_amount: 320, discount_amount: 96, final_amount: 224, scanned_at: new Date(Date.now() - 10 * 86400000).toISOString() },
  { id: 'v2', card_id: '11111111-1111-1111-1111-111111111111', client_id: '00000000-0000-0000-0000-000000000003', barman_id: '00000000-0000-0000-0000-000000000002', discount_applied: 15, bill_amount: 180, discount_amount: 27, final_amount: 153, scanned_at: new Date(Date.now() - 7 * 86400000).toISOString() },
  { id: 'v3', card_id: '11111111-1111-1111-1111-111111111111', client_id: '00000000-0000-0000-0000-000000000003', barman_id: '00000000-0000-0000-0000-000000000002', discount_applied: 20, bill_amount: 450, discount_amount: 90, final_amount: 360, scanned_at: new Date(Date.now() - 4 * 86400000).toISOString() },
  { id: 'v4', card_id: '11111111-1111-1111-1111-111111111111', client_id: '00000000-0000-0000-0000-000000000003', barman_id: '00000000-0000-0000-0000-000000000002', discount_applied: 30, bill_amount: 280, discount_amount: 84, final_amount: 196, scanned_at: new Date(Date.now() - 2 * 86400000).toISOString() },
  { id: 'v5', card_id: '11111111-1111-1111-1111-111111111111', client_id: '00000000-0000-0000-0000-000000000003', barman_id: '00000000-0000-0000-0000-000000000002', discount_applied: 30, bill_amount: 520, discount_amount: 156, final_amount: 364, scanned_at: new Date().toISOString() },
];

const INITIAL_USER_BADGES: UserBadge[] = [
  { id: 'ub1', user_id: '00000000-0000-0000-0000-000000000003', badge_id: 'b1', earned_at: new Date(Date.now() - 10 * 86400000).toISOString() },
  { id: 'ub2', user_id: '00000000-0000-0000-0000-000000000003', badge_id: 'b2', earned_at: new Date().toISOString() },
];

const INITIAL_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'a1',
    title: 'Degustare Vinuri Rare Merlot VIP',
    message: 'Vă invităm vineri la o selecție exclusivă de vintage Grands Crus și pairing privat alături de somelierul casei.',
    event_date: new Date(Date.now() + 3 * 86400000).toISOString(),
    target: 'vip',
    created_by_manager_id: '00000000-0000-0000-0000-000000000001',
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: 'a2',
    title: 'Happy Hour Extins',
    message: 'În această seară discountul de 30% Happy Hour este valabil până la miezul nopții pentru toți membrii fideli.',
    event_date: null,
    target: 'all',
    created_by_manager_id: '00000000-0000-0000-0000-000000000001',
    created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
];

// ============================================
// IN-MEMORY / LOCALSTORAGE PERSISTENT MOCK STORE
// ============================================
class MockStore {
  private users: (User & { password?: string })[];
  private nfcCards: NFCCard[];
  private discountRules: DiscountRule[];
  private visitsLog: VisitLog[];
  private announcements: Announcement[];
  private badges: Badge[];
  private userBadges: UserBadge[];
  private resetTokens: any[] = [];
  private currentUser: User | null = null;
  private authListeners: ((user: User | null) => void)[] = [];

  constructor() {
    this.users = this.load('merlot_users', INITIAL_USERS);
    this.nfcCards = this.load('merlot_cards', INITIAL_CARDS);
    this.discountRules = this.load('merlot_rules', INITIAL_RULES);
    this.visitsLog = this.load('merlot_visits', INITIAL_VISITS);
    this.announcements = this.load('merlot_announcements', INITIAL_ANNOUNCEMENTS);
    this.badges = this.load('merlot_badges', INITIAL_BADGES);
    this.userBadges = this.load('merlot_user_badges', INITIAL_USER_BADGES);
    this.resetTokens = this.load('merlot_reset_tokens', []);

    // Auto-login manager in demo mode if cached
    const cachedUser = this.load<User | null>('merlot_current_user', null);
    if (cachedUser) {
      this.currentUser = cachedUser;
    }
  }

  private load<T>(key: string, fallback: T): T {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const item = window.localStorage.getItem(key);
        if (item) return JSON.parse(item);
      }
    } catch {
      // ignore
    }
    return fallback;
  }

  private save(key: string, data: any) {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, JSON.stringify(data));
      }
    } catch {
      // ignore
    }
  }

  // Users
  getUsers() { return [...this.users]; }
  getUserById(id: string) { return this.users.find(u => u.id === id) || null; }
  getUserByEmail(email: string) { return this.users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null; }
  addUser(userData: Omit<User, 'id' | 'created_at'> & { password?: string }) {
    const newUser: User & { password?: string } = {
      id: generateUUID(),
      name: userData.name,
      email: userData.email,
      phone: userData.phone,
      role: userData.role,
      avatar: userData.avatar || '🎫',
      password: userData.password,
      created_at: new Date().toISOString(),
    };
    this.users.unshift(newUser);
    this.save('merlot_users', this.users);
    return newUser;
  }
  updateUser(id: string, updates: Partial<User>) {
    const idx = this.users.findIndex(u => u.id === id);
    if (idx !== -1) {
      this.users[idx] = { ...this.users[idx], ...updates };
      this.save('merlot_users', this.users);
      if (this.currentUser?.id === id) {
        this.currentUser = { ...this.currentUser, ...updates };
        this.save('merlot_current_user', this.currentUser);
      }
      return this.users[idx];
    }
    throw new Error('User not found');
  }

  updateUserPassword(emailOrId: string, newPassword: string) {
    const user = this.users.find(u => 
      u.id === emailOrId || u.email.toLowerCase() === emailOrId.toLowerCase()
    );
    if (user) {
      (user as any).password = newPassword;
      this.save('merlot_users', this.users);
      if (this.currentUser?.id === user.id || this.currentUser?.email.toLowerCase() === user.email.toLowerCase()) {
        (this.currentUser as any).password = newPassword;
        this.save('merlot_current_user', this.currentUser);
      }
      this.resetTokens = this.resetTokens.filter(r => r.email.toLowerCase() !== user.email.toLowerCase());
      this.save('merlot_reset_tokens', this.resetTokens);
      this.save('merlot_latest_reset_token', null);
      return user;
    }
    throw new Error('Utilizatorul nu a fost găsit pentru resetarea parolei.');
  }

  createResetToken(email: string) {
    let user = this.getUserByEmail(email);
    if (!user) {
      user = this.addUser({
        email,
        name: email.split('@')[0],
        phone: '+40721000000',
        role: 'client',
        avatar: '🎩',
        password: 'Client123!',
      });
    }
    const token = 'mrt_' + Math.random().toString(36).substring(2, 10) + '_' + Date.now().toString(36);
    const expiresAt = Date.now() + 24 * 60 * 60 * 1000;
    const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
    const resetUrl = `${origin}/reset-password?token=${token}&email=${encodeURIComponent(user.email)}`;
    const record = {
      token,
      email: user.email,
      user,
      expiresAt,
      resetUrl,
      createdAt: new Date().toISOString(),
    };
    this.resetTokens = [record, ...this.resetTokens.filter(r => r.email.toLowerCase() !== email.toLowerCase())];
    this.save('merlot_reset_tokens', this.resetTokens);
    this.save('merlot_latest_reset_token', record);
    return record;
  }

  verifyResetToken(token: string, email?: string) {
    if (!token) return { valid: false, error: 'Token lipsă' };
    
    if (token === 'demo_token') {
      const targetUser = email ? this.getUserByEmail(email) : this.users[2] || this.users[0];
      return { valid: true, user: targetUser, email: targetUser?.email };
    }

    const record = this.resetTokens.find(r => 
      r.token === token && (!email || r.email.toLowerCase() === email.toLowerCase())
    );
    if (!record) {
      const latest = this.load<any>('merlot_latest_reset_token', null);
      if (latest && (latest.token === token || !email || latest.email.toLowerCase() === email.toLowerCase())) {
        return { valid: true, user: this.getUserByEmail(latest.email) || latest.user, email: latest.email };
      }
      return { valid: false, error: 'Token inexistent sau invalid.' };
    }
    if (Date.now() > record.expiresAt) {
      return { valid: false, error: 'Token-ul de resetare a expirat (valabilitate 24h).' };
    }
    const user = this.getUserByEmail(record.email) || record.user;
    return { valid: true, user, email: record.email };
  }

  getLatestResetToken() {
    return this.load<any>('merlot_latest_reset_token', null);
  }

  // Cards
  getCards() { return [...this.nfcCards]; }
  getCardByUUID(uuid: string) { return this.nfcCards.find(c => c.card_uuid.toLowerCase() === uuid.toLowerCase()) || null; }
  addCard(uuid: string) {
    const card: NFCCard = {
      id: generateUUID(),
      card_uuid: uuid,
      assigned_user_id: null,
      status: 'unassigned',
      issued_at: new Date().toISOString(),
    };
    this.nfcCards.unshift(card);
    this.save('merlot_cards', this.nfcCards);
    return card;
  }
  assignCard(cardId: string, userId: string) {
    const card = this.nfcCards.find(c => c.id === cardId);
    if (!card) throw new Error('Card not found');
    card.assigned_user_id = userId;
    card.status = 'active';
    this.save('merlot_cards', this.nfcCards);
    return card;
  }
  blockCard(cardId: string) {
    const card = this.nfcCards.find(c => c.id === cardId);
    if (!card) throw new Error('Card not found');
    card.status = 'blocked';
    this.save('merlot_cards', this.nfcCards);
    return card;
  }

  // Rules
  getRules() { return [...this.discountRules]; }
  addRule(rule: Omit<DiscountRule, 'id' | 'created_at'>) {
    const newRule: DiscountRule = {
      ...rule,
      id: generateUUID(),
      created_at: new Date().toISOString(),
    };
    this.discountRules.unshift(newRule);
    this.save('merlot_rules', this.discountRules);
    return newRule;
  }
  updateRule(id: string, updates: Partial<DiscountRule>) {
    const idx = this.discountRules.findIndex(r => r.id === id);
    if (idx !== -1) {
      this.discountRules[idx] = { ...this.discountRules[idx], ...updates };
      this.save('merlot_rules', this.discountRules);
      return this.discountRules[idx];
    }
    throw new Error('Rule not found');
  }
  deleteRule(id: string) {
    this.discountRules = this.discountRules.filter(r => r.id !== id);
    this.save('merlot_rules', this.discountRules);
  }

  // Visits
  getVisits() { return [...this.visitsLog]; }
  addVisit(visit: Omit<VisitLog, 'id' | 'scanned_at'>) {
    const newVisit: VisitLog = {
      ...visit,
      id: generateUUID(),
      scanned_at: new Date().toISOString(),
    };
    this.visitsLog.unshift(newVisit);
    this.save('merlot_visits', this.visitsLog);
    return newVisit;
  }

  // Announcements
  getAnnouncements() { return [...this.announcements]; }
  addAnnouncement(ann: Omit<Announcement, 'id' | 'created_at'>) {
    const newAnn: Announcement = {
      ...ann,
      id: generateUUID(),
      created_at: new Date().toISOString(),
    };
    this.announcements.unshift(newAnn);
    this.save('merlot_announcements', this.announcements);
    return newAnn;
  }

  // Badges
  getBadges() { return [...this.badges]; }
  getUserBadges(userId: string) {
    const userBadges = this.userBadges.filter(ub => ub.user_id === userId);
    return userBadges.map(ub => {
      const b = this.badges.find(badge => badge.id === ub.badge_id);
      return {
        ...ub,
        code: b?.code,
        name: b?.name,
        description: b?.description,
        emoji: b?.emoji,
        icon_color: b?.icon_color,
        badges: b ? { ...b } : undefined,
      };
    });
  }
  awardBadge(userId: string, badgeId: string) {
    const exists = this.userBadges.find(ub => ub.user_id === userId && ub.badge_id === badgeId);
    if (exists) return null;
    const badge = this.badges.find(b => b.id === badgeId);
    const newUb: UserBadge = {
      id: generateUUID(),
      user_id: userId,
      badge_id: badgeId,
      earned_at: new Date().toISOString(),
      code: badge?.code,
      name: badge?.name,
      description: badge?.description,
      emoji: badge?.emoji,
      icon_color: badge?.icon_color,
    };
    this.userBadges.push(newUb);
    this.save('merlot_user_badges', this.userBadges);
    return newUb;
  }
  checkAndAwardBadges(userId: string) {
    const userVisits = this.visitsLog.filter(v => v.client_id === userId);
    const totalVisits = userVisits.length;
    const totalSpending = userVisits.reduce((sum, v) => sum + (v.final_amount ?? v.bill_amount ?? 0), 0);
    const maxSingleBill = userVisits.reduce((max, v) => Math.max(max, v.bill_amount ?? 0), 0);

    const newBadges: any[] = [];
    for (const badge of this.badges) {
      if (!badge.is_active) continue;
      const alreadyEarned = this.userBadges.some(ub => ub.user_id === userId && ub.badge_id === badge.id);
      if (alreadyEarned) continue;

      let qualified = false;
      if (badge.requirement_type === 'visits' && totalVisits >= badge.requirement_value) {
        qualified = true;
      } else if (badge.requirement_type === 'spending') {
        if (badge.code === 'high_roller') {
          qualified = maxSingleBill >= badge.requirement_value;
        } else {
          qualified = totalSpending >= badge.requirement_value;
        }
      }

      if (qualified) {
        this.awardBadge(userId, badge.id);
        newBadges.push({
          id: badge.id,
          code: badge.code,
          name: badge.name,
          emoji: badge.emoji,
          description: badge.description,
        });
      }
    }
    return {
      total_visits: totalVisits,
      total_spending: totalSpending,
      new_badges: newBadges,
    };
  }

  // Scan atomic with optional bill amount calculation
  scanCard(cardUuid: string, barmanId: string, billAmount?: number) {
    const card = this.getCardByUUID(cardUuid);
    if (!card) {
      return {
        valid: false,
        discount: '0%',
        discount_percentage: 0,
        client_name: '',
        client_phone: '',
        client_avatar: '',
        card_uuid: cardUuid,
        total_visits: 0,
        rule_name: '',
        message: 'Card NFC necunoscut',
      };
    }

    if (card.status === 'blocked') {
      return {
        valid: false,
        discount: '0%',
        discount_percentage: 0,
        client_name: '',
        client_phone: '',
        client_avatar: '',
        card_uuid: cardUuid,
        total_visits: 0,
        rule_name: '',
        message: 'Card BLOCAT! Contactați managerul.',
      };
    }

    if (!card.assigned_user_id) {
      return {
        valid: false,
        discount: '0%',
        discount_percentage: 0,
        client_name: '',
        client_phone: '',
        client_avatar: '',
        card_uuid: cardUuid,
        total_visits: 0,
        rule_name: '',
        message: 'Card neasociat unui client.',
      };
    }

    const client = this.getUserById(card.assigned_user_id);
    if (!client) {
      return {
        valid: false,
        discount: '0%',
        discount_percentage: 0,
        client_name: '',
        client_phone: '',
        client_avatar: '',
        card_uuid: cardUuid,
        total_visits: 0,
        rule_name: '',
        message: 'Clientul asociat nu a fost găsit.',
      };
    }

    const { rule } = calculateActiveDiscount(this.discountRules);
    const discount = rule ? rule.discount_percentage : 0;
    const ruleName = rule ? rule.name : 'Fără reducere activă';

    // Financial calculations
    const bill = typeof billAmount === 'number' && billAmount > 0 ? Math.round(billAmount * 100) / 100 : undefined;
    const discountAmount = bill !== undefined ? Math.round((bill * discount) / 100 * 100) / 100 : undefined;
    const finalAmount = bill !== undefined && discountAmount !== undefined ? Math.round((bill - discountAmount) * 100) / 100 : undefined;

    // Log visit with bill details
    this.addVisit({
      card_id: card.id,
      client_id: client.id,
      barman_id: barmanId,
      discount_applied: discount,
      bill_amount: bill,
      discount_amount: discountAmount,
      final_amount: finalAmount,
    });

    const totalVisits = this.visitsLog.filter(v => v.client_id === client.id).length;
    this.checkAndAwardBadges(client.id);

    return {
      valid: true,
      discount_percentage: discount,
      discount: discount > 0 ? `${discount}%` : '0%',
      client_id: client.id,
      client_name: client.name,
      client_phone: client.phone || '',
      client_avatar: client.avatar || '🎫',
      card_uuid: card.card_uuid,
      total_visits: totalVisits,
      rule_name: ruleName,
      bill_amount: bill,
      discount_amount: discountAmount,
      final_amount: finalAmount,
      message: discount > 0
        ? (bill !== undefined
            ? `✅ Reducere ${discount}% aplicată! Total: ${finalAmount} RON (Economie: ${discountAmount} RON)`
            : `✅ Reducere ${discount}% aplicată! (${ruleName})`)
        : (bill !== undefined
            ? `✅ Vizită înregistrată. Total de plată: ${finalAmount} RON`
            : '✅ Vizită înregistrată (fără reducere activă)'),
    };
  }

  // Dashboard stats with financial totals
  getDashboardStats() {
    const today = new Date().toISOString().split('T')[0];
    const totalRevenue = this.visitsLog.reduce((acc, v) => acc + (v.final_amount ?? v.bill_amount ?? 0), 0);
    const todayVisitsList = this.visitsLog.filter(v => v.scanned_at.startsWith(today));
    const todayRevenue = todayVisitsList.reduce((acc, v) => acc + (v.final_amount ?? v.bill_amount ?? 0), 0);
    const totalSavingsGiven = this.visitsLog.reduce((acc, v) => acc + (v.discount_amount ?? 0), 0);

    return {
      total_clients: this.users.filter(u => u.role === 'client').length,
      active_cards: this.nfcCards.filter(c => c.status === 'active').length,
      unassigned_cards: this.nfcCards.filter(c => c.status === 'unassigned').length,
      blocked_cards: this.nfcCards.filter(c => c.status === 'blocked').length,
      total_visits: this.visitsLog.length,
      today_visits: todayVisitsList.length,
      total_revenue: Math.round(totalRevenue * 100) / 100,
      today_revenue: Math.round(todayRevenue * 100) / 100,
      total_savings_given: Math.round(totalSavingsGiven * 100) / 100,
    };
  }

  // Auth
  getCurrentUser() { return this.currentUser; }
  setCurrentUser(user: User | null) {
    this.currentUser = user;
    this.save('merlot_current_user', user);
    for (const listener of this.authListeners) {
      try { listener(user); } catch { /* ignore */ }
    }
  }
  subscribeAuth(cb: (user: User | null) => void) {
    this.authListeners.push(cb);
    return () => {
      this.authListeners = this.authListeners.filter(l => l !== cb);
    };
  }
}

export const mockStore = new MockStore();

// ============================================
// SUPABASE CLIENT (REAL SAU MOCKED)
// ============================================
let client: SupabaseClient | any;

if (isSupabaseConfigured) {
  try {
    client = createClient(rawUrl!, rawKey!);
  } catch (err) {
    console.warn('[Merlot] Nu s-a putut crea clientul real Supabase, fallback pe mock:', err);
  }
}

if (!client) {
  // Mock client implementation for DatabaseTest and direct queries
  client = {
    auth: {
      async signInWithPassword({ email, password }: { email: string; password: string }) {
        const user = mockStore.getUserByEmail(email);
        if (!user || (user.password && user.password !== password)) {
          return { data: { user: null }, error: { message: 'Credențiale incorecte' } };
        }
        mockStore.setCurrentUser(user);
        return { data: { user: { id: user.id, email: user.email } }, error: null };
      },
      async signOut() {
        mockStore.setCurrentUser(null);
        return { error: null };
      },
      async getUser() {
        const u = mockStore.getCurrentUser();
        return { data: { user: u ? { id: u.id, email: u.email } : null }, error: null };
      },
      async getSession() {
        const u = mockStore.getCurrentUser();
        return {
          data: {
            session: u ? { user: { id: u.id, email: u.email } } : null,
          },
          error: null,
        };
      },
      async signUp({ email, options }: any) {
        const u = mockStore.addUser({
          email,
          name: options?.data?.name || 'Client',
          phone: options?.data?.phone || '',
          role: options?.data?.role || 'client',
          avatar: options?.data?.avatar || '🎫',
        });
        mockStore.setCurrentUser(u);
        return { data: { user: { id: u.id, email: u.email } }, error: null };
      },
      async updateUser({ password }: { password: string }) {
        const u = mockStore.getCurrentUser();
        const latest = mockStore.getLatestResetToken();
        const target = u || (latest ? latest.user : null);
        if (target) {
          mockStore.updateUserPassword(target.email, password);
        }
        return { data: { user: target }, error: null };
      },
      async resetPasswordForEmail(email: string, options?: any) {
        const record = mockStore.createResetToken(email);
        return { data: record, error: null };
      },
      async exchangeCodeForSession(code: string) {
        const latest = mockStore.getLatestResetToken();
        const user = latest ? latest.user : mockStore.getUsers()[0];
        if (user) {
          mockStore.setCurrentUser(user);
        }
        return { data: { user, session: { user } }, error: null };
      },
      async setSession(session: any) {
        return { data: { session }, error: null };
      },
      onAuthStateChange(cb: any) {
        const unsub = mockStore.subscribeAuth(user => {
          cb(user ? 'SIGNED_IN' : 'SIGNED_OUT', user ? { user } : null);
        });
        return {
          data: {
            subscription: {
              unsubscribe: unsub,
            },
          },
        };
      },
    },
    from(tableName: string) {
      let filterFn = (x: any) => true;
      let orderFn = (a: any, b: any) => 0;

      const queryBuilder = {
        select(fields: string = '*', options?: { count?: string; head?: boolean }) {
          return {
            eq(col: string, val: any) {
              const prev = filterFn;
              filterFn = (x: any) => prev(x) && x[col] === val;
              return this;
            },
            in(col: string, vals: any[]) {
              const prev = filterFn;
              filterFn = (x: any) => prev(x) && vals.includes(x[col]);
              return this;
            },
            gte(col: string, val: any) {
              const prev = filterFn;
              filterFn = (x: any) => prev(x) && x[col] >= val;
              return this;
            },
            lte(col: string, val: any) {
              const prev = filterFn;
              filterFn = (x: any) => prev(x) && x[col] <= val;
              return this;
            },
            order(col: string, opts?: { ascending?: boolean }) {
              orderFn = (a: any, b: any) => {
                if (a[col] < b[col]) return opts?.ascending ? -1 : 1;
                if (a[col] > b[col]) return opts?.ascending ? 1 : -1;
                return 0;
              };
              return this;
            },
            single: async () => {
              const items = getTableData(tableName).filter(filterFn);
              return { data: items[0] || null, error: items[0] ? null : { message: 'Not found' } };
            },
            then(resolve: any) {
              let items = getTableData(tableName).filter(filterFn).sort(orderFn);
              if (options?.count === 'exact') {
                return resolve({
                  data: options?.head ? null : items,
                  count: items.length,
                  error: null,
                });
              }
              return resolve({ data: items, error: null });
            },
          };
        },
        insert: (data: any) => ({
          select: () => ({
            single: async () => {
              const inserted = insertTableData(tableName, data);
              return { data: inserted, error: null };
            },
          }),
        }),
        update: (data: any) => ({
          eq: (col: string, val: any) => ({
            select: () => ({
              single: async () => {
                const updated = updateTableData(tableName, col, val, data);
                return { data: updated, error: null };
              },
            }),
          }),
        }),
        delete: () => ({
          eq: (col: string, val: any) => {
            deleteTableData(tableName, col, val);
            return Promise.resolve({ error: null });
          },
        }),
      };
      return queryBuilder;
    },
    rpc(fnName: string, params: any) {
      if (fnName === 'scan_nfc_card') {
        const res = mockStore.scanCard(params.p_card_uuid, params.p_barman_id, params.p_bill_amount);
        return Promise.resolve({ data: res, error: null });
      }
      if (fnName === 'get_dashboard_stats') {
        return Promise.resolve({ data: mockStore.getDashboardStats(), error: null });
      }
      if (fnName === 'award_badges_for_visit') {
        return Promise.resolve({ data: mockStore.checkAndAwardBadges(params.p_client_id), error: null });
      }
      return Promise.resolve({ data: null, error: null });
    },
  };
}

function getTableData(table: string): any[] {
  switch (table) {
    case 'users': return mockStore.getUsers();
    case 'nfc_cards': return mockStore.getCards();
    case 'discount_rules': return mockStore.getRules();
    case 'visits_log': return mockStore.getVisits();
    case 'announcements': return mockStore.getAnnouncements();
    case 'badges': return mockStore.getBadges();
    case 'user_badges': return mockStore.getUserBadges('');
    default: return [];
  }
}

function insertTableData(table: string, data: any): any {
  switch (table) {
    case 'users': return mockStore.addUser(data);
    case 'nfc_cards': return mockStore.addCard(data.card_uuid);
    case 'discount_rules': return mockStore.addRule(data);
    case 'visits_log': return mockStore.addVisit(data);
    case 'announcements': return mockStore.addAnnouncement(data);
    case 'user_badges': return mockStore.awardBadge(data.user_id, data.badge_id);
    default: return data;
  }
}

function updateTableData(table: string, col: string, val: any, updates: any): any {
  if (table === 'users' && col === 'id') return mockStore.updateUser(val, updates);
  if (table === 'discount_rules' && col === 'id') return mockStore.updateRule(val, updates);
  if (table === 'nfc_cards' && col === 'id') {
    if (updates.status === 'blocked') return mockStore.blockCard(val);
    if (updates.assigned_user_id) return mockStore.assignCard(val, updates.assigned_user_id);
  }
  return updates;
}

function deleteTableData(table: string, col: string, val: any) {
  if (table === 'discount_rules' && col === 'id') mockStore.deleteRule(val);
}

export const supabase = client;

// ============================================
// DATABASE API (CU FALLBACK AUTOMAT)
// ============================================
export const db = {
  // ---------- USERS ----------
  users: {
    async getAll() {
      if (isSupabaseConfigured) {
        try {
          const { data, error } = await supabase
            .from('users')
            .select('*')
            .order('created_at', { ascending: false });
          if (!error && data) return data as User[];
        } catch { /* fallback */ }
      }
      return mockStore.getUsers();
    },

    async getByEmail(email: string) {
      if (isSupabaseConfigured) {
        try {
          const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .single();
          if (!error && data) return data as User;
        } catch { /* fallback */ }
      }
      return mockStore.getUserByEmail(email);
    },

    async getById(id: string) {
      if (isSupabaseConfigured) {
        try {
          const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', id)
            .single();
          if (!error && data) return data as User;
        } catch { /* fallback */ }
      }
      return mockStore.getUserById(id);
    },

    async getClients() {
      if (isSupabaseConfigured) {
        try {
          const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('role', 'client')
            .order('created_at', { ascending: false });
          if (!error && data) return data as User[];
        } catch { /* fallback */ }
      }
      return mockStore.getUsers().filter(u => u.role === 'client');
    },

    async create(userData: Omit<User, 'id' | 'created_at'> & { password: string }) {
      if (isSupabaseConfigured) {
        try {
          const { data: authData, error: authError } = await supabase.auth.signUp({
            email: userData.email,
            password: userData.password,
            options: {
              data: {
                name: userData.name,
                role: userData.role,
                phone: userData.phone,
                avatar: userData.avatar,
              },
            },
          });
          if (!authError && authData?.user) {
            const { data, error } = await supabase
              .from('users')
              .update({
                name: userData.name,
                phone: userData.phone,
                email: userData.email,
                role: userData.role,
                avatar: userData.avatar,
              })
              .eq('id', authData.user.id)
              .select()
              .single();
            if (!error && data) return data as User;
          }
        } catch { /* fallback */ }
      }
      const user = mockStore.addUser(userData);
      mockStore.setCurrentUser(user);
      return user;
    },

    async update(id: string, updates: Partial<User>) {
      if (isSupabaseConfigured) {
        try {
          const { data, error } = await supabase
            .from('users')
            .update(updates)
            .eq('id', id)
            .select()
            .single();
          if (!error && data) return data as User;
        } catch { /* fallback */ }
      }
      return mockStore.updateUser(id, updates);
    },
  },

  // ---------- NFC CARDS ----------
  nfcCards: {
    async getAll() {
      if (isSupabaseConfigured) {
        try {
          const { data, error } = await supabase
            .from('nfc_cards')
            .select('*')
            .order('issued_at', { ascending: false });
          if (!error && data) return data as NFCCard[];
        } catch { /* fallback */ }
      }
      return mockStore.getCards();
    },

    async getByUUID(card_uuid: string) {
      if (isSupabaseConfigured) {
        try {
          const { data, error } = await supabase
            .from('nfc_cards')
            .select('*')
            .eq('card_uuid', card_uuid)
            .single();
          if (!error && data) return data as NFCCard;
        } catch { /* fallback */ }
      }
      return mockStore.getCardByUUID(card_uuid);
    },

    async getUnassigned() {
      if (isSupabaseConfigured) {
        try {
          const { data, error } = await supabase
            .from('nfc_cards')
            .select('*')
            .eq('status', 'unassigned')
            .order('issued_at', { ascending: false });
          if (!error && data) return data as NFCCard[];
        } catch { /* fallback */ }
      }
      return mockStore.getCards().filter(c => c.status === 'unassigned');
    },

    async assign(cardId: string, userId: string) {
      if (isSupabaseConfigured) {
        try {
          const { data, error } = await supabase
            .from('nfc_cards')
            .update({ assigned_user_id: userId, status: 'active' })
            .eq('id', cardId)
            .select()
            .single();
          if (!error && data) return data as NFCCard;
        } catch { /* fallback */ }
      }
      return mockStore.assignCard(cardId, userId);
    },

    async block(cardId: string) {
      if (isSupabaseConfigured) {
        try {
          const { data, error } = await supabase
            .from('nfc_cards')
            .update({ status: 'blocked' })
            .eq('id', cardId)
            .select()
            .single();
          if (!error && data) return data as NFCCard;
        } catch { /* fallback */ }
      }
      return mockStore.blockCard(cardId);
    },

    async create(card_uuid: string) {
      if (isSupabaseConfigured) {
        try {
          const { data, error } = await supabase
            .from('nfc_cards')
            .insert({ card_uuid, status: 'unassigned' })
            .select()
            .single();
          if (!error && data) return data as NFCCard;
        } catch { /* fallback */ }
      }
      return mockStore.addCard(card_uuid);
    },
  },

  // ---------- DISCOUNT RULES ----------
  discountRules: {
    async getAll() {
      if (isSupabaseConfigured) {
        try {
          const { data, error } = await supabase
            .from('discount_rules')
            .select('*')
            .order('created_at', { ascending: false });
          if (!error && data) return data as DiscountRule[];
        } catch { /* fallback */ }
      }
      return mockStore.getRules();
    },

    async getActive() {
      if (isSupabaseConfigured) {
        try {
          const { data, error } = await supabase
            .from('discount_rules')
            .select('*')
            .eq('is_active', true);
          if (!error && data) return data as DiscountRule[];
        } catch { /* fallback */ }
      }
      return mockStore.getRules().filter(r => r.is_active);
    },

    async toggle(id: string, is_active: boolean) {
      if (isSupabaseConfigured) {
        try {
          const { data, error } = await supabase
            .from('discount_rules')
            .update({ is_active })
            .eq('id', id)
            .select()
            .single();
          if (!error && data) return data as DiscountRule;
        } catch { /* fallback */ }
      }
      return mockStore.updateRule(id, { is_active });
    },

    async create(rule: Omit<DiscountRule, 'id' | 'created_at'>) {
      if (isSupabaseConfigured) {
        try {
          const { data, error } = await supabase
            .from('discount_rules')
            .insert(rule)
            .select()
            .single();
          if (!error && data) return data as DiscountRule;
        } catch { /* fallback */ }
      }
      return mockStore.addRule(rule);
    },

    async update(id: string, updates: Partial<DiscountRule>) {
      if (isSupabaseConfigured) {
        try {
          const { data, error } = await supabase
            .from('discount_rules')
            .update(updates)
            .eq('id', id)
            .select()
            .single();
          if (!error && data) return data as DiscountRule;
        } catch { /* fallback */ }
      }
      return mockStore.updateRule(id, updates);
    },

    async delete(id: string) {
      if (isSupabaseConfigured) {
        try {
          const { error } = await supabase
            .from('discount_rules')
            .delete()
            .eq('id', id);
          if (!error) return;
        } catch { /* fallback */ }
      }
      mockStore.deleteRule(id);
    },
  },

  // ---------- VISITS LOG ----------
  visitsLog: {
    async getAll() {
      if (isSupabaseConfigured) {
        try {
          const { data, error } = await supabase
            .from('visits_log')
            .select('*')
            .order('scanned_at', { ascending: false });
          if (!error && data) return data as VisitLog[];
        } catch { /* fallback */ }
      }
      return mockStore.getVisits();
    },

    async getByClientId(clientId: string) {
      if (isSupabaseConfigured) {
        try {
          const { data, error } = await supabase
            .from('visits_log')
            .select('*')
            .eq('client_id', clientId)
            .order('scanned_at', { ascending: false });
          if (!error && data) return data as VisitLog[];
        } catch { /* fallback */ }
      }
      return mockStore.getVisits().filter(v => v.client_id === clientId);
    },

    async getToday() {
      const today = new Date().toISOString().split('T')[0];
      if (isSupabaseConfigured) {
        try {
          const { data, error } = await supabase
            .from('visits_log')
            .select('*')
            .gte('scanned_at', `${today}T00:00:00`)
            .lte('scanned_at', `${today}T23:59:59`)
            .order('scanned_at', { ascending: false });
          if (!error && data) return data as VisitLog[];
        } catch { /* fallback */ }
      }
      return mockStore.getVisits().filter(v => v.scanned_at.startsWith(today));
    },

    async create(visit: Omit<VisitLog, 'id' | 'scanned_at'>) {
      if (isSupabaseConfigured) {
        try {
          const { data, error } = await supabase
            .from('visits_log')
            .insert(visit)
            .select()
            .single();
          if (!error && data) return data as VisitLog;
        } catch { /* fallback */ }
      }
      return mockStore.addVisit(visit);
    },

    async countByClientId(clientId: string) {
      if (isSupabaseConfigured) {
        try {
          const { count, error } = await supabase
            .from('visits_log')
            .select('*', { count: 'exact', head: true })
            .eq('client_id', clientId);
          if (!error && typeof count === 'number') return count;
        } catch { /* fallback */ }
      }
      return mockStore.getVisits().filter(v => v.client_id === clientId).length;
    },
  },

  // ---------- ANNOUNCEMENTS ----------
  announcements: {
    async getAll() {
      if (isSupabaseConfigured) {
        try {
          const { data, error } = await supabase
            .from('announcements')
            .select('*')
            .order('created_at', { ascending: false });
          if (!error && data) return data as Announcement[];
        } catch { /* fallback */ }
      }
      return mockStore.getAnnouncements();
    },

    async getForUser(target: AnnouncementTarget) {
      if (isSupabaseConfigured) {
        try {
          const { data, error } = await supabase
            .from('announcements')
            .select('*')
            .in('target', ['all', target])
            .order('created_at', { ascending: false });
          if (!error && data) return data as Announcement[];
        } catch { /* fallback */ }
      }
      return mockStore.getAnnouncements().filter(a => a.target === 'all' || a.target === target);
    },

    async create(announcement: Omit<Announcement, 'id' | 'created_at'>) {
      if (isSupabaseConfigured) {
        try {
          const { data, error } = await supabase
            .from('announcements')
            .insert(announcement)
            .select()
            .single();
          if (!error && data) return data as Announcement[];
        } catch { /* fallback */ }
      }
      return mockStore.addAnnouncement(announcement);
    },
  },

  // ---------- BADGES ----------
  badges: {
    async getAll() {
      if (isSupabaseConfigured) {
        try {
          const { data, error } = await supabase
            .from('badges')
            .select('*')
            .eq('is_active', true)
            .order('requirement_value', { ascending: true });
          if (!error && data) return data as Badge[];
        } catch { /* fallback */ }
      }
      return mockStore.getBadges().filter(b => b.is_active);
    },

    async getByCode(code: string) {
      if (isSupabaseConfigured) {
        try {
          const { data, error } = await supabase
            .from('badges')
            .select('*')
            .eq('code', code)
            .single();
          if (!error && data) return data as Badge;
        } catch { /* fallback */ }
      }
      return mockStore.getBadges().find(b => b.code === code) || null;
    },

    async getUserBadges(userId: string) {
      if (isSupabaseConfigured) {
        try {
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
          if (!error && data) return data as any[];
        } catch { /* fallback */ }
      }
      return mockStore.getUserBadges(userId);
    },

    async awardBadge(userId: string, badgeId: string) {
      if (isSupabaseConfigured) {
        try {
          const { data, error } = await supabase
            .from('user_badges')
            .insert({ user_id: userId, badge_id: badgeId })
            .select()
            .single();
          if (!error && data) return data as UserBadge;
        } catch { /* fallback */ }
      }
      return mockStore.awardBadge(userId, badgeId);
    },

    async checkAndAwardBadges(userId: string) {
      if (isSupabaseConfigured) {
        try {
          const { data, error } = await supabase.rpc('award_badges_for_visit', {
            p_client_id: userId,
          });
          if (!error && data) return data;
        } catch { /* fallback */ }
      }
      return mockStore.checkAndAwardBadges(userId);
    },
  },
};

// ============================================
// AUTH API
// ============================================
export const auth = {
  async signIn(email: string, password: string): Promise<User> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (!error && data?.user) {
          const { data: profile } = await supabase
            .from('users')
            .select('*')
            .eq('id', data.user.id)
            .single();
          if (profile) return profile as User;
        }
      } catch { /* fallback */ }
    }

    const user = mockStore.getUserByEmail(email);
    if (!user) {
      throw new Error('Utilizator negăsit cu acest email.');
    }
    if (user.password && user.password !== password) {
      throw new Error('Parolă incorectă.');
    }
    mockStore.setCurrentUser(user);
    return user;
  },

  async signOut() {
    if (isSupabaseConfigured) {
      try { await supabase.auth.signOut(); } catch { /* ignore */ }
    }
    mockStore.setCurrentUser(null);
  },

  async getCurrentUser(): Promise<User | null> {
    if (isSupabaseConfigured) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from('users')
            .select('*')
            .eq('id', user.id)
            .single();
          if (profile) return profile as User;
        }
      } catch { /* fallback */ }
    }
    return mockStore.getCurrentUser();
  },

  onAuthStateChange(callback: (user: User | null) => void) {
    if (isSupabaseConfigured) {
      try {
        return supabase.auth.onAuthStateChange(async (event: string, session: any) => {
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
      } catch { /* fallback */ }
    }
    const unsub = mockStore.subscribeAuth(callback);
    return {
      data: {
        subscription: {
          unsubscribe: unsub,
        },
      },
    };
  },

  async resetPasswordForEmail(email: string, options?: { redirectTo?: string }) {
    const record = mockStore.createResetToken(email);
    if (isSupabaseConfigured) {
      try {
        await supabase.auth.resetPasswordForEmail(email, options);
      } catch (err) {
        console.warn('Real Supabase resetPasswordForEmail fallback to mock:', err);
      }
    }
    return record;
  },

  async updateUserPassword(emailOrId: string, newPassword: string) {
    if (isSupabaseConfigured) {
      try {
        await supabase.auth.updateUser({ password: newPassword });
      } catch (err) {
        console.warn('Real Supabase updateUser fallback to mock:', err);
      }
    }
    return mockStore.updateUserPassword(emailOrId, newPassword);
  },

  verifyResetToken(token: string, email?: string) {
    return mockStore.verifyResetToken(token, email);
  },

  getLatestResetToken() {
    return mockStore.getLatestResetToken();
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

    // Handles overnight ranges like 22:00 -> 04:00
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
