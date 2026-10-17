import { create } from 'zustand';
import { 
  supabase, db, auth, mockStore, isSupabaseConfigured, 
  User, NFCCard, DiscountRule, VisitLog, Announcement, Badge, UserBadge,
  generateUUID, calculateActiveDiscount 
} from './lib/supabase';

interface AppState {
  // Auth
  currentUser: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  
  // Data
  users: User[];
  nfcCards: NFCCard[];
  discountRules: DiscountRule[];
  visitsLog: VisitLog[];
  announcements: Announcement[];
  badges: Badge[];
  userBadges: UserBadge[];
  dashboardStats: {
    total_clients: number;
    active_cards: number;
    unassigned_cards: number;
    blocked_cards: number;
    total_visits: number;
    today_visits: number;
    total_revenue?: number;
    today_revenue?: number;
    total_savings_given?: number;
  } | null;

  // Auth Actions
  initialize: () => Promise<void>;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  registerClient: (name: string, phone: string, email: string, password: string) => Promise<User>;

  // Data Actions
  refreshAll: () => Promise<void>;
  refreshUsers: () => Promise<void>;
  refreshCards: () => Promise<void>;
  refreshRules: () => Promise<void>;
  refreshVisits: () => Promise<void>;
  refreshAnnouncements: () => Promise<void>;
  refreshBadges: () => Promise<void>;
  refreshUserBadges: () => Promise<void>;

  // Card Actions
  assignCard: (cardId: string, userId: string) => Promise<void>;
  blockCard: (cardId: string) => Promise<void>;
  addNFCCard: () => Promise<NFCCard>;

  // Visit Actions
  scanCard: (cardUuid: string, barmanId: string, billAmount?: number) => Promise<{
    valid: boolean;
    discount: string;
    discount_percentage: number;
    client_id?: string;
    client_name: string;
    client_phone: string;
    client_avatar: string;
    card_uuid: string;
    total_visits: number;
    rule_name: string;
    message: string;
    bill_amount?: number;
    discount_amount?: number;
    final_amount?: number;
    reason?: 'unknown_card' | 'card_blocked' | 'card_unassigned' | 'card_inactive' | 'client_missing' | 'cooldown' | 'barman_rate_limit';
  }>;

  // QR Actions (fallback iOS — Web NFC nu există pe iPhone)
  addQrCard: (qrContent: string, assignedUserId?: string | null) => Promise<NFCCard>;

  // Rule Actions
  toggleDiscountRule: (id: string) => Promise<void>;
  addDiscountRule: (rule: Omit<DiscountRule, 'id' | 'created_at'>) => Promise<void>;
  updateDiscountRule: (id: string, updates: Partial<DiscountRule>) => Promise<void>;
  deleteDiscountRule: (id: string) => Promise<void>;

  // Announcement Actions
  addAnnouncement: (title: string, message: string, eventDate: string, target: 'all' | 'vip' | 'regular') => Promise<void>;

  // Badge Actions
  checkAndAwardBadges: (userId: string) => Promise<any>;
}

export const useStore = create<AppState>((set, get) => ({
  // Initial State
  currentUser: null,
  isLoading: true,
  isAuthenticated: false,
  users: [],
  nfcCards: [],
  discountRules: [],
  visitsLog: [],
  announcements: [],
  badges: [],
  userBadges: [],
  dashboardStats: null,

  // ============================================
  // INITIALIZATION
  // ============================================
  initialize: async () => {
    try {
      set({ isLoading: true });
      
      // Check current session
      const user = await auth.getCurrentUser();
      
      if (user) {
        set({ currentUser: user, isAuthenticated: true });
        await get().refreshAll();
      }
      
      // Listen for auth changes
      auth.onAuthStateChange((user) => {
        if (user) {
          set({ currentUser: user, isAuthenticated: true });
          get().refreshAll();
        } else {
          set({ currentUser: null, isAuthenticated: false, users: [], nfcCards: [], discountRules: [], visitsLog: [], announcements: [] });
        }
      });
    } catch (error) {
      console.error('Initialization error:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  // ============================================
  // AUTH ACTIONS
  // ============================================
  login: async (email: string, password: string) => {
    try {
      set({ isLoading: true });
      const user = await auth.signIn(email, password);
      set({ currentUser: user, isAuthenticated: true });
      await get().refreshAll();
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    try {
      await auth.signOut();
      set({ 
        currentUser: null, 
        isAuthenticated: false,
        users: [],
        nfcCards: [],
        discountRules: [],
        visitsLog: [],
        announcements: [],
        dashboardStats: null
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
  },

  registerClient: async (name: string, phone: string, email: string, password: string) => {
    try {
      set({ isLoading: true });
      const user = await db.users.create({
        name,
        phone,
        email,
        role: 'client',
        avatar: '🎫',
        password
      });
      set({ currentUser: user, isAuthenticated: true });
      return user;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  // ============================================
  // DATA REFRESH
  // ============================================
  refreshAll: async () => {
    await Promise.all([
      get().refreshUsers(),
      get().refreshCards(),
      get().refreshRules(),
      get().refreshVisits(),
      get().refreshAnnouncements(),
      get().refreshBadges(),
      get().refreshUserBadges(),
    ]);
  },

  refreshUsers: async () => {
    try {
      const users = await db.users.getAll();
      set({ users });
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  },

  refreshCards: async () => {
    try {
      const nfcCards = await db.nfcCards.getAll();
      set({ nfcCards });
    } catch (error) {
      console.error('Error fetching cards:', error);
    }
  },

  refreshRules: async () => {
    try {
      const discountRules = await db.discountRules.getAll();
      set({ discountRules });
    } catch (error) {
      console.error('Error fetching rules:', error);
    }
  },

  refreshVisits: async () => {
    try {
      const visitsLog = await db.visitsLog.getAll();
      set({ visitsLog });
    } catch (error) {
      console.error('Error fetching visits:', error);
    }
  },

  refreshAnnouncements: async () => {
    try {
      const announcements = await db.announcements.getAll();
      set({ announcements });
    } catch (error) {
      console.error('Error fetching announcements:', error);
    }
  },

  refreshBadges: async () => {
    try {
      const badges = await db.badges.getAll();
      set({ badges });
    } catch (error) {
      console.error('Error fetching badges:', error);
    }
  },

  refreshUserBadges: async () => {
    try {
      const currentUser = get().currentUser;
      if (!currentUser) return;
      
      const userBadgesData = await db.badges.getUserBadges(currentUser.id);
      const userBadges = userBadgesData.map(ub => ({
        id: ub.id,
        user_id: ub.user_id,
        badge_id: ub.badge_id,
        earned_at: ub.earned_at,
        code: ub.badges?.code,
        name: ub.badges?.name,
        description: ub.badges?.description,
        emoji: ub.badges?.emoji,
        icon_color: ub.badges?.icon_color,
      }));
      set({ userBadges });
    } catch (error) {
      console.error('Error fetching user badges:', error);
    }
  },

  // ============================================
  // CARD ACTIONS
  // ============================================
  assignCard: async (cardId: string, userId: string) => {
    try {
      await db.nfcCards.assign(cardId, userId);
      await get().refreshCards();
    } catch (error) {
      console.error('Error assigning card:', error);
      throw error;
    }
  },

  blockCard: async (cardId: string) => {
    try {
      await db.nfcCards.block(cardId);
      await get().refreshCards();
    } catch (error) {
      console.error('Error blocking card:', error);
      throw error;
    }
  },

  addNFCCard: async () => {
    try {
      const card = await db.nfcCards.create(generateUUID());
      await get().refreshCards();
      return card;
    } catch (error) {
      console.error('Error creating card:', error);
      throw error;
    }
  },

  // ============================================
  // SCAN ACTION (calls PostgreSQL function)
  // ============================================
  scanCard: async (cardUuid: string, barmanId: string, billAmount?: number) => {
    try {
      const { data, error } = await supabase.rpc('scan_nfc_card', {
        p_card_uuid: cardUuid,
        p_barman_id: barmanId,
        p_bill_amount: billAmount,
      });

      if (error) throw error;

      // Refresh visits, cards, and badges after scan
      await Promise.all([
        get().refreshVisits(),
        get().refreshUserBadges(),
        get().refreshCards(),
      ]);

      return data as any;
    } catch (error) {
      console.error('Error scanning card:', error);
      // Fallback local: regulile anti-fraud & verificarea statusului cardului
      // sunt identice cu funcția SQL scan_nfc_card (SCAN_COOLDOWN_MS / BARMAN_MAX_SCANS_PER_HOUR)
      try {
        return mockStore.scanCard(cardUuid, barmanId, billAmount);
      } catch {
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
          message: 'Eroare la scanare. Verificați conexiunea.'
        };
      }
    }
  },

  // ============================================
  // QR CARD ACTION (fallback iOS — Web NFC nu există pe iPhone)
  // Cardul QR are prefix "QR:" în câmpul card_uuid; restul pipeline-ului
  // (anti-fraud, status, calcul POS server-side) este identic cu NFC.
  // ============================================
  addQrCard: async (qrContent: string, assignedUserId?: string | null) => {
    try {
      let uuid = qrContent.trim();
      // Dacă managerul scanează/tastează conținutul NDEF de pe card (ex: https://vip.merlot.ro/c/UUID), extragem UUID-ul
      const urlMatch = uuid.match(/\/c\/([^?#]+)/i);
      if (urlMatch) uuid = urlMatch[1];

      const normalized = uuid.toUpperCase();
      if (!normalized) throw new Error('Conținut QR gol.');
      if (normalized.startsWith('QR:')) throw new Error('Acest cod QR este deja înregistrat.');
      if (get().nfcCards.some(c => c.card_uuid.toUpperCase() === `QR:${normalized}`)) {
        throw new Error('AEXISTĂ deja un card QR pentru acest cod!');
      }

      const card = await db.nfcCards.create(`QR:${normalized}`, assignedUserId ?? null);
      await get().refreshCards();
      return card;
    } catch (error) {
      console.error('Error creating QR card:', error);
      throw error;
    }
  },

  // ============================================
  // RULE ACTIONS
  // ============================================
  toggleDiscountRule: async (id: string) => {
    try {
      const rule = get().discountRules.find(r => r.id === id);
      if (!rule) return;
      
      await db.discountRules.toggle(id, !rule.is_active);
      await get().refreshRules();
    } catch (error) {
      console.error('Error toggling rule:', error);
      throw error;
    }
  },

  addDiscountRule: async (rule: Omit<DiscountRule, 'id' | 'created_at'>) => {
    try {
      await db.discountRules.create(rule);
      await get().refreshRules();
    } catch (error) {
      console.error('Error creating rule:', error);
      throw error;
    }
  },

  updateDiscountRule: async (id: string, updates: Partial<DiscountRule>) => {
    try {
      await db.discountRules.update(id, updates);
      await get().refreshRules();
    } catch (error) {
      console.error('Error updating rule:', error);
      throw error;
    }
  },

  deleteDiscountRule: async (id: string) => {
    try {
      await db.discountRules.delete(id);
      await get().refreshRules();
    } catch (error) {
      console.error('Error deleting rule:', error);
      throw error;
    }
  },

  // ============================================
  // ANNOUNCEMENT ACTIONS
  // ============================================
  addAnnouncement: async (title: string, message: string, eventDate: string, target: 'all' | 'vip' | 'regular') => {
    try {
      const currentUser = get().currentUser;
      if (!currentUser) throw new Error('Not authenticated');

      await db.announcements.create({
        title,
        message,
        event_date: eventDate,
        target,
        created_by_manager_id: currentUser.id
      });

      await get().refreshAnnouncements();
    } catch (error) {
      console.error('Error creating announcement:', error);
      throw error;
    }
  },

  // ============================================
  // BADGE ACTIONS
  // ============================================
  checkAndAwardBadges: async (userId: string) => {
    try {
      const result = await db.badges.checkAndAwardBadges(userId);
      await get().refreshUserBadges();
      return result;
    } catch (error) {
      console.error('Error checking badges:', error);
      throw error;
    }
  },
}));
