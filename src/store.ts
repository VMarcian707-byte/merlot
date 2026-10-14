import { create } from 'zustand';
import { User, NFCCard, DiscountRule, VisitLog, Announcement, UserRole, ScanResult } from './types';

interface AppState {
  // Auth
  currentUser: User | null;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  registerClient: (name: string, phone: string, email: string) => User;

  // Data
  users: User[];
  nfcCards: NFCCard[];
  discountRules: DiscountRule[];
  visitsLog: VisitLog[];
  announcements: Announcement[];

  // Actions
  assignCard: (cardId: string, userId: string) => void;
  blockCard: (cardId: string) => void;
  addVisit: (cardId: string, barmanId: string) => ScanResult;
  addAnnouncement: (title: string, message: string, eventDate: string, target: 'all' | 'vip' | 'regular') => void;
  scanCard: (cardUuid: string, barmanId: string) => ScanResult;
  addNFCCard: () => NFCCard;
  toggleDiscountRule: (id: string) => void;
}

const generateId = () => Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
const generateUUID = () => {
  const chars = '0123456789ABCDEF';
  let uuid = '';
  for (let i = 0; i < 32; i++) {
    if (i === 8 || i === 12 || i === 16 || i === 20) uuid += '-';
    uuid += chars[Math.floor(Math.random() * 16)];
  }
  return uuid;
};

const initialUsers: User[] = [
  { id: 'mgr-001', name: 'Andrei Manager', phone: '+40721000001', email: 'manager@merlot.ro', role: 'manager', created_at: '2024-01-15T10:00:00Z' },
  { id: 'bar-001', name: 'Mihai Barman', phone: '+40721000002', email: 'barman@merlot.ro', role: 'barman', created_at: '2024-01-20T10:00:00Z' },
  { id: 'bar-002', name: 'Cristina Barman', phone: '+40721000003', email: 'cristina@merlot.ro', role: 'barman', created_at: '2024-02-01T10:00:00Z' },
  { id: 'cli-001', name: 'Popescu Ion', phone: '+40721111001', email: 'ion.popescu@email.com', role: 'client', avatar: '👨‍💼', created_at: '2024-02-10T10:00:00Z' },
  { id: 'cli-002', name: 'Ionescu Maria', phone: '+40721111002', email: 'maria.ionescu@email.com', role: 'client', avatar: '👩‍💼', created_at: '2024-02-15T10:00:00Z' },
  { id: 'cli-003', name: 'Georgescu Alex', phone: '+40721111003', email: 'alex.georgescu@email.com', role: 'client', avatar: '🧑‍💻', created_at: '2024-03-01T10:00:00Z' },
  { id: 'cli-004', name: 'Dumitrescu Ana', phone: '+40721111004', email: 'ana.d@email.com', role: 'client', avatar: '👩‍🎤', created_at: '2024-03-05T10:00:00Z' },
  { id: 'cli-005', name: 'Vlad Popa', phone: '+40721111005', email: 'vlad.popa@email.com', role: 'client', avatar: '🎩', created_at: '2024-03-10T10:00:00Z' },
];

const initialCards: NFCCard[] = [
  { id: 'card-001', card_uuid: 'A1B2C3D4-E5F6-7890-ABCD-EF1234567890', assigned_user_id: 'cli-001', status: 'active', issued_at: '2024-02-10T10:00:00Z' },
  { id: 'card-002', card_uuid: 'B2C3D4E5-F6A7-8901-BCDE-F12345678901', assigned_user_id: 'cli-002', status: 'active', issued_at: '2024-02-15T10:00:00Z' },
  { id: 'card-003', card_uuid: 'C3D4E5F6-A7B8-9012-CDEF-123456789012', assigned_user_id: 'cli-003', status: 'active', issued_at: '2024-03-01T10:00:00Z' },
  { id: 'card-004', card_uuid: 'D4E5F6A7-B8C9-0123-DEF0-234567890123', assigned_user_id: 'cli-004', status: 'active', issued_at: '2024-03-05T10:00:00Z' },
  { id: 'card-005', card_uuid: 'E5F6A7B8-C9D0-1234-EF01-345678901234', assigned_user_id: 'cli-005', status: 'active', issued_at: '2024-03-10T10:00:00Z' },
  { id: 'card-006', card_uuid: 'F6A7B8C9-D0E1-2345-F012-456789012345', assigned_user_id: null, status: 'unassigned', issued_at: '2024-03-15T10:00:00Z' },
  { id: 'card-007', card_uuid: 'A7B8C9D0-E1F2-3456-0123-567890123456', assigned_user_id: null, status: 'unassigned', issued_at: '2024-03-15T10:00:00Z' },
];

const initialDiscountRules: DiscountRule[] = [
  {
    id: 'rule-001',
    name: 'Happy Hour Luni-Joi',
    discount_percentage: 30,
    valid_days: [1, 2, 3, 4],
    start_time: '18:00',
    end_time: '22:00',
    is_active: true,
    description: 'Reducere 30% în intervalul Luni-Joi, 18:00-22:00'
  },
  {
    id: 'rule-002',
    name: 'VIP Weekend',
    discount_percentage: 20,
    valid_days: [5, 6],
    start_time: '22:00',
    end_time: '04:00',
    is_active: true,
    description: 'Reducere 20% în weekend după ora 22:00'
  },
  {
    id: 'rule-003',
    name: 'Early Bird',
    discount_percentage: 15,
    valid_days: [1, 2, 3, 4, 5],
    start_time: '18:00',
    end_time: '20:00',
    is_active: true,
    description: 'Reducere 15% Luni-Vineri înainte de ora 20:00'
  }
];

const initialVisits: VisitLog[] = [
  { id: 'v-001', card_id: 'card-001', client_id: 'cli-001', barman_id: 'bar-001', discount_applied: 30, scanned_at: '2024-03-18T19:30:00Z' },
  { id: 'v-002', card_id: 'card-002', client_id: 'cli-002', barman_id: 'bar-001', discount_applied: 30, scanned_at: '2024-03-18T20:15:00Z' },
  { id: 'v-003', card_id: 'card-001', client_id: 'cli-001', barman_id: 'bar-002', discount_applied: 20, scanned_at: '2024-03-22T23:00:00Z' },
  { id: 'v-004', card_id: 'card-003', client_id: 'cli-003', barman_id: 'bar-001', discount_applied: 15, scanned_at: '2024-03-19T18:45:00Z' },
  { id: 'v-005', card_id: 'card-004', client_id: 'cli-004', barman_id: 'bar-002', discount_applied: 30, scanned_at: '2024-03-20T19:00:00Z' },
  { id: 'v-006', card_id: 'card-005', client_id: 'cli-005', barman_id: 'bar-001', discount_applied: 20, scanned_at: '2024-03-23T22:30:00Z' },
  { id: 'v-007', card_id: 'card-001', client_id: 'cli-001', barman_id: 'bar-001', discount_applied: 30, scanned_at: '2024-03-25T19:15:00Z' },
  { id: 'v-008', card_id: 'card-002', client_id: 'cli-002', barman_id: 'bar-002', discount_applied: 15, scanned_at: '2024-03-26T18:30:00Z' },
];

const initialAnnouncements: Announcement[] = [
  { id: 'ann-001', title: '🎉 Party de deschidere sezon', message: 'Vineri 29 Martie vă așteptăm la petrecerea de deschidere! DJ Special guest, băuturi premium la preț redus.', event_date: '2024-03-29T22:00:00Z', created_by_manager_id: 'mgr-001', created_at: '2024-03-20T10:00:00Z', target: 'all' },
  { id: 'ann-002', title: '🍸 Cocktail Night', message: 'Joi seara: 2+1 la cocktail-uri semnate de barmanul nostru. Doar pentru membrii VIP!', event_date: '2024-03-28T20:00:00Z', created_by_manager_id: 'mgr-001', created_at: '2024-03-22T14:00:00Z', target: 'vip' },
  { id: 'ann-003', title: '🎵 Live Music Friday', message: 'Vineri avem concert live! Trupa "Noapte Albă" de la ora 23:00. Rezervări la bar.', event_date: '2024-04-05T23:00:00Z', created_by_manager_id: 'mgr-001', created_at: '2024-03-25T09:00:00Z', target: 'all' },
];

// Passwords (in production: hashed with bcrypt)
const passwords: Record<string, string> = {
  'manager@merlot.ro': 'manager123',
  'barman@merlot.ro': 'barman123',
  'cristina@merlot.ro': 'barman123',
  'ion.popescu@email.com': 'client123',
  'maria.ionescu@email.com': 'client123',
  'alex.georgescu@email.com': 'client123',
  'ana.d@email.com': 'client123',
  'vlad.popa@email.com': 'client123',
};

function getCurrentDiscount(): { rule: DiscountRule | null; applicable: boolean } {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  const applicableRules = initialDiscountRules.filter(rule => {
    if (!rule.is_active) return false;
    if (!rule.valid_days.includes(dayOfWeek)) return false;
    if (currentTime >= rule.start_time && currentTime <= rule.end_time) return true;
    // Handle overnight rules (e.g., 22:00 - 04:00)
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

export const useStore = create<AppState>((set, get) => ({
  currentUser: null,
  users: initialUsers,
  nfcCards: initialCards,
  discountRules: initialDiscountRules,
  visitsLog: initialVisits,
  announcements: initialAnnouncements,

  login: (email: string, password: string) => {
    const user = get().users.find(u => u.email === email);
    if (user && passwords[email] === password) {
      set({ currentUser: user });
      return true;
    }
    return false;
  },

  logout: () => set({ currentUser: null }),

  registerClient: (name: string, phone: string, email: string) => {
    const newUser: User = {
      id: `cli-${generateId()}`,
      name,
      phone,
      email,
      role: 'client',
      avatar: '🎫',
      created_at: new Date().toISOString(),
    };
    set(state => ({ users: [...state.users, newUser], currentUser: newUser }));
    return newUser;
  },

  assignCard: (cardId: string, userId: string) => {
    set(state => ({
      nfcCards: state.nfcCards.map(c =>
        c.id === cardId ? { ...c, assigned_user_id: userId, status: 'active' as const } : c
      )
    }));
  },

  blockCard: (cardId: string) => {
    set(state => ({
      nfcCards: state.nfcCards.map(c =>
        c.id === cardId ? { ...c, status: 'blocked' as const } : c
      )
    }));
  },

  addVisit: (cardId: string, barmanId: string) => {
    const card = get().nfcCards.find(c => c.id === cardId);
    if (!card || !card.assigned_user_id) {
      return { valid: false, discount: '0%', discount_percentage: 0, client_name: '', client_phone: '', client_avatar: '', card_uuid: '', total_visits: 0, rule_name: '', message: 'Card neasociat unui client' };
    }

    const client = get().users.find(u => u.id === card.assigned_user_id);
    const { rule, applicable } = getCurrentDiscount();
    const discountPct = applicable && rule ? rule.discount_percentage : 0;

    const visit: VisitLog = {
      id: `v-${generateId()}`,
      card_id: cardId,
      client_id: card.assigned_user_id!,
      barman_id: barmanId,
      discount_applied: discountPct,
      scanned_at: new Date().toISOString(),
    };

    set(state => ({ visitsLog: [...state.visitsLog, visit] }));

    const totalVisits = get().visitsLog.filter(v => v.client_id === card.assigned_user_id).length;

    return {
      valid: true,
      discount: applicable ? `${discountPct}%` : '0%',
      discount_percentage: discountPct,
      client_name: client?.name || 'Necunoscut',
      client_phone: client?.phone || '',
      client_avatar: client?.avatar || '🎫',
      card_uuid: card.card_uuid,
      total_visits: totalVisits,
      rule_name: applicable && rule ? rule.name : 'Fără reducere activă',
      message: applicable ? `Reducere ${discountPct}% aplicată! (${rule?.name})` : 'Vizită înregistrată (fără reducere activă în acest interval)'
    };
  },

  scanCard: (cardUuid: string, barmanId: string) => {
    const card = get().nfcCards.find(c => c.card_uuid === cardUuid);
    if (!card) {
      return { valid: false, discount: '0%', discount_percentage: 0, client_name: '', client_phone: '', client_avatar: '', card_uuid: cardUuid, total_visits: 0, rule_name: '', message: 'Card NFC necunoscut. Verificați UUID-ul.' };
    }
    if (card.status === 'blocked') {
      return { valid: false, discount: '0%', discount_percentage: 0, client_name: '', client_phone: '', client_avatar: '', card_uuid: cardUuid, total_visits: 0, rule_name: '', message: '⚠️ Card BLOCAT! Contactați managerul.' };
    }
    if (!card.assigned_user_id) {
      return { valid: false, discount: '0%', discount_percentage: 0, client_name: '', client_phone: '', client_avatar: '', card_uuid: cardUuid, total_visits: 0, rule_name: '', message: 'Card neasociat. Asociați-l unui client din panoul Admin.' };
    }

    const client = get().users.find(u => u.id === card.assigned_user_id);
    const { rule, applicable } = getCurrentDiscount();
    const discountPct = applicable && rule ? rule.discount_percentage : 0;

    const visit: VisitLog = {
      id: `v-${generateId()}`,
      card_id: card.id,
      client_id: card.assigned_user_id!,
      barman_id: barmanId,
      discount_applied: discountPct,
      scanned_at: new Date().toISOString(),
    };

    set(state => ({ visitsLog: [...state.visitsLog, visit] }));
    const totalVisits = get().visitsLog.filter(v => v.client_id === card.assigned_user_id).length;

    return {
      valid: true,
      discount: applicable ? `${discountPct}%` : '0%',
      discount_percentage: discountPct,
      client_name: client?.name || 'Necunoscut',
      client_phone: client?.phone || '',
      client_avatar: client?.avatar || '🎫',
      card_uuid: card.card_uuid,
      total_visits: totalVisits,
      rule_name: applicable && rule ? rule.name : 'Fără reducere activă',
      message: applicable ? `✅ Reducere ${discountPct}% aplicată! (${rule?.name})` : '✅ Vizită înregistrată (fără reducere activă în acest interval)'
    };
  },

  addAnnouncement: (title: string, message: string, eventDate: string, target: 'all' | 'vip' | 'regular') => {
    const newAnn: Announcement = {
      id: `ann-${generateId()}`,
      title,
      message,
      event_date: eventDate,
      created_by_manager_id: get().currentUser?.id || 'mgr-001',
      created_at: new Date().toISOString(),
      target,
    };
    set(state => ({ announcements: [newAnn, ...state.announcements] }));
  },

  addNFCCard: () => {
    const newCard: NFCCard = {
      id: `card-${generateId()}`,
      card_uuid: generateUUID(),
      assigned_user_id: null,
      status: 'unassigned',
      issued_at: new Date().toISOString(),
    };
    set(state => ({ nfcCards: [...state.nfcCards, newCard] }));
    return newCard;
  },

  toggleDiscountRule: (id: string) => {
    set(state => ({
      discountRules: state.discountRules.map(r =>
        r.id === id ? { ...r, is_active: !r.is_active } : r
      )
    }));
  },
}));
